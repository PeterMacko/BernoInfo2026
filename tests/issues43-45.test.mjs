import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {execFileSync} from 'node:child_process'
import {assertKnownCouncilIds, connectionCards, connectionDistricts, evidence, people, personRoute, turenicTeamCards, kdhSasCards} from '../scripts/issue24-shared.mjs'
import turenicTeam from '../src/turenic-team.json' with {type:'json'}

const read = file => readFileSync(file,'utf8')
const section = (html,id) => html.match(new RegExp(`<section class="detail-section(?: connections)?" aria-labelledby="${id}">[\\s\\S]*?<\\/section>`))?.[0]
const kdhSas = ['c-a7eb4e22','c-6d9a5867','c-be773c61','c-a8a3f42b','c-73b7e5fe']
const team = turenicTeam.council

test('district cards follow corrected official order and preserve one canonical route per person',()=>{
 const members=people.filter(person=>evidence[person.id].connection==='Tím Bartók')
 const html=connectionDistricts([...members].reverse(),false)
 const headings=[...html.matchAll(/<h3>Volebný obvod (\d)<\/h3>/g)].map(match=>Number(match[1]))
 assert.deepEqual(headings,[1,2,3])
 for(const district of headings){
  const ids=members.filter(person=>person.district===district).sort((a,b)=>a.listNumber-b.listNumber).map(person=>personRoute(person.id))
  const chunk=html.split(`<h3>Volebný obvod ${district}</h3>`)[1].split('</ul>')[0]
  assert.deepEqual([...chunk.matchAll(/<a href="([^"]+)"/g)].map(match=>match[1]),ids)
 }
 assert.ok(html.includes('/images/portrait-placeholder.svg'))
 assert.equal(personRoute('c-f6b4af6c'),'/kandidati/bartok/')
})


test('relationship references fail fast when an ID is absent from official roster',()=>{
 assert.throws(()=>assertKnownCouncilIds(['c-missing'],'test relationship'),/test relationship: council ID c-missing is absent from official roster/)
 assert.throws(()=>connectionDistricts([{id:'c-missing',district:1,listNumber:1,name:'Invalid'}],false),/connection cards: council ID c-missing is absent from official roster/)
 assertKnownCouncilIds(kdhSas,'KDH/SaS nomination')
 assertKnownCouncilIds(team,'Turenič team')
})

test('unrelated presentation preserves WCAG AA text contrast without fading',()=>{
 const css=read('src/style.css')
 assert.doesNotMatch(css,/\.connection-item\.is-unrelated\s*\{[^}]*opacity\s*:/)
 assert.match(css,/\.connection-item\.is-unrelated\s*\{[^}]*outline:/)
 const color=(selector,property)=>{
  const body=css.match(new RegExp(`${selector}\\s*\\{([^}]*)\\}`))?.[1]
  assert.ok(body,selector)
  const value=body.match(new RegExp(`(?:^|;)\\s*${property}\\s*:\\s*(#[0-9a-f]{6})`))?.[1]
  assert.ok(value,`${selector} ${property}`)
  return value
 }
 const luminance=hex=>{
  const channels=[1,3,5].map(start=>parseInt(hex.slice(start,start+2),16)/255).map(value=>value<=.04045?value/12.92:((value+.055)/1.055)**2.4)
  return channels[0]*.2126+channels[1]*.7152+channels[2]*.0722
 }
 const contrast=(a,b)=>{const values=[luminance(a),luminance(b)].sort((x,y)=>y-x);return (values[0]+.05)/(values[1]+.05)}
 const text=color(':root','color')
 const councilBg=color('\\.council-list \\.connection-item\\.is-unrelated a','background')
 const mayorBg=color('\\.candidate-card\\.is-unrelated','background')
 assert.ok(contrast(text,councilBg)>=4.5)
 assert.ok(contrast(text,mayorBg)>=4.5)
})

test('superseded introduction set is not rendered separately',()=>{
 assert.equal(connectionCards('c-bb232e32',false,false),'')
 assert.equal(connectionCards('c-bb232e32',false,true),'')
 assert.equal(connectionCards('c-5e9ee486',false,true),'')
})

test('all builds show distinct seven-person team and five-person nomination',()=>{
 for(const [command,review] of [['build:placeholder',false],['build:photo-review',true],['build:release',false]]){
  const origin=command==='build:release'?'https://bernoinfo2026.mr-petermacko.workers.dev':'https://issue-76-review.example.org'
  execFileSync('npm',['run',command],{stdio:'pipe',env:{...process.env,WORKERS_CI_BRANCH:'',SITE_ORIGIN:origin,RELEASE_ORIGIN_VERIFIED:'1'}})
  const turenic=read('dist/kandidati/turenic/index.html')
  const association=section(turenic,'turenic-team')
  assert.ok(association,command)
  {
   assert.match(association,/Môj tím/)
   assert.match(association,/Nejde o spoločnú oficiálnu volebnú listinu/)
   assert.deepEqual([...association.matchAll(/<h3>Volebný obvod (\d)<\/h3>/g)].map(match=>Number(match[1])),[1,2,3])
   for(const id of team) assert.ok(association.includes(`/kandidati-na-poslancov/${id}/`),id)
   for(const id of kdhSas) assert.ok(!association.includes(`/kandidati-na-poslancov/${id}/`),id)
   assert.equal(association.includes('/images/council/'),command!=='build:placeholder')
  }
  assert.equal(Boolean(section(turenic,'connections')),false,`old introduction leads: ${command}`)
  const bartok=section(read('dist/kandidati/bartok/index.html'),'connections')
  assert.ok(bartok)
  assert.match(bartok,/Volebný obvod 1/)
  assert.match(bartok,/Volebný obvod 3/)
  assert.equal(bartok.includes('/images/council/'),command!=='build:placeholder')
  const council=section(read('dist/kandidati-na-poslancov/c-9fd006a7/index.html'),'connections')
  assert.ok(council)
  assert.match(council,/Volebný obvod/)
  for (const id of team) {
   const team=section(read(`dist/kandidati-na-poslancov/${id}/index.html`),'turenic-team')
   assert.ok(team,`${command}: ${id}`)
   assert.ok(team.includes('/kandidati/turenic/'))
   assert.ok(!team.includes(`/kandidati-na-poslancov/${id}/`))
   for (const peer of turenicTeam.council.filter(peer=>peer!==id)) assert.ok(team.includes(`/kandidati-na-poslancov/${peer}/`),peer)
  }
  for (const id of kdhSas) {
   const nomination=section(read(`dist/kandidati-na-poslancov/${id}/index.html`),'kdh-sas')
   assert.ok(nomination,`${command}: ${id}`)
   assert.ok(!nomination.includes('/kandidati/turenic/'))
   for (const peer of kdhSas.filter(peer=>peer!==id)) assert.ok(nomination.includes(`/kandidati-na-poslancov/${peer}/`),peer)
  }
 }
})

test('Turenič and KDH/SaS cards retain right-column alignment and distinct sourcing',()=>{
 const css=read('public/candidate-detail.css')
 assert.match(css,/\.detail-section > \.connection-districts\{grid-column:2;/)
 const html=turenicTeamCards(team[0],false)
 assert.match(html,/www.turenic.sk\/moj-tim\//)
 assert.match(html,/Tím Turenič/)
 assert.doesNotMatch(html,/KDH SaS/)
 const other=kdhSasCards(kdhSas[0],false)
 assert.match(other,/KDH SaS – spoločná nominácia/)
 assert.ok(!other.includes('/kandidati/turenic/'))
 const source=read('src/connections.ts')
 assert.match(source,/controlLabel: 'KDH SaS'/)
 assert.match(source,/controlLabel: 'Tím Turenič'/)
})

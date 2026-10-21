import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {execFileSync} from 'node:child_process'
import {connectionCards, connectionDistricts, evidence, people, personRoute} from '../scripts/issue24-shared.mjs'

const read = file => readFileSync(file,'utf8')
const section = (html,id) => html.match(new RegExp(`<section class="detail-section(?: connections)?" aria-labelledby="${id}">[\\s\\S]*?<\\/section>`))?.[0]
const reported = ['c-a7eb4e22','c-6d9a5867','c-be773c61','c-a8a3f42b','c-73b7e5fe']

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

test('unverified campaign-introduction connections remain review-only',()=>{
 assert.equal(connectionCards('c-bb232e32',false,false),'')
 const review=connectionCards('c-bb232e32',false,true)
 assert.match(review,/Možné prepojenia na overenie/)
 assert.match(review,/nie overeným predstavením ani členstvom v tíme/)
 assert.doesNotMatch(review,/src="\/images\/council\//)
})

test('all builds retain qualified five-person report and gate source portraits consistently',()=>{
 for(const [command,review] of [['build:placeholder',false],['build:photo-review',true],['build:release',false]]){
  execFileSync('npm',['run',command],{stdio:'pipe',env:{...process.env,WORKERS_CI_BRANCH:'',SITE_ORIGIN:'https://release.example.org',RELEASE_ORIGIN_VERIFIED:'1'}})
  const turenic=read('dist/kandidati/turenic/index.html')
  const association=section(turenic,'reported-association')
  assert.ok(association,command)
  {
   assert.match(association,/nebolo nezávisle doložené/)
   assert.match(association,/prepojenie neoverené/)
   assert.deepEqual([...association.matchAll(/<h3>Volebný obvod (\d)<\/h3>/g)].map(match=>Number(match[1])),[1,2,3])
   for(const id of reported) assert.ok(association.includes(`/kandidati-na-poslancov/${id}/`),id)
   assert.equal(association.includes('/images/council/'),command!=='build:placeholder')
  }
  assert.equal(Boolean(section(turenic,'connections')),review,`four introduction leads: ${command}`)
  const bartok=section(read('dist/kandidati/bartok/index.html'),'connections')
  assert.ok(bartok)
  assert.match(bartok,/Volebný obvod 1/)
  assert.match(bartok,/Volebný obvod 3/)
  assert.equal(bartok.includes('/images/council/'),command!=='build:placeholder')
  const council=section(read('dist/kandidati-na-poslancov/c-9fd006a7/index.html'),'connections')
  assert.ok(council)
  assert.match(council,/Volebný obvod/)
 }
})

import test from 'node:test'
import assert from 'node:assert/strict'
import {execFileSync} from 'node:child_process'
import {readFileSync} from 'node:fs'
import {alternateLinkKeys, alternateLinkLabel} from '../scripts/issue27-link-labels.mjs'

const mayor = JSON.parse(readFileSync('src/candidate-details.json')).candidates
const districts = JSON.parse(readFileSync('src/council-candidates.json')).districts
const evidence = JSON.parse(readFileSync('src/issue24-evidence.json'))
const alternates = JSON.parse(readFileSync('src/council-entity-links.json')).urls
const dual = {'c-f6b4af6c':'bartok','c-a4b1db7c':'cirbus','c-307ca828':'kostial','c-bb232e32':'turenic'}
const rows = districts.flatMap(d=>d.candidates.map(c=>({...c,key:`D${d.number}/${c.listNumber}`})))
const path = c => `dist/${dual[c.id] ? `kandidati/${dual[c.id]}` : `kandidati-na-poslancov/${c.id}`}/index.html`
const page = c => readFileSync(path(c),'utf8')
const run = script => execFileSync('npm',['run',script],{stdio:'pipe',env:{...process.env,WORKERS_CI_BRANCH:'',SITE_ORIGIN:script==='build:release'?'https://bernoinfo2026.mr-petermacko.workers.dev':'https://issue-76-review.example.org',RELEASE_ORIGIN_VERIFIED:'1'}})
const removed = /Čo je doložené — a čo zostáva otvorené|Ako čítať tento profil|Facebookový odkaz priradený Petrom|Peter priradil tento odkaz/

function checkCommon() {
 const home = readFileSync('dist/index.html','utf8')
 assert.doesNotMatch(home,removed)
 assert.match(home,/44 zaregistrovaných kandidátov/)
 assert.match(home,/Prehľad facebookových zdrojov za 16. júl/)
 for(const c of mayor) {
  const html=readFileSync(`dist/kandidati/${c.id}/index.html`,'utf8')
  assert.doesNotMatch(html,removed,c.id)
  assert.match(html,/Zdroje, pokrytie a opravy/,c.id)
  assert.match(html,/Prehľad facebookových zdrojov za 16. júl/,c.id)
 }
 for(const c of rows) {
  const html=page(c)
  assert.doesNotMatch(html,removed,c.key)
  assert.ok(html.includes(c.name),c.key)
 }
}

test('issue 27 labels and gates hold across placeholder, photo-review and release',()=>{
 assert.equal(rows.length,44)
 assert.equal(alternateLinkKeys.length,21)
 assert.deepEqual(new Set(alternateLinkKeys),new Set(Object.keys(alternates)))
 for(const mode of ['build:placeholder','build:photo-review','build:release']) {
  run(mode)
  checkCommon()
  const review=mode==='build:photo-review'
  for(const c of rows) {
   const html=page(c)
   const item=evidence[c.id]
   const reviewOnly=['probable/unverified profile','historical page (2018)','mention only'].includes(item.link.kind)
   if(item.link.url && !dual[c.id])assert.equal(html.includes(`href="${item.link.url}"`),review||!reviewOnly,`${mode} primary ${c.key}`)
   const alt=alternates[c.key]
   if(alt && alt!==item.link.url && !dual[c.id]) {
    assert.equal(html.includes(`href="${alt}"`),review,`${mode} alternate ${c.key}`)
    const alternateAnchor=new RegExp(`<a href="${alt.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}"[^>]*>${alternateLinkLabel(c.key)}</a>`)
    assert.equal(alternateAnchor.test(html),review,`${mode} alternate label ${c.key}`)
    if(review) {
     assert.ok(html.includes(alternateLinkLabel(c.key)),c.key)
     assert.ok(html.includes('Zhoda osoby a vlastníctvo účtu nie sú nezávisle overené.'),c.key)
    }
   }
  }
 }
})

import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync,existsSync} from 'node:fs'
const data=JSON.parse(readFileSync('src/council-candidates.json'))
const evidence=JSON.parse(readFileSync('src/issue24-evidence.json'))
const entityLinks=JSON.parse(readFileSync('src/council-entity-links.json'))
const photos=JSON.parse(readFileSync('src/issue24-photo-availability.json'))
const home=readFileSync('index.html','utf8')
const mayor=JSON.parse(readFileSync('src/candidate-details.json')).candidates
const dual={'c-f6b4af6c':'bartok','c-a4b1db7c':'cirbus','c-307ca828':'kostial','c-bb232e32':'turenic'}
const rows=data.districts.flatMap(d=>d.candidates.map(c=>({...c,district:d})))
const route=id=>dual[id]?`/kandidati/${dual[id]}/`:`/kandidati-na-poslancov/${id}/`

test('official rosters and 44-row source map reconcile',()=>{
 assert.deepEqual(data.districts.map(d=>[d.number,d.seats,d.candidates.length]),[[1,5,15],[2,5,19],[3,3,10]])
 assert.equal(rows.length,44);assert.equal(new Set(rows.map(c=>c.id)).size,44)
 assert.equal(Object.keys(evidence).length,44)
 assert.equal(mayor.length,8)
 for(const c of rows){
  assert.equal(evidence[c.id].key,`D${c.district.number}/${c.listNumber}`)
  assert.ok(c.district.sourceUrl.startsWith('https://www.bernolakovo.sk/'))
 }
})

test('48 canonical person pages, four redirects, both office lists',()=>{
 assert.equal(new Set([...mayor.map(c=>`/kandidati/${c.id}/`),...rows.map(c=>route(c.id))]).size,48)
 for(const c of rows){
  const path=route(c.id)
  assert.ok(home.includes(`href="${path}"`),`missing no-JS link ${path}`)
  const page=readFileSync(`public${path}index.html`,'utf8')
  assert.ok(page.includes(c.district.sourceUrl),`missing official source ${path}`)
  assert.ok(page.includes(c.name.split(' ')[0]),`missing person ${path}`)
  if(dual[c.id]){
   assert.match(page,/Kandidatúra na poslanca obecného zastupiteľstva/)
   assert.match(page,/Registrácia na starostu obce/)
   const old=readFileSync(`public/kandidati-na-poslancov/${c.id}/index.html`,'utf8')
   assert.ok(old.includes(`url=${path}`))
  }
 }
 for(const c of mayor)assert.ok(existsSync(`public/kandidati/${c.id}/index.html`))
 assert.equal(readFileSync('public/_redirects','utf8').trim().split('\n').length,4)
 assert.ok(existsSync('public/404.html'))
})

test('link taxonomy does not upgrade unverified leads to candidate accounts',()=>{
 for(const c of rows){
  const item=evidence[c.id]
  const page=readFileSync(`public${route(c.id)}index.html`,'utf8')
  const kind=item.link.kind
  if(['probable/unverified profile','mention only','historical page (2018)'].includes(kind)){
   assert.ok(!page.includes(`href="${item.link.url}"`),`${item.key} review-only source leaked`)
  }
  const peterUrl=entityLinks.urls[item.key]
  if(peterUrl)assert.ok(page.includes(`href="${peterUrl.replaceAll('&','&amp;')}"`),`${item.key} Peter-identified link missing`)
  if(kind==='shared campaign page')assert.ok(page.includes('Spoločná stránka kampane')||page.includes('Doložené prepojenia'))
  if(kind==='post/appearance'&&!dual[c.id])assert.ok(page.includes('Príspevok o kandidátovi'))
  if(item.photo.url && !dual[c.id])assert.ok(page.includes('Obrazový zdroj'))
 }
 assert.equal(photos.length,36)
 for(const id of photos)assert.ok(existsSync(`preview-assets/council/${id}.jpg`))
})

test('sourced connections use internal person links and equal cards',()=>{
 for(const c of rows.filter(c=>['Tím Bartók','ZA BERnolákovo','Turenič – predstavenie v kampani'].includes(evidence[c.id].connection))){
  const page=readFileSync(`public${route(c.id)}index.html`,'utf8')
  assert.ok(page.includes(evidence[c.id].connection==='Turenič – predstavenie v kampani'?'Možné prepojenia na overenie':'Doložené prepojenia'),evidence[c.id].key)
  assert.ok(page.includes('connection-card'),evidence[c.id].key)
 }
})

import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync,existsSync,readdirSync} from 'node:fs'
import {execFileSync} from 'node:child_process'
const roster=JSON.parse(readFileSync('src/council-candidates.json'))
const available=JSON.parse(readFileSync('src/issue24-photo-availability.json'))
const none=['c-724674d8','c-0bc5d04e','c-311f2be6','c-5b5322d7','c-5b003a58']

test('review preview includes source photos while placeholder build keeps them out',()=>{
 execFileSync('npm',['run','build'],{stdio:'pipe'})
 assert.equal(readdirSync('dist/images/candidates').length,8)
 assert.equal(readdirSync('dist/images/council').length,available.length)
 for(const id of available){
  const person=roster.districts.flatMap(d=>d.candidates).find(c=>c.id===id)
  const dual={'c-f6b4af6c':'bartok','c-a4b1db7c':'cirbus','c-307ca828':'kostial','c-bb232e32':'turenic'}[id]
  const path=dual?`dist/kandidati/${dual}/index.html`:`dist/kandidati-na-poslancov/${id}/index.html`
  const page=readFileSync(path,'utf8')
  assert.ok(page.includes(person.name.split(' ')[0]))
  assert.ok(existsSync(`dist/images/council/${id}.jpg`))
 }
 for(const id of none){
  const page=readFileSync(`dist/kandidati-na-poslancov/${id}/index.html`,'utf8')
  assert.ok(page.includes('/images/portrait-placeholder.svg'),id)
 }
 execFileSync('npm',['run','build:placeholder'],{stdio:'pipe'})
 assert.ok(!existsSync('dist/images/council'))
 assert.ok(!existsSync('dist/images/candidates'))
 for(const id of none)assert.ok(readFileSync(`dist/kandidati-na-poslancov/${id}/index.html`,'utf8').includes('/images/portrait-placeholder.svg'))
})

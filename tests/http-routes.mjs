// Integration check for the built static site. Run after npm run build:placeholder.
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { createServer } from 'node:net'
import { readFileSync } from 'node:fs'

const council = JSON.parse(readFileSync('src/council-candidates.json','utf8')).districts.flatMap(d=>d.candidates)
const mayors = JSON.parse(readFileSync('src/candidate-details.json','utf8')).candidates
const dual = {'c-f6b4af6c':'bartok','c-a4b1db7c':'cirbus','c-307ca828':'kostial','c-bb232e32':'turenic'}
const canonicalRoutes = [...mayors.map(c=>`/kandidati/${c.id}/`),...council.filter(c=>!dual[c.id]).map(c=>`/kandidati-na-poslancov/${c.id}/`)]
const id = council[0].id
async function freePort() {
  const server = createServer()
  await new Promise(resolve => server.listen(0,'127.0.0.1',resolve))
  const port = server.address().port
  await new Promise(resolve => server.close(resolve))
  return port
}
async function waitReady(port, child) {
  for (let i=0; i<100; i++) {
    if (child.exitCode !== null) throw Error(`Server exited early: ${child.exitCode}`)
    try { const r=await fetch(`http://127.0.0.1:${port}/`); if (r.ok) return } catch {}
    await new Promise(resolve => setTimeout(resolve,200))
  }
  throw Error(`Server on ${port} did not become ready`)
}
async function check(label, command, args, customBody) {
  const port = await freePort()
  const child = spawn(process.execPath,[command,...args,String(port)],{stdio:'ignore'})
  try {
    await waitReady(port,child)
    for (const [path,expected] of [['/',200],[`/kandidati-na-poslancov/${id}/`,200],['/kandidati-na-poslancov/unknown/',404],['/missing/',404]]) {
      const response = await fetch(`http://127.0.0.1:${port}${path}`,{redirect:'manual'})
      assert.equal(response.status,expected,`${label}: ${path}`)
      const body = await response.text()
      if (expected===404 && customBody) assert.ok(body.includes('Stránka sa nenašla'),`${label}: custom 404 body`)
      if (path.includes(id)) assert.ok(body.includes('Oficiálne uvedená príslušnosť'),`${label}: candidate page`)
    }
    for (const path of canonicalRoutes) {
      const response = await fetch(`http://127.0.0.1:${port}${path}`,{redirect:'manual'})
      assert.equal(response.status,200,`${label}: ${path}`)
    }
    if (customBody) for (const [old,id] of Object.entries(dual)) {
      const response = await fetch(`http://127.0.0.1:${port}/kandidati-na-poslancov/${old}/`,{redirect:'manual'})
      assert.equal(response.status,301,`${label}: legacy ${old}`)
      assert.equal(response.headers.get('location'),`/kandidati/${id}/`)
    }
    console.log(`${label}: 48 canonical routes 200; invalid routes 404${customBody ? '; four legacy routes 301' : ''}`)
  } finally {
    child.kill('SIGTERM')
  }
}
await check('Vite preview','node_modules/vite/bin/vite.js',['preview','--host','127.0.0.1','--strictPort','--port'],false)
await check('Wrangler local','node_modules/wrangler/bin/wrangler.js',['dev','--local','--port'],true)

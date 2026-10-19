// Integration check for the built static site. Run after npm run build:placeholder.
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { createServer } from 'node:net'
import { readFileSync } from 'node:fs'

const id = JSON.parse(readFileSync('src/council-candidates.json','utf8')).districts[0].candidates[0].id
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
    console.log(`${label}: valid routes 200; invalid routes 404${customBody ? ' with custom page' : ''}`)
  } finally {
    child.kill('SIGTERM')
  }
}
await check('Vite preview','node_modules/vite/bin/vite.js',['preview','--host','127.0.0.1','--strictPort','--port'],false)
await check('Wrangler local','node_modules/wrangler/bin/wrangler.js',['dev','--local','--port'],true)

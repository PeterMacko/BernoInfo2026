// Optional browser regression check: run after npm run build:placeholder.
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { once } from 'node:events'
import { existsSync, mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import net from 'node:net'

const chromeBin = process.env.CHROME_BIN || ['/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'].find(existsSync)
if (!chromeBin) throw new Error('Set CHROME_BIN to Chromium/Chrome for this optional browser check')
const freePort = () => new Promise(resolve => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const port = s.address().port; s.close(() => resolve(port)) }) })
const pause = ms => new Promise(resolve => setTimeout(resolve, ms))
const sitePort = await freePort()
const debugPort = await freePort()
const origin = `http://127.0.0.1:${sitePort}`
const profile = mkdtempSync(join(tmpdir(), 'berno29-navigation-'))
const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', 'preview', '--host', '127.0.0.1', '--port', String(sitePort), '--strictPort'], { stdio: 'ignore' })
const chrome = spawn(chromeBin, ['--headless=new', '--no-sandbox', '--disable-gpu', `--remote-debugging-port=${debugPort}`, `--user-data-dir=${profile}`, 'about:blank'], { stdio: 'ignore' })

async function ready(url) {
  for (let i=0; i<50; i++) {
    try { const response = await fetch(url); if (response.ok) return }
    catch { /* startup */ }
    await pause(100)
  }
  throw new Error(`Timed out waiting for ${url}`)
}
async function openPage(url, disableScripts=false) {
  const response = await fetch(`http://127.0.0.1:${debugPort}/json/new?about:blank`, { method: 'PUT' })
  const info = await response.json()
  const ws = new WebSocket(info.webSocketDebuggerUrl)
  await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject })
  let serial = 0
  const pending = new Map()
  ws.onmessage = event => { const message = JSON.parse(event.data); if (pending.has(message.id)) { pending.get(message.id)(message); pending.delete(message.id) } }
  const command = (method, params={}) => new Promise(resolve => { const id = ++serial; pending.set(id, resolve); ws.send(JSON.stringify({ id, method, params })) })
  await command('Emulation.setDeviceMetricsOverride', { width: 320, height: 800, deviceScaleFactor: 1, mobile: false })
  if (disableScripts) await command('Emulation.setScriptExecutionDisabled', { value: true })
  await command('Page.navigate', { url })
  const evaluate = async expression => {
    const response = await command('Runtime.evaluate', { expression, returnByValue: true })
    if (response.result?.exceptionDetails) throw new Error(JSON.stringify(response.result.exceptionDetails))
    return response.result.result.value
  }
  return { command, evaluate, close: () => ws.close() }
}
const state = `({ hash: location.hash, scrollY, top: document.getElementById('district-2')?.getBoundingClientRect().top, focused: document.activeElement?.id })`
async function assertAtDistrict(page, expectFocus) {
  await pause(800)
  const result = await page.evaluate(state)
  assert.equal(result.hash, '#district-2')
  assert.ok(result.scrollY > 0, JSON.stringify(result))
  assert.ok(result.top >= -5 && result.top < 800, JSON.stringify(result))
  if (expectFocus) assert.equal(result.focused, 'district-2')
  return result
}
try {
  await ready(origin)
  await ready(`http://127.0.0.1:${debugPort}/json/version`)
  const direct = await openPage(`${origin}/#district-2`)
  console.log('direct fragment:', await assertAtDistrict(direct, true))
  await direct.command('Page.reload')
  console.log('reload:', await assertAtDistrict(direct, true))
  direct.close()
  const directory = await openPage(`${origin}/volby/ulice/`)
  await pause(300)
  await directory.evaluate(`document.querySelector('a[href="/#district-2"]').click()`)
  console.log('directory link:', await assertAtDistrict(directory, true))
  directory.close()
  const noJs = await openPage(`${origin}/#district-2`, true)
  await pause(800)
  const noJsState = await noJs.evaluate(state)
  assert.equal(noJsState.hash, '#district-2')
  assert.equal(await noJs.evaluate(`document.getElementById('district-2')?.textContent`), 'Volebný obvod 2')
  console.log('no-JS anchor preserved:', noJsState)
  noJs.close()
} finally {
  chrome.kill()
  server.kill()
  if (chrome.exitCode === null) await Promise.race([once(chrome, 'exit'), pause(3000)])
  rmSync(profile, { recursive: true, force: true, maxRetries: 20, retryDelay: 100 })
}

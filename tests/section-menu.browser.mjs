// Browser regression check: run after npm run build:placeholder.
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { existsSync, mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import net from 'node:net'

const chromeBin = process.env.CHROME_BIN || ['/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'].find(existsSync)
if (!chromeBin) throw new Error('Chrome/Chromium required for section-menu browser check')
const freePort = () => new Promise(resolve => { const server = net.createServer(); server.listen(0, '127.0.0.1', () => { const port = server.address().port; server.close(() => resolve(port)) }) })
const pause = ms => new Promise(resolve => setTimeout(resolve, ms))
const sitePort = await freePort()
const debugPort = await freePort()
const origin = `http://127.0.0.1:${sitePort}`
const profile = mkdtempSync(join(tmpdir(), 'berno-menu-'))
const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', 'preview', '--host', '127.0.0.1', '--port', String(sitePort), '--strictPort'], { stdio: 'ignore' })
const chrome = spawn(chromeBin, ['--headless=new', '--no-sandbox', '--disable-gpu', `--remote-debugging-port=${debugPort}`, `--user-data-dir=${profile}`, 'about:blank'], { stdio: 'ignore' })
async function ready(url) {
  for (let i = 0; i < 80; i++) {
    try { if ((await fetch(url)).ok) return } catch { /* startup */ }
    await pause(100)
  }
  throw new Error(`Timed out waiting for ${url}`)
}
let ws
try {
  await ready(origin)
  await ready(`http://127.0.0.1:${debugPort}/json/version`)
  const tab = await (await fetch(`http://127.0.0.1:${debugPort}/json/new?about:blank`, { method: 'PUT' })).json()
  ws = new WebSocket(tab.webSocketDebuggerUrl)
  await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject })
  let serial = 0
  const pending = new Map()
  ws.onmessage = event => { const message = JSON.parse(event.data); if (pending.has(message.id)) { pending.get(message.id)(message); pending.delete(message.id) } }
  const command = (method, params = {}) => new Promise(resolve => { const id = ++serial; pending.set(id, resolve); ws.send(JSON.stringify({ id, method, params })) })
  const evaluate = async expression => {
    const response = await command('Runtime.evaluate', { expression, returnByValue: true })
    if (response.result?.exceptionDetails) throw new Error(JSON.stringify(response.result.exceptionDetails))
    return response.result.result.value
  }
  for (const { width, height, mobile } of [{ width: 1280, height: 900, mobile: false }, { width: 390, height: 844, mobile: true }]) {
    await command('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile })
    await command('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] })
    for (const id of ['candidates-title', 'district-1', 'district-2', 'district-3']) {
      await command('Page.navigate', { url: origin })
      for (let i = 0; i < 50 && !(await evaluate(`Boolean(document.querySelector('.section-menu a[href="#${id}"]'))`)); i++) await pause(100)
      await evaluate(`document.querySelector('.section-menu a[href="#${id}"]').click()`)
      let state
      for (let i = 0; i < 50; i++) {
        state = await evaluate(`(() => { const heading = document.getElementById('${id}'); const link = document.querySelector('.section-menu a[href="#${id}"]'); return { hash: location.hash, active: link.getAttribute('aria-current'), top: heading.getBoundingClientRect().top, offset: parseFloat(getComputedStyle(heading).scrollMarginTop), mastheadBottom: document.querySelector('.masthead').getBoundingClientRect().bottom, focused: document.activeElement?.id } })()`)
        if (state.hash === `#${id}` && state.active === 'location') break
        await pause(100)
      }
      assert.equal(state.hash, `#${id}`, `${width}px ${id}: hash`)
      assert.equal(state.active, 'location', `${width}px ${id}: ${JSON.stringify(state)}`)
      assert.equal(state.focused, id, `${width}px ${id}: focus`)
      assert.ok(state.top > state.mastheadBottom, `${width}px ${id}: heading obscured ${JSON.stringify(state)}`)
      assert.ok(state.top <= state.offset + 1, `${width}px ${id}: offset ${JSON.stringify(state)}`)
      console.log(`${width}px ${id}: active at ${state.top.toFixed(1)}px (offset ${state.offset}px)`)
    }
  }
} finally {
  ws?.close()
  server.kill()
  chrome.kill()
  rmSync(profile, { recursive: true, force: true, maxRetries: 20, retryDelay: 100 })
}

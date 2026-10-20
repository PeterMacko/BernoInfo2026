import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { once } from 'node:events'
import { existsSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import net from 'node:net'

const chromeBin = process.env.CHROME_BIN || ['/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'].find(existsSync)
if (!chromeBin) throw new Error('Chrome/Chromium required')
const freePort = () => new Promise(resolve => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const port = s.address().port; s.close(() => resolve(port)) }) })
const pause = ms => new Promise(resolve => setTimeout(resolve, ms))
const sitePort = await freePort()
const debugPort = await freePort()
const origin = process.env.BASE_URL || `http://127.0.0.1:${sitePort}`
const profile = mkdtempSync(join(tmpdir(), 'berno31-picker-'))
const server = process.env.BASE_URL ? null : spawn(process.execPath, ['node_modules/vite/bin/vite.js', 'preview', '--host', '127.0.0.1', '--port', String(sitePort), '--strictPort'], { stdio: 'ignore' })
const chrome = spawn(chromeBin, ['--headless=new', '--no-sandbox', '--disable-gpu', `--remote-debugging-port=${debugPort}`, `--user-data-dir=${profile}`, 'about:blank'], { stdio: 'ignore' })
async function ready(url) {
  for (let i = 0; i < 80; i++) {
    try { const response = await fetch(url); if (response.ok) return }
    catch { /* startup */ }
    await pause(100)
  }
  throw new Error(`Timed out waiting for ${url}`)
}
async function openPage(width, height) {
  const response = await fetch(`http://127.0.0.1:${debugPort}/json/new?about:blank`, { method: 'PUT' })
  const info = await response.json()
  const ws = new WebSocket(info.webSocketDebuggerUrl)
  await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject })
  let serial = 0
  const pending = new Map()
  ws.onmessage = event => { const message = JSON.parse(event.data); if (pending.has(message.id)) { pending.get(message.id)(message); pending.delete(message.id) } }
  const command = (method, params = {}) => new Promise(resolve => { const id = ++serial; pending.set(id, resolve); ws.send(JSON.stringify({ id, method, params })) })
  await command('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: true })
  await command('Page.navigate', { url: origin })
  const evaluate = async expression => {
    const response = await command('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })
    if (response.result?.exceptionDetails) throw new Error(JSON.stringify(response.result.exceptionDetails))
    return response.result.result.value
  }
  for (let i = 0; i < 40; i++) {
    if (await evaluate(`Boolean(document.querySelector('#street-name'))`)) break
    await pause(100)
  }
  await pause(300)
  return { command, evaluate, close: () => ws.close() }
}
const key = (page, key, code = key, windowsVirtualKeyCode = key === 'ArrowDown' ? 40 : key === 'ArrowUp' ? 38 : key === 'Enter' ? 13 : key === 'Escape' ? 27 : 0) => page.command('Input.dispatchKeyEvent', { type: 'keyDown', key, code, windowsVirtualKeyCode })
const state = `(() => { const input = document.querySelector('#street-name'); const menu = document.querySelector('.street-suggestions'); const a = input.getBoundingClientRect(); const b = menu?.getBoundingClientRect(); return {value: input.value, expanded: input.getAttribute('aria-expanded'), active: input.getAttribute('aria-activedescendant'), options: document.querySelectorAll('[role="option"]').length, noMatch: Boolean(document.querySelector('.street-no-match')), menuTop: b?.top, inputBottom: a.bottom, menuHeight: b?.height, menuScrollHeight: menu?.scrollHeight, menuClientHeight: menu?.clientHeight, menuRight: b?.right, viewport: document.documentElement.clientWidth, overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth, result: document.querySelector('.street-result')?.textContent?.trim() } })()`
async function type(page, value) {
  await page.evaluate(`(() => { const input = document.querySelector('#street-name'); input.focus(); input.select() })()`)
  await page.command('Input.insertText', { text: value })
  await pause(100)
}
try {
  await ready(origin)
  await ready(`http://127.0.0.1:${debugPort}/json/version`)
  for (const [width, height] of [[1440, 900], [390, 720], [320, 640], [320, 430]]) {
    const page = await openPage(width, height)
    await type(page, 'a')
    let current = await page.evaluate(state)
    assert.equal(current.expanded, 'true')
    assert.ok(current.options > 10, JSON.stringify(current))
    assert.ok(current.menuTop >= current.inputBottom && current.menuTop - current.inputBottom < 8, JSON.stringify(current))
    assert.ok(current.menuHeight <= Math.min(245, height * .35 + 5), JSON.stringify(current))
    assert.ok(current.menuScrollHeight > current.menuClientHeight, JSON.stringify(current))
    assert.ok(current.menuRight <= current.viewport + 1 && !current.overflow, JSON.stringify(current))
    await page.evaluate(`document.querySelector('#street-name').scrollIntoView({ block: 'center' })`)
    await pause(100)
    await page.command('Page.captureScreenshot', { format: 'png' }).then(r => { if (process.env.SCREENSHOT_DIR) writeFileSync(`${process.env.SCREENSHOT_DIR}/street-picker-${width}.png`, Buffer.from(r.result.data, 'base64')) })
    await key(page, 'ArrowUp')
    assert.equal((await page.evaluate(state)).active, `street-option-${current.options - 1}`)
    assert.ok(await page.evaluate(`document.querySelector('.street-suggestions').scrollTop > 0`))
    await type(page, 'hlav')
    current = await page.evaluate(state)
    assert.equal(current.options, 1, JSON.stringify(current))
    await key(page, 'ArrowDown')
    assert.equal((await page.evaluate(state)).active, 'street-option-0')
    await key(page, 'Enter')
    current = await page.evaluate(state)
    assert.equal(current.value, 'Hlavná')
    assert.equal(current.expanded, 'false')
    await page.evaluate(`document.querySelector('.street-control button').click()`)
    assert.match((await page.evaluate(state)).result, /Volebný obvod 2 · okrsok 5/)
    await type(page, 'nonsense-street')
    current = await page.evaluate(state)
    assert.equal(current.options, 0)
    assert.equal(current.noMatch, true)
    await key(page, 'Escape')
    assert.equal((await page.evaluate(state)).expanded, 'false')
    await page.evaluate(`document.querySelector('.street-control button').click()`)
    assert.doesNotMatch((await page.evaluate(state)).result, /Volebný obvod [123] · okrsok/)
    await type(page, 'zahradkarska')
    assert.ok((await page.evaluate(state)).options >= 1)
    current = await page.evaluate(state)
    assert.ok(current.menuRight <= current.viewport + 1 && !current.overflow, JSON.stringify(current))
    await page.evaluate(`document.querySelector('[role="option"]').click()`)
    assert.equal((await page.evaluate(state)).value, 'Záhradkárska oblasť (pri Trnavskej)')
    assert.equal((await page.evaluate(state)).expanded, 'false')
    console.log(`${width}px picker geometry and keyboard/mouse/no-match cases: passed`)
    page.close()
  }
} finally {
  chrome.kill()
  server?.kill()
  if (chrome.exitCode === null) await Promise.race([once(chrome, 'exit'), pause(3000)])
  rmSync(profile, { recursive: true, force: true, maxRetries: 20, retryDelay: 100 })
}

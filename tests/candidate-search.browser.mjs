import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { once } from 'node:events'
import { existsSync, mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import net from 'node:net'

const chromeBin = process.env.CHROME_BIN || ['/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'].find(existsSync)
if (!chromeBin) throw new Error('Chrome/Chromium required')
const port = () => new Promise(resolve => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => resolve(p)) }) })
const pause = ms => new Promise(resolve => setTimeout(resolve, ms))
const sitePort = await port(), debugPort = await port()
const origin = `http://127.0.0.1:${sitePort}`
const profile = mkdtempSync(join(tmpdir(), 'berno32-search-'))
const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', 'preview', '--host', '127.0.0.1', '--port', String(sitePort), '--strictPort'], { stdio: 'ignore' })
const chrome = spawn(chromeBin, ['--headless=new', '--no-sandbox', '--disable-gpu', `--remote-debugging-port=${debugPort}`, `--user-data-dir=${profile}`, 'about:blank'], { stdio: 'ignore' })
async function ready(url) { for (let i = 0; i < 80; i++) { try { if ((await fetch(url)).ok) return } catch {} await pause(100) } throw Error(`Timeout: ${url}`) }
async function openPage(width) {
  const info = await (await fetch(`http://127.0.0.1:${debugPort}/json/new?about:blank`, { method: 'PUT' })).json()
  const ws = new WebSocket(info.webSocketDebuggerUrl)
  await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject })
  let serial = 0
  const pending = new Map()
  ws.onmessage = event => { const message = JSON.parse(event.data); if (pending.has(message.id)) { pending.get(message.id)(message); pending.delete(message.id) } }
  const command = (method, params = {}) => new Promise(resolve => { const id = ++serial; pending.set(id, resolve); ws.send(JSON.stringify({ id, method, params })) })
  await command('Emulation.setDeviceMetricsOverride', { width, height: 720, deviceScaleFactor: 1, mobile: true })
  await command('Page.navigate', { url: origin })
  const evaluate = async expression => { const response = await command('Runtime.evaluate', { expression, returnByValue: true }); if (response.result?.exceptionDetails) throw Error(JSON.stringify(response.result.exceptionDetails)); return response.result.result.value }
  for (let i = 0; i < 40; i++) { if (await evaluate(`Boolean(document.querySelector('#candidate-name'))`)) break; await pause(100) }
  return { command, evaluate, close: () => ws.close() }
}
const state = `(() => { const input = document.querySelector('#candidate-name'); return { url: location.pathname, value: input?.value, expanded: input?.getAttribute('aria-expanded'), active: input?.getAttribute('aria-activedescendant'), options: document.querySelectorAll('.candidate-search-option').length, status: document.querySelector('#candidate-search-status')?.textContent, error: document.querySelector('#candidate-search-error')?.textContent, street: Boolean(document.querySelector('#street-name')), overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth } })()`
async function type(page, value) { await page.evaluate(`(() => { const input = document.querySelector('#candidate-name'); input.focus(); input.select() })()`); await page.command('Input.insertText', { text: value }); await pause(100) }
async function key(page, value, code) { await page.command('Input.dispatchKeyEvent', { type: 'keyDown', key: value, code: value, windowsVirtualKeyCode: code }) }
try {
  await ready(origin); await ready(`http://127.0.0.1:${debugPort}/json/version`)
  for (const width of [1440, 390, 320]) {
    const page = await openPage(width)
    await type(page, 'peter')
    let s = await page.evaluate(state)
    assert.equal(s.expanded, 'true'); assert.ok(s.options > 1); assert.ok(s.street); assert.equal(s.overflow, false)
    await page.evaluate(`document.querySelector('.candidate-search-control button').click()`)
    s = await page.evaluate(state)
    assert.equal(s.url, '/'); assert.match(s.error, /viacerým/)
    await type(page, 'nobody')
    await page.evaluate(`document.querySelector('.candidate-search-control button').click()`)
    s = await page.evaluate(state)
    assert.equal(s.url, '/'); assert.match(s.error, /nenašli/)
    await type(page, 'Michal Bartok')
    assert.equal((await page.evaluate(state)).options, 1)
    await key(page, 'ArrowDown', 40)
    assert.equal((await page.evaluate(state)).active, 'candidate-option-0')
    await key(page, 'Escape', 27)
    assert.equal((await page.evaluate(state)).expanded, 'false')
    await page.evaluate(`document.querySelector('.candidate-search-control button').click()`)
    for (let i = 0; i < 40; i++) { if ((await page.evaluate('location.pathname')) === '/kandidati/bartok/') break; await pause(100) }
    assert.equal(await page.evaluate('location.pathname'), '/kandidati/bartok/')
    page.close()
  }
  const keyboardPage = await openPage(390)
  await type(keyboardPage, 'bart')
  await key(keyboardPage, 'ArrowDown', 40)
  assert.equal((await keyboardPage.evaluate(state)).active, 'candidate-option-0')
  await key(keyboardPage, 'Enter', 13)
  for (let i = 0; i < 40; i++) { if ((await keyboardPage.evaluate('location.pathname')) === '/kandidati/bartok/') break; await pause(100) }
  assert.equal(await keyboardPage.evaluate('location.pathname'), '/kandidati/bartok/')
  keyboardPage.close()
  const touchPage = await openPage(390)
  await type(touchPage, 'a')
  await touchPage.evaluate(`document.querySelector('.candidate-search-option').scrollIntoView({ block: 'center', behavior: 'instant' })`)
  let point = await touchPage.evaluate(`(() => { const r = document.querySelector('.candidate-search-option').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 } })()` )
  await touchPage.command('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [point] })
  await touchPage.command('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: point.x, y: point.y - 40 }] })
  await touchPage.command('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  await pause(500)
  assert.equal(await touchPage.evaluate('location.pathname'), '/', 'scroll gesture must not navigate')
  await type(touchPage, 'brunel')
  await touchPage.evaluate(`document.querySelector('.candidate-search-option').scrollIntoView({ block: 'center', behavior: 'instant' })`)
  await pause(300)
  point = await touchPage.evaluate(`(() => { const r = document.querySelector('.candidate-search-option').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 } })()` )
  assert.equal(await touchPage.evaluate(`document.elementFromPoint(${point.x}, ${point.y})?.closest('.candidate-search-option') !== null`), true)
  await touchPage.command('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [point] })
  await touchPage.command('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  for (let i = 0; i < 40; i++) { if ((await touchPage.evaluate('location.pathname')) === '/kandidati-na-poslancov/c-baf5b906/') break; await pause(100) }
  assert.equal(await touchPage.evaluate('location.pathname'), '/kandidati-na-poslancov/c-baf5b906/')
  touchPage.close()
  const mousePage = await openPage(1440)
  await type(mousePage, 'brunel')
  await mousePage.evaluate(`document.querySelector('.candidate-search-option').scrollIntoView({ block: 'center', behavior: 'instant' })`)
  const mousePoint = await mousePage.evaluate(`(() => { const r = document.querySelector('.candidate-search-option').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 } })()` )
  assert.equal(await mousePage.evaluate(`document.elementFromPoint(${mousePoint.x}, ${mousePoint.y})?.closest('.candidate-search-option') !== null`), true)
  await mousePage.command('Input.dispatchMouseEvent', { type: 'mousePressed', x: mousePoint.x, y: mousePoint.y, button: 'left', clickCount: 1 })
  await mousePage.command('Input.dispatchMouseEvent', { type: 'mouseReleased', x: mousePoint.x, y: mousePoint.y, button: 'left', clickCount: 1 })
  for (let i = 0; i < 40; i++) { if ((await mousePage.evaluate('location.pathname')) === '/kandidati-na-poslancov/c-baf5b906/') break; await pause(100) }
  assert.equal(await mousePage.evaluate('location.pathname'), '/kandidati-na-poslancov/c-baf5b906/')
  mousePage.close()
  console.log('Candidate search browser navigation, states, keyboard, mouse, touch tap/scroll, street coexistence and mobile widths: passed')
} finally {
  chrome.kill(); server.kill()
  if (chrome.exitCode === null) await Promise.race([once(chrome, 'exit'), pause(3000)])
  rmSync(profile, { recursive: true, force: true, maxRetries: 20, retryDelay: 100 })
}

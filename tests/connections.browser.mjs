import assert from 'node:assert/strict'
import {spawn} from 'node:child_process'
import {existsSync,mkdtempSync,rmSync} from 'node:fs'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import net from 'node:net'
const chromeBin=process.env.CHROME_BIN||['/usr/bin/google-chrome','/usr/bin/chromium','/usr/bin/chromium-browser'].find(existsSync)
if(!chromeBin) throw Error('Chrome/Chromium required')
const port=()=>new Promise(resolve=>{const s=net.createServer();s.listen(0,'127.0.0.1',()=>{const p=s.address().port;s.close(()=>resolve(p))})})
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms))
const sitePort=await port(), debugPort=await port(), profile=mkdtempSync(join(tmpdir(),'berno-connections-'))
const server=spawn(process.execPath,['node_modules/vite/bin/vite.js','preview','--host','127.0.0.1','--port',String(sitePort),'--strictPort'],{stdio:'ignore'})
const chrome=spawn(chromeBin,['--headless=new','--no-sandbox','--disable-gpu',`--remote-debugging-port=${debugPort}`,`--user-data-dir=${profile}`,'about:blank'],{stdio:'ignore'})
async function ready(url){for(let i=0;i<80;i++){try{if((await fetch(url)).ok)return}catch{}await pause(100)}throw Error(`Timeout: ${url}`)}
let ws
try{
 await ready(`http://127.0.0.1:${sitePort}/`)
 await ready(`http://127.0.0.1:${debugPort}/json/version`)
 const tab=await(await fetch(`http://127.0.0.1:${debugPort}/json/new?about:blank`,{method:'PUT'})).json()
 ws=new WebSocket(tab.webSocketDebuggerUrl)
 await new Promise((resolve,reject)=>{ws.onopen=resolve;ws.onerror=reject})
 let serial=0;const pending=new Map()
 ws.onmessage=event=>{const message=JSON.parse(event.data);if(pending.has(message.id)){pending.get(message.id)(message);pending.delete(message.id)}}
 const command=(method,params={})=>new Promise(resolve=>{const id=++serial;pending.set(id,resolve);ws.send(JSON.stringify({id,method,params}))})
 const evaluate=async expression=>{const response=await command('Runtime.evaluate',{expression,returnByValue:true});if(response.result?.exceptionDetails)throw Error(JSON.stringify(response.result.exceptionDetails));return response.result.result.value}
 await command('Emulation.setDeviceMetricsOverride',{width:375,height:800,deviceScaleFactor:1,mobile:true})
 await command('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]})
 await command('Page.navigate',{url:`http://127.0.0.1:${sitePort}/`})
 for(let i=0;i<40;i++){if(await evaluate(`Boolean(document.querySelector('.connection-toggle'))`))break;await pause(100)}
 const initial=await evaluate(`(() => ({mayors:document.querySelectorAll('.candidate-card').length,council:document.querySelectorAll('.council-list li').length,overflow:document.documentElement.scrollWidth>innerWidth,buttons:document.querySelectorAll('.connection-toggle').length,review:document.querySelector('.preview-notice')!==null}))()`)
 assert.deepEqual([initial.mayors,initial.council,initial.overflow],[8,44,false])
 const click=async expression=>{await evaluate(`(() => {${expression}})()`);await pause(100);return evaluate(`document.querySelector('.connection-status').textContent`)}
 let status=await click(`document.querySelector('.candidate-card .connection-toggle').click()`)
 assert.match(status,/Tím Bartók/)
 const selected=await evaluate(`(() => ({mayor:document.querySelectorAll('.candidate-card.is-selected').length,council:document.querySelectorAll('.council-list .is-selected').length,related:document.querySelectorAll('.council-list .is-related').length,pressed:document.querySelectorAll('.connection-toggle[aria-pressed="true"]').length,link:document.querySelector('.candidate-card.is-selected a').getAttribute('href')}))()`)
 assert.deepEqual([selected.mayor,selected.council,selected.related,selected.pressed],[1,1,9,2])
 assert.equal(selected.link,'/kandidati/bartok/')
 const activeStyle=await evaluate(`(() => ({shadow:getComputedStyle(document.querySelector('.candidate-card.is-selected')).boxShadow,related:getComputedStyle(document.querySelector('.council-list .is-related')).boxShadow,icon:!!document.querySelector('.candidate-card.is-selected .connection-toggle svg[aria-hidden="true"]')}))()`)
 assert.match(activeStyle.shadow,/rgb\(8, 103, 216\)/)
 assert.notEqual(activeStyle.shadow,activeStyle.related)
 assert.equal(activeStyle.icon,true)
 assert.match(await evaluate(`getComputedStyle(document.querySelector('.council-list .is-selected a')).boxShadow`),/rgb\(8, 103, 216\)/)
 const arrowOffsets=await evaluate(`[...document.querySelectorAll('.council-list li')].map(row=>Math.round(row.getBoundingClientRect().right-row.querySelector('.council-arrow').getBoundingClientRect().right))`)
 assert.ok(Math.max(...arrowOffsets)-Math.min(...arrowOffsets)<=1,'profile arrows use one terminal alignment')
 status=await click(`document.querySelector('.council-list .is-selected .connection-toggle').click()`)
 assert.match(status,/žiadne prepojenie/)
 status=await click(`document.querySelector('.council-list .connection-toggle').click()`)
 assert.match(status,/Tím Bartók/)
 status=await click(`document.querySelector('.candidate-card .connection-toggle').click()`)
 assert.match(status,/Tím Bartók/)
 status=await click(`document.querySelector('.candidate-card .connection-toggle').click()`)
 assert.match(status,/žiadne prepojenie/)
 const turenicButtons=await evaluate(`[...document.querySelectorAll('.candidate-card:last-child .connection-toggle')].map(button=>button.getAttribute('aria-label'))`)
 assert.equal(turenicButtons.length,initial.review?2:1)
 assert.match(turenicButtons.at(-1),/Peter 21. októbra 2026 potvrdil/)
 if(initial.review) assert.match(turenicButtons[0],/Neoverený pracovný súpis/)
 const turenicVisible=await evaluate(`[...document.querySelectorAll('.candidate-card:last-child .connection-toggle span')].map(item=>item.textContent)`)
 assert.equal(turenicVisible.at(-1),'KDH SaS')
 if(initial.review) assert.match(turenicVisible[0],/Tur súpis · neoverené/)
 if(initial.review) assert.notEqual(turenicVisible[0],turenicVisible[1])
 const turenicButton = index => `document.querySelectorAll('.candidate-card:last-child .connection-toggle')[${index}]`
 if(initial.review){
  status=await click(`${turenicButton(0)}.click()`)
  assert.match(status,/pracovný súpis/)
  assert.equal(await evaluate(`document.querySelectorAll('.council-list .is-related').length`),4)
  assert.equal(await evaluate(`document.querySelector('a[href="/kandidati-na-poslancov/c-a7eb4e22/"]').closest('li').classList.contains('is-unrelated')`),true)
  status=await click(`${turenicButton(1)}.click()`)
  assert.match(status,/Peter 21. októbra 2026 potvrdil/)
  assert.equal(await evaluate(`document.querySelectorAll('.council-list .is-related').length`),5)
  assert.equal(await evaluate(`document.querySelector('a[href="/kandidati-na-poslancov/c-5e9ee486/"]').closest('li').classList.contains('is-unrelated')`),true)
 }else{
  status=await click(`${turenicButton(0)}.click()`)
  assert.match(status,/Peter 21. októbra 2026 potvrdil/)
  assert.equal(await evaluate(`document.querySelectorAll('.council-list .is-related').length`),5)
 }
 await click(`${turenicButton(initial.review?1:0)}.click()`)
 if(initial.review){
  const introButton=`document.querySelector('a[href="/kandidati-na-poslancov/c-5e9ee486/"]').closest('li').querySelector('.connection-toggle')`
  const reportButton=`document.querySelector('a[href="/kandidati-na-poslancov/c-a7eb4e22/"]').closest('li').querySelector('.connection-toggle')`
  status=await click(`${introButton}.click()`)
  assert.match(status,/pracovný súpis/)
  assert.equal(await evaluate(`document.querySelector('a[href="/kandidati-na-poslancov/c-a7eb4e22/"]').closest('li').classList.contains('is-unrelated')`),true)
  status=await click(`${reportButton}.click()`)
  assert.match(status,/Peter 21. októbra 2026 potvrdil/)
  assert.equal(await evaluate(`document.querySelector('a[href="/kandidati-na-poslancov/c-5e9ee486/"]').closest('li').classList.contains('is-unrelated')`),true)
  await click(`${reportButton}.click()`)
 }
 await evaluate(`document.querySelector('.candidate-card .connection-toggle').focus()`)
 await command('Input.dispatchKeyEvent',{type:'keyDown',key:' ',code:'Space',windowsVirtualKeyCode:32,nativeVirtualKeyCode:32})
 await command('Input.dispatchKeyEvent',{type:'keyUp',key:' ',code:'Space',windowsVirtualKeyCode:32,nativeVirtualKeyCode:32})
 await pause(100)
 assert.match(await evaluate(`document.querySelector('.connection-status').textContent`),/Tím Bartók/)
 assert.equal(await evaluate(`document.activeElement.classList.contains('connection-toggle')`),true)
 await command('Page.navigate',{url:`http://127.0.0.1:${sitePort}/kandidati/turenic/`})
 for(let i=0;i<40;i++){if(await evaluate(`Boolean(document.querySelector('[aria-labelledby="reported-association"] .connection-districts'))`))break;await pause(100)}
 const profileMobile=await evaluate(`(() => ({overflow:document.documentElement.scrollWidth>innerWidth,columns:getComputedStyle(document.querySelector('[aria-labelledby="reported-association"] .connection-districts')).gridTemplateColumns,districts:document.querySelectorAll('[aria-labelledby="reported-association"] .connection-district').length}))()`)
 assert.equal(profileMobile.overflow,false)
 assert.equal(profileMobile.districts,3)
 assert.equal(profileMobile.columns.split(' ').length,1)
 await command('Emulation.setDeviceMetricsOverride',{width:1280,height:900,deviceScaleFactor:1,mobile:false})
 const profileDesktop=await evaluate(`(() => {const region=document.querySelector('[aria-labelledby="reported-association"] .connection-districts');const section=region.closest('section');const cols=[...region.children].map(item=>item.getBoundingClientRect());const text=section.querySelector('p').getBoundingClientRect();return {overflow:document.documentElement.scrollWidth>innerWidth,columns:getComputedStyle(region).gridTemplateColumns.split(' ').length,aligned:Math.abs(region.getBoundingClientRect().left-text.left)<2,equal:Math.max(...cols.map(c=>c.width))-Math.min(...cols.map(c=>c.width))<2,belowHeading:region.getBoundingClientRect().top>section.querySelector('h2').getBoundingClientRect().bottom}})()`)
 assert.deepEqual(profileDesktop,{overflow:false,columns:3,aligned:true,equal:true,belowHeading:true})
 console.log(`Connection browser checks passed (${initial.review?'photo-review':'release'}; mobile, reduced motion, buttons, dual office, links)`)
}finally{ws?.close();server.kill();chrome.kill();rmSync(profile,{recursive:true,force:true,maxRetries:20,retryDelay:100})}

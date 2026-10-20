import {readFileSync} from 'node:fs'
const roster = JSON.parse(readFileSync(new URL('../src/council-candidates.json', import.meta.url)))
const mayorPortraits = JSON.parse(readFileSync(new URL('../src/portrait-review.json', import.meta.url)))
export const evidence = JSON.parse(readFileSync(new URL('../src/issue24-evidence.json', import.meta.url)))
export const dualRoutes = {'c-f6b4af6c':'bartok','c-a4b1db7c':'cirbus','c-307ca828':'kostial','c-bb232e32':'turenic'}
export const people = roster.districts.flatMap(d=>d.candidates.map(c=>({...c,district:d.number,officialUrl:d.sourceUrl})))
export const personRoute = id => dualRoutes[id] ? `/kandidati/${dualRoutes[id]}/` : `/kandidati-na-poslancov/${id}/`
export const esc = value => String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))
const groups = [
 {name:'Tím Bartók',source:'https://michalbartok.sk/kandidati',kind:'explicit_team_membership',description:'Kandidátsky web predstavuje tento tím.'},
 {name:'ZA BERnolákovo',source:'https://www.facebook.com/zabernolakovo/',kind:'explicit_team_membership',description:'Spoločná kampaň predstavuje tieto osoby; nejde o individuálne účty.'},
 {name:'Turenič – predstavenie v kampani',source:'https://www.facebook.com/100063832401156/',kind:'presented_by',description:'Pracovná kompilácia pripisuje tieto predstavenia stránke kampane Miroslava Tureniča. Konkrétne pomenované príspevky a dátumy zatiaľ neboli zachytené; členstvo v tíme nie je potvrdené.'},
]
const availablePhotos = new Set(JSON.parse(readFileSync(new URL('../src/issue24-photo-availability.json', import.meta.url))))
export function photoFor(id, review) {
 if (dualRoutes[id] && !availablePhotos.has(id)) {
   if (!review) return null
   const p=mayorPortraits[dualRoutes[id]]
   return {src:p.src,url:p.sourceUrl,year:'2026',kind:'Zdrojová fotografia z kandidátskej kampane'}
 }
 if (!availablePhotos.has(id)) return null
 if (!review) return null
 const item=evidence[id]?.photo
 if (!item?.url || item.kind==='none confirmed') return null
 if (item.kind==='post photo') return {src:`/images/council/${id}.jpg`,url:item.url,year:'dátum nezistený',kind:'Fotografia v príspevku tretej strany'}
 if (item.url.endsWith('.jpg')) return {src:`/images/council/${id}.jpg`,url:item.url,year:'2026',kind:'Fotografia z kandidátskeho webu'}
 if (item.kind==='current PDF') return {src:`/images/council/${id}.jpg`,url:item.url,year:'2026',kind:'Fotografia v obecnom časopise'}
 if (item.kind==='archival PDF') return {src:`/images/council/${id}.jpg`,url:item.url,year:item.url.includes('2018')?'2018':'2022',kind:'Archívna fotografia v obecnom časopise'}
 return null
}
export function connectionCards(id,review) {
 const group=groups.find(g=>evidence[id]?.connection===g.name || (id==='c-bb232e32' && g.name==='Turenič – predstavenie v kampani'))
 if (!group) return ''
 const members=people.filter(p=>p.id!==id && evidence[p.id]?.connection===group.name)
 if (group.name==='Turenič – predstavenie v kampani' && id!=='c-bb232e32') members.unshift(people.find(p=>p.id==='c-bb232e32'))
 const cards=members.map(p=>{
   const photo=photoFor(p.id,review)
   return `<li class="connection-card"><a href="${personRoute(p.id)}"><img src="${photo?.src||'/images/portrait-placeholder.svg'}" alt="" width="80" height="95" loading="lazy"><span>${esc(p.name)}<small>Profil kandidáta${dualRoutes[p.id]?' na starostu aj poslanca':''}</small></span></a></li>`
 }).join('')
 return `<section class="detail-section connections" aria-labelledby="connections"><h2 id="connections">Doložené prepojenia</h2><p>${esc(group.description)} Typ: ${group.kind==='presented_by'?'predstavenie v kampani':'výslovné predstavenie tímu'}. ${`<a href="${esc(group.source)}">Zdroj predstavenia</a>`} · pôvodný dátum nezistený · skontrolované 20. októbra 2026. ${group.name==='ZA BERnolákovo'?'Mená sú osobitne uvedené v zelených reklamách časopisu Bernolák 2/2026. ':''}Spoločná oficiálna nominácia sama osebe toto prepojenie nedokazuje.</p><ul class="connection-grid">${cards}</ul></section>`
}

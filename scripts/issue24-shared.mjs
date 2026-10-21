import {readFileSync} from 'node:fs'
const roster = JSON.parse(readFileSync(new URL('../src/council-candidates.json', import.meta.url)))
const mayorPortraits = JSON.parse(readFileSync(new URL('../src/portrait-review.json', import.meta.url)))
export const evidence = JSON.parse(readFileSync(new URL('../src/issue24-evidence.json', import.meta.url)))
export const dualRoutes = {'c-f6b4af6c':'bartok','c-a4b1db7c':'cirbus','c-307ca828':'kostial','c-bb232e32':'turenic'}
export const people = roster.districts.flatMap(d=>d.candidates.map(c=>({...c,district:d.number,officialUrl:d.sourceUrl})))
const rosterIds = new Set(people.map(person=>person.id))
export function assertKnownCouncilIds(ids,context='relationship') {
 for (const id of ids) if (!rosterIds.has(id)) throw new Error(`${context}: council ID ${id} is absent from official roster`)
}
assertKnownCouncilIds(Object.keys(evidence),'issue24 evidence')
assertKnownCouncilIds(Object.keys(dualRoutes),'dual-office routes')
for (const person of people) if (!evidence[person.id]) throw new Error(`issue24 evidence: missing official roster ID ${person.id}`)

export const personRoute = id => dualRoutes[id] ? `/kandidati/${dualRoutes[id]}/` : `/kandidati-na-poslancov/${id}/`
export const esc = value => String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))
const groups = [
 {name:'Tím Bartók',source:'https://michalbartok.sk/kandidati',kind:'explicit_team_membership',description:'Kandidátsky web predstavuje tento tím.'},
 {name:'ZA BERnolákovo',source:'https://www.facebook.com/zabernolakovo/',kind:'explicit_team_membership',description:'Spoločná kampaň predstavuje tieto osoby; nejde o individuálne účty.'},
 {name:'Turenič – predstavenie v kampani',source:'https://www.facebook.com/100063832401156/',kind:'presented_by',description:'Pracovná kompilácia pripisuje tieto predstavenia stránke kampane Miroslava Tureniča. Konkrétne pomenované príspevky a dátumy zatiaľ neboli zachytené; členstvo v tíme nie je potvrdené.'},
]
const availablePhotos = new Set(JSON.parse(readFileSync(new URL('../src/issue24-photo-availability.json', import.meta.url))))
export function photoFor(id, withPhotos) {
 if (dualRoutes[id] && !availablePhotos.has(id)) {
   if (!withPhotos) return null
   const p=mayorPortraits[dualRoutes[id]]
   return {src:p.src,url:p.sourceUrl,year:'2026',kind:'Zdrojová fotografia z kandidátskej kampane'}
 }
 if (!availablePhotos.has(id)) return null
 if (!withPhotos) return null
 const item=evidence[id]?.photo
 if (!item?.url || item.kind==='none confirmed') return null
 if (item.kind==='post photo') return {src:`/images/council/${id}.jpg`,url:item.url,year:'dátum nezistený',kind:'Fotografia v príspevku tretej strany'}
 if (item.url.endsWith('.jpg')) return {src:`/images/council/${id}.jpg`,url:item.url,year:'2026',kind:'Fotografia z kandidátskeho webu'}
 if (item.kind==='current PDF') return {src:`/images/council/${id}.jpg`,url:item.url,year:'2026',kind:'Fotografia v obecnom časopise'}
 if (item.kind==='archival PDF') return {src:`/images/council/${id}.jpg`,url:item.url,year:item.url.includes('2018')?'2018':'2022',kind:'Archívna fotografia v obecnom časopise'}
 return null
}
export function connectionCards(id,withPhotos,review = false) {
 const group=groups.find(g=>evidence[id]?.connection===g.name || (id==='c-bb232e32' && g.name==='Turenič – predstavenie v kampani'))
 if (!group) return ''
 if (group.kind === 'presented_by' && !review) return ''
 const members=people.filter(p=>p.id!==id && evidence[p.id]?.connection===group.name)
 if (group.name==='Turenič – predstavenie v kampani' && id!=='c-bb232e32') members.unshift(people.find(p=>p.id==='c-bb232e32'))
 const cards=`<div class="connection-districts">${connectionDistricts(members,withPhotos)}</div>`
 const uncertain = group.kind === 'presented_by'
 const source = group.name === 'ZA BERnolákovo'
   ? `<a href="https://www.bernolakovo.sk/data/page/bernolakovo.sk/23117/bernolak_2_2026_web.pdf#page=21">Bernolák 2/2026, strana PDF 21</a>; <a href="https://www.bernolakovo.sk/data/page/bernolakovo.sk/23117/bernolak_2_2026_web.pdf#page=22">22</a>; <a href="https://www.bernolakovo.sk/data/page/bernolakovo.sk/23117/bernolak_2_2026_web.pdf#page=23">23</a>; <a href="https://www.bernolakovo.sk/data/page/bernolakovo.sk/23117/bernolak_2_2026_web.pdf#page=24">24</a> (individuálne pomenované zelené reklamy)`
   : uncertain ? `pracovný súpis priložený Petrom 20. októbra 2026; <a href="${esc(group.source)}">kampaňová stránka</a> sama o sebe nedokladá konkrétne predstavenia`
   : `<a href="${esc(group.source)}">Zdroj predstavenia</a>`
 return `<section class="detail-section connections" aria-labelledby="connections"><h2 id="connections">${uncertain?'Možné prepojenia na overenie':'Doložené prepojenia'}</h2><p>${esc(group.description)} ${uncertain?'Tieto väzby sú iba podnetom z pracovného súpisu, nie overeným predstavením ani členstvom v tíme.':'Typ: výslovné predstavenie tímu.'} Zdroj: ${source} · pôvodný dátum nezistený · skontrolované 20. októbra 2026. Spoločná oficiálna nominácia sama osebe toto prepojenie nedokazuje.</p>${cards}</section>`
}

export function connectionDistricts(members,withPhotos) {
 assertKnownCouncilIds(members.map(person=>person.id),'connection cards')
 return [1,2,3].map(number=>{
   const rows=members.filter(p=>p.district===number).sort((a,b)=>a.listNumber-b.listNumber)
   if (!rows.length) return ''
   const cards=rows.map(p=>{
     const photo=photoFor(p.id,withPhotos)
     return `<li class="connection-card"><a href="${personRoute(p.id)}"><img src="${photo?.src||'/images/portrait-placeholder.svg'}" alt="" width="80" height="95" loading="lazy"><span>${esc(p.name)}<small>Profil kandidáta${dualRoutes[p.id]?' na starostu aj poslanca':''}</small></span></a></li>`
   }).join('')
   return `<div class="connection-district"><h3>Volebný obvod ${number}</h3><ul class="connection-grid">${cards}</ul></div>`
 }).join('')
}

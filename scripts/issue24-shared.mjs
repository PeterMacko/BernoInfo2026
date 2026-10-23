import {readFileSync} from 'node:fs'
const roster = JSON.parse(readFileSync(new URL('../src/council-candidates.json', import.meta.url)))
const mayorPortraits = JSON.parse(readFileSync(new URL('../src/portrait-review.json', import.meta.url)))
const turenicTeam = JSON.parse(readFileSync(new URL('../src/turenic-team.json', import.meta.url)))
export const evidence = JSON.parse(readFileSync(new URL('../src/issue24-evidence.json', import.meta.url)))
export const dualRoutes = {'c-f6b4af6c':'bartok','c-a4b1db7c':'cirbus','c-307ca828':'kostial','c-bb232e32':'turenic'}
export const people = roster.districts.flatMap(d=>d.candidates.map(c=>({...c,district:d.number,officialUrl:d.sourceUrl})))
export const turenicTeamIds = turenicTeam.council
export const kdhSasIds = ['c-a7eb4e22','c-6d9a5867','c-be773c61','c-a8a3f42b','c-73b7e5fe']
const rosterIds = new Set(people.map(person=>person.id))
export function assertKnownCouncilIds(ids,context='relationship') {
 for (const id of ids) if (!rosterIds.has(id)) throw new Error(`${context}: council ID ${id} is absent from official roster`)
}
assertKnownCouncilIds(Object.keys(evidence),'issue24 evidence')
assertKnownCouncilIds(turenicTeamIds,'Turenič team')
assertKnownCouncilIds(kdhSasIds,'KDH/SaS nomination')
assertKnownCouncilIds(Object.keys(dualRoutes),'dual-office routes')
for (const person of people) if (!evidence[person.id]) throw new Error(`issue24 evidence: missing official roster ID ${person.id}`)

export const personRoute = id => dualRoutes[id] ? `/kandidati/${dualRoutes[id]}/` : `/kandidati-na-poslancov/${id}/`
export const esc = value => String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))
const groups = [
 {name:'Tím Bartók',source:'https://michalbartok.sk/kandidati',kind:'explicit_team_membership',description:'Kandidátsky web predstavuje tento tím.'},
 {name:'ZA BERnolákovo',source:'https://www.facebook.com/zabernolakovo/',kind:'campaign_branding',description:'Päť individuálne pomenovaných reklám nesie spoločné označenie kampane ZA BERnolákovo; spoločná stránka kampane nie je osobný účet.'},
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
 if (item.kind==='campaign-site processed portrait') return {src:`/images/council/${id}.jpg`,url:item.url,year:'dátum záberu nezistený',kind:'Portrét z kandidátskeho webu; zdrojový súbor označený ChatGPT-Image, rozsah úprav nezistený'}
 if (item.kind==='owner-supplied Facebook image') return {src:`/images/council/${id}.jpg`,url:item.url,year:'dátum záberu nezistený',kind:'Obrázok dodaný Petrom; konkrétna stránka fotografie a autor nezistení'}
 if (item.kind==='post photo') return {src:`/images/council/${id}.jpg`,url:item.url,year:'dátum nezistený',kind:'Fotografia v príspevku tretej strany'}
 if (item.url.endsWith('.jpg')) return {src:`/images/council/${id}.jpg`,url:item.url,year:'2026',kind:'Fotografia z kandidátskeho webu'}
 if (item.kind==='current PDF') return {src:`/images/council/${id}.jpg`,url:item.url,year:'2026',kind:'Fotografia v obecnom časopise'}
 if (item.kind==='archival PDF') return {src:`/images/council/${id}.jpg`,url:item.url,year:item.url.includes('2018')?'2018':'2022',kind:'Archívna fotografia v obecnom časopise'}
 return null
}
export function connectionCards(id,withPhotos,review = false,externalNewTab = false) {
 const group=groups.find(g=>evidence[id]?.connection===g.name)
 if (!group) return ''
 const members=people.filter(p=>p.id!==id && evidence[p.id]?.connection===group.name)
 const cards=`<div class="connection-districts">${connectionDistricts(members,withPhotos)}</div>`
 const relationLabel = group.kind === 'campaign_branding' ? 'Typ: spoločné označenie kampane; členstvo v tíme ani úplnosť zoznamu nie sú potvrdené.' : 'Typ: výslovné predstavenie tímu.'
 const externalAttributes = externalNewTab ? ' target="_blank" rel="noopener noreferrer"' : ''
 const source = group.name === 'ZA BERnolákovo'
   ? [21,22,23,24].map(page => `<a href="https://www.bernolakovo.sk/data/page/bernolakovo.sk/23117/bernolak_2_2026_web.pdf#page=${page}"${externalAttributes}>${page === 21 ? 'Bernolák 2/2026, strana PDF 21' : page}</a>`).join('; ') + ' (individuálne pomenované zelené reklamy)'
   : `<a href="${esc(group.source)}"${externalAttributes}>Zdroj predstavenia</a>`
 return `<section class="detail-section connections" aria-labelledby="connections"><h2 id="connections">Doložené prepojenia</h2><p>${esc(group.description)} ${relationLabel} Zdroj: ${source} · pôvodný dátum nezistený · skontrolované 20. októbra 2026. Spoločná oficiálna nominácia sama osebe toto prepojenie nedokazuje.</p>${cards}</section>`
}

export function turenicTeamCards(id,withPhotos) {
 if (!turenicTeamIds.includes(id)) return ''
 const members=people.filter(person=>person.id!==id && (turenicTeamIds.includes(person.id) || person.id===turenicTeam.mayor))
 return `<section class="detail-section connections" aria-labelledby="turenic-team"><h2 id="turenic-team">Tím Turenič</h2><p>Kandidátsky web Miroslava Tureniča predstavuje týchto sedem kandidátov v sekcii Môj tím. Nejde o spoločnú oficiálnu volebnú listinu; mená a poradie sú porovnané s opravenými zoznamami obce. Na tejto stránke sú odkazy na ostatných členov vrátane Miroslava Tureniča.</p><div class="connection-districts">${connectionDistricts(members,withPhotos)}</div><small class="source">Zdroj tímu: <a href="${esc(turenicTeam.source)}" target="_blank" rel="noopener noreferrer">Miroslav Turenič — Môj tím</a> · pozorované ${esc(turenicTeam.observed)} · mená, obvody a poradie: opravené úradné listiny datované 2. septembra 2026.</small></section>`
}

export function kdhSasCards(id,withPhotos) {
 if (!kdhSasIds.includes(id)) return ''
 const members=people.filter(person=>person.id!==id && kdhSasIds.includes(person.id))
 const sources=roster.districts.map(district=>`<a href="${esc(district.sourceUrl)}" target="_blank" rel="noopener noreferrer">obvod ${district.number}</a>`).join(', ')
 return `<section class="detail-section connections" aria-labelledby="kdh-sas"><h2 id="kdh-sas">KDH SaS – spoločná nominácia</h2><p>Títo piati kandidáti majú v opravených úradných zoznamoch uvedenú spoločnú nomináciu Demokrati, KDH, SaS. Spoločná nominácia sama osebe nedokazuje spoločný tím ani kampaň. Miroslav Turenič je vedený ako nezávislý kandidát a do tejto skupiny nepatrí.</p><div class="connection-districts">${connectionDistricts(members,withPhotos)}</div><small class="source">Zdroj nominácie: opravené úradné zoznamy ${sources}, datované 2. septembra 2026 · úprava prepojenia podľa Petra, 23. októbra 2026.</small></section>`
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

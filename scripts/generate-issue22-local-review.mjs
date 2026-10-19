import { readFileSync, mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

// Local file only: this script never writes under public/ or dist/.
const ledger = readFileSync(new URL('../docs/research/ISSUE22_COUNCIL_FB_PORTRAIT_DISCOVERY_2026-10-19.md', import.meta.url), 'utf8')
const roster = JSON.parse(readFileSync(new URL('../src/council-candidates.json', import.meta.url), 'utf8'))
const out = new URL('../.private/issue22-review/', import.meta.url)
const esc = (s) => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))
const link = (url, label) => {
  if (!/^https:\/\/www\.facebook\.com\//.test(url)) throw Error(`Unexpected review link: ${url}`)
  return `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(label)} ↗</a>`
}
const unpack = (cell) => {
  const m = cell.match(/^\[([^\]]+)\]\((https:\/\/www\.facebook\.com\/[^)]+)\)(.*)$/)
  return m ? {label:m[1],url:m[2],note:m[3].replace(/^[:\s—]+/,'').trim()} : {label:cell.trim(),url:null,note:''}
}
const lines = ledger.split('\n').filter(line => /^\| D[123]\/\d+ /.test(line))
const byId = new Map()
for (const line of lines) {
  const cells = line.split('|').slice(1,-1).map(x => x.trim())
  if (cells.length !== 5) throw Error(`Malformed ledger row: ${line}`)
  const m = cells[0].match(/^(D[123]\/\d+) (.+)$/)
  if (!m || byId.has(m[1])) throw Error(`Invalid/duplicate ledger key: ${cells[0]}`)
  byId.set(m[1], {name:m[2],search:unpack(cells[1]),entity:unpack(cells[2]),five:cells[3],photo:unpack(cells[4])})
}
if (byId.size !== 44) throw Error(`Expected 44 issue 22 rows, got ${byId.size}`)
const cards = []
for (const district of roster.districts) for (const candidate of district.candidates) {
  const key = `D${district.number}/${candidate.listNumber}`
  const row = byId.get(key)
  if (!row || row.name !== candidate.name) throw Error(`Ledger/official roster mismatch: ${key} ${candidate.name}`)
  const status = row.entity.label.startsWith('probable') ? 'Pravdepodobná súvislosť · stredná dôvera, nepotvrdené vlastníctvo' : row.entity.label.startsWith('low') ? 'Neoverená zhoda · nízka dôvera' : row.entity.label.startsWith('ambiguous') ? 'Nejasná identita účtu · nepotvrdené' : 'V tomto obmedzenom pokuse nenájdený stabilný profil; existencia nevylúčená'
  const photo = row.photo.url ? `${link(row.photo.url,'Zdrojová stránka fotografie')}<span>${esc(row.photo.note)}</span>` : '<span>Bez doloženej zdrojovej stránky portrétu v tomto prechode. Neznamená to, že fotografia neexistuje.</span>'
  cards.push(`<article class="card"><p class="flag">NEODSÚHLASENÉ — len na kontrolu</p><div class="portrait" aria-label="Jednotný zástupný obrázok; portrét nebol schválený">Portrét neschválený</div><div><p class="eyebrow">${esc(key)} · obvod ${district.number} · položka ${candidate.listNumber}</p><h2>${esc(candidate.name)}</h2><p><strong>Registrácia:</strong> ${linkOfficial(district.sourceUrl)} · opravená listina ${esc(roster.officialDate)}, skontrolované ${esc(roster.checked)}</p><p><strong>Facebook vyhľadávanie, 19. 10. 2026:</strong> ${link(row.search.url,row.search.label)} — ${esc(row.search.note)}</p><p><strong>Identita:</strong> ${esc(status)}. ${row.entity.url ? link(row.entity.url,'Len výskumná stopa, nie overený kanál kandidáta') : esc(row.entity.label)} ${esc(row.entity.note)}</p><p><strong>Päť zdrojov:</strong> ${esc(row.five)}. P = individuálny pokus čaká; G1-A = čiastočný pokus; G2-L = skoršia stopa, nie potvrdenie.</p><p><strong>Portrét:</strong> ${photo} Zdrojový súbor, autor/kredit a opätovné použitie nie sú doložené; žiadny portrét nie je schválený pre verejnosť.</p></div></article>`)
  byId.delete(key)
}
if (byId.size) throw Error(`Unmatched ledger IDs: ${[...byId.keys()].join(', ')}`)
function linkOfficial(url) { return `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">Oficiálny obecný PDF ↗</a>` }
const html = `<!doctype html><html lang="sk"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow,noarchive"><title>Issue 22 — súkromná kontrola</title><style>
:root{font-family:system-ui,sans-serif;color:#172b3b;background:#edf2f4}*{box-sizing:border-box}body{margin:0}header{background:#182e43;color:white;padding:1.5rem max(1rem,calc((100vw - 80rem)/2))}h1{font-size:clamp(1.6rem,3vw,2.5rem)}main{max-width:80rem;margin:auto;padding:1rem}a{color:#114d77;overflow-wrap:anywhere}header a{color:#bce5ff}.banner,.flag{background:#ffe0a3;color:#452500;font-weight:800;padding:.55rem .8rem;border:2px solid #885000}.banner{font-size:1.25rem}.cards{display:grid;gap:1rem}.card{display:grid;grid-template-columns:12rem 1fr;gap:1rem;background:white;border:1px solid #a7b7c2;border-radius:.5rem;padding:1rem}.card .flag{grid-column:1/-1;margin:0}.portrait{aspect-ratio:4/5;background:#dce5ea;border:2px dashed #7591a1;display:grid;place-items:center;text-align:center;padding:1rem;font-weight:700}.eyebrow{text-transform:uppercase;letter-spacing:.05em;color:#3a5262}h2{margin:.2rem 0}p{line-height:1.5}p span{display:block}@media(max-width:650px){.card{grid-template-columns:1fr}.portrait{width:10rem}}a:focus-visible{outline:3px solid #a85900;outline-offset:3px}
</style></head><body><header><p class="banner">NEODSÚHLASENÉ — len na kontrolu</p><h1>44 kandidátov · lokálna kontrola stôp Facebooku a portrétov</h1><p>Len lokálny súbor. Nie je súčasťou verejného webu, nasadenia ani schválených profilov. Oficiálne údaje o registrácii pochádzajú z obecných PDF; neschválený je tento výskum kanálov a portrétov.</p></header><main><p><strong>Stav výskumu:</strong> 44/44 priamych prvých segmentov vyhľadávania; 1/220 pokusov meno × päť dodaných zdrojov, 0/220 dokončených. Žiadny nový vysoko dôveryhodný kanál; 4 zdrojové stránky fotografií, 0 schválených verejných portrétov. Všetko je čiastočné. Odkazy sú výskumné stopy, nie potvrdenie vlastníctva ani súhlas s použitím. Zobrazené sú výlučne jednotné zástupné bloky, nie originály z preview-assets.</p><div class="cards">${cards.join('\n')}</div></main></body></html>`
mkdirSync(out,{recursive:true,mode:0o700})
writeFileSync(join(out.pathname,'index.html'),html,{mode:0o600})
console.log(`Wrote ${cards.length} review cards to ${join(out.pathname,'index.html')}`)

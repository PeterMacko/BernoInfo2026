import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const data = JSON.parse(readFileSync(new URL('../src/council-candidates.json', import.meta.url), 'utf8'))
const root = fileURLToPath(new URL('../public/kandidati-na-poslancov/', import.meta.url))
const home = fileURLToPath(new URL('../index.html', import.meta.url))
const councilUrl = 'https://www.bernolakovo.sk/19033/obecne-zastupitelstvo'
const mayorRoutes = new Map([['c-bb232e32','turenic'], ['c-307ca828','kostial'], ['c-f6b4af6c','bartok'], ['c-a4b1db7c','cirbus']])
const esc = (value) => String(value).replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))
const link = (url, label) => `<a href="${esc(url)}">${esc(label)}</a>`

function validate() {
  if (data.districts.length !== 3 || data.districts.reduce((n,d) => n+d.candidates.length,0) !== 44) throw Error('Expected 44 candidates in three districts')
  const counts = [15,19,10], seats = [5,5,3], ids = new Set()
  data.districts.forEach((district,i) => {
    if (district.number !== i+1 || district.seats !== seats[i] || district.candidates.length !== counts[i] || !district.sourceUrl) throw Error(`Invalid district ${i+1}`)
    district.candidates.forEach((candidate,j) => {
      if (candidate.listNumber !== j+1 || !/^c-[0-9a-f]{8}$/.test(candidate.id) || ids.has(candidate.id)) throw Error(`Invalid or duplicate route/list order: ${candidate.id}`)
      ids.add(candidate.id)
      for (const field of ['name','occupation','designation']) if (!candidate[field]?.trim()) throw Error(`Missing ${field}: ${candidate.id}`)
      if (!Number.isInteger(candidate.age) || candidate.age < 18) throw Error(`Invalid age: ${candidate.id}`)
    })
  })
}

function render(candidate, district) {
  const number = String(candidate.listNumber).padStart(2,'0')
  const citation = `<small class="source">Zdroj: ${link(district.sourceUrl,'Obec Bernolákovo — opravený zoznam (PDF)')} · datované ${esc(data.officialDate)} · skontrolované ${esc(data.checked)}</small>`
  const gap = '<p class="empty">V preskúmaných zdrojoch sa tento údaj nepodarilo doložiť. Neznamená to, že neexistuje alebo že kandidát odmietol odpovedať.</p>'
  const section = (id,title,content) => `<section class="detail-section" aria-labelledby="${id}"><h2 id="${id}">${title}</h2><div>${content}</div></section>`
  const council = candidate.councilListMatch ? `<p>Presná podoba mena sa nachádza na ${link(councilUrl,'stránke obecného zastupiteľstva obce pre obdobie 2022 – 2026')}. Tento záznam sám osebe neurčuje presné dátumy výkonu funkcie ani stav k dňu volieb.</p><small class="source">Zdroj: Obec Bernolákovo · stránka naposledy upravená 3. decembra 2025 · skontrolované ${esc(data.checked)}</small>` : gap
  const mayor = mayorRoutes.has(candidate.id) ? `<p>Tá istá osoba je uvedená aj medzi kandidátmi na starostu obce. ${link(`/kandidati/${mayorRoutes.get(candidate.id)}/`,'Samostatný profil kandidatúry na starostu')}.</p>` : ''
  return `<!doctype html>
<html lang="sk"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex, nofollow"><meta name="theme-color" content="#183a64"><link rel="icon" type="image/webp" href="/images/bernolakovo-coat-of-arms.webp"><title>${esc(candidate.name)} — kandidatúra na poslanca obecného zastupiteľstva — BernoInfo 2026</title><meta name="description" content="Kandidatúra na poslanca obecného zastupiteľstva obce Bernolákovo: ${esc(candidate.name)}."><link rel="stylesheet" href="/candidate-detail.css"></head>
<body><div class="page"><header class="masthead"><a class="brand" href="/">BERNO<span>INFO</span> 2026</a><span>Nezávislý projekt · nie stránka obce</span></header><main>
<div class="hero"><a class="back" href="/#council-title">← Späť na kandidátov na poslancov obecného zastupiteľstva</a><p class="kicker">Bernolákovo / poslanci obecného zastupiteľstva / volebný obvod ${district.number}</p><h1>${esc(candidate.name)}<small class="office-label">Kandidatúra na poslanca obecného zastupiteľstva</small></h1><p>Číslo ${number} v opravenom zozname obvodu ${district.number}. Nie je to nezávisle overené číslo na hlasovacom lístku.</p></div>
<div class="content">
${section('registration','Registrácia',`<p><strong>${esc(candidate.name)}</strong> · volebný obvod ${district.number}, číslo ${number} v opravenom zozname. Obvod má ${district.seats} ${district.seats === 3 ? 'mandáty' : 'mandátov'} a ${district.candidates.length} zaregistrovaných kandidátov. Oficiálne uvedená príslušnosť: <strong>${esc(candidate.designation)}</strong>.</p>${citation}${mayor}`)}
${section('occupation','Vek a povolanie',`<p>Vek uvedený v zozname: <strong>${candidate.age}</strong>. Povolanie uvedené v zozname: <strong>${esc(candidate.occupation)}</strong>. Zápis sám osebe nepotvrdzuje dnešný vek, zamestnávateľa ani aktuálny pracovný pomer.</p>${citation}`)}
${section('functions','Verejné funkcie v období 2022 – 2026',council)}
${section('programme','Programové návrhy',gap)}
${section('interview','Rozhovor alebo video',gap)}
${section('channels','Kanály kandidáta',gap)}
${section('sources','Zdroje, pokrytie a opravy',`<p>Údaje o registrácii sú prevzaté z ${link(district.sourceUrl,'opraveného zoznamu kandidátov pre obvod '+district.number+' (PDF)')} obce Bernolákovo, datovaného ${esc(data.officialDate)} a skontrolovaného ${esc(data.checked)}. Staršie listiny boli nahradené po chybe zoradenia. Neskoršie odstúpenia, zmeny a konečný hlasovací lístok neboli overené.</p><p>Pre program, rozhovory a vlastné kanály nebol v čiastočnej rešerši doložený priamy datovaný stabilný zdroj pre každého kandidáta. Prázdne rubriky neznamenajú neprítomnosť stanoviska či zdroja. Sľuby z kandidatúry na starostu tu nie sú prenesené na kandidatúru do zastupiteľstva.</p><p>Opravy údajov: ${link('mailto:Mr.petermacko@gmail.com','Mr.petermacko@gmail.com')}. Uveďte údaj a odkaz na zdroj.</p>`)}
</div></main><footer><a href="/#council-title">← Späť na kandidátov na poslancov obecného zastupiteľstva</a><p>BernoInfo 2026 · nezávislý informačný projekt</p></footer></div></body></html>\n`
}

validate()
for (const district of data.districts) for (const candidate of district.candidates) {
  const directory = join(root,candidate.id)
  mkdirSync(directory,{recursive:true})
  writeFileSync(join(directory,'index.html'),render(candidate,district))
}
// The no-JS list shares the checked roster and route IDs with the React view.
let html = readFileSync(home,'utf8')
const start = '<!-- council-fallback:start -->', end = '<!-- council-fallback:end -->'
if (!html.includes(start) || !html.includes(end)) throw Error('Missing no-JS council markers')
const fallback = `<section class="static-council" aria-labelledby="static-council-title"><h2 id="static-council-title">Kandidáti na poslancov obecného zastupiteľstva</h2><p>44 zaregistrovaných kandidátov v troch volebných obvodoch, spolu 13 mandátov. Čísla sú poradím v opravených zoznamoch, nie overenými číslami na hlasovacom lístku. Skontrolované ${esc(data.checked)}; neskoršie zmeny treba preveriť.</p>${data.districts.map((district) => `<section><h3>Volebný obvod ${district.number}</h3><p>${district.candidates.length} kandidátov · ${district.seats} ${district.seats === 3 ? 'mandáty' : 'mandátov'} · ${link(district.sourceUrl,'Opravený zoznam obce (PDF)')}, datovaný ${esc(data.officialDate)}</p><ol class="static-list">${district.candidates.map((candidate) => `<li><a href="/kandidati-na-poslancov/${candidate.id}/"><span aria-hidden="true">${String(candidate.listNumber).padStart(2,'0')}</span><span class="council-label">${esc(candidate.name)}<small class="council-designation">${esc(candidate.designation)}</small></span></a></li>`).join('')}</ol></section>`).join('')}</section>`
html = html.replace(new RegExp(`${start}[\\s\\S]*?${end}`),`${start}\n${fallback}\n${end}`)
writeFileSync(home,html)
console.log('Generated 44 council detail pages and no-JS list.')

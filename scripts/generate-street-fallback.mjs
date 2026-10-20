import { readFileSync, mkdirSync, writeFileSync } from 'node:fs'

const data = JSON.parse(readFileSync(new URL('../src/street-precincts.json', import.meta.url)))
const districtUrl = 'https://www.bernolakovo.sk/data/news_files/bernolakovo.sk/135341/uznesenia.pdf'
const precinctUrl = 'https://data.moderneobce.sk/data/uploads/bernolakovo.sk/VO%C4%BDBY_2026/Zaradenie_volebn%C3%BDch_okrskov_do_volebn%C3%BDch_obvodov_utvoren%C3%BDch_pre_vo%C4%BEby_poslancov_obecn%C3%A9ho_zastupite%C4%BEstva.pdf'
const venue = n => n <= 5 ? 'Základná škola, Školská 1, Bernolákovo' : 'Kultúrny dom, Hlavná 107, Bernolákovo'
const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')
const groups = [1,2,3].map(d => {
  const precincts = [...new Set(data.filter(r => r.district === d).map(r => r.precinct))]
  return `<section id="district-${d}"><h2>Volebný obvod ${d}</h2><p><a href="/#district-${d}">Kandidáti na poslancov obvodu ${d}</a> · <a href="${districtUrl}">Oficiálne určenie obvodu (PDF)</a></p>${precincts.map(n => `<section><h3>Okrsok ${n}</h3><p><strong>Volebná miestnosť:</strong> ${venue(n)}</p><ul>${data.filter(r => r.precinct === n).map(r => `<li>${escape(r.street)}</li>`).join('')}</ul></section>`).join('')}</section>`
}).join('')
const html = `<!doctype html><html lang="sk"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Ulice, obvody a okrsky — BernoInfo 2026</title><link rel="stylesheet" href="/fallback.css"></head><body><main class="static-page"><div class="static-main"><p><a href="/">← Úvodná stránka</a></p><h1>Ulice, obvody a okrsky</h1><p>Nájdite svoju ulicu v textovom zozname. Obvod určuje kandidátov na poslancov, okrsok volebnú miestnosť. Údaje sú podľa <a href="${districtUrl}">uznesenia obce z 23. júna 2026</a> a <a href="${precinctUrl}">oznámenia z 29. júla 2026</a>; skontrolované 20. októbra 2026. Ak ulicu nenájdete, overte ju v oficiálnom oznámení. Neskoršie zmeny treba pred voľbami preveriť.</p><p>V júlovom oznámení je „Záhradkárska oblasť (pri Trnavskej)“; júnové uznesenie uvádza skrátené „Záhradkárska oblasť“.</p>${groups}</div></main></body></html>`
mkdirSync(new URL('../public/volby/ulice/', import.meta.url), { recursive: true })
writeFileSync(new URL('../public/volby/ulice/index.html', import.meta.url), html)

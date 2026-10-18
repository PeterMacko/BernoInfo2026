import { readFileSync, mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const data = JSON.parse(readFileSync(new URL('../src/candidate-details.json', import.meta.url), 'utf8'))
const root = new URL('../public/kandidati/', import.meta.url)
const esc = (value) => String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
const link = (url, label) => `<a href="${esc(url)}">${esc(label)}</a>`
const source = (url, publisher, date = 'dátum zverejnenia neuvedený') => `<small class="source">Zdroj: ${link(url, publisher)} · ${esc(date)} · naposledy overené ${esc(data.checked)}</small>`
const empty = '<p class="empty">V preskúmaných zdrojoch sa tento údaj nepodarilo doložiť. Neznamená to, že neexistuje alebo že kandidát odmietol odpovedať.</p>'
const section = (title, body, id) => `<section class="detail-section" aria-labelledby="${id}"><h2 id="${id}">${title}</h2>${body}</section>`
const wordCount = (value) => String(value).trim().split(/\s+/u).filter(Boolean).length
const correction = `<a href="mailto:${esc(data.correctionEmail)}">Nahlásiť opravu: ${esc(data.correctionEmail)}</a>`

if (data.candidates.length !== 8 || new Set(data.candidates.map(c => c.id)).size !== 8) throw new Error('Expected eight distinct candidate routes')
for (const c of data.candidates) {
  if ((c.experience || []).length > 2 || (c.experience || []).some((item) => wordCount(item) > 70) || (c.proposals && wordCount(c.proposals) > 70)) throw new Error(`Equal-treatment copy cap exceeded for ${c.id}`)
  const n = String(c.position).padStart(2, '0')
  const registration = `<p><strong>${esc(c.name)}</strong> · číslo ${n} v opravenom zozname kandidátov. Registrovaná príslušnosť: ${esc(c.affiliation)}. Číslo v zozname nie je overeným číslom na hlasovacom lístku.</p>${source(data.officialUrl, 'Obec Bernolákovo — opravený zoznam (PDF)', `zverejnené ${data.officialDate}`)}`
  const occupation = `<p>Povolanie uvedené v oficiálnom zozname: <strong>${esc(c.occupation)}</strong>. Zápis nedokladá konkrétneho zamestnávateľa ani súčasný pracovný pomer.</p>${source(data.officialUrl, 'Obec Bernolákovo — opravený zoznam (PDF)', `zverejnené ${data.officialDate}`)}`
  const experience = (c.experience || []).length ? `<ul class="evidence-list">${c.experience.map(item => `<li><p><strong>Kandidát uvádza:</strong> ${esc(item)}</p>${source(c.experienceSource, 'Web kandidáta')}</li>`).join('')}</ul>` : empty
  const programme = c.proposals ? `<p><strong>Kandidát uvádza:</strong> ${esc(c.proposals)}</p>${source(c.proposalSource || c.website, c.proposalPublisher || 'Web kandidáta', c.proposalDate)}` : empty
  const functions = (c.priorTermFunctions || []).length ? `<ul class="evidence-list">${c.priorTermFunctions.map(item => `<li><p>${esc(item.text)}</p>${source(item.url, 'Obec Bernolákovo', item.sourceDate)}</li>`).join('')}</ul>` : empty
  const channel = (url, note) => url ? `<p>${link(url, 'Otvoriť zdroj')}${note ? ` — ${esc(note)}` : ''}</p>${source(url, url.includes('facebook.com') ? 'Facebook — kandidátsky označená alebo prepojená stránka' : 'Web kandidáta')}` : empty
  const channels = `<div class="link-slots"><div><h3>Facebook</h3>${channel(c.facebook, c.facebookNote)}</div><div><h3>Web kandidáta</h3>${channel(c.website)}</div></div>`
  const companies = `${empty}<p class="qualifier">Žiadna firemná funkcia nie je uvedená: priamy záznam, IČO, obdobie a spoľahlivé priradenie osoby neboli doložené. Priamy prístup k FinStat bol pri výskume nedostupný. Nejde o potvrdenie neexistencie funkcie.</p>`
  const interview = c.interview ? `<p>${link(c.interview, `Rozhovor s ${c.name} — LanCast Studio`)}. Vydavateľ: LanCast Studio. Účasť kandidáta podporujú úvodné titulky; celé odpovede ani identita podľa obrazu alebo hlasu neboli overené. Z rozhovoru tu nevyvodzujeme stanoviská.</p>${source(c.interview, 'LanCast Studio — YouTube', 'zverejnené 8. októbra 2026')}` : '<p class="empty">V spoločnej preskúmanej sade sa priamy rozhovor nepodarilo doložiť. Neznamená to, že rozhovor neexistuje alebo že kandidát účasť odmietol.</p>'
  const sources = `<p>Spoločná uzávierka podkladov: ${esc(data.checked)}. Registrácia a povolanie vychádzajú z opravenej listiny obce. Programové návrhy a skúsenosti z kandidátskych zdrojov sú pripísané kandidátovi, nie nezávisle potvrdené. Výskum verejných zdrojov a sociálnych sietí je čiastočný; neúplné položky neznamenajú absenciu stanoviska či zdroja.</p><p>${link(data.officialUrl, 'Opravený zoznam kandidátov (PDF)')} · ${correction}</p><p>Pri hlásení chyby uveďte dotknutý údaj a odkaz na zdroj. Doložené opravy posúdime podľa rovnakých pravidiel pre všetkých kandidátov; zmenu označíme dátumom pri príslušnej informácii.</p>`
  const body = [
    section('Registrácia', registration, 'registration'),
    section('Povolanie', occupation, 'occupation'),
    section('Skúsenosti a projekty', experience, 'experience'),
    section('Programové návrhy', programme, 'programme'),
    section('Verejné funkcie v období 2022 – 2026', functions, 'functions'),
    section('Kanály kandidáta', channels, 'channels'),
    section('Firemné funkcie', companies, 'companies'),
    section('Rozhovor', interview, 'interview'),
    section('Zdroje, pokrytie a opravy', sources, 'sources'),
  ].join('\n')
  const nav = data.candidates.map(other => `<a ${other.id === c.id ? 'aria-current="page" ' : ''}href="/kandidati/${other.id}/">${String(other.position).padStart(2, '0')} ${esc(other.name)}</a>`).join('')
  const html = `<!doctype html><html lang="sk"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex, nofollow"><meta name="theme-color" content="#183a64"><title>${esc(c.name)} — BernoInfo 2026</title><meta name="description" content="Profil kandidáta ${esc(c.name)} vo voľbách starostu obce Bernolákovo 2026."><link rel="stylesheet" href="/candidate-detail.css"></head><body><div class="page"><header class="masthead"><a class="brand" href="/">BERNO<span>INFO</span> 2026</a><span>Nezávislý projekt · nie stránka obce</span></header><main><div class="hero"><a class="back" href="/">← Všetci kandidáti</a><p class="kicker">Bernolákovo / voľby starostu / ${n} z 08</p><h1>${esc(c.name)}</h1><p>Rovnaké rubriky a pravidlá zdrojovania pre všetkých osem kandidátov.</p></div><nav class="candidate-nav" aria-label="Profily kandidátov">${nav}</nav><div class="content">${body}</div></main><footer><a href="/">← Späť na úplný zoznam</a><p>${correction}</p><p>BernoInfo 2026 · nezávislý informačný projekt</p></footer></div></body></html>`
  const dir = join(root.pathname, c.id)
  mkdirSync(dir, { recursive: true })
  writeFileSync(join(dir, 'index.html'), html)
}
console.log(`Generated ${data.candidates.length} candidate detail pages.`)

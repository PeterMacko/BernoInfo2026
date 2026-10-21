import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import {connectionCards} from './issue24-shared.mjs'
import {alternateLinkLabel, alternateLinkNote} from './issue27-link-labels.mjs'

const data = JSON.parse(readFileSync(new URL('../src/candidate-details.json', import.meta.url), 'utf8'))
const councilData = JSON.parse(readFileSync(new URL('../src/council-candidates.json', import.meta.url), 'utf8'))
const evidence = JSON.parse(readFileSync(new URL('../src/issue24-evidence.json', import.meta.url), 'utf8'))
const entityLinks = JSON.parse(readFileSync(new URL('../src/council-entity-links.json', import.meta.url), 'utf8'))
const dualIds = {bartok:'c-f6b4af6c', cirbus:'c-a4b1db7c', kostial:'c-307ca828', turenic:'c-bb232e32'}
const reviewPortraits = JSON.parse(readFileSync(new URL('../src/portrait-review.json', import.meta.url), 'utf8'))
const mode = process.env.SITE_BUILD_MODE || 'placeholder'
const photoReview = mode === 'photo-review'
const withPhotos = mode !== 'placeholder'
const outputRoot = fileURLToPath(new URL('../public/kandidati/', import.meta.url))

const empty = '<p class="empty">V preskúmaných zdrojoch sa tento údaj nepodarilo doložiť. Neznamená to, že neexistuje alebo že kandidát odmietol odpovedať.</p>'
const officialPublisher = 'Obec Bernolákovo — opravený zoznam (PDF)'

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character])
}

function link(url, label) {
  return `<a href="${escapeHtml(url)}">${escapeHtml(label)}</a>`
}

function source(url, publisher, date = 'dátum zverejnenia neuvedený', checked = data.checked) {
  return `<small class="source">Zdroj: ${link(url, publisher)} · ${escapeHtml(date)} · ${escapeHtml(checked === data.checked ? `naposledy overené ${checked}` : checked)}</small>`
}

function indent(markup, depth = 1) {
  return markup.split('\n').map((line) => `${'  '.repeat(depth)}${line}`).join('\n')
}

function block(tag, attributes, children) {
  return `<${tag}${attributes}>\n${children.map((child) => indent(child)).join('\n')}\n</${tag}>`
}

function section(id, title, content) {
  return block('section', ` class="detail-section" aria-labelledby="${id}"`, [
    `<h2 id="${id}">${title}</h2>`,
    ...content,
  ])
}

function wordCount(value) {
  return String(value).trim().split(/\s+/u).filter(Boolean).length
}

function validateInputs() {
  if (!Array.isArray(data.candidates) || data.candidates.length !== 8) {
    throw new Error('Expected eight candidate routes')
  }

  const ids = new Set()
  const positions = new Set()
  for (const candidate of data.candidates) {
    if (typeof candidate.id !== 'string' || !/^[a-z0-9-]+$/.test(candidate.id)) {
      throw new Error(`Invalid candidate route token: ${String(candidate.id)}`)
    }
    if (ids.has(candidate.id)) throw new Error(`Duplicate candidate route: ${candidate.id}`)
    ids.add(candidate.id)
    if (!Number.isInteger(candidate.position) || candidate.position < 1 || candidate.position > 8 || positions.has(candidate.position)) {
      throw new Error(`Missing or duplicate list position for ${candidate.id}`)
    }
    positions.add(candidate.position)
    for (const field of ['name', 'affiliation', 'occupation']) {
      if (typeof candidate[field] !== 'string' || !candidate[field].trim()) {
        throw new Error(`Missing ${field} for ${candidate.id}`)
      }
    }
    if (!reviewPortraits[candidate.id] || typeof reviewPortraits[candidate.id].src !== 'string' ||
        typeof reviewPortraits[candidate.id].sourceUrl !== 'string' || typeof reviewPortraits[candidate.id].credit !== 'string') {
      throw new Error(`Missing portrait-review record for ${candidate.id}`)
    }
    if ((candidate.experience || []).length > 2 ||
        (candidate.experience || []).some((item) => wordCount(item) > 70) ||
        (candidate.proposals && wordCount(candidate.proposals) > 70)) {
      throw new Error(`Equal-treatment copy cap exceeded for ${candidate.id}`)
    }
  }
}

function renderRegistration(candidate) {
  const number = String(candidate.position).padStart(2, '0')
  return [
    `<p><strong>${escapeHtml(candidate.name)}</strong> · číslo ${number} v opravenom zozname kandidátov. Registrovaná príslušnosť: ${escapeHtml(candidate.affiliation)}. Číslo v zozname nie je overeným číslom na hlasovacom lístku.</p>`,
    source(data.officialUrl, officialPublisher, `datované ${data.officialDate}`),
  ]
}

function renderOccupation(candidate) {
  return [
    `<p>Povolanie uvedené v oficiálnom zozname: <strong>${escapeHtml(candidate.occupation)}</strong>. Zápis nedokladá konkrétneho zamestnávateľa ani súčasný pracovný pomer.</p>`,
    source(data.officialUrl, officialPublisher, `datované ${data.officialDate}`),
  ]
}

function renderEvidenceList(items, renderItem) {
  return items.length ? [block('ul', ' class="evidence-list"', items.map(renderItem))] : [empty]
}

function renderExperience(candidate) {
  return renderEvidenceList(candidate.experience || [], (item) => block('li', '', [
    `<p><strong>Kandidát uvádza:</strong> ${escapeHtml(item)}</p>`,
    source(candidate.experienceSource, 'Web kandidáta'),
  ]))
}

function renderProgramme(candidate) {
  return candidate.proposals ? [
    `<p><strong>Kandidát uvádza:</strong> ${escapeHtml(candidate.proposals)}</p>`,
    source(candidate.proposalSource || candidate.website, candidate.proposalPublisher || 'Web kandidáta', candidate.proposalDate),
  ] : [empty]
}

function renderFunctions(candidate) {
  return renderEvidenceList(candidate.priorTermFunctions || [], (item) => block('li', '', [
    `<p>${escapeHtml(item.text)}</p>`,
    source(item.url, 'Obec Bernolákovo', item.sourceDate),
  ]))
}

function renderChannel(url, note, publisher, supplied = false) {
  return [
    `<p>${link(url, 'Otvoriť zdroj')}${note ? ` — ${escapeHtml(note)}` : ''}</p>`,
    source(url, publisher, 'dátum zverejnenia neuvedený', supplied ? 'odkaz dodal Peter 21. októbra 2026; obsah nebol nezávisle overený' : data.checked),
  ]
}

function renderChannels(candidate) {
  const channels = [
    ['Web kandidáta', candidate.website, null, 'Web kandidáta', candidate.id === 'bartok'],
    ['Facebook', candidate.facebook, candidate.facebookNote, 'Facebook — kandidátsky označená alebo prepojená stránka', candidate.id === 'cirbus'],
    ['Instagram', candidate.instagram, 'Odkaz dodal prevádzkovateľ projektu; prevádzkovateľ účtu nebol nezávisle overený.', 'Instagram — kandidátsky označený účet', true],
  ]
  return [block('div', ' class="link-slots"', channels.filter(([, url]) => url).map(([label, url, note, publisher, supplied]) =>
    block('div', '', [`<h3>${label}</h3>`, ...renderChannel(url, note, publisher, supplied)])))]
}

const channelIcons = {
  website: '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c-3 3-4 6-4 9s1 6 4 9M12 3c3 3 4 6 4 9s-1 6-4 9"/></svg>',
  facebook: '<svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor"><path d="M14.4 21v-8h2.7l.4-3.1h-3.1V8c0-.9.3-1.5 1.6-1.5h1.7V3.7a22 22 0 0 0-2.5-.1c-2.5 0-4.2 1.5-4.2 4.3v2H8.2V13H11v8h3.4Z"/></svg>',
  instagram: '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>',
}

function renderTopChannels(candidate) {
  const slots = [['website', 'Web', candidate.website], ['facebook', 'Facebook', candidate.facebook], ['instagram', 'Instagram', candidate.instagram]]
  return block('div', ' class="hero-channels" aria-label="Odkazy na kanály kandidáta"', slots.filter(([, , url]) => url).map(([kind, label, url]) =>
    `<a href="${escapeHtml(url)}" aria-label="${escapeHtml(label)} — ${escapeHtml(candidate.name)}">${channelIcons[kind]}<span>${escapeHtml(label)}</span></a>`))
}

function renderTenQuestions(candidate) {
  return candidate.tenQuestions ? [
    `<p>${link(candidate.tenQuestions, `Príspevok k rubrike 10 otázok — ${candidate.name}`)}. Odkaz dodaný ako súčasť rubriky Bernolákovo Online; presný obsah príspevku ani prípadné odpovede nie sú overené.</p>`,
    source(candidate.tenQuestions, 'Bernolákovo Online — Facebook', 'dátum príspevku nezistený', 'odkaz dodal Peter 21. októbra 2026; obsah nebol nezávisle overený'),
  ] : ['<p class="empty">V dodanej sade nebol odkaz na túto rubriku doložený. Neznamená to, že príspevok alebo odpovede neexistujú.</p>']
}

function renderInterview(candidate) {
  return candidate.interview ? [
    `<p>${link(candidate.interview, `Rozhovor s ${candidate.name} — LanCast Studio`)}. Vydavateľ: LanCast Studio. Účasť kandidáta podporujú úvodné titulky; celé odpovede ani identita podľa obrazu alebo hlasu neboli overené. Z rozhovoru tu nevyvodzujeme stanoviská.</p>`,
    source(candidate.interview, 'LanCast Studio — YouTube', 'zverejnené 8. októbra 2026'),
  ] : [
    '<p class="empty">V spoločnej preskúmanej sade sa priamy rozhovor nepodarilo doložiť. Neznamená to, že rozhovor neexistuje alebo že kandidát účasť odmietol.</p>',
  ]
}

function correctionLink() {
  return `<a href="mailto:${escapeHtml(data.correctionEmail)}">Nahlásiť opravu: ${escapeHtml(data.correctionEmail)}</a>`
}

function renderSources() {
  return [
    `<p>Spoločný dátum poslednej kontroly záznamov: ${escapeHtml(data.checked)}. Registrácia a povolanie vychádzajú z opravenej listiny obce. Programové návrhy a skúsenosti z kandidátskych zdrojov sú pripísané kandidátovi, nie nezávisle potvrdené. Výskum verejných zdrojov a sociálnych sietí je čiastočný; neúplné položky neznamenajú absenciu stanoviska či zdroja ani to, že kandidát odmietol odpovedať.</p>`,
    '<p>Prvotné zhromaždenie podkladov pre údaje v profiloch sa uzavrelo 18. októbra 2026; 19. októbra nasledovala cielená kontrola známych zdrojov a 20. októbra kontrola záznamov, nie úplné opakovanie rešerše. Prehľad facebookových zdrojov za 16. júl – 16. október je čiastočný; neboli preskúmané všetky príspevky, videá ani odpovede v rozhovoroch. Pri zdrojoch rozlišujeme dátum zverejnenia, ak je známy, a dátum kontroly.</p>',
    `<p>${link(data.officialUrl, 'Opravený zoznam kandidátov (PDF)')} · ${correctionLink()}</p>`,
    '<p>Pri hlásení chyby uveďte dotknutý údaj a odkaz na zdroj. Doložené opravy posúdime podľa rovnakých pravidiel pre všetkých kandidátov; zmenu označíme dátumom pri príslušnej informácii.</p>',
  ]
}

function councilRecord(candidate) {
  const id = dualIds[candidate.id]
  if (!id) return null
  for (const district of councilData.districts) {
    const found = district.candidates.find((item) => item.id === id)
    if (found) return {district, candidate:found}
  }
  throw Error(`Dual registration not found: ${candidate.id}`)
}

function renderCouncilRegistration(candidate) {
  const record = councilRecord(candidate)
  if (!record) return []
  const {district, candidate: council} = record
  return [section('council-registration', 'Kandidatúra na poslanca obecného zastupiteľstva', [
    `<p><strong>${escapeHtml(council.name)}</strong> je samostatne registrovaný aj ako kandidát na poslanca v obvode ${district.number}, poradie ${council.listNumber} v opravenom zozname. Uvedená príslušnosť: ${escapeHtml(council.designation)}. Vek uvedený v tomto zozname: ${council.age}; povolanie: ${escapeHtml(council.occupation)}. Poradie nie je overené číslo na hlasovacom lístku.</p>`,
    source(district.sourceUrl, 'Obec Bernolákovo — opravený zoznam kandidátov na poslancov (PDF)', `datované ${councilData.officialDate}`),
    `<p>${link('/#council-title', 'Späť na zoznam kandidátov na poslancov')}</p>`,
  ])]
}

function renderCouncilLinks(candidate) {
  const record = councilRecord(candidate)
  if (!record) return []
  const item = evidence[record.candidate.id]
  if (!item) return []
  const kind = item.link.kind
  const url = item.link.url
  const label = kind === 'shared campaign page' ? 'Spoločná stránka kampane (nie osobný profil)' :
    kind === 'post/appearance' ? 'Príspevok o kandidátovi (nie jeho účet)' :
    kind === 'self-labelled candidate page/profile' ? 'Kandidátsky označená stránka/profil — prevádzkovateľ neoverený' :
    kind === 'campaign-used profile' ? 'Profil použitý v kampani — prevádzkovateľ neoverený' :
    kind === 'probable/unverified profile' ? 'Možný profil — nepotvrdené' :
    kind === 'historical page (2018)' ? 'Historická stránka kampane (2018) — nie dôkaz súčasnej aktivity' :
    kind === 'mention only' ? 'Príspevok so zmienkou o kandidátovi — nie profil' : null
  const alternateUrl = entityLinks.urls[item.key]
  const links = []
  const reviewOnlyLead = ['probable/unverified profile','historical page (2018)','mention only'].includes(kind)
  if (label && url && (!reviewOnlyLead || photoReview)) links.push(`<p>${link(url,label)}</p><small class="source">${escapeHtml(kind)} · pôvodný dátum neznámy · uvedené v pracovnej kompilácii k 20. októbru 2026. Vlastníctvo účtu nie je nezávisle overené.</small>`)
  if (photoReview && alternateUrl && alternateUrl !== url) links.push(`<p>${link(alternateUrl, alternateLinkLabel(item.key))}</p><small class="source">${escapeHtml(alternateLinkNote)}</small>`)
  return links.length ? [section('council-source', 'Odkazy ku kandidatúre na poslanca', links)] : []
}

function renderSections(candidate) {
  return block('div', ' class="content"', [
    section('registration', 'Registrácia na starostu obce', renderRegistration(candidate)),
    ...renderCouncilRegistration(candidate),
    section('occupation', 'Povolanie', renderOccupation(candidate)),
    section('experience', 'Skúsenosti a projekty', renderExperience(candidate)),
    section('programme', 'Programové návrhy', renderProgramme(candidate)),
    section('functions', 'Verejné funkcie v období 2022 – 2026', renderFunctions(candidate)),
    section('channels', 'Kanály kandidáta', renderChannels(candidate)),
    ...renderCouncilLinks(candidate),
    ...[connectionCards(dualIds[candidate.id],withPhotos,photoReview)].filter(Boolean),
    section('interview', 'Rozhovor', renderInterview(candidate)),
    section('ten-questions', '10 otázok — Bernolákovo Online', renderTenQuestions(candidate)),
    section('sources', 'Zdroje, pokrytie a opravy', renderSources()),
  ])
}

function renderNavigation(candidate) {
  return block('nav', ' class="candidate-nav" aria-label="Profily kandidátov"', data.candidates.map((other) =>
    `<a ${other.id === candidate.id ? 'aria-current="page" ' : ''}href="/kandidati/${other.id}/">${String(other.position).padStart(2, '0')} ${escapeHtml(other.name)}</a>`))
}

function renderPortrait(candidate) {
  const portrait = reviewPortraits[candidate.id]
  const image = withPhotos
    ? `<img class="candidate-portrait candidate-portrait--${escapeHtml(candidate.id)}" src="${escapeHtml(portrait.src)}" alt="Fotografia kandidáta ${escapeHtml(candidate.name)}" width="640" height="760">`
    : '<img src="/images/portrait-placeholder.svg" alt="" width="640" height="760">'
  const caption = withPhotos
    ? `<figcaption>Zdroj fotografie: ${link(portrait.sourceUrl, 'pôvodná fotografia')} · ${escapeHtml(portrait.credit)}. ${photoReview ? 'Kontrolný náhľad, ' : ''}Rok vzniku záberu neznámy.</figcaption>`
    : '<figcaption>Portrét zatiaľ nie je zverejnený; grafická výplň nie je podobizňou kandidáta.</figcaption>'
  return block('figure', ' class="detail-portrait"', [
    block('div', ' class="portrait-wrap"', [image]),
    caption,
  ])
}

function renderHero(candidate) {
  const number = String(candidate.position).padStart(2, '0')
  return block('div', ' class="hero"', [
    `<a class="back" href="${councilRecord(candidate) ? '/#council-title' : '/#candidates-title'}">← ${councilRecord(candidate) ? 'Oba zoznamy kandidátov' : 'Kandidáti na starostu obce'}</a>`,
    ...(photoReview ? ['<p class="preview-notice">Vývojový náhľad zdrojových fotografií</p>'] : []),
    block('div', ' class="hero-layout"', [
      block('div', ' class="hero-copy"', [
        `<p class="kicker">Bernolákovo / ${councilRecord(candidate) ? 'kandidát na starostu aj poslanca obecného zastupiteľstva' : 'voľby starostu'} / ${number} z 08</p>`,
        `<h1>${escapeHtml(candidate.name)}${councilRecord(candidate) ? '<small class="office-label">Kandidát na starostu obce aj poslanca obecného zastupiteľstva</small>' : ''}</h1>`,
        renderTopChannels(candidate),
        '<p>Rovnaké rubriky a pravidlá zdrojovania pre všetkých osem kandidátov.</p>',
      ]),
      renderPortrait(candidate),
    ]),
  ])
}

function renderDocument(candidate) {
  const head = block('head', '', [
    '<meta charset="UTF-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    ...(mode === 'release' ? [] : ['<meta name="robots" content="noindex, nofollow">']),
    '<meta name="theme-color" content="#183a64">',
    '<link rel="icon" type="image/webp" href="/images/bernolakovo-coat-of-arms.webp">',
    `<title>${escapeHtml(candidate.name)} — ${councilRecord(candidate) ? 'kandidát na starostu aj poslanca' : 'kandidát na starostu'} — BernoInfo 2026</title>`,
    `<meta name="description" content="Profil kandidáta ${escapeHtml(candidate.name)} ${councilRecord(candidate) ? 'na starostu aj poslanca obecného zastupiteľstva' : 'na starostu obce'} Bernolákovo 2026.">`,
    `<link rel="canonical" href="/kandidati/${escapeHtml(candidate.id)}/">`,
    '<link rel="stylesheet" href="/candidate-detail.css">',
  ])
  const header = block('header', ' class="masthead"', [
    '<a class="brand" href="/">BERNO<span>INFO</span> 2026</a>',
    '<span>Nezávislý projekt · nie stránka obce</span>',
  ])
  const footer = block('footer', '', [
    '<a href="/">← Späť na úplný zoznam</a>',
    `<p>${correctionLink()}</p>`,
    '<p>BernoInfo 2026 · nezávislý informačný projekt</p>',
  ])
  const page = block('div', ' class="page"', [
    header,
    block('main', '', [renderHero(candidate), renderNavigation(candidate), renderSections(candidate)]),
    footer,
  ])
  return `<!doctype html>\n${block('html', ' lang="sk"', [head, block('body', '', [page])])}\n`
}

validateInputs()
for (const candidate of data.candidates) {
  const directory = join(outputRoot, candidate.id)
  mkdirSync(directory, { recursive: true })
  writeFileSync(join(directory, 'index.html'), renderDocument(candidate), 'utf8')
}
console.log(`Generated ${data.candidates.length} candidate detail pages.`)

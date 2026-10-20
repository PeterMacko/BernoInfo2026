import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.argv[2] || 'dist'
const mode = process.env.SITE_BUILD_MODE || 'placeholder'
const originInput = process.env.SITE_ORIGIN
if (mode === 'release' && (!originInput || process.env.RELEASE_ORIGIN_VERIFIED !== '1')) {
  throw Error('Release metadata requires SITE_ORIGIN and RELEASE_ORIGIN_VERIFIED=1 after verifying the public hostname.')
}
let origin = null
if (originInput) {
  const parsed = new URL(originInput)
  if (parsed.protocol !== 'https:' || parsed.username || parsed.password || parsed.search || parsed.hash || parsed.pathname !== '/' || parsed.origin !== originInput) {
    throw Error('SITE_ORIGIN must be a bare HTTPS origin (no path, query, credentials or fragment).')
  }
  origin = parsed.origin
}
const mayor = JSON.parse(readFileSync('src/candidate-details.json', 'utf8')).candidates
const council = JSON.parse(readFileSync('src/council-candidates.json', 'utf8')).districts.flatMap(d => d.candidates)
const dual = new Map([['c-f6b4af6c','bartok'],['c-a4b1db7c','cirbus'],['c-307ca828','kostial'],['c-bb232e32','turenic']])
const shared = new Set(dual.values())
const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))
const meta = (key, value, attr = 'name') => `<meta ${attr}="${esc(key)}" content="${esc(value)}">`
const canonical = path => `${origin}${path}`
const imagePath = '/images/bernoinfo-social.png'
const imageAlt = 'BernoInfo 2026 — nezávislý informačný prehľad komunálnych volieb v Bernolákove'
function head(title, description, path, { noindex = false, redirect = false } = {}) {
  const tags = [`<title>${esc(title)}</title>`, meta('description', description)]
  if (noindex || mode !== 'release') tags.push(meta('robots', 'noindex, nofollow'))
  if (origin && path !== '/404.html') tags.push(`<link rel="canonical" href="${esc(canonical(path))}">`)
  if (!redirect && origin && mode !== 'photo-review') {
    tags.push(meta('og:title', title, 'property'), meta('og:description', description, 'property'),
      meta('og:type', 'website', 'property'), meta('og:url', canonical(path), 'property'),
      meta('og:site_name', 'BernoInfo 2026', 'property'), meta('og:locale', 'sk_SK', 'property'),
      meta('og:image', canonical(imagePath), 'property'), meta('og:image:secure_url', canonical(imagePath), 'property'),
      meta('og:image:alt', imageAlt, 'property'), meta('og:image:type', 'image/png', 'property'),
      meta('og:image:width', '1200', 'property'), meta('og:image:height', '630', 'property'),
      meta('twitter:card', 'summary_large_image'), meta('twitter:title', title),
      meta('twitter:description', description), meta('twitter:image', canonical(imagePath)),
      meta('twitter:image:alt', imageAlt))
  }
  return tags.join('\n')
}
function apply(file, tags) {
  let html = readFileSync(file, 'utf8')
  if (!/<head(?:\s[^>]*)?>/i.test(html)) throw Error(`Missing head: ${file}`)
  html = html.replace(/<title>[^<]*<\/title>/gi, '')
    .replace(/<meta\s+(?:name|property)="(?:description|robots|og:[^"]+|twitter:[^"]+)"\s+content="[^"]*"\s*\/?\s*>/gi, '')
    .replace(/<link\s+rel="canonical"\s+href="[^"]*"\s*\/?\s*>/gi, '')
  html = html.replace(/<head(?:\s[^>]*)?>/i, match => `${match}\n${tags}\n`)
  writeFileSync(file, html)
}
apply(join(root, 'index.html'), head('Komunálne voľby v Bernolákove 2026 — BernoInfo 2026', 'Nezávislý prehľad komunálnych volieb v Bernolákove 2026: kandidáti na starostu a poslancov, volebné obvody a odkazy na zdroje.', '/'))
for (const candidate of mayor) {
  const office = shared.has(candidate.id) ? 'kandidát na starostu aj poslanca obecného zastupiteľstva' : 'kandidát na starostu obce'
  const title = `${candidate.name} — ${office} — BernoInfo 2026`
  const description = `Profil: ${candidate.name}, ${office} v Bernolákove 2026. Registrácia, dostupné podklady a odkazy na zdroje.`
  apply(join(root, 'kandidati', candidate.id, 'index.html'), head(title, description, `/kandidati/${candidate.id}/`))
}
for (const candidate of council) {
  const file = join(root, 'kandidati-na-poslancov', candidate.id, 'index.html')
  if (dual.has(candidate.id)) {
    const destination = `/kandidati/${dual.get(candidate.id)}/`
    apply(file, head('Presmerovanie na spoločný profil — BernoInfo 2026', `Spoločný profil kandidáta ${candidate.name} na starostu aj poslanca obecného zastupiteľstva.`, destination, { noindex: true, redirect: true }))
  } else {
    const title = `${candidate.name} — kandidát na poslanca obecného zastupiteľstva — BernoInfo 2026`
    const description = `Profil: ${candidate.name}, kandidát na poslanca obecného zastupiteľstva v Bernolákove 2026. Registrácia, dostupné podklady a odkazy na zdroje.`
    apply(file, head(title, description, `/kandidati-na-poslancov/${candidate.id}/`))
  }
}
apply(join(root, 'volby', 'ulice', 'index.html'), head('Ulice, obvody a okrsky — BernoInfo 2026', 'Textový zoznam ulíc Bernolákova s volebnými obvodmi, okrskami a miestnosťami podľa zverejnených podkladov obce.', '/volby/ulice/'))
apply(join(root, '404.html'), head('Stránka sa nenašla — BernoInfo 2026', 'Požadovaná stránka sa nenašla. Vráťte sa na prehľad komunálnych volieb v Bernolákove.', '/404.html', { noindex: true, redirect: true }))
console.log(`SEO metadata applied to ${mayor.length + council.length + 3} HTML pages (${mode}; ${origin || 'no origin'}).`)

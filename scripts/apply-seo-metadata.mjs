import { readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.argv[2] || 'dist'
const mode = process.env.SITE_BUILD_MODE || 'placeholder'
const productionOrigin = 'https://bernoinfo2026.mr-petermacko.workers.dev'
const pagesProductionOrigin = 'https://bernolakovo2026.pages.dev'
// Site-wide editorial snapshot date: the homepage includes an editorial update dated
// 21 October 2026. Keep this explicit; a CI build time is not a content update.
const editorialDate = '2026-10-21'
const ciBranch = process.env.WORKERS_CI_BRANCH || null
const pagesContext = Boolean(process.env.CF_PAGES || process.env.CF_PAGES_BRANCH || process.env.CF_PAGES_URL)
if (pagesContext) {
  if (process.env.CF_PAGES !== '1' || !process.env.CF_PAGES_BRANCH || !process.env.CF_PAGES_URL || ciBranch) {
    throw Error('Incomplete or conflicting Cloudflare Pages build context.')
  }
  if (!/^https:\/\/([a-z0-9-]+\.)?bernolakovo2026\.pages\.dev$/.test(process.env.CF_PAGES_URL)) {
    throw Error('CF_PAGES_URL must belong to the Bernolákovo Pages project.')
  }
  const pagesMain = process.env.CF_PAGES_BRANCH === 'main'
  const expectedOrigin = pagesMain ? pagesProductionOrigin : process.env.CF_PAGES_URL
  if (mode !== (pagesMain ? 'release' : 'preview') || (!pagesMain && expectedOrigin === pagesProductionOrigin)) {
    throw Error('Pages main must be a release and branch previews must remain noindex.')
  }
  if (process.env.SITE_ORIGIN !== expectedOrigin) {
    throw Error('SITE_ORIGIN conflicts with the expected Pages origin.')
  }
}
if (ciBranch && !/^[A-Za-z0-9][A-Za-z0-9._/-]*$/.test(ciBranch) && !process.env.SITE_ORIGIN) {
  throw Error('Unexpected WORKERS_CI_BRANCH; supply a verified SITE_ORIGIN or use a supported branch name.')
}
if (ciBranch && ciBranch !== 'main' && mode === 'release') {
  throw Error('Non-main Workers Builds must use preview mode and remain noindex.')
}
if (ciBranch === 'main' && mode !== 'release') {
  throw Error('Main Workers Build must use release mode after merge approval.')
}
let derivedOrigin = null
if (ciBranch === 'main') derivedOrigin = productionOrigin
else if (ciBranch && /^[A-Za-z0-9][A-Za-z0-9._/-]*$/.test(ciBranch)) {
  const slug = ciBranch.toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-|-$/g, '')
  if ((!slug || `${slug}-bernoinfo2026`.length > 63) && !process.env.SITE_ORIGIN) {
    throw Error('Preview branch alias is too long or invalid; supply SITE_ORIGIN for this preview.')
  }
  if (slug && `${slug}-bernoinfo2026`.length <= 63) derivedOrigin = `https://${slug}-bernoinfo2026.mr-petermacko.workers.dev`
}
const originInput = process.env.SITE_ORIGIN || derivedOrigin
if (mode === 'release' && !ciBranch && !pagesContext && (!originInput || process.env.RELEASE_ORIGIN_VERIFIED !== '1')) {
  throw Error('Local release metadata requires SITE_ORIGIN and RELEASE_ORIGIN_VERIFIED=1.')
}
if (mode === 'release' && ciBranch === 'main' && originInput !== productionOrigin) {
  throw Error('Main Workers Build must use the verified production origin.')
}
if (mode === 'release' && originInput !== (pagesContext ? pagesProductionOrigin : productionOrigin)) {
  throw Error('Release indexing requires the verified origin for this platform.')
}
if (mode !== 'release' && (originInput === productionOrigin || originInput === pagesProductionOrigin)) {
  throw Error('Preview must not claim the public release origin.')
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
  if (!redirect && path !== '/404.html') tags.push(meta('author', 'Peter Macko & OpenClaw'), meta('date', editorialDate))
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
    .replace(/<meta\s+(?:name|property)="(?:description|author|date|robots|og:[^"]+|twitter:[^"]+)"\s+content="[^"]*"\s*\/?\s*>/gi, '')
    .replace(/<link\s+rel="canonical"\s+href="[^"]*"\s*\/?\s*>/gi, '')
  html = html.replace(/<head(?:\s[^>]*)?>/i, match => `${match}\n${tags}\n`)
  writeFileSync(file, html)
}
const publicPaths = ['/']
apply(join(root, 'index.html'), head('Komunálne voľby v Bernolákove 2026 — BernoInfo 2026', 'Nezávislý prehľad komunálnych volieb v Bernolákove 2026: kandidáti na starostu a poslancov, volebné obvody a odkazy na zdroje.', '/'))
for (const candidate of mayor) {
  const office = shared.has(candidate.id) ? 'kandidatúra na starostu obce aj do obecného zastupiteľstva' : 'kandidatúra na starostu obce'
  const title = `${candidate.name} — ${office} — BernoInfo 2026`
  const description = `Profil: ${candidate.name} — ${office} v Bernolákove 2026. Registrácia, dostupné podklady a odkazy na zdroje.`
  const path = `/kandidati/${candidate.id}/`
  publicPaths.push(path)
  apply(join(root, 'kandidati', candidate.id, 'index.html'), head(title, description, path))
}
for (const candidate of council) {
  const file = join(root, 'kandidati-na-poslancov', candidate.id, 'index.html')
  if (dual.has(candidate.id)) {
    const destination = `/kandidati/${dual.get(candidate.id)}/`
    apply(file, head('Presmerovanie na spoločný profil — BernoInfo 2026', `Spoločný profil: ${candidate.name} — kandidatúra na starostu obce aj do obecného zastupiteľstva.`, destination, { noindex: true, redirect: true }))
  } else {
    const path = `/kandidati-na-poslancov/${candidate.id}/`
    publicPaths.push(path)
    const title = `${candidate.name} — kandidatúra do obecného zastupiteľstva — BernoInfo 2026`
    const description = `Profil: ${candidate.name} — kandidatúra do obecného zastupiteľstva v Bernolákove 2026. Registrácia, dostupné podklady a odkazy na zdroje.`
    apply(file, head(title, description, path))
  }
}
publicPaths.push('/volby/ulice/', '/o-projekte/')
apply(join(root, 'volby', 'ulice', 'index.html'), head('Ulice, obvody a okrsky — BernoInfo 2026', 'Textový zoznam ulíc Bernolákova s volebnými obvodmi, okrskami a miestnosťami podľa zverejnených podkladov obce.', '/volby/ulice/'))
apply(join(root, 'o-projekte', 'index.html'), head('O projekte — BernoInfo 2026', 'O projekte BernoInfo 2026, Petrovi Mackovi a nástrojoch použitých pri tvorbe stránky.', '/o-projekte/'))
apply(join(root, '404.html'), head('Stránka sa nenašla — BernoInfo 2026', 'Požadovaná stránka sa nenašla. Vráťte sa na prehľad komunálnych volieb v Bernolákove.', '/404.html', { noindex: true, redirect: true }))
if (mode === 'release') {
  writeFileSync(join(root, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${canonical('/sitemap.xml')}\n`)
  writeFileSync(join(root, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${publicPaths.map(path => `  <url><loc>${esc(canonical(path))}</loc></url>`).join('\n')}\n</urlset>\n`)
} else {
  writeFileSync(join(root, 'robots.txt'), 'User-agent: *\nDisallow: /\n')
  rmSync(join(root, 'sitemap.xml'), { force: true })
}
console.log(`SEO metadata applied to ${mayor.length + council.length + 4} HTML pages (${mode}; ${origin || 'no origin'}).`)

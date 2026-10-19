import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { createHash } from 'node:crypto'

// Preview-branch artifact only. Do not merge this build step or its review assets.
const roster = JSON.parse(readFileSync(new URL('../src/council-candidates.json', import.meta.url), 'utf8'))
const root = new URL('../dist/issue22-review/', import.meta.url)
const images = new URL('../dist/issue22-review/images/', import.meta.url)
const sourceImages = new URL('../preview-assets/candidates/', import.meta.url)
const photos = new Map([
  ['D1/14', {file:'miroslav-turenic-original.jpg', hash:'32ccc3856f16c75275e982d3a2fdfacb46558a61495a989da6c064d0cb55be21', url:'https://www.facebook.com/photo/?fbid=1645206470950417&set=a.235317941939284'}],
  ['D2/10', {file:'jaroslav-kostial-original.jpg', hash:'caf837f29544967ae5e647be05224693c2d966408d02e0d63b304196dd3d6752', url:'https://www.facebook.com/photo/?fbid=2717977855365231&set=a.1665486813947679'}],
  ['D3/1', {file:'michal-bartok-original.jpg', hash:'c370d6e1ec2298d3036e0c0723d36e20d02f8ad7833f1e99f3883c31837c17ba', url:'https://www.facebook.com/photo/?fbid=122101064715406989&set=a.122101064019406989'}],
  ['D3/3', {file:'martin-cirbus-original.jpg', hash:'39d8d265c42daf170dd242611737d9642355456dc0281f08ef6a6c32545347d5', url:'https://www.facebook.com/photo/?fbid=1184825287086661&set=a.108861341349733'}],
])
const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))
const candidates = roster.districts.flatMap(d => d.candidates.map(c => ({...c, district:d.number})))
if (candidates.length !== 44 || photos.size !== 4) throw Error('Unexpected review roster or photo count')
mkdirSync(images,{recursive:true})
for (const [key, photo] of photos) {
  if (!candidates.some(c => `D${c.district}/${c.listNumber}` === key)) throw Error(`Unknown photo key ${key}`)
  const source = new URL(photo.file, sourceImages)
  const actual = createHash('sha256').update(readFileSync(source)).digest('hex')
  if (actual !== photo.hash) throw Error(`Unexpected source bytes for ${key}`)
  copyFileSync(source, new URL(photo.file, images))
}
const cards = candidates.map(c => {
  const key = `D${c.district}/${c.listNumber}`
  const photo = photos.get(key)
  const portrait = photo
    ? `<img src="images/${photo.file}" alt="Neschválený obrázok na kontrolu pre ${esc(c.name)}" loading="lazy">`
    : '<span>Portrét zatiaľ nie je k dispozícii na kontrolu</span>'
  const provenance = photo
    ? `<p><a href="${esc(photo.url)}" target="_blank" rel="noopener noreferrer">Zdrojová stránka fotografie ↗</a>. Totožnosť účtu, autor/kredit a práva na finálne použitie nie sú doložené.${key === 'D3/3' ? ' Osobu na obrázku označil Peter pre kontrolnú ukážku; široký sezónny záber nie je čistý portrét.' : ''}</p>`
    : '<p>Bez doloženej zdrojovej stránky portrétu v čiastočnej rešerši; neznamená to, že fotografia neexistuje.</p>'
  return `<article class="card"><p class="flag">NEODSÚHLASENÉ — len na kontrolu</p><div class="portrait">${portrait}</div><div><p class="eyebrow">${key} · obvod ${c.district} · poradie ${c.listNumber}</p><h2>${esc(c.name)}</h2><p>Registrácia: <a href="/kandidati-na-poslancov/${c.id}/">profil podľa úradného zoznamu</a></p>${provenance}</div></article>`
}).join('\n')
const html = `<!doctype html><html lang="sk"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow,noarchive"><title>Kontrolná ukážka portrétov — BernoInfo 2026</title><style>
:root{font-family:system-ui,sans-serif;color:#172b3b;background:#edf2f4}*{box-sizing:border-box}body{margin:0}header{background:#182e43;color:white;padding:1.5rem max(1rem,calc((100vw - 80rem)/2))}h1{font-size:clamp(1.6rem,3vw,2.5rem)}main{max-width:80rem;margin:auto;padding:1rem}a{color:#114d77;overflow-wrap:anywhere}header a{color:#bce5ff}.banner,.flag{background:#ffe0a3;color:#452500;font-weight:800;padding:.55rem .8rem;border:2px solid #885000}.banner{font-size:1.25rem}.cards{display:grid;grid-auto-rows:1fr;gap:1rem}.card{display:grid;grid-template-columns:12rem 1fr;gap:1rem;background:white;border:1px solid #a7b7c2;border-radius:.5rem;padding:1rem}.card .flag{grid-column:1/-1;margin:0}.portrait{aspect-ratio:4/5;background:#dce5ea;border:2px dashed #7591a1;display:grid;place-items:center;text-align:center;padding:1rem;font-weight:700;overflow:hidden}.portrait img{display:block;width:100%;height:100%;object-fit:contain}.eyebrow{text-transform:uppercase;letter-spacing:.05em;color:#3a5262}h2{margin:.2rem 0}p{line-height:1.5}@media(max-width:650px){.card{grid-template-columns:1fr}.portrait{width:10rem}}a:focus-visible{outline:3px solid #a85900;outline-offset:3px}
</style></head><body><header><p class="banner">NEODSÚHLASENÉ — len na kontrolu</p><h1>44 kandidátov · kontrolná ukážka portrétov</h1><p>Verejne dostupná vývojová ukážka na kontrolu zdrojových obrázkov. Nie je to schválený zoznam portrétov ani finálna publikácia.</p></header><main><p><strong>Stav 19. 10. 2026:</strong> Štyri skôr získané obrázky zobrazené na kontrolu; 40 jednotných zástupných blokov. Facebook rešerš je čiastočná: 101/220 prvých segmentov pokusov meno × päť zdrojov, 0/220 dokončených hĺbkových kontrol. Žiadny z týchto portrétov nie je schválený pre finálne profily. Meno pri obrázku je podľa úradného zoznamu, nie dôkaz identity osoby na fotografii. Zdrojové stránky, identita účtu, autorstvo, práva a rovnaké vizuálne spracovanie čakajú na kontrolu.</p><div class="cards">${cards}</div></main></body></html>`
writeFileSync(join(root.pathname,'index.html'), html)
console.log('Built issue #22 public review: 44 cards, four unapproved source images')

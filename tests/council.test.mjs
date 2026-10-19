import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'

const data = JSON.parse(readFileSync('src/council-candidates.json','utf8'))
const ledger = readFileSync('docs/research/ISSUE20_COUNCIL_CANDIDATE_LEDGER_2026-10-19.md','utf8')
const homepage = readFileSync('index.html','utf8')
const rows = [...ledger.matchAll(/^\| (\d+) \| (.*?) \| (\d+) \| (.*?) \| (.*?) \| (.*?) \|$/gm)]
  .map((match) => ({number:Number(match[1]),name:match[2],age:Number(match[3]),occupation:match[4],designation:match[5]}))

test('44 official rows retain district counts, order and exact identity fields', () => {
  assert.equal(rows.length,44)
  assert.deepEqual(data.districts.map(d => [d.number,d.seats,d.candidates.length]),[[1,5,15],[2,5,19],[3,3,10]])
  let index = 0
  for (const district of data.districts) for (const candidate of district.candidates) {
    const row = rows[index++]
    assert.deepEqual([candidate.listNumber,candidate.name,candidate.age,candidate.occupation],[row.number,row.name,row.age,row.occupation])
  }
})

test('unique stable routes, generated pages and no-JS links cover all 44', () => {
  const ids = data.districts.flatMap(d => d.candidates.map(c => c.id))
  assert.equal(new Set(ids).size,44)
  for (const district of data.districts) for (const candidate of district.candidates) {
    assert.match(candidate.id,/^c-[0-9a-f]{8}$/)
    const path = `/kandidati-na-poslancov/${candidate.id}/`
    assert.ok(homepage.includes(`href="${path}"`),`No fallback link: ${path}`)
    const file = `public${path}index.html`
    assert.ok(existsSync(file),`No static page: ${file}`)
    const page = readFileSync(file,'utf8')
    assert.ok(page.includes(candidate.name),`No candidate name: ${path}`)
    assert.ok(page.includes(district.sourceUrl),`No district source: ${path}`)
    assert.ok(page.includes('poslancov obecného zastupiteľstva') || page.includes('obecné zastupiteľstvo'))
    assert.ok(page.includes('Nie je to nezávisle overené číslo na hlasovacom lístku.'))
  }
})

test('mayoral routes remain intact and council list follows mayoral list', () => {
  for (const id of ['bartok','cirbus','kandrac','kostial','lakota','rajter','sutka','turenic']) assert.ok(existsSync(`public/kandidati/${id}/index.html`))
  assert.ok(homepage.indexOf('<!-- council-fallback:start -->') > homepage.indexOf('<ol class="static-list">'))
  assert.ok(readFileSync('src/main.tsx','utf8').indexOf('className="council-section"') > readFileSync('src/main.tsx','utf8').indexOf('className="candidate-section"'))
})

test('office naming, fallback card mapping, parity and not-found page', () => {
  assert.ok(homepage.includes('<h1>Komunálne voľby v Bernolákove</h1>'))
  assert.ok(homepage.includes('<h2>Kandidáti na starostu obce</h2>'))
  assert.ok(homepage.includes('Kandidáti na poslancov obecného zastupiteľstva'))
  const section = homepage.split('<!-- council-fallback:start -->')[1].split('<!-- council-fallback:end -->')[0]
  assert.equal((section.match(/href="\/kandidati-na-poslancov\//g) || []).length,44)
  const keys = ['registration','occupation','functions','programme','interview','channels','sources']
  for (const district of data.districts) for (const candidate of district.candidates) {
    const page = readFileSync(`public/kandidati-na-poslancov/${candidate.id}/index.html`,'utf8')
    assert.ok(page.includes(`<h1>${candidate.name}<small class="office-label">Kandidatúra na poslanca obecného zastupiteľstva</small></h1>`))
    assert.deepEqual([...page.matchAll(/class="detail-section" aria-labelledby="([^"]+)"/g)].map(m=>m[1]),keys)
    assert.ok(page.includes('Späť na kandidátov na poslancov obecného zastupiteľstva'))
    assert.ok(page.includes('skontrolované 19. októbra 2026'))
    assert.ok(page.includes('datované 2. septembra 2026'))
  }
  assert.ok(existsSync('public/404.html'))
  assert.ok(readFileSync('public/404.html','utf8').includes('Stránka sa nenašla'))
})

// Independently transcribed from the three revised primary municipal PDFs on 19 Oct 2026.
// The researcher ledger intentionally abbreviates these coalition labels.
test('six primary-PDF designations are verbatim in data and both renderings', () => {
  const coalition = 'Demokrati, Kdh - kresťanskodemokratické hnutie, Sloboda a solidarita'
  const hlas = 'Hlas - sociálna demokracia, Smer - sociálna demokracia'
  const expected = new Map([
    ['Linda HORNÁ, Bc.',coalition], ['Iva PIPÍŠKOVÁ, Mgr.',coalition],
    ['Michal PELEŠ, Ing.',coalition], ['Ondrej ĎURAJ, JUDr.',coalition],
    ['Miroslav MICHELÍK, Ing.',coalition], ['Miroslav SLIVKA, Ing.',hlas],
  ])
  for (const district of data.districts) for (const candidate of district.candidates) {
    if (!expected.has(candidate.name)) continue
    const designation = expected.get(candidate.name)
    assert.equal(candidate.designation,designation)
    assert.ok(homepage.includes(designation))
    assert.ok(readFileSync(`public/kandidati-na-poslancov/${candidate.id}/index.html`,'utf8').includes(designation))
    expected.delete(candidate.name)
  }
  assert.equal(expected.size,0)
})

test('both homepage modes show designation and office-scoped source context', () => {
  const fallback = homepage.split('<!-- council-fallback:start -->')[1].split('<!-- council-fallback:end -->')[0]
  assert.equal((fallback.match(/class="council-designation"/g) || []).length,44)
  assert.ok(!fallback.includes('13 mandáty'))
  assert.ok(fallback.includes('3 mandáty'))
  assert.ok(homepage.includes('<strong>Kandidáti na starostu obce:</strong>'))
  assert.ok(homepage.includes('<strong>Kandidáti na poslancov obecného zastupiteľstva:</strong>'))
  const main = readFileSync('src/main.tsx','utf8')
  assert.ok(main.includes('className="council-designation"'))
  assert.ok(main.includes('<strong>Kandidáti na poslancov obecného zastupiteľstva:</strong>'))
})

test('Peter-identified entity URLs are exact ledger links on 21 matching pages only', () => {
  const issue22 = readFileSync('docs/research/ISSUE22_COUNCIL_FB_PORTRAIT_DISCOVERY_2026-10-19.md','utf8')
  const links = JSON.parse(readFileSync('src/council-entity-links.json','utf8'))
  const rows = issue22.split('\n').filter(line => /^\| D[123]\/\d+ /.test(line))
  const expected = new Map()
  for (const line of rows) {
    const cells = line.split('|').slice(1,-1).map(x => x.trim())
    const url = cells[2].match(/\]\((https:\/\/www\.facebook\.com\/[^)]+)\)/)?.[1]
    if (url) expected.set(cells[0].split(' ')[0],url)
  }
  assert.equal(rows.length,44)
  assert.equal(expected.size,21)
  assert.deepEqual(links.urls,Object.fromEntries(expected))
  for (const district of data.districts) for (const candidate of district.candidates) {
    const key = `D${district.number}/${candidate.listNumber}`
    const page = readFileSync(`public/kandidati-na-poslancov/${candidate.id}/index.html`,'utf8')
    const url = expected.get(key)
    assert.equal(page.includes('Facebookový odkaz označený Petrom'),Boolean(url),key)
    if (url) {
      assert.ok(page.includes(`href="${url.replaceAll('&','&amp;')}"`),key)
      assert.ok(page.includes('Peter priradil tento odkaz ku kandidátovi 19. októbra 2026.'),key)
      assert.ok(page.includes('neboli nezávisle overené'),key)
    }
    assert.ok(!page.includes('facebook.com/search/'),key)
    assert.ok(!page.includes('facebook.com/groups/'),key)
  }
})

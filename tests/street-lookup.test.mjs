import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { build } from 'esbuild'

const data = JSON.parse(readFileSync(new URL('../src/street-precincts.json', import.meta.url)))
const html = readFileSync(new URL('../public/volby/ulice/index.html', import.meta.url), 'utf8')
const bundled = await build({ entryPoints: [new URL('../src/street-lookup.ts', import.meta.url).pathname], bundle: true, platform: 'node', format: 'esm', write: false })
const { findStreet, normalizeStreet, suggestStreets, venues } = await import(`data:text/javascript;base64,${Buffer.from(bundled.outputFiles[0].text).toString('base64')}`)

test('all 123 official streets resolve uniquely to a district, precinct and venue', () => {
  assert.equal(data.length, 123)
  assert.deepEqual([1,2,3].map(d => data.filter(row => row.district === d).length), [41,47,35])
  assert.deepEqual([1,2,3,4,5,6,7,8].map(p => data.filter(row => row.precinct === p).length), [7,13,21,21,8,18,18,17])
  assert.equal(new Set(data.map(row => normalizeStreet(row.street))).size, 123)
  for (const row of data) {
    assert.deepEqual(findStreet(row.street), row)
    assert.ok(venues[row.precinct])
    assert.equal(row.district, row.precinct <= 3 ? 1 : row.precinct <= 6 ? 2 : 3)
    assert.ok(html.includes(`<li>${row.street}</li>`))
  }
})

test('normalization is exact, accent/case/suffix tolerant but never fuzzy', () => {
  assert.deepEqual(findStreet('  UL. skolska  '), data.find(row => row.street === 'Školská'))
  assert.deepEqual(findStreet('ĽALIOVÁ ulica'), data.find(row => row.street === 'Ľaliová'))
  assert.equal(findStreet('Hlavn'), null)
  assert.equal(findStreet('Neexistujúca'), null)
  assert.equal(findStreet(''), null)
})

test('district 2 venue depends on street-level precinct and discrepancy stays visible', () => {
  assert.match(venues[4], /Základná škola, Školská 1/)
  assert.match(venues[5], /Základná škola, Školská 1/)
  assert.match(venues[6], /Kultúrny dom, Hlavná 107/)
  assert.equal(findStreet('Hlavná')?.precinct, 5)
  assert.equal(findStreet('Sacky')?.precinct, 6)
  assert.equal(findStreet('Záhradkárska oblasť (pri Trnavskej)')?.precinct, 8)
  assert.equal(findStreet('Záhradkárska oblasť'), null)
  assert.match(html, /Záhradkárska oblasť \(pri Trnavskej\)/)
  assert.match(html, /júnové uznesenie uvádza skrátené/)
})

test('homepage no-JS fallback links to directory and exact district anchors', () => {
  const home = readFileSync(new URL('../index.html', import.meta.url), 'utf8')
  assert.match(home, /href="\/volby\/ulice\/"/)
  for (const d of [1,2,3]) assert.match(home, new RegExp(`id="district-${d}"`))
})

test('partial suggestions include middle substrings, all rows for empty input, and no unknown rows', () => {
  assert.equal(suggestStreets('').length, 123)
  assert.ok(suggestStreets('lav').some(row => row.street === 'Hlavná'))
  assert.ok(suggestStreets('UL. SKOL').some(row => row.street === 'Školská'))
  assert.deepEqual(suggestStreets('unlikely-street-name'), [])
  assert.equal(findStreet('lav'), null)
})

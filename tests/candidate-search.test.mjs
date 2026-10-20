import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { build } from 'esbuild'

const bundled = await build({ entryPoints: [new URL('../src/candidate-search.ts', import.meta.url).pathname], bundle: true, platform: 'node', format: 'esm', write: false, define: { 'import.meta.env.VITE_PRIVATE_PORTRAIT_PREVIEW': '"0"' } })
const { searchPeople, normalizeCandidateName, suggestCandidates, resolveCandidate } = await import(`data:text/javascript;base64,${Buffer.from(bundled.outputFiles[0].text).toString('base64')}`)
const council = JSON.parse(readFileSync(new URL('../src/council-candidates.json', import.meta.url)))
const home = readFileSync(new URL('../index.html', import.meta.url), 'utf8')

test('48 distinct linked people use only existing roster routes; four dual-office people have one mayoral route', () => {
  assert.equal(council.districts.flatMap(row => row.candidates).length, 44)
  assert.equal(searchPeople.length, 48)
  assert.equal(new Set(searchPeople.map(row => row.id)).size, 48)
  for (const row of searchPeople) {
    assert.match(row.route, /^\/kandidati(?:-na-poslancov)?\/[\w-]+\/$/)
    assert.ok(home.includes(`href="${row.route}"`), row.route)
  }
  for (const [name, route] of [['Michal Bartok','bartok'], ['Martin Cirbus','cirbus'], ['Jaroslav Kostial','kostial'], ['Miroslav Turenic','turenic']]) {
    assert.equal(resolveCandidate(name).person?.route, `/kandidati/${route}/`)
    assert.equal(suggestCandidates(name).length, 1)
  }
})

test('case, diacritics, academic titles and whitespace do not alter exact-name navigation', () => {
  assert.equal(normalizeCandidateName('  JUDr. Ing. MICHAL BARTÓK  '), 'michal bartok')
  assert.equal(resolveCandidate('  michal bartok ').person?.route, '/kandidati/bartok/')
  assert.equal(resolveCandidate('Jaroslav Kostial, Ing.').person?.route, '/kandidati/kostial/')
  assert.equal(resolveCandidate('MARTINA BRUNEL').person?.route, '/kandidati-na-poslancov/c-baf5b906/')
  assert.equal(resolveCandidate('Martina BRUNEL, Ing.').kind, 'unique')
})

test('partial, ambiguous, empty and unknown inputs cannot silently navigate', () => {
  assert.equal(resolveCandidate('').kind, 'empty')
  assert.equal(resolveCandidate('not a candidate').kind, 'not-found')
  assert.equal(resolveCandidate('peter').kind, 'ambiguous')
  assert.ok(resolveCandidate('peter').matches.length > 1)
  assert.equal(resolveCandidate('bart').kind, 'partial')
  assert.equal(resolveCandidate('bart').person, undefined)
  assert.equal(suggestCandidates('MICHAL').filter(row => row.id === 'bartok').length, 1)
  assert.deepEqual(suggestCandidates('zzzzzz'), [])
})

test('no-JS fallback retains complete linked mayoral and council rosters', () => {
  assert.match(home, /<noscript>/)
  assert.equal((home.match(/<li><a href="\/kandidati\//g) ?? []).length, 12)
  assert.equal((home.match(/<li><a href="\/kandidati-na-poslancov\//g) ?? []).length, 40)
  assert.match(home, /href="\/volby\/ulice\/"/)
})

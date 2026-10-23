import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import test from 'node:test'

const read = path => readFileSync(new URL(path, import.meta.url), 'utf8')
const candidates = JSON.parse(read('../src/candidate-details.json')).candidates
const generalUrl = 'https://volby.transparency.sk/samosprava2026/vyhladavanie/bernolakovo'

test('eight generated profiles have one equal-placement election-finance link each', () => {
  assert.equal(candidates.length, 8)
  for (const candidate of candidates) {
    const html = read(`../public/kandidati/${candidate.id}/index.html`)
    const section = html.match(/<section class="detail-section" aria-labelledby="transparency">[\s\S]*?<\/section>/)?.[0]
    assert.ok(section, candidate.id)
    assert.equal(section.split(`href="${candidate.transparencyProfile}"`).length - 1, 2, candidate.id)
    assert.match(section, /obsah profilu nebol nezávisle overený/)
  }
})

test('homepage modes link municipality search; superseded Turenič association is replaced', () => {
  assert.ok(read('../src/main.tsx').includes(generalUrl))
  assert.ok(read('../index.html').includes(generalUrl))
  const generator = read('../scripts/generate-candidate-pages.mjs')
  assert.match(generator, /\.\.\.renderTurenicAssociation\(candidate\)/)
  assert.match(generator, /www\.turenic\.sk\/moj-tim\//)
  const team = JSON.parse(read('../src/turenic-team.json'))
  assert.equal(team.council.length, 7)
  const connections = read('../src/connections.ts')
  assert.match(connections, /controlLabel: 'Tím Turenič'/)
  assert.doesNotMatch(connections, /members: \['c-bb232e32', \.\.\.kdhSasIds\]/)
})

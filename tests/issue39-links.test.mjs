import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const data = JSON.parse(readFileSync(new URL('../src/candidate-details.json', import.meta.url), 'utf8'))
const home = readFileSync(new URL('../src/main.tsx', import.meta.url), 'utf8')

test('all eight profiles retain equal top channel slots and a 10 otázok resource slot', () => {
  assert.equal(data.candidates.length, 8)
  for (const candidate of data.candidates) {
    const html = readFileSync(new URL(`../public/kandidati/${candidate.id}/index.html`, import.meta.url), 'utf8')
    assert.match(html, /class="hero-channels"/)
    assert.equal((html.match(/class="hero-channel-unavailable"|class="hero-channels"/g) || []).length >= 1, true)
    for (const label of ['Web', 'Facebook', 'Instagram']) assert.match(html, new RegExp(`${label}`))
    assert.match(html, /id="ten-questions"/)
    assert.match(html, /id="channels"/)
    for (const field of ['website', 'facebook', 'instagram', 'tenQuestions']) {
      if (candidate[field]) assert.ok(html.includes(candidate[field].replaceAll('&', '&amp;')), `${candidate.id}: ${field}`)
    }
  }
  assert.equal(data.candidates.filter(c => c.tenQuestions).length, 7)
  assert.match(readFileSync(new URL('../public/kandidati/sutka/index.html', import.meta.url), 'utf8'), /V dodanej sade nebol odkaz/)
})

test('homepage links the supplied resources without claiming their contents', () => {
  assert.match(home, /EFM4W0tnZgE/)
  assert.match(home, /1038637972532175/)
  assert.match(home, /Účasť jednotlivých kandidátov ani obsah vystúpení tu nevyhodnocujeme/)
})

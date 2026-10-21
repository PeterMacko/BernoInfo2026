import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const data = JSON.parse(readFileSync(new URL('../src/candidate-details.json', import.meta.url), 'utf8'))
const home = readFileSync(new URL('../src/main.tsx', import.meta.url), 'utf8')

test('all eight profiles show only recorded channels and keep the 10 otázok resource slot', () => {
  assert.equal(data.candidates.length, 8)
  for (const candidate of data.candidates) {
    const html = readFileSync(new URL(`../public/kandidati/${candidate.id}/index.html`, import.meta.url), 'utf8')
    const top = html.match(/<div class="hero-channels"[\s\S]*?<\/div>/)?.[0]
    const details = html.match(/<section class="detail-section" aria-labelledby="channels">[\s\S]*?<\/section>/)?.[0]
    assert.ok(top && details, `${candidate.id}: channel sections`)
    assert.doesNotMatch(top, /hero-channel-unavailable|odkaz nezistený/)
    assert.doesNotMatch(details, /class="empty"|odkaz nezistený/)
    const labels = {website: ['Web', 'Web kandidáta'], facebook: ['Facebook', 'Facebook'], instagram: ['Instagram', 'Instagram']}
    for (const [field, [topLabel, detailLabel]] of Object.entries(labels)) {
      const topLink = new RegExp(`aria-label="${topLabel} — `)
      const detailHeading = new RegExp(`<h3>${detailLabel}</h3>`)
      if (candidate[field]) {
        assert.match(top, topLink, `${candidate.id}: ${field} top link`)
        assert.match(details, detailHeading, `${candidate.id}: ${field} detail`)
        assert.ok(top.includes(`href="${candidate[field]}"`), `${candidate.id}: ${field} top URL`)
        assert.ok(details.includes(`href="${candidate[field]}"`), `${candidate.id}: ${field} detail URL`)
      } else {
        assert.doesNotMatch(top, topLink, `${candidate.id}: ${field} top omitted`)
        assert.doesNotMatch(details, detailHeading, `${candidate.id}: ${field} detail omitted`)
      }
    }
    assert.doesNotMatch(html, /id="companies"|Firemné funkcie/)
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

import {test} from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {join} from 'node:path'
import roster from '../src/council-candidates.json' with {type:'json'}

test('all council pages omit programme proposals and keep external links in new tabs', () => {
  const candidates = roster.districts.flatMap(district => district.candidates)
  assert.equal(candidates.length, 44)
  for (const {id} of candidates) {
    const html = readFileSync(join('public/kandidati-na-poslancov', id, 'index.html'), 'utf8')
    assert.doesNotMatch(html, /id="programme"|Programové návrhy/, id)
    for (const anchor of html.matchAll(/<a\s+([^>]+)>/g)) {
      const attributes = anchor[1]
      const href = attributes.match(/\bhref="([^"]+)"/)?.[1]
      assert.ok(href, `${id}: missing href`)
      if (/^https?:\/\//i.test(href)) {
        assert.match(attributes, /\btarget="_blank"/, `${id}: ${href}`)
        assert.match(attributes, /\brel="noopener noreferrer"/, `${id}: ${href}`)
      } else {
        assert.doesNotMatch(attributes, /\btarget="_blank"/, `${id}: ${href}`)
      }
    }
  }
  const roman = readFileSync('public/kandidati-na-poslancov/c-df02bb77/index.html', 'utf8')
  assert.match(roman, /https:\/\/www\.facebook\.com\/RomanFialaBernolakovo/)
  assert.match(roman, /\/images\/council\/c-df02bb77\.jpg/)
})

test('the no-JavaScript council list opens official PDFs in new tabs', () => {
  const html = readFileSync('index.html', 'utf8')
  const council = html.split('<!-- council-fallback:start -->')[1]?.split('<!-- council-fallback:end -->')[0]
  assert.ok(council)
  for (const anchor of council.matchAll(/<a\s+([^>]+)>/g)) {
    const attributes = anchor[1]
    if (/\bhref="https?:\/\//.test(attributes)) {
      assert.match(attributes, /\btarget="_blank"/)
      assert.match(attributes, /\brel="noopener noreferrer"/)
    } else assert.doesNotMatch(attributes, /\btarget="_blank"/)
  }
})

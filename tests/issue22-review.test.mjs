import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { execFileSync } from 'node:child_process'

const reviewPath = '.private/issue22-review/index.html'
const roster = JSON.parse(readFileSync('src/council-candidates.json','utf8'))

test('private review reconciles all 44 registrations and confines four source images to local review', () => {
  execFileSync(process.execPath,['scripts/generate-issue22-local-review.mjs'])
  const html = readFileSync(reviewPath,'utf8')
  const names = roster.districts.flatMap(d => d.candidates.map(c => c.name))
  assert.equal(names.length,44)
  assert.equal((html.match(/class="card"/g) || []).length,44)
  assert.equal((html.match(/class="portrait"/g) || []).length,44)
  assert.equal((html.match(/class="flag"/g) || []).length,44)
  assert.ok(html.includes('101/220 pokusov'))
  assert.ok(html.includes('119/220 zatiaľ bez pokusu'))
  for (const district of roster.districts) for (const candidate of district.candidates) {
    assert.ok(html.includes(candidate.name),candidate.name)
    assert.ok(html.includes(district.sourceUrl),candidate.name)
    const publicPage = readFileSync(`public/kandidati-na-poslancov/${candidate.id}/index.html`,'utf8')
    assert.ok(publicPage.includes('Informácie o facebookových kanáloch a portrétoch nie sú odsúhlasené.'))
    assert.ok(!publicPage.includes('facebook.com/'))
    assert.ok(!publicPage.includes('/images/candidates/'))
  }
  for (const id of ['D1/14','D2/10','D3/1','D3/3']) assert.ok(html.includes(id))
  assert.equal((html.match(/Zdrojová stránka fotografie/g) || []).length,4)
  const files = ['miroslav-turenic-original.jpg','jaroslav-kostial-original.jpg','michal-bartok-original.jpg','martin-cirbus-owner-confirmed.jpg']
  const available = files.filter(file => existsSync(`.private/portrait-originals/${file}`))
  assert.equal((html.match(/<img /g) || []).length,available.length)
  for (const file of files) {
    assert.equal(html.includes(`images/${file}`),available.includes(file))
    assert.equal(existsSync(`.private/issue22-review/images/${file}`),available.includes(file))
  }
  assert.ok(!html.includes('preview-assets/'))
  assert.ok(!html.includes('images/candidates/'))
  assert.ok(existsSync(reviewPath))
})

test('ordinary build keeps review and original-photo files out of dist', () => {
  const packageJson = JSON.parse(readFileSync('package.json','utf8'))
  assert.equal(packageJson.scripts.build,'npm run build:placeholder')
  for (const path of ['public/issue22-review','public/images/candidates','dist/issue22-review','dist/images/candidates']) assert.ok(!existsSync(path),path)
  const generator = readFileSync('scripts/generate-issue22-local-review.mjs','utf8')
  assert.ok(generator.includes("../.private/issue22-review/"))
  assert.ok(!generator.includes('writeFileSync(join(root'))
})

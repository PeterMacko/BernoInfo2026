import test from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readFileSync, statSync } from 'node:fs'

const mayor = JSON.parse(readFileSync('src/candidate-details.json')).candidates
const council = JSON.parse(readFileSync('src/council-candidates.json')).districts.flatMap(d => d.candidates)
const dual = {'c-f6b4af6c':'bartok','c-a4b1db7c':'cirbus','c-307ca828':'kostial','c-bb232e32':'turenic'}
const read = path => readFileSync(`dist${path}index.html`, 'utf8').split('</head>')[0]
const tags = html => [...html.matchAll(/<(?:meta|link)\s+[^>]+>/g)].map(x => x[0])
const attr = (tag, name) => tag.match(new RegExp(`\\b${name}="([^"]*)"`))?.[1]
const value = (html, key, kind='name') => {
  const matches = tags(html).filter(t => attr(t,kind) === key)
  assert.equal(matches.length,1,`${key} must occur once`)
  return attr(matches[0],'content')
}
const canonical = html => {
  const matches = tags(html).filter(t => attr(t,'rel') === 'canonical')
  assert.equal(matches.length,1,'canonical must occur once')
  return attr(matches[0],'href')
}
function publicPage(path, name, origin, preview) {
  const html = read(path)
  assert.equal([...html.matchAll(/<title>/g)].length,1,path)
  assert.ok(html.includes(name),path)
  assert.ok(value(html,'description').length > 60,path)
  assert.equal(canonical(html),origin+path)
  for(const key of ['og:title','og:description','og:type','og:url','og:site_name','og:locale','og:image','og:image:alt']) value(html,key,'property')
  for(const key of ['twitter:card','twitter:title','twitter:description','twitter:image','twitter:image:alt']) value(html,key)
  assert.equal(value(html,'og:url','property'),origin+path)
  assert.equal(value(html,'og:image','property'),origin+'/images/bernoinfo-social.png')
  assert.equal(value(html,'twitter:image'),origin+'/images/bernoinfo-social.png')
  assert.equal(value(html,'og:locale','property'),'sk_SK')
  assert.equal(value(html,'twitter:card'),'summary_large_image')
  assert.equal(html.includes('name="robots"'),preview,path)
}

test('preview and release initial HTML cover all public routes and suppress non-public cards',()=>{
  const preview='https://preview.example.org', release='https://release.example.org'
  const image=readFileSync('public/images/bernoinfo-social.png')
  assert.equal(image.toString('ascii',1,4),'PNG')
  assert.equal(image.readUInt32BE(16),1200)
  assert.equal(image.readUInt32BE(20),630)
  assert.ok(statSync('public/images/bernoinfo-social.png').size < 5_000_000)
  execFileSync('npm',['run','build:placeholder'],{stdio:'pipe',env:{...process.env,SITE_ORIGIN:preview}})
  publicPage('/','Komunálne voľby',preview,true)
  publicPage('/kandidati/bartok/','Michal BARTÓK',preview,true)
  assert.ok(!read('/kandidati/bartok/').includes(release))
  execFileSync('npm',['run','build:photo-review'],{stdio:'pipe',env:{...process.env,SITE_ORIGIN:preview}})
  const reviewHead=read('/kandidati/bartok/')
  assert.ok(reviewHead.includes('name="robots"'))
  assert.ok(!reviewHead.includes('property="og:'))
  assert.ok(!reviewHead.includes('name="twitter:'))
  assert.throws(()=>execFileSync('node',['scripts/apply-seo-metadata.mjs','dist'],{stdio:'pipe',env:{...process.env,SITE_BUILD_MODE:'release',SITE_ORIGIN:release,RELEASE_ORIGIN_VERIFIED:'0'}}))
  execFileSync('npm',['run','build'],{stdio:'pipe',env:{...process.env,SITE_ORIGIN:release,RELEASE_ORIGIN_VERIFIED:'1'}})
  publicPage('/','Komunálne voľby',release,false)
  for(const c of mayor) {
    const html=read(`/kandidati/${c.id}/`)
    publicPage(`/kandidati/${c.id}/`,c.name,release,false)
    assert.equal(html.includes('starostu aj poslanca'),Object.values(dual).includes(c.id),c.id)
  }
  for(const c of council) {
    const path=`/kandidati-na-poslancov/${c.id}/`
    const html=read(path)
    if(dual[c.id]) {
      assert.equal(canonical(html),release+`/kandidati/${dual[c.id]}/`)
      assert.ok(html.includes('name="robots"'))
      assert.ok(!html.includes('property="og:'))
      assert.ok(!html.includes('name="twitter:'))
    } else publicPage(path,c.name,release,false)
  }
  publicPage('/volby/ulice/','Ulice, obvody a okrsky',release,false)
  const notFound=readFileSync('dist/404.html','utf8').split('</head>')[0]
  assert.ok(notFound.includes('name="robots"'))
  assert.ok(!notFound.includes('rel="canonical"'))
  assert.ok(!notFound.includes('property="og:'))
  assert.ok(!notFound.includes('name="twitter:'))
  assert.ok(statSync('dist/images/bernoinfo-social.png').size > 0)
})

import test from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, statSync } from 'node:fs'

const testEnv = {...process.env}
for (const key of ['CF_PAGES', 'CF_PAGES_BRANCH', 'CF_PAGES_URL', 'WORKERS_CI_BRANCH', 'SITE_ORIGIN', 'RELEASE_ORIGIN_VERIFIED', 'SITE_BUILD_MODE', 'VITE_SITE_BUILD_MODE']) delete testEnv[key]

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
  assert.equal(value(html,'author'),'Peter Macko &amp; OpenClaw')
  assert.equal(value(html,'date'),'2026-10-21')
  assert.equal(html.includes('name="robots"'),preview,path)
  if (preview) assert.equal(value(html,'robots'),'noindex, nofollow')
}

const productionOrigin='https://bernoinfo2026.mr-petermacko.workers.dev'
const canonicalPaths=['/',...mayor.map(c=>`/kandidati/${c.id}/`),
  ...council.filter(c=>!dual[c.id]).map(c=>`/kandidati-na-poslancov/${c.id}/`),
  '/volby/ulice/','/o-projekte/']
assert.equal(canonicalPaths.length,51,'expected canonical route count')
function checkCrawlPolicy(release) {
  const robots=readFileSync('dist/robots.txt','utf8')
  if (release) {
    assert.equal(robots,`User-agent: *\nAllow: /\nSitemap: ${productionOrigin}/sitemap.xml\n`)
    const sitemap=readFileSync('dist/sitemap.xml','utf8')
    const locations=[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1])
    assert.equal(locations.length,canonicalPaths.length)
    assert.deepEqual(new Set(locations),new Set(canonicalPaths.map(path=>productionOrigin+path)))
    assert.equal(new Set(locations).size,locations.length)
    assert.ok(!sitemap.includes('<lastmod>'),'per-page modification dates are not tracked')
    assert.ok(!sitemap.includes('/404.html'))
    for(const id of Object.keys(dual)) assert.ok(!sitemap.includes(id))
  } else {
    assert.equal(robots,'User-agent: *\nDisallow: /\n')
    assert.equal(existsSync('dist/sitemap.xml'),false)
  }
}

test('preview and release initial HTML cover all public routes and suppress non-public cards',()=>{
  const preview='https://preview.example.org', release=productionOrigin
  const image=readFileSync('public/images/bernoinfo-social.png')
  assert.equal(image.toString('ascii',1,4),'PNG')
  assert.equal(image.readUInt32BE(16),1200)
  assert.equal(image.readUInt32BE(20),630)
  assert.ok(statSync('public/images/bernoinfo-social.png').size < 5_000_000)
  execFileSync('npm',['run','build:placeholder'],{stdio:'pipe',env:{...testEnv,WORKERS_CI_BRANCH:'',SITE_ORIGIN:preview}})
  publicPage('/','Komunálne voľby',preview,true)
  checkCrawlPolicy(false)
  publicPage('/kandidati/bartok/','Michal BARTÓK',preview,true)
  assert.ok(!read('/kandidati/bartok/').includes(release))
  execFileSync('npm',['run','build:photo-review'],{stdio:'pipe',env:{...testEnv,WORKERS_CI_BRANCH:'',SITE_ORIGIN:preview}})
  const reviewHead=read('/kandidati/bartok/')
  assert.ok(reviewHead.includes('name="robots"'))
  assert.ok(!reviewHead.includes('property="og:'))
  assert.ok(!reviewHead.includes('name="twitter:'))
  checkCrawlPolicy(false)
  assert.throws(()=>execFileSync('node',['scripts/apply-seo-metadata.mjs','dist'],{stdio:'pipe',env:{...testEnv,WORKERS_CI_BRANCH:'',SITE_BUILD_MODE:'release',SITE_ORIGIN:release,RELEASE_ORIGIN_VERIFIED:'0'}}))
  assert.throws(()=>execFileSync('node',['scripts/apply-seo-metadata.mjs','dist'],{stdio:'pipe',env:{...testEnv,WORKERS_CI_BRANCH:'',SITE_BUILD_MODE:'release',SITE_ORIGIN:'https://other.example.org',RELEASE_ORIGIN_VERIFIED:'1'}}))
  execFileSync('npm',['run','build'],{stdio:'pipe',env:{...testEnv,WORKERS_CI_BRANCH:'',SITE_ORIGIN:release,RELEASE_ORIGIN_VERIFIED:'1'}})
  publicPage('/','Komunálne voľby',release,false)
  checkCrawlPolicy(true)
  for(const c of mayor) {
    const html=read(`/kandidati/${c.id}/`)
    publicPage(`/kandidati/${c.id}/`,c.name,release,false)
    assert.equal(html.includes('kandidatúra na starostu obce aj do obecného zastupiteľstva'),Object.values(dual).includes(c.id),c.id)
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
  for (const name of ['Adéla ÁLLÓ FERANCOVÁ', 'Martina BRUNEL, Ing.']) {
    const candidate = council.find(c => c.name === name)
    assert.ok(candidate, `Missing reviewed council name: ${name}`)
    const html = read(`/kandidati-na-poslancov/${candidate.id}/`)
    assert.ok(html.includes(`<title>${name} — kandidatúra do obecného zastupiteľstva — BernoInfo 2026</title>`))
    assert.match(value(html,'description'),/kandidatúra do obecného zastupiteľstva/)
    assert.match(value(html,'og:description','property'),/kandidatúra do obecného zastupiteľstva/)
    assert.doesNotMatch(html,/kandidát na poslanca/)
  }
  publicPage('/volby/ulice/','Ulice, obvody a okrsky',release,false)
  publicPage('/o-projekte/','O projekte',release,false)
  const notFound=readFileSync('dist/404.html','utf8').split('</head>')[0]
  assert.ok(notFound.includes('name="robots"'))
  assert.ok(!notFound.includes('rel="canonical"'))
  assert.ok(!notFound.includes('property="og:'))
  assert.ok(!notFound.includes('name="twitter:'))
  assert.ok(!notFound.includes('name="author"'))
  assert.ok(!notFound.includes('name="date"'))
  assert.ok(statSync('dist/images/bernoinfo-social.png').size > 0)
  const branch='developer/issue-35-seo-metadata'
  const branchOrigin='https://developer-issue-35-seo-metadata-bernoinfo2026.mr-petermacko.workers.dev'
  execFileSync('npm',['run','build'],{stdio:'pipe',env:{...testEnv,WORKERS_CI_BRANCH:branch,SITE_ORIGIN:'',RELEASE_ORIGIN_VERIFIED:''}})
  publicPage('/','Komunálne voľby',branchOrigin,true)
  checkCrawlPolicy(false)
  publicPage('/kandidati/bartok/','Michal BARTÓK',branchOrigin,true)
  assert.ok(!read('/').includes('https://bernoinfo2026.mr-petermacko.workers.dev'))
  assert.throws(()=>execFileSync('node',['scripts/apply-seo-metadata.mjs','dist'],{stdio:'pipe',env:{...testEnv,WORKERS_CI_BRANCH:branch,SITE_BUILD_MODE:'preview',SITE_ORIGIN:'https://bernoinfo2026.mr-petermacko.workers.dev'}}))
  execFileSync('npm',['run','build'],{stdio:'pipe',env:{...testEnv,WORKERS_CI_BRANCH:'main',SITE_ORIGIN:'',RELEASE_ORIGIN_VERIFIED:''}})
  publicPage('/','Komunálne voľby',productionOrigin,false)
  checkCrawlPolicy(true)
  assert.throws(()=>execFileSync('node',['scripts/apply-seo-metadata.mjs','dist'],{stdio:'pipe',env:{...testEnv,WORKERS_CI_BRANCH:'main',SITE_BUILD_MODE:'release',SITE_ORIGIN:'https://wrong.example.org'}}))

  const pagesOrigin='https://abc123.bernoinfo-pages.pages.dev'
  const pagesEnv={...testEnv,WORKERS_CI_BRANCH:'',CF_PAGES:'1',CF_PAGES_BRANCH:'main',CF_PAGES_URL:pagesOrigin,SITE_ORIGIN:'',RELEASE_ORIGIN_VERIFIED:''}
  execFileSync('npm',['run','build'],{stdio:'pipe',env:{...pagesEnv,CF_PAGES_BRANCH:'developer/issue-37-pages-workers'}})
  publicPage('/','Komunálne voľby',pagesOrigin,true)
  checkCrawlPolicy(false)
  execFileSync('npm',['run','build'],{stdio:'pipe',env:pagesEnv})
  publicPage('/','Komunálne voľby',pagesOrigin,true)
  publicPage('/kandidati/bartok/','Michal BARTÓK',pagesOrigin,true)
  checkCrawlPolicy(false)
  assert.ok(!read('/').includes('https://bernoinfo2026.mr-petermacko.workers.dev'))
  assert.throws(()=>execFileSync('node',['scripts/apply-seo-metadata.mjs','dist'],{stdio:'pipe',env:{...pagesEnv,SITE_BUILD_MODE:'release',SITE_ORIGIN:pagesOrigin}}))
  assert.throws(()=>execFileSync('npm',['run','build'],{stdio:'pipe',env:{...pagesEnv,CF_PAGES_URL:''}}))
  assert.throws(()=>execFileSync('npm',['run','build'],{stdio:'pipe',env:{...pagesEnv,WORKERS_CI_BRANCH:'main'}}))
  assert.throws(()=>execFileSync('npm',['run','build'],{stdio:'pipe',env:{...pagesEnv,SITE_ORIGIN:'https://wrong.example.org'}}))
  assert.throws(()=>execFileSync('npm',['run','build'],{stdio:'pipe',env:{...pagesEnv,CF_PAGES_URL:'http://not-https.example.org'}}))
})

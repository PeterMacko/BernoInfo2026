import React from 'react'
import { createRoot } from 'react-dom/client'
import './style.css'
import './about.css'

type Agent = { icon: string; role: string; model: string; description: string }
const agents: Agent[] = [
  { icon: '🧭', role: 'Project Lead', model: 'openai/gpt-6-sol', description: 'Koordinácia projektu a redakčné rozhodnutia' },
  { icon: '📐', role: 'Analyst', model: 'openai/gpt-6-luna', description: 'Požiadavky a kritériá kvality' },
  { icon: '🔎', role: 'Researcher', model: 'openai/gpt-6-sol', description: 'Rešerš verejných a oficiálnych zdrojov' },
  { icon: '🛠️', role: 'Developer', model: 'openai/gpt-6-sol', description: 'Vývoj webu a príprava náhľadov' },
  { icon: '🧪', role: 'Reviewer', model: 'openai/gpt-6-sol', description: 'Nezávislá kontrola obsahu a použiteľnosti' },
]

function About() {
  return <main className="page about-page">
    <header className="masthead about-masthead">
      <a className="brand about-brand" href="/" aria-label="BernoInfo 2026 — úvodná stránka">BERNO<span>INFO</span><i>2026</i></a>
      <nav className="about-nav" aria-label="Navigácia"><a href="/">← Späť na úvod</a></nav>
    </header>
    <section className="about-hero" aria-labelledby="about-title">
      <p className="section-kicker">BernoInfo 2026 / o projekte</p>
      <h1 id="about-title">Kto stojí za<br /><em>BernoInfo.</em></h1>
      <p>Nezávislý informačný projekt o komunálnych voľbách v Bernolákove. Nie je oficiálnou stránkou obce ani s obcou nie je spojený.</p>
    </section>
    <section className="about-owner" aria-labelledby="owner-title">
      <div className="about-owner-text"><p className="about-index">01 / Iniciátor projektu</p><h2 id="owner-title">Peter Macko</h2><p>Za projektom BernoInfo 2026 stojí Peter Macko. Tím nástrojov nižšie pomáha spracovať podklady a pripraviť stránku; redakčné rozhodnutia a zverejnenie zostávajú pod ľudskou kontrolou.</p></div>
      <a className="about-portrait-link" href="https://www.facebook.com/maculko/" target="_blank" rel="noopener noreferrer" aria-label="Peter Macko — otvoriť profil na Facebooku v novom okne"><img src="/images/peter-macko.jpg" alt="Peter Macko" width="570" height="580" /></a>
    </section>
    <section className="about-team" aria-labelledby="team-title">
      <div className="about-heading"><p className="about-index">02 / Vývojový tím</p><h2 id="team-title">Päť agentov OpenClaw</h2><p>Úlohy sú rozdelené podľa roly. Uvedené modely zodpovedajú konfigurácii projektu overenej 21. októbra 2026.</p></div>
      <ol className="about-agents">{agents.map((agent, index) => <li key={agent.role} className="about-agent"><span className="about-agent-number">{String(index + 1).padStart(2, '0')}</span><a className="about-agent-icon" href="https://openclaw.ai/" target="_blank" rel="noopener noreferrer" aria-label={`${agent.role} — OpenClaw, otvoriť v novom okne`}><span aria-hidden="true">{agent.icon}</span></a><div><h3>{agent.role}</h3><p>{agent.description}</p></div><code>{agent.model}</code></li>)}</ol>
    </section>
    <section className="about-tools" aria-labelledby="tools-title"><div><p className="about-index">03 / Ďalší nástroj</p><h2 id="tools-title">Perplexity</h2><p>Perplexity je použitý samostatne ako ďalší nástroj, nie ako jeden z piatich nakonfigurovaných agentov OpenClaw. Neuvádzame preň pevný model.</p></div><a className="about-perplexity-icon" href="https://www.perplexity.ai/" target="_blank" rel="noopener noreferrer" aria-label="Perplexity — otvoriť v novom okne"><img src="/images/perplexity.svg" alt="" width="36" height="36" /><span>Perplexity ↗</span></a></section>
    <footer className="about-footer"><div><p className="about-index">Otvorený zdrojový kód</p><h2>Projekt je verejný.</h2><a href="https://github.com/PeterMacko/BernoInfo2026" target="_blank" rel="noopener noreferrer">Zdrojový kód na GitHube ↗</a></div><a className="about-home" href="/">← Späť na úvodnú stránku</a></footer>
  </main>
}

createRoot(document.getElementById('root')!).render(<React.StrictMode><About /></React.StrictMode>)

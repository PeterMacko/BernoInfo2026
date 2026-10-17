import React from 'react'
import { createRoot } from 'react-dom/client'
import { approvedPortraits, candidates, placeholderImage } from './candidates'
import './style.css'

const officialNotice = 'https://www.bernolakovo.sk/novinka/139303/n'
const correctedList = 'https://www.bernolakovo.sk/data/advertisement/bernolakovo.sk/532238/204396_zoznam-zaregistrovanych-kandidatov-pre-volby-starostu-obce.pdf'

function App() {
  return (
    <main className="page">
      <header className="masthead">
        <div className="brand" aria-label="BernoInfo 2026">BERNO<span>INFO</span><i>2026</i></div>
        <span className="masthead-note">Nezávislý prehľad · Bernolákovo</span>
      </header>

      <section className="intro" aria-labelledby="page-title">
        <div className="intro-topline"><span>Komunálne voľby 2026</span><span>24. októbra 2026</span></div>
        <div className="intro-main">
          <div>
            <p className="section-kicker">Bernolákovo / voľby starostu</p>
            <h1 id="page-title">Kandidáti na<br /><em>starostu obce.</em></h1>
          </div>
          <div className="intro-aside">
            <span className="count">08<span aria-hidden="true"> / 08</span></span>
            <p>Osem mien v poradí opraveného zoznamu obce.</p>
          </div>
        </div>
      </section>

      <section className="candidate-section" aria-labelledby="candidates-title">
        <div className="section-heading">
          <h2 id="candidates-title">Zoznam kandidátov</h2>
          <p>Poradie podľa opraveného zoznamu obce</p>
        </div>
        <ol className="candidate-grid">
          {candidates.map((candidate) => {
            const portrait = approvedPortraits?.[candidate.id]
            return (
              <li className="candidate-card" key={candidate.id}>
                <div className="portrait-wrap">
                  <img
                    src={portrait?.src ?? placeholderImage}
                    alt={portrait ? `Portrét: ${candidate.registeredName}` : ''}
                    aria-hidden={portrait ? undefined : true}
                    width="640"
                    height="760"
                  />
                </div>
                <div className="card-footer">
                  <div className="number-block"><span>Číslo v zozname</span><strong>{String(candidate.listNumber).padStart(2, '0')}</strong></div>
                  <h3>{candidate.registeredName}</h3>
                </div>
              </li>
            )
          })}
        </ol>
      </section>

      {approvedPortraits && (
        <section className="portrait-sources" aria-labelledby="portrait-sources-title">
          <h2 id="portrait-sources-title">Zdroje portrétov</h2>
          <p>Rovnaký obrazový formát pre všetkých osem kandidátov. Odkazy vedú na pôvodné zdroje fotografií.</p>
          <ol>
            {candidates.map((candidate) => (
              <li key={candidate.id}>
                <span>{candidate.registeredName}</span>
                <a href={approvedPortraits![candidate.id].sourceUrl}>Zdroj fotografie</a>
                <span>{approvedPortraits![candidate.id].credit}</span>
              </li>
            ))}
          </ol>
        </section>
      )}

      <footer className="source-note">
        <div className="source-mark" aria-hidden="true">↗</div>
        <div>
          <h2>Zdroj a stav údajov</h2>
          <p>Mená a poradie: <a href={correctedList}>opravený zoznam zaregistrovaných kandidátov (PDF)</a> a <a href={officialNotice}>oznámenie obce Bernolákovo</a>. Overené 17. októbra 2026. Uvedené čísla sú číslami v zozname; nie sú tu označené ako čísla na hlasovacom lístku.</p>
          {approvedPortraits ? (
            <p>Zdroj a kredit každej fotografie sú uvedené v časti Zdroje portrétov.</p>
          ) : (
            <p>Portréty zatiaľ nie sú zverejnené. Rovnaká grafická výplň pri každom mene nie je podobizňou kandidáta.</p>
          )}
        </div>
      </footer>
      <div className="colophon"><span>BERNOINFO 2026</span><span>Informácie bez poradia dôležitosti.</span></div>
    </main>
  )
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode><App /></React.StrictMode>,
)

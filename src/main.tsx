import React from 'react'
import { createRoot } from 'react-dom/client'
import { approvedPortraits, candidates, placeholderImage, privatePreviewPortraits } from './candidates'
import councilData from './council-candidates.json'
import './style.css'

const municipalityHome = 'https://www.bernolakovo.sk/'
const officialNotice = 'https://www.bernolakovo.sk/novinka/139303/n'
const correctedList = 'https://www.bernolakovo.sk/data/advertisement/bernolakovo.sk/532238/204396_zoznam-zaregistrovanych-kandidatov-pre-volby-starostu-obce.pdf'
const portraits = approvedPortraits ?? privatePreviewPortraits
const correctionEmail = 'Mr.petermacko@gmail.com'

function App() {
  return (
    <main className="page">
      <header className="masthead">
        <div className="brand" aria-label="BernoInfo 2026">
          BERNO<span>INFO</span><i>2026</i>
        </div>
        <span className="masthead-note">Nezávislý projekt · nie je stránkou obce</span>
      </header>

      <section className="intro" aria-labelledby="page-title">
        <div className="intro-topline">
          <span>Komunálne voľby 2026</span>
          <span>24. októbra 2026</span>
        </div>
        <div className="intro-main">
          <div>
            <p className="section-kicker">Bernolákovo / komunálne voľby</p>
            <h1 id="page-title">
              Voľby v<br /><em>Bernolákove.</em>
            </h1>
          </div>
          <div className="intro-aside">
            <div className="intro-count">
              <span className="count">08<span aria-hidden="true"> / 08</span></span>
              <p>Osem mien v poradí opraveného zoznamu obce.</p>
            </div>
            <figure className="municipal-arms">
              <a href={municipalityHome} aria-label="Erb obce Bernolákovo — oficiálna stránka obce">
                <img src="/images/bernolakovo-coat-of-arms.webp" alt="" width="180" height="209" />
              </a>
              <figcaption>Erb obce · zdroj: obec Bernolákovo</figcaption>
            </figure>
          </div>
        </div>
      </section>

      <section className="evidence-guide" aria-labelledby="evidence-guide-title">
        <p className="evidence-guide-kicker">Ako čítať profily</p>
        <h2 id="evidence-guide-title">Čo je doložené — a čo zostáva otvorené</h2>
        <ul className="evidence-guide-list">
          <li><strong>Oficiálny zoznam obce</strong><span>Registrácia, poradie v zozname, príslušnosť a uvedené povolanie vychádzajú z <a href={correctedList}>opravenej listiny obce (PDF)</a> datovanej 2. septembra 2026. Číslo v zozname nie je overené číslo na hlasovacom lístku.</span></li>
          <li><strong>„Kandidát uvádza“</strong><span>Návrhy a skúsenosti sú pripísané kandidátovi a odkazujú na jeho zdroj. Ich pravdivosť, uskutočniteľnosť ani úplnosť programu tým nie sú nezávisle potvrdené.</span></li>
          <li><strong>Nepodarilo sa doložiť</strong><span>Toto označenie znamená len to, že údaj nie je doložený v preskúmaných zdrojoch. Nie je to dôkaz, že stanovisko, funkcia či zdroj neexistuje, ani že kandidát odmietol odpovedať.</span></li>
        </ul>
        <p className="evidence-guide-limit"><strong>Rozsah a dátumy:</strong> Uzávierka podkladov pre údaje v profiloch je 18. októbra 2026. Dňa 19. októbra nasledovala cielená kontrola známych zdrojov, nie úplné opakovanie rešerše. Prehľad facebookových zdrojov za 16. júl – 16. október zostáva čiastočný; neboli preskúmané všetky príspevky, videá ani odpovede v rozhovoroch. Pri zdrojoch rozlišujeme dátum zverejnenia, ak je známy, a dátum kontroly.</p>
      </section>

      <section className="candidate-section" aria-labelledby="candidates-title">
        {privatePreviewPortraits && !approvedPortraits && <p className="preview-notice">Vývojový náhľad portrétov · fotografie nie sú schválené na finálne zverejnenie</p>}
        <div className="section-heading">
          <h2 id="candidates-title">Kandidáti na starostu obce</h2>
          <p>Poradie podľa opraveného zoznamu obce</p>
        </div>
        <ol className="candidate-grid">
          {candidates.map((candidate) => {
            const portrait = portraits?.[candidate.id]
            return (
              <li className="candidate-card" key={candidate.id}>
                <a
                  className="candidate-card-link"
                  href={`/kandidati/${candidate.id}/`}
                  aria-label={`Profil kandidáta ${candidate.registeredName}`}
                >
                  <div className="portrait-wrap">
                    <img
                      src={portrait?.src ?? placeholderImage}
                      className={portrait ? `candidate-portrait candidate-portrait--${candidate.id}` : undefined}
                      alt={portrait ? `Portrét: ${candidate.registeredName}` : ''}
                      aria-hidden={portrait ? undefined : true}
                      width="640"
                      height="760"
                    />
                  </div>
                  <div className="card-footer">
                    <div className="number-block">
                      <span>Číslo v zozname</span>
                      <strong>{String(candidate.listNumber).padStart(2, '0')}</strong>
                    </div>
                    <h3>{candidate.registeredName}</h3>
                  </div>
                </a>
              </li>
            )
          })}
        </ol>
      </section>

      <section className="council-section" aria-labelledby="council-title">
        <div className="section-heading">
          <h2 id="council-title">Kandidáti na poslancov obecného zastupiteľstva</h2>
          <p>44 registrácií · 13 mandátov</p>
        </div>
        <p className="council-intro">Kandidáti sú zoradení podľa <a href={officialNotice}>oznámenia obce</a> a opravených zoznamov jednotlivých volebných obvodov. Čísla označujú poradie v zverejnenom zozname obvodu, nie overené čísla na hlasovacom lístku. Údaje boli skontrolované {councilData.checked}; prípadné neskoršie zmeny či odstúpenia treba pred voľbami znovu preveriť.</p>
        <p className="council-intro"><a href="/issue22-review/">Kontrolná ukážka štyroch neschválených zdrojových obrázkov kandidátov na poslancov ↗</a> · verejný vývojový náhľad, nie finálne portréty.</p>
        {councilData.districts.map((district) => (
          <section className="council-district" key={district.number} aria-labelledby={`district-${district.number}`}>
            <div className="council-district-heading">
              <h3 id={`district-${district.number}`}>Volebný obvod {district.number}</h3>
              <p>{district.candidates.length} kandidátov · {district.seats} mandátov · <a href={district.sourceUrl}>Opravený zoznam obce (PDF)</a>, datovaný {councilData.officialDate}</p>
            </div>
            <ol className="council-list">
              {district.candidates.map((candidate) => (
                <li key={candidate.id}>
                  <a href={`/kandidati-na-poslancov/${candidate.id}/`} aria-label={`Profil: ${candidate.name}, kandidát na poslanca obecného zastupiteľstva, obvod ${district.number}, číslo ${candidate.listNumber} v zozname, ${candidate.designation}`}>
                    <span className="council-number">{String(candidate.listNumber).padStart(2, '0')}</span>
                    <span className="council-name">{candidate.name}<small className="council-designation">{candidate.designation}</small></span>
                    <span className="council-arrow" aria-hidden="true">↗</span>
                  </a>
                </li>
              ))}
            </ol>
          </section>
        ))}
      </section>

      {portraits && (
        <section className="portrait-sources" aria-labelledby="portrait-sources-title">
          <h2 id="portrait-sources-title">Zdroje portrétov</h2>
          <p>Rovnaký obrazový formát pre všetkých osem kandidátov. Odkazy vedú na dostupné pôvodné zdroje fotografií.</p>
          <ol>
            {candidates.map((candidate) => (
              <li key={candidate.id}>
                <span>{candidate.registeredName}</span>
                {portraits[candidate.id].sourceUrl && <a href={portraits[candidate.id].sourceUrl}>Zdroj fotografie</a>}
                <span>{portraits[candidate.id].credit}</span>
              </li>
            ))}
          </ol>
        </section>
      )}

      <footer className="source-note">
        <div className="source-mark" aria-hidden="true">↗</div>
        <div>
          <h2>Zdroj a stav údajov</h2>
          <p>BernoInfo 2026 je nezávislý informačný projekt. Nie je oficiálnou stránkou obce Bernolákovo ani s obcou nie je spojený. Erb obce je použitý ako označenie miesta; <a href={municipalityHome}>zdroj: oficiálna stránka obce</a>.</p>
          <p><strong>Kandidáti na starostu obce:</strong> Mená a poradie podľa <a href={correctedList}>opraveného zoznamu (PDF)</a> a <a href={officialNotice}>oznámenia obce</a>. Naposledy overené 18. októbra 2026.</p>
          <p><strong>Kandidáti na poslancov obecného zastupiteľstva:</strong> Mená, príslušnosť a poradie podľa opravených zoznamov obce pre {councilData.districts.map((district, index) => <React.Fragment key={district.number}>{index > 0 ? ", " : ""}<a href={district.sourceUrl}>obvod {district.number} (PDF)</a></React.Fragment>)}. Zoznamy sú datované {councilData.officialDate}; skontrolované {councilData.checked}. Uvedené čísla sú číslami v zozname, nie overenými číslami na hlasovacom lístku.</p>
          {portraits ? (
            <p>Zdroj a kredit každej fotografie sú uvedené v časti Zdroje portrétov.</p>
          ) : (
            <p>Portréty zatiaľ nie sú zverejnené. Rovnaká grafická výplň pri každom mene nie je podobizňou kandidáta.</p>
          )}
          <p>Opravy údajov: <a href={`mailto:${correctionEmail}`}>{correctionEmail}</a>. Uveďte dotknutý údaj a odkaz na zdroj. Doložené opravy posúdime podľa rovnakých pravidiel pre všetkých kandidátov a zmenu označíme dátumom pri príslušnej informácii.</p>
        </div>
      </footer>
      <div className="colophon">
        <span>BERNOINFO 2026</span>
        <span>Informácie bez poradia dôležitosti.</span>
      </div>
    </main>
  )
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

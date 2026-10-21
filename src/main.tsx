import React, { useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { approvedPortraits, candidates, placeholderImage, privatePreviewPortraits } from './candidates'
import councilData from './council-candidates.json'
import issue24Evidence from './issue24-evidence.json'
import issue24Photos from './issue24-photo-availability.json'
import { checkedDate, districtSource, findStreet, precinctSource, suggestStreets, streetData, venues } from './street-lookup'
import { CandidateSearch } from './CandidateSearch'
import { dualRoutes } from './candidate-search'
import { canonicalPerson, connections, connectionsFor } from './connections'
import type { Connection } from './connections'
import './style.css'

const municipalityHome = 'https://www.bernolakovo.sk/'
const officialNotice = 'https://www.bernolakovo.sk/novinka/139303/n'
const correctedList = 'https://www.bernolakovo.sk/data/advertisement/bernolakovo.sk/532238/204396_zoznam-zaregistrovanych-kandidatov-pre-volby-starostu-obce.pdf'
const portraits = approvedPortraits ?? privatePreviewPortraits
const photoReview = import.meta.env.VITE_SITE_BUILD_MODE === 'photo-review'
const councilRoute = (id:string) => dualRoutes[id] ? `/kandidati/${dualRoutes[id]}/` : `/kandidati-na-poslancov/${id}/`
const councilPhoto = (id:string) => {
  const photo = (issue24Evidence as Record<string,{photo:{kind:string,url:string|null}}>)[id]?.photo
  if (import.meta.env.VITE_PRIVATE_PORTRAIT_PREVIEW !== '1') return placeholderImage
  if (photo?.url && issue24Photos.includes(id)) return `/images/council/${id}.jpg`
  return dualRoutes[id] ? portraits?.[dualRoutes[id] as keyof typeof portraits]?.src ?? placeholderImage : placeholderImage
}
const correctionEmail = 'Mr.petermacko@gmail.com'

function ConnectionIcon() {
  return <svg className="connection-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"><circle cx="9" cy="8" r="3" /><path d="M2.5 19v-1.3a5.5 5.5 0 0 1 11 0V19H2.5Z" /><path d="M17 5.4a3 3 0 0 1 0 5.2M16 14a4.5 4.5 0 0 1 5.5 4.4V19h-5" /></svg>
}

type ConnectionButtonProps = { personId: string; group: Connection; pressed: boolean; onToggle: (personId: string, groupId: string) => void }
function ConnectionButton({personId, group, pressed, onToggle}: ConnectionButtonProps) {
  return <button className="connection-toggle" type="button" aria-pressed={pressed} aria-label={`${pressed ? 'Zrušiť zvýraznenie' : 'Zvýrazniť prepojenie'}: ${group.title}. ${group.qualification}`} onClick={() => onToggle(personId, group.id)} title={group.title}><ConnectionIcon /><span>{group.controlLabel}</span></button>
}

function App() {
  const [selection, setSelection] = useState<{personId: string; groupId: string} | null>(null)
  const activeConnection = selection ? connections.find(group => group.id === selection.groupId) : undefined
  const selectedPerson = selection?.personId
  const selectedName = selectedPerson ? councilData.districts.flatMap(district => district.candidates).find(candidate => candidate.id === selectedPerson)?.name : undefined
  const connectionState = (id: string) => !activeConnection ? '' : activeConnection.members.some(member => canonicalPerson(member) === canonicalPerson(id)) ? (selectedPerson && canonicalPerson(selectedPerson) === canonicalPerson(id) ? 'is-selected' : 'is-related') : 'is-unrelated'
  const isPressed = (id: string, groupId: string) => Boolean(selection && selection.groupId === groupId && canonicalPerson(selection.personId) === canonicalPerson(id))
  const toggleConnection = (id: string, groupId: string) => setSelection(current => current?.groupId === groupId && canonicalPerson(current.personId) === canonicalPerson(id) ? null : {personId: id, groupId})
  const [streetInput, setStreetInput] = useState('')
  const [searched, setSearched] = useState(false)
  const [suggestionsOpen, setSuggestionsOpen] = useState(false)
  const [activeSuggestion, setActiveSuggestion] = useState(-1)
  const suggestionList = useRef<HTMLDivElement>(null)
  const suggestions = suggestStreets(streetInput)
  const selectStreet = (street: string) => {
    setStreetInput(street)
    setSearched(false)
    setSuggestionsOpen(false)
    setActiveSuggestion(-1)
  }
  const handleStreetKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      setSuggestionsOpen(false)
      setActiveSuggestion(-1)
    } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      if (!suggestionsOpen) {
        setSuggestionsOpen(true)
        setActiveSuggestion(event.key === 'ArrowDown' ? 0 : suggestions.length - 1)
      } else if (suggestions.length) {
        setActiveSuggestion(index => index < 0 ? (event.key === 'ArrowDown' ? 0 : suggestions.length - 1) : (index + (event.key === 'ArrowDown' ? 1 : -1) + suggestions.length) % suggestions.length)
      }
    } else if (event.key === 'Enter' && suggestionsOpen && activeSuggestion >= 0 && suggestions[activeSuggestion]) {
      event.preventDefault()
      selectStreet(suggestions[activeSuggestion].street)
    }
  }
  useEffect(() => {
    if (activeSuggestion < 0) return
    suggestionList.current?.querySelector(`[data-suggestion-index="${activeSuggestion}"]`)?.scrollIntoView({ block: 'nearest' })
  }, [activeSuggestion])
  const result = searched ? findStreet(streetInput) : null

  useEffect(() => {
    let frameId = 0
    const navigateToDistrict = () => {
      if (!/^#district-[1-3]$/.test(window.location.hash)) return
      // The browser's initial fragment jump may run before React creates this heading.
      cancelAnimationFrame(frameId)
      frameId = requestAnimationFrame(() => {
        const heading = document.getElementById(window.location.hash.slice(1))
        if (!heading) return
        heading.scrollIntoView({ block: 'start', behavior: 'instant' })
        heading.focus({ preventScroll: true })
      })
    }
    navigateToDistrict()
    window.addEventListener('hashchange', navigateToDistrict)
    return () => {
      cancelAnimationFrame(frameId)
      window.removeEventListener('hashchange', navigateToDistrict)
    }
  }, [])

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

      <CandidateSearch />

      <section className="street-section" aria-labelledby="street-title">
        <div className="street-layout">
          <div>
            <p className="section-kicker">Volebné informácie / Bernolákovo</p>
            <h2 id="street-title">Ktorý obvod volím</h2>
            <p>Vyberte alebo napíšte názov ulice. Zistíte volebný obvod pre poslancov, volebný okrsok a volebnú miestnosť podľa oznámení obce.</p>
            <form onSubmit={event => { event.preventDefault(); setSuggestionsOpen(false); setActiveSuggestion(-1); setSearched(true) }}>
              <label htmlFor="street-name">Ulica v Bernolákove</label>
              <div className="street-control">
                <div className="street-input-wrap">
                  <input id="street-name" name="street" type="text" role="combobox" aria-autocomplete="list" aria-controls={suggestionsOpen && suggestions.length ? "street-options" : undefined} aria-expanded={suggestionsOpen && suggestions.length > 0} aria-activedescendant={suggestionsOpen && activeSuggestion >= 0 && suggestions[activeSuggestion] ? `street-option-${activeSuggestion}` : undefined} autoComplete="off" value={streetInput} onFocus={() => setSuggestionsOpen(true)} onBlur={() => { setSuggestionsOpen(false); setActiveSuggestion(-1) }} onKeyDown={handleStreetKeyDown} onChange={event => { setStreetInput(event.target.value); setSearched(false); setSuggestionsOpen(true); setActiveSuggestion(-1) }} placeholder="Napr. Hlavná" />
                  {suggestionsOpen && (suggestions.length ? <div id="street-options" className="street-suggestions" role="listbox" aria-label="Ulice v Bernolákove" ref={suggestionList}>
                    {suggestions.map((row, index) => <div id={`street-option-${index}`} data-suggestion-index={index} role="option" aria-selected={index === activeSuggestion} className={`street-suggestion${index === activeSuggestion ? ' is-active' : ''}`} key={row.street} onMouseDown={event => event.preventDefault()} onClick={() => selectStreet(row.street)}>{row.street}</div>)}
                  </div> : <div className="street-suggestions street-no-match" role="status">Žiadna zhodná ulica. Skontrolujte názov.</div>)}
                </div>
                <button type="submit">Zistiť obvod</button>
              </div>
            </form>
            <div className="street-result" role="status" aria-live="polite">
              {searched && result && <>
                <p className="result-kicker">Výsledok pre {result.street}</p>
                <h3>Volebný obvod {result.district} · okrsok {result.precinct}</h3>
                <p><strong>Volebná miestnosť:</strong> {venues[result.precinct]}</p>
                <p><a href={`#district-${result.district}`}>Kandidáti na poslancov v obvode {result.district} a všetky jeho okrsky</a></p>
                <p className="result-source">Obvod: <a href={districtSource}>uznesenie obce z 23. júna 2026</a>. Okrsok a miestnosť: <a href={precinctSource}>oznámenie obce z 29. júla 2026</a>. Skontrolované {checkedDate}.</p>
              </>}
              {searched && !result && <p>Nenašli sme jednoznačnú zhodu. Skontrolujte celý názov ulice alebo ho vyberte zo zoznamu. Obvod ani miestnosť nehádame; overte si ich v <a href={precinctSource}>oficiálnom zozname obce (PDF)</a>. Pri „Záhradkárskej oblasti“ použite celý júlový názov „Záhradkárska oblasť (pri Trnavskej)“.</p>}
            </div>
          </div>
          <aside className="street-explainer">
            <h3>Obvod ≠ okrsok</h3>
            <p>Obvod určuje kandidátov na poslancov. Okrsok určuje volebnú miestnosť. Aj v obvode 2 sú dve rôzne miestnosti, preto zobrazujeme výsledok podľa ulice.</p>
            <p>Vyhľadávanie beží iba v tomto prehliadači. Zadanú ulicu neodosielame ani neukladáme.</p>
            <p><a href={districtSource}>Obvody a mandáty: uznesenie obce (PDF)</a>, 23. júna 2026; <a href={precinctSource}>okrsky, ulice a miestnosti: oznámenie obce (PDF)</a>, 29. júla 2026. Skontrolované {checkedDate}.</p>
            <p><a href="/volby/ulice/">Textový zoznam všetkých ulíc a okrskov</a> (funguje aj bez JavaScriptu).</p>
          </aside>
        </div>
      </section>

      <section className="election-resources" aria-labelledby="election-resources-title">
        <div className="section-heading">
          <h2 id="election-resources-title">Predvolebné zdroje</h2>
          <p>Odkazy na pôvodné publikácie</p>
        </div>
        <div className="election-resource-grid">
          <article>
            <h3><a href="https://volby.transparency.sk/samosprava2026/vyhladavanie/bernolakovo">Volebné financovanie v Bernolákove ↗</a></h3>
            <p>Vyhľadávanie kandidátov na stránke Transparency International Slovensko. Samotný odkaz nepotvrdzuje stav účtov ani financovania.</p>
            <small>Vydavateľ: Transparency International Slovensko · Odkaz dodal Peter 21. októbra 2026 · Adresa sa načítala; údaje v aplikácii neboli nezávisle overené.</small>
          </article>
          <article>
            <h3><a href="https://www.youtube.com/watch?v=EFM4W0tnZgE&t=8112s&pp=ygUdcHJlZHZvbGVibmEgZGViYXRhIGJlcm5sYWtvdm8%3D">Debata s kandidátmi ↗</a></h3>
            <p>Video na YouTube. Účasť jednotlivých kandidátov ani obsah vystúpení tu nevyhodnocujeme.</p>
            <small>Platforma: YouTube · Vydavateľ: neoverený · Dátum videa: neoverený · Odkaz dodal Peter 21. októbra 2026.</small>
          </article>
          <article>
            <h3><a href="https://www.facebook.com/photo/?fbid=1038637972532175&set=a.131142839948364">Prvé výsledky predvolebných kontrol ↗</a></h3>
            <p>Príspevok na Facebooku. Jeho zistenia tu nepreberáme ani neoverujeme.</p>
            <small>Platforma: Facebook · Vydavateľ: neoverený · Dátum príspevku: neoverený · Odkaz dodal Peter 21. októbra 2026.</small>
          </article>
        </div>
      </section>

      <section className="candidate-section" aria-labelledby="candidates-title">
        {photoReview && privatePreviewPortraits && !approvedPortraits && <p className="preview-notice">Vývojový náhľad zdrojových fotografií</p>}
        <div className="section-heading">
          <h2 id="candidates-title">Kandidáti na starostu obce</h2>
          <p>Poradie podľa opraveného zoznamu obce</p>
        </div>
        <p className="connection-instructions">Prepojenia ukazujú iba doložené kampaňové predstavenia alebo výslovne označené neoverené podnety, nie oficiálne volebné listiny. Rohovým tlačidlom zvýrazníte súvisiace profily.</p>
        <p className="connection-status" role="status" aria-live="polite">{activeConnection ? `Zvýraznené od kandidáta ${selectedName ?? ""}: ${activeConnection.title}. ${activeConnection.qualification}` : 'Nie je zvolené žiadne prepojenie.'}</p>
        <ol className="candidate-grid">
          {candidates.map((candidate) => {
            const portrait = portraits?.[candidate.id]
            const councilId = Object.keys(dualRoutes).find(id => dualRoutes[id] === candidate.id)
            const candidateConnections = councilId ? connectionsFor(councilId, photoReview) : []
            return (
              <li className={`candidate-card connection-item ${councilId ? connectionState(councilId) : activeConnection ? 'is-unrelated' : ''}`} key={candidate.id}>
                {councilId && candidateConnections.length > 0 && <div className="connection-controls" aria-label={`Prepojenia: ${candidate.registeredName}`}>{candidateConnections.map(group => <ConnectionButton key={group.id} personId={councilId} group={group} pressed={isPressed(councilId, group.id)} onToggle={toggleConnection} />)}</div>}
                <a
                  className="candidate-card-link"
                  href={`/kandidati/${candidate.id}/`}
                  aria-label={`Profil kandidáta ${candidate.registeredName}${['bartok','cirbus','kostial','turenic'].includes(candidate.id) ? ' na starostu aj poslanca obecného zastupiteľstva' : ' na starostu obce'}`}
                >
                  <div className="portrait-wrap">
                    <img
                      src={portrait?.src ?? placeholderImage}
                      className={portrait ? `candidate-portrait candidate-portrait--${candidate.id}` : undefined}
                      alt={portrait ? `Fotografia kandidáta ${candidate.registeredName}` : ''}
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
                    <h3>{candidate.registeredName}{['bartok','cirbus','kostial','turenic'].includes(candidate.id) && <small className="dual-office-label">Aj kandidát na poslanca</small>}</h3>
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
        {councilData.districts.map((district) => (
          <section className="council-district" key={district.number} aria-labelledby={`district-${district.number}`}>
            <div className="council-district-heading">
              <h3 id={`district-${district.number}`} tabIndex={-1}>Volebný obvod {district.number}</h3>
              <p>{district.candidates.length} kandidátov · {district.seats} mandátov · <a href={district.sourceUrl}>Opravený zoznam obce (PDF)</a>, datovaný {councilData.officialDate}</p>
            </div>
            <div className="district-polling">
              <h4>Okrsky a volebné miestnosti</h4>
              <ul>{[...new Set(streetData.filter(row => row.district === district.number).map(row => row.precinct))].map(precinct => <li key={precinct}><strong>Okrsok {precinct}:</strong> {venues[precinct]}</li>)}</ul>
              <p>Miesto určite podľa svojho okrsku, nie iba podľa obvodu. <a href={precinctSource}>Zdroj: obec Bernolákovo, oznámenie z 29. júla 2026 (PDF)</a>; skontrolované {checkedDate}.</p>
              <p><a href={districtSource}>Zdroj počtu mandátov: uznesenie obce z 23. júna 2026 (PDF)</a>; skontrolované {checkedDate}.</p>
            </div>
            <ol className="council-list">
              {district.candidates.map((candidate) => {
                const candidateConnections = connectionsFor(candidate.id, photoReview)
                return <li key={candidate.id} className={`connection-item ${connectionState(candidate.id)}`}>
                  {candidateConnections.length > 0 && <div className="connection-controls" aria-label={`Prepojenia: ${candidate.name}`}>{candidateConnections.map(group => <ConnectionButton key={group.id} personId={candidate.id} group={group} pressed={isPressed(candidate.id, group.id)} onToggle={toggleConnection} />)}</div>}
                  <a href={councilRoute(candidate.id)} aria-label={`Profil: ${candidate.name}, kandidát na ${dualRoutes[candidate.id] ? 'starostu aj ' : ''}poslanca obecného zastupiteľstva, obvod ${district.number}, číslo ${candidate.listNumber} v zozname, ${candidate.designation}`}>
                    <img className="council-thumb" src={councilPhoto(candidate.id)} alt="" width="48" height="57" loading="lazy" /><span className="council-number">{String(candidate.listNumber).padStart(2, '0')}</span>
                    <span className="council-name">{candidate.name}<small className="council-designation">{candidate.designation}</small></span>
                    <span className="council-arrow" aria-hidden="true">↗</span>
                  </a>
                </li>
              })}
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
          <p>Prvotné zhromaždenie podkladov pre profily sa uzavrelo 18. októbra 2026; 19. októbra nasledovala cielená kontrola známych zdrojov, nie úplné opakovanie rešerše. Prehľad facebookových zdrojov za 16. júl – 16. október je čiastočný; neboli preskúmané všetky príspevky, videá ani odpovede v rozhovoroch. Kandidátske tvrdenia sú pripísané kandidátom, nie nezávisle potvrdené. Nedoložený údaj v preskúmaných zdrojoch neznamená, že neexistuje alebo že kandidát odmietol odpovedať.</p>
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

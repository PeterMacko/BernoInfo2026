import React, { useEffect, useRef, useState } from 'react'
import { resolveCandidate, suggestCandidates, type SearchPerson } from './candidate-search'

export function CandidateSearch() {
  const [name, setName] = useState('')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const [message, setMessage] = useState('')
  const optionsRef = useRef<HTMLDivElement>(null)
  const suggestions = suggestCandidates(name)

  const navigate = (person: SearchPerson) => { window.location.assign(person.route) }
  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (open && active >= 0 && suggestions[active]) {
      navigate(suggestions[active])
      return
    }
    const result = resolveCandidate(name)
    if (result.kind === 'unique' && result.person) {
      navigate(result.person)
      return
    }
    setOpen(result.kind === 'ambiguous' || result.kind === 'partial')
    setMessage(result.kind === 'empty' ? 'Zadajte meno kandidáta.'
      : result.kind === 'not-found' ? 'Kandidáta s týmto menom sme nenašli. Skontrolujte meno alebo použite zoznam nižšie.'
      : result.kind === 'ambiguous' ? 'Meno zodpovedá viacerým kandidátom. Vyberte konkrétnu osobu zo zoznamu.'
      : 'Zadajte celé meno alebo vyberte kandidáta zo zoznamu.')
  }
  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      setOpen(false)
      setActive(-1)
    } else if (event.key === 'Enter' && open && active >= 0 && suggestions[active]) {
      event.preventDefault()
      navigate(suggestions[active])
    } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      if (!suggestions.length) return
      setOpen(true)
      setActive(index => index < 0 ? (event.key === 'ArrowDown' ? 0 : suggestions.length - 1)
        : (index + (event.key === 'ArrowDown' ? 1 : -1) + suggestions.length) % suggestions.length)
    }
  }
  useEffect(() => {
    if (active >= 0) optionsRef.current?.querySelector(`[data-option-index="${active}"]`)?.scrollIntoView({ block: 'nearest' })
  }, [active])

  return <section className="candidate-search-section" aria-labelledby="candidate-search-title">
    <div className="candidate-search-layout">
      <div>
        <p className="section-kicker">Zoznam kandidátov / 48 osôb</p>
        <h2 id="candidate-search-title">Nájdite kandidáta</h2>
        <p>Vyhľadajte meno v zozname kandidátov na starostu a poslancov. Profil si môžete otvoriť aj zo zoznamov nižšie.</p>
      </div>
      <form onSubmit={submit} role="search" aria-label="Vyhľadávanie kandidáta">
        <label htmlFor="candidate-name">Meno kandidáta</label>
        <div className="candidate-search-control">
          <div className="candidate-search-input-wrap">
            <input id="candidate-name" type="search" name="candidate" value={name} autoComplete="off" placeholder="Napr. Michal Bartók"
              role="combobox" aria-autocomplete="list" aria-expanded={open && suggestions.length > 0}
              aria-controls={open && suggestions.length ? 'candidate-options' : undefined}
              aria-activedescendant={open && active >= 0 && suggestions[active] ? `candidate-option-${active}` : undefined}
              aria-describedby="candidate-search-help candidate-search-status candidate-search-error"
              onFocus={() => { if (name.trim()) setOpen(true) }}
              onBlur={() => { setOpen(false); setActive(-1) }}
              onKeyDown={onKeyDown}
              onChange={event => { setName(event.target.value); setOpen(Boolean(event.target.value.trim())); setActive(-1); setMessage('') }} />
            {open && suggestions.length > 0 && <div id="candidate-options" ref={optionsRef} className="candidate-search-options" role="listbox" aria-label="Kandidáti">
              {suggestions.map((person, index) => <div id={`candidate-option-${index}`} data-option-index={index} role="option" aria-selected={index === active}
                className={`candidate-search-option${index === active ? ' is-active' : ''}`} key={person.id}
                onMouseDown={event => event.preventDefault()} onClick={() => navigate(person)}>
                <strong>{person.name}</strong><small>{person.context}</small>
              </div>)}
            </div>}
          </div>
          <button type="submit">Otvoriť profil</button>
        </div>
        <p id="candidate-search-help" className="candidate-search-help">Vyberte meno zo zoznamu alebo zadajte celé meno. Vyhľadávanie prebieha iba v prehliadači; meno neodosielame ani neukladáme.</p>
        <p id="candidate-search-status" className="candidate-search-status" role="status" aria-live="polite">{open && name.trim() ? suggestions.length ? `${suggestions.length} ${suggestions.length === 1 ? 'zhoda' : 'zhôd'} v zozname.` : 'Žiadny zhodný kandidát.' : ''}</p>
        <p id="candidate-search-error" className="candidate-search-error" role="alert">{message}</p>
      </form>
    </div>
  </section>
}

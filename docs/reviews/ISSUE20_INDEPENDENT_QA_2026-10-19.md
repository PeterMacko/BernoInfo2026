# Issue #20 independent QA — integrated lead commit `68bc58a`

**Reviewer:** independent read-only review, 19 October 2026. **Disposition: changes required before issue/PR handoff or public preview.** This report is the only authored project artifact; no product fix, deploy, or merge was made. Reviewed the charter, research protocol, team contract, issue #20 scope, and council ledger first.

## Findings (priority order)

### P1 — Political designation is not reproduced exactly from the primary PDFs

`src/council-candidates.json` (D1 candidates 9 and 11; D2 candidate 15; D3 candidates 4, 6, and 8) and `scripts/generate-council-pages.mjs:39` display abbreviated/normalized designations as **“Oficiálne uvedená príslušnosť”**. The five coalition records say `Demokrati, KDH, SaS` in data/pages; each revised PDF actually says `Demokrati, Kdh - kresťanskodemokratické hnutie, Sloboda a solidarita`. D3/8 says `Hlas – sociálna demokracia, Smer – sociálna demokracia` in data/pages versus PDF hyphens (`Hlas - sociálna demokracia, Smer - sociálna demokracia`). The ledger acknowledges normalization, but the public profile calls it *officially listed* and the analyst scope requires exact official affiliation. Use verbatim PDF wording (or explicitly label an abbreviation and give the full source wording), regenerate all affected pages, and make an independent PDF-based regression check. `tests/council.test.mjs:5-18` only compares data with the derivative ledger, so it cannot detect this error.

### P1 — Unknown council route resolves to homepage in the built preview

`tests/council.test.mjs:59-60` only confirms that `public/404.html` exists; it does not request an invalid URL. With `npm run build:placeholder` then `npm run preview`, both `/kandidati-na-poslancov/unknown/` and `/missing/` returned HTTP **200** and the homepage HTML, not the not-found page. `wrangler.jsonc:5-8` does not define explicit route handling. This fails the issue acceptance criterion for a deliberate invalid-ID path in the tested preview and can mislead users/bookmarks. Add effective 404 behavior for the actual preview/hosting platform and an HTTP/direct-navigation test; recheck Cloudflare behavior separately before publication (not verified here).

### P2 — Council research parity ledger does not meet per-candidate evidence criterion

`docs/research/ISSUE20_COUNCIL_CANDIDATE_LEDGER_2026-10-19.md` has an excellent official roster and candidly calls Facebook coverage partial, but its “Other 38 registrants” row groups candidate-source results. It does **not** record a candidate-by-field search method, cutoff/dates reached, inaccessible material, or individual gap status for each of the 44, as required by `docs/ISSUE_20_COUNCIL_CANDIDATE_SCOPE.md` acceptance criterion 5. This does not prove unequal search effort, but it cannot demonstrate comparable effort or support the profile-wide `not established` states at the requested granularity. Complete a 44-row private candidate/source-method matrix or explicitly amend the acceptance gate with lead/editorial review before treating research as complete. Do not turn an incomplete search into an absence claim.

### P2 — Council source context is obscured by mayor-only global source copy

`src/main.tsx:148-150` and `index.html:49-51` place a global “Mená a poradie” footer after both sections, but cite the **mayoral** corrected-list PDF and say “Naposledy overené 18. októbra 2026.” Council names/order came from three different PDFs and were checked 19 October. Section-local council links at `src/main.tsx:106-111` and the no-JS list are correct, so this is a conflicting summary rather than missing sourcing. Separate mayor/council source and checked-date statements in the global footer and no-JS footer; keep each fact scoped to its office.

### P2 — Council homepage cards omit the official designation

`src/main.tsx:113-121` renders number/name only; `scripts/generate-council-pages.mjs:59` does the same for the no-JS roster. District is supplied by grouping, but the analyst card requirement calls for name plus necessary constituency/**list/affiliation** context with identical fields. Users cannot see official political designation without opening each of 44 details. Add a uniform designation field to both card/list variants after correcting its exact source wording, or document an approved scope change.

### P3 — No-JS council copy has incorrect Slovak inflection

`scripts/generate-council-pages.mjs:59` and generated `index.html:46` say `spolu 13 mandáty` and `3 mandátov`. Correct to `13 mandátov` and `3 mandáty`, then regenerate. The JS section uses the correct `13 mandátov` at `src/main.tsx:104`.

## Independently verified passes

- Downloaded all three linked **revised** municipal district PDFs directly on 19 October; each returned HTTP 200 `application/pdf`, identified the 24 October election, was dated 2 September, and specified 5/5/3 seats. Compared the PDF text to the JSON and rendered records, not merely to the ledger: **15/19/10 = 44** entries; district, number/order, names (ignoring inconsequential PDF spacing around titles), ages, and occupations match. The six designation renderings above are the substantive exact-text exceptions. No extra or duplicate registration found. This does not rule out a later municipal update or withdrawal.
- `npm test`: 4/4 pass. `npm ci` then `npm run build:placeholder`: TypeScript/Vite production build passes. `npm test` is derivative-ledger-based, not primary-source verification. Build generation changed eight tracked mayoral HTML files locally; those generated changes were restored, leaving only this report.
- Served the build with Vite preview: all **44** council direct URLs returned 200 with the matching candidate `<h1>` and district PDF URL. The eight mayoral static routes exist; one mayor route was served successfully. Homepage source order and no-JS static list show mayoral section before all three council districts. Council detail pages share the same seven sections, sourced official registration/occupation facts, explicitly bounded empty states, office-specific titles/back links, and a cross-link for the four dual mayoral/council registrants. No mayoral policy text was improperly copied into council programme fields.
- Source/static checks: one native anchor per council item in both React (`src/main.tsx:113-121`) and no-JS (`index.html:45-47`); global `:focus-visible` rules in `src/style.css:33-37` and `public/candidate-detail.css:26-29`; reduced-motion rules in `src/style.css:568-572` and `public/candidate-detail.css:228-232`; mobile single-column council layout at `src/style.css:683-686`; detail-page responsive grid at `public/candidate-detail.css:306-316`. No nested controls in council items. PDF source links and checked/publication dates are present on all details.

## Remaining limits and preview exposure

- A live visual/keyboard/screen-reader pass was **not completed**. Local headless Chrome failed to produce a screenshot, so actual focus order/contrast at 320–390 px, zoom, reduced-motion behavior, and no-JS rendering in a browser remain **unverified**, despite favorable static markup/CSS. Repeat on a working browser with JavaScript on/off, keyboard Tab/Enter, narrow/desktop widths, and reduced motion before sign-off.
- Vite's preview 404 behavior was tested; Cloudflare's actual response was not. No public preview URL, deployment, access control, robots response, or search-index state was checked. `noindex` in `index.html:6` and `scripts/generate-council-pages.mjs:35` is not access control. A public preview would expose 44 named council profiles, occupations/ages/designations, four mayoral cross-links, and a correction email; human editorial approval and a current roster recheck are required before public release under the charter/team contract.
- The ledger's five Facebook-source pass is explicitly partial; no independent Facebook browsing, candidate identity authentication, or exhaustive 44-person source sweep was performed in this review. No substantive council programme claims were approved by this QA.

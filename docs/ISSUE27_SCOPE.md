# Issue #27 — profile notice removal and neutral link labels

**Status:** analyst scope, 20 October 2026. Requirements only; no product-code changes or release approval. Applies to the homepage, all eight mayoral profiles, and all generated council profiles, including photo-review/release variants. Basis: [project charter](https://github.com/PeterMacko/BernoInfo2026/blob/main/docs/PROJECT_CHARTER.md), [research protocol](https://github.com/PeterMacko/BernoInfo2026/blob/main/docs/RESEARCH_PROTOCOL.md), [team contract](https://github.com/PeterMacko/BernoInfo2026/blob/main/docs/AGENT_TEAM.md), and [issue #27](https://github.com/PeterMacko/BernoInfo2026/issues/27).

## Required change

1. Remove the repeated “Čo je doložené — a čo zostáva otvorené” explanatory section from the homepage and every generated mayoral profile. It is a presentation-only deletion: retain the profile-specific “Zdroje, pokrytie a opravy” section, citations, dates, coverage limits, correction route, and explanatory caveats elsewhere. Do not remove or rewrite facts to make the copy shorter.
2. In public link labels and their adjacent attribution, remove claims that Peter supplied/assigned/identified an URL. Use stable labels derived from what the destination actually is. Do not expose contributor identity as link context. Internal research provenance may remain private.
3. Preserve every current candidate/council fact, candidate statement, source/publisher/date/status text, URL (including alternate URLs currently visible only in photo-review), image/photo and its source/credit/caveat, source section, and route. This includes the eight mayoral records and all 44 council records. No pruning, deduplication, URL substitution, photo replacement, or content migration out of scope.

## Link category mapping

Map source data categories to truthful public labels; label describes destination type, not verified ownership or endorsement:

| Recorded kind / destination | Public label |
| --- | --- |
| `shared campaign page` | **Spoločná stránka kampane** (not personal profile; name presenting entity where established) |
| `post/appearance` | **Príspevok o kandidátovi** (not candidate account; identify publisher/context if established) |
| `self-labelled candidate page/profile` | **Kandidátsky označená stránka/profil** (account operator/ownership unverified) |
| `campaign-used profile` | **Profil použitý v kampani** (ownership unverified) |
| `probable/unverified profile` | **Možný profil — nepotvrdené**; keep its existing review-only visibility rule |
| `historical page (2018)` | **Historická stránka kampane (2018)**; keep review-only rule and do not imply current activity |
| `mention only` | **Príspevok so zmienkou o kandidátovi** (not a profile); keep review-only rule |
| direct candidate web/social link | **Web kandidáta**, **Facebooková stránka/profil kandidáta** only where the existing source warrants it; otherwise qualify “kandidátsky označený” and ownership caveat |
| interview/video | **Rozhovor s [candidate] — [publisher]**; appearance is not account ownership or evidence of a position |
| official record / photo URL | Preserve its current functional description (official list, source photograph/PDF); do not relabel as a candidate channel |

Do not collapse unlike types to generic “Facebookový profil kandidáta”. Keep canonical source URL unchanged. Link text and nearby note together must not overstate ownership, identity, currentness, or candidate endorsement. A contribution-origin URL in the review data may be retained as an alternate source link, but never labelled as Peter-assigned; retain the existing uncertainty qualification. Do not infer account identity from Peter’s confirmation or from third-party comments.

## Acceptance criteria

- No rendered homepage or generated mayoral/council profile contains the removed heading or its repeated guide section. The profile source section remains present and materially intact.
- Every former contributor-attributed public label/note is replaced with a truthful category label, with existing uncertainty and review-only visibility preserved. No public text attributes discovery/assignment to Peter.
- A before/after inventory shows no loss or change of candidate facts/statements, publisher/date/status/caveats, source-section content, URLs, routes, photos, image credits or source-photo references. Source URL set and local image set are unchanged; no fact is silently reclassified as independently verified.
- Verify generated profiles plus homepage/no-JS council roster for all 8 mayoral and 44 council records, and inspect placeholder, photo-review, and release build outputs for parity. JS/no-JS presentation and direct routes remain functional. Independent reviewer checks the rendered result and link-label/category mapping.
- This issue changes neither review nor release gates: developer changes remain draft pending independent review; Peter retains editorial approval before merge, production release, or external outreach. The existing authorization for the publicly reachable branch preview applies to reviewed work; no additional preview-only approval is needed.

## Confirmation and unresolved distinction

Peter’s additional direction that the collected information is confirmed and photos are OK permits preserving and using the collected material as directed; it does not make an ambiguous Facebook identity independently corroborated. Retain existing provenance and account-ownership caveats. “Photo OK” does not itself change the placeholder/release mode or waive the separate PR/production-release gate. If “confirmed” is intended to remove a particular factual qualification, identify the exact assertion and its evidence; do not erase scoped caveats globally under this issue.

## Implementation surface / ambiguity

Current sources include `src/main.tsx` and `index.html` (homepage guide/fallback), `scripts/generate-candidate-pages.mjs` (mayoral guide and alternate photo-review link), and `scripts/generate-council-pages.mjs` (council photo-review alternate link and taxonomy labels), backed by `src/candidate-details.json`, `src/issue24-evidence.json`, and `src/council-entity-links.json`. The guide also contains cutoff/coverage and evidence caveats; these must survive in the existing source sections, not be deleted merely because they share explanatory themes. Alternate Peter-identified URLs currently appear only in photo-review mode and differ from the primary compiled URL; retain both URLs and label the alternate by destination kind, preserving non-identity caveats. Scope does not authorize normalizing URLs or changing which uncertain items appear in review versus release.

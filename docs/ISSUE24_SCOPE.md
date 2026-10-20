# Issue #24 — unified candidate content and routing scope

**Status:** analyst requirements, 20 October 2026. Requirements only; no candidate data verification or implementation. Applies to all eight mayoral candidates and all 44 council candidates in the supplied research attachment, subject to reconciliation with current official rosters. No publication or release approval. Basis: [project charter](PROJECT_CHARTER.md), [research protocol](RESEARCH_PROTOCOL.md), [team contract](AGENT_TEAM.md), [homepage](INITIAL_HOMEPAGE_SPEC.md), [mayoral detail](CANDIDATE_DETAIL_PAGES_SPEC.md), [issue #20](ISSUE_20_COUNCIL_CANDIDATE_SCOPE.md), and [issue #22](ISSUE_22_COUNCIL_FACEBOOK_PORTRAIT_SPEC.md).

## Goal and scope

Use one shared candidate-detail content model and page template, with office-specific sections/fields where relevant. Preserve distinct roles, lists, and comparison contexts: mayoral candidates must never be merged into the council roster. Every record has the same schema, ordering, source/status conventions, and display caps as peers in its office. Council roster and mayoral eight remain subject to current official-record reconciliation before factual implementation.

The supplied attachment is a working secondary research compilation for **44 council candidates** (15/19/10 by obvod) and documents external photo URLs, PDF page locations, Facebook/team links and confidence caveats. Treat it as an index and lead set, not authoritative registration, identity, rights, or candidate-position evidence. Resolve facts against primary records and the cited originals. The attachment notes that photos are externally hosted/not bundled and that some links retain earlier confidence without fresh independent verification.

## Shared schema and source model

Use a common candidate record with `candidateId` (stable ASCII internal ID), `office` (`starosta` or `poslanec`), `registeredName` (exact current official spelling), `officialRecord[]`, `sourceItems[]`, `candidateChannels[]`, `photos[]`, `updatedAt`, and field-level `status`. Office-specific data:

- Mayor: official ballot number only when corroborated by the appropriate official record; comparable profile sections already defined in the mayoral detail spec (employment, experience/projects, prior-term functions, channels, company roles, interviews, and candidate-stated programme/priority summary).
- Council: `constituency`, official list/nomination label, and source-defined list sequence/identifier where current records provide them; optional directly attributable candidate-stated programme/priority summary. Do not imply a ballot number from a roster sequence.

Each assertion/item references one or more source records. A source record contains canonical URL, publisher/author, medium, original date or `unknown`, observed/checked date, assertion supported, identity/ownership bridge when relevant, status (`official_fact`, `candidate_statement`, `third_party_context`, `unverified_lead`, `not_established`, `inaccessible`), and limitations. Public copy distinguishes official facts from attributed statements; third-party comments are leads, not evidence of candidate position. Keep allegation and private-resident content out of profiles. Empty states use a shared, scoped form: **“Rozhodnutie nebolo doložené v preskúmaných zdrojoch k [date].”** Never imply refusal, absence, or proof from a search gap.

Use one comparable compact summary field across candidates where sourced: at most one candidate-stated priority/programme summary, 70 Slovak words, linked to its original. This is a display cap, not evidence of equal available material; research effort and status/gap must be recorded for every candidate.

## Canonical routes and dual-office behavior

Keep one canonical detail URL per person. Use the established mayor route `/kandidati/{stable-id}/` for a person standing for mayor, including every dual-office candidate; use `/kandidati-na-poslancov/{stable-id}/` for council-only candidates. Stable IDs do not change with spelling or roster ordering. The four verified dual registrations are Bartók, Cirbus, Koštial, and Turenič. Their mayoral and council list cards must point to the same person page. Preserve both separate registration records, official facts, source links and office-specific comparison fields inside that shared page. Do not silently privilege one candidacy.

On a dual-office profile, state prominently and neutrally that the person stands for mayor **and** council, including council district and a link to each official list. Both list cards remain in their separate office rosters and point to that single canonical page. Page title, H1, breadcrumb/back navigation and accessible names must convey both offices where applicable. The old council URL for those four people should redirect to the person page, rather than remain a second detail page. Set a self-referencing canonical URL. Direct load and refresh work. Office-specific registration facts and sources remain independently attributable.

Homepage/list headings must distinguish **Kandidáti na starostu obce** and **Kandidáti na poslancov obecného zastupiteľstva**. Keep roster ordering based on the applicable official record, not popularity or editorial ranking. No ambiguity from standalone “kandidáti” where office matters.

## Link and connection taxonomy

Render links with explicit kind and relationship; do not conflate nomination, endorsement, team association, account ownership, and a source mentioning a person:

1. `official_record` — municipal/election authority registration or decision.
2. `candidate_owned_channel` — candidate-controlled/self-identified site or social page with direct ownership bridge.
3. `candidate_appearance` — candidate-specific post/interview/profile published by a third party; says who published it, not that the candidate owns the source.
4. `team_or_campaign_presentation` — explicit, sourced team/campaign presentation; identify the presenting entity and evidence.
5. `official_nominator` — exact nomination/list label from official record; never automatically translate it into mayoral endorsement/team membership.
6. `third_party_context` — news/community material usable only with clear attribution and suitable editorial review; not candidate position or identity proof.
7. `unverified_lead` / `inaccessible` — retain as research states. A supplied probable or historical URL may be linked in the review preview only with a conspicuous "possible/unverified" or historical label; never display it as a confirmed personal account or candidate position.

Connection assertions use `connectionType` (`official_nominator`, `explicit_team_membership`, `candidate_for_mayor`, `candidate_for_council`, `candidate_owned_by`, `presented_by`, `interviewed_by`, `mentioned_by`), `from`, `to`, source IDs, dates, and confidence/status. Only direct, sufficiently corroborated evidence supports confirmed identity/team links. Do not infer team membership from “independent,” visual design, shared list label alone, supporter claims, or comments. A shared page is clearly labelled as a team/shared page, not a personal profile. Unverified/probable account links remain out of public navigation.

## Photos and supplied assets

Peter explicitly directed the team on 20 October to use the supplied photo URLs and PDF sources in the review preview. Do use those references to locate and visually verify candidate-photo evidence, including PDF page extraction/contact-sheet or equivalent review where useful; record the precise PDF URL, viewer page and printed page, location/description, candidate-to-depiction rationale, and checked date. Keep the final/release build separately placeholder-only until Peter reviews the concrete preview and approves release. Do not hotlink campaign servers in the site.

Represent each image as separate `photo` evidence: original URL/source/publisher or photographer if known, image kind (`direct_image`, `current_pdf_photo`, `archival_pdf_photo`, `candidate_post_photo`, `none`), year/currentness, identity basis, required credit, suitability, review status, and any still-open attribution. A PDF containing a recognizable photo is not a standalone image. Archival photographs must be labelled by year and never presented as current. Illustrations/drawings are not portraits. A photo attached to a social post does not establish account ownership. Where the supplied attachment and source do not reliably identify a photo for a person, use the same neutral placeholder. Portraits have the same size/opportunity and cannot affect ordering, emphasis, card dimensions, or profile richness. No AI-generated likenesses and no hotlinking to campaign servers.

## Acceptance criteria

1. **Roster and parity:** current official records/amendments reconcile exact names, unique IDs, role, council obvod/list grouping/order, and mayoral ballot numbers where applicable. Rendered rosters match one-to-one with no omissions, duplicates, cross-office leakage, or unsupported ordering. Audit equal fields, research method/effort, empty-state wording, summary cap, and visual treatment within each office.
2. **Schema/provenance:** every displayed candidate-specific assertion has source record(s), publisher, original date or unknown, last-checked date, status, and limitations; official fact and candidate statement are visibly distinguishable. Not-established/inaccessible states do not imply nonexistence or refusal. No inferred positions or unverified allegations.
3. **Dual-office routes:** each person has one canonical page. All four dual candidates have both candidacies and official sources on that page; both office-list cards link there. Legacy council paths redirect to it. Direct URL/refresh/back navigation work; unknown IDs resolve to not-found; no route collision. Council-only candidates retain their established route.
4. **Link semantics:** each displayed source link uses the taxonomy above and identifies whether it is an official record, candidate-owned channel, third-party candidate appearance, or explicit team presentation. Supplied probable/historical URLs are visibly qualified, not presented as confirmed candidate accounts or position sources; Peter's previously identified entity URLs remain available with their editorial-identification caveat. Official nomination is not presented as mayoral endorsement.
5. **Photo evidence and treatment:** attachment URLs/PDF page references are reviewed as evidence leads; each used preview photo has identity, source, year, crop, and available credit recorded. PDF extracts are traceable to exact pages. Unclear identity yields uniform placeholder, not a guessed image. No external hotlink or asymmetrical prominence. The final/release build remains placeholder-only pending Peter's review and approval.
6. **Accessibility and responsive behavior:** office labels and profile titles are explicit; semantic headings, keyboard navigation, visible focus, descriptive link names, mobile layout, readable sources, no-JS roster fallback, and reduced-motion behavior pass independent review. Routes retain role context.
7. **Handoff/release:** researcher provides field-level coverage/gap ledger, including all candidate/source attempts and bounded coverage. Reviewer independently verifies rosters, links, routes, source/status parity, image provenance/rights and responsive accessibility. No publication/deployment is authorized by this spec; human editorial approval remains required.

## Open decisions / ambiguities

- Reconcile the attachment's 44-candidate compilation and all dual-office examples with the latest official registrations and amendments before treating counts/identities as settled.
- The attachment provides 2026 PDF viewer pages and printed-page clues, but exact extraction/crop coordinates and asset reuse rights are not established; research must record them without assuming permission.
- Facebook/team link confidence varies; some entries explicitly retain prior confidence without fresh verification. Recheck only to the project protocol and keep probable/unverified links internal.
- Programme/priority summary is recommended at one/70 words as a shared default; lead may replace the cap globally before implementation, never selectively.
- Whether all qualified third-party interviews and non-Facebook channels are included follows the shared mayoral-detail criteria; any expansion must apply consistently to both offices where relevant.
- Correction route/owner and final candidate-copy sign-off are not specified in the source docs; settle before release, not as an implementation guess.

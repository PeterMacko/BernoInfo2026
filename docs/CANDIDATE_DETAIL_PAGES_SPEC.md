# Mayoral candidate detail pages — requirements and content model

Status: proposed editorial specification, 18 October 2026. Covers the eight registered mayoral candidates equally; supplies **no candidate-specific factual copy** and grants no publication approval. The homepage's three-field cards remain governed by `docs/INITIAL_HOMEPAGE_SPEC.md`.

## Purpose and presentation

Provide one page per registered candidate, reachable from the equal homepage cards, with identical headings, field order, labels, source treatment, and search/review effort. Use the municipality's current corrected registration record to establish the eight identities and exact registered names; verify changes before release. Do not rank, score, recommend, highlight, or infer a position from third-party comments. A candidate's silence, lack of a discovered source, or inaccessible page is not a negative assessment. Keep all eight pages available together; if research remains incomplete, mark the affected fields precisely, not the person.

A neutral page sequence is: registered identity and official-list source; employment; prior experience and projects; elected/appointed functions in the prior term; candidate-owned Facebook and homepage links; public company roles in FinStat; YouTube interviews; source/last-checked note and correction route. A field with no publishable evidence retains the same heading and a standard state such as **Not established from reviewed sources**. Never convert an empty field into “none,” “never,” or “no affiliation.” Do not reproduce private-group material, ordinary residents' personal details, or unreviewed accusations.

## Structured content model

Each of the eight records uses the same schema and editorial limits. Store source records separately and link every displayed assertion or item to its supporting source ID(s).

| Field | Rule and public rendering |
| --- | --- |
| `candidateId`, `registeredName`, `officialRecord` | Stable ID; exact official name; canonical registration URL, document date if known, observed/last-checked date. Do not call a list sequence a ballot-paper number until the ballot is checked. |
| `employment[]` | Current work/employer or self-employment, role, effective/as-of date and status. State **Candidate says** for a self-description; use **Verified in [record]** only for what that record actually establishes. Do not infer current employment from an old biography or company role. |
| `experienceProjects[]` | Prior role/project name, organization, dates, candidate's described contribution, and independent verification if available. Distinguish participation, leadership, and ownership; do not turn a project aspiration into an accomplishment. Apply the same concise item/word cap to all eight; allow a link to the full source instead of selectively expanding one biography. |
| `priorTermFunctions[]` | Public elected or appointed function, body/municipality, capacity, start/end dates, appointing/election record and source. Define the relevant prior municipal term consistently (see open decisions). Separate candidacy from holding office, and a committee/board appointment from an elected mandate. “No verified role found” is a research state, not proof of none. |
| `candidateChannels` | At most one primary candidate-owned Facebook page/profile and one primary homepage in the uniform link slots, plus an equally available “other official channels” list if needed. Record URL, claimed/verified operator basis, observation date, accessibility and active/archived status. Link only where the candidate's control or self-identification is sufficiently supported; label uncertainty. Do not equate a supporter group with a candidate-owned channel. |
| `companyRoles[]` | FinStat-listed company name, identifier (IČO), role exactly as recorded, recorded date/period if exposed, observed date, and **direct URL to that company's/person-role record**. Distinguish current vs historical, statutory office vs ownership/other association, and FinStat aggregation from an authoritative registry. No role inferred solely from a same-name search result. A role is not evidence of misconduct or current employment. |
| `youtubeInterviews[]` | Direct video URL, publisher/channel, title, publication date (or unknown), observed date, format, candidate identity/participation basis, and neutral interview label. Include comparable qualifying interviews under one rule, whether hosted by the candidate or a third party; mark candidate-published vs independent host. Link to originals; do not copy transcripts or imply agreement with the host. |
| `sourceStatus` | Per-field state: `verified_official`, `verified_primary_record`, `candidate_statement`, `third_party_report`, `unverified_lead`, `not_established`, or `source_inaccessible`. Public copy distinguishes official/record facts, attributed candidate claims, and research gaps. Unverified allegations are not included as biographical facts. |

Every source record keeps canonical/direct URL, publisher/author, medium, original publication or record date (explicitly unknown if unavailable), date observed, exact claim supported, candidate/topic, identity-match rationale, corroboration and limitations, reviewer, and suitability for public use. Public pages show an adjacent source link and **source date plus last-checked date** for factual items or a clearly scoped shared note when several items use the same record. Preserve changes/corrections in the private research ledger. Avoid unsupported “currently,” “all,” and “only.”

## Identity and evidence rules

- Match an employment, company record, page, or interview to the registered person using more than a shared name: e.g. explicit Bernolákovo candidacy/self-link, municipality and role, candidate-controlled cross-link, official identifier where legitimately public, or another independent corroborating source. Record the chain. If ambiguous, withhold the assertion/link and mark it unresolved.
- The official candidate notice proves registration, not job history, company ownership, Facebook control, or interview authorship. Candidate-owned channels prove what the candidate **states**, not the truth of every statement. News/community material can generate questions but cannot alone establish a disputed claim.
- For FinStat, preserve its exact role terminology and direct record link. Check the underlying Slovak register where material or ambiguous, especially role dates/currentness; record any discrepancy. A cached/search snippet or name-match list is insufficient. Do not publish personal identifiers beyond what is necessary to disambiguate a public company role.
- YouTube inclusion requires the candidate to be identifiable and materially interviewed about the election or public work, not merely mentioned, present in footage, or described in a third-party comment. Record unavailable/deleted videos as gaps; do not imply a candidate declined an interview.
- Use the same discovery window, queries/source types, inclusion criteria, item cap, and review depth for all eight; record coverage and inaccessible sources. Candidate-supplied corrections receive the same process and attribution. No selective omission to manufacture symmetry: if counts differ, the headings and standards stay equal and the source-backed differences remain visible.

## Acceptance criteria

1. Exactly eight pages map one-to-one to the current official registered list, with exact names, neutral order/navigation, and identical section structure. An independent reviewer checks the official source and that no candidate receives extra visual prominence.
2. Each displayed employment, experience/project, and prior-term function item has its own attributable source, source/record date (or “unknown”), last-checked date, and accurate fact-versus-claim label. Scope, dates, and function type are not overstated.
3. Each candidate has the same Facebook/homepage link slots. A displayed link is live at review time and supported as candidate-owned/self-identified; an absent or inaccessible link uses the standard non-judgmental state.
4. Every FinStat entry has a direct record URL, IČO, exact role wording, period/currentness qualification, observation date, and documented identity match. Ambiguous names or conflicting registers are withheld pending review.
5. Every YouTube item has a direct working video link, publisher, publication/checked dates, identity/participation check, and consistent inclusion rule. No unlicensed transcript or lengthy copied text appears.
6. The eight-page coverage ledger records search method, date window, actual material reached, gaps, and field-level status for each candidate. “Not found” is never rendered as a definitive absence without authoritative evidence.
7. A reviewer can trace every public factual sentence to the ledger and verify that allegations are excluded, candidate statements are attributed, corrections are logged, and the same item/word limits and editorial standards were applied to all eight.
8. Links, headings, mobile layout, keyboard access, focus, contrast, and reduced-motion behavior receive independent review. Publication/deployment remains a separate human-approved gate under the charter.

## Open decisions for lead / Peter

- Define “prior term”: 2022–2026 Bernolákovo municipal term only (recommended for comparability), or include other public bodies/geographies; set the exact start/cutoff dates before research.
- Set a uniform maximum for experience/projects and interviews (and whether to link to an overflow source list), plus a common discovery cutoff. Different amounts of available material should not be mistaken for different search effort.
- Decide whether third-party-hosted YouTube interviews belong in the main list (recommended if the candidate materially participates) and whether non-YouTube interviews receive a separate, equally available field.
- Choose the public wording for FinStat's aggregator status and when underlying-register corroboration is mandatory. Resolve any conflicting or ambiguous identity/role record before display.
- Confirm whether contact/correction information is a shared site route or a repeated identical page element, and who signs off on candidate-specific copy and disputed corrections.

## Private-preview defaults pending editorial sign-off (18 October)

For this eight-page private preview, the lead uses the 2022–2026 Bernolákovo municipal term; at most two experience/completed-project items (70 Slovak words each), one separately labelled programme summary (70 words), and one comparable LanCast interview link per candidate. These are **uniform display caps**, not findings about how much material exists. The common evidence cutoff is 18 October 2026. Third-party-hosted YouTube interviews qualify when named participation is supported; a caption-based identification must retain its limitation. No FinStat item appears without a direct record, IČO and identity bridge. These defaults can be revised consistently across all eight before publication.

Candidate-specific prose remains a draft until editorial sign-off. The public correction channel and sign-off owner are not set; the private preview must not imply a usable correction route exists. The [field-level coverage matrix](research/EIGHT_CANDIDATE_DETAIL_EVIDENCE_2026-10-18.md) indexes reached evidence but explicitly does not claim a complete or uniformly logged search. Peter's release approval is separate from copy review and all other gates.

## Basis

Derived from the project charter, research protocol, and team contract in `/home/pmacko/projects/BernoInfo2026/docs/`, read 18 October 2026. The municipality's candidate notice (https://www.bernolakovo.sk/novinka/139303/n) is the required registration baseline; the corrected-list and ballot-number caveat are documented in `docs/CANDIDATE_CARD_RESEARCH_2026-10-17.md`. This requirements document does not independently verify any candidate biography, FinStat record, social account, or video.

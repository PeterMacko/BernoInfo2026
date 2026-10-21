# Issues #43–45 — connected-candidate presentation

## Editorial rule

Use only relationships already represented in the source-qualified profile evidence. A common nominator, independent registration, or a shared source link is not itself a mayoral alliance. Distinguish campaign-presented team membership from a reported or unverified association in visible copy. Do not enlarge the relationship graph from roster labels. Retain existing preview-only treatment for the four Turenič campaign-introduction leads from the working compilation. Peter's separate 21 October five-person report is already present in the release profile under issue #41; preserve it in all build modes, explicitly unverified, and do not silently promote it to a verified team.

## Profile acceptance

- Use the same photo-first linked card anatomy on every section listing related council candidates, including Turenič's five-person reported-association section. Show an approved/review portrait only in the corresponding authorized build mode; otherwise use the standard placeholder.
- Group related council candidates under Volebný obvod 1, 2, and 3 headings where members exist, retaining official list order within each district. The headings describe each candidate's official council district, not a relationship type. Do not add empty district groups.
- Keep the current section-level relationship wording, source, date, uncertainty, and canonical person links. Handle dual-office candidates as one person with a canonical profile route.

## Homepage acceptance

- Show an independently operable corner button only for cards with an existing source-qualified relationship. Button activation selects that person's connected set; activating it again clears, and another button switches the set. Include mayoral and council appearances of a dual-office person in the same selection.
- Visually distinguish selected, related, and unrelated cards without hiding or reordering anyone. An accessible text status identifies the selection and qualification; buttons expose their state. The card's normal profile link remains usable across its remaining area, including without JavaScript.
- A reported or unverified connection must be visibly qualified, including in the button/status, and must follow its existing preview/release gate. In particular, the five-person Turenič report is shown with its qualification in all modes, whereas the distinct four-person working-attachment introductions remain photo-review-only. Homepage display must never imply that a highlighted set is an official electoral slate.
- Check keyboard and touch interaction, narrow mobile layout, reduced motion, release/preview modes, and source/profile navigation.

## Evidence boundary

Official district and list order: `src/council-candidates.json` and its linked corrected municipal PDFs. Relationship evidence: `src/issue24-evidence.json`, `docs/research/ISSUE24_PDF_PHOTO_AND_CONNECTION_MAP_2026-10-20.md`, and `docs/research/ISSUE41_SUPPLIED_TRANSPARENCY_LINK_LEDGER.md`. Existing photo-availability/build-mode gate applies. Social-source sweep remains partial.

Fail generation on a relationship ID not found in the official council roster; do not silently infer a district or omit a person. The relationship's profile section and citation remain the source-of-truth context. Homepage buttons are disclosure/navigation aids, not independent evidence.

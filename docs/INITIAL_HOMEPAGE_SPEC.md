# Initial homepage: eight mayoral candidates — issue-ready specification

Status: proposed requirements, 17 October 2026. Scope: homepage prototype/preview only. This document is not a verified candidate record or a publication approval.

## Objective and boundary

Give a Bernolákovo voter an immediate, non-ranked view of **all eight officially registered mayoral candidates** for the 24 October 2026 municipal election. Each candidate tile displays **only a photograph, the official ballot number, and the registered name**. No slogan, party/endorsement, biographical snippet, position, quote, sentiment, score, popularity metric, or call to vote appears on a tile. Do not infer or fill any field from Facebook comments or third-party discussion.

A compact page heading identifying the election and a shared source/last-checked note may sit outside the tiles. The source note is required by the charter; it should link to the municipality's registered-candidate notice and state when the list and numbers were checked. If the official notice is insufficient for ballot numbers, cite the additional official election record used. No candidate-specific source or caption should make one tile richer than another. Council candidates, voting instructions, comparison views, and candidate detail pages are outside this first issue.

## Source-of-truth and editorial handoff

- Researcher supplies a reviewed eight-row ledger from the current official notice: https://www.bernolakovo.sk/novinka/139303/n, plus any official record needed for ballot numbers. Record the exact official spelling, diacritics, number, canonical URL, document/date, and checked-at date for every row. The supplied notice URL is a baseline, **not an assertion that its contents were verified for this spec**.
- Validate that there are exactly eight unique registered candidates and eight unique official numbers before creating preview content. Sort ascending by official ballot number. Do not use source discovery order, perceived prominence, alphabetical order, or a randomized presentation.
- Names/numbers must be transcribed, not silently normalized. If official sources conflict, stop factual insertion, record the discrepancy, and ask the lead/researcher for resolution; never guess.
- The lead reviews the ledger and photo-rights evidence before developer content work. Human editorial review is required before public release or Cloudflare rollout per project charter.

## Content model

Public card record (same required fields for all eight):

| Field | Type/rule | Display |
| --- | --- | --- |
| `id` | Stable internal identifier; no rank semantics | No |
| `ballotNumber` | Positive integer exactly as on official ballot record; unique | Yes, with consistent label such as `Číslo 1` |
| `registeredName` | Exact official spelling/diacritics; nonempty | Yes |
| `photo` | Approved local image asset, with consistent aspect treatment | Yes |
| `photoAlt` | Neutral identification, e.g. candidate name; no evaluative wording | Accessibility only |

Private/source ledger associated with each card: official-name URL and observation date; ballot-number URL and observation date; photo original URL/provider, photographer/rightsholder, license or written permission and scope, attribution requirement and placement, access/expiry conditions, crop/derivative permission, and reviewer/approval status. Keep this evidence out of the visible candidate tile. No hotlinking to candidate-controlled servers. Strip unnecessary image metadata and avoid storing inaccessible/private-group imagery.

The shared page metadata includes election label, official source URL(s), list last-checked date, and a short neutral description of why the page exists. Dates are explicit, not an unqualified “current” claim. Build data must remain easy to replace when the official notice changes.

## Visual and interaction requirements

- Distinctive editorial layout, not campaign branding: a strong typographic hierarchy, disciplined grid, restrained neutral palette, generous whitespace, and a visual motif that does not favor a candidate. Candidate image dimensions, card area, image treatment, number size, name style, and spacing are identical in the design system. Do not assign colors, overlays, blur, animation, or decorative emphasis per candidate.
- Desktop: responsive grid showing all eight in a predictable scan order; mobile: one/two-column reflow preserving ascending number order and readable names. No carousel, pagination, filtering, “featured” hero, or initial clipping that obscures candidates. Long names wrap without truncation.
- GSAP may be used for a short shared entrance or subtle number/grid reveal only if all eight receive equivalent timing and visibility. Content is present and readable before animation code runs; animation failure cannot hide cards. Respect `prefers-reduced-motion: reduce` by disabling nonessential motion. Do not use motion implying relative importance.
- React Bits: choose at most a component whose styling/behavior is accessible and equal across cards; no effect is required merely because the library was suggested. Lenis is not needed for this short homepage; add it only if later long-form navigation has a demonstrated usability benefit, with native scrolling intact under reduced motion.
- Use semantic `main`, one clear `h1`, and a list/grid of eight candidate items. Ensure keyboard and screen-reader order matches visual ballot order. Do not make non-navigating cards appear clickable. If a source link is shown, give it a descriptive accessible name. Visible focus and sufficient contrast are mandatory.
- Portraits have consistent dimensions/crop rules but must not cut off faces or materially distort appearance. Document any candidate-specific crop adjustment as an image-quality correction, not as a prominence change. If approved photos differ in quality, avoid visual enhancement that selectively flatters or degrades an individual.

## Acceptance criteria

1. A reviewer can match all eight names and official ballot numbers, in ascending order, to cited current official record(s). There are no extras, duplicates, placeholders presented as facts, or spelling changes.
2. Each of eight tiles contains exactly the three requested visual data items: approved portrait, official ballot number, registered name. Every tile uses the same structure and visual rules; no candidate has more content or emphasis.
3. Photo-rights ledger exists for every image, including photographer/rightsholder, reuse authority, derivative/crop rights, and attribution handling. Required attribution is displayed consistently outside the tiles (for example, one compact photo-credits section) or the image is not used. A photo URL found online is not, by itself, permission.
4. If a portrait lacks defensible rights or sufficient quality, the preview remains explicitly blocked for release; the lead decides whether to obtain rights, use a uniformly applied alternative, or revise the photo requirement. Do not silently substitute a candidate's social avatar or an AI-generated likeness.
5. Heading and shared source note visibly identify the election, link official source(s), and show the factual last-checked date. No statement about candidate positions or voting logistics appears without its own separately reviewed source.
6. At common mobile and desktop widths, all eight remain discoverable in ballot order; names are legible and never truncated; no horizontal overflow or face-obscuring crop. Non-JS or failed-motion fallback leaves the candidate content visible.
7. Keyboard/screen-reader traversal follows ballot order; image alternatives are neutral, link text is meaningful, contrast/focus are sufficient, and reduced-motion mode avoids decorative animation. Verify on mobile as well as desktop.
8. Preview and independent review are complete before merge/deployment; publication and Cloudflare rollout remain a separate human-approved gate.

## Open decisions for lead/Peter

- Confirm whether “only photo, number, name” applies to the **tiles** (recommended) while allowing a shared heading, official-source/checked date, and legally required photo credits elsewhere on the page. The charter's source-date rule makes a page with literally no source note unsuitable for release.
- Approve the specific portrait acquisition path and credit placement. Candidate-provided photos are usable only with documented permission/reuse scope; an official registration photo is not automatically licensed for site reuse.
- Decide how to handle one or more candidates with no rights-cleared portrait. The photo requirement and fair/equal treatment must be reconciled before release; the prototype may use clearly non-public fixture data/assets only if unmistakably marked as such.
- Confirm whether official ballot number means the number shown in the municipality's candidate notice or a separate official ballot document if these differ.

## Provenance

Derived from `docs/PROJECT_CHARTER.md`, `docs/RESEARCH_PROTOCOL.md`, and `docs/AGENT_TEAM.md` in the BernoInfo2026 project, read 17 October 2026. This spec intentionally does not supply candidate names, numbers, or photos before the research/editorial handoff.

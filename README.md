# BernoInfo 2026

A neutral, sourced guide to the 2026 municipal election in Bernolákovo, Slovakia. This branch is a **development homepage and photo-review preview**, not a final publication approval. Its Cloudflare preview URL is publicly reachable.

## Local preview

Run `npm ci`, then `npm run dev` for a local browser preview. On this review branch, `npm run build` creates the publicly reachable **unapproved PR preview**: eight previously staged photos on the mayoral pages, the same source images on four overlapping council pages, and the separate 44-card `/issue22-review/` route with four images and 40 placeholders. `npm run build:placeholder` remains the isolated all-placeholder build and does not copy candidate photos into `dist/`. This review-branch build configuration must not be merged into a release unchanged. `npm run review:issue22` separately generates a private local research review at `.private/issue22-review/index.html`; local originals, if present, remain outside `public/` and `dist/`. The app includes `noindex, nofollow` while under review, but that does not restrict access.

## Content and image handoff

`src/candidates.ts` contains the eight registered names and the *corrected municipality list numbers* in source order. The numbers are not labelled ballot-paper numbers. The page links the [corrected official list](https://www.bernolakovo.sk/data/advertisement/bernolakovo.sk/532238/204396_zoznam-zaregistrovanych-kandidatov-pre-volby-starostu-obce.pdf) and [municipal notice](https://www.bernolakovo.sk/novinka/139303/n), both checked 17 October 2026.

The review preview shows all eight mayoral photos and four council-overlap photos solely for source and crop review, as Peter requested. These review copies live under `preview-assets/candidates/` on this branch and are copied into the Cloudflare preview build; they are **not** in the approved-portrait manifest. The isolated all-placeholder build still renders the same non-likeness placeholder for all eight mayoral candidates and no candidate photos on council pages. Before final release, complete identity, photographer/rightsholder and credit, quality, and equal-treatment review for every photo; then populate `approvedPortraits` in `src/candidates.ts` with a reviewed local asset for each candidate. Do not merge this preview-only build configuration into production unchanged.

Independent factual, fairness, accessibility, responsive, and source-link review is still required before release. Merge or deployment requires separate approval.

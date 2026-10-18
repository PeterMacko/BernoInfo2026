# BernoInfo 2026

A neutral, sourced guide to the 2026 municipal election in Bernolákovo, Slovakia. This branch is a **development homepage and photo-review preview**, not a final publication approval. Its Cloudflare preview URL is publicly reachable.

## Local preview

Run `npm ci`, then `npm run dev` for a local browser preview. On this development branch, `npm run build` creates the eight-photo review build used by Cloudflare; `npm run build:placeholder` creates the all-placeholder build. The app includes `noindex, nofollow` while under review, but that does not restrict access.

## Content and image handoff

`src/candidates.ts` contains the eight registered names and the *corrected municipality list numbers* in source order. The numbers are not labelled ballot-paper numbers. The page links the [corrected official list](https://www.bernolakovo.sk/data/advertisement/bernolakovo.sk/532238/204396_zoznam-zaregistrovanych-kandidatov-pre-volby-starostu-obce.pdf) and [municipal notice](https://www.bernolakovo.sk/novinka/139303/n), both checked 17 October 2026.

The development preview now shows all eight candidate photos solely for source and crop review, as Peter requested on 18 October. These review copies live under `preview-assets/candidates/` on this branch and are copied into the Cloudflare preview build; they are **not** in the approved-portrait manifest. The all-placeholder build still renders the same non-likeness placeholder for all eight. Before final release, complete identity, photographer/rightsholder and credit, quality, and equal-treatment review for every photo; then populate `approvedPortraits` in `src/candidates.ts` with a reviewed local asset for each candidate. Do not merge this preview-only build configuration into production unchanged.

Independent factual, fairness, accessibility, responsive, and source-link review is still required before release. Merge or deployment requires separate approval.

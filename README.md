# BernoInfo 2026

A neutral, sourced guide to the 2026 municipal election in Bernolákovo, Slovakia. This branch is a **private homepage prototype**, not a publication approval.

## Local preview

Run `npm ci`, then `npm run dev` for a local browser preview or `npm run build` and `npm run preview` to inspect the production build. The app is a single page and includes `noindex, nofollow` while under review. No Cloudflare deploy is needed for review.

## Content and image handoff

`src/candidates.ts` contains the eight registered names and the *corrected municipality list numbers* in source order. The numbers are not labelled ballot-paper numbers. The page links the [corrected official list](https://www.bernolakovo.sk/data/advertisement/bernolakovo.sk/532238/204396_zoznam-zaregistrovanych-kandidatov-pre-volby-starostu-obce.pdf) and [municipal notice](https://www.bernolakovo.sk/novinka/139303/n), both checked 17 October 2026.

All eight cards currently render the same local, non-likeness placeholder at `public/images/portrait-placeholder.svg`. To replace it, first complete independent rights and identity review **for all eight portraits**: original URL, photographer/rightsholder, reuse and crop authority, attribution requirement and placement, and quality/identity approval. Put the approved, optimized assets under `public/images/candidates/`. Then populate the `approvedPortraits` manifest in `src/candidates.ts` with one local path for each candidate ID, and add any required photo credits outside the cards. Do not switch to real portraits until the complete manifest and credits are ready. Do not hotlink photos or publish the private Facebook-derived copies as approved assets.

Independent factual, fairness, accessibility, responsive, and source-link review is still required before release. Merge or deployment requires separate approval.

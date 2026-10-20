# BernoInfo 2026

A neutral, sourced guide to the 24 October 2026 municipal election in Bernolákovo, Slovakia.

## Build modes

Run `npm ci` first. `npm run build` is the public-release build used by Cloudflare Workers Builds. It includes Peter-reviewed candidate photos, excludes the review-only route, labels, and uncertain social leads, and removes the homepage `noindex` tag. `npm run build:photo-review` retains review labels and uncertain leads on the publicly reachable branch preview. `npm run build:placeholder` creates an isolated all-placeholder build without candidate JPGs. `npm run review:issue22` separately generates a private local research review at `.private/issue22-review/index.html`.

The default build change follows Peter's 20 October confirmation that he checked all detail photos and information and has permission to publish them. Five council candidates retain the same neutral placeholder where no usable photo was confirmed. Source and archival-year distinctions are preserved on candidate pages. The five supplied Facebook sources and candidate-owned discovery remain **partially** reviewed, not exhaustive. The municipality's corrected rosters are the baseline; list sequence is not asserted to be ballot number. See [release check](docs/reviews/RELEASE_CHECK_2026-10-20.md) and [issue #22 research](docs/research/ISSUE22_COUNCIL_FB_PORTRAIT_DISCOVERY_2026-10-19.md).

`npm test` checks rosters, routes, source-link boundaries, and the three build modes. `npx wrangler deploy --dry-run` checks Workers asset packaging without publishing. The Cloudflare configuration is in `wrangler.jsonc`.

## SEO origin and social metadata

The final build pass writes page-specific metadata into the **initial HTML** for the homepage, eight mayoral/shared profiles, 40 council-only profiles and the street fallback. A site-owned 1200 × 630 PNG at `/images/bernoinfo-social.png` is used for all social cards; candidate portraits are never used. Redirect stubs are noindex with an absolute canonical to the unified profile and no social card. The 404 is noindex with no canonical or social card.

Set `SITE_ORIGIN` to the exact public HTTPS origin (no path or trailing slash), and set `RELEASE_ORIGIN_VERIFIED=1` **only after checking that hostname resolves to this release**. `npm run build` fails without both values. Do not use a preview hostname for the release build. Preview commands (`npm run build:placeholder` and `npm run build:photo-review`) remain noindex; pass their own preview hostname as `SITE_ORIGIN` to get self-referencing absolute canonical URLs. Placeholder previews also get social cards; photo-review builds suppress social cards so review-only material is not promoted. With no preview origin they omit URL-bearing canonical/social tags rather than claiming a release URL. The configured origin is a build input, not a runtime secret. A preview needs a rebuild if its final hostname differs from the supplied value.

For local verification, use an illustrative origin such as `SITE_ORIGIN=https://preview.example.org npm run build:placeholder`; this does not establish a deployable origin. The `tests/seo-metadata.test.mjs` check uses illustrative origins only. Hosted preview URL and HTTP/image checks remain an independent review gate before handoff.

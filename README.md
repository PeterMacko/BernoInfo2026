# BernoInfo 2026

A neutral, sourced guide to the 24 October 2026 municipal election in Bernolákovo, Slovakia.

## Build modes

Run `npm ci` first. `npm run build` is the branch-aware Cloudflare Workers Build. It includes Peter-reviewed candidate photos and excludes review-only labels and uncertain social leads. Non-main branch builds stay noindex; only `main` removes noindex. `npm run build:photo-review` retains review labels and uncertain leads on the publicly reachable branch preview. `npm run build:placeholder` creates an isolated all-placeholder build without candidate JPGs. `npm run review:issue22` separately generates a private local research review at `.private/issue22-review/index.html`.

The default build change follows Peter's 20 October confirmation that he checked all detail photos and information and has permission to publish them. Five council candidates retain the same neutral placeholder where no usable photo was confirmed. Source and archival-year distinctions are preserved on candidate pages. The five supplied Facebook sources and candidate-owned discovery remain **partially** reviewed, not exhaustive. The municipality's corrected rosters are the baseline; list sequence is not asserted to be ballot number. See [release check](docs/reviews/RELEASE_CHECK_2026-10-20.md) and [issue #22 research](docs/research/ISSUE22_COUNCIL_FB_PORTRAIT_DISCOVERY_2026-10-19.md).

`npm test` checks rosters, routes, source-link boundaries, and the three build modes. `npx wrangler deploy --dry-run` checks Workers asset packaging without publishing. The Cloudflare configuration is in `wrangler.jsonc`.

## SEO origin and social metadata

The final build pass writes page-specific metadata into the **initial HTML** for the homepage, eight mayoral/shared profiles, 40 council-only profiles and the street fallback. A site-owned 1200 × 630 PNG at `/images/bernoinfo-social.png` is used for all social cards; candidate portraits are never used. Redirect stubs are noindex with an absolute canonical to the unified profile and no social card. The 404 is noindex with no canonical or social card.

Workers Builds injects `WORKERS_CI_BRANCH`. `npm run build` uses release mode only for `main`, where canonical/social URLs use the verified production origin `https://bernoinfo2026.mr-petermacko.workers.dev`. Non-main branches use a noindex preview mode with photos and public-safe content; their canonical/social URLs use `https://<branch-slug>-bernoinfo2026.mr-petermacko.workers.dev` (for example, `/` becomes `-`). The preview must be checked at its hosted URL before handoff. An explicit `SITE_ORIGIN` override is allowed for a preview's actual HTTPS host, but cannot equal the production origin. An unusual or overlong branch alias fails rather than guessing.

For a **local** release build without `WORKERS_CI_BRANCH`, set a bare HTTPS `SITE_ORIGIN` (no path or trailing slash) and `RELEASE_ORIGIN_VERIFIED=1` after verifying it. A release build fails without both. Placeholder and photo-review builds remain noindex; a supplied `SITE_ORIGIN` gives them self-referencing absolute canonical URLs. Photo-review builds suppress social cards. With no origin they omit URL-bearing tags rather than claiming a release URL. These are build inputs, not runtime secrets. Main is not merged or deployed by this PR; Peter's approval remains required.

For local verification, use an illustrative origin such as `SITE_ORIGIN=https://preview.example.org npm run build:placeholder`; this does not establish a deployable origin. The `tests/seo-metadata.test.mjs` check uses illustrative origins only. Hosted preview URL and HTTP/image checks remain an independent review gate before handoff.

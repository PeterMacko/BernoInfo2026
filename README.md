# BernoInfo 2026

A neutral, sourced guide to the 24 October 2026 municipal election in Bernolákovo, Slovakia.

## Build modes

Run `npm ci` first. `npm run build` is the public-release build used by Cloudflare Workers Builds. It includes Peter-reviewed candidate photos, excludes the review-only route, labels, and uncertain social leads, and removes the homepage `noindex` tag. `npm run build:photo-review` retains review labels and uncertain leads on the publicly reachable branch preview. `npm run build:placeholder` creates an isolated all-placeholder build without candidate JPGs. `npm run review:issue22` separately generates a private local research review at `.private/issue22-review/index.html`.

The default build change follows Peter's 20 October confirmation that he checked all detail photos and information and has permission to publish them. Five council candidates retain the same neutral placeholder where no usable photo was confirmed. Source and archival-year distinctions are preserved on candidate pages. The five supplied Facebook sources and candidate-owned discovery remain **partially** reviewed, not exhaustive. The municipality's corrected rosters are the baseline; list sequence is not asserted to be ballot number. See [release check](docs/reviews/RELEASE_CHECK_2026-10-20.md) and [issue #22 research](docs/research/ISSUE22_COUNCIL_FB_PORTRAIT_DISCOVERY_2026-10-19.md).

`npm test` checks rosters, routes, source-link boundaries, and the three build modes. `npx wrangler deploy --dry-run` checks Workers asset packaging without publishing. The Cloudflare configuration is in `wrangler.jsonc`.

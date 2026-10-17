# BernoInfo 2026

A neutral, sourced guide to the 2026 municipal election in Bernolákovo, Slovakia.

The repository is private during research and development. The initial product direction is a Slovak-language, mobile-first React/TypeScript site on Cloudflare Workers, with selective GSAP, Lenis, and React Bits use that respects reduced-motion settings. Election content still requires independent review and Peter's approval before public release.

The current app is a content-free Cloudflare Git-integration smoke test. To build locally with Node.js, run `npm ci` and `npm run build`. The `wrangler.jsonc` configuration serves the generated `dist` directory as Worker static assets; no Worker script is needed for this smoke test. The smoke test has no client-side routes; unknown paths return 404. If a future app needs deep-link navigation, configure and verify a fallback separately.

For Cloudflare Workers Builds, use Worker name `bernoinfo2026` (matching `wrangler.jsonc`), production branch `main`, root directory `/`, build command `npm run build`, deploy command `npx wrangler deploy`, and preview command `npx wrangler preview`. Preview builds must be enabled for the draft PR branch. A preview URL can be publicly reachable; no research notes or candidate content belong in this smoke test. Do not merge the smoke-test PR or deploy election content without the project's review and release gates.

Start with [the project charter](docs/PROJECT_CHARTER.md), [research protocol](docs/RESEARCH_PROTOCOL.md), and [agent workflow](docs/AGENT_TEAM.md).

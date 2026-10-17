# BernoInfo 2026

A neutral, sourced guide to the 2026 municipal election in Bernolákovo, Slovakia.

The repository is private during research and development. The initial product direction is a Slovak-language, mobile-first React/TypeScript site on Cloudflare Pages, with selective GSAP, Lenis, and React Bits use that respects reduced-motion settings. Election content still requires independent review and Peter's approval before public release.

The current app is a content-free Cloudflare Git-integration smoke test. To build locally with Node.js, run `npm ci` and `npm run build`. For Cloudflare Pages Git builds, use the React/Vite preset: production branch `main`, build command `npm run build`, output directory `dist`. A non-`main` branch can produce a publicly accessible preview URL when preview deployments are enabled; no research notes or candidate content belong in this smoke test.

Start with [the project charter](docs/PROJECT_CHARTER.md), [research protocol](docs/RESEARCH_PROTOCOL.md), and [agent workflow](docs/AGENT_TEAM.md).

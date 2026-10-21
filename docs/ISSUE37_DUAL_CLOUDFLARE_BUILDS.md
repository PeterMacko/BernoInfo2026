# Issue #37: Workers and Pages builds

The repository has one `npm run build` command and `dist` output. It selects mode from Cloudflare's injected build context:

| Build context | Mode | Metadata origin |
| --- | --- | --- |
| Workers Builds `WORKERS_CI_BRANCH=main` | release | Existing verified Workers production origin |
| Workers Builds non-`main` branch | preview/noindex | Existing branch alias, or an explicit verified `SITE_ORIGIN` |
| Pages (`CF_PAGES=1`, with `CF_PAGES_BRANCH` and `CF_PAGES_URL`), any branch including `main` | preview/noindex | That deployment's `CF_PAGES_URL` |
| Local, without CI markers | release | Explicit `SITE_ORIGIN` and `RELEASE_ORIGIN_VERIFIED=1` |

Partial or mixed CI contexts, a Pages origin override, and a Pages release mode fail the build. A Pages production-branch deployment is still a **publicly reachable preview**, not an approved editorial release. Peter's separate PR and merge/release approval remains required.

For a Pages Git project, configure the dashboard build command as `npm run build`, output directory as `dist`, and root directory as the repository root. Do not add `pages_build_output_dir` to the existing Workers `wrangler.jsonc`: that file is for the Worker, and Pages will warn and skip it. The warning is nonfatal. Pages build variables are injected by Cloudflare; do not manually set `SITE_ORIGIN` or release-verification variables to make a Pages build pass.

This change does not configure Pages deployment triggers or authorize a production rollout. Verify branch controls and the actual served preview separately before treating a successful build as a deployment.

Sources: [Pages build variables](https://developers.cloudflare.com/pages/configuration/build-configuration/) and [Pages Wrangler configuration](https://developers.cloudflare.com/pages/functions/wrangler-configuration/).

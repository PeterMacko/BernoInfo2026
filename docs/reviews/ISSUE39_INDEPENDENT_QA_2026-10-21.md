# Issue #39 independent review — 21 October 2026

Reviewer: `bernoinfo-reviewer` (read-only static review). Result: changes requested; all three were addressed in the follow-up commit.

| Finding | Resolution |
| --- | --- |
| Evidence ledger lacked exact supplied URLs | Added one self-contained row per supplied URL in `docs/research/ISSUE39_SUPPLIED_LINK_LEDGER.md`. |
| Homepage resources lacked publisher labels | Added explicit “Vydavateľ: neoverený” for each, while retaining platform labels. |
| Turenič post might not contain answers | All seven links now use the neutral “Príspevok k rubrike 10 otázok” label and state that exact content/answers were not verified. |

Reviewer static checks passed equal top slots and detailed channel sections across eight profiles, seven identically placed post links, neutral gap on Šutka's page, no imported comparison claims, and CSS mobile/focus/reduced-motion rules. Reviewer lacked shell/HTTP/browser access, so local build and focused generated-HTML tests were run by the lead; visual browser verification remains outstanding. External content, dates and account ownership remain unverified as recorded in the ledger.

## Hosted preview follow-up

Both GitHub Cloudflare checks passed on PR head `f9b5fc7afa0ddb0ccc8fd2ada16dd27f9bf794dd`. The [Workers branch preview](https://lead-issue-39-links-resources-bernoinfo2026.mr-petermacko.workers.dev/) returned HTTP 200; sampled Bartók, Cirbus, Turenič and Šutka routes contained their expected new links/gap wording and `noindex`. Its linked JavaScript asset `/assets/index-DlqP-fJw.js` had the same SHA-256 as the locally built preview asset (`a6aec824245f00d9…`). The server-rendered homepage shell does not include React section text; the matched asset contains the bundled homepage change. The guessed Pages branch alias returned 404, so Pages serving is not claimed as verified. These checks do not verify the linked external content or substitute for visual browser QA.

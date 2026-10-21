# Issue #39 independent review — 21 October 2026

Reviewer: `bernoinfo-reviewer` (read-only static review). Result: changes requested; all three were addressed in the follow-up commit.

| Finding | Resolution |
| --- | --- |
| Evidence ledger lacked exact supplied URLs | Added one self-contained row per supplied URL in `docs/research/ISSUE39_SUPPLIED_LINK_LEDGER.md`. |
| Homepage resources lacked publisher labels | Added explicit “Vydavateľ: neoverený” for each, while retaining platform labels. |
| Turenič post might not contain answers | All seven links now use the neutral “Príspevok k rubrike 10 otázok” label and state that exact content/answers were not verified. |

Reviewer static checks passed equal top slots and detailed channel sections across eight profiles, seven identically placed post links, neutral gap on Šutka's page, no imported comparison claims, and CSS mobile/focus/reduced-motion rules. Reviewer lacked shell/HTTP/browser access, so local build and focused generated-HTML tests were run by the lead; visual browser verification remains outstanding. External content, dates and account ownership remain unverified as recorded in the ledger.

# Issue #41 — independent review

Reviewed 21 October 2026 by the BernoInfo reviewer against draft PR #42 at `4a9afbc`. No files were changed by the reviewer. No blocking findings.

| Area | Finding |
| --- | --- |
| Eight candidate pages | Exact supplied Transparency URLs appear in the same resource section with the same neutral profile label and unverified-content qualification. No ownership, balance or compliance claim was inferred. |
| Homepage parity | Municipality search link appears in React and no-JavaScript content with publisher, supplied date and access limit. |
| Turenič association | Five official-name links resolve to council profiles. Peter's dated association report is separated from the five candidates' official shared Demokrati–KDH–SaS nomination and Turenič's independent registration. District PDFs are cited. |
| Bounded UI checks | Hosted homepage and Turenič page showed no horizontal overflow at 320px and 390px. Reviewer inspected headings, link labels, focus styling and reduced-motion CSS; no issue found. |

The reviewer could not run builds or tests without a shell. The reviewer did not independently inspect data inside the Transparency JavaScript application, re-read the district PDFs, or complete keyboard, screen-reader, and reduced-motion interaction tests. The lead ran the 19-test suite and two issue-specific tests, preview build, and hosted HTTP/noindex and bundle-hash checks separately. Prior social-source coverage remains partial.

The analyst validated the acceptance criteria from the supplied evidence brief on 21 October: common label/placement, homepage mode parity, separate official nomination and reported association, no inferred account or compliance facts. No blocking editorial issue was identified.

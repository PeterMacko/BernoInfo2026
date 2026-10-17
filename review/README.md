# Local visual review — municipal blue/yellow draft

- `screenshots/mobile-390.png`: built React page at 390 × 844. The first candidate name and list number remain visible above the fold.
- `screenshots/desktop-1440.png`: built React page at 1440 × 1000.
- `screenshots/nojs-mobile-390.png`: static `<noscript>` fallback at 390 × 844, rendered from a local review copy of the built HTML with the `<noscript>` wrappers and module script removed. This represents the fallback markup; it is not evidence that Chrome's JavaScript-disable flag worked.

The Bernolákovo coat of arms is a locally optimized 180 × 209 WebP (7,950 bytes) derived from the 1,000px tokenized image linked on the municipality's official homepage on 17 October 2026. The UI links attribution to that homepage and states that BernoInfo 2026 is independent and unaffiliated.

Verification: `npm run build` passed. The eight candidate entries and their neutral order are unchanged. Text contrast checks: municipality blue `#3564a7` on page `#f8f9fc` is 5.65:1; secondary text `#425f7e` on page is 6.29:1; hero pale text `#e5edf7` on `#183a64` is 9.73:1; yellow `#f4d56a` on hero is 7.97:1. Motion is unchanged, and reduced-motion scroll behavior remains disabled.

# Local visual review — municipal blue/yellow draft

- `screenshots/mobile-390.png`: built React page at 390 × 844. The first candidate name and list number remain visible above the fold.
- `screenshots/desktop-1440.png`: built React page at 1440 × 1000.
- `screenshots/nojs-mobile-390.png`: earlier transformed-HTML fallback rendering, retained for comparison; it was not a real JavaScript-disabled browser run.
- `screenshots/mobile-390-updated.png`: updated built React page in headless Chrome 155 at 390 × 844 after the mobile credit and focus fixes.
- `screenshots/nojs-mobile-390-actual.png`: built page in headless Chrome 155 at 390 × 844, with `Emulation.setScriptExecutionDisabled` enabled through DevTools Protocol **before navigation**. Chrome rendered the static `<noscript>` fallback with all eight names; the React card DOM was absent.

The Bernolákovo coat of arms is a locally optimized 180 × 209 WebP (7,950 bytes) derived from the 1,000px tokenized image linked on the municipality's official homepage on 17 October 2026. The UI links attribution to that homepage and states that BernoInfo 2026 is independent and unaffiliated.

Verification: `npm run build` passed. The eight candidate entries and their neutral order are unchanged. Text contrast checks: municipality blue `#3564a7` on page `#f8f9fc` is 5.65:1; secondary text `#425f7e` on page is 6.29:1; hero pale text `#e5edf7` on `#183a64` is 9.73:1; yellow `#f4d56a` on hero is 7.97:1. Motion is unchanged, and reduced-motion scroll behavior remains disabled.

Review-fix verification: `npm run build` and `git diff --check` passed. Chrome DOM inspection at 390 px found eight equal-styled React cards, a visible coat-of-arms figcaption at x=271–366/y=328–355 adjacent to the emblem at x=214–257/y=317–367, the first candidate name at y=622, and no horizontal overflow (`scrollWidth=390`). The global 3 px keyboard-focus outline is now `#a87800`: contrast is 3.73:1 on page `#f8f9fc`, 3.49:1 on card `#eef2f7`, and 3.17:1 on colophon `#dfe8f3`. The hero retains the brighter `#f4d56a` outline, 7.97:1 on `#183a64`. The static no-JS focus color was already `#a87800` and remains unchanged.

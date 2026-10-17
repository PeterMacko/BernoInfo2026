# Project charter

## Purpose

Help Bernolákovo voters find accurate election logistics, the complete official candidate list, comparable candidate-provided positions, and links to original sources. The site is neutral: it does not endorse or rank candidates.

## Initial scope

- Cover the Bernolákovo municipal election scheduled for 24 October 2026. Confirm all logistics against current official notices before publication.
- Treat the municipality's registered-candidate notice as the baseline, not Facebook posts: https://www.bernolakovo.sk/novinka/139303/n
- Present all eight mayoral candidates using the same fields and editorial standard. Include council-candidate and voting information once checked against official records.
- Collect election-related material from the five supplied Facebook sources and linked candidate sites, videos, and other public sources. Working Facebook lookback: 16 July–16 October 2026; report coverage gaps rather than claiming completeness.
- Preserve source URL, publisher, publication date, observation date, exact attributable claim, and verification status in private research notes before any website content is drafted.

## Editorial rules

- Separate verified election facts, candidate statements, and unverified allegations. Attribution is not verification.
- Apply the same questions, word limits, and opportunity for correction to every candidate. Do not infer a candidate's position from comments by others.
- Do not publish private-group content, ordinary residents' personal details, or copied video/transcript text without a deliberate editorial and rights review. Link to originals where appropriate.
- Add visible source and last-checked dates to factual content. Correct errors transparently.
- Human review is required before publication, external outreach, or any Cloudflare rollout.

## Design direction

Distinctive editorial design, not a campaign aesthetic. React + TypeScript on Cloudflare Workers with static assets; GSAP for purposeful motion, Lenis for long-form navigation if it improves usability, and selected React Bits components. Reading, navigation, and source access must work with motion disabled and on mobile.

## First deliverables

1. Analyst: requirements and content model, including missing decisions and acceptance criteria.
2. Researcher: source inventory, official voting/candidate facts, and a bounded Facebook/source sweep with a coverage ledger.
3. Developer: reviewed-content prototype and deployment preview only after the first two deliverables are approved.
4. Reviewer/UI tester: independent factual, accessibility, responsive, and source-link verification.

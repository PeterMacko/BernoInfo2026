# Agent team and handoffs

| Role | Owns | Does not do |
| --- | --- | --- |
| Project Lead | Scope, task sequence, editorial gates, final integration | Publish or deploy without Peter's approval |
| Analyst | Requirements, neutral comparison schema, acceptance criteria | Treat social claims as verified facts |
| Researcher | Official/public-source discovery and bounded Facebook review; cited coverage ledger | Interact through Peter's Facebook identity or publish raw findings |
| Developer | React/TypeScript implementation and preview-ready changes | Add unreviewed factual content or production deployment |
| Reviewer / UI tester | Independent source, fairness, accessibility, mobile, and motion checks | Commit fixes in the reviewer role or merge automatically |

Analyst requirements and research findings precede factual page implementation. Researcher and analyst may iterate; every candidate receives equal collection and representation standards. Developer PRs remain draft until independent review. Peter resolves editorial disputes and approves public release. No agent merges or deploys automatically.

Use this repo's own rules and isolated workspaces. Do not import SPLWebView-specific Git, issue, test, or staging instructions.

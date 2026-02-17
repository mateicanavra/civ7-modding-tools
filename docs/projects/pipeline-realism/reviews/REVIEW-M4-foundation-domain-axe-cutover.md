---
milestone: M4
id: M4-review
status: draft
reviewer: AI agent
---

# REVIEW-M4-foundation-domain-axe-cutover

This document records milestone-loop review findings for active M4 second-leg branches.

## REVIEW codex/prr-m4-s07-lane-split-map-artifacts-rewire

### Quick Take
- Lane-split implementation is architecturally aligned: map-facing Foundation projection artifacts moved to `artifact:map.foundation*`, consumer contracts rewired, and no dual-publish bridge remains in runtime contracts.
- Verification passed for lint, adapter-boundary, check, architecture-cutover tests, Studio recipe build, and legacy-tag absence scans.
- Full-profile domain guardrails failed, but failures are inherited ecology/hydrology baseline debt and not introduced by this branch.

### High-Leverage Issues
- No branch-local correctness or contract violations found that warrant a fix commit in this pass.

### PR Comment Context
- Inline review comments: none.
- Issue comments: Graphite stack automation and Railway preview bot only; no actionable human/bot technical feedback to resolve.

### Fix Now (Recommended)
- None.

### Defer / Follow-up
- Convert inherited full-profile guardrails debt into an explicit cleanup slice so S07-S09 full-profile runs are signal-bearing rather than baseline-red.

### Needs Discussion
- None.

### Cross-cutting Risks
- The full-profile guardrail suite currently reports non-local baseline violations (`hydrology` step-id config posture and multiple `ecology` module-shape/JSDoc checks), which can mask true regressions during second-leg review.

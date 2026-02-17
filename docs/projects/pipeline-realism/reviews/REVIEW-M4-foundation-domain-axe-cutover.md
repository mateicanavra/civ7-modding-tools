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

## REVIEW codex/prr-m4-s08-config-redesign-preset-retune

### Quick Take
- S08 lands the intended config taxonomy change for `map-hydrology` (strict `advanced` envelope + knobs-last compile lowering) and retunes earthlike defaults/preset parameters.
- Verification matrix for M4-006 S08 passed for CI/tests/build/check and earthlike diagnostics.
- No branch-local correctness defect was found that requires a fix commit on this branch.

### High-Leverage Issues
- No branch-local high-severity defects identified in this pass.

### PR Comment Context
- One inline review thread from Codex bot flagged potential backward-compat break for legacy `map-hydrology` keys (`lakes`, `plot-rivers`).
- Thread is resolved with explicit author intent: no shim/dual-path compatibility for legacy keys in M4-006 final posture.
- No unresolved review threads remain.

### Fix Now (Recommended)
- None.

### Defer / Follow-up
- Complete stale-token/docs cleanup in S09 so M4-006 no-legacy scans pass on canonical doc surfaces (`lithosphereProfile`, `mantleProfile`, `potentialMode`, sentinel-path terms).

### Needs Discussion
- None.

### Cross-cutting Risks
- Current no-legacy token scan scope (`docs/projects/pipeline-realism docs/system/libs/mapgen ...`) includes historical scratch/spec/tutorial content, so it can fail even when runtime/code contracts are clean; this reduces gate signal unless scan scope is tightened or S09 cleanup is comprehensive.

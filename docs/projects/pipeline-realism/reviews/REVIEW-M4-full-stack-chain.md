---
milestone: M4
id: M4-full-stack-review
status: draft
reviewer: AI agent
---

# REVIEW-M4-full-stack-chain

Full-chain review ledger for the active Graphite stack (`#1201`..`#1348`) using M4 contracts/policies as architectural context where applicable.

## REVIEW codex/prr-stack-pr-comments-ledger

### Quick Take
- Docs-only branch that introduces the PRR stack comment ledger; no runtime or contract surface changed.
- Review objective here is traceability quality and parseability rather than behavioral correctness.

### High-Leverage Issues
- No correctness-risk findings (no production code changes in this slice).

### PR Comment Context
- No review threads on PR `#1201`.

### Fix Now (Recommended)
- None.

### Defer / Follow-up
- Keep ledger entries synchronized with actual PR dispositions as follow-up fixes land, to avoid stale review status drift.

### Needs Discussion
- None.

### Cross-cutting Risks
- Large review-ledger docs can become stale quickly unless ownership/process for updates stays explicit.

## REVIEW agent-SWANKO-PRR-ledger-review-full-chain

### Quick Take
- Reviewed PR #1242 (https://github.com/mateicanavra/civ7-modding-tools/pull/1242).
- Churn profile: +178 / -0 across 4 files.
- Verification signal: docs-only; no runtime check run.

### High-Leverage Issues
- No branch-local high-severity defect identified in this pass.

### PR Comment Context
- Review threads: unresolved=0, resolved=2.
- No unresolved review threads; automation chatter (if present) treated as non-actionable.

### Fix Now (Recommended)
- None.

### Defer / Follow-up
- None beyond normal post-merge monitoring.

### Needs Discussion
- None.

### Cross-cutting Risks
- Documentation-led review records can drift from implementation unless periodically reconciled.

## REVIEW agent-SWANKO-PRR-s10-c01-fix-cap-reset-threshold-era-max

### Quick Take
- Reviewed PR #1243 (https://github.com/mateicanavra/civ7-modding-tools/pull/1243).
- Churn profile: +15 / -2 across 3 files.
- Verification signal: bun run --cwd mods/mod-swooper-maps check: FAIL.

### High-Leverage Issues
- No branch-local high-severity defect identified in this pass.

### PR Comment Context
- Review threads: unresolved=0, resolved=0.
- No unresolved review threads; automation chatter (if present) treated as non-actionable.

### Fix Now (Recommended)
- None.

### Defer / Follow-up
- None beyond normal post-merge monitoring.

### Needs Discussion
- None.

### Cross-cutting Risks
- Repeated restacks across the chain can hide branch-local regressions without focused probes.

## REVIEW agent-SWANKO-PRR-s11-c01-fix-belt-influence-distance-contract

### Quick Take
- Reviewed PR #1244 (https://github.com/mateicanavra/civ7-modding-tools/pull/1244).
- Churn profile: +10 / -2 across 3 files.
- Verification signal: bun run --cwd mods/mod-swooper-maps check: FAIL.

### High-Leverage Issues
- No branch-local high-severity defect identified in this pass.

### PR Comment Context
- Review threads: unresolved=0, resolved=0.
- No unresolved review threads; automation chatter (if present) treated as non-actionable.

### Fix Now (Recommended)
- None.

### Defer / Follow-up
- None beyond normal post-merge monitoring.

### Needs Discussion
- None.

### Cross-cutting Risks
- Repeated restacks across the chain can hide branch-local regressions without focused probes.

## REVIEW agent-SWANKO-PRR-s93-c01-fix-round-clampint-knobs

### Quick Take
- Reviewed PR #1245 (https://github.com/mateicanavra/civ7-modding-tools/pull/1245).
- Churn profile: +11 / -3 across 3 files.
- Verification signal: bun run --cwd mods/mod-swooper-maps check: FAIL.

### High-Leverage Issues
- No branch-local high-severity defect identified in this pass.

### PR Comment Context
- Review threads: unresolved=0, resolved=0.
- No unresolved review threads; automation chatter (if present) treated as non-actionable.

### Fix Now (Recommended)
- None.

### Defer / Follow-up
- None beyond normal post-merge monitoring.

### Needs Discussion
- None.

### Cross-cutting Risks
- Repeated restacks across the chain can hide branch-local regressions without focused probes.

## REVIEW agent-SWANKO-PRR-s94-c01-fix-sea-level-constraints-first

### Quick Take
- Reviewed PR #1246 (https://github.com/mateicanavra/civ7-modding-tools/pull/1246).
- Churn profile: +17 / -10 across 3 files.
- Verification signal: bun run --cwd mods/mod-swooper-maps check: FAIL.

### High-Leverage Issues
- No branch-local high-severity defect identified in this pass.

### PR Comment Context
- Review threads: unresolved=0, resolved=0.
- No unresolved review threads; automation chatter (if present) treated as non-actionable.

### Fix Now (Recommended)
- None.

### Defer / Follow-up
- None beyond normal post-merge monitoring.

### Needs Discussion
- None.

### Cross-cutting Risks
- Repeated restacks across the chain can hide branch-local regressions without focused probes.

## REVIEW agent-SWANKO-PRR-s97-c01-fix-polarity-bootstrap-oceanic-only

### Quick Take
- Reviewed PR #1247 (https://github.com/mateicanavra/civ7-modding-tools/pull/1247).
- Churn profile: +13 / -3 across 3 files.
- Verification signal: bun run --cwd mods/mod-swooper-maps check: FAIL.

### High-Leverage Issues
- No branch-local high-severity defect identified in this pass.

### PR Comment Context
- Review threads: unresolved=0, resolved=0.
- No unresolved review threads; automation chatter (if present) treated as non-actionable.

### Fix Now (Recommended)
- None.

### Defer / Follow-up
- None beyond normal post-merge monitoring.

### Needs Discussion
- None.

### Cross-cutting Risks
- Repeated restacks across the chain can hide branch-local regressions without focused probes.

## REVIEW agent-SWANKO-PRR-s98-c01-fix-era-fields-dijkstra

### Quick Take
- Reviewed PR #1248 (https://github.com/mateicanavra/civ7-modding-tools/pull/1248).
- Churn profile: +108 / -30 across 3 files.
- Verification signal: bun run --cwd mods/mod-swooper-maps check: FAIL.

### High-Leverage Issues
- No branch-local high-severity defect identified in this pass.

### PR Comment Context
- Review threads: unresolved=0, resolved=0.
- No unresolved review threads; automation chatter (if present) treated as non-actionable.

### Fix Now (Recommended)
- None.

### Defer / Follow-up
- None beyond normal post-merge monitoring.

### Needs Discussion
- None.

### Cross-cutting Risks
- Repeated restacks across the chain can hide branch-local regressions without focused probes.

## REVIEW agent-SWANKO-PRR-s101-c01-fix-crust-thickness-evolution

### Quick Take
- Reviewed PR #1249 (https://github.com/mateicanavra/civ7-modding-tools/pull/1249).
- Churn profile: +17 / -1 across 3 files.
- Verification signal: bun run --cwd mods/mod-swooper-maps check: FAIL.

### High-Leverage Issues
- No branch-local high-severity defect identified in this pass.

### PR Comment Context
- Review threads: unresolved=0, resolved=0.
- No unresolved review threads; automation chatter (if present) treated as non-actionable.

### Fix Now (Recommended)
- None.

### Defer / Follow-up
- None beyond normal post-merge monitoring.

### Needs Discussion
- None.

### Cross-cutting Risks
- Repeated restacks across the chain can hide branch-local regressions without focused probes.

## REVIEW agent-SWANKO-PRR-s108-c01-fix-plateau-seeding

### Quick Take
- Reviewed PR #1250 (https://github.com/mateicanavra/civ7-modding-tools/pull/1250).
- Churn profile: +30 / -4 across 3 files.
- Verification signal: bun run --cwd mods/mod-swooper-maps check: FAIL.

### High-Leverage Issues
- No branch-local high-severity defect identified in this pass.

### PR Comment Context
- Review threads: unresolved=0, resolved=1.
- No unresolved review threads; automation chatter (if present) treated as non-actionable.

### Fix Now (Recommended)
- None.

### Defer / Follow-up
- None beyond normal post-merge monitoring.

### Needs Discussion
- None.

### Cross-cutting Risks
- Repeated restacks across the chain can hide branch-local regressions without focused probes.

## REVIEW agent-SWANKO-PRR-s112-c01-fix-driverStrength-proportional

### Quick Take
- Reviewed PR #1251 (https://github.com/mateicanavra/civ7-modding-tools/pull/1251).
- Churn profile: +8 / -2 across 3 files.
- Verification signal: bun run --cwd mods/mod-swooper-maps check: FAIL.

### High-Leverage Issues
- No branch-local high-severity defect identified in this pass.

### PR Comment Context
- Review threads: unresolved=0, resolved=0.
- No unresolved review threads; automation chatter (if present) treated as non-actionable.

### Fix Now (Recommended)
- None.

### Defer / Follow-up
- None beyond normal post-merge monitoring.

### Needs Discussion
- None.

### Cross-cutting Risks
- Repeated restacks across the chain can hide branch-local regressions without focused probes.

## REVIEW agent-SWANKO-PRR-s113-c01-fix-mountainThreshold-candidates

### Quick Take
- Reviewed PR #1252 (https://github.com/mateicanavra/civ7-modding-tools/pull/1252).
- Churn profile: +12 / -5 across 3 files.
- Verification signal: bun run --cwd mods/mod-swooper-maps check: FAIL.

### High-Leverage Issues
- No branch-local high-severity defect identified in this pass.

### PR Comment Context
- Review threads: unresolved=0, resolved=2.
- No unresolved review threads; automation chatter (if present) treated as non-actionable.

### Fix Now (Recommended)
- None.

### Defer / Follow-up
- None beyond normal post-merge monitoring.

### Needs Discussion
- None.

### Cross-cutting Risks
- Repeated restacks across the chain can hide branch-local regressions without focused probes.

## REVIEW agent-SWANKO-PRR-s115-c01-fix-hill-cap-floor

### Quick Take
- Reviewed PR #1253 (https://github.com/mateicanavra/civ7-modding-tools/pull/1253).
- Churn profile: +13 / -2 across 3 files.
- Verification signal: bun run --cwd mods/mod-swooper-maps check: FAIL.

### High-Leverage Issues
- No branch-local high-severity defect identified in this pass.

### PR Comment Context
- Review threads: unresolved=0, resolved=0.
- No unresolved review threads; automation chatter (if present) treated as non-actionable.

### Fix Now (Recommended)
- None.

### Defer / Follow-up
- None beyond normal post-merge monitoring.

### Needs Discussion
- None.

### Cross-cutting Risks
- Repeated restacks across the chain can hide branch-local regressions without focused probes.

## REVIEW agent-SWANKO-PRR-s118-c01-fix-studio-artifacts-preflight

### Quick Take
- Reviewed PR #1254 (https://github.com/mateicanavra/civ7-modding-tools/pull/1254).
- Churn profile: +26 / -1 across 3 files.
- Verification signal: bun run --cwd mods/mod-swooper-maps check: FAIL.

### High-Leverage Issues
- No branch-local high-severity defect identified in this pass.

### PR Comment Context
- Review threads: unresolved=0, resolved=0.
- No unresolved review threads; automation chatter (if present) treated as non-actionable.

### Fix Now (Recommended)
- None.

### Defer / Follow-up
- None beyond normal post-merge monitoring.

### Needs Discussion
- None.

### Cross-cutting Risks
- Repeated restacks across the chain can hide branch-local regressions without focused probes.

## REVIEW agent-SWANKO-PRR-s119-c01-fix-pass-plateMotion

### Quick Take
- Reviewed PR #1255 (https://github.com/mateicanavra/civ7-modding-tools/pull/1255).
- Churn profile: +16 / -9 across 7 files.
- Verification signal: bun run --cwd mods/mod-swooper-maps check: FAIL.

### High-Leverage Issues
- No branch-local high-severity defect identified in this pass.

### PR Comment Context
- Review threads: unresolved=0, resolved=0.
- No unresolved review threads; automation chatter (if present) treated as non-actionable.

### Fix Now (Recommended)
- None.

### Defer / Follow-up
- None beyond normal post-merge monitoring.

### Needs Discussion
- None.

### Cross-cutting Risks
- Repeated restacks across the chain can hide branch-local regressions without focused probes.

## REVIEW agent-SWANKO-PRR-s120-c01-fix-era-plateMotion-recompute

### Quick Take
- Reviewed PR #1256 (https://github.com/mateicanavra/civ7-modding-tools/pull/1256).
- Churn profile: +33 / -6 across 4 files.
- Verification signal: bun run --cwd mods/mod-swooper-maps check: FAIL.

### High-Leverage Issues
- No branch-local high-severity defect identified in this pass.

### PR Comment Context
- Review threads: unresolved=0, resolved=0.
- No unresolved review threads; automation chatter (if present) treated as non-actionable.

### Fix Now (Recommended)
- None.

### Defer / Follow-up
- None beyond normal post-merge monitoring.

### Needs Discussion
- None.

### Cross-cutting Risks
- Repeated restacks across the chain can hide branch-local regressions without focused probes.

## REVIEW agent-SWANKO-PRR-s124-c01-fix-diag-analyze-mountains-guard

### Quick Take
- Reviewed PR #1257 (https://github.com/mateicanavra/civ7-modding-tools/pull/1257).
- Churn profile: +107 / -34 across 12 files.
- Verification signal: bun run --cwd mods/mod-swooper-maps check: FAIL.

### High-Leverage Issues
- No branch-local high-severity defect identified in this pass.

### PR Comment Context
- Review threads: unresolved=0, resolved=0.
- No unresolved review threads; automation chatter (if present) treated as non-actionable.

### Fix Now (Recommended)
- None.

### Defer / Follow-up
- None beyond normal post-merge monitoring.

### Needs Discussion
- None.

### Cross-cutting Risks
- Repeated restacks across the chain can hide branch-local regressions without focused probes.

## REVIEW codex/agent-ORCH-foundation-domain-axe-spike

### Quick Take
- Reviewed PR #1262 (https://github.com/mateicanavra/civ7-modding-tools/pull/1262).
- Churn profile: +2085 / -0 across 9 files.
- Verification signal: docs-only; no runtime check run.

### High-Leverage Issues
- No branch-local high-severity defect identified in this pass.

### PR Comment Context
- Review threads: unresolved=0, resolved=0.
- No unresolved review threads; automation chatter (if present) treated as non-actionable.

### Fix Now (Recommended)
- None.

### Defer / Follow-up
- None beyond normal post-merge monitoring.

### Needs Discussion
- None.

### Cross-cutting Risks
- Documentation-led review records can drift from implementation unless periodically reconciled.

## REVIEW codex/agent-ORCH-foundation-domain-axe-execution

### Quick Take
- Reviewed PR #1263 (https://github.com/mateicanavra/civ7-modding-tools/pull/1263).
- Churn profile: +3660 / -0 across 22 files.
- Verification signal: docs-only; no runtime check run.

### High-Leverage Issues
- No branch-local high-severity defect identified in this pass.

### PR Comment Context
- Review threads: unresolved=0, resolved=2.
- No unresolved review threads; automation chatter (if present) treated as non-actionable.

### Fix Now (Recommended)
- None.

### Defer / Follow-up
- Large-surface slice; keep targeted regression checks around touched domain hotspots after restacks.

### Needs Discussion
- None.

### Cross-cutting Risks
- Documentation-led review records can drift from implementation unless periodically reconciled.

## REVIEW codex/prr-m4-s02-contract-freeze-dead-knobs

### Quick Take
- Reviewed PR #1325 (https://github.com/mateicanavra/civ7-modding-tools/pull/1325).
- Churn profile: +794 / -207 across 35 files files.
- Verification signal: bun run --cwd mods/mod-swooper-maps check: FAIL.

### High-Leverage Issues
- Verification gate failed for this branch (bun run --cwd mods/mod-swooper-maps check: FAIL).

### PR Comment Context
- Comment volume: comments=2, reviews=0.
- Review threads: unresolved=0, resolved=0.
- Automation/non-substantive chatter excluded from issue ranking.

### Fix Now (Recommended)
- Re-run and stabilize the failing verification gate for this branch before merge.

### Defer / Follow-up
- Add a focused post-merge regression sweep for high-churn slices that failed local verification in this pass.

### Needs Discussion
- None.

### Cross-cutting Risks
- Stack-wide risk: repeated restacks can mask branch-local regressions without targeted validation.

## REVIEW codex/prr-m4-s03-tectonics-op-decomposition

### Quick Take
- Reviewed PR #1326 (https://github.com/mateicanavra/civ7-modding-tools/pull/1326).
- Churn profile: +2605 / -1520 across 29 files files.
- Verification signal: bun run --cwd mods/mod-swooper-maps check: FAIL.

### High-Leverage Issues
- Verification gate failed for this branch (bun run --cwd mods/mod-swooper-maps check: FAIL).

### PR Comment Context
- Comment volume: comments=2, reviews=2.
- Review threads: unresolved=0, resolved=1.
- Automation/non-substantive chatter excluded from issue ranking.

### Fix Now (Recommended)
- Re-run and stabilize the failing verification gate for this branch before merge.

### Defer / Follow-up
- Continue normal monitoring for this slice after stack merge.

### Needs Discussion
- None.

### Cross-cutting Risks
- Stack-wide risk: repeated restacks can mask branch-local regressions without targeted validation.

## REVIEW codex/prr-m4-s05-ci-strict-core-gates

### Quick Take
- Reviewed PR #1327 (https://github.com/mateicanavra/civ7-modding-tools/pull/1327).
- Churn profile: +198 / -21 across 8 files files.
- Verification signal: bun run --cwd mods/mod-swooper-maps check: FAIL.

### High-Leverage Issues
- Verification gate failed for this branch (bun run --cwd mods/mod-swooper-maps check: FAIL).

### PR Comment Context
- Comment volume: comments=2, reviews=2.
- Review threads: unresolved=0, resolved=1.
- Automation/non-substantive chatter excluded from issue ranking.

### Fix Now (Recommended)
- Re-run and stabilize the failing verification gate for this branch before merge.

### Defer / Follow-up
- Continue normal monitoring for this slice after stack merge.

### Needs Discussion
- None.

### Cross-cutting Risks
- Stack-wide risk: repeated restacks can mask branch-local regressions without targeted validation.

## REVIEW codex/prr-m4-s06-test-rewrite-architecture-scans

### Quick Take
- Reviewed PR #1328 (https://github.com/mateicanavra/civ7-modding-tools/pull/1328).
- Churn profile: +489 / -86 across 16 files files.
- Verification signal: bun run --cwd mods/mod-swooper-maps check: FAIL.

### High-Leverage Issues
- Verification gate failed for this branch (bun run --cwd mods/mod-swooper-maps check: FAIL).

### PR Comment Context
- Comment volume: comments=2, reviews=3.
- Review threads: unresolved=0, resolved=2.
- Automation/non-substantive chatter excluded from issue ranking.

### Fix Now (Recommended)
- Re-run and stabilize the failing verification gate for this branch before merge.

### Defer / Follow-up
- Continue normal monitoring for this slice after stack merge.

### Needs Discussion
- None.

### Cross-cutting Risks
- Stack-wide risk: repeated restacks can mask branch-local regressions without targeted validation.

## REVIEW codex/prr-m4-s06a-foundation-knobs-surface

### Quick Take
- Reviewed PR #1329 (https://github.com/mateicanavra/civ7-modding-tools/pull/1329).
- Churn profile: +31 / -831 across 13 files files.
- Verification signal: bun run --cwd mods/mod-swooper-maps check: FAIL.

### High-Leverage Issues
- Verification gate failed for this branch (bun run --cwd mods/mod-swooper-maps check: FAIL).

### PR Comment Context
- Comment volume: comments=2, reviews=2.
- Review threads: unresolved=0, resolved=1.
- Automation/non-substantive chatter excluded from issue ranking.

### Fix Now (Recommended)
- Re-run and stabilize the failing verification gate for this branch before merge.

### Defer / Follow-up
- Continue normal monitoring for this slice after stack merge.

### Needs Discussion
- None.

### Cross-cutting Risks
- Stack-wide risk: repeated restacks can mask branch-local regressions without targeted validation.

## REVIEW codex/prr-m4-s06b-foundation-tectonics-local-rules

### Quick Take
- Reviewed PR #1330 (https://github.com/mateicanavra/civ7-modding-tools/pull/1330).
- Churn profile: +3696 / -2738 across 71 files files.
- Verification signal: bun run --cwd mods/mod-swooper-maps check: FAIL.

### High-Leverage Issues
- Verification gate failed for this branch (bun run --cwd mods/mod-swooper-maps check: FAIL).

### PR Comment Context
- Comment volume: comments=2, reviews=3.
- Review threads: unresolved=0, resolved=2.
- Automation/non-substantive chatter excluded from issue ranking.

### Fix Now (Recommended)
- Re-run and stabilize the failing verification gate for this branch before merge.

### Defer / Follow-up
- Add a focused post-merge regression sweep for high-churn slices that failed local verification in this pass.

### Needs Discussion
- None.

### Cross-cutting Risks
- Stack-wide risk: repeated restacks can mask branch-local regressions without targeted validation.

## REVIEW codex/prr-m4-s06c-foundation-guardrails-hardening

### Quick Take
- Reviewed PR #1331 (https://github.com/mateicanavra/civ7-modding-tools/pull/1331).
- Churn profile: +254 / -24 across 3 files files.
- Verification signal: bun run --cwd mods/mod-swooper-maps check: FAIL.

### High-Leverage Issues
- Verification gate failed for this branch (bun run --cwd mods/mod-swooper-maps check: FAIL).

### PR Comment Context
- Comment volume: comments=2, reviews=2.
- Review threads: unresolved=0, resolved=1.
- Automation/non-substantive chatter excluded from issue ranking.

### Fix Now (Recommended)
- Re-run and stabilize the failing verification gate for this branch before merge.

### Defer / Follow-up
- Continue normal monitoring for this slice after stack merge.

### Needs Discussion
- None.

### Cross-cutting Risks
- Stack-wide risk: repeated restacks can mask branch-local regressions without targeted validation.

## REVIEW codex/prr-m4-s06d-foundation-scratch-audit-ledger

### Quick Take
- Reviewed PR #1332 (https://github.com/mateicanavra/civ7-modding-tools/pull/1332).
- Churn profile: +193 / -0 across 1 files files.
- Verification signal: bun run lint:mapgen-docs: FAIL.

### High-Leverage Issues
- Verification gate failed for this branch (bun run lint:mapgen-docs: FAIL).

### PR Comment Context
- Comment volume: comments=2, reviews=0.
- Review threads: unresolved=0, resolved=0.
- Automation/non-substantive chatter excluded from issue ranking.

### Fix Now (Recommended)
- Re-run and stabilize the failing verification gate for this branch before merge.

### Defer / Follow-up
- Continue normal monitoring for this slice after stack merge.

### Needs Discussion
- None.

### Cross-cutting Risks
- Stack-wide risk: repeated restacks can mask branch-local regressions without targeted validation.

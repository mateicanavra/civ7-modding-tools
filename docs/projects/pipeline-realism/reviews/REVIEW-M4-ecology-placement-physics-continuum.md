---
milestone: M4
id: M4-review
status: draft
reviewer: AI agent
---

# REVIEW M4 Ecology Placement Physics Continuum

This document is append-only for milestone task reviews. Each entry must use:
- `## REVIEW <workBranch>`
- `### Quick Take`
- `### High-Leverage Issues`
- `### PR Comment Context`
- `### Fix Now (Recommended)`
- `### Defer / Follow-up`
- `### Needs Discussion`
- `### Cross-cutting Risks`

## REVIEW codex/MAMBO-m3-002-stage-split-earth-system-first

### Quick Take
- Earth-system stage split is structurally correct and aligns with continuum direction.

### High-Leverage Issues
- Legacy ecology config key migration risk remains if branch is consumed standalone.

### PR Comment Context
- PR #1223 has one unresolved compatibility-oriented review thread.
- PR #1223: refactor(ecology): split earth system stages and integrate biome edge refinement (https://github.com/mateicanavra/civ7-modding-tools/pull/1223)

### Fix Now (Recommended)
- Add explicit legacy-to-new stage key migration or hard error path.

### Defer / Follow-up
- Add regression test for old ecology preset key handling.

### Needs Discussion
- Whether temporary compatibility was acceptable during cutover sequencing.

### Cross-cutting Risks
- Silent config fallback can poison downstream parity baselines.
- Runtime-vs-viz mismatch analysis: none observed. Gameplay/runtime truth remains authoritative when conflicts exist.

## REVIEW codex/MAMBO-m3-005-plan-reefs-deterministic

### Quick Take
- Deterministic reef-family planning is in place and test-backed.

### High-Leverage Issues
- No blocking branch-local defect confirmed in this pass.

### PR Comment Context
- PR #1226 has no unresolved inline reviewer findings.
- PR #1226: feat(ecology): implement deterministic reef family planning (https://github.com/mateicanavra/civ7-modding-tools/pull/1226)

### Fix Now (Recommended)
- None immediate.

### Defer / Follow-up
- Add realism-metric checks for reef distribution quality.

### Needs Discussion
- Whether current reef heuristics are sufficient for realism goals.

### Cross-cutting Risks
- Determinism can mask ecological quality regressions without quality gates.
- Runtime-vs-viz mismatch analysis: none observed. Gameplay/runtime truth remains authoritative when conflicts exist.

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

## REVIEW codex/MAMBO-lakes-resources-waterfill-rootcause

### Quick Take
- Lifecycle ordering fix is correct: recalc areas then water cache sync after lakes.

### High-Leverage Issues
- No blocking branch-local defect confirmed in this pass.

### PR Comment Context
- PR #1238 has no unresolved human inline review threads.
- PR #1238: fix(hydrology): recalculate areas after lake generation to preserve water tiles (https://github.com/mateicanavra/civ7-modding-tools/pull/1238)

### Fix Now (Recommended)
- None immediate.

### Defer / Follow-up
- Continue toward deterministic lake authority migration.

### Needs Discussion
- None.

### Cross-cutting Risks
- Engine-lake authority can still diverge from hydrology truth at edges.
- Runtime-vs-viz mismatch analysis: observed: branch specifically mitigates runtime-vs-viz/lifecycle mismatch. Gameplay/runtime truth remains authoritative when conflicts exist.

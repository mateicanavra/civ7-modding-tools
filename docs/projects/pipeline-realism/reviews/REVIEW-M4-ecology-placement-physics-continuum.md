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

## REVIEW codex/MAMBO-elevation-post-hydrology-lifecycle

### Quick Take
- Post-river area/water refresh correctly restores lifecycle ordering.

### High-Leverage Issues
- No blocking branch-local defect confirmed in this pass.

### PR Comment Context
- PR #1241 has no unresolved human inline review threads.
- PR #1241: fix(hydrology): refresh area/water caches after river generation (https://github.com/mateicanavra/civ7-modding-tools/pull/1241)

### Fix Now (Recommended)
- None immediate.

### Defer / Follow-up
- Convert spike diagnostics into enforceable parity gates.

### Needs Discussion
- Formal lifecycle invariant scope across map-hydrology and map-ecology.

### Cross-cutting Risks
- Parity divergence remains possible without hard gates.
- Runtime-vs-viz mismatch analysis: observed: branch mitigates a known runtime-vs-viz/lifecycle mismatch. Gameplay/runtime truth remains authoritative when conflicts exist.

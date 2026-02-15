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

## REVIEW codex/MAMBO-elevation-terrain-parity-audit

### Quick Take
- Elevation parity optimization improves performance and avoids unnecessary restoration.

### High-Leverage Issues
- Drift detection can false-negative when water cache state is stale.

### PR Comment Context
- PR #1239 has no unresolved human inline review threads.
- PR #1239: perf(map-morphology): optimize buildElevation to avoid unnecessary terrain restoration (https://github.com/mateicanavra/civ7-modding-tools/pull/1239)

### Fix Now (Recommended)
- Add stale-cache false-negative test and harden drift guard.

### Defer / Follow-up
- Add telemetry for repair-skipped decision paths.

### Needs Discussion
- Performance optimization boundaries vs strict correctness checks.

### Cross-cutting Risks
- Missed drift can cascade into hydrology/ecology/placement artifacts.
- Runtime-vs-viz mismatch analysis: observed: potential stale-cache mismatch between runtime state and parity logic. Gameplay/runtime truth remains authoritative when conflicts exist.

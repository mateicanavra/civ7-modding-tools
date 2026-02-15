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

## REVIEW codex/default-config-intent-tuning

### Quick Take
- Preset tuning aligns to intent but changes are very broad in one slice.

### High-Leverage Issues
- Large multi-domain parameter churn lacks attached quantitative acceptance evidence.

### PR Comment Context
- PR #1237 has no unresolved human inline review threads.
- PR #1237: feat(climate): tune map configs for more realistic hydrology and biomes (https://github.com/mateicanavra/civ7-modding-tools/pull/1237)

### Fix Now (Recommended)
- Gate acceptance on seed-matrix diagnostics and metric deltas.

### Defer / Follow-up
- Split future tuning into smaller profile-focused changes.

### Needs Discussion
- How much tuning breadth is acceptable per branch for reviewability.

### Cross-cutting Risks
- Debug/rollback complexity rises sharply with broad tuning bundles.
- Runtime-vs-viz mismatch analysis: none observed. Gameplay/runtime truth remains authoritative when conflicts exist.

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

## REVIEW codex/M3-015-hydrology-effectiveMoisture-soils

### Quick Take
- Hydrology-owned effective moisture and soils integration improves ecology grounding.

### High-Leverage Issues
- Climate-refine schema strictness relaxation can hide payload drift.

### PR Comment Context
- PR #1236 has no unresolved human inline review threads.
- PR #1236: refactor(ecology): use Hydrology effectiveMoisture instead of local derivation (https://github.com/mateicanavra/civ7-modding-tools/pull/1236)

### Fix Now (Recommended)
- Re-tighten unknown-key validation or add explicit rejection tests.

### Defer / Follow-up
- Add seed-matrix evidence for biome/vegetation response deltas.

### Needs Discussion
- Keep fixed moisture constants hardcoded vs config-driven.

### Cross-cutting Risks
- Hydrology/ecology semantics can drift without strict contracts.
- Runtime-vs-viz mismatch analysis: none observed. Gameplay/runtime truth remains authoritative when conflicts exist.

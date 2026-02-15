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

## REVIEW codex/MAMBO-m3-003-scorelayers-artifact-and-score-ops

### Quick Take
- ScoreLayers substrate landed and enables deterministic feature planning.

### High-Leverage Issues
- Occupancy base reserves deep ocean and can contradict ice suitability scoring.

### PR Comment Context
- PR #1224 has one unresolved thread on occupancy/placement semantics.
- PR #1224: feat(ecology): add score layer operations for wetlands, reefs, and ice features (https://github.com/mateicanavra/civ7-modding-tools/pull/1224)

### Fix Now (Recommended)
- Remove blanket deep-ocean reservation from shared occupancy base.

### Defer / Follow-up
- Add dedicated deep-water ice placement coverage tests.

### Needs Discussion
- Canonical boundary between occupancy hard-blocks and feature-specific constraints.

### Cross-cutting Risks
- Mismatched occupancy vs score artifacts can mislead truth validation.
- Runtime-vs-viz mismatch analysis: observed: score and occupancy can disagree for ice-eligible ocean tiles. Gameplay/runtime truth remains authoritative when conflicts exist.

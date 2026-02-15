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

## REVIEW codex/prr-epp-s3-lakes-deterministic

### Quick Take
- Deterministic lake-plan authority replaced random engine lake generation.

### High-Leverage Issues
- Upstream expansion mutates lake mask in-pass and can violate hop semantics.

### PR Comment Context
- PR #1261 has one unresolved algorithmic correctness review thread.
- PR #1261: feat(map-hydrology): cut over lakes to deterministic hydrology plan (https://github.com/mateicanavra/civ7-modding-tools/pull/1261)

### Fix Now (Recommended)
- Use frontier/snapshot expansion to avoid in-pass mutation effects.

### Defer / Follow-up
- Add property tests for hop-distance invariants.

### Needs Discussion
- Keep nonzero upstream expansion vs sink-only posture.

### Cross-cutting Risks
- Order-coupled expansion can produce non-physical lake growth.
- Runtime-vs-viz mismatch analysis: observed: runtime lake growth can diverge from intended planning semantics. Gameplay/runtime truth remains authoritative when conflicts exist.

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

## REVIEW codex/prr-epp-s2-ecology-physics-cutover

### Quick Take
- Core deterministic ecology cutover landed and aligns with intended architecture.

### High-Leverage Issues
- Legacy map-ecology key translation drop can break existing configs branch-locally.

### PR Comment Context
- PR #1260 has one unresolved compatibility review thread.
- PR #1260: feat(ecology): enforce deterministic physics-first planners (https://github.com/mateicanavra/civ7-modding-tools/pull/1260)

### Fix Now (Recommended)
- Restore compatibility mapping or complete all config migrations in same slice.

### Defer / Follow-up
- Remove compatibility path only after explicit migration closure.

### Needs Discussion
- Policy for intentional mid-stack breaking changes.

### Cross-cutting Risks
- Branch-local breakage risk if consumed outside full stack context.
- Runtime-vs-viz mismatch analysis: none observed. Gameplay/runtime truth remains authoritative when conflicts exist.

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

## REVIEW codex/prr-epp-s5-placement-randomness-zero

### Quick Take
- Deterministic wonders/discoveries cut random placement authority successfully.

### High-Leverage Issues
- Two significant regressions remain: wonders key compatibility and discovery default mapping semantics.

### PR Comment Context
- PR #1266 has unresolved P1 and P2 review threads.
- PR #1266: feat(placement): replace random wonders/discoveries with deterministic stamping (https://github.com/mateicanavra/civ7-modding-tools/pull/1266)

### Fix Now (Recommended)
- Fix config key migration/compat and ensure discovery defaults reflect active runtime mapping.

### Defer / Follow-up
- Add conformance tests for non-default discovery mappings.

### Needs Discussion
- Backward-compatibility expectations for config surfaces during cutover.

### Cross-cutting Risks
- Branch-local compile/semantic drift risk in modded configs.
- Runtime-vs-viz mismatch analysis: none observed. Gameplay/runtime truth remains authoritative when conflicts exist.

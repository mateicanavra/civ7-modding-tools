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

## REVIEW codex/MAMBO-resources-stamping-rootcause

### Quick Take
- Restamp-before-resource generation addresses root cause directionally.

### High-Leverage Issues
- Failure path is fail-open: code logs restamp failure and continues generation.

### PR Comment Context
- PR #1240 has unresolved P2 feedback on fail-open continuation.
- PR #1240: fix(placement): restamp landmass regions before resource generation (https://github.com/mateicanavra/civ7-modding-tools/pull/1240)

### Fix Now (Recommended)
- Make restamp failure fatal or explicitly skip downstream generation.

### Defer / Follow-up
- Replace placeholder resource-count outputs with real counts.

### Needs Discussion
- Fail-fast policy for placement pipeline invariants.

### Cross-cutting Risks
- Catch-and-continue can hide invalid world-state generation.
- Runtime-vs-viz mismatch analysis: observed: invalid state can propagate despite logged failure. Gameplay/runtime truth remains authoritative when conflicts exist.

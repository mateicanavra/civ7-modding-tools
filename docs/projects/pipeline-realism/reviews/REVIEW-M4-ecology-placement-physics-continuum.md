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

## REVIEW codex/MAMBO-m3-012-fix-biomes-stripes

### Quick Take
- Stripe banding remediation and hydrology-index consumption are directionally strong.

### High-Leverage Issues
- Legacy biome tuning knobs risk becoming silent no-ops after classifier shift.

### PR Comment Context
- PR #1233 has unresolved P2 feedback on tuning compatibility semantics.
- PR #1233: fix(ecology): fix biomes horizontal stripe banding (https://github.com/mateicanavra/civ7-modding-tools/pull/1233)

### Fix Now (Recommended)
- Map/deprecate legacy tuning knobs explicitly with clear failure modes.

### Defer / Follow-up
- Add migration docs/tests for affected knob ownership.

### Needs Discussion
- Intentional architecture shift vs accidental loss of tunability.

### Cross-cutting Risks
- Silent knob no-ops erode trust in configuration surfaces.
- Runtime-vs-viz mismatch analysis: none observed. Gameplay/runtime truth remains authoritative when conflicts exist.

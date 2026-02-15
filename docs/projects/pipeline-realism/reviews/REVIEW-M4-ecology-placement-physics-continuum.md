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

## REVIEW codex/MAMBO-m3-013-bio-lat-cutoff

### Quick Take
- Latitude-cutoff smoothing and thermal-state adjustments reduce abrupt biome seams.

### High-Leverage Issues
- Feature viz categories may omit pre-existing engine features.

### PR Comment Context
- PR #1235 has unresolved P2 feedback on viz-category completeness.
- PR #1235: fix(ecology): smooth tropical-temperate biome transitions to prevent latitude cutoffs (https://github.com/mateicanavra/civ7-modding-tools/pull/1235)

### Fix Now (Recommended)
- Build category metadata from observed/runtime feature IDs.

### Defer / Follow-up
- Add regression coverage with pre-existing non-placed features.

### Needs Discussion
- Whether hydrology thermal-state coupling inside this ecology fix is intentional.

### Cross-cutting Risks
- Incomplete viz metadata can mislead downstream analysis.
- Runtime-vs-viz mismatch analysis: observed: runtime features can exist outside emitted viz categories. Gameplay/runtime truth remains authoritative when conflicts exist.

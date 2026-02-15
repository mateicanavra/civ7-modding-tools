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

## REVIEW codex/prr-epp-s3b-lakes-regression-fix

### Quick Take
- Default sink-only setting mitigates lake over-placement regression.

### High-Leverage Issues
- Latent algorithmic bug remains reachable when nonzero upstream steps are enabled.

### PR Comment Context
- PR #1264 has no unresolved threads, but latent risk remains.
- PR #1264: fix(hydrology): change default maxUpstreamSteps to 0 to prevent lake over-placement (https://github.com/mateicanavra/civ7-modding-tools/pull/1264)

### Fix Now (Recommended)
- Patch nonzero expansion semantics before enabling beyond default.

### Defer / Follow-up
- Document maxUpstreamSteps as constrained or experimental.

### Needs Discussion
- Deprecate knob vs keep with fixed semantics.

### Cross-cutting Risks
- Default-only mitigation can hide unresolved root-cause paths.
- Runtime-vs-viz mismatch analysis: observed: mitigation reduces mismatch by constraining behavior. Gameplay/runtime truth remains authoritative when conflicts exist.

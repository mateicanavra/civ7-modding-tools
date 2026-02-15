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

## REVIEW codex/prr-epp-s6-hardening-docs-tests

### Quick Take
- Hardening/docs/tests sweep closes many continuity gaps and expands scans.

### High-Leverage Issues
- No unresolved branch review thread, but latent hydrology nonzero-upstream risk still exists.

### PR Comment Context
- PR #1267 has no unresolved review threads.
- PR #1267: feat(pipeline-realism): add ecology-placement-physics cutover plan and implementation (https://github.com/mateicanavra/civ7-modding-tools/pull/1267)

### Fix Now (Recommended)
- Optionally lock maxUpstreamSteps to sink-only until algorithmic fix lands.

### Defer / Follow-up
- Track follow-up for discovery default mapping fidelity audit.

### Needs Discussion
- Permanently disallow nonzero upstream expansion vs fix and support.

### Cross-cutting Risks
- Hidden regressions can return if sensitive knobs are re-enabled without guards.
- Runtime-vs-viz mismatch analysis: observed: branch hardens mismatch detection but inherits prior latent algorithm risk. Gameplay/runtime truth remains authoritative when conflicts exist.

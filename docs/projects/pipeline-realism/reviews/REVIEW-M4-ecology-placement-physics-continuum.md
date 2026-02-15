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

## REVIEW codex/MAMBO-m3-009-cleanup-delete-legacy-chance

### Quick Take
- Chance/multiplier cleanup materially advances deterministic ecology flow.

### High-Leverage Issues
- Runtime path still throws on viz key gaps and schema strictness was loosened.

### PR Comment Context
- PR #1230 has unresolved P1/P2 review feedback and explicit follow-up pressure.
- PR #1230: refactor(ecology): delete legacy chance and multiplier paths (https://github.com/mateicanavra/civ7-modding-tools/pull/1230)

### Fix Now (Recommended)
- Make viz mapping non-throwing in runtime and restore strict schema unknown-key rejection.

### Defer / Follow-up
- Add tests for unknown plot effects and unknown schema keys.

### Needs Discussion
- Hard separation of gameplay authority from visualization metadata completeness.

### Cross-cutting Risks
- Viz metadata gaps can become runtime blockers against gameplay truth.
- Runtime-vs-viz mismatch analysis: observed: viz category lookup can abort valid runtime behavior. Gameplay/runtime truth remains authoritative when conflicts exist.

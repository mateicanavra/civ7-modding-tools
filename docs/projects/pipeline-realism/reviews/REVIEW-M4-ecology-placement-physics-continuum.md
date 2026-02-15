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

## REVIEW codex/MAMBO-m3-004-plan-ice-deterministic

### Quick Take
- Deterministic ice planner wiring is correct in structure and stage flow.

### High-Leverage Issues
- Seed contract enforces nonnegative values while derived step seeds can be signed.

### PR Comment Context
- PR #1225 has one unresolved thread on seed contract mismatch.
- PR #1225: refactor(ecology): implement deterministic ice planning with score-based approach (https://github.com/mateicanavra/civ7-modding-tools/pull/1225)

### Fix Now (Recommended)
- Align seed schema with derived seed behavior across planners.

### Defer / Follow-up
- Add schema-validation test for signed deterministic seeds.

### Needs Discussion
- Single signedness convention for all deterministic planner contracts.

### Cross-cutting Risks
- Input validation mismatches can fail valid deterministic runs.
- Runtime-vs-viz mismatch analysis: none observed. Gameplay/runtime truth remains authoritative when conflicts exist.

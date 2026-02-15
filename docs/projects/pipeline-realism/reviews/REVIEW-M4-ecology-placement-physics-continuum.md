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

## REVIEW codex/MAMBO-m3-010-post-cutover-cleanup

### Quick Take
- This branch is planning/docs scaffolding for follow-up cleanup work.

### High-Leverage Issues
- Scope/expectation mismatch risk if interpreted as runtime cleanup completion.

### PR Comment Context
- PR #1231 has no unresolved inline reviewer findings.
- PR #1231: docs(pipeline-realism): add post-cutover cleanup and bugfix issues (https://github.com/mateicanavra/civ7-modding-tools/pull/1231)

### Fix Now (Recommended)
- None code-level.

### Defer / Follow-up
- Track downstream implementation closure explicitly from this scaffold.

### Needs Discussion
- Whether docs-only completion should count as milestone implementation completion.

### Cross-cutting Risks
- Milestone can look complete while execution work remains deferred.
- Runtime-vs-viz mismatch analysis: none observed. Gameplay/runtime truth remains authoritative when conflicts exist.

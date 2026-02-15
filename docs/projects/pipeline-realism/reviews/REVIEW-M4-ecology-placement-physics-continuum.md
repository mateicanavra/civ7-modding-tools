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

## REVIEW codex/MAMBO-m3-008-stamping-strict-features-apply

### Quick Take
- Strict feature stamping posture is aligned with no-probabilistic-gating goals.

### High-Leverage Issues
- Smoke test timeout signature is incompatible with Bun test API.

### PR Comment Context
- PR #1229 has unresolved P1 feedback on test signature correctness.
- PR #1229: refactor(ecology): enforce strict feature stamping with no probabilistic gating (https://github.com/mateicanavra/civ7-modding-tools/pull/1229)

### Fix Now (Recommended)
- Fix Bun timeout usage and keep strict stamping guardrails active.

### Defer / Follow-up
- Add lint/check guard against unsupported test options signatures.

### Needs Discussion
- None beyond framework-correctness discipline.

### Cross-cutting Risks
- Broken smoke tests can hide real runtime regressions.
- Runtime-vs-viz mismatch analysis: none observed. Gameplay/runtime truth remains authoritative when conflicts exist.

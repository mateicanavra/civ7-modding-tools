# Architecture: How M3 Uses Stage/Step/Op/Strategy/Rule Semantics

This document applies the MapGen architecture semantics to the Ecology M3 cutover.

Read first: `VISION.md`.

## Canonical Semantics (applied)

- **Stage**: config compilation boundary; produces per-step raw configs. Stages do not run; steps run.
- **Step**: orchestration node; reads artifacts/buffers; calls ops; publishes artifacts; emits viz.
- **Op**: atomic algorithmic unit (compute/score/plan); explicit strategy envelope `{ strategy, config }`.
- **Strategy**: variability within an op; selected by config; schema-valid.
- **Rule**: op-local policy unit; used heavily for scoring; not imported by steps.

## Truth vs Projection

M3 preserves a one-way dependency:
- Truth stages produce canonical physics products (artifacts).
- Projection stages deterministically map truth into engine-facing fields/effects.

In M3:
- Truth ecology includes: pedology, biomes, score layers, and deterministic planning.
- Projection `map-ecology` stamps/materializes the finalized plan (minimal, deterministic).

## Score -> Plan -> Stamp (the causal spine)

### Score

- A dedicated truth stage produces `artifact:ecology.scoreLayers`.
- Every feature has an independent per-tile score layer.
- Score layers must not bake cross-feature heuristics.

### Plan

- Planning is codified inside planning ops (strategies + rules), not in steps.
- Steps orchestrate:
  1. read scoreLayers + any required truth artifacts
  2. pass relevant layers into plan ops
  3. publish deterministic feature intent artifacts

### Stamp (projection)

- `map-ecology/features-apply` stamps the plan into the engine.
- Engine constraint failures (cannot stamp) are treated as planner bugs (gated).

## Determinism + No-Fudging Contract

Allowed:
- deterministic ranking and selection
- seeded tie-breaks (only for ties / stable sorting)

Disallowed:
- chance percentages
- output multipliers/bonuses used to gate existence
- probabilistic edges/jitter that changes outcomes
- random gating in merge/stamp

## Mutation Posture

- Artifacts are treated as immutable snapshots.
- If large mutable numeric state is required across steps, we explicitly model it as:
  - either a published-once handle with codified mutation posture, or
  - a recomputed derived snapshot per step.

M3 will choose one posture for occupancy/conflict state and lock it in `CONTRACTS.md`.

## Enforcement Rails (what we will gate)

- Ordering source of truth is recipe-only.
- No silent skips / no shouldRun.
- Steps must not import op implementations or rules.
- Strategy envelopes are explicit and compile-resolved.

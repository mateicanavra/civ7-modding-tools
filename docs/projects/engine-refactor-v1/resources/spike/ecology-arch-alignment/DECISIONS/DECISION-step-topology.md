# Decision Packet: Step topology for a no-behavior-change architecture alignment refactor

## Question

In the behavior-preserving refactor (Phase 3), do we:
- keep stage ids + step ids stable and pursue maximal modularity primarily at the **op/module** level, or
- split/restructure steps now to match the greenfield target topology immediately?

## Context (pointers only)

- Docs:
  - `docs/projects/engine-refactor-v1/resources/spike/ecology-arch-alignment/GREENFIELD.md`
  - `docs/projects/engine-refactor-v1/resources/spike/ecology-arch-alignment/REFRACTOR-TARGET-SHAPE.md`
  - `docs/system/libs/mapgen/policies/TRUTH-VS-PROJECTION.md`
- Code:
  - Ecology stage: `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/index.ts`
  - Map-ecology stage: `mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/index.ts`

## Why this is ambiguous

- The “maximal modularity” directive could be interpreted as “split everything now” (steps + ops).
- But the refactor constraint is “no behavior change”, and steps are major contract surfaces:
  - stage public schema shape
  - step ids referenced in docs, tooling, and potentially configs
  - additional artifacts/edges and parity complexity

## Why it matters

- Blocks/unblocks:
  - Decides whether Phase 3 includes step/stage surface migrations or focuses on op modularization + compile-time translation.
- Downstream contracts affected:
  - stage public schema and any presets/configs that address these steps
  - viz key grouping and trace semantics

## Simplest greenfield answer

- Split truth stage into thin orchestrator steps:
  - compute substrate
  - soils
  - biomes
  - per-feature intent planners
  - merge
- Split gameplay stage into:
  - projection-only
  - stamping/materialization-only

## Why we might not yet simplify

- We do not yet have a fully hardened parity harness and “no behavior change” invariants enforced in CI for step-topology changes.
- Step splitting often implies:
  - new artifacts, new config surfaces, new edge ordering
  - more places to accidentally perturb determinism/viz keys

## Options

1) **Option A**: Keep stage ids + step ids stable; maximize modularity at ops/modules first (recommended)
   - Description:
     - Preserve current stage ids (`ecology`, `map-ecology`) and existing step ids.
     - Achieve maximal modularity through:
       - atomic per-feature ops
       - compute substrate ops
       - step orchestration and compile-time translation (where needed)
     - Defer step splitting until parity harness is stronger (can be a follow-on after Phase 3).
   - Pros:
     - Lower contract churn; easier behavior-preserving proof.
     - Still meets the locked directives (ops are where atomicity is enforced).
   - Cons:
     - Step boundaries remain less expressive until the follow-up.

2) **Option B**: Split steps now to match the greenfield topology
   - Description:
     - Introduce new steps (and possibly new stages) during Phase 3 to match `GREENFIELD.md`.
   - Pros:
     - Maximum architectural alignment immediately.
   - Cons:
     - Higher blast radius: config/schema migration, parity complexity, potential consumer/viz churn.

## Proposed default

- Recommended: **Option A**
- Rationale:
  - It is compatible with maximal modularity (at the op boundary) while minimizing step-surface churn during the no-behavior-change cutover.

## Acceptance criteria

- [ ] SPEC updated at: `docs/projects/engine-refactor-v1/resources/spike/ecology-arch-alignment/FEASIBILITY.md`
- [ ] Migration slice created/updated at: `docs/projects/engine-refactor-v1/resources/spike/ecology-arch-alignment/PHASE-3-SKELETON.md`
- [ ] Follow-ups tracked: none (Phase 3 hardening decides whether/when to revisit step splitting)


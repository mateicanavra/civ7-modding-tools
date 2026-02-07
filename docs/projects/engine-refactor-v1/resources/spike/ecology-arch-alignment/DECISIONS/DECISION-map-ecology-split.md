# Decision Packet: Split `map-ecology` into projection-only vs stamping-only stages?

## Question

Should we split the current `map-ecology` stage into separate stages (or at least separate steps) for:
- projection-only (artifact-only, no adapter writes), and
- stamping/materialization (adapter writes, effect tags),

or keep the current topology for the no-behavior-change refactor?

## Context (pointers only)

- Code:
  - `mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/index.ts`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/plot-effects/index.ts`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/features-apply/index.ts`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/plotBiomes.ts`
- Docs:
  - `docs/system/libs/mapgen/policies/TRUTH-VS-PROJECTION.md`
  - `docs/projects/engine-refactor-v1/resources/spike/ecology-arch-alignment/GREENFIELD.md`

## Why this is ambiguous

- Greenfield architecture prefers “projection first, then stamping” because it clarifies:
  - where engine writes occur
  - which effect tags gate downstream
- But splitting stages/steps increases contract churn and parity surface area during a no-behavior-change refactor.

## Why it matters

- Blocks/unblocks:
  - Influences Phase 3 sequencing and the number of migration slices needed.
- Downstream contracts affected:
  - step ids, stage ids, and effect tag ownership.

## Simplest greenfield answer

- Separate projection artifacts from engine stamping:
  - projection step(s) publish `artifact:map.*`
  - stamping steps provide effect tags after adapter writes

## Why we might not yet simplify

- Current `map-ecology` stage is small (3 steps) and already mostly aligned:
  - `plot-biomes` and `features-apply` already provide explicit engine effect tags
  - only `plot-effects` lacks an effect tag

## Options

1) **Option A**: Keep `map-ecology` topology; fix effect tagging only (recommended)
   - Description:
     - Keep stage + step structure stable.
     - Introduce an explicit effect tag for `plot-effects` (see decision packet).
   - Pros:
     - Minimal churn; preserves behavior with low risk.
   - Cons:
     - Projection-vs-stamping boundary remains implicit, but manageable at this scale.

2) **Option B**: Split into projection-only + stamping-only stages/steps now
   - Pros:
     - Maximum clarity and alignment with greenfield model.
   - Cons:
     - Higher migration overhead; more parity gates.

## Proposed default

- Recommended: **Option A**
- Rationale:
  - Achieves the main feasibility goal (explicit adapter-write boundaries via effect tags) without expanding the contract churn of Phase 3.

## Acceptance criteria

- [ ] SPEC updated at: `docs/projects/engine-refactor-v1/resources/spike/ecology-arch-alignment/PHASE-3-SKELETON.md`
- [ ] Migration slice created/updated at: `docs/projects/engine-refactor-v1/resources/spike/ecology-arch-alignment/PHASE-3-SKELETON.md`
- [ ] Follow-ups tracked: none


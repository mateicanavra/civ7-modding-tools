# Decision Packet: Effect tag for `plot-effects` adapter write boundary

## Question

Should `plot-effects` provide an explicit effect tag, and if so:
- what should the id/namespace be, and
- should it be adapter-owned (verified) or mod-owned (unverified)?

## Context (pointers only)

- Code:
  - `mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/plot-effects/index.ts`
  - `mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/steps/plot-effects/contract.ts`
  - Tags registry: `mods/mod-swooper-maps/src/recipes/standard/tags.ts`
  - Adapter effect constants: `packages/civ7-adapter/src/effects.ts` (`ENGINE_EFFECT_TAGS`)
- Neighbor steps:
  - `plot-biomes` provides `effect:engine.biomesApplied`
  - `features-apply` provides `effect:engine.featuresApplied`

## Why this is ambiguous

- `plot-effects` mutates engine state (adapter writes) but currently provides no effect tag, making this boundary implicit.
- Some engine effect tags are centralized in `@civ7/adapter`, but not all engine-related effects are (example: `effect:engine.riversModeled` is mod-owned).

## Why it matters

- Blocks/unblocks:
  - Enables explicit gating and clearer pipeline reasoning for engine writes.
- Downstream contracts affected:
  - Any later stage that wants to ensure plot effects are applied before it runs (or before emitting diagnostics).

## Simplest greenfield answer

- Every adapter-write boundary provides an explicit effect id, owned in the most appropriate registry:
  - adapter-owned when verification should be strong and shared across mods
  - mod-owned when the effect is local or verification is intentionally weak

## Why we might not yet simplify

- Adding an adapter-owned effect requires cross-package changes and potentially new adapter verification logic.
- For a behavior-preserving refactor, a mod-owned unverified effect may be sufficient.

## Options

1) **Option A**: Add a mod-owned effect tag `effect:engine.plotEffectsApplied` (recommended)
   - Description:
     - Add `M4_EFFECT_TAGS.engine.plotEffectsApplied = "effect:engine.plotEffectsApplied"` in `mods/mod-swooper-maps/src/recipes/standard/tags.ts`.
     - Add it to `plot-effects` `provides: [...]`.
     - Leave it unverified initially (like other mod-owned effect tags).
   - Pros:
     - No adapter package changes required.
     - Makes the boundary explicit immediately.
   - Cons:
     - Cannot be strongly verified via adapter effect history (unless implemented later).

2) **Option B**: Add adapter-owned `ENGINE_EFFECT_TAGS.plotEffectsApplied`
   - Description:
     - Extend `packages/civ7-adapter/src/effects.ts` and adapter recording so verification can be strong.
   - Pros:
     - Consistent with other verified engine effects.
   - Cons:
     - Cross-package change; larger blast radius.

3) **Option C**: Keep no effect tag
   - Pros:
     - No change.
   - Cons:
     - Keeps an important adapter-write boundary implicit; harder to gate and reason about.

## Proposed default

- Recommended: **Option A**
- Rationale:
  - Feasibility stage goal is explicit boundaries without unnecessary cross-package churn.
  - Option B can remain a follow-on if strong verification becomes important.

## Acceptance criteria

- [ ] SPEC updated at: `docs/projects/engine-refactor-v1/resources/spike/ecology-arch-alignment/CONTRACT-MATRIX.md`
- [ ] Migration slice created/updated at: `docs/projects/engine-refactor-v1/resources/spike/ecology-arch-alignment/PHASE-3-SKELETON.md`
- [ ] Follow-ups tracked: none


# Decision Packet: Mutability posture for `artifact:ecology.biomeClassification`

## Question

Should `artifact:ecology.biomeClassification` be:
- a publish-once mutable handle (refined in-place), or
- an immutable snapshot (refinement republishes a new artifact)?

## Context (pointers only)

- Code:
  - `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/biomes/index.ts` (publishes artifact)
  - `mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps/biome-edge-refine/index.ts` (mutates in-place)
- Docs:
  - `docs/system/libs/mapgen/policies/TRUTH-VS-PROJECTION.md`

## Why this is ambiguous

- Current implementation refines the classification in-place, but the contract/docs do not clearly declare this as intentional.
- Immutable artifacts are easier to reason about, but may require more migration work and more memory.

## Why it matters

- Blocks/unblocks:
  - Determines how Phase 3 should treat artifact publication boundaries and parity checks.
- Downstream contracts affected:
  - Any consumer reading `artifact:ecology.biomeClassification` after refinement.

## Simplest greenfield answer

- Immutable snapshot artifacts:
  - each step publishes its own outputs as values
  - refinement republishes a new artifact or a new versioned artifact id

## Why we might not yet simplify

- Behavior-preserving refactor should minimize changes in publication semantics unless necessary.
- Current downstream steps likely assume the refined value is in the same artifact id.

## Options

1) **Option A**: Keep publish-once mutable handle (recommended for behavior-preserving refactor)
   - Description:
     - Explicitly document that refinement mutates `biomeIndex` in place.
   - Pros:
     - Preserves behavior and consumer expectations.
     - Minimal parity risk.
   - Cons:
     - Harder to reason about without explicit documentation and tests.

2) **Option B**: Switch to immutable republish
   - Description:
     - `biome-edge-refine` republishes a new artifact value (or a new artifact id).
   - Pros:
     - Cleaner mental model and fewer hidden side-effects.
   - Cons:
     - Requires consumer updates; larger parity surface.

## Proposed default

- Recommended: **Option A**
- Rationale:
  - The feasibility stage goal is “no behavior change”; we can preserve semantics now and revisit immutability as an intentional follow-on once parity harnesses are mature.

## Acceptance criteria

- [ ] SPEC updated at: `docs/projects/engine-refactor-v1/resources/spike/ecology-arch-alignment/CONTRACT-MATRIX.md` (explicitly records mutability posture)
- [ ] Migration slice created/updated at: `docs/projects/engine-refactor-v1/resources/spike/ecology-arch-alignment/PHASE-3-SKELETON.md`
- [ ] Follow-ups tracked: none (optional later improvement)


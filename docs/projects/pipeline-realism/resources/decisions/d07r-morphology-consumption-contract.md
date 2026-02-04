# Decision Packet: Define Morphology Consumption Contract (Era + Provenance)

## Question

What is the **maximal Morphology-first** consumption contract for Foundation era fields and provenance/tracer-derived signals, and which deterministic blending rules define how Morphology turns those inputs into continuous belts (no wall mountains)?

## Context (pointers only)

- Docs: `docs/system/libs/mapgen/reference/domains/FOUNDATION.md` (truth + projection artifacts; `tectonicHistory`, `tectonics`, tile projections); `docs/system/libs/mapgen/reference/domains/MORPHOLOGY.md` (current Morphology contract: consumes `foundation.plates` + `foundation.crustTiles`); `docs/system/libs/mapgen/adrs/adr-001-era-tagged-morphology.md` (single-pass era interpretation; provenance payload pattern); `docs/projects/pipeline-realism/resources/decisions/d04-evolution-semantics-history-model.md` (Eulerian era fields + bounded tracer)
- Code: `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/validation.ts` (`eraCount !== 3` guard); `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-coasts/steps/landmassPlates.contract.ts` (current upstream deps); `mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/contract.ts` (era fields + rollups); `mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-segments/contract.ts` (segment inputs for belt continuity)

## Why this is ambiguous

- Foundation exposes **era-resolved history** (`tectonicHistory`) but Morphology only consumes **tile projections** (`plates`, `crustTiles`).
- D04 allows **bounded tracer history** but does not define a Morphology-facing contract.
- Current morphology mountain placement can produce **wall-like belts** when boundary proximity is treated as a hard line rather than a continuous belt field.

## Why it matters

- Blocks/unblocks: Enables Morphology to produce **belted, age-aware relief** (wow factor) without multi-pass physics; defines the minimal new Foundation projections Morphology must rely on (so we can harden tests and observability).
- Downstream contracts affected: `artifact:foundation.tectonicHistory` (era fields + rollups); `artifact:foundation.tectonicSegments` (continuity + belt stitching); Morphology pre/mid/post steps (belt formation, diffusion, erosion inputs).

## Simplest greenfield answer

Morphology consumes **per-era tectonic fields + bounded tracer provenance** and derives continuous **belt corridors** that diffuse uplift by age/recency; boundary lines are never used directly as height walls.

## Why we might not yet simplify

- Foundation does not yet publish **tile-space era projections** or tracer projections; adding them is a contract + performance change.
- Current validation enforces `eraCount === 3`, limiting blending generality.
- Some Morphology ops are still tuned around single-snapshot `plates` tensors.

## Options

1) **Option A**: Keep current inputs + optional era reads
   Description: Morphology continues to consume only `foundation.plates` + `foundation.crustTiles`; era history is optional and used for narrative tags only.
   Pros: Minimal new contract surface.
   Cons: Does not fix wall-mountains; ignores provenance/recency.

2) **Option B**: Morphology requires era fields + bounded tracer (deterministic blend)
   Description: Add mandatory tile-space **era projections** and **provenance/tracer fields**; define fixed blending + belt continuity rules used by Morphology ops.
   Pros: Era-aware belts; deterministic and explainable; enables observability invariants and trace-based debugging.
   Cons: Requires new Foundation projections + validation updates.

3) **Option C**: Morphology consumes mesh-space truth directly
   Description: Morphology reads mesh-space `tectonicHistory` + segments and performs its own sampling.
   Pros: Avoids new Foundation projection artifacts.
   Cons: Breaks Morphology’s tile-first truth posture; increases per-step complexity.

## Proposed default

- Recommended: **Option B (mandatory era fields + bounded tracer with deterministic blend)**
- Rationale: Matches D04’s Eulerian era fields + bounded tracer posture; preserves Morphology’s tile-first truth while adding the minimum era/provenance surface required to eliminate wall-mountains; keeps consumption deterministic and testable without introducing authoring knobs.

## Acceptance criteria

- [ ] SPEC updated at: `docs/projects/pipeline-realism/resources/spec/sections/morphology-contract.md`
- [ ] Migration slice created/updated at: none yet (contract-only decision)
- [ ] Follow-ups tracked: none needed yet (decision packet only)

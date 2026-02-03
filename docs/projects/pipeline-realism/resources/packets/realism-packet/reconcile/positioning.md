# Positioning: 4 doc sets vs current Foundation

Date: 2026-02-03

Goal: position the three relevant doc sets relative to:
- the *current* Foundation implementation (mesh/crust/plateGraph/tectonics/projection), and
- each other,
with a focus on a **fresh refactor toward an evolutionary physics model** (basaltic lid → tectonic evolution → crustal differentiation; explicit history/iterations).

## Current codebase reality (baseline)

Implementation (standard recipe Foundation stage):
- `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/mesh.ts`
- `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/crust.ts`
- `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/plateGraph.ts`
- `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/tectonics.ts`
- `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/projection.ts`
- `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/plateTopology.ts`

In short:
- Plates do **not** advect over time; kinematics are sampled once and used to infer boundary regimes + intensities.
- Crust is **pre-authored** (type/age) rather than differentiated through subduction/arc accretion.
- “History” exists (tectonic eras) but is a derived driver overlay, not an evolving plate/crust simulation.

Canonical contract framing (truth vs projection):
- `docs/system/libs/mapgen/reference/domains/FOUNDATION.md`

## Doc set A: Phase-2 Foundation vertical refactor (model-first contracts)

Representative docs:
- `docs/projects/engine-refactor-v1/resources/workflow/domain-refactor/plans/foundation/spike-foundation-current-state.md`
- `docs/projects/engine-refactor-v1/resources/workflow/domain-refactor/plans/foundation/spike-foundation-modeling.md`

Positioning:
- **Primary intent:** refactor *architecture + contracts* (ops-first, artifacts, strict validation) while preserving the causal spine (mesh → crust → plates → tectonics).
- **Relationship to current code:** this posture is largely *already reflected* in today’s stage wiring (mesh-first truth artifacts + tile projections).
- **Evolutionary basaltic-lid relevance:** low-to-medium.
  - Explicitly treats multi-era geology simulation as out of scope unless pulled into a slice plan.
  - Useful as “spine/contract” constraints for any future evolutionary engine.

How to use for the evolutionary refactor:
- Treat as **migration mechanics / contract discipline** (how to land big changes safely), not as the target physics model.

## Doc set B: M11 Foundation realism spike (remediation of current model)

Representative docs:
- `docs/projects/engine-refactor-v1/resources/spike/spike-foundation-realism-gaps.md`
- `docs/projects/engine-refactor-v1/resources/spike/spike-foundation-realism-open-questions-alternatives.md`
- `docs/projects/engine-refactor-v1/resources/spike/foundation-realism/*`

Positioning:
- **Primary intent:** make *today’s* Foundation outputs feel more geologically believable without blowing up the pipeline.
- **Relationship to current code:** tight.
  - These docs cite current ops and propose modifications/replacements inside the existing step spine.
- **Evolutionary basaltic-lid relevance:** medium.
  - Talks about “tectonic evolution” mainly as *history signals* and “pseudo-evolution” (segment drift / belt propagation / era summaries).
  - Does not propose “start from basaltic lid; subduction manufactures continents” as the core model.

How to use for the evolutionary refactor:
- Treat as **current-state audit + validation/observability spec**:
  - it contains concrete realism metrics and failure modes we still want to prevent in the new engine.
- Some sub-proposals may become stepping stones (e.g., segment-based boundary modeling), but the set is not a target evolutionary model spec.

## Doc set C: Imported “foundation-proposals” (forward-simulation evolutionary model)

Imported from commit `338e7af49faf2e8167d2fe04d4474a1a395e82b0`:
- `docs/projects/pipeline-realism/resources/packets/foundation-proposals/unified-foundation-refactor.md`
- `docs/projects/pipeline-realism/resources/packets/foundation-proposals/tectonic-evolution-engine.md`
- `docs/projects/pipeline-realism/resources/packets/foundation-proposals/first-principles-crustal-evolution.md`
- `docs/projects/pipeline-realism/resources/packets/foundation-proposals/foundation-domain.md`
- `docs/projects/pipeline-realism/resources/packets/foundation-proposals/foundation-domain-improvements.md`
- Provenance note: `docs/projects/pipeline-realism/resources/packets/foundation-proposals/README.md`

Positioning:
- **Primary intent:** define a *new target physics model* (forward simulation) with explicit history/iterations.
- **Relationship to current code:** loose.
  - It is not written as “patch these ops”; it reads as a new engine with new state surfaces.
- **Evolutionary basaltic-lid relevance:** high.
  - Explicitly frames the model as starting from a global basaltic lid and manufacturing continental crust via subduction/arc processes.
  - Introduces a more explicit mantle/thermal narrative (mantle heat, insulation, rifting thresholds, plume behavior).

How to use for the evolutionary refactor:
- Treat as the **target model proposal** (greenfield physics posture) that needs to be reconciled with the contract/migration posture from sets A/B.

## Doc set D: Imported “foundation-refactor-proposal packet” (proposal + supporting specs)

Imported from commit `daba582314c0569ac1cc902b3c22facae48480e7`:
- `docs/projects/pipeline-realism/resources/packets/foundation-refactor-proposal-packet/raw/docs/system/libs/mapgen/foundation-refactor-proposal.md`
- `docs/projects/pipeline-realism/resources/packets/foundation-refactor-proposal-packet/raw/docs/system/libs/mapgen/_archive/foundation-tectonic-evolution-spec.md`
- `docs/projects/pipeline-realism/resources/packets/foundation-refactor-proposal-packet/raw/docs/system/libs/mapgen/_archive/foundation-first-principles-lid-to-continents-spec.md`
- `docs/projects/pipeline-realism/resources/packets/foundation-refactor-proposal-packet/raw/docs/system/libs/mapgen/_archive/foundation-plate-motion-and-partition-spec.md`
- Provenance note: `docs/projects/pipeline-realism/resources/packets/foundation-refactor-proposal-packet/README.md`

Positioning:
- **Primary intent:** another target-model proposal, but with more “spec sheet” granularity for individual subsystems (plate motion/partition, crust assembly, projection consumption, resolution authoring).
- **Relationship to current code:** medium.
  - Reads like “new target model”, but many specs are written with concrete existing stage seams in mind (what inputs/outputs need to exist for downstream stages).
- **Evolutionary basaltic-lid relevance:** high.
  - Explicitly frames the planet as starting from a basaltic lid and evolving differentiated crust via tectonics.

How to use for the evolutionary refactor:
- Treat as a **second target-model packet** that should be reconciled with C:
  - C tends to describe the engine end-to-end; D tends to carve subsystem contracts/specs.
  - Where they disagree, treat the disagreement as a decision point and record it explicitly (then link the decision back here).

## Relationship between B, C, and D (not derived; parallel)

There are no direct references between:
- the M11 realism spike docs, and
- the imported proposal packets (C and D).

They should be treated as parallel efforts:
- B: “make current thing less fake” (remediation plan)
- C: “replace current thing with an evolution engine” (target model, end-to-end)
- D: “replace current thing with an evolution engine” (target model, subsystem specs)

## Decision checkpoint (for reconciliation)

If the goal is *explicitly* an evolutionary basaltic-lid model:
- C and D become the target model sources (reconcile into one coherent spec).
- B becomes the guardrails/metrics spec (what “realistic” means and how to test it).
- A becomes the migration/contract posture (how to land it without hybrid soup).

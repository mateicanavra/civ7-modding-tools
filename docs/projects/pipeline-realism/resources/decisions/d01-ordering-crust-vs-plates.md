# Decision Packet: Define crust vs plate ordering

## Question

Should the Foundation pipeline treat **crust state as a prerequisite for plate partitioning** (crust-driven resistance) or treat **plate partitioning as a prerequisite for crust evolution** (plates-first simulation)?

## Context (pointers only)

- Code:
- `docs/system/libs/mapgen/reference/domains/FOUNDATION.md` (section `Current Mapping (Standard Recipe)`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts` (stage step order)
- `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/plateGraph.contract.ts` (requires `foundation.crust`)
- `mods/mod-swooper-maps/src/domain/foundation/ops/compute-plate-graph/index.ts` (crust resistance used in partitioning)
- Docs (Proposal C):
- `docs/projects/pipeline-realism/resources/packets/foundation-proposals/unified-foundation-refactor.md` (section `### 6.2 Algorithm: Intent-Driven Plate Assignment`)
- `docs/projects/pipeline-realism/resources/packets/foundation-proposals/unified-foundation-refactor.md` (section `### 7.3 The Main Simulation Loop`)
- `docs/projects/pipeline-realism/resources/packets/foundation-proposals/first-principles-crustal-evolution.md` (section `### Revised Simulation Loop`)
- Docs (Proposal D):
- `docs/projects/pipeline-realism/resources/packets/foundation-refactor-proposal-packet/raw/docs/system/libs/mapgen/foundation-refactor-proposal.md` (section `### 1) Basaltic Lid Initialization (t=0)`)
- `docs/projects/pipeline-realism/resources/packets/foundation-refactor-proposal-packet/raw/docs/system/libs/mapgen/foundation-refactor-proposal.md` (section `### 3) Differentiation → Craton Assembly`)
- `docs/projects/pipeline-realism/resources/packets/foundation-refactor-proposal-packet/raw/docs/system/libs/mapgen/foundation-refactor-proposal.md` (section `### 5) Partitioning with Resistance Fields`)
- `docs/projects/pipeline-realism/resources/packets/foundation-refactor-proposal-packet/raw/docs/system/libs/mapgen/_archive/foundation-plate-motion-and-partition-spec.md` (section `### 2) Resistance Field for Partitioning`)

## Why this is ambiguous

- Proposal C frames plates as the upstream primitive and crust evolution as a downstream simulation outcome.
- Proposal D frames crustal differentiation and resistance as a prerequisite for plate partitioning.
- Current implementation already computes crust before plate-graph, but its crust model is simplistic and not aligned with either proposal’s “first-principles” posture, leaving the intended ordering unclear for the refactor target.

## Why it matters

- Blocks/unblocks:
- Plate partition algorithm choice (uniform vs resistance-aware Dijkstra).
- What needs to exist before plate-graph runs (crust fields, rift weakening, craton seeds).
- Downstream contracts affected:
- `artifact:foundation.plateGraph` semantics and reproducibility.
- How Morphology interprets plates vs crust signals (timing of when those signals become authoritative).

## Simplest greenfield answer

Crust-first ordering: initialize a basaltic lid, derive early crustal strength/age/type signals (via stress + differentiation), then partition plates using resistance fields.

## Why we might not yet simplify

- Backwards-compatibility: current consumers expect a stable plate layout; changing ordering changes plate boundaries and derived plate tensors.
- Tooling: a crust-first partition assumes crust signals exist before plate-graph, which requires a new pre-plate “differentiation” step with validation infrastructure.
- Migration risk: retuning authoring profiles and morphology rules may be required if plate boundaries shift meaningfully.

## Options

1) **Option A**: Plates-first (C-like)
- Description: partition plates from mesh + intent; run crust evolution inside the tectonic simulation after plates exist.
- Pros:
- Simplifies early pipeline: no pre-plate crust derivation needed.
- Keeps plate partition algorithm independent of crust signals.
- Cons:
- Ignores crust resistance effects on plate boundaries.
- Forces “crust drives plates” behavior to be simulated indirectly or ignored.

2) **Option B**: Crust-first resistance partition (D-like)
- Description: derive initial crust strength/age/type (basaltic lid + differentiation + rift weakening) before plate partition; use resistance-aware Dijkstra for plate-graph.
- Pros:
- Matches D’s physical story (weak zones guide plate boundaries).
- Aligns with current step ordering (crust already precedes plate-graph).
- Produces a more defensible realism story for D01.
- Cons:
- Requires a new pre-plate crust initialization step and additional validation.
- Potentially larger migration impact on plate layout + downstream morphology.

3) **Option C**: Hybrid (initial crust priors + later evolution)
- Description: introduce a minimal pre-plate crust resistance field for partitioning, but treat full crust evolution as downstream of plate-graph.
- Pros:
- Offers a middle path for migration.
- Limits disruption to current simulation loop.
- Cons:
- Adds two crust models (priors vs evolved), increasing conceptual overhead.
- Risk of divergence between “partition crust” and “evolved crust”.

## Proposed default

- Recommended: Option B (crust-first resistance partition).
- Rationale:
- D’s ordering is physically coherent and aligns with the target realism claim.
- Current step ordering and `compute-plate-graph` already assume crust availability, reducing the structural delta.

## Migration risk notes + why-not-other-options

- Migration risks (Option B):
- Plate boundary layouts will shift due to resistance fields; expect tuning churn in Morphology and any plate-based heuristics.
- Requires a new pre-plate crust derivation step and validation checks, otherwise results will be under-specified.
- Why not Option A:
- It undercuts the “crust drives plates” realism claim and loses resistance-aware partitioning.
- Why not Option C:
- Adds a transitional crust model without a clear deletion target, creating long-term ambiguity.

## Acceptance criteria

- [ ] SPEC updated at: `docs/projects/pipeline-realism/resources/spec/foundation-evolutionary-physics-SPEC.md`
- [ ] Migration slice created/updated at: `docs/projects/pipeline-realism/resources/migrations/foundation-evolutionary-refactor.md`
- [ ] Follow-ups tracked: none needed

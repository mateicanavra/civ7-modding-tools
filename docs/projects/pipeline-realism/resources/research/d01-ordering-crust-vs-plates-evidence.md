# Evidence Memo: D01 Ordering (Crust vs Plates)

## Scope

Summarize evidence for the ordering decision: whether crust state should exist before plate partitioning or evolve after plates are defined.

## Proposal C evidence (plates-first posture)

- `docs/projects/pipeline-realism/resources/packets/foundation-proposals/unified-foundation-refactor.md`
- `### 6.2 Algorithm: Intent-Driven Plate Assignment` (plates are assigned before the evolution engine)
- `### 7.3 The Main Simulation Loop` (crust evolution occurs inside the tectonic evolution engine)
- `docs/projects/pipeline-realism/resources/packets/foundation-proposals/first-principles-crustal-evolution.md`
- `### Revised Simulation Loop` (crustal differentiation is modeled as part of the evolution loop)
- `### Eliminating the compute-crust Step` (pipeline changes assume crust emerges from simulation, not pre-assigned)

## Proposal D evidence (crust-first posture)

- `docs/projects/pipeline-realism/resources/packets/foundation-refactor-proposal-packet/raw/docs/system/libs/mapgen/foundation-refactor-proposal.md`
- `### 1) Basaltic Lid Initialization (t=0)` (global crust baseline before plate graph)
- `### 3) Differentiation → Craton Assembly` (crust strength/type derived before partition)
- `### 5) Partitioning with Resistance Fields` (plate graph uses resistance field)
- `docs/projects/pipeline-realism/resources/packets/foundation-refactor-proposal-packet/raw/docs/system/libs/mapgen/_archive/foundation-plate-motion-and-partition-spec.md`
- `### 2) Resistance Field for Partitioning` (explicit resistance field guiding partition)

## Current contract + code mapping (FOUNDATION)

Reference: `docs/system/libs/mapgen/reference/domains/FOUNDATION.md` (section `Current Mapping (Standard Recipe)`).

Current step ordering:
- `mesh` → `crust` → `plate-graph` → `tectonics` → `projection` → `plate-topology`
- Source: `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/index.ts`

Current dependency wiring:
- `plate-graph` requires `foundation.crust`
- Source: `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/plateGraph.contract.ts`

Current algorithm uses crust resistance:
- `compute-plate-graph` reads crust `type` + `age` to compute resistance during partitioning
- Source: `mods/mod-swooper-maps/src/domain/foundation/ops/compute-plate-graph/index.ts`

Implication:
- The existing contract already assumes crust availability prior to plate partitioning, even if crust is currently simplistic.

## Additional notes

- Proposal C’s plates-first ordering would represent a behavioral inversion from the current step wiring.
- Proposal D’s crust-first ordering matches the current stage order but would require upgrading pre-plate crust derivation to first-principles fidelity.

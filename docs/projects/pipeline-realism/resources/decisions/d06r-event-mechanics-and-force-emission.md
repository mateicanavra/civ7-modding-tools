# Decision Packet: Event Mechanics + Mandatory Force Emission (D06r)

## Question

Do we require **event semantics** (typed tectonic events with explicit state/provenance updates) and treat **era-resolved force fields** as mandatory emitted products (events -> fields), replacing fields-only tectonics that cannot express destruction/accretion or per-era causal explanations?

## Context (pointers only)

- Docs:
- `docs/projects/pipeline-realism/resources/spec/foundation-evolutionary-physics-SPEC.md` (canonical target posture)
- `docs/projects/pipeline-realism/resources/spec/sections/history-and-provenance.md` (D04r dual outputs)
- `docs/projects/pipeline-realism/resources/spec/sections/morphology-contract.md` (D07r Morphology consumption contract)
- `docs/projects/pipeline-realism/resources/spec/sections/mantle-forcing.md` (D02r mantle forcing substrate)
- `docs/system/libs/mapgen/reference/domains/FOUNDATION.md` (current contract + artifact surfaces)
- Code (current reality anchors):
- `mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-segments/index.ts` (segment intensities + polarity + drift)
- `mods/mod-swooper-maps/src/domain/foundation/ops/compute-tectonic-history/index.ts` (era fields from segment seeds + diffusion)
- `mods/mod-swooper-maps/src/domain/foundation/ops/compute-plates-tensors/lib/project-plates.ts` (tile projection uses tectonics fields)
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-coasts/steps/landmassPlates.ts` (consumes `upliftPotential`, `riftPotential`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-features/steps/volcanoes.ts` (consumes `volcanism`)
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-coasts/steps/ruggedCoasts.ts` (consumes boundary regime + closeness)

## Why This Is Ambiguous

- Proposal variants split between:
- event-driven subduction/collision semantics ("what is destroyed vs accreted" is first-class), and
- field-driven regime potentials where "subduction" is only an intensity field with no causal state changes.
- D04r makes provenance mandatory; provenance requires a causal story for when material is created, reset, or boundary-processed.
- D07r makes Morphology consume eras + provenance; Morphology requires continuous belts and consistent volcanic/orogenic signals tied to boundary mechanics.

## Why It Matters

- Without event semantics, subduction/collision outcomes are under-defined:
- arc volcanism degenerates into "volcanism near convergence",
- orogeny becomes wall-mountain risk (no belt corridor causality),
- provenance cannot explain why a cell's lineage reset occurred.
- The contract surface must remain consumable today:
- tile consumers expect `upliftPotential`, `riftPotential`, `boundaryType`, `volcanism` via `artifact:foundation.plates`.

## Options

1. **Option A: Fields-only tectonics**
2. **Option B: Events-only tectonics**
3. **Option C: Hybrid: events are canonical, events emit force fields**

## Proposed Default

Adopt **Option C**.

Normative requirement:
- Foundation produces a typed event set per era and treats event emission as the sole source of era fields (`tectonicHistory`) and provenance updates (`tectonicProvenance`).
- Foundation also produces the newest-era "current drivers" (`tectonics`) used for projection to tiles and current Morphology consumers.

## Decision Details (Normative)

### Event Types (Minimum Set)

- `convergence_subduction` (convergent boundary with polarity)
- `convergence_collision` (convergent boundary without polarity)
- `divergence_rift` (divergent boundary)
- `transform_shear` (transform boundary)
- `intraplate_hotspot` (mantle upwelling-driven volcanism away from boundaries)

### Per-Event State Changes (Required)

- Update per-cell provenance scalars (`lastBoundaryEra`, `lastBoundaryType`, `lastBoundaryPolarity`, `lastBoundaryIntensity`).
- Create new material lineage where required by mechanics (rift/hotspot and arc accretion reset `originEra`/`originPlateId` on a deterministic footprint).
- Maintain deterministic event ordering and tie-break rules so "which event won" is stable across runs.

### Era Field Emission + Diffusion Budgets (Required)

- Per-era force fields are emitted from events into mesh cells using a fixed kernel and radius budget per channel.
- Emission budgets are fixed constants (no fast/budget strategy) and are validated by invariants (see SPEC section).

### Invariants (Required)

- Determinism: event sets and emitted fields are bitwise stable given identical inputs.
- Boundedness: all emitted `u8` fields remain in `[0..255]`; event counts are bounded by segment topology.
- Causality: any provenance reset implies an originating event in the same era (rift/hotspot/accretion), and `lastBoundaryEra` implies non-zero boundary intensity.
- Coupling: `artifact:foundation.plates` continues to carry consistent drivers for current Morphology consumers.

### Wow Scenario (Required)

A "Pacific margin" scenario:
- an extended convergent margin emits a continuous orogeny corridor with a coherent volcanic arc on the overriding side,
- later rift initiation splits a back-arc basin with fresh crust lineage reset,
- provenance fields show a clean transition between old accreted belt segments and newly reset rift crust without wall-mountains.

## Mapping To Current Contract / Code

Current reality (from `docs/system/libs/mapgen/reference/domains/FOUNDATION.md`):
- `artifact:foundation.tectonicSegments` already exposes plate-pair topology, regime, polarity, and drift direction.
- `artifact:foundation.tectonicHistory` is currently derived by "seed + diffusion" from segments with 3 eras.
- `artifact:foundation.tectonics` (newest-era snapshot + `cumulativeUplift`) feeds `artifact:foundation.plates` projection and therefore Morphology.

D06r binds these into a single causal contract:
- segments are treated as event seeds,
- events are the canonical "why",
- era fields are mandatory emitted "what Morphology reads",
- provenance updates are mandatory "where did this come from".

## Acceptance Criteria

- [ ] Decision packet added at: `docs/projects/pipeline-realism/resources/decisions/d06r-event-mechanics-and-force-emission.md`
- [ ] Evidence memo added at: `docs/projects/pipeline-realism/resources/research/d06r-event-mechanics-and-force-emission-evidence.md`
- [ ] SPEC section added at: `docs/projects/pipeline-realism/resources/spec/sections/events-and-forces.md`

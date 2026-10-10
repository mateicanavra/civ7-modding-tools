---
id: Q-001
title: Low-Shore Neighborhood Semantics
recordKind: question
disposition: open
sourceRevision: 2a31c96f8d61ee713075974838dfd36a0b008021
locations:
  - id: "ecology-low-shore-substrate"
    label: "Low-Shore Substrate"
    relation: "question-owner"
    stage: "ecology-features"
    step: "score-layers"
    operation: "ecology.features.ops.computeFeatureSubstrate"
    sourceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/domain/ecology/modules/features/ops/compute-feature-substrate/contract.ts"
    lessonIds: ["marine-shores"]
  - id: "ecology-mangrove-scoring"
    label: "Mangrove Scoring"
    relation: "downstream-consumer"
    stage: "ecology-features"
    step: "score-layers"
    operation: "ecology.features.ops.scoreWetMangrove"
    sourceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/domain/ecology/modules/features/ops/wet-score-mangrove/contract.ts"
assessments:
  - claim: "The low-shore proximity implementation clips its rectangular X/Y window and does not wrap X."
    state: "supported"
    evidenceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/domain/ecology/modules/features/ops/compute-feature-substrate/rules/coastal-land-mask.ts"
  - claim: "Generic low-shore substrate retains finite-water shores while intertidal eligibility additionally requires external marine-water proximity."
    state: "supported"
    evidenceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/domain/ecology/modules/features/ops/compute-feature-substrate/rules/wetland-substrate-masks.ts"
  - claim: "The authored square stencil and radius have adequate physical support and intended world-boundary semantics."
    state: "unassessed"
  - claim: "Boundary or orientation sensitivity causes material downstream feature-placement or gameplay harm."
    state: "unassessed"
verification:
  - kind: source-inspection
    scope: "Source inspection confirms the clipped index-window implementation; no boundary experiment or physical-adequacy test was executed."
    revision: 2a31c96f8d61ee713075974838dfd36a0b008021
    date: '2026-10-10'
    evidenceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/domain/ecology/modules/features/ops/compute-feature-substrate/rules/coastal-land-mask.ts"
  - kind: source-inspection
    scope: "Source inspection confirms separate generic-water and external-marine source populations; existing test links below are historical evidence, not newly executed verification."
    revision: 2a31c96f8d61ee713075974838dfd36a0b008021
    date: '2026-10-10'
    evidenceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/domain/ecology/modules/features/ops/compute-feature-substrate/strategies/hydromorphic/index.ts"
  - kind: source-inspection
    scope: "Source inspection confirms the current feature-substrate and mangrove-scoring connections and changed inputs to other feature families, not equivalence of final placement."
    revision: 2a31c96f8d61ee713075974838dfd36a0b008021
    date: '2026-10-10'
    evidenceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/recipes/standard/stages/ecology/features/steps/score-layers/step.ts"
---

# Q-001: Low-Shore Neighborhood Semantics

Does a low shore retain the same ecological eligibility when its local landscape
crosses the east-west boundary of a cylindrical hex map? More broadly, what
physical relationship should "near water" represent here: proximity in a square
index window, distance on the hex grid, or an explicitly tolerated approximation?

The distinction matters because proximity helps decide where wetland features
can compete for placement. A boundary-dependent eligibility difference could
matter ecologically, but it is not itself evidence of changed feature placement
or gameplay harm. The implementation is known; its intended boundary behavior,
physical adequacy and downstream consequences remain separate questions.

## Where Shore Proximity Becomes Wetland Support

The question belongs to `ecology-features / score-layers`, where
`computeFeatureSubstrate` prepares eligibility masks for feature scorers.
[computeCoastalLandMask][coastal-rule] takes map width and height, exposed land,
an admitted source-water mask and a radius. It scans an inclusive rectangular
X/Y window, skips the target cell, clips both axes and does not wrap X. At radius
one, an interior window can inspect eight other cells rather than the six
native hex neighbors.

The [hydromorphic strategy][substrate-strategy] performs two separate proximity
calculations: one for resolved any-water sources and one for prescribed
`externalWaterMask` sources. The [wetland substrate rule][wetland-rule] combines
generic water proximity with elevation relative to sea level to identify low
shores. These support `hydromorphicMask`, meaning waterlogged substrate, and its
complement, `wellDrainedMask`. Finite-water shores remain eligible for this
generic support. Only `intertidalCoastMask` additionally requires external
marine-water proximity. Marine provenance and neighborhood geometry are thus
different parts of the model.

In [score-layers][score-step], marsh and tundra-bog scoring consume hydromorphic
support; mangrove scoring consumes intertidal support. Scores, terrain and biome
compatibility, and wetland arbitration stand between these masks and admitted
feature intent. A changed mask need not change a controlling score, and a
changed score need not win placement. Final intent also depends on plant-aware
[biome inputs][biome-step] and competing wet-family scores. Unchanged substrate
and mangrove logic therefore cannot establish placement equivalence when those
other inputs change.

## A Square Radius Is an Authored Choice

The [configuration][substrate-config] explicitly defines
`coastalAdjacencyRadius` as a square radius, defaulting to one. It does not
promise hex distance. A periodic square window would change boundary behavior;
a hex-distance neighborhood would change the authored metric as well. Those
are distinct choices, and selecting the latter requires a separate owner
decision about what proximity should mean.

This is meaningful counterevidence to the idea that any square stencil must be
a defect. The accepted marine-provenance repair deliberately retained geometry
and radius while separating finite-water shores from marine eligibility. Its
focused test establishes that separation, height gates and generic-mask
preservation, not periodicity or orientation independence. A deliberate clipped
raster approximation, a tolerated product limitation or an inactive downstream
gate could defeat the suspected consequence.

The separate [local-water hex-neighborhood rule][local-water-rule] belongs to
hydrology's land-water budget; it does not settle this square-window contract.
Likewise, the periodic biome repair offers a useful comparison method, not
authority to transfer another operation's requirements. The missing evidence is
an explicit boundary requirement and physical support for the stencil and
radius. No primary physical evidence assembled for this question selects a
replacement or demonstrates ecological harm.

## Comparisons That Separate Geometry From Consequence

A discriminating boundary comparison would place one exposed low-shore target
and one admitted water source first inside the index domain, then across the
east-west boundary. A parity-preserving cyclic X translation of all input fields
together holds rows, latitude, radius and the local source-target relationship
fixed. Elevation and sea datum, climate, fertility, river fields and source
identity remain identical in corresponding cells. Inverse-translating outputs
allows a like-for-like comparison without confusing a boundary effect with a
different environment. Generic finite-water and marine-source cases answer
different eligibility questions and remain separate comparisons.

Proximity masks, hydromorphic and intertidal masks, first controlling scores,
and admitted intent distinguish successive consequences. Exact correspondence
would disprove boundary sensitivity for that witness. Different masks with
identical controlling scores would refute a claimed scoring failure for that
witness, not for every possible consumer. A proximity-only difference would
establish boundary sensitivity without establishing physical or gameplay harm.
Evidence that the intended contract is deliberately bounded would instead
resolve the mismatch allegation as an accepted limitation, with its rationale.

Orientation is a further question only if equal treatment of hex-equivalent
local arrangements is required. A controlled interior hex-rotation comparison
could then distinguish orientation effects. Whole-world rotation is not an
appropriate invariant for latitude-dependent forcing and bounded Y. Neither
comparison preselects a new distance abstraction; reuse of an existing grid
primitive becomes relevant only if its semantics match the accepted contract.

The [original evidence packet][original-question] preserves the historical
decisions and test references. They are provenance, not newly executed boundary
experiments or scientific validation.

[coastal-rule]: https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/domain/ecology/modules/features/ops/compute-feature-substrate/rules/coastal-land-mask.ts
[substrate-strategy]: https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/domain/ecology/modules/features/ops/compute-feature-substrate/strategies/hydromorphic/index.ts
[substrate-config]: https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/domain/ecology/modules/features/ops/compute-feature-substrate/strategies/hydromorphic/config.ts
[wetland-rule]: https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/domain/ecology/modules/features/ops/compute-feature-substrate/rules/wetland-substrate-masks.ts
[score-step]: https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/recipes/standard/stages/ecology/features/steps/score-layers/step.ts
[biome-step]: https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/recipes/standard/stages/ecology/biomes/steps/biomes/step.ts
[local-water-rule]: https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/domain/hydrology/modules/climate/ops/compute-land-water-budget/rules/local-surface-water-opportunity.ts
[original-question]: https://github.com/mateicanavra/civ7-modding-tools/blob/92e1fff097e67f4bfedd3e2b3f6084d7642f04ef/docs/projects/native-map-controls/questions/q-001-low-shore-neighborhood.md

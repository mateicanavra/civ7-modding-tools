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

**Current source review (2026-10-10):** At
`2a31c96f8d61ee713075974838dfd36a0b008021`, the [substrate rule][current-coastal-rule],
[marine-source separation][current-substrate-strategy] and
[mangrove operation][current-mangrove-contract] are unchanged from the original
pin. Marine provenance remains source-supported while the square-window
geometry question stays open. [Plant-aware biome inputs][current-biome-step]
and [other wet-family scoring inputs][current-score-step] have changed and may
affect later wetland intent; unchanged substrate and mangrove code does not
establish identical final placement. A separate [local-water hex-neighborhood
rule][current-local-water-rule] does not settle this operation's authored
square-window contract. This review establishes source facts only, not physical
adequacy or downstream outcomes.

## Historical Evidence

The original packet below is preserved at
`fda02f26040a47f6bbd78ef685c1ad4fe909cc05`. Its linked tests and decisions are
historical evidence, not newly executed verification.

**Type:** triage. **Evidence disposition:** confirmed implementation behavior;
plausible boundary/topology concern; physical adequacy and material downstream
harm unresolved. No defect or repair is admitted by this entry.

**Context:** Source qualification for the marine-shore learning lesson exposed
a shared neighborhood contract question, not a failure of marine provenance.
All implementation and acceptance facts below are pinned to
`fda02f26040a47f6bbd78ef685c1ad4fe909cc05`.

**Question:** Does the low-shore source-proximity window provide the intended
neighborhood semantics on the cylindrical hex map, or can a longitude boundary
or grid orientation change meaningful substrate eligibility? The authored
[configuration][substrate-config] explicitly promises a square radius, not hex
distance. The open question is its boundary treatment and physical support.
A periodic square window changes boundary behavior; a hex-distance neighborhood
would change the authored metric and needs a separate owner decision.

**Implementation and affected path:**
[computeCoastalLandMask][coastal-rule] scans an inclusive rectangular X/Y index
window, skips the target, clips both axes and does not wrap X. Radius one can
inspect eight other cells in an interior square, not the six native hex
neighbors. Its inputs are width/height, exposed `landMask`, `sourceWaterMask`
and radius. The [hydromorphic strategy][substrate-strategy] calls it separately
with resolved any-water sources and prescribed `externalWaterMask` sources.
Keep those populations separate throughout the investigation.

The [wetland substrate rule][wetland-rule] combines generic coast proximity
with relative elevation to derive low-shore support. That affects
`hydromorphicMask` and complementary `wellDrainedMask`; external-water proximity
additionally gates `intertidalCoastMask`. In [score-layers][score-step], marsh and
tundra-bog scorers consume hydromorphic support, while the mangrove scorer
consumes intertidal support. A proximity difference need not survive those
scores, terrain/biome compatibility and wetland arbitration into actual feature
intent. Track masks, scores and admitted intent separately; do not infer changed
placement or gameplay from changed eligibility alone.

**Why it may matter:** A jointly translated source/receiver arrangement could
lose support at the X boundary even when its local world relationship is held.
A square index window may also distinguish hex-equivalent local orientations.
Those are hypotheses about an intended invariance, not measured ecological
harm, a whole-world rotation requirement or proof that a new metric is better.
Latitude, bounded Y and row parity must not be changed accidentally.

**Contrary evidence and limits:** The square-radius label is explicit authoring
evidence, not an accidental undocumented hex implementation. The
[accepted marine-provenance repair][marine-decision]
explicitly held the existing geometry and radius while separating generic
finite-water shores from marine eligibility. The [focused substrate test][substrate-test]
checks that distinction, height gates and generic-mask preservation; it does
not declare periodicity or isotropy. Another owner's [periodic biome repair][biome-decision]
provides a precedent for a held longitude-translation discriminator, not
authority to copy its law into this operation. A deliberate clipped raster
approximation, an inactive downstream gate or a tolerated product limitation
could defeat the suspected consequence. No primary physical evidence assembled
for this entry selects a stencil/radius or proves this approximation harmful.

**Missing evidence and simplification opportunity:** The missing contract
evidence concerns required world-boundary behavior and justified physical
support for the authored square approximation, not a promised hex distance.
Missing receipts are a held boundary comparison and its
first-consumer consequences, not another permanent artifact or a new global
distance abstraction. If a later accepted contract matches an existing public
grid primitive, assess reuse then; do not preselect it now.

**Smallest discriminating investigation:** Begin with one synthetic exposed
low-shore target and one admitted source, once inland in the index domain and
once across the east-west boundary. Cyclically translate all relevant input
fields together at fixed row and fixed radius; keep elevation/sea datum,
climate, fertility, river fields and source identity held. Inverse-translate the
outputs before comparing them. Run generic finite-water and marine-source arms
separately. Observe the proximity masks, resulting hydromorphic/intertidal masks
and first controlling scores before considering any planner consequence.

Exact correspondence would disprove boundary sensitivity for that witness.
Different masks but identical controlling scores would refute a claimed scoring
failure for that witness, not all potential consumers. A source-only difference
establishes boundary sensitivity, not physical or gameplay harm. If the owner
accepts a deliberately bounded index contract, close the mismatch allegation
as an accepted limitation with rationale rather than rewriting the contract by
test. Only if hex-isotropic local proximity is actually required should a later
held interior hex-rotation fixture be considered; a full globe rotation is not
an invariant of latitude-dependent forcing or bounded Y.

**Next check:** Revisit before changing coastal adjacency radius/geometry or
before a retained Earthlike low-shore anomaly is attributed to local water
availability. If that anomaly blocks current work, return it immediately to
the active owner. The workstream owner may admit a bounded contract investigation
to Linear; any repair additionally requires a settled contract and qualified
consequence. This entry selects no implementation and executes no new experiment.

[coastal-rule]: https://github.com/mateicanavra/civ7-modding-tools/blob/fda02f26040a47f6bbd78ef685c1ad4fe909cc05/plugins/mod/map/swooper-physics/src/domain/ecology/modules/features/ops/compute-feature-substrate/rules/coastal-land-mask.ts
[substrate-strategy]: https://github.com/mateicanavra/civ7-modding-tools/blob/fda02f26040a47f6bbd78ef685c1ad4fe909cc05/plugins/mod/map/swooper-physics/src/domain/ecology/modules/features/ops/compute-feature-substrate/strategies/hydromorphic/index.ts
[substrate-config]: https://github.com/mateicanavra/civ7-modding-tools/blob/fda02f26040a47f6bbd78ef685c1ad4fe909cc05/plugins/mod/map/swooper-physics/src/domain/ecology/modules/features/ops/compute-feature-substrate/strategies/hydromorphic/config.ts
[wetland-rule]: https://github.com/mateicanavra/civ7-modding-tools/blob/fda02f26040a47f6bbd78ef685c1ad4fe909cc05/plugins/mod/map/swooper-physics/src/domain/ecology/modules/features/ops/compute-feature-substrate/rules/wetland-substrate-masks.ts
[score-step]: https://github.com/mateicanavra/civ7-modding-tools/blob/fda02f26040a47f6bbd78ef685c1ad4fe909cc05/plugins/mod/map/swooper-physics/src/recipes/standard/stages/ecology/features/steps/score-layers/step.ts
[marine-decision]: https://github.com/mateicanavra/civ7-modding-tools/blob/fda02f26040a47f6bbd78ef685c1ad4fe909cc05/docs/projects/native-map-controls/terrestrial-water-influence.md#marine-habitat-provenance-prerequisite
[substrate-test]: https://github.com/mateicanavra/civ7-modding-tools/blob/fda02f26040a47f6bbd78ef685c1ad4fe909cc05/plugins/mod/map/swooper-physics/test/domains/ecology/features/ops/compute-feature-substrate/substrate.test.ts
[biome-decision]: https://github.com/mateicanavra/civ7-modding-tools/blob/fda02f26040a47f6bbd78ef685c1ad4fe909cc05/docs/projects/native-map-controls/biome-periodic-edges.md
[current-coastal-rule]: https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/domain/ecology/modules/features/ops/compute-feature-substrate/rules/coastal-land-mask.ts
[current-substrate-strategy]: https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/domain/ecology/modules/features/ops/compute-feature-substrate/strategies/hydromorphic/index.ts
[current-mangrove-contract]: https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/domain/ecology/modules/features/ops/wet-score-mangrove/contract.ts
[current-biome-step]: https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/recipes/standard/stages/ecology/biomes/steps/biomes/step.ts
[current-score-step]: https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/recipes/standard/stages/ecology/features/steps/score-layers/step.ts
[current-local-water-rule]: https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/domain/hydrology/modules/climate/ops/compute-land-water-budget/rules/local-surface-water-opportunity.ts

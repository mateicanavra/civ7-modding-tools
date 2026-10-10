---
id: Q-004
title: Point-Water Habitat Support
recordKind: question
disposition: open
sourceRevision: 2a31c96f8d61ee713075974838dfd36a0b008021
locations:
  - id: "ecology-point-water-substrate"
    label: "Point-Water Substrate"
    relation: "related-producer"
    stage: "ecology-features"
    step: "score-layers"
    operation: "ecology.features.ops.computeFeatureSubstrate"
    sourceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/domain/ecology/modules/features/ops/compute-feature-substrate/contract.ts"
  - id: "ecology-oasis-scoring"
    label: "Oasis Scoring"
    relation: "question-owner"
    stage: "ecology-features"
    step: "score-layers"
    operation: "ecology.features.ops.scoreWetOasis"
    sourceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/domain/ecology/modules/features/ops/wet-score-oasis/contract.ts"
  - id: "ecology-watering-hole-scoring"
    label: "Watering-Hole Scoring"
    relation: "question-owner"
    stage: "ecology-features"
    step: "score-layers"
    operation: "ecology.features.ops.scoreWetWateringHole"
    sourceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/domain/ecology/modules/features/ops/wet-score-watering-hole/contract.ts"
  - id: "ecology-wetland-planning"
    label: "Wetland Planning"
    relation: "downstream-consumer"
    stage: "ecology-features"
    step: "plan-wetlands"
    operation: "ecology.features.ops.planWetlands"
    sourceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/domain/ecology/modules/features/ops/features-plan-wetlands/contract.ts"
assessments:
  - claim: "At the 2a31c96f baseline, Earthlike point-water support excludes radius-two floodplain substrate from lowland radius-one river support; when every classified river exceeds the discharge floor, that support is empty. This is a retired mechanism."
    state: "supported"
    evidenceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/domain/ecology/modules/features/ops/compute-feature-substrate/rules/wetland-substrate-masks.ts"
  - claim: "The original 5f82b5f1 Standard1 and Huge2 diagnostic reports zero point-water habitat before climate scoring; its scope is those two baseline headless/mock cases, not the later source-led implementation."
    state: "supported"
  - claim: "A scalar comparison of the original retained pair finds that the baseline oasis warmth factor caps suitability below 0.42, even with perfect remaining factors. That direct warmth multiplier is retired."
    state: "supported"
  - claim: "A separately retained baseline control enabling point-water habitat everywhere still yields no score at the floor in the original pair; it is neither a proposed physical mask nor a test of the later source-led scorer."
    state: "supported"
  - claim: "The merged source-led scorers consume Hydrology's published local source opportunity and demand, multiplied by atmospheric dryness, without the retired isolated-water mask or direct warmth/fertility multipliers."
    state: "supported"
    evidenceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/09e8c9a87fba9c5078d20134ad1c8e04a858bfbb/plugins/mod/map/swooper-physics/src/domain/ecology/modules/features/model/policy/dryland-waterpoint-score.ts"
  - claim: "The qualified owner report establishes producer-consistent moderate-temperature oasis and watering-hole intent, but reports zero attempts and features for both families in all four prescribed generated worlds."
    state: "supported"
    evidenceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/09e8c9a87fba9c5078d20134ad1c8e04a858bfbb/docs/projects/native-map-controls/dryland-point-water-coherence.md#qualified-outcome"
  - claim: "At fixed climate and class, all four qualified worlds' native-compatible, captured-flat, observed-earlier-free populations have dryness factors below 0.42 even with unlimited source support."
    state: "supported"
    evidenceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/09e8c9a87fba9c5078d20134ad1c8e04a858bfbb/docs/projects/native-map-controls/dryland-point-water-coherence.md#qualified-outcome"
  - claim: "Atmospheric dryness, plant-responsive biome classification, local source support and native compatibility jointly admit ecologically appropriate point-water habitat with adequate occurrence."
    state: "unassessed"
verification:
  - kind: source-inspection
    scope: "Source inspection establishes the conditional containment of radius-one support by the radius-two floodplain proxy, not an all-seed result or a physical inundation model."
    revision: 2a31c96f8d61ee713075974838dfd36a0b008021
    date: '2026-10-10'
    evidenceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/domain/ecology/modules/features/ops/compute-feature-substrate/rules/wetland-substrate-masks.ts"
  - kind: source-inspection
    scope: "Source inspection confirms Earthlike's authored radii, discharge floor, oasis warmth ramp and admission floor. These model choices are not independently calibrated physical laws."
    revision: 2a31c96f8d61ee713075974838dfd36a0b008021
    date: '2026-10-10'
    evidenceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/maps/configs/swooper-earthlike.config.json"
  - kind: source-inspection
    scope: "Source inspection confirms separate oasis and watering-hole scorers consume the same point-water mask, with additional plant-water, dryness and temperature factors. The retained replay is prose evidence with separate custody limits."
    revision: 2a31c96f8d61ee713075974838dfd36a0b008021
    date: '2026-10-10'
    evidenceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/recipes/standard/stages/ecology/features/steps/score-layers/step.ts#L185-L202"
  - kind: source-inspection
    scope: "Inspection of the merged qualified outcome establishes what was reported at runtime 7b20d0b9da117bdaecb73a39f5a085d2964810da: source-consumer coherence, four zero-occurrence captures and conditional margins. This is not a new execution or resolution of scarcity."
    revision: 09e8c9a87fba9c5078d20134ad1c8e04a858bfbb
    date: '2026-10-10'
    evidenceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/09e8c9a87fba9c5078d20134ad1c8e04a858bfbb/docs/projects/native-map-controls/dryland-point-water-coherence.md#qualified-outcome"
  - kind: source-inspection
    scope: "Source inspection distinguishes plant-responsive nonpolar biome classification from atmospheric aridity in the point-water consumers. It identifies different meanings, not a defective classifier, rainfall or temperature owner."
    revision: 09e8c9a87fba9c5078d20134ad1c8e04a858bfbb
    date: '2026-10-10'
    evidenceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/09e8c9a87fba9c5078d20134ad1c8e04a858bfbb/docs/projects/native-map-controls/local-plant-water-design.md#complete-consumer-path"
---

# Q-004: Point-Water Habitat Support

When should a local water source in a dry landscape become an oasis or watering
hole? Source availability, atmospheric dryness and the surrounding biome answer
different questions. The open challenge is whether their combination describes
the same ecologically suitable place, not how to force more features onto a map.

The [qualified source-led implementation][qualified] establishes that the water
producer, feature scorers and legal planner can admit both families in
producer-consistent fixtures. Yet all four prescribed generated worlds still
contain **zero oasis and watering-hole attempts or features**. Source-consumer
coherence is supported; generated scarcity and ecological adequacy remain open.

## A Source Is Not A Dry Habitat

The pipeline carries local water opportunity from
`hydrology-climate-refine / climate-refine` into the oasis and watering-hole
operations in `ecology-features / score-layers`, then into `plan-wetlands`.
Hydrology's [source-and-access model][source-model] distinguishes modeled local
surface-water opportunity from atmospheric moisture. Its annual opportunity `L` can come
from imported flow or contact with a standing water body. It is published
directly, not inferred by subtracting rounded moisture fields.

The two [point-water scorers][scorer] combine that opportunity with potential
water demand `D` and atmospheric aridity `A`:

```text
sourceSupport = L / (L + D) when L > 0; otherwise 0
suitability   = drySuit(A) * sourceSupport
```

`L` and `D` use the same empirical rainfall-index scale. Source support lies
between zero and one; it is not a probability, an allocation of water or a
claim of year-round persistence. The family-specific dryness response expresses
a different condition: whether the atmosphere is dry enough for this kind of
feature. Earthlike's ramps are 0.60 to 0.95 for oasis and 0.45 to 0.85 for
watering hole. The shared admission floor remains 0.42, an authored model
choice rather than a calibrated physical constant.

There is no separate whole-tile plant-moisture, fertility or direct warmth
multiplier in these scorers. Temperature can still affect water demand.
The legal planner still respects terrain, native biome compatibility and
actual earlier feature occupancy. Producer-consistent moderate-temperature
fixtures demonstrate oasis intent on DESERT and watering-hole intent on PLAINS
without bypassing those constraints. That result does not establish appropriate
occurrence across generated worlds.

## Four Worlds Still Fall Below Admission

The [qualified near-miss analysis][qualified] examines each family's
native-biome-compatible, captured-flat sites without an observed earlier
floodplain, ice or reef feature. The maxima below describe those populations,
not all land and not a census of exact final planner legality.

| World / map and game seeds | Oasis max dryness factor | Watering-hole max dryness factor | Watering-hole max score |
| --- | ---: | ---: | ---: |
| Standard / 1/1 | 0 | 0.03881 | 0.01848 |
| Huge / 2/2 | 0 | 0.07702 | 0.04900 |
| Standard / 3/3 | 0 | 0.01505 | 0.00609 |
| Huge / 4/4 | 0 | 0.09005 | 0.02752 |

Because source support cannot exceed one, the dryness factor is also a ceiling
on suitability. At the captured climate and biome, even unlimited source
support leaves every site in these populations below 0.42. This is a conditional
bound, not a source-tuning prescription: changing water opportunity can also
change plant-responsive biome classification.

Standard 1/1 and Huge 2/2 have paired incumbent comparisons. Standard 3/3 and
Huge 4/4 are additional candidate variation captures, not additional
before/after pairs. None of the four demonstrates restored point-water
occurrence, and four worlds do not establish universal impossibility.

## Two Meanings Of Dryness

The [biome and feature consumers][consumers] interpret different aspects of
water. Nonpolar biome classification uses plant-water moisture and stress;
its moisture bucket is based on the absolute moisture index. Point-water
dryness instead uses atmospheric aridity, which compares demand with rainfall.
A native DESERT label therefore does not by itself establish high atmospheric
aridity, and a cold DESERT site is not itself evidence of a mapping defect.

A separate [bounded contract trace][retained] reproduces those distinct
meanings without identifying a specific contradiction. Its four low-aridity
DESERT witnesses follow the absolute plant-moisture bucket; the highest-aridity
land witness in each world is polar/snow rather than eligible dryland. Source-only
contrasts hold ambient climate fixed but can change plant state and compatible
biome. Positive local regimes still admit both families, without demonstrating
that generated Earthlike worlds reach those regimes.

The unresolved question is whether the empirical response scales and generated
dry-regime coverage adequately represent the intended habitats. Neither the
absolute moisture cutoff of 90, the dryness ramps nor the shared floor is
validated by a trace that reproduces the implemented meanings.
Evidence that appropriate dry, watered habitats fall outside the intersection
of compatible biomes and family responses
would challenge the interpretation. Evidence that the worlds lack such
habitats could explain the absence without increasing placement.

Neither the near-miss bounds nor the positive fixtures establish a rainfall or
thermal defect, a better coefficient, or a reason to lower the admission floor.
Annual source opportunity also leaves seasonal liquid-water survival,
groundwater, salinity and patch extent unresolved. [Q-005][suitability] retains
the separate question of marsh, bog, mangrove and shared admission;
[Q-001][geometry] retains neighborhood geometry.

## Evidence Boundaries

The [original question][baseline] and [evidence digest][retained] preserve the
earlier empty-mask and direct-warmth findings at their original revisions.
Those mechanisms are retired, not current blockers. This sheet's location map
and three original source inspections remain the explicit
`2a31c96f8d61ee713075974838dfd36a0b008021` navigation baseline. Its substrate
location is historical context; the two scorer locations own the open consumer
question. Their recipe coordinates remain unchanged.

The later qualified result has runtime
`7b20d0b9da117bdaecb73a39f5a085d2964810da` and merged report/source
`09e8c9a87fba9c5078d20134ad1c8e04a858bfbb`. Its paired comparator is
`ccb92fbc585ab0eddd1d2faa3a6b71c5aaa9179f`, not the original diagnostic's
`5f82b5f1f39040e83d909793eb296fc526420511` captures. The digest records these
separate identities and the compiled-dependency exception.

The separate contract trace uses inspected source
`2a41b9c3d2d9d19c9c2e095636538c8b6e982368` and the same four captured worlds.
Its negative attribution result is not an additional generation or a claim
that the empirical response scales are physically correct.

Near-miss demand is reconstructed through the actual post-albedo owner using
recovered land humidity; it is not originally captured demand. The pair closes
against authentic retained demand and prior occupancy, while the variation
cases retain the narrower observed-earlier-free qualification. Raw evidence
remains private. The added verification records are source/report inspections,
not new test executions, fresh native placement proof, all-seed prevalence or
physical calibration.

[qualified]: https://github.com/mateicanavra/civ7-modding-tools/blob/09e8c9a87fba9c5078d20134ad1c8e04a858bfbb/docs/projects/native-map-controls/dryland-point-water-coherence.md#qualified-outcome
[source-model]: https://github.com/mateicanavra/civ7-modding-tools/blob/09e8c9a87fba9c5078d20134ad1c8e04a858bfbb/docs/projects/native-map-controls/local-plant-water-design.md#source-and-access-definition
[scorer]: https://github.com/mateicanavra/civ7-modding-tools/blob/09e8c9a87fba9c5078d20134ad1c8e04a858bfbb/plugins/mod/map/swooper-physics/src/domain/ecology/modules/features/model/policy/dryland-waterpoint-score.ts
[consumers]: https://github.com/mateicanavra/civ7-modding-tools/blob/09e8c9a87fba9c5078d20134ad1c8e04a858bfbb/docs/projects/native-map-controls/local-plant-water-design.md#complete-consumer-path
[baseline]: https://github.com/mateicanavra/civ7-modding-tools/blob/9cc0ef028aff3fa23bcdf3765440de0d0aef9d1f/docs/projects/native-map-controls/questions/q-004-point-water-support.md
[retained]: ../wetland-occurrence-evidence.md
[geometry]: q-001-low-shore-neighborhood.md
[suitability]: q-005-wetland-suitability.md

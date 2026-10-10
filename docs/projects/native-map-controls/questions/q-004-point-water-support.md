---
id: Q-004
title: Point-Water Habitat Support
recordKind: question
disposition: open
sourceRevision: 2a31c96f8d61ee713075974838dfd36a0b008021
locations:
  - id: "ecology-point-water-substrate"
    label: "Point-Water Substrate"
    relation: "question-owner"
    stage: "ecology-features"
    step: "score-layers"
    operation: "ecology.features.ops.computeFeatureSubstrate"
    sourceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/domain/ecology/modules/features/ops/compute-feature-substrate/contract.ts"
  - id: "ecology-oasis-scoring"
    label: "Oasis Scoring"
    relation: "downstream-consumer"
    stage: "ecology-features"
    step: "score-layers"
    operation: "ecology.features.ops.scoreWetOasis"
    sourceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/domain/ecology/modules/features/ops/wet-score-oasis/contract.ts"
  - id: "ecology-watering-hole-scoring"
    label: "Watering-Hole Scoring"
    relation: "downstream-consumer"
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
  - claim: "Earthlike point-water support excludes the radius-two floodplain substrate from lowland radius-one river support; when every classified river exceeds the configured discharge floor, that support is empty."
    state: "supported"
    evidenceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/domain/ecology/modules/features/ops/compute-feature-substrate/rules/wetland-substrate-masks.ts"
  - claim: "The privately retained Standard1 and Huge2 diagnostic reports zero point-water habitat before oasis or watering-hole climate scoring; its scope is those two headless/mock cases."
    state: "supported"
  - claim: "The river-neighborhood and floodplain-exclusion proxies adequately distinguish localized water sources from inundation at the map's scale."
    state: "unassessed"
  - claim: "Removing the substrate exclusion would produce ecologically justified oasis or watering-hole placements."
    state: "unassessed"
verification:
  - kind: source-inspection
    scope: "Source inspection establishes the conditional containment of radius-one support by the radius-two floodplain proxy, not an all-seed result or a physical inundation model."
    revision: 2a31c96f8d61ee713075974838dfd36a0b008021
    date: '2026-10-10'
    evidenceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/domain/ecology/modules/features/ops/compute-feature-substrate/rules/wetland-substrate-masks.ts"
  - kind: source-inspection
    scope: "Source inspection confirms Earthlike's authored radii and discharge floor; these are not calibrated physical distances or flooding frequencies."
    revision: 2a31c96f8d61ee713075974838dfd36a0b008021
    date: '2026-10-10'
    evidenceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/maps/configs/swooper-earthlike.config.json#L888-L896"
  - kind: source-inspection
    scope: "Source inspection confirms separate oasis and watering-hole scorers consume the same point-water mask, with additional plant-water, dryness and temperature factors. The retained replay is prose evidence with separate custody limits."
    revision: 2a31c96f8d61ee713075974838dfd36a0b008021
    date: '2026-10-10'
    evidenceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/recipes/standard/stages/ecology/features/steps/score-layers/step.ts#L185-L202"
---

# Q-004: Point-Water Habitat Support

What should make a localized water source eligible for an oasis or watering
hole, and what evidence should exclude it as part of a floodplain? The pipeline
uses a nearby river as positive support, then a broader river neighborhood as
an exclusion. Those two interpretations of the same river can remove every
candidate before the feature's climate response is considered.

This is a question about the meaning of habitat support, not a demand for more
oases. A dry surrounding landscape, a local water opportunity and an inundated
floodplain are different concepts. Whether the current proxies distinguish
them well enough at the map's scale remains open. Two retained headless cases
demonstrate the support loss, but do not establish the right physical model or
an appropriate feature frequency.

## A River Both Admits And Excludes

The question begins in `ecology-features / score-layers`.
`computeFeatureSubstrate` creates masks: yes-or-no eligibility fields consumed
by individual feature scorers. In the [Earthlike configuration][earthlike],
point-water eligibility starts with exposed lowland within a square radius of
one of a classified river. Lowland means elevation no more than 150 model
relief units above sea level; despite historical parameter names, these are
not metres.

The [substrate rule][substrate] then removes sites in its floodplain proxy:
lowland within radius two of a classified river with discharge at least 96.
These radii and the discharge floor are authored model values, not observed
flood extents. The upstream [river-network operation][river-network] supplies
river class and discharge. Neither placed river graphics nor an already
occupied floodplain feature determines this substrate mask.

When all classified rivers exceed the discharge floor, the smaller eligible
neighborhood lies entirely inside the larger excluded neighborhood. Every
precursor is then removed. The word "isolated" in `isolatedWaterPointMask`
names this neighborhood-and-exclusion rule; it is not a measurement of a
spring, groundwater source or isolated basin.

## Where The Retained Cases Lose Support

The [retained evidence summary][retained] covers two selected Swooper Earthlike
headless/mock cases, Standard1 and Huge2. Their 1,145 and 1,878 lowland
radius-one river precursors all lie in floodplain substrate. Their minimum
classified-river discharges are approximately 173.08 and 179.96, both above
96. Both cases consequently have **zero point-water habitat**.

By contrast, actual prior floodplain features occupy only 95 and 244 tiles.
The broad substrate exclusion is not the same thing as that later occupancy.
Neither forest competition nor final feature application explains a support
mask that is already empty.

[Oasis scoring][oasis] and [watering-hole scoring][watering-hole] are already
separate operations. Both require this mask and then combine dryness,
plant-water and warmth; watering holes also use fertility. With no habitat,
their climate factors cannot admit a candidate. This identifies the first
loss in these cases, not every obstacle: selected otherwise free, flat
desert/plains witnesses also fail dryness factors. Deleting the mask veto
alone is not demonstrated to produce either feature.

## The Distinction That Remains Open

The ecological question is whether river proximity, localized water support
and inundation have been separated meaningfully, or whether one broad proxy
is doing incompatible jobs. The existing evidence does not select a groundwater
model, a flooding model, a replacement radius or a placement quota.

A useful distinction is between a genuinely inundated site and a site merely
near a river. Evidence of source identity and inundation could show that both
deserve the same exclusion, or that they should not share one. Holding climate,
terrain and biome suitability fixed would separate that habitat distinction
from a simultaneous change in dryness or available water. Observing substrate,
individual scores and admitted intent separately would reveal whether a
different habitat interpretation changes an actual controlling decision.

There is also counterevidence to a universal impossibility claim: the
[synthetic substrate test][substrate-test] includes positive point-water support
near a weak classified river below the discharge floor. It uses a different
neighborhood configuration and is not evidence of occurrence in generated
Earthlike worlds. This sheet cites the fixture's source; it does not report a
new execution of that test. Adequate source/inundation separation, or evidence
that the relevant worlds legitimately lack suitable dry, watered sites, could
resolve the suspected ecological consequence without increasing placement.

[Q-001][geometry] holds the separate question of neighborhood geometry and
world-boundary behavior. [Q-005][suitability] concerns other wetland responses
and shared admission. Neither a geometry change nor a lower placement floor
is assumed to answer this point-water question.

## What The Evidence Can Establish

The public [evidence summary][retained] preserves original receipt revision
`5f82b5f1f39040e83d909793eb296fc526420511`, runtime source bridge
`22e3976f276fd9a199635dd28e6e4d35777fb629` and inspected source
`2a31c96f8d61ee713075974838dfd36a0b008021` as distinct identities. It records
exact score-array and planner agreement alongside dependency-byte differences.
Its raw captures and diagnostic program remain private, so the summary alone
is not an independently reproducible experiment. Structured verification here
is source inspection, not that replay, live Civ7 observation, all-seed prevalence
or physical calibration.

[earthlike]: https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/maps/configs/swooper-earthlike.config.json#L888-L896
[substrate]: https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/domain/ecology/modules/features/ops/compute-feature-substrate/rules/wetland-substrate-masks.ts
[river-network]: https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/recipes/standard/stages/hydrology/hydrography/steps/network/step.ts#L92-L136
[retained]: ../wetland-occurrence-evidence.md
[oasis]: https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/domain/ecology/modules/features/ops/wet-score-oasis/strategies/warm-arid-waterpoint/index.ts
[watering-hole]: https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/domain/ecology/modules/features/ops/wet-score-watering-hole/strategies/arid-waterpoint/index.ts
[substrate-test]: https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/test/domains/ecology/features/ops/compute-feature-substrate/substrate.test.ts
[geometry]: q-001-low-shore-neighborhood.md
[suitability]: q-005-wetland-suitability.md

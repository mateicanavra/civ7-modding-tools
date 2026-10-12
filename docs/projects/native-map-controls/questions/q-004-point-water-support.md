---
id: Q-004
title: Point-Water Habitat Support
recordKind: question
disposition: open
sourceRevision: fe85600bb814cdeb977e36f4e9b5656aa322eb57
locations:
  - id: "ecology-point-water-substrate"
    label: "Point-Water Substrate"
    relation: "related-producer"
    stage: "ecology-features"
    step: "score-layers"
    operation: "ecology.features.ops.computeFeatureSubstrate"
    sourceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/fe85600bb814cdeb977e36f4e9b5656aa322eb57/plugins/mod/map/swooper-physics/src/domain/ecology/modules/features/ops/compute-feature-substrate/contract.ts"
  - id: "ecology-oasis-scoring"
    label: "Oasis Scoring"
    relation: "question-owner"
    stage: "ecology-features"
    step: "score-layers"
    operation: "ecology.features.ops.scoreWetOasis"
    sourceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/fe85600bb814cdeb977e36f4e9b5656aa322eb57/plugins/mod/map/swooper-physics/src/domain/ecology/modules/features/ops/wet-score-oasis/contract.ts"
  - id: "ecology-watering-hole-scoring"
    label: "Watering-Hole Scoring"
    relation: "question-owner"
    stage: "ecology-features"
    step: "score-layers"
    operation: "ecology.features.ops.scoreWetWateringHole"
    sourceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/fe85600bb814cdeb977e36f4e9b5656aa322eb57/plugins/mod/map/swooper-physics/src/domain/ecology/modules/features/ops/wet-score-watering-hole/contract.ts"
  - id: "ecology-wetland-planning"
    label: "Wetland Planning"
    relation: "downstream-consumer"
    stage: "ecology-features"
    step: "plan-wetlands"
    operation: "ecology.features.ops.planWetlands"
    sourceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/fe85600bb814cdeb977e36f4e9b5656aa322eb57/plugins/mod/map/swooper-physics/src/domain/ecology/modules/features/ops/features-plan-wetlands/contract.ts"
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
  - claim: "The earlier source-led consumer qualification establishes moderate-temperature oasis and watering-hole intent through downstream owners, but its P=5 / W=80/255 controls are not compatible with current moisture forcing. Its four zero-occurrence worlds are not the later moisture-integration captures."
    state: "supported"
    evidenceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/73c9de02adb99ca0c604086c286ab6b2e8bbb605/docs/projects/native-map-controls/dryland-point-water-coherence.md#current-moisture-publication-boundary"
  - claim: "At fixed climate and class, the four earlier consumer-qualification worlds' native-compatible, captured-flat, observed-earlier-free populations have dryness factors below 0.42 even with unlimited source support."
    state: "supported"
    evidenceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/09e8c9a87fba9c5078d20134ad1c8e04a858bfbb/docs/projects/native-map-controls/dryland-point-water-coherence.md#qualified-outcome"
  - claim: "With the source-led consumer law retained, the source-limited moisture comparison produces watering holes in three of six prescribed B cases and no oases. Compatible-flat dry/source overlap appears for oasis, but its scores remain below 0.42. This is six-case headless attribution, not 47-case prevalence or native qualification."
    state: "supported"
  - claim: "Exact downstream reproduction of those six B cases finds 1,625 free-flat DESERT cells below admission. The 82 current DESERT and nine other-biome receiver climates with sufficient atmospheric dryness have no oasis admission window through source opportunity alone at held temperature, precipitation and wetness. This is conditional, not an all-climate impossibility result or threshold validation."
    state: "supported"
  - claim: "The owner-meaning review retains a coarse annual-source gameplay proxy for a localized vegetated enclave in native DESERT. It finds no demonstrated owner mismatch requiring repair; it does not validate occurrence, response scales or the shared admission floor."
    state: "supported"
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
  - kind: source-inspection
    scope: "The merged moisture integration preserves the source-led point-water scorer and admission controls. Inspection confirms the consumer law, not a new execution of the privately retained six-case comparison."
    revision: d17abf6f54b018600b2d13c139e8be485e2aa732
    date: '2026-10-10'
    evidenceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/d17abf6f54b018600b2d13c139e8be485e2aa732/plugins/mod/map/swooper-physics/src/domain/ecology/modules/features/model/policy/dryland-waterpoint-score.ts"
  - kind: source-inspection
    scope: "Current Hydrology documentation distinguishes unclipped precipitation, independently reduced wetness, native codec and later local plant-water opportunity, with separate baseline and refined demand. It does not establish calibrated units, all-seed reachability or native acceptance."
    revision: eff77c0f8cd3be5b8a8fd176997918b76848bc44
    date: '2026-10-10'
    evidenceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/eff77c0f8cd3be5b8a8fd176997918b76848bc44/docs/system/libs/mapgen/reference/domains/HYDROLOGY.md#L144-L217"
  - kind: source-inspection
    scope: "The accepted test composes actual public moisture-forcing P/W outputs from a synthetic calm-marine fixture with a separate 22 C land-consumer fixture. It asserts DESERT/oasis admission at opportunity 60 and rejection at 50 or absent source. Inspection is not a new test execution, same-world atmospheric/catchment reachability or threshold calibration."
    revision: 73c9de02adb99ca0c604086c286ab6b2e8bbb605
    date: '2026-10-10'
    evidenceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/73c9de02adb99ca0c604086c286ab6b2e8bbb605/plugins/mod/map/swooper-physics/test/domains/ecology/dryland-point-water-flow.test.ts#L151-L190"
---

# Q-004: Point-Water Habitat Support

When should a local water source in a dry landscape become an oasis or watering
hole? Source availability, atmospheric dryness and the surrounding biome answer
different questions. The open challenge is whether their combination describes
the same ecologically suitable place, not how to force more features onto a map.

The retained [six-case moisture-integration comparison][current-evidence] contrasts the
empirical-moisture baseline (A) with source-limited forcing (B), retaining the
same repaired consumers. **Watering holes occur in three of six B maps;
oases remain absent.** All 1,625 free, flat DESERT cells in that comparison score below
admission. The [source-window diagnosis][oasis-windows] distinguishes two limits
with temperature, precipitation and wetness held. In 91 score-capable receiver
climates, the plant-responsive biome leaves DESERT before the oasis score
clears the floor. The remaining eligible nonpolar climates are capped below
admission by atmospheric dryness even with unlimited source. Neither finding
establishes universal impossibility or validates the thresholds.

## A Source Is Not A Dry Habitat

The pipeline carries local water opportunity from
`hydrology-climate-refine / climate-refine` into the oasis and watering-hole
operations in `ecology-features / score-layers`, then into `plan-wetlands`.
Hydrology's [source-and-access model][source-model] distinguishes modeled local
surface-water opportunity from atmospheric moisture. Its annual opportunity `L` can come
from imported flow or contact with a standing water body. It is published
directly, not inferred by subtracting rounded moisture fields. The current
comparison calls this same quantity `O`. It is a later **non-withdrawal
opportunity**, not extra atmospheric rainfall or a second conserved allocation.

The two [point-water scorers][scorer] combine that opportunity with potential
water demand `D` and atmospheric aridity `a`:

```text
sourceSupport = L / (L + D) when L > 0; otherwise 0
suitability   = drySuit(a) * sourceSupport
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
actual earlier feature occupancy. Local controls can exercise that complete
consumer path without proving that a generated world supplies their conditions.
The [earlier controls][current-control] use `P = 5, W = 80/255`. They are
**downstream-owner fixtures**, not current moisture-compatible inputs.
A quantity-compatible local control uses actual `P = 5, W = Float32(5/200)`
outputs from a synthetic calm-marine forcing fixture in a separate 22 degrees C
land fixture. `O = 60` admits DESERT/oasis at 0.426661; `O = 50` and absent
source do not. This is composition of two declared local regimes, not rainfall
and catchment reachability on that land in one generated world. The
[control comparison][oasis-windows] preserves that boundary.

### The Forcing Reaches The Consumer

In `hydrology-climate-baseline / climate-baseline`, the new moisture owner
produces unclipped model precipitation `P` and normalized wetness `W`. Members'
`P` and `W` are averaged independently; the native rainfall byte is a separate
rounded and capped representation. Neither the byte nor local opportunity is
substituted for atmospheric supply. These are empirical index quantities,
not millimetres per year. The [quantity map][quantities] follows them through
runoff, basins and the later plant-water budget.

This changes which sites jointly have a dry atmosphere, local water and a
compatible biome. It does not change `drySuit(a) * L / (L + D)`. The six
prescribed matched cases below use equal map/game seeds. Maxima describe each
family's compatible-flat population, not all land or a new prevalence sample.

| Case | B oasis dry/source overlap | B oasis max score | B watering-hole max score | Watering holes, A to B |
| --- | ---: | ---: | ---: | ---: |
| Huge 1018 | 5 | 0.026405 | 0.377289 | 0 to 0 |
| Huge 2024 | 84 | 0.162630 | 0.369044 | 0 to 0 |
| Huge 5050 | 48 | 0.209933 | 0.426854 | 0 to 1 |
| Standard 1018 | 42 | 0.222416 | 0.650944 | 0 to 9 |
| Standard 1 | 115 | 0.271177 | 0.489799 | 0 to 2 |
| Standard 42 | 19 | 0.029535 | 0.317764 | 0 to 0 |

Oasis has zero plans and final features in both arms of all six cases. In A,
no compatible-flat oasis site has both positive opportunity and aridity above
0.60. In B, that overlap exists, but even its best score, 0.271177, is below
0.42. Watering-hole scores clear the held floor in three cases, and the resulting
plans, projection attempts and final headless counts agree. The limiting
condition therefore differs by family and world; "water is present" is not
equivalent to "a waterpoint qualifies."

The source-window diagnosis asks a narrower counterfactual: with each receiver's
temperature, precipitation and wetness held, could a different local source
opportunity admit an oasis? Its **91 receiver climates** comprise 82 currently
DESERT and nine currently in other biomes. They are not the same population as
the 1,625 free-flat DESERT cells above. Their atmospheric dryness response could
exceed the floor with enough source, but none has an interval where the
plant-responsive biome remains DESERT and the oasis score reaches 0.42.
The remaining eligible nonpolar climates cannot reach that floor even at the
unlimited-source score ceiling. These local donor-path witnesses do not prove
that a regenerated catchment can provide the tested supply.

## Four Worlds Still Fall Below Admission

This is an **[earlier consumer-qualification result][qualified]**, not the
retained six-case moisture-integration comparison. Its Standard 1/1, Huge 2/2, Standard 3/3 and Huge 4/4 worlds
all have zero attempts and features. At their fixed climate and class, dryness
alone caps the compatible-flat, observed-earlier-free populations below 0.42,
even with unlimited source. The [original margins and custody][earlier-evidence]
retain the two incumbent pairs separately from the two variation captures.
Changing forcing or plant-responsive class changes the premises of that bound;
it is not an all-world impossibility or a source-tuning prescription.

## Two Meanings Of Dryness

The [biome and feature consumers][consumers] interpret different aspects of
water. Nonpolar biome classification uses both the absolute plant-moisture
index and plant stress, including stress-driven shifts toward drier classes.
Point-water dryness instead uses atmospheric aridity, which compares demand with rainfall.
A native DESERT label therefore does not by itself establish high atmospheric
aridity, and a cold DESERT site is not itself evidence of a mapping defect.

Increasing local opportunity raises plant moisture and lowers plant stress
without erasing atmospheric aridity. In the 91 score-capable climates, the
representative biome changes before an oasis qualifies. This is a defensible
**whole-tile habitat response**, not by itself a classifier contradiction. The
[earlier contract trace][retained] likewise distinguishes these meanings rather
than validating their response scales.

A **small wet patch within a dry surrounding landscape** has a deliberately
coarse representation here: an annual-source gameplay proxy for a localized
vegetated enclave in a native DESERT cell. That is the retained owner meaning,
not a prediction of the patch's size or dry-period reliability. The
[source-and-access quantity][source-model] measures neither patch area nor
persistence. Those would be stronger product promises, not missing prerequisites
for retaining this proxy.

The spatial distinction still matters when interpreting the evidence. For
example, [FAO's field water balance][wetted-area] distinguishes field-average
irrigation from its concentration over the wetted fraction. That agricultural
treatment illustrates what a stronger area-specific claim would need; it is
neither natural-oasis calibration nor a prescription to add a patch model.

No owner mismatch requiring behavioral repair is established. **That does not
validate the thresholds.** Whether the empirical moisture classes, dryness
ramps and shared floor represent the intended habitat at this scale remains
open. Physically suitable dry, watered habitats systematically excluded by
their intersection would challenge that meaning; worlds lacking such habitats
could explain the absence without increasing placement.

The retained decision therefore does not change the classifier, annual budget,
score law or 0.42 floor to manufacture oasis occurrence. The conditional
91-climate result and the quantity-compatible local positive control can both
be true. Neither establishes generated-world adequacy or Earth calibration.

Neither the near-miss bounds nor the positive fixtures establish a rainfall or
thermal defect, a better coefficient, or a reason to lower the admission floor.
Annual source opportunity also leaves seasonal liquid-water survival,
groundwater, salinity and patch extent unresolved. [Q-005][suitability] retains
the separate question of marsh, bog, mangrove and shared admission;
[Q-001][geometry] retains neighborhood geometry.

## Evidence Boundaries

The 2026-10-11 owner-meaning recommendation is a source-and-evidence review,
not another model, map or native run. It retains the annual-source proxy without
closing this sheet's adequacy question. Its private recommendation has SHA-256
`e08e20ebca1af610bbc6ddc515cf54bee1c77f2da169b52b2062f7044e5b4c7f`;
that custody identity is not independent scientific verification.

The [original question][baseline] and [evidence digest][retained] preserve the
earlier empty-mask and direct-warmth findings at their original revisions.
Those mechanisms are retired, not current blockers. This sheet's location map
uses adopted source `fe85600bb814cdeb977e36f4e9b5656aa322eb57`; its three original
source inspections retain `2a31c96f8d61ee713075974838dfd36a0b008021` as their
evidence vintage. Its substrate location is historical context; the two scorer
locations own the open consumer question. Their recipe coordinates remain
unchanged, without restoring the retired point-water mask.

The digest distinguishes the original captures, earlier consumer qualification
and retained moisture comparison, including exact executed/merged revisions and
dependency limits. The earlier near-miss demand was reconstructed from recovered
land humidity; the later comparison retains actual demand and final scores.
Neither evidence type is silently substituted for the other.

Detailed ecology covers six paired cases. The separate 47-case bank has zero
newly failed expectations but retains the thermal failure: **both raw banks
are FAIL**. Its broader checks are not 47-case waterpoint attribution. These
headless results are distinct from the later [candidate Huge 1018 readback][native-smoke].
That separate turn-one native smoke matches the retained headless B capture
at exact coordinates for all 25 ordinary feature families, including zero oasis
and watering hole. It is not a completed native A/B:
the earlier comparison still stopped before B. Six resource refusals, three
natural-wonder refusals and sixteen planned-lake classification differences
prevent an all-native parity claim. Visual or played-turn adequacy is not
established. Structured records remain source/document inspections; retained
results have separate custody, not new editorial executions or physical calibration.

[qualified]: https://github.com/mateicanavra/civ7-modding-tools/blob/09e8c9a87fba9c5078d20134ad1c8e04a858bfbb/docs/projects/native-map-controls/dryland-point-water-coherence.md#qualified-outcome
[source-model]: https://github.com/mateicanavra/civ7-modding-tools/blob/09e8c9a87fba9c5078d20134ad1c8e04a858bfbb/docs/projects/native-map-controls/local-plant-water-design.md#source-and-access-definition
[scorer]: https://github.com/mateicanavra/civ7-modding-tools/blob/d17abf6f54b018600b2d13c139e8be485e2aa732/plugins/mod/map/swooper-physics/src/domain/ecology/modules/features/model/policy/dryland-waterpoint-score.ts
[consumers]: https://github.com/mateicanavra/civ7-modding-tools/blob/09e8c9a87fba9c5078d20134ad1c8e04a858bfbb/docs/projects/native-map-controls/local-plant-water-design.md#complete-consumer-path
[baseline]: https://github.com/mateicanavra/civ7-modding-tools/blob/9cc0ef028aff3fa23bcdf3765440de0d0aef9d1f/docs/projects/native-map-controls/questions/q-004-point-water-support.md
[retained]: ../wetland-occurrence-evidence.md
[current-evidence]: ../wetland-occurrence-evidence.md#source-limited-moisture-with-repaired-consumers
[quantities]: ../wetland-occurrence-evidence.md#four-quantities-through-the-pipeline
[oasis-windows]: ../wetland-occurrence-evidence.md#oasis-admission-at-held-climate
[native-smoke]: ../wetland-occurrence-evidence.md#candidate-huge-1018-readback
[wetted-area]: https://www.fao.org/4/x0490e/x0490e0c.htm
[current-control]: https://github.com/mateicanavra/civ7-modding-tools/blob/73c9de02adb99ca0c604086c286ab6b2e8bbb605/docs/projects/native-map-controls/dryland-point-water-coherence.md#current-moisture-publication-boundary
[earlier-evidence]: ../wetland-occurrence-evidence.md#conditional-dryness-ceilings
[geometry]: q-001-low-shore-neighborhood.md
[suitability]: q-005-wetland-suitability.md

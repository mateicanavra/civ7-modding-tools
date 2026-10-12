---
id: Q-008
title: Start Climate Comfort
recordKind: question
disposition: open
sourceRevision: fe85600bb814cdeb977e36f4e9b5656aa322eb57
locations:
  - id: "placement-start-planning"
    label: "Start Planning"
    relation: "question-owner"
    stage: "placement"
    step: "assign-starts"
    operation: "placement.starts.ops.planStarts"
    sourceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/fe85600bb814cdeb977e36f4e9b5656aa322eb57/plugins/mod/map/swooper-physics/src/domain/placement/modules/starts/ops/plan-starts/contract.ts"
  - id: "hydrology-refined-climate"
    label: "Refined Climate"
    relation: "related-producer"
    stage: "hydrology-climate-refine"
    step: "climate-refine"
    sourceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/fe85600bb814cdeb977e36f4e9b5656aa322eb57/plugins/mod/map/swooper-physics/src/recipes/standard/stages/hydrology/climate/refine/steps/climate-refine/config.ts#L23-L47"
  - id: "hydrology-baseline-climate"
    label: "Baseline Climate"
    relation: "related-producer"
    stage: "hydrology-climate-baseline"
    step: "climate-baseline"
    sourceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/fe85600bb814cdeb977e36f4e9b5656aa322eb57/plugins/mod/map/swooper-physics/src/recipes/standard/stages/hydrology/climate/baseline/steps/climate-baseline/config.ts#L84-L111"
  - id: "benchmark-placement-climate-dispersion"
    label: "Placement Climate And Dispersion"
    relation: "question-owner"
    sourceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/fe85600bb814cdeb977e36f4e9b5656aa322eb57/plugins/mod/map/swooper-physics/src/recipes/standard/metrics/targets/placement.ts#L72-L115"
assessments:
  - claim: "Start climate comfort uses all supplied land cells to derive relative temperature and aridity thresholds. It intentionally avoids assuming calibrated absolute habitability limits."
    state: "supported"
    evidenceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/ac9984216f9e74c63d436b88fa1fa0f0bfc0a1ba/plugins/mod/map/swooper-physics/src/domain/placement/modules/starts/ops/plan-starts/rules/climate-comfort.ts#L1-L111"
  - claim: "Climate changes preference through a weighted comfort component and an additional extreme penalty; Primary-tier admission itself uses geographic conditions rather than this climate score."
    state: "supported"
    evidenceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/ac9984216f9e74c63d436b88fa1fa0f0bfc0a1ba/plugins/mod/map/swooper-physics/src/domain/placement/modules/starts/ops/plan-starts/strategies/viability-fairness/index.ts#L189-L220"
  - claim: "The retained lapse-only comparison passes the original twenty-map placement study in both arms. This is headless cohort qualification, not validation of absolute climate habitability or native gameplay."
    state: "supported"
  - claim: "Relative land-tail avoidance is the best climate-suitability policy for player starts, or its scores represent calibrated absolute thermal habitability."
    state: "unassessed"
verification:
  - kind: source-inspection
    scope: "Inspection confirms the frozen assign-starts step binds placement.starts.ops.planStarts and requires climate indices. The baseline/refined climate links identify real upstream steps, not new lessons or physical qualification."
    revision: 2a31c96f8d61ee713075974838dfd36a0b008021
    date: '2026-10-11'
    evidenceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/recipes/standard/stages/placement/steps/assign-starts/config.ts#L21-L44"
  - kind: source-inspection
    scope: "Inspection confirms land-relative quantiles, value-linear ramps between adjacent decile thresholds, and separate nondegenerate extreme flags. The rule's stated purpose is comparative preference under uncalibrated fields. No scalar or map experiment was rerun."
    revision: ac9984216f9e74c63d436b88fa1fa0f0bfc0a1ba
    date: '2026-10-11'
    evidenceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/ac9984216f9e74c63d436b88fa1fa0f0bfc0a1ba/plugins/mod/map/swooper-physics/src/domain/placement/modules/starts/ops/plan-starts/rules/climate-comfort.ts#L1-L111"
  - kind: source-inspection
    scope: "Inspection confirms the original Standard1337-1356 placement population, pooled climate-tail share and arithmetic-mean dispersion predicate. This establishes benchmark meaning, not a new study execution."
    revision: ac9984216f9e74c63d436b88fa1fa0f0bfc0a1ba
    date: '2026-10-11'
    evidenceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/ac9984216f9e74c63d436b88fa1fa0f0bfc0a1ba/plugins/mod/map/swooper-physics/src/recipes/standard/metrics/studies/benchmarks/earthlike-placement.md#L6-L35"
---

# Q-008: Start Climate Comfort

Should a start lose climate preference because other parts of the world become
colder, even when the site itself cools slightly? The existing rule judges
**climate relative to the generated world's land**, not absolute thermal
habitability. That distinction explains a large score change at one otherwise
eligible site. Whether this comparative meaning best serves start quality is
open; the observation is not a demonstrated defect or placement failure.

The owner is **Placement / Assign Starts / Start Planning**. The
[assign-starts step][start-step] calls `placement.starts.ops.planStarts` after
resource sites have been planned and before resources are adjusted around the
chosen starts. Temperature and aridity arrive from Hydrology's
[refined climate][refined-inputs]. The earlier [thermal-response question][thermal-question]
concerns how climate is produced; this sheet concerns what Placement means by
preferring one supplied climate over another. The [Placement narrative][placement-context]
locates this choice within the wider plan, selection and resource-support flow.

## Comfort Relative To The Generated World

The [comfort rule][comfort] first finds temperature and aridity quantiles over
**all supplied land cells**, not just eligible start sites. P90, for example,
is the 90th-percentile value in that land distribution: a boundary near its
upper tenth. Land that cannot host a start still contributes to this reference.

Temperature comfort is full between P20 and P80. It falls linearly in the
temperature value toward zero at P10 on the cold side and P90 on the warm
side. Aridity comfort likewise falls between its P80 and P90. The least
comfortable of those three responses determines the climate component.
These are decile-derived thresholds with value-linear ramps, not a direct
percentile-rank score. An additional flag identifies extreme tails when the
adjacent thresholds have nonzero separation.

The [candidate score][scoring] blends that component with fertility,
freshwater, resources and other site qualities, then applies a separate
climate-extreme penalty. **A low score is not the same as ineligibility.**
[Primary-tier admission][primary-admission] depends on geographic support,
including landmass size and reachable expansion, rather than this climate
preference. Final seating also depends on spacing, regional allocation and
fairness; it is not simply a list of the highest climate scores.

This relative frame is deliberate. The rule explicitly avoids assuming
absolute limits for uncalibrated pipeline fields, and the
[original climate-plausibility expectation][original-expectation] already
asked for avoidance of land-climate tails. A defensible interpretation is
"prefer comparatively temperate sites among this world's alternatives," not
"diagnose hazardous heat." A field labeled degrees C does not by itself make
the generated values or their relationship to habitability calibrated.

## A Cooler Site Enters The Warm Tail

A retained Standard1018 comparison makes the reference dependence visible.
It increases only the relief-cooling coefficient from -0.0065 to -0.15 degrees
C per model relief unit; regional thermal gain stays zero. This is not the
separate precipitation/demand thermal candidate discussed in Q-006, nor a
calibrated lapse rate per physical metre.

At site `(2, 32)`, the modeled temperature falls slightly and the retained
fertility value stays unchanged. Other land cools enough that the site's
temperature crosses the newly lower P90 boundary.

| Recorded Quantity | A: Existing Relief Response | B: Stronger Relief Response |
| --- | ---: | ---: |
| Site temperature, degrees C | 23.412 | 22.982 |
| Land temperature P90, degrees C | 25.28270 | 22.73304 |
| Climate score component | 1 | 0 |
| Blended start viability score | 0.98769 | 0.47147 |
| Geographic candidate tier | Primary | Primary |

The site enters the **map's upper land-temperature tail**; it has not become
hotter. The blended score is a selection preference, not a survival
probability. Neither the numerical temperature nor this relative label
establishes the site's absolute physical habitability.

All eight A start locations remain Primary candidates under B, and the total
Primary population rises from 1,175 to 1,182. The example therefore exposes a
change in preference, not a collapse of geographic start eligibility. Other
downstream inputs also respond in this map pair, so the pair alone does not
attribute every score or seating change solely to climate comfort.

## What The Placement Study Actually Establishes

The retained lapse comparison **passes the original twenty-map placement
study in both arms**. Mean dispersion is 1.085698 in A and 1.090019 in B;
each arm seats all 160 requested players and reports zero climate-extreme
starts. The [study][placement-study] uses Standard maps, 84 by 54 cells,
eight players each, with paired map/game seeds 1337 through 1356.

Two different measures matter here. The climate predicate permits at most 10%
of seated starts in the aridity or temperature tails, pooling counts over all
seats. This tests the declared comparative preference; it is not independent
evidence for absolute habitability. The separate [global dispersion index][dispersion-metric]
describes nearest-neighbor spacing relative to modeled land area per start,
not reachable expansion or the amount of preferred climate. Its
[target][placement-target] requires the arithmetic mean of the twenty per-map
indices to reach 0.85, with no missing observation. **It is not a per-map floor
or a climate-comfort threshold.**

The isolated Standard1018 index falls from 0.93854 to 0.80938. That map is
outside the placement population, and one map is not a twenty-map mean.
Its spacing response is real, but it cannot establish cohort failure.

This passing result is material counterevidence to a placement-blocker claim.
It does not establish that every individual map improved, that relative
comfort is optimal, or that the colder climates are physically calibrated.
Headless qualification is also distinct from production adoption and native
gameplay evidence.

## The Meaning That Remains Open

The decisive distinction is **dependence on the reference world**. Consider
an otherwise identical site: its temperature, aridity, fertility, freshwater,
resources, relief, expansion and eligibility all remain fixed, as does land
membership. Only temperatures elsewhere change enough to move a nondegenerate
P90 past the site, while aridity and the cold-side limit remain nonbinding.
Relative tail avoidance predicts reduced comfort and the extreme penalty;
an absolute local-habitability judgment would be invariant to that remote
change. This is an established property of the rule, not evidence that either
meaning is preferable.

Even within a comparative policy, **which land should define the reference?**
If only land unavailable to starts became colder, every available site's
local conditions could remain identical while its climate preference changed.
The concern would gain substance if that shift favored starts with poorer
usable conditions, such as less reachable expansion, freshwater or resource
support, without a compensating quality the policy is meant to preserve.
Equivalent usable starts, or a demonstrated benefit to the intended start
quality, would weaken that concern. Changed scores alone would establish
reference dependence, not harm. The passing placement cohort is relevant
counterevidence, but it does not isolate this reference-population choice.

Comparative tail avoidance therefore remains a defensible meaning without
being the only possible comparative policy. An absolute habitability promise
would require a different kind of support: a declared habitability model and
evidence connecting generated fields to it. A temperature cutoff borrowed
from intuition would not supply that evidence. The open question concerns
the desired meaning and adequacy of the preference, not an arithmetic error
exposed by a roughly 23 degree C site or a selected threshold repair.

## Evidence Boundaries

Runtime and benchmark statements are pinned to
`ac9984216f9e74c63d436b88fa1fa0f0bfc0a1ba`. Navigation uses adopted source
`fe85600bb814cdeb977e36f4e9b5656aa322eb57`. The start-planning operation, binding
and metric predicates are unchanged between those revisions. That continuity
is not a new run or renewed qualification; climate-producer implementation and
study explanation remain attached to their own pins.

The 2026-10-11 Standard1018 pair supplies the site witness and candidate counts.
Selected temperature and score values were read from its retained captures
and diagnostic layers; the land quantiles and whole-candidate counts are
reported observations in the retained review, not a new reduction for this sheet. The private
pair review has SHA-256 identity
`d611da48f8dfb52ebe68c1c8d2a921b7eb14f94b3fbf2df90f218dfbcf59351c`.

The separate retained cohort report supplies the twenty-map qualification,
with unchanged study population and targets. Its SHA-256 identity is
`d7145d4e401fe9c71de96714b9ca7edee4419e492b5ee03d4957b373c0fae947`;
the full retained evaluation/reduction has identity
`4b0370b86c4c444dc68df15b9f4464bbfc22730af4c241f71d8877cb9bca0135`.
The four-map climate study is a separate acceptance population, not an
extension of the placement cohort.

No scalar experiment, map generation, target evaluation or native observation
was rerun for this sheet. The evidence establishes an intentional policy,
a concrete response and bounded headless qualification. Its adequacy as a
start-quality judgment remains an open semantic question, not a proven defect.

[start-step]: https://github.com/mateicanavra/civ7-modding-tools/blob/ac9984216f9e74c63d436b88fa1fa0f0bfc0a1ba/plugins/mod/map/swooper-physics/src/recipes/standard/stages/placement/steps/assign-starts/step.ts#L175-L240
[refined-inputs]: https://github.com/mateicanavra/civ7-modding-tools/blob/ac9984216f9e74c63d436b88fa1fa0f0bfc0a1ba/plugins/mod/map/swooper-physics/src/recipes/standard/stages/hydrology/climate/refine/steps/climate-refine/step.ts#L134-L155
[thermal-question]: q-006-regional-thermal-response.md
[placement-context]: https://github.com/mateicanavra/civ7-modding-tools/blob/ac9984216f9e74c63d436b88fa1fa0f0bfc0a1ba/docs/system/libs/mapgen/reference/domains/PLACEMENT.md#stage-shape-standard-recipe
[comfort]: https://github.com/mateicanavra/civ7-modding-tools/blob/ac9984216f9e74c63d436b88fa1fa0f0bfc0a1ba/plugins/mod/map/swooper-physics/src/domain/placement/modules/starts/ops/plan-starts/rules/climate-comfort.ts#L1-L111
[scoring]: https://github.com/mateicanavra/civ7-modding-tools/blob/ac9984216f9e74c63d436b88fa1fa0f0bfc0a1ba/plugins/mod/map/swooper-physics/src/domain/placement/modules/starts/ops/plan-starts/strategies/viability-fairness/index.ts#L541-L595
[primary-admission]: https://github.com/mateicanavra/civ7-modding-tools/blob/ac9984216f9e74c63d436b88fa1fa0f0bfc0a1ba/plugins/mod/map/swooper-physics/src/domain/placement/modules/starts/ops/plan-starts/strategies/viability-fairness/index.ts#L189-L220
[original-expectation]: https://github.com/mateicanavra/civ7-modding-tools/blob/ac9984216f9e74c63d436b88fa1fa0f0bfc0a1ba/docs/projects/placement-realignment/expectations.md#e1--player-starts-default-knobs-standard-map-n-players
[placement-study]: https://github.com/mateicanavra/civ7-modding-tools/blob/ac9984216f9e74c63d436b88fa1fa0f0bfc0a1ba/plugins/mod/map/swooper-physics/src/recipes/standard/metrics/studies/benchmarks/earthlike-placement.md#question-and-design
[dispersion-metric]: https://github.com/mateicanavra/civ7-modding-tools/blob/ac9984216f9e74c63d436b88fa1fa0f0bfc0a1ba/plugins/mod/map/swooper-physics/src/recipes/standard/metrics/families/placement.ts#L468-L494
[placement-target]: https://github.com/mateicanavra/civ7-modding-tools/blob/ac9984216f9e74c63d436b88fa1fa0f0bfc0a1ba/plugins/mod/map/swooper-physics/src/recipes/standard/metrics/targets/placement.ts#L72-L115

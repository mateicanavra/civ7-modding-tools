---
id: Q-003
title: Relief Bounds And Admitted Support
recordKind: question
disposition: open
sourceRevision: 2a31c96f8d61ee713075974838dfd36a0b008021
locations:
  - id: "benchmark-relief-support"
    label: "Relief Benchmark Support"
    relation: "question-owner"
    sourceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/recipes/standard/metrics/targets/relief.ts"
  - id: "morphology-mountain-planning"
    label: "Mountain And Hill Planning"
    relation: "related-producer"
    stage: "morphology-features"
    step: "mountains"
    sourceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/recipes/standard/stages/morphology/features/steps/mountains/step.ts"
assessments:
  - claim: "Relief acceptance defines separate representative and Huge-cohort bounds rather than one universal terrain law."
    state: "supported"
    evidenceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/recipes/standard/metrics/targets/relief.ts"
  - claim: "The Huge orogeny protocol retains regional bounds after retiring only the mountain-spine-diameter floor."
    state: "supported"
    evidenceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/recipes/standard/metrics/studies/benchmarks/earthlike-orogeny.md"
  - claim: "Current study policy treats remaining appearance shares and component bounds as product assumptions or regression guards, not independently calibrated Earth observations."
    state: "supported"
    evidenceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/recipes/standard/metrics/studies/STUDIES.md"
  - claim: "These relief bounds are portable beyond their admitted map-size, terrain-representation and producer support."
    state: "unassessed"
verification:
  - kind: source-inspection
    scope: "Source inspection confirms the relief bounds and their unchanged source since the original pin; no map-size or terrain comparison was executed."
    revision: 2a31c96f8d61ee713075974838dfd36a0b008021
    date: '2026-10-10'
    evidenceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/recipes/standard/metrics/targets/relief.ts"
  - kind: source-inspection
    scope: "Source inspection confirms the Huge orogeny cohort and preserved amendment, not physical adequacy or native movement through passes."
    revision: 2a31c96f8d61ee713075974838dfd36a0b008021
    date: '2026-10-10'
    evidenceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/recipes/standard/metrics/studies/benchmarks/earthlike-orogeny.md"
  - kind: source-inspection
    scope: "Source inspection confirms the current product-assumption classification; it supplies no portability verification."
    revision: 2a31c96f8d61ee713075974838dfd36a0b008021
    date: '2026-10-10'
    evidenceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/recipes/standard/metrics/studies/STUDIES.md"
---

# Q-003: Relief Bounds And Admitted Support

What makes a relief bound meaningful beyond the maps on which it was defined?
A percentage of rough uplands, a connected-component cap and a minimum mountain
region diameter describe different properties. Their interpretation depends on
map size, terrain representation, measured population and producer inputs.
Portability is a concern only where a bound is claimed to apply beyond that
support; a deliberately Huge-only requirement need not hold at every scale.

The [relief targets][relief-target] express product judgments about varied,
geographically broken terrain. [Study policy][study-policy] classifies these
appearance shares and component bounds as product assumptions or regression
guards, not independently calibrated Earth observations. An out-of-support
comparison could falsely blame generation, while an in-support failure could
still reveal a meaningful regression. The research question is which claims the
measurements can actually sustain, not whether every existing bound should be
discarded.

## From Terrain Plans to Regional Measurements

The related producer is [`morphology-features / mountains`][mountains-step],
which calls `planRidges`, `planFoothills` and `planRoughLands`. The benchmark
name "orogeny" does not relocate this question to foundation-stage tectonics.
The acceptance predicates consume planned and observed terrain populations and
region topology; they influence relief adoption decisions rather than directly
forcing the physical ground.

The [relief measurement family][relief-family] keeps modeled terrain distinct
from realized Civ7 hills, mountains and flats. Connected-component size and
diameter describe contiguous systems on the periodic odd-Q grid. A broader
mountain region includes non-mountain interiors, so its extent and composition
are not equivalent to the connectivity of mountain tiles alone.

Planned and observed terrain shares use the same exposed-land denominator.
Their numerators differ: planned categories come from model masks, while observed
terrain counts omit tiles Civ7 reports as water. Regional composition is
restricted to exposed cells inside the mountain-region mask. A comparison
therefore depends on both what is counted and the population it is divided by.

## Three Huge-Map Supports, Not One Universal Limit

All three studies below use Huge: `MAPSIZE_HUGE`, 106 x 66 tiles, 10 players.
Their representative sample and seed cohorts are intentionally distinct.
Cohort minima and maxima concern the worst scenario, not the cohort mean.

### Representative Terrain Mix: Seed 1018

The [representative relief study][representative-protocol] requires rough
uplands on 4-8% of land, with the largest rough-upland component at most 60
tiles. Coverage and connected size are complementary: a modest total share
could still concentrate in a single extensive patch.

### Broken Relief Across Seeds 1, 42, 99 and 7777

The [Huge relief cohort][huge-protocol] limits rough-upland share to 8% and
largest component size to 40. Its regional checks complement these coverage
limits with non-mountain interiors and flat pockets. The representative cap of
60 and cohort cap of 40 have different admitted samples, not conflicting
definitions of a universal maximum.

### Regional Orogeny Across Seeds 1018, 2024 and 5050

The [orogeny cohort][orogeny-protocol] requires at least one modeled mountain
tile per roll. In the mountain-region mask, the maximum component diameter is
at least 38 and the largest component contains at least 450 tiles. These are
independent summaries, not requirements that one component meets both extrema.

Composition is measured across exposed cells in the entire mountain-region
mask, not only its largest component. Non-mountain share is at least 65%, flat
share at least 35%, flat volume at least 300 tiles, and shoulder share at least
25%. Shoulders combine foothills and rough uplands. Mountain share is at most
38%. Together these preserve regional extent, interior composition, mountain
presence and peak-density expectations without guaranteeing that all those
properties occur together in a single region.

## Regional Continuity Is Not Native Passability

A long mountain region can contain valleys and flat pockets without proving
a route traversable under native movement rules. Mountain-tile connectivity,
regional continuity and transverse passability are different properties.

The accepted relief-coherence amendment retired only the
`mountain-spine-diameter >=25` floor because this categorical connectivity proxy
does not measure continuity through passes or transverse passability. The metric
`plannedMountainComponents.maximumComponentDiameter` remains diagnostic;
neither a shorter nor a longer peak span independently proves improved native
movement.

All the regional bounds above remain, along with separate coverage,
range-diversity and relief-support obligations. Their stated aims are positive
evidence for an intentional product contract, even where physical calibration
is not established. The amendment changed acceptance policy, not generation;
the retained region proxies still do not independently verify a native pass.

## Comparisons That Could Establish the Limits of Support

A useful inquiry connects one bound's authorized purpose with its sample
cohort, population and metric geometry, then considers its result on a retained
in-support map. Comparing another size or terrain representation becomes
relevant only when portability to it is claimed. Physical fields, producer
revision and representation differences then need explicit accounting: an
absolute tile count cannot be treated as a dimensionless share, and a share is
not automatically independent of resolution or population.

A documented Huge-only product requirement would disprove an alleged cross-size
inconsistency. A justified portable normalization, supported by qualified
contrasting cases, could defeat a broader scale-dependence concern. Conversely,
an unsupported extrapolation would limit what the benchmark can claim without
demonstrating that the terrain generator is wrong. Missing claim-to-support
evidence does not by itself call for a new landscape metric, rescaling or
retuning.

The [original evidence packet][original-question] preserves historical
provenance. Source definitions establish the bounds and their amendment, not
physical adequacy, native movement or experimentally verified portability. No
map-size or terrain-representation comparison is reported here.

[relief-target]: https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/recipes/standard/metrics/targets/relief.ts
[study-policy]: https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/recipes/standard/metrics/studies/STUDIES.md
[mountains-step]: https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/recipes/standard/stages/morphology/features/steps/mountains/step.ts
[relief-family]: https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/recipes/standard/metrics/families/relief.ts
[representative-protocol]: https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/recipes/standard/metrics/studies/benchmarks/earthlike-relief-representative.md
[huge-protocol]: https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/recipes/standard/metrics/studies/benchmarks/earthlike-huge-relief-cohort.md
[orogeny-protocol]: https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/recipes/standard/metrics/studies/benchmarks/earthlike-orogeny.md
[original-question]: https://github.com/mateicanavra/civ7-modding-tools/blob/92e1fff097e67f4bfedd3e2b3f6084d7642f04ef/docs/projects/native-map-controls/questions/q-003-relief-support.md

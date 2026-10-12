---
id: Q-002
title: Ecological Prevalence And Benchmark Authority
recordKind: question
disposition: open
sourceRevision: 2a31c96f8d61ee713075974838dfd36a0b008021
locations:
  - id: "benchmark-ecological-prevalence"
    label: "Ecological Prevalence Benchmarks"
    relation: "question-owner"
    sourceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/recipes/standard/metrics/targets/ecology.ts"
  - id: "ecology-vegetation-planning"
    label: "Vegetation Planning"
    relation: "related-producer"
    stage: "ecology-features"
    step: "plan-vegetation"
    operation: "ecology.features.ops.planVegetation"
    sourceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/domain/ecology/modules/features/ops/features-plan-vegetation/contract.ts"
  - id: "ecology-feature-application"
    label: "Feature Application"
    relation: "downstream-consumer"
    stage: "map-ecology"
    step: "features-apply"
    operation: "ecology.features.ops.applyFeatures"
    sourceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/domain/ecology/modules/features/ops/features-apply/contract.ts"
assessments:
  - claim: "The ecology benchmark contains explicit vegetation-share, feature-presence, cold-reef and floodplain-attempt predicates."
    state: "supported"
    evidenceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/recipes/standard/metrics/targets/ecology.ts"
  - claim: "The Earthlike identity bounds remain unchanged while the Desert Mountains absolute rainforest-tile cap is removed."
    state: "supported"
    evidenceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/recipes/standard/metrics/studies/benchmarks/shipped-identities.md"
  - claim: "Current study policy classifies remaining appearance counts and shares as product assumptions or regression guards, not physical laws or independently calibrated Earth observations."
    state: "supported"
    evidenceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/recipes/standard/metrics/studies/STUDIES.md"
  - claim: "Each retained prevalence predicate has justified population, denominator and variability support, including habitat-conditioned numerical calibration where claimed."
    state: "unassessed"
  - claim: "The retained fifteen-configuration rainforest investigation separates modeled habitat from terrain exclusion and earlier wet-feature occupancy. Every remaining eligible flat rainforest site places in its headless adapter; this is not fresh native acceptance or a calibrated coverage target."
    state: "supported"
  - claim: "A previous-lapse river-representation intervention retains 2,372 rainforest-biome cells while NAV cells fall from 3,575 to 2,325 and Rainforest features rise from 487 to 589. It establishes a partial occupancy contribution, not rainfall depletion or a selected production percentile."
    state: "supported"
  - claim: "Stronger cooling amplifies rainforest scarcity in the retained pairs but is not established as its historical origin; ecological adequacy remains unresolved."
    state: "supported"
verification:
  - kind: source-inspection
    scope: "Source inspection confirms the ecology predicates and their unchanged numerical bounds; no benchmark or generation was run."
    revision: 2a31c96f8d61ee713075974838dfd36a0b008021
    date: '2026-10-10'
    evidenceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/recipes/standard/metrics/targets/ecology.ts"
  - kind: source-inspection
    scope: "Source inspection confirms Earthlike identity values and removal of both Desert Mountains absolute-count consumers, not ecological adequacy."
    revision: 2a31c96f8d61ee713075974838dfd36a0b008021
    date: '2026-10-10'
    evidenceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/recipes/standard/metrics/targets/identities.ts"
  - kind: source-inspection
    scope: "Source inspection confirms the Earthlike core selection and product-assumption classification, not predicate-level calibration provenance."
    revision: 2a31c96f8d61ee713075974838dfd36a0b008021
    date: '2026-10-10'
    evidenceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/recipes/standard/metrics/studies/STUDIES.md"
  - kind: source-inspection
    scope: "Inspection confirms vegetation receives occupancy from earlier floodplain, ice, reef and wetland intents and excludes NAV, hills, mountains and volcanoes from flat-land eligibility. The reported recipe captures remain separate retained evidence, not a new editorial execution."
    revision: fa3dd579f2fc4b3fd8f2b22b7942eac8c26415f1
    date: '2026-10-11'
    evidenceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/fa3dd579f2fc4b3fd8f2b22b7942eac8c26415f1/plugins/mod/map/swooper-physics/src/recipes/standard/stages/ecology/features/steps/plan-vegetation/step.ts"
  - kind: source-inspection
    scope: "Inspection confirms ordinary Rainforest's flat-terrain and tropical-biome compatibility in the generated policy from official corpus 9f6b93e129d47faf96ed6814f652560e7b7573d0. Static legality is not a fresh native placement observation."
    revision: fa3dd579f2fc4b3fd8f2b22b7942eac8c26415f1
    date: '2026-10-11'
    evidenceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/fa3dd579f2fc4b3fd8f2b22b7942eac8c26415f1/packages/civ7-map-policy/src/civ7-tables.gen.ts"
  - kind: source-inspection
    scope: "Inspection confirms discharge-percentile river classification, not a rainfall withdrawal or an exact terrain-tile quota. Retained intervention findings do not qualify a replacement percentile."
    revision: fa3dd579f2fc4b3fd8f2b22b7942eac8c26415f1
    date: '2026-10-11'
    evidenceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/fa3dd579f2fc4b3fd8f2b22b7942eac8c26415f1/plugins/mod/map/swooper-physics/src/domain/hydrology/modules/hydrography/ops/project-river-network/strategies/discharge-percentiles/index.ts"
---

# Q-002: Ecological Prevalence And Benchmark Authority

What does an ecological prevalence benchmark tell us: that a map expresses its
intended gameplay identity, that a test exercises a feature, or that the world
is ecologically plausible? These are different claims. A rainforest limit may
protect vegetation variety without estimating Earth's rainforest coverage; a
floodplain count may ensure a placement path is tested without asserting how
common floodplains should be.

The [study policy][study-policy] explicitly classifies appearance counts and
shares as product assumptions or regression guards, not physical laws or
independently calibrated Earth observations. The open question is therefore
more specific than whether these numbers are "scientific": does each retained
bound have a justified purpose, population, denominator and allowance for
variability? Confusing those supports could reward implausible coverage or
reject a coherent map, but neither consequence has been demonstrated here.

The [rainforest comparison below](#rainforest-habitat-and-feature-occupancy)
shows why the denominator matters: suitable modeled habitat and visible
Rainforest features are different populations. Its open
[mangrove occurrence question][occurrence] concerns which feature occupies a
qualifying site, not how to meet a rainforest quota.

## The Benchmarks Judge Outcomes, Not Ecological Forcing

The relevant owner is the Standard recipe's metric targets, especially
[ecology targets][ecology-target] and [shipped identity targets][identity-target].
They consume measured feature and attempt counts, land and vegetation
populations, lake components and cohort identities. Their output is acceptance
evidence, not a command to generate more vegetation. Related production occurs
in `ecology-features / plan-vegetation`; `map-ecology / features-apply` realizes
feature intent on the Civ7 surface.

The default `earthlike-core` study scope qualifies Earthlike. Desert Mountains
and Archipelago are deliberately biased, opt-in configuration-stress studies
under `all`, not core Earthlike calibration or release gates. The former Desert
Mountains absolute `rainforest-tile-count <=20` cap is already removed from both
the identity and arid-climate consumers, not raised or replaced. That decision
does not remove the Earthlike bounds.

## Four Populations Behind the Numbers

### A Representative Earthlike Identity

The [identity study][identity-protocol] uses Huge (106 x 66, 10 players), seed
`1018`. It requires a projected lake component of at least four tiles and at
least five vegetation families, with forest, rainforest, taiga, savanna woodland
and sagebrush steppe present. Rainforest is limited to 65% of vegetation. These
bounds describe one representative product identity, not every seed or an
empirical Earth average.

### Vegetation Across Eight Standard Maps

The [ecology cohort][ecology-protocol] uses Standard (84 x 54, 8 players), seeds
`1018`, `1`, `2`, `3`, `42`, `99`, `1234` and `7777`. Every map requires
vegetation, at least four vegetation families, and vegetation on 8-55% of land.
Rainforest is limited to 70% of vegetation and 35% of land. Forest, rainforest
and taiga must appear in every map; savanna woodland and sagebrush steppe must
each appear in at least six of eight. The 65% representative and 70% cohort
rainforest ceilings have different sample supports and are not automatically
contradictory.

### Cold Reefs Across Eight Huge Maps

The [cold-reef cohort][cold-reef-protocol] uses the same eight seeds at Huge
(106 x 66, 10 players). Cold reefs must appear in at least four rolls and occupy
at most 15% of coast water in any roll. Presence frequency and local coverage
answer different questions: recurrence across seeds versus avoiding a carpet
within available shallow water.

### Floodplain Attempts in One Standard Map

The [floodplain study][floodplain-protocol] uses Standard (84 x 54, 8 players),
seed `1018`. It requires at least eight floodplain attempts, zero soft
rejections and zero final feature-surface violations. The attempt floor makes
the intent-to-surface path observable; the rejection and legality checks address
whether it works. A final count alone could conceal rejected attempts. This is
a strong alternative to interpreting the floor as a prevalence estimate.

## When the Denominator Changes the Question

Whole-land share, share of vegetation, share of coast water and frequency
across seed rolls are not interchangeable measures. Each preserves information
the others discard. A gameplay identity may legitimately constrain whole-map
composition; a coverage test may legitimately require enough events to exercise
a path. Neither purpose automatically calls for an eligible-habitat denominator.

For a claim about ecological adequacy, however, the amount of lawful habitat
may be essential. Scarce habitat, incompatible terrain, weak feature intent and
failed application can all produce a low observed count for different reasons.
A habitat-conditioned comparison could distinguish those explanations. It
would still need evidence supporting its numerical bound: changing the
denominator alone does not turn a product assumption into an Earth-calibrated
law.

### Rainforest Habitat And Feature Occupancy

Sparse visible rainforest predates the stronger relief-cooling setting; cooling
amplifies it rather than establishing its historical origin. A retained
fifteen-configuration comparison separates these contributions on one source.
**A** uses the previous lapse of -0.0065 and **B** the adopted -0.15, with the
same map/game seeds within each pair. A is a controlled previous-lapse
counterfactual on current source, not a reconstruction of an earlier build.

The modeled `tropicalRainforest` biome describes an
[empirical annual habitat envelope][annual-regimes]; the game's Rainforest
feature is a separate surface object. [Ordinary Rainforest legality][rainforest-legality]
requires native flat terrain and tropical biome. A tropical-biome mountain is
therefore possible without a legal ordinary Rainforest feature. The
[vegetation step][retained-vegetation] also respects sites already reserved by
earlier feature planners. The retained diagnostic partitions rainforest-biome
cells into disjoint dispositions:

| Habitat Disposition | A: Previous Lapse | B: Stronger Cooling |
| --- | ---: | ---: |
| Navigable-river terrain exclusion | 791 | 404 |
| Mountain-mask exclusion | 58 | 9 |
| Hill-mask exclusion | 332 | 62 |
| Volcano exclusion | 2 | 2 |
| Earlier mangrove | 477 | 411 |
| Earlier minor tropical floodplain | 225 | 148 |
| Eligible, intended and placed Rainforest | 487 | 197 |
| **Rainforest-biome total** | **2,372** | **1,233** |

These are ordered diagnostic exclusions, not independent causal effects or
literal counts of each final native terrain. In A, 1,189 projected-flat
rainforest-biome cells divide into 702 earlier wet features and 487 Rainforest
features. Every remaining eligible flat site places Rainforest in the headless
adapter. No confidence loss, random thinning, global rainforest quota or
placement refusal explains an additional loss in that population. Headless
success is not fresh native acceptance.

#### Atmospheric Support And Marine Distance

A separate existing-classifier replay substitutes captured atmospheric
effective moisture and aridity for the plant-water-supported indices, keeping
temperature, soil and geometry. In A, 1,974 of 2,372 rainforest-biome cells
(83.2%) retain that classification, including 413 of the 487 Rainforest feature
sites. The rest depend on local water opportunity in this diagnostic. This is
neither a newly generated world nor a physically equilibrated removal of rivers
and lakes. [Q-007][moisture-meaning] explains why atmospheric and plant-water
quantities have different meanings.

Captured `distanceToCoast` includes finite-water shores, not just the ocean.
A marine-only diagnostic instead reuses the existing coastal-adjacency and
distance operations with the external marine boundary as its source. At least
four graph steps from that boundary, A still contains 658 rainforest-biome
cells and 188 Rainforest features; B contains 102 and 45. Boundary cells start
at zero, and steps are not kilometres. The all-water replay matches the
captured distance field; this does not repair the separate
[low-shore square-window geometry][shore-geometry] or prove a moisture-transport
failure.

#### Cooling Adds A Distinct Loss

The 487-to-197 feature change is a **net loss of 290**, not 298. All 298 gross
disappearing A sites become `temperateHumid`; 297 receive Forest and one is
bare. Eight new Rainforest sites offset part of the loss. Baseline precipitation,
refined precipitation and runoff remain exact in all fifteen pairs. Initial
land and relief hold, but final hill/mountain masks need not.

Replaying the classifier with B inputs and A temperature restores rainforest
classification at all 298 disappearing feature sites and all 1,139 lost biome
sites. This is a local temperature-dependency result, not reproduction of the
entire A world or Earth calibration. The accepted
[relief response][relief-response] and [classifier meaning][classifier-meaning]
remain distinct from whether the resulting rainforest coverage is adequate.

#### River Representation Changes Occupancy, Not Rainfall

A third arm, **C**, starts from previous-lapse A and changes only the major-river
discharge percentile from 0.92 to 0.95; the minor percentile remains 0.74.
A higher [discharge threshold][river-classification] selects fewer navigable
river cells. This is not an experiment on stronger-cooling B.

| Quantity | A: Major 0.92 | C: Major 0.95 |
| --- | ---: | ---: |
| Navigable-river cells | 3,575 | 2,325 |
| Rainforest-biome cells | 2,372 | 2,372 |
| Rainforest features | 487 | 589 |

Rainforest features increase by 20.9%: thirteen maps gain and two hold. Captured
model fields other than river classification and its network summary remain
exact, including lake geometry, climate, ecological indices and relief masks.
Feature outputs do change. This supports a partial **representation and
occupancy** explanation, not precipitation being consumed by rivers.

Of 258 rainforest-biome cells released from navigable classification, 85 retain
underlying hills and cannot legally host ordinary Rainforest. The 173 freed
flat sites become 100 Rainforest, 51 mangrove and 22 minor floodplain. Two
additional former floodplain sites account for the remaining two gains; minor
floodplain eligibility also depends on adjacency to the remaining navigable
network. More free terrain therefore does not translate one-for-one into more
rainforest. Lakes also occupy area, but there is no lake-only intervention here.
The [basin strategy][basin-config] exposes no lake-count or lake-percentile cap.

The diagnostic does not select 0.95, qualify a production change or establish
that earlier wet features are wrong. The separate
[occurrence review in Q-005][occurrence] retains the intended mangrove priority
without establishing an admission repair; its ecological coverage remains open.
Q007's [seasonal-information probe][annual-regimes] likewise establishes an
unavailable distinction, not a cause of low counts. Neither review adds new
worlds to this population. A higher rainforest count alone cannot validate
either habitat classification or feature priority.

## Evidence That Would Settle an Individual Bound

For a disputed predicate, its original purpose and exact sample support are
more informative than the number in isolation. An existing Earthlike case can
connect habitat eligibility, terrain and biome compatibility, feature intent,
and the observed result while holding the producer revision and cohort fixed.
Missing observations limit the inference; they do not establish a defective
scorer or justify retuning generation.

An authorized product or coverage requirement, supported by the stated
population and matching measurement, would disprove the allegation that this
predicate is an unsupported physics gate. A claim of ecological calibration
would need independent observational or habitat-conditioned support. That
predicate-level provenance has not been established by the source evidence
here, which is not proof that it cannot exist. The answer could clarify a
claim, justify a bound or expose a duplicated check without changing any
threshold, denominator or generator.

The [original evidence packet][original-question] retains the historical
context. The benchmark definitions establish source facts; the separate retained
rainforest comparison establishes the bounded populations above. Neither is
ecological calibration or a blanket verdict on the remaining bounds.

## Rainforest Evidence Scope And Provenance

The reported investigation uses source
`fa3dd579f2fc4b3fd8f2b22b7942eac8c26415f1`, whose runtime is unchanged from
the relief production candidate `6c5c8a82e7d36c17371699104ec58b3830f0e06d`;
only two owner documents differ. Its fifteen configurations comprise ten Huge
and five Standard cases, with thirty A/B full-recipe executions and fifteen C
executions: **45 executions, not 45 independent configurations**. All 2,205
instances of the unchanged sample-integrity expectations pass, forty-nine per
execution. These are not new rainforest-coverage, ecological-calibration or
placement-qualification gates. Classifier and distance replays are separate
diagnostics, not additional full worlds.

Static ordinary-feature legality comes from official corpus
`9f6b93e129d47faf96ed6814f652560e7b7573d0`. No fresh native game comparison,
production repair or threshold adoption is established by this investigation.
The retained report and selected summaries identify the evidence below. They
remain private; these custody digests are not public reproduction downloads.

| Retained Evidence | SHA-256 |
| --- | --- |
| Investigation report | `078e257e79d733c1f278c280426b0e50b37d982bf23d4592137efe3ccc05f3e2` |
| A/B habitat and classifier analysis | `b850cc97591f6598976eae71121c6e58fcac9165b488d9e3b7566f10d03fc8d2` |
| Baseline scarcity analysis | `7bbdf4938802d24f188ba791ce9eeb5bc2811f153ae9b98fc50b5030e6d85534` |
| Marine-distance strata | `70ea7b305ac512e9c6279e706fe0b4072758240ade07f8e0b528adfc1853ee4d` |
| Navigable-representation intervention | `d15badfc61fea3310e1c2b92527b05eefa8d74b01a0eeb766838502d8de72c1d` |
| A/B execution receipt | `04becc9ccbb251c0e1d9308bdc98cba9677c232f7699fedd650d876e25c323b0` |
| C execution receipt | `cd1c1cd99d0052e0212b35c583609988cbbcccbef21c143b85dbe99bb400069f` |

Structured verification records source inspection. The numerical account is a
curation of finished owner evidence, not a new editorial model execution or
independent reproduction of the raw fields. **Q-002 remains open:** a measured
habitat-to-feature bottleneck does not supply a justified numerical coverage
bound.

[identity-target]: https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/recipes/standard/metrics/targets/identities.ts
[ecology-target]: https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/recipes/standard/metrics/targets/ecology.ts
[study-policy]: https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/recipes/standard/metrics/studies/STUDIES.md
[identity-protocol]: https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/recipes/standard/metrics/studies/benchmarks/shipped-identities.md
[ecology-protocol]: https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/recipes/standard/metrics/studies/benchmarks/earthlike-ecology.md
[cold-reef-protocol]: https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/recipes/standard/metrics/studies/benchmarks/earthlike-cold-reef.md
[floodplain-protocol]: https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/recipes/standard/metrics/studies/benchmarks/earthlike-floodplain.md
[original-question]: https://github.com/mateicanavra/civ7-modding-tools/blob/92e1fff097e67f4bfedd3e2b3f6084d7642f04ef/docs/projects/native-map-controls/questions/q-002-ecological-prevalence.md
[retained-vegetation]: https://github.com/mateicanavra/civ7-modding-tools/blob/fa3dd579f2fc4b3fd8f2b22b7942eac8c26415f1/plugins/mod/map/swooper-physics/src/recipes/standard/stages/ecology/features/steps/plan-vegetation/step.ts
[rainforest-legality]: https://github.com/mateicanavra/civ7-modding-tools/blob/fa3dd579f2fc4b3fd8f2b22b7942eac8c26415f1/packages/civ7-map-policy/src/civ7-tables.gen.ts
[river-classification]: https://github.com/mateicanavra/civ7-modding-tools/blob/fa3dd579f2fc4b3fd8f2b22b7942eac8c26415f1/plugins/mod/map/swooper-physics/src/domain/hydrology/modules/hydrography/ops/project-river-network/strategies/discharge-percentiles/index.ts
[basin-config]: https://github.com/mateicanavra/civ7-modding-tools/blob/fa3dd579f2fc4b3fd8f2b22b7942eac8c26415f1/plugins/mod/map/swooper-physics/src/domain/hydrology/modules/hydrography/ops/compute-basin-network/strategies/stationary-sill-spill/config.ts
[occurrence]: q-005-wetland-suitability.md#when-suitability-reserves-the-only-feature-slot
[shore-geometry]: q-001-low-shore-neighborhood.md
[moisture-meaning]: q-007-biome-transition-meaning.md#two-different-uses-of-moisture
[relief-response]: q-006-regional-thermal-response.md#a-stronger-relief-response
[classifier-meaning]: q-007-biome-transition-meaning.md#retained-meaning-open-calibration
[annual-regimes]: q-007-biome-transition-meaning.md#annual-categories-and-seasonal-regimes

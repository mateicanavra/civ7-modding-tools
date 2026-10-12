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
  - claim: "The adopted Earthlike configuration selects major/minor discharge percentiles of 0.95/0.74. This is a river-representation choice, not a change to climate, physical drainage or habitat classification."
    state: "supported"
    evidenceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/9f425885815ba314b8304bc414122c2dd769217c/plugins/mod/map/swooper-physics/src/maps/configs/swooper-earthlike.config.json"
  - claim: "Fifteen current-climate candidate executions against retained B controls preserve all 8,479 river-source coordinates and 1,233 rainforest-biome cells while NAV cells fall from 3,577 to 2,318 and Rainforest features rise from 197 to 248. Fewer represented navigable components and outlets are a disclosed cost, not removed physical water."
    state: "supported"
  - claim: "One matched Huge native pair reproduces the first qualified case's river classes and feature-application aggregates, including Rainforest 45 to 50. Native resource shortfalls remain 11 and 12 refusals; bounded observations do not establish a complete native census, per-start resource support, vessel passage or calibrated ecology."
    state: "supported"
  - claim: "The whole-land census of the same fifteen adopted-equivalent captures contains 1,233 rainforest-biome cells and 248 Rainforest features on 32,561 exposed cells. Of 4,314 flat desert cells, 4,071 carry sagebrush and only 153 are feature-bare. Complete placement within admitted habitat does not establish sufficient habitat extent or overall biome diversity."
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
  - kind: source-inspection
    scope: "Inspection of the adopted source confirms the Earthlike-only major-percentile change from 0.92 to 0.95 with minor 0.74 and all other authored inputs held. Retained offline and native findings remain separate evidence, not new editorial executions."
    revision: 9f425885815ba314b8304bc414122c2dd769217c
    date: '2026-10-12'
    evidenceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/9f425885815ba314b8304bc414122c2dd769217c/plugins/mod/map/swooper-physics/src/maps/configs/swooper-earthlike.config.json"
  - kind: source-inspection
    scope: "The adopted Hydrology reference distinguishes channel-class selection from physical water, climate and lake accounting, and discloses the ordinary-land versus navigable-corridor tradeoff. Native passage remains separately unqualified."
    revision: 9f425885815ba314b8304bc414122c2dd769217c
    date: '2026-10-12'
    evidenceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/9f425885815ba314b8304bc414122c2dd769217c/docs/system/libs/mapgen/reference/domains/HYDROLOGY.md"
  - kind: source-inspection
    scope: "Inspection confirms the existing effective-configuration test asserts authored and compiled Earthlike 0.74/0.95 selection under the normal density knob. This is test-source inspection, not a rerun or native qualification."
    revision: 9f425885815ba314b8304bc414122c2dd769217c
    date: '2026-10-12'
    evidenceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/9f425885815ba314b8304bc414122c2dd769217c/plugins/mod/map/swooper-physics/test/maps/map-config-schema.test.ts#L356-L367"
  - kind: source-inspection
    scope: "The cooling-production source already contains the eight-Standard Earthlike ecology study. This confirms the preexisting cohort definition, not execution or a passing result; its omission is established separately by retained qualification manifests."
    revision: 6c5c8a82e7d36c17371699104ec58b3830f0e06d
    date: '2026-10-12'
    evidenceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/6c5c8a82e7d36c17371699104ec58b3830f0e06d/plugins/mod/map/swooper-physics/src/recipes/standard/metrics/studies/benchmarks/earthlike-ecology.study.ts#L10-L31"
  - kind: source-inspection
    scope: "The existing ecology target requires rainforest presence on every representative map by comparing presence count with cohort size. Source inspection does not establish a result for the omitted ecology cohort or turn presence into a calibrated abundance criterion."
    revision: 6c5c8a82e7d36c17371699104ec58b3830f0e06d
    date: '2026-10-12'
    evidenceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/6c5c8a82e7d36c17371699104ec58b3830f0e06d/plugins/mod/map/swooper-physics/src/recipes/standard/metrics/targets/ecology.ts#L181-L186"
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

The [whole-land census below](#whole-land-habitat-and-feature-coverage)
shows why the denominator matters: filling the available rainforest slots does
not establish that enough habitat exists, and extensive desert classification
does not imply extensive bare desert surface. The open
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

The earlier stronger-cooling qualification covered climate and placement
studies but omitted this
[existing eight-Standard ecology study][cooling-ecology-study]. Those passes
therefore do not establish its vegetation-diversity requirements, including
[rainforest presence on every map][cooling-rainforest-presence]. This is a
qualification-coverage gap, not a reported failed ecology run. The separate
fifteen-case census below is not a substitute result for this different cohort.

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

### Whole-Land Habitat And Feature Coverage

**Complete placement within admitted habitat is not the same as adequate
whole-land abundance or diversity.** The census re-examines the same fifteen
adopted-equivalent captures: ten Huge and five Standard maps, stronger cooling
and major-river percentile 0.95. It adds no map generation. Its denominator is
all 32,561 exposed cells, including navigable terrain but excluding finite lakes
and external ocean, rather than only the sites that qualify for a feature.

| Current Outcome | Cells | Share Of All Exposed Cells |
| --- | ---: | ---: |
| Rainforest-biome habitat | 1,233 | 3.787% |
| Rainforest features | 248 | 0.762% |
| Desert-biome habitat | 7,726 | 23.728% |
| Flat desert terrain | 4,314 | 13.249% |
| Feature-bare flat desert | 153 | 0.470% |

These rows overlap; they are not an additive partition. All are headless
outcomes, not a new native census. There are 6,594 cells in the classifier's
current adjusted-humid categories, but 5,361 are outside its tropical thermal
category. Among the 1,233 rainforest-biome cells, geometry leaves 864 flat
sites; earlier mangrove and minor floodplain occupy 616, leaving the 248 that
receive Rainforest. This is ordered accounting, not a prediction that changing
one gate would turn every excluded humid cell into rainforest.

#### Flat Desert Is Not Necessarily Bare Desert

The 4,314 flat desert cells divide into 4,071 sagebrush, 153 feature-bare,
89 minor desert floodplain and one oasis. Sagebrush occupies 94.367% of flat
desert. In the first Huge case, 332 flat desert cells contain 324 sagebrush,
four bare and four minor floodplain. Bare surface is scarce even where the
desert biome itself is extensive.

The remaining bare cells are not a representative warm-desert population:
127 belong to the model's cold thermal category and 26 to its temperate category;
their maximum captured annual temperature is 7.043 degrees C. These categories
are model outputs, not validated Earth climate classes. Feature-bare does not
mean resource-free: only 132 of the 153 also lack a resource. Neither the
feature names nor these headless counts establish the live map's appearance.

The unresolved outcomes therefore have different mechanisms: rainforest habitat
admission is distinct from the near-blanket feature coverage of flat desert.
The [adopted river choice](#current-cooling-qualification-and-adoption) is a
partial surface-capacity improvement, not resolution of either question.
Earth observations can inform sensible distributions across a varied cohort
without requiring each generated map to reproduce Earth's proportions. This
census identifies contractions; it selects neither a target count nor a repair.

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

That previous-lapse diagnostic alone does not select 0.95, qualify a production
change or establish that earlier wet features are wrong. The separate
[occurrence review in Q-005][occurrence] retains the intended mangrove priority
without establishing an admission repair; its ecological coverage remains open.
Q007's [seasonal-information probe][annual-regimes] likewise establishes an
unavailable distinction, not a cause of low counts. Neither review adds new
worlds to this population. A higher rainforest count alone cannot validate
either habitat classification or feature priority.

### Current-Cooling Qualification And Adoption

**Earthlike adopts a major-river discharge percentile of 0.95, retaining the
minor percentile of 0.74.** The [adopted configuration][adopted-river-config]
and [Hydrology reference][adopted-river-meaning] describe a representation
choice: after physical water and terrain evolution, the selector decides which
connected paths receive navigable-river representation. More ordinary surface
becomes available at the cost of fewer navigable corridors. Neither climate
nor the underlying physical river network is repaired by this choice.

The qualification uses the same ten Huge and five Standard cases under current
stronger-cooling B, not the previous-lapse A/C intervention above. Fifteen new
candidate executions change only major percentile 0.92 to 0.95 against the
fifteen retained B controls. Baselines were not rerun. The existing
[configuration test][adopted-river-test] also checks that the normal density
knob preserves the authored selection in the compiled recipe.

| Quantity Across The 15 Current-Climate Cases | B: Major 0.92 | Adopted: Major 0.95 |
| --- | ---: | ---: |
| Navigable river-source cells | 3,577 | 2,318 |
| Minor river-source cells | 4,902 | 6,161 |
| Any-river source cells | 8,479 | 8,479 |
| Rainforest-biome habitat cells | 1,233 | 1,233 |
| Free admitted Rainforest slots/features | 197 | 248 |

Every changed river class is major-to-minor; the any-river mask holds exactly,
not just its total. Captured upstream climate, physical water, lake geometry
and habitat fields also hold. Eleven maps gain rainforest features, four hold
and none lose. All free admitted lawful slots are filled in both headless arms.
Forty-nine of the 51 gains occupy demoted NAV cells; two come from former minor
floodplain slots. Of 132 demoted rainforest-biome cells, 41 instead become
mangrove, 18 minor floodplain and 24 expose their existing hill constraint.
Wetland precedence and habitat scores are unchanged.

The navigable-coverage cost is substantial: dry flow-connected NAV components
fall from 870 to 504, and authored wet outlet writes from 404 to 318. These
are graph and projection diagnostics, not named river counts or proven boat
routes. Physical water bodies and outlet truth remain intact. Retaining 0.92
is a coherent alternative preference for more represented navigable coverage;
adoption of 0.95 does not establish superior vessel access or repair
coast-following river topology.

Other downstream consequences are not hidden by rainforest gains. Forty-one
of 140 start coordinates move across twelve maps; modeled freshwater access
remains 136/140 and existing placement guards pass. Resources fall from 3,250
to 3,248, with 72 changed resource-surface cells. These headless outcomes do
not promise native resource support. A larger visible forest population is
not a calibrated ecological target.

#### What One Matched Native Pair Confirms

A separate matched Civ7 pair uses the first Huge case, map/game seed `378148420`,
106 x 66 tiles and ten majors, with the same complete setup in both arms.
It is two successful native generations of one case, not a second fifteen-map
study. River intended/observed arrays agree exactly in each arm: all 608 source
coordinates hold, with 75 major cells becoming minor.

| Native Observation | Control 0.92 | Candidate 0.95 |
| --- | ---: | ---: |
| Navigable river-source cells | 238 | 163 |
| Minor river-source cells | 370 | 445 |
| Rainforest applications | 45 | 50 |
| Forest applications | 312 | 357 |
| Resources planned | 232 | 231 |
| Resources placed | 221 | 219 |
| Resources refused | 11 | 12 |

Ordinary features apply without refusal in both arms, 1,108 and 1,144
respectively, matching the first headless case's aggregates. That agreement
is not an independent whole-grid final feature census. Final projection-phase
elevation arrays and accepted/observed lake masks hold across all 6,996 cells.
All 158 accepted inland-water cells remain water; 118 have native lake
classification and 40 retain the accepted inland-water adjustment. This is
not a claim that all 158 are classified as native lakes.

Three same-coordinate windows independently observe 135 cells per arm without
omission. In the tropical window, NAV falls from 12 to four and Rainforest rises
from seven to twelve; the other two windows hold. Available water, lake,
elevation, rainfall, biome and any-river facts hold in all three. All ten
candidate founder tiles have native dry, non-lake, non-NAV readback, but nine
player-indexed positions move. These observations do not establish founding
bonuses, boat passage or native per-start resource support.

**The native resource shortfall remains real.** Only eight refusal examples
are retained per arm, so the extra refusal cannot be attributed to one displayed
coordinate or treated as a complete refusal census. Natural wonders also retain
three refusals in each arm. Headless legality, successful feature application
and a bounded native comparison do not imply refusal-free realization, complete
lake connectivity, full-game stability or calibrated rainforest ecology.

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

The original A/B/C investigation uses source
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
production repair or threshold adoption is established by that original
investigation alone. The later qualification has its own scope below.
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

### Current-Climate Qualification And Native Scope

The later offline qualification executes the sole 0.95 candidate at source
`fa3dd579f2fc4b3fd8f2b22b7942eac8c26415f1`, against retained current-B 0.92
controls. Its fifteen new executions are distinct from the earlier 45 A/B/C
executions, the three synthetic profiles, and Q007's
[single seasonal recapture][generated-seasonal-witness]. Protected captured
fields and existing guards pass unchanged; absent artifacts receive no identity
claim. Its non-interleaved timings do not establish a performance improvement.

The tested production source is `dde45a82982270d183d59831bd2f7afee42232cb`.
The adopted merge `9f425885815ba314b8304bc414122c2dd769217c` has the same tested
tree, `3425e606704c008fc6f4e4241136524bf9e0bf76`. Only Earthlike's major
percentile changes at runtime; adjacent documentation and the existing test
change with it. The matched native pair uses that qualified control/candidate
relationship, with identical Huge/seed/player setup, Antiquity, Prince and
Standard speed. Its independent reviewer decoded the original logs and checked
the bounded observations; this editorial account does not repeat those actions.

Source adoption does not retroactively update the `2a31` navigation and Learning
baseline or the earlier observations in this sheet. Native observations support
only the quantities and populations stated above. Raw captures, operational
receipts and machine-specific evidence remain private. The following custody
identities are not public reproduction downloads or whole-question verification.

| Retained Qualification Evidence | SHA-256 |
| --- | --- |
| Current-B offline report | `a178e97e4978cb06d1273415ec63fcbc943ff79f7c86f9f54cfa7926cb0a1a65` |
| Fifteen-candidate execution receipt | `17b83c1a16e21a5ff3c244f9e7dcdd667964296fbf31e61987d233c0a8df29ef` |
| Current-B paired analysis | `c01bc27d5d33a32fe538ee7509fe048b464eb612960cda8bc02cd19d6b3d8caa` |
| Navigable representation cost | `7ad7d38936db7b17778801c1ef3b15bc0640a90e65c88b137b08c689ba19e633` |
| Production and native report | `dcdbbaa99fb31178e23303020ddd8744271edc29cc5275b578ad5054c710fcf5` |
| Matched native comparison | `2e3851d80c8ea9d253c4430e0f381db18f83b683a0a5c9e20a2fdd8a1037757c` |
| Independent native review | `bb988928fa5187d87d2758d5d90fc09925ed8f0d1b300a934b29b27d8bea3e7c` |
| Completed source-adoption closure | `f74db85f007b6cdbbe676efd2884b8ec461ed7a4ae97f39a6abbdeda6fc0f72c` |

### Whole-Land Census And Qualification Coverage

The whole-land census is a new reduction of 45 retained captures, not 45 new
maps: fifteen current 0.95 cases, fifteen previous-lapse A controls and fifteen
stronger-cooling 0.92 B controls. The current table uses only the fifteen
adopted-equivalent cases and all their exposed cells. Source capture is
`fa3dd579f2fc4b3fd8f2b22b7942eac8c26415f1`; owner replay uses
`dde45a82982270d183d59831bd2f7afee42232cb` after checking owner-file identity
against the capture source. The retained census reports exact classifier,
density, substrate and rainforest-score replay plus surface-partition checks.
This editorial account inspects its stored results without repeating those
replays. No new generation or native observation is added.

The earlier cooling-production qualification at
`6c5c8a82e7d36c17371699104ec58b3830f0e06d` has a different scope: four
climate-structure cases and twenty placement cases. Its manifest and receipt
record those 24 captures, not the eight-Standard ecology study. Climate coverage
included climate/biome structure and placement included resources, but neither
substitutes for the omitted ecology study. This limitation does not change the
reported results of the studies that ran, and it is separate from the later
fifteen-case NAV qualification.

| Retained Census And Coverage Evidence | SHA-256 |
| --- | --- |
| Whole-land census report | `ad86184a16f1068152c776bd6ffb4f7d908e1be7b576bf41a697d7e51e251057` |
| Census reduction receipt | `72df0d415ad859c0385223270232bcb224637cf194b7b3c90be35dfc37eefefa` |
| Whole-land and per-map analysis | `cd09500af47d03247392aa0e7c30b5beafa2c681685902dee49035db4f49056b` |
| Earlier cooling-production study manifest | `762481ff1dbfad2ee3aa0aee5ee0caa7ee2356e54fa659229702ac131bfe219e` |
| Earlier cooling-production execution receipt | `54d47c2893055cce41d64ccff70018e23aa7120e9290923eb6fdf1b51fc2a7a0` |

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
[generated-seasonal-witness]: q-007-biome-transition-meaning.md#one-generated-witness-no-established-classifier-change
[adopted-river-config]: https://github.com/mateicanavra/civ7-modding-tools/blob/9f425885815ba314b8304bc414122c2dd769217c/plugins/mod/map/swooper-physics/src/maps/configs/swooper-earthlike.config.json
[adopted-river-meaning]: https://github.com/mateicanavra/civ7-modding-tools/blob/9f425885815ba314b8304bc414122c2dd769217c/docs/system/libs/mapgen/reference/domains/HYDROLOGY.md
[adopted-river-test]: https://github.com/mateicanavra/civ7-modding-tools/blob/9f425885815ba314b8304bc414122c2dd769217c/plugins/mod/map/swooper-physics/test/maps/map-config-schema.test.ts#L356-L367
[cooling-ecology-study]: https://github.com/mateicanavra/civ7-modding-tools/blob/6c5c8a82e7d36c17371699104ec58b3830f0e06d/plugins/mod/map/swooper-physics/src/recipes/standard/metrics/studies/benchmarks/earthlike-ecology.study.ts#L10-L31
[cooling-rainforest-presence]: https://github.com/mateicanavra/civ7-modding-tools/blob/6c5c8a82e7d36c17371699104ec58b3830f0e06d/plugins/mod/map/swooper-physics/src/recipes/standard/metrics/targets/ecology.ts#L181-L186

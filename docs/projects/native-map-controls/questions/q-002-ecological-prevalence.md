---
id: Q-002
title: Ecological Prevalence And Benchmark Authority
recordKind: question
disposition: open
sourceRevision: ce077ddf13dc8cbbed16c1071e2aac6fafddbb60
locations:
  - id: "benchmark-ecological-prevalence"
    label: "Ecological Prevalence Benchmarks"
    relation: "question-owner"
    sourceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/ce077ddf13dc8cbbed16c1071e2aac6fafddbb60/plugins/mod/map/swooper-physics/src/recipes/standard/metrics/targets/ecology.ts"
  - id: "ecology-vegetation-planning"
    label: "Vegetation Planning"
    relation: "related-producer"
    stage: "ecology-features"
    step: "plan-vegetation"
    operation: "ecology.features.ops.planVegetation"
    sourceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/fe85600bb814cdeb977e36f4e9b5656aa322eb57/plugins/mod/map/swooper-physics/src/domain/ecology/modules/features/ops/features-plan-vegetation/contract.ts"
  - id: "ecology-feature-application"
    label: "Feature Application"
    relation: "downstream-consumer"
    stage: "map-ecology"
    step: "features-apply"
    operation: "ecology.features.ops.applyFeatures"
    sourceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/fe85600bb814cdeb977e36f4e9b5656aa322eb57/plugins/mod/map/swooper-physics/src/domain/ecology/modules/features/ops/features-apply/contract.ts"
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
  - claim: "The retained fifteen-configuration annual-gate rainforest investigation separates modeled habitat from terrain exclusion and earlier wet-feature occupancy. Every remaining eligible flat rainforest site places in its headless adapter; this is not fresh native acceptance or a calibrated coverage target."
    state: "supported"
  - claim: "A previous-lapse river-representation intervention retains 2,372 rainforest-biome cells while NAV cells fall from 3,575 to 2,325 and Rainforest features rise from 487 to 589. It establishes a partial occupancy contribution, not rainfall depletion or a selected production percentile."
    state: "supported"
  - claim: "Stronger cooling amplifies rainforest scarcity in the retained pairs but is not established as its historical origin; ecological adequacy remains unresolved."
    state: "supported"
  - claim: "The adopted Earthlike configuration selects major/minor discharge percentiles of 0.95/0.74. This is a river-representation choice, not a change to climate, physical drainage or habitat classification."
    state: "supported"
    evidenceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/9f425885815ba314b8304bc414122c2dd769217c/plugins/mod/map/swooper-physics/src/maps/configs/swooper-earthlike.config.json"
  - claim: "Fifteen river-only candidate executions under the reviewed annual-gate climate against retained B controls preserve all 8,479 river-source coordinates and 1,233 rainforest-biome cells while NAV cells fall from 3,577 to 2,318 and Rainforest features rise from 197 to 248. Fewer represented navigable components and outlets are a disclosed cost, not removed physical water."
    state: "supported"
  - claim: "One matched Huge native pair reproduces the first qualified case's river classes and feature-application aggregates, including Rainforest 45 to 50. Native resource shortfalls remain 11 and 12 refusals; bounded observations do not establish a complete native census, per-start resource support, vessel passage or calibrated ecology."
    state: "supported"
  - claim: "The whole-land census of the fifteen annual-gate baseline captures contains 1,233 rainforest-biome cells and 248 Rainforest features on 32,561 exposed cells. Of 4,314 flat desert cells, 4,071 carry sagebrush and only 153 are feature-bare. Complete placement within admitted habitat does not establish sufficient habitat extent or overall biome diversity."
    state: "supported"
  - claim: "The adopted seasonal-thermal rule's headless comparison raises rainforest habitat from 1,233 to 2,174 and final Rainforest from 248 to 553 across the same fifteen exposed-land populations, with 974 habitat additions/33 losses and 309 feature additions/four losses. Annual physical, climate, water, density and fifteen biome-independent score fields hold. The unchanged eight-Standard ecology study passes, but sparse and zero-rainforest cases remain; this is not native qualification or whole-land adequacy."
    state: "supported"
  - claim: "The adopted cold-season thermal correction has separate matched Huge native evidence: Rainforest applications rise from 50 to 107 and savanna from 3 to 95, with measured full-grid elevation/lake arrays and all 608 river coordinates/classes held. Three windows containing 135 cells match candidate terrain/biome/features. Resources change from 231 planned/219 placed/12 refused to 236/223/13; the additional refusal is an accepted tradeoff, not preservation. This does not establish independent final full-grid feature identity, ecological adequacy or campaign quality."
    state: "supported"
  - claim: "The annual-yield comparison preserves upstream climate forcing while full recipes alter physical water, habitat and legal placement. Physical acceptance does not validate all resulting feature counts or resource composition."
    state: "supported"
  - claim: "Re-evaluation of the same sealed eight f200858 maps passes the ce077dd cohort rainforest non-vacuity target, observed seven against minimum one, with no new generations. All other expectations remain exact and the original per-map FAIL is preserved."
    state: "supported"
  - claim: "The benchmark amendment intentionally tests whether the cohort exercises rainforest, not its abundance, distribution or Earth accuracy."
    state: "supported"
    evidenceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/ce077ddf13dc8cbbed16c1071e2aac6fafddbb60/plugins/mod/map/swooper-physics/src/recipes/standard/metrics/targets/ecology.ts"
  - claim: "A sealed fifteen-pair census finds desert expansion in every annual-yield pair under unchanged precipitation. All 1,226 common-ground additions have unchanged temperature, refined demand and atmospheric effective moisture but lower local-water opportunity. This identifies the retained expansion, not a fresh native census, Earth calibration or a qualified replacement classifier."
    state: "supported"
  - claim: "The e5dbd836 water-limitation screen has scoped offline qualification on fifteen complete recipes: 3,576 incumbent desert cells change to existing open categories while 1,095 captured-field comparisons hold. This does not establish native acceptance, adoption, calibrated desert severity or improved bare-versus-shrub diversity; all 3,102 surviving flat desert cells still carry a feature."
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
  - kind: source-inspection
    scope: "Inspection confirms the cohort non-vacuity predicate at minimum one, with the remaining target policy held. The retained amended evaluation is separately identified; source inspection is not a fresh generation or native qualification."
    revision: ce077ddf13dc8cbbed16c1071e2aac6fafddbb60
    date: '2026-10-12'
    evidenceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/ce077ddf13dc8cbbed16c1071e2aac6fafddbb60/plugins/mod/map/swooper-physics/src/recipes/standard/metrics/targets/ecology.ts"
  - kind: source-inspection
    scope: "Inspection confirms vegetation admission reads authored river classes, with observed projection recorded separately. A Rainforest loss on newly major-river terrain is not a native setter refusal."
    revision: ce077ddf13dc8cbbed16c1071e2aac6fafddbb60
    date: '2026-10-12'
    evidenceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/ce077ddf13dc8cbbed16c1071e2aac6fafddbb60/plugins/mod/map/swooper-physics/src/recipes/standard/stages/ecology/features/steps/plan-vegetation/step.ts"
  - kind: source-inspection
    scope: "Inspection confirms nonpolar biome selection uses plant moisture and stress, with no separate necessary water-limitation guard on desert. This describes the adopted owner, not qualification of the proposed guard or a new recipe execution."
    revision: ce077ddf13dc8cbbed16c1071e2aac6fafddbb60
    date: '2026-10-12'
    evidenceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/ce077ddf13dc8cbbed16c1071e2aac6fafddbb60/plugins/mod/map/swooper-physics/src/domain/ecology/modules/biomes/ops/classify-biomes/rules/classify.ts"
  - kind: source-inspection
    scope: "Inspection confirms atmospheric effective moisture, local plant-water opportunity and the regularized annual stress transform are separate published quantities. It does not establish seasonal sufficiency, root access or a calibrated desert boundary."
    revision: ce077ddf13dc8cbbed16c1071e2aac6fafddbb60
    date: '2026-10-12'
    evidenceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/ce077ddf13dc8cbbed16c1071e2aac6fafddbb60/plugins/mod/map/swooper-physics/src/domain/hydrology/modules/climate/ops/compute-land-water-budget/strategies/pet-aridity/index.ts"
  - kind: source-inspection
    scope: "Inspection of frozen e5dbd836 confirms the nonpolar incumbent-desert screen uses published plant stress greater than 0.5 and otherwise selects the existing semiArid class for the same thermal zone. The retained full-recipe result is separate evidence; inspection does not establish native loading, adoption or ecological calibration."
    revision: e5dbd83655f1f7f8f7ed2a1e76c80603df1b3313
    date: '2026-10-12'
    evidenceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/e5dbd83655f1f7f8f7ed2a1e76c80603df1b3313/plugins/mod/map/swooper-physics/src/domain/ecology/modules/biomes/ops/classify-biomes/rules/classify.ts"
---

# Q-002: Ecological Prevalence And Benchmark Authority

What does an ecological prevalence benchmark tell us: that a map expresses its
intended gameplay identity, that a test exercises a feature, or that the world
is ecologically plausible? These are different claims. A rainforest limit may
protect vegetation variety without estimating Earth's rainforest coverage; a
floodplain count may ensure a placement path is tested without asserting how
common floodplains should be.

Water supply, habitat admission and game representation answer different
questions. An annual water-yield model changes how precipitation feeds routed
water. The adopted cold-season thermal rule changes tropical admission; river
classification decides which channels replace ordinary land. Their visible
feature counts can move in different directions, so one preferred count cannot
stand in for all three meanings.

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

## Annual Water Yield And Its Landscape Consequences

The adopted annual-yield rule has physical acceptance for its approximate annual
water partition, not ecological calibration. Fifteen complete
headless recipes, ten Huge and five Standard, hold upstream climate forcing
while allowing incision, sealing and fresh final routing to respond. The
result is not merely the earlier fixed-ground sensitivity test. It includes
both lost and newly wet ground; exposed land changes from 32,561 to 32,827 cells
within the same 35,386-cell finite domain.

Reduced aggregate potential dry-ground yield accompanies fewer lake cells
overall, lower rainforest feature count, more sagebrush and
increased unresolved shoreline/subtile supply. That unresolved allocation is
not arithmetic conservation error. A physically accepted upstream mechanism
does not establish that these ecological consequences are desirable, or that
one population's native feature count measures Earthlike habitat abundance.

[Annual water yield and downstream supply][annual-supply] owns the remaining
hydrological calibration and water-access question. [Resource composition and
allocation][resource-composition] owns the accompanying fixed-obligation
resource deterioration. Neither is a request to recover rainforest by restoring
excess upstream yield or changing a resource writer.

### Desert Expansion Without A Rainfall Change

The retained maps are not uniformly almost all desert, but desert expands in
**every one of the fifteen annual-yield pairs**. This is a census of thirty
sealed captures of fifteen seeds, ten Huge and five Standard, not thirty
independent maps or a newly generated cohort.

| Population | Before Annual Yield | After Annual Yield |
| --- | ---: | ---: |
| Desert / exposed land, all fifteen | 7,726 / 32,561 (23.73%) | 9,074 / 32,827 (27.64%) |
| Desert / exposed land, Huge 668178883 | 1,171 / 2,499 (46.86%) | 1,434 / 2,644 (54.24%) |

Exposed land excludes lakes and external water but includes mountains and
navigable channels. The post-yield per-map shares range from 9.22% to 54.24%;
every map retains all five projected land-biome categories. Category presence
alone does not establish satisfactory balance or the appearance of a particular
neighborhood. The retained completed-generation log records the same Huge seed.
It is not a loaded-world census or visual confirmation of the player's view.

All paired precipitation fields are unchanged. Among the 32,494 cells exposed
in both captures, 1,226 become desert and 23 cease to be desert. Every addition
has identical final temperature, refined demand and atmospheric effective
moisture, but lower local annual surface-water opportunity and higher plant
stress. Another 145 desert cells are newly exposed; no former desert becomes
wet. The net increase therefore closes as `1,226 - 23 + 145 = 1,348`.
This locates the increase in local-water support, exposure and downstream
classification, not a newly reduced rainfall field. It does not validate the
inherited climate or make every desert classification erroneous.

The [biome classifier][desert-classifier] can assign nonpolar desert whenever
plant moisture `M < 90`, regardless of how small annual demand is. This branch
accounts for 8,981 of 9,074 post-yield desert cells. Across all desert cells,
2,694 have precipitation at least as large as refined annual demand. Low
absolute supply and relative water limitation are therefore not interchangeable
inside this model. These are uncalibrated indices, not Earth rainfall units or
evidence that every annually sufficient site should support forest.

The Huge outlier retains a different burden: only 201 of its 1,434 desert cells
have precipitation at least as large as refined demand. Most still have a
modeled annual deficit. A category-consistency correction cannot, by itself,
claim to solve that warm, dry landscape or establish whether its rainfall and
demand are appropriate.

#### A Necessary Water-Limitation Screen

The [frozen candidate][desert-screen] requires published plant-water stress
`S > 0.5` when the existing nonpolar calculation otherwise selects desert.
Under the [existing transform][desert-water-indices],
`S = D / (D + P + O + 1)`, `D` is annual demand, `P` precipitation and `O`
local annual water opportunity. Before output rounding, the boundary is
`D > P + O + 1`: demand exceeds modeled supply and the one-unit regularizer.
The classifier compares the published Float32 stress, not an exact inverse
reconstructed from separately rounded fields. This is a necessary consistency
screen within the model, not an Earth-calibrated desert-severity threshold.

Rejected desert cells use the existing open class for their thermal zone:
cold tundra, temperate dry or tropical seasonal, not direct promotion to forest.
The screen retains locally supported plant-habitat meaning without changing
rainfall, demand, hydrology, vegetation occurrence policy or count quotas.
Annual opportunity still does not establish seasonal survival or delivered
root water.

#### Offline Qualification Does Not Establish Ecological Adequacy

At frozen source `e5dbd83655f1f7f8f7ed2a1e76c80603df1b3313`, fifteen complete
candidate recipes reproduce the independent prospective category oracle.
These are the same ten Huge and five Standard cases, compared with retained
post-yield baselines, not a new seed sample or baseline rerun.

| Same Fifteen Recipes | Before Screen | After Screen |
| --- | ---: | ---: |
| Desert / unchanged exposed land | 9,074 / 32,827 (27.64%) | 5,498 / 32,827 (16.75%) |
| Sagebrush features | 4,958 | 3,079 |
| Taiga features | 5,003 | 5,338 |
| Savanna features | 352 | 379 |
| Forest / Rainforest features | 2,521 / 459 | 2,521 / 459 |
| Headless resource placements | 3,112 | 3,186 |

All 3,576 category changes are incumbent desert becoming 730 tundra, 2,785
temperate-dry and 61 tropical-seasonal cells. Other model categories hold.
Independent review recomputes 1,095 exact comparisons, 73 per map, across the
captured fields: climate, demand, local opportunity, relief, water, river
hierarchy and vegetation density remain unchanged. These are comparison checks,
not 1,095 distinct fields. The real operation wrapper, permafrost input and
treeline publication execute in the complete recipes; the omitted retained
permafrost/treeline fields are not independently compared bit for bit.

Final terrain holds, but 2,081 feature cells and 1,352 resource cells differ.
The resource total does not imply an increase on every map or sufficient
composition. All 140 modeled starts remain seated and legal, 138 have the
modeled freshwater relation, and all 95 requested wonders place. Start
positions, resource composition and some wonder footprints change; none is
an output-identity claim or native placement guarantee.

The same-fifteen vegetation-family diagnostic remains **FAIL in both arms**:
its observed minimum is three families against a requirement of at least four.
This out-of-population diagnostic is not a verdict on the registered eight-case
benchmark. The applicable offline qualification does not erase that failure
or establish abundance or Earth calibration.

**This is scoped offline acceptance for native qualification, not adoption or
native acceptance.** Huge 668178883 still has 1,149 / 2,644 exposed desert
cells (43.46%). Moreover, every surviving flat desert cell still carries a
feature, as the [bare-versus-shrub evidence][dryland-occurrence] explains.
Correcting a category does not make the atmosphere wetter or establish an
adequate landscape.

#### Installation Does Not Establish A Loaded World

The implementation owner reports that the frozen candidate was built and
installed through the owning task graph. That installation has not been
independently checked here; fresh game loading and native readback are
**unverified**. Installed bytes do not establish which source the current world
loaded, whether its features and categories match the headless result, or how
it looks. The
candidate remains unmerged and unadopted under this disposition. The previously
adopted annual-yield release retains its own qualification; these records do
not show that the currently loaded world changed.

#### Remaining Dryness Has No Proven Transport Cause

The retained annual fields and prospective screen identify mostly temperate
and seasonal-tropical remaining desert, not just cold misclassification.
Huge 668178883 has dry temperate and tropical populations; Huge 912543090 has
wet tropics but a dry temperate mainland. The wetter Huge 1594661164 provides
a contrast, not a required desert percentage. Whole thermal populations,
including non-desert land, support this contrast without selecting only dry
cells after the fact.

Whether low precipitation relative to demand begins at marine air entry or
develops inland remains unanswered. **No upwind transect was calculated.**
Annual rainfall combines 24 seasonal phases and two transient-polarity members
per phase. The captured winds are separately averaged and rounded at member
and annual reductions; the codec retains no cell-wise member winds, rain or
directed moisture flux. Annual arrows and lake adjacency cannot reconstruct
the rain-producing paths. Even the unretained phase-mean winds already average
the two weather members.

The missing evidence belongs to the existing moisture calculation: actual
phase/member inputs, source, deposition, atmospheric stock and directed
marine-to-land and inland transport. Exact reproduction of the sealed public
moisture outputs and reductions would establish custody before a causal
interpretation. No such observation is established here, and no blanket rain
multiplier, demand adjustment or new atmosphere is selected. This evidence gap
is separate from the classifier result.

### Rainforest Habitat Is Not A Native Feature Guarantee

The registered eight Standard maps are a separate population from the fifteen
above. Their modeled exposed rainforest habitat contracts from 683 to 594
cells; final headless Rainforest features fall from 134 to 86. Seed 1 loses its
only feature, while the other seven retain positive counts but also lose
features. The original unconditional per-map presence expectation therefore
remains **FAIL** under its original predicate.

The immediate reason on seed 1 is not drought. Cell 2041 retains rainforest
habitat, receives greater modeled local-water opportunity and increases its
rainforest score from 0.597014 to 0.634623. It becomes navigable-river terrain,
which cannot receive this native feature. The planner produces no Rainforest
intent there. This is a loss of legal placement, not a native setter refusal,
an observed lost biological stand or a failed seasonal thermal gate.

A different witness exposes category meaning. On seed 2, cell 2411, local
opportunity falls from 21.290890 to 19.956728. The modeled plant-moisture index
crosses 228.25 to 226.915833, changing humid to subhumid and losing rainforest
category. Yet the feature score rises from 0.339369 to 0.402377 with changed
soil and fertility. A higher score cannot override incompatible habitat.
This boundary is a calibration question, not proof that a biological stand
should vanish after such a modest index change.

Across the eight, 31 still-exposed category losses have less local-water
opportunity under unchanged atmospheric and thermal forcing. Their changes
are consistent with the incumbent ecology policy; they do not independently
validate its absolute moisture categories or repeated stress attenuation.
The review finds no newly demonstrated demand double debit or thermal
regression. Annual plant-water opportunity still does not establish seasonal
root-water access. The [related occurrence question][occurrence-meaning]
separates these meanings from a shared score floor.

### A Cohort Smoke Test Is Not Abundance Validation

The separately completed benchmark amendment selects **cohort non-vacuity** in place of
unconditional rainforest presence on every map: the same eight scenarios must
exercise at least one realized Rainforest feature somewhere in the cohort.
This is an integration smoke test, not a requirement fitted to seven of eight
maps, a vegetation quota or an Earth-accuracy target.

Re-evaluation of the same retained eight maps passes the amended target:
seven maps contain realized Rainforest, against a requirement of at least one.
The re-evaluation generates no new maps and preserves every other expectation
exactly. The earlier FAIL remains a fact about the earlier expectation; a new
predicate does not turn it into a historical pass.

One rainforest tile across eight maps could satisfy non-vacuity; eight isolated
tiles could satisfy the old per-map test. Neither establishes adequate extent,
distribution or ecological abundance. Real habitat/admission tests have their
own role: positive opportunity can be selected and legitimate exclusions can
be respected without forcing a feature into every random world.

### River Policy Still Trades Land For Potential Routes

The physical-state and river-policy comparison keeps those choices distinct:

| Physical State | Major Percentile 0.92: NAV Cells | Major Percentile 0.95: NAV Cells |
| --- | ---: | ---: |
| Seasonal baseline runoff | 3,577 | 2,318 |
| Corrected full-chain annual yield | 3,430 | 2,368 |

Each policy pair reclassifies the same retained physical state; it is not a
second full-world generation. Minor percentile 0.74 and zero absolute floors
are held. A percentile depends on the sampled distribution, whereas a floor
sets an absolute modeled threshold. The positive discharge samples remain
above those floors, so rank, endpoint and routing changes explain this result,
not an absolute-floor crossing.

Retaining 0.95 preserves 1,062 ordinary-land cells relative to 0.92 on corrected
physics: 756 underlying flats and 306 hills. Those cells still carry minor
rivers. The choice accepts fewer represented principal paths and wet
connectors; one demoted path spans seventeen cells, so its route cost is not
universally negligible. Actual vessel utility is unmeasured. The decision
retains a land-occupation preference, not a physical constant or uniquely
optimal river density. The .92 screen does not establish its downstream
feature, resource or start outcome.

[occurrence-meaning]: q-005-wetland-suitability.md#habitat-meaning-remains-open
[annual-supply]: q-009-annual-water-yield.md
[resource-composition]: q-010-resource-composition.md
[desert-classifier]: https://github.com/mateicanavra/civ7-modding-tools/blob/ce077ddf13dc8cbbed16c1071e2aac6fafddbb60/plugins/mod/map/swooper-physics/src/domain/ecology/modules/biomes/ops/classify-biomes/rules/classify.ts
[desert-water-indices]: https://github.com/mateicanavra/civ7-modding-tools/blob/ce077ddf13dc8cbbed16c1071e2aac6fafddbb60/plugins/mod/map/swooper-physics/src/domain/hydrology/modules/climate/ops/compute-land-water-budget/strategies/pet-aridity/index.ts
[desert-screen]: https://github.com/mateicanavra/civ7-modding-tools/blob/e5dbd83655f1f7f8f7ed2a1e76c80603df1b3313/plugins/mod/map/swooper-physics/src/domain/ecology/modules/biomes/ops/classify-biomes/rules/classify.ts
[dryland-occurrence]: #flat-desert-is-not-necessarily-bare-desert

## Seasonal-Thermal Recovery And Its Limits

The adopted [cold-season thermal rule][seasonal-thermal] changes habitat
admission without changing the captured annual climate, water, physical fields
or vegetation density. Its headless comparison covers the same ten Huge and
five Standard maps as the [annual-gate census](#whole-land-habitat-and-feature-coverage):
32,561 exposed cells, including navigable terrain but excluding finite lakes
and external ocean. Final features change as well as theoretical habitat.
Additions and losses are separate same-site counts, not just the net difference.

| Population | Annual-Gate Baseline | Adopted Thermal Rule | Added | Lost |
| --- | ---: | ---: | ---: | ---: |
| Rainforest-biome habitat | 1,233 | 2,174 | 974 | 33 |
| Rainforest features | 248 | 553 | 309 | 4 |
| Savanna woodland features | 26 | 317 | 291 | 0 |
| Forest features | 3,622 | 3,047 | 27 | 602 |

Every added rainforest-habitat cell belongs to the previously annual-gate-excluded
humid population, and 309 of those recovered sites carry final Rainforest.
All fifteen biome-independent score layers hold, so the gains are not a wetter
climate, a boosted vegetation score or a feature quota. Forest losses and other
[family-competition consequences][seasonal-occurrence] remain visible rather
than being treated as automatically desirable exchanges.

Fourteen of fifteen maps gain final rainforest. Huge seed `1419989910` remains
at zero, with rainforest habitat changing from 32 to 30 cells. This is useful
end-to-end recovery, not universal recovery or adequate whole-world diversity.
The source/headless correction is accepted after independent outcome audit;
its separate native comparison below supports bounded realization, not a new
fifteen-map native census or closure of the remaining ecological questions.

### The Separate Eight-Map Ecology Result

The [existing eight-Standard ecology cohort](#vegetation-across-eight-standard-maps)
is a separate population. Its exact annual-gate baseline study fails its
vegetation-family variety and rainforest-presence requirements, while the
unchanged seasonal-thermal candidate study passes without threshold edits or
newly failing per-map expectations. Yet Standard seeds 1 and 3 contain only one
and two Rainforest features. Presence is not adequate abundance, and a passed
study is not Earth calibration. The zero-rainforest Huge
case in the [fifteen-map comparison](#seasonal-thermal-recovery-and-its-limits)
belongs to a different population, not an unreported failure of this eight-case
study.

### Cold-Season Admission In One Native World

The adopted thermal rule reaches Civ7 in one matched Huge case: seed
`378148420`, 106 x 66 cells and ten major players. Both arms use the already
adopted major-river percentile of 0.95. This comparison therefore tests thermal
admission, not another reduction in navigable-river coverage.

| Ordinary-Feature Applications | Annual-Gate Baseline | Cold-Season Rule |
| --- | ---: | ---: |
| Rainforest | 50 | 107 |
| Savanna woodland | 3 | 95 |
| Forest | 357 | 227 |
| Mangrove | 22 | 34 |

Total ordinary-feature applications rise from 1,144 to 1,175 with no recorded
legality refusals; every family aggregate matches the qualified headless case.
**Applications and final native readback are different evidence.** These counts
are recorded after feature setter calls, not independently read from every final
tile. Three native windows provide that second kind of observation for 135
cells: all have available facts and match candidate terrain, biome and feature.
Their physical facts hold against the matched baseline. The tropical window
includes one forest-to-empty site as well as gains; the basin and old-start
windows hold.

**Successful vegetation application does not mean refusal-free placement.**
Native resources change from 231 planned / 219 placed / 12 refused to
236 / 223 / 13. The additional refusal is an explicitly accepted downstream
tradeoff, not a preserved resource result or a waived success. Wonders remain
7 planned / 4 placed / 3 refused. These counts establish neither per-start
resource adequacy nor complete realization of every planned object.

Measured elevation and accepted/observed lake arrays hold between arms across
all 6,996 cells. All 608 river coordinates and classes hold, comprising 445 minor
and 163 navigable cells. All 158 accepted lake cells remain water, but the same
40 native lake-classification differences persist. Physical preservation is
not perfect agreement between lake categories or proof of vessel passage.

All ten observed founder sites are native dry, non-lake and non-navigable terrain
at turn one; two players' starting positions differ between maps and the local
player remains at `(38,16)`. This is a start-surface observation, not a founding, movement, visual
or campaign test. The sparse cases above, dryland occurrence below and
[family-competition question][seasonal-occurrence] remain open.

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
and major-river percentile 0.95, with the pre-change annual tropical gate. This
**annual-gate baseline** predates the adopted seasonal-thermal rule. The census
adds no map generation. Its denominator is
all 32,561 exposed cells, including navigable terrain but excluding finite lakes
and external ocean, rather than only the sites that qualify for a feature.

| Annual-Gate Baseline Outcome | Cells | Share Of All Exposed Cells |
| --- | ---: | ---: |
| Rainforest-biome habitat | 1,233 | 3.787% |
| Rainforest features | 248 | 0.762% |
| Desert-biome habitat | 7,726 | 23.728% |
| Flat desert terrain | 4,314 | 13.249% |
| Feature-bare flat desert | 153 | 0.470% |

These rows overlap; they are not an additive partition. All are headless
outcomes, not a new native census. There are 6,594 cells in the classifier's
baseline adjusted-humid categories, but 5,361 are outside its tropical thermal
category. Among the 1,233 rainforest-biome cells, geometry leaves 864 flat
sites; earlier mangrove and minor floodplain occupy 616, leaving the 248 that
receive Rainforest. This is ordered accounting, not a prediction that changing
one gate would turn every excluded humid cell into rainforest.

### Flat Desert Is Not Necessarily Bare Desert

The [offline screen result](#offline-qualification-does-not-establish-ecological-adequacy)
reduces the number of desert cells but does not create bare-versus-shrub
diversity. Of 3,102 surviving flat desert cells, 3,079 carry sagebrush (99.3%)
and 23 carry minor floodplain: **none is feature-bare**. All 175 previously
bare flat desert cells leave DESERT because their low-demand classification
was inconsistent. Their departure is not new bare habitat or a feature-policy
improvement. This flat-desert partition excludes the four navigable desert
floodplain features elsewhere in the candidate.

The [post-yield census](#desert-expansion-without-a-rainfall-change) makes the
earlier, pre-screen category/cover distinction concrete: 4,958 of 5,177 flat desert cells carry
sagebrush (95.77%), 175 are feature-bare and 44 carry minor floodplain. All 175
bare cells have precipitation at least as large as both baseline and refined
annual demand; their median annual temperature is 1.62 degrees C. Meanwhile,
3,634 sagebrush-covered flat desert cells have precipitation below refined
demand, and 2,278 have zero local-water opportunity. Thus bare ground is not
identifying the most annually water-limited subset, and broad shrub cover is
not explained by lakes alone. These are retained headless categories and
features, not measured canopy cover or current native appearance.

A native DESERT label compresses several physical regimes into one game
category. It is not a measured Earth aridity class. Likewise, annual modeled
water supply below potential demand does not independently establish an
absence of drought-adapted plants. Sparse shrubland remains a plausible
interpretation: a feature on every large tile need not mean continuous shrub
canopy. Its movement and yield effects nevertheless make the distinction
between some plants and a gameplay-significant stand consequential.

A separate controlled operation composition at the frozen candidate calls the
public sagebrush scorer and planner with an explicitly eligible flat, free
desert tile, competitors at zero and the authored zero score floor. Varying
water and biomass changes the score but not its intent:

| Water Input | Biomass Input | Score (Rounded) | Sagebrush Intent |
| ---: | ---: | ---: | --- |
| 0 | 0 | 0.1026385 | Present |
| 0 | 0.25 | 0.15625 | Present |
| 0.2 | 0 | 0.6568866 | Present |
| 0.2 | 0.25 | 1 | Present |

Explicit-zero-score controls produce no intent. Under these controlled eligible
inputs, reducing a positive score alone does not reduce deterministic occurrence.
The probe does not establish that the constructed inputs arise in generated
worlds, that zero atmospheric water means no local support, or that scores are
occupancy probabilities. No replacement threshold, probability or stand policy
is selected. Compatible shrub habitat and an actual cover feature remain
different claims.

The earlier annual-gate census found 4,314 flat desert cells: 4,071 sagebrush,
153 feature-bare, 89 minor desert floodplain and one oasis. Sagebrush occupied
94.367% of that population. In the first Huge case, 332 flat desert cells
contained 324 sagebrush, four bare and four minor floodplain. Bare surface was
scarce even where the native desert biome was extensive.

The 153 feature-bare cells were not a representative warm-desert population:
127 belonged to the model's cold thermal category and 26 to its temperate
category; their maximum annual temperature was 7.043 degrees C. These are
model categories, not validated Earth climate classes. Feature-bare does not
mean resource-free: only 132 of the 153 also lacked a resource. Neither these
headless counts nor the feature names establish the live map's appearance.

A separate planner replay on fifteen retained seasonal captures tested whether
a vegetation-density cutoff of 0.10 would distinguish unsupported dryland
occurrence. The captured environment, suitability scores and other-family
intents stayed fixed. The gate removed 837 of 4,071 sagebrush intents, but only
54 of 764 in the defined warm supply-deficit receiver. Those 54 are part of the
837 removals, not an additional population.

Here the warm receiver means cells in the warmer, lower-precipitation-to-demand
part of the retained cohort whose total modeled annual supply remains below
demand, even with local water opportunity included. Its warm and low-ratio
bounds are sample-relative, not Earth desert thresholds. This receiver uses
the refined ecological water budget; local opportunity is not proof of water
delivered to roots.

Removed sites had a median annual temperature of 7.19 degrees C. The gate also
removed 52 cool stands where local opportunity lifted modeled annual supply
from below demand to at least demand. These losses show why low density cannot
be read as an independent water-limited stand boundary: the density proxy also
depends on thermal energy, freezing and soil. The gate was rejected as a
sufficient physical warm-dryland repair. That rejection establishes neither
that all retained shrubland is appropriate nor that every removed stand was
unsupported.

The open distinction is between conditions permitting plants and conditions
warranting the native stand representation. A calibrated physical occurrence
boundary has not been established, and an empirical gameplay stand-significance
policy has not been selected. The [related wetland question][wetland-meaning]
separates habitat support, family response and admission policy without assuming
that one family's floor applies to another.

Rainforest admission, dryland occurrence and native category meaning therefore
remain different questions. The [adopted river choice][river-choice] supplies
some additional terrestrial capacity, and the seasonal thermal correction
changes biome admission; neither result independently validates dryland cover.
The earlier fixed-ground annual-runoff contrast addressed the water supplied
to basins, not a vegetation-density rule. Its basin response did not establish
full-pipeline ecological improvement.
Earth observations can inform distributions across a varied cohort without
requiring every map to reproduce Earth's proportions. These observations select
neither a bare-ground quota nor a desired feature count.

The full-chain annual-yield comparison increases headless Sagebrush from
4,071 to 4,958. It therefore does not resolve the distinction between native
DESERT, sparse shrub support and a gameplay-significant stand. The earlier
0.10 gate remains evidence that this cutoff was not a sufficient physical
warm-dryland repair, not support for every incumbent or newly admitted stand.
Cold-category meaning and stand significance remain open independently of
the water-yield mechanism.

[wetland-meaning]: q-005-wetland-suitability.md#habitat-meaning-remains-open
[river-choice]: #current-cooling-qualification-and-adoption

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
rainforest comparisons establish their separately bounded populations. Neither is
ecological calibration or a blanket verdict on the remaining bounds.

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

The retained pre-amendment [ecology cohort][ecology-protocol] uses Standard (84 x 54, 8 players), seeds
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
fifteen-case census is not a substitute result for this different cohort.

The [separate seasonal-thermal result](#the-separate-eight-map-ecology-result)
compares this exact cohort without changing its requirements. The later
[annual-yield amendment](#a-cohort-smoke-test-is-not-abundance-validation)
changes only the rainforest-presence predicate to cohort non-vacuity.
The old per-map outcomes retain their original meaning.

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

## Earlier Cooling And River-Representation Evidence

The following comparisons use the reviewed annual tropical gate. They distinguish
cooling and surface occupancy before the adopted cold-season rule; their source
vintages and populations remain independent of the seasonal results above.

### Rainforest Habitat And Feature Occupancy

Sparse visible rainforest predates the stronger relief-cooling setting; cooling
amplifies it rather than establishing its historical origin. A retained
fifteen-configuration comparison separates these contributions on one source.
**A** uses the previous lapse of -0.0065 and **B** the adopted -0.15, with the
same map/game seeds within each pair. A is a controlled previous-lapse
counterfactual on the reviewed source, not a reconstruction of an earlier build.

In these comparisons, the modeled `tropicalRainforest` biome describes an
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

This river-only qualification uses the same ten Huge and five Standard cases
under stronger-cooling B and the annual tropical gate, not the previous-lapse
A/C intervention above. Fifteen new
candidate executions change only major percentile 0.92 to 0.95 against the
fifteen retained B controls. Baselines were not rerun. The existing
[configuration test][adopted-river-test] also checks that the normal density
knob preserves the authored selection in the compiled recipe.

| Quantity Across The 15 Annual-Gate Cases | B: Major 0.92 | Adopted: Major 0.95 |
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

## Rainforest Evidence Scope And Provenance

The current location mappings use adopted source `fe85600`; the observations
below retain their own source revisions and qualification scopes.

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

Source adoption does not retroactively update the earlier observations or the
source-inspection findings pinned to `2a31` in this sheet. Native observations support
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
maps: fifteen annual-gate 0.95 cases, fifteen previous-lapse A controls and fifteen
stronger-cooling 0.92 B controls. The baseline table uses only the fifteen
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
| Earlier whole-land census report version | `ad86184a16f1068152c776bd6ffb4f7d908e1be7b576bf41a697d7e51e251057` |
| Census report with clarified population labels | `60cd2f97dd8624d3947187b7066ead34c9779bd239dc0246ced94707453f75b2` |
| Census reduction receipt | `72df0d415ad859c0385223270232bcb224637cf194b7b3c90be35dfc37eefefa` |
| Whole-land and per-map analysis | `cd09500af47d03247392aa0e7c30b5beafa2c681685902dee49035db4f49056b` |
| Earlier cooling-production study manifest | `762481ff1dbfad2ee3aa0aee5ee0caa7ee2356e54fa659229702ac131bfe219e` |
| Earlier cooling-production execution receipt | `54d47c2893055cce41d64ccff70018e23aa7120e9290923eb6fdf1b51fc2a7a0` |

The later seasonal-thermal result has a distinct execution population: 23
candidate maps, comprising the same ten Huge/five Standard cases and the existing
eight-Standard ecology study. The fifteen old baselines are reused unchanged;
the eight missing exact-adopted baselines are acquired separately once each.
There is no seed or threshold sweep. The earlier omission remains historical
fact rather than being retroactively described as a completed ecology run.

Candidate source is `acf3ba936977fa36342eb0c645a7d9bf0675e6d5`, tree
`ba1e61f5f1a557dd884001041a75b95b5295a9a4`. Its source/headless qualification and
independent sealed-output audit support the cohort comparisons above. Native
realization and completed adoption have separate evidence below; neither turns
these cohorts into calibrated abundance claims. The five new-baseline
build-wrapper import-order differences are disclosed in retained custody;
universal runtime byte equivalence is not claimed. This sheet inspects retained
results without repeating generation or reduction.

| Seasonal-Thermal Outcome Evidence | SHA-256 |
| --- | --- |
| Source/headless outcome-review version | `f2536c09715b7adbf868d62ff350b1f73bcceb594afeda39bd67e656aba8fb2f` |
| Candidate execution receipt | `27ff21106d6af07459c4d0fbfb87be4fe2f64c97d960ff52e98dff67b3fe812f` |
| Candidate outcome summary | `989b52d45b5c3fc10cb78f79b60116d6c6f7061a3d1cfd55b91d928c6c62554b` |
| Unchanged eight-case ecology comparison | `39daabef82e1be6fce0b22bcd2055bb690397b0de96a3113819d856bb6645478` |
| Exact-adopted eight-case baseline receipt | `fc9caf97f3353f4c5129c94387300fb95bf1f7f42cc2a78a4b7994cd42d0e701` |
| New-baseline runtime inventory qualifications | `b11ed0c1e00f8733300907b445803bea0c9e824a0592b40f76c0644670b18b8e` |

### Seasonal Native Realization And Adoption

The adopted merge `fe85600bb814cdeb977e36f4e9b5656aa322eb57` has the same
tested tree `ba1e61f5f1a557dd884001041a75b95b5295a9a4` as candidate `acf3`.
The closure receipt verifies clean adopted source and all eight installed and
built files against the qualified artifact. It establishes completed adoption,
distinct from the retained pre-merge authorization. The expanded outcome review
records the adopted result; the earlier source/headless version remains separate.

The native result adds one completed generation against the retained matched
0.95 baseline. An independent reviewer decoded both raw logs and checked their
evidence series, installed bytes, complete physical arrays, river classes and
bounded observations. Founder surface facts have separate readback. This sheet
curates those finished results without repeating native actions or claiming
independent final full-grid feature identity. Acceptance is bounded to the
cold-season correction and its stated tradeoffs, not overall Earthlike quality.

| Retained Native Evidence | SHA-256 |
| --- | --- |
| Expanded outcome review including native findings | `23e2b9e6e454680e57b87a6cda6d808b0cdad9b9711a0a14cc2d6e44e53427a8` |
| Bounded adoption decision | `7afa9fbacd30f7b0fb047fbe5c7a24a35cf381c4449b81194cd3c7e2883b3d5f` |
| Matched seasonal native comparison | `d9f0d9e4559cf88c81fac15b3c4b5a4459296c68ec61107dc562306f1db07a10` |
| Ten-founder surface comparison | `dd974bf3d9fde0b5c33c22bf922e0a7e0c8f300d6c24cde68bd81d935be90058` |
| Completed seasonal adoption closure | `9b5f62eba37cb96bf2b07b6837851c9000a0c4b84fd21de7158102a7aecc0a15` |


## Annual-Yield Evidence And Qualification

The fifteen full-recipe comparisons and separate registered-eight generation
evidence use `f20085808332b5051971dd465e189e834daaa5d4`, tree
`abc947413608a0b9c3037f7f821c85fbc68733d3`. The comparison baseline
`acf3ba936977fa36342eb0c645a7d9bf0675e6d5` has the same tree as adopted
seasonal source `fe85600bb814cdeb977e36f4e9b5656aa322eb57`.

Combined candidate `ce077ddf13dc8cbbed16c1071e2aac6fafddbb60`, tree
`fb3dc2521f53bbd436349faa1e97c9bd45d734bb`, incorporates the separate benchmark
prerequisite `2444cf10fe6404bdd51e2f9691481d2dd7e16541`. Its complete tree
difference from f200858 is four benchmark/test/documentation files, not changed
domain, generation or configuration bodies. The retained maps were generated
at f200858; the ce077dd evaluation does not relabel their producer.

| Retained Evidence | SHA-256 |
| --- | --- |
| Fifteen-map generation receipt | `50ae115635376188053b4a019649454980ead397c76314769f7ceede1437b3f2` |
| Original eight-map FAIL receipt | `4ca98cbf788a076f20755fb1b19a180ce97306816abbc73bbcd7fc38f4dcbc4c` |
| Amended eight-map PASS receipt | `52db1136e319a0f1228227febb21f6981d7003bb834ffb979dd1a001bb150e0d` |
| Resource review, version 2 | `bb66171fe7c7e9e664939c4505c10e6077f3694438a763af5cb71915e68f40d4` |
| NAV policy projection comparison | `7a7ee598a5fd0ea41f8d499b705f10eecf8e70eff5e108caab9a4175266ddef3` |
| Bounded native qualification report | `9db4562d5c9ce22d20d218999fe09ebe9e161633f87662f5a4a2e3ac921db01e` |
| Native adoption input seal | `2ff9712dfc5b2fdd7a8dfecb0b9f3e166eaa0e2817ae5a8600512efa3da8666c` |

The amended evaluation observes seven positive members against a minimum of
one; all other cohort expectations and all eight sample-target records remain
exact. Its zero new recipe executions are distinct from the subsequent R1
repeat of one existing Huge witness, seed 378148420.

Final offline qualification at ce077dd passes 1,404 definition tests with zero
failures. All 25 owning-graph task records succeed, including cached dependency
tasks; the definition-test task is uncached. The one R1 repeat matches the
complete retained capture except for `execution.definitionGenerationDurationMs`.
This is equality of captured contents with the stated exclusion, not identical
compressed bytes or a new cohort.

The R1 receipt SHA-256 is
`e11aafbfa44d4632e807e58fd26f1d0e949cc4f979ab2174805d0c636565101b`.
These are retained owner results, not new editorial executions. They close
the named offline gates, not ecological adequacy. Full captures remain outside
the public document; the digests identify their retained receipts without
exposing private locations.

Source adoption is separate: PR #2373 merged the benchmark amendment as
`3817d8bb1ae853e74ad39e3137f5aa64c5630873`; PR #2372 then merged annual yield as
`e73bbbd5f2301922f7204b694ed7cf9ba047bc44`. The latter has the exact reviewed
ce077dd tree `fb3dc2521f53bbd436349faa1e97c9bd45d734bb`. Learning retains that
reviewed source pin; the f200858 generation evidence keeps its original identity.

In two native witnesses, Standard 918829240 and Huge 668178883, measured terrain,
water coverage, authored river metadata and numeric heads for all 78 physical
water bodies match the corresponding retained generation targets. Their 74
lake-category differences belong to four complete bodies
above the stock cutoff, not lost water. Ordinary ecological feature families
agree; remaining feature differences belong to natural-wonder materialization.
Eighteen observed first-unit positions satisfy the supplied land predicates;
this is not founder identity or a `canFound` test. Resource refusals remain
eight of 195 and four of 196 intents, as detailed in [Q-010][resource-composition].
Missing shared game-instance correlation prevents formal native parity, and
pixel QA is unavailable. These bounded findings support adoption without
establishing visual quality, resource sufficiency or ecological abundance.

### Desert Census Provenance

The later desert audit reuses thirty sealed captures: the fifteen seasonal
outputs at `acf3ba936977fa36342eb0c645a7d9bf0675e6d5` and their fifteen annual-yield
counterparts at `f20085808332b5051971dd465e189e834daaa5d4`. Every capture hash
matches its completed receipt. Twelve interpretation owners at reviewed ce077dd
are byte-equal to both producer revisions; the adopted e73bbbd5 tree remains
the same reviewed tree. The audit reuses existing classifier helpers to check
categories, with zero recipe executions and zero native calls.

| Retained Desert Evidence | SHA-256 |
| --- | --- |
| Census receipt | `a2cfac113c65747ff582fe86211d6807036f11de2164b7f6fbddd2efa0e21263` |
| Counts, intersections and paired attribution | `aef2d7d5b16dda3028e807c873663d497ff17f4996078693988269dd44c6f134` |
| Interpretation report | `902abce62db1931e6c6f08d7a363f9c0ee7daf0e186147297d1138cf13f14c68` |
| Read-only reducer | `aa0d33a2081c9baa6f8bc6f0dcbce0ac3d12bd6c6389b4d177c57e595943618a` |

The separate last-completed-log finding does not supply the unavailable fresh
world observation. Neither that finding nor this census changes the annual-yield
arithmetic qualification into whole-biome qualification, or supplies a passing
result for the proposed water-limitation guard.

#### A Water-Limitation Guard Is A Candidate, Not A Result

The original census identified the guard as a hypothesis, not a passing result.
That census alone still proves no repair. The separately executed
[offline qualification](#offline-qualification-does-not-establish-ecological-adequacy)
now supplies scoped candidate evidence; native acceptance and adoption remain
unestablished by those offline records.

### Desert Screen Qualification Provenance

The baseline retains generation source `f20085808332b5051971dd465e189e834daaa5d4`.
The fifteen new candidate recipes use frozen source
`e5dbd83655f1f7f8f7ed2a1e76c80603df1b3313`, tree
`c79fbd609ae2a54e2383141d9a82c0c12021f4c7`. Rule replay, complete-recipe
qualification and the independent capture review are distinct evidence; the
review is not another set of generations. Installation, loading, native
readback, visual observation and adoption are not supplied by those offline
receipts. The implementation owner reports this selected map-script digest,
not independently checked installation, verified fresh loading or readback:
`352f17c904d5830e223002d525f63ae05aac22feccc52863795e33e71d3ec197`.
This identifies selected-script bytes, not a full source-to-live identity or
an observed current world.

| Retained Screen Evidence | SHA-256 |
| --- | --- |
| Complete-recipe receipt | `2228d7a8020f9b665ca872f9ad6acec6d611778c87582f9587ad6a83c56992b4` |
| Independent offline review | `7a205dbca2a30d0ffe00a315faa467e133f11b07fd196df131231f59b691eaa1` |
| Complete-recipe result | `4f804d6c1cb5bb73bc29135a87743128225b98776d5f7e27402967d0c4dce2de` |
| Controlled scorer/planner probe | `499a70f1388d2a24403433321faefc2c09be06b3531f7227f3c5c9c5ac232ddd` |
| Remaining-desert concentration | `300c68363135a6e115563796e025530725d5298d62603b58a020261816ffcfcf` |
| Stopped transport-custody review | `1d8ca55955291a1dc854d2366ccfc105867e598e244a28567240c4b4218ee63b` |

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
[seasonal-thermal]: q-007-biome-transition-meaning.md#persistent-warmth-is-a-separate-question
[seasonal-occurrence]: q-005-wetland-suitability.md#biome-compatibility-changes-cover-without-changing-scores

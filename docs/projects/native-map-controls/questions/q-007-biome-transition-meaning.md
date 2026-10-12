---
id: Q-007
title: Biome Transition Meaning
recordKind: question
disposition: open
sourceRevision: fe85600bb814cdeb977e36f4e9b5656aa322eb57
locations:
  - id: "ecology-biome-classification"
    label: "Biome Classification"
    relation: "question-owner"
    stage: "ecology-biomes"
    step: "biomes"
    operation: "ecology.biomes.ops.classifyBiomes"
    sourceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/fe85600bb814cdeb977e36f4e9b5656aa322eb57/plugins/mod/map/swooper-physics/src/domain/ecology/modules/biomes/ops/classify-biomes/contract.ts"
  - id: "hydrology-baseline-climate"
    label: "Baseline Climate"
    relation: "related-producer"
    stage: "hydrology-climate-baseline"
    step: "climate-baseline"
    sourceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/fe85600bb814cdeb977e36f4e9b5656aa322eb57/plugins/mod/map/swooper-physics/src/recipes/standard/stages/hydrology/climate/baseline/steps/climate-baseline/config.ts#L84-L111"
assessments:
  - claim: "The reviewed annual-gate classifier uses plant moisture/stress for nonpolar moisture categories and deliberately retains atmospheric effective moisture for its guarded tropical-temperature transition."
    state: "supported"
    evidenceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/ae8fc94d790a769fb45c60584e47304f69f53a93/plugins/mod/map/swooper-physics/src/domain/ecology/modules/biomes/ops/classify-biomes/rules/classify.ts#L66-L100"
  - claim: "The retained annual-gate thermal pair reports 25 tropical-to-temperate-humid cells with unchanged plant-moisture/stress category buckets: 21 enter the adaptive guard and four cross adaptive thresholds within it. This is a policy interaction, not by itself a defect or a non-monotonicity result."
    state: "supported"
  - claim: "The bounded owner review retained the intentional annual temperature/atmospheric-moisture envelope at its reviewed source. Source algebra and 39 reported scalar checks support monotone tropical admission under the configurations shipped at that revision with other inputs fixed, not ecological calibration or every schema-admitted configuration."
    state: "supported"
  - claim: "The reviewed annual-gate transition constants and guard-limited boundary are ecologically calibrated or preferable to other habitat-classification choices."
    state: "unassessed"
  - claim: "The reviewed annual-gate rainforest category is an empirical annual hot/wet envelope. Its tropicalSeasonal category describes annual moisture, not a measured duration of seasonal water shortage."
    state: "supported"
    evidenceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/fa3dd579f2fc4b3fd8f2b22b7942eac8c26415f1/plugins/mod/map/swooper-physics/src/domain/ecology/modules/biomes/ops/classify-biomes/rules/lookup.ts"
  - claim: "The retained three-profile synthetic probe records exactly equal consumed annual chains and one Rainforest intent each despite different precipitation ordering. This establishes unavailable distinguishing information, not generated-map reachability, required vegetation differences or a cause of rainforest scarcity."
    state: "supported"
  - claim: "The reviewed freezeIndex producer ramps annual post-albedo temperature rather than measuring freezing duration or frequency; its value is zero throughout the annual-gate baseline's admitted Earthlike rainforest."
    state: "supported"
  - claim: "A seasonal-water summary or broader humid-forest classification is necessary and has a supported producer-reachable benefit beyond the adopted thermal distinction and accurately described annual water indices."
    state: "unassessed"
  - claim: "One existing-case recapture establishes producer-reachable atmospheric seasonal exposure, but not a justified classifier change: all 21 positive-gap rainforest-biome cells have annual local-water support of unknown seasonal persistence, and all ten free lawful rainforest slots already place. Annual behavior was retained against that seasonal-water challenger, not validated for tropical thermal admission or whole-land biome diversity."
    state: "supported"
  - claim: "The separately qualified thermal correction replaces the annual tropical gate and atmospheric wetness-to-temperature adjustment with Hydrology's coldest circular one-twelfth-cycle mean and a provisional 18 C criterion. Fixed-fifteen and existing-eight headless comparisons demonstrate habitat-to-feature recovery with protected annual fields and scores held. Source/headless acceptance does not establish native qualification or a full seasonal-water habitat model."
    state: "supported"
  - claim: "The cold-season correction is adopted at fe85600 with the same qualified tree as acf3 and separate bounded native realization in one matched Huge case. This accepts the thermal admission distinction, not a selected permanent season, a full seasonal-water habitat model, calibrated whole-land ecology or campaign quality."
    state: "supported"
verification:
  - kind: source-inspection
    scope: "Inspection confirms the frozen recipe's real classifyBiomes binding; the owning step and classifier operation are unchanged through ae8. This is navigation/source identity, not physical qualification."
    revision: 2a31c96f8d61ee713075974838dfd36a0b008021
    date: '2026-10-11'
    evidenceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/recipes/standard/stages/ecology/biomes/steps/biomes/config.ts#L14-L27"
  - kind: source-inspection
    scope: "Inspection confirms separate atmospheric and plant inputs, the inclusive 1.25 C guard and the clamped moisture-dependent threshold. It does not independently reproduce the private pair's per-cell attribution."
    revision: ae8fc94d790a769fb45c60584e47304f69f53a93
    date: '2026-10-11'
    evidenceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/ae8fc94d790a769fb45c60584e47304f69f53a93/plugins/mod/map/swooper-physics/src/domain/ecology/modules/biomes/ops/classify-biomes/rules/classify.ts#L66-L100"
  - kind: source-inspection
    scope: "Canonical Ecology documentation explicitly retains atmospheric thermal-transition context and identifies the categories as empirical, not scientific climatic-aridity classes. This is the declared model meaning, not its calibration."
    revision: ae8fc94d790a769fb45c60584e47304f69f53a93
    date: '2026-10-11'
    evidenceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/ae8fc94d790a769fb45c60584e47304f69f53a93/docs/system/libs/mapgen/reference/domains/ECOLOGY.md#config-posture"
  - kind: source-inspection
    scope: "Inspection confirms seasonal temperature, precipitation, wetness and demand are computed, while durable baseline products publish annual summaries and full phase histories remain observations. This is not a new seasonal simulation or scientific qualification."
    revision: fa3dd579f2fc4b3fd8f2b22b7942eac8c26415f1
    date: '2026-10-11'
    evidenceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/fa3dd579f2fc4b3fd8f2b22b7942eac8c26415f1/plugins/mod/map/swooper-physics/src/recipes/standard/stages/hydrology/climate/baseline/steps/climate-baseline/step.ts"
  - kind: source-inspection
    scope: "Inspection confirms refined demand and climate indices use annual post-albedo temperature and annual wetness, rather than passing seasonal chronology to Ecology. The retained synthetic probe remains separate reported evidence."
    revision: fa3dd579f2fc4b3fd8f2b22b7942eac8c26415f1
    date: '2026-10-11'
    evidenceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/fa3dd579f2fc4b3fd8f2b22b7942eac8c26415f1/plugins/mod/map/swooper-physics/src/recipes/standard/stages/hydrology/climate/refine/steps/climate-refine/step.ts"
  - kind: source-inspection
    scope: "Inspection confirms freezeIndex is a ramp of its supplied temperature. The refinement binding supplies annual post-albedo temperature; the artifact's persistence wording therefore does not establish duration or frequency."
    revision: fa3dd579f2fc4b3fd8f2b22b7942eac8c26415f1
    date: '2026-10-11'
    evidenceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/fa3dd579f2fc4b3fd8f2b22b7942eac8c26415f1/plugins/mod/map/swooper-physics/src/domain/hydrology/modules/cryosphere/ops/compute-cryosphere-state/strategies/temperature-thresholds/index.ts"
  - kind: source-inspection
    scope: "Inspection confirms rainforest's saturating lower water ramp and absence of a direct fertility multiplier. This describes implemented scoring, not calibrated occurrence or a newly executed score repair."
    revision: fa3dd579f2fc4b3fd8f2b22b7942eac8c26415f1
    date: '2026-10-11'
    evidenceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/fa3dd579f2fc4b3fd8f2b22b7942eac8c26415f1/plugins/mod/map/swooper-physics/src/domain/ecology/modules/features/ops/vegetation-score-rainforest/rules/score.ts"
  - kind: source-inspection
    scope: "The adopted temperature rule retains annual polar/cold gates and uses the coldest-month-like mean for tropical admission. This is source inspection, not a rerun of headless or native qualification."
    revision: fe85600bb814cdeb977e36f4e9b5656aa322eb57
    date: '2026-10-12'
    evidenceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/fe85600bb814cdeb977e36f4e9b5656aa322eb57/plugins/mod/map/swooper-physics/src/domain/ecology/modules/biomes/ops/classify-biomes/rules/temperature.ts"
  - kind: source-inspection
    scope: "The adopted periodic producer computes a minimum circular one-twelfth-cycle mean from its clipped baseline thermal curve alongside its annual mean. This confirms the emitted statistic, not Earth calibration or seasonal soil-water persistence."
    revision: fe85600bb814cdeb977e36f4e9b5656aa322eb57
    date: '2026-10-12'
    evidenceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/fe85600bb814cdeb977e36f4e9b5656aa322eb57/plugins/mod/map/swooper-physics/src/domain/hydrology/modules/climate/ops/compute-thermal-state/rules/periodic-response.ts"
---

# Q-007: Biome Transition Meaning

How well does this model's tropical boundary describe the intended habitat?
The adopted [cold-season thermal rule](#persistent-warmth-is-a-separate-question)
uses persistent warmth rather than annual mean temperature for tropical
admission. Its headless and bounded native results support that distinction
without changing the annual climate itself. Seasonal-water habitat meaning,
broader ecological adequacy and gameplay qualification remain open.

The owner is **Ecology / Biomes / Biome Classification**, after Hydrology has
produced climate and local plant-water fields, and before features and native
biome projection. The [reviewed biomes step][step] calls `classifyBiomes` with
those distinct inputs. Physical categories are not the same as Civ7's projected
biome identities, and neither is a count of rainforest features.

A continuous climate field must eventually become discrete categories; crossing
a boundary is expected. The question is which climatic distinctions those
categories preserve and which consequences justify them. In particular,
`tropicalSeasonal` still names an annual moisture category, not a measured
dry-season duration.

## Persistent Warmth Is A Separate Question

The adopted [thermal producer][adopted-thermal-producer] supplies a
Hydrology-owned **minimum circular one-twelfth-cycle mean** from the existing
periodic temperature curve: the coldest month-like interval, not its coldest
sampled instant or one chosen permanent season. The initial 18 degrees C
criterion is informed by the
[Koppen-Geiger tropical criterion][peel], but remains a provisional model
choice, not a universal physiological boundary. The
[adopted classifier][adopted-thermal-rule] replaces the annual tropical
temperature gate and atmospheric wetness-to-temperature adjustment rather than
adding another veto on top of them. Annual temperature still serves the cold
zones and annual growth/demand meanings; annual plant-water categories remain
distinct from a full seasonal rainforest classification.

**The lesson is to preserve the summary each decision needs, not to choose one
season or discard annual means everywhere.** The same periodic temperature curve
can supply an annual mean for annual processes and a cold-season constraint for
persistent tropical warmth. This rule uses the baseline, pre-albedo thermal
curve; newly tropical cells in the qualification have neutral annual albedo
correction. It does not add seasonal soil storage, uptake or dry-season survival.

The [fixed-map comparison][seasonal-outcomes] demonstrates formerly excluded
humid habitat reaching final Rainforest, with annual physical, climate, water,
vegetation-density and fifteen biome-independent score fields held. Gains,
losses and sparse cases are reported together. Separate
[matched native evidence][seasonal-native] supports application-stage gains and
bounded terrain/biome/feature readback while measured physical water and river
classes hold. The correction is adopted on that qualified basis. Neither
adoption nor successful application closes seasonal-water meaning, the remaining
feature-occurrence questions or broader biome quality.

Seasonal water availability and persistent tropical warmth are different
questions. The synthetic water probe below holds temperature constant, while the
generated water witness examines atmospheric shortfalls and uncertain local-water
persistence. Neither establishes that annual mean temperature is an adequate
substitute for the cold part of the temperature cycle.

## Annual Categories And Seasonal Regimes

The baseline [rainforest lookup][current-lookup] described a hot, humid annual
envelope, not a scientifically calibrated forest regime. Replacing its thermal
gate does not yet supply a full seasonal-water classification. The distinction is
more than terminology: climate capable of supporting a forest, the amount of
vegetation, and actual tree cover are different claims.

### What Earth Classifications Distinguish

In the Koppen-Geiger classification documented by [Peel and colleagues][peel],
tropical climate depends on the coldest month's mean temperature; the rainforest
subtype also depends on the driest month's rainfall. These are climate-class
criteria, not universal physiological limits on trees. [FAO's ecological
zones][fao-zones] instead distinguish tropical rainforest, moist forest and dry
forest partly by dry-season duration. The report itself questions a historical
boundary choice. Duration matters to that classification without making one
cutoff a universal law.

Elevation introduces another distinction. [FAO's tropical mountain account][fao-mountains]
includes montane evergreen and cloud forests within a varied altitudinal mosaic,
not only hot lowland forest. In the Holdridge framework described by
[Lugo and colleagues][lugo], sea-level biotemperature identifies latitudinal
belts while actual local biotemperature identifies altitudinal belts. Its
24 degree C tropical-belt value does not independently validate a cutoff on
our local annual ground temperature. The same paper acknowledges the seasonal
limits of first-level annual life zones and distinguishes potential ecosystems
from actual land cover.

These sources support asking which regime a model represents, not copying
monthly air-temperature or millimetre rainfall thresholds into annual ground
temperature and model rainfall-index units. Cooler humid forest is not a reason
to assign the native Rainforest feature to every tropical mountain; the game's
[terrain and feature legality][rainforest-population] remains a separate layer.

### Seasonal Information Exists Upstream

At the reviewed annual-gate source, the [baseline climate step][seasonal-baseline]
computes ground temperature, precipitation, wetness and potential demand across
Earthlike's 24 phases.
Full histories remain available as observations. Durable downstream products
publish annual quantities, and [climate refinement][annual-refinement] derives
its later demand from annual post-albedo temperature and annual wetness. That
later demand is distinct from the phase-derived demand used by hydrography.
The rainforest decision does not receive the chronology.

That describes the retained baseline's forwarding. The adopted thermal rule adds
one durable summary of cold-season temperature, not full phase histories or a
seasonal water balance. The annual water meanings below remain separate.

Its [plant-water indices][annual-water] combine annual precipitation, wetness
and local surface-water opportunity algebraically. They are not seasonally
integrated root-zone storage, uptake or survival. Annual summaries are not
intrinsically inadequate: a summary could preserve the outcome of a seasonal
process. These particular indices do not preserve how wet and dry phases are
arranged. Likewise, `tropicalSeasonal` is selected from annual moisture/stress
buckets, not the number or duration of dry intervals.

The reviewed [artifact description][freeze-description] calls `freezeIndex`
freezing persistence, but its [producer][freeze-producer] ramps annual temperature
between the [configured][current-config] 2 and -12 degrees C endpoints. It measures
neither frequency nor duration of freezing. Its value is zero throughout the
annual-gate baseline's admitted Earthlike rainforest, so this description
overclaim does not explain rainforest suppression in that population.

### Three Histories Become The Same Annual Input

A retained synthetic probe passes three one-cell profiles through the reviewed
annual-gate demand, annual reducer, water-budget, biome, substrate,
rainforest-score and vegetation-planner operations. Each has 24 equally weighted
phases, fixed temperature 26 degrees C, mean model precipitation 250, mean wetness 0.5,
identical soils/fertility, zero local-water opportunity and a free flat slot.
The steady profile holds those water values throughout; the other two arrange
twelve zero-precipitation/zero-wetness phases and twelve phases of precipitation
500/wetness 1 differently.

| Synthetic History | Longest Cyclic Zero-Precipitation Run | Consumed Result |
| --- | ---: | --- |
| Steady wetness | 0 phases | Identical annual chain; one Rainforest intent |
| Clustered dry/wet halves | 12 phases | Identical annual chain; one Rainforest intent |
| Alternating dry/wet phases | 1 phase | Identical annual chain; one Rainforest intent |

The **entire recorded consumed annual chain is exactly equal across profiles**,
not just its rounded score. All three have plant moisture 294.625, plant stress
0.189451 and rainforest score 0.530493. Observation-only amplitudes distinguish
steady from variable profiles, but not clustered from alternating phases.

This establishes lost distinguishing information, **not that the three profiles
must produce different vegetation**. Zero-precipitation run length describes
the supplied sequence, not a calibrated ecological drought: storage, uptake
and local supply are separate processes. The probe is not a generated-map
witness; reachability of these complete histories is unestablished. It does
not replay seasonal routing, albedo, cryosphere or native placement. Constant
temperature avoids broader claims about varying temperature and covariance.

Its contribution to the [retained rainforest shortage][rainforest-population]
is unknown. Recognizing a long dry season could exclude some currently admitted
rainforest rather than increase it. Better regime discrimination and higher
feature counts are not synonyms.

### One Generated Witness, No Established Classifier Change

**The seasonal-water challenger does not establish a classifier change.**
A separate observation of one generated map establishes that the producer
creates seasonal atmospheric exposure, but not that this exposure justifies
changing the habitat decision. It recaptures an existing Standard case under
stronger cooling, the annual tropical gate and the reviewed 0.92 major-river
setting, not another synthetic profile or a new seed population.

The observation retains 24 chronological phases. Its `gap` is the weighted
positive difference between baseline atmospheric demand and precipitation,
divided by weighted demand. Its `run` is the longest cyclic contiguous fraction
of phase weight for which demand exceeds precipitation. These describe modeled
atmospheric exposure, not measured drought, plant survival or a calibrated
dry-season threshold.

Among 61 rainforest-biome cells, 21 have a positive gap. Twenty of those still
have annual baseline precipitation at least as large as annual demand: annual
balance can conceal within-cycle shortfalls in a real generated case. The
placement and local-water context, however, changes what follows from that fact.

| Rainforest-Biome Population | Cells | With A Positive Atmospheric Gap |
| --- | ---: | ---: |
| No annual local-water opportunity (`L = 0`) | 21 | 0 |
| Positive annual local-water opportunity (`L > 0`) | 40 | 21 |

Every positive-gap rainforest cell has annual local-water support whose seasonal
availability is unknown. An atmospheric veto would discard that modeled support;
distributing annual `L` across phases to cancel the gaps would invent its
persistence. Neither inference is established by these observations.

All ten free lawful rainforest slots already produce intents and headless
features. The remaining rainforest-biome cells are 15 navigable-river cells,
five hills, 24 earlier mangroves and seven earlier minor tropical floodplains.
There is no missing free lawful placement in this case for a seasonal change
to explain. Six of the ten actual rainforest features have a positive gap;
five gaps are only 0.00787-0.02138, with longest runs of 2-3/24. The remaining
site has a gap of 0.27992 and a run of 8/24, alongside annual local-water support
of 576.09. Those model-unit observations do not assign ecological severity or
prove that the vegetation is misplaced.

The bounded review retained annual-water behavior against this atmospheric-water
challenger without erasing the information limitation. It neither validates
the annual tropical thermal gate nor establishes that seasonality never matters.
The natural contrasts do not reproduce the three synthetic histories or hold
their annual inputs identical.
The separate [river-representation qualification][current-river-choice] changes
available surface without changing this annual classification; its feature
gains are not evidence for a seasonal habitat repair.

The [whole-land census][whole-land-coverage] also shows why filling all free
lawful slots is not an adequacy test for the world. It conditions on the habitat
already admitted, leaving its extent and the resulting biome diversity open.

A narrower annual hot/wet proxy, described accurately, remains a comparator,
not a validated account of persistent tropical warmth. A broader humid-forest
interpretation or additional seasonal evidence would need to preserve a useful
physical or gameplay distinction, with producer-reachable support and a
defensible downstream consequence. The water witness alone establishes exposure,
not that consequence. The separate thermal result now demonstrates a useful
habitat-to-feature effect for its fixed populations, while leaving seasonal
soil water and full forest-regime classification unresolved. Raising rainforest
counts alone remains insufficient, but complete placement inside a narrow
admitted population is not evidence of an adequate world either.

### Why This Is Not Another Score Repair

The [earlier wet-end correction][wet-end-correction] removed rainforest's
unsupported penalty at maximum available water. The [reviewed score][rainforest-score]
has a saturating lower water ramp; under the [annual-gate Earthlike inputs][current-config] it is already
fully active below the rainforest category's minimum moisture. The freeze
attenuation is inactive throughout that warm domain. There is no direct
generic-fertility multiplier in this score; fertility influences the separate
[density calculation][vegetation-density] through a bounded soil response.

The retained fifteen-configuration comparison found no additional score-floor
loss among free, legally eligible rainforest sites under its **annual-gate
baseline**. That finding does not deny the later
[zero-score and below-floor replacement-family sites][seasonal-occurrence]
after thermal admission changes. Neither population alone justifies a score
repair or validates the habitat category. The separate
[mangrove occurrence review][mangrove-retention] likewise retains its intended
specialized-habitat priority without validating coastal coverage. Independent
family scores are not calibrated competing occurrence probabilities.

This concerns classifier meaning, not the [authority of prevalence targets][benchmarks]
or the [annual-source meaning of an oasis][oasis]. More rainforest, wider
temperature spread or fewer visible bands would not by themselves establish
a better answer.

## Earlier Annual-Gate Evidence

The original owner meaning was an intentional, **uncalibrated annual
temperature/atmospheric-moisture envelope**. The guarded rule, retained pair
and consistency findings below describe their original source vintages, not the
adopted cold-season rule. Adoption does not retroactively change those findings.

The retained monotonicity finding and the
[seasonal-information question](#annual-categories-and-seasonal-regimes) concern
different claims. A rule can behave consistently while lacking information
needed to distinguish some forest regimes.

### Two Different Uses Of Moisture

The reviewed annual-gate classifier first combines a temperature zone with a
moisture category.
For nonpolar land, plant moisture and plant stress describe local growth
conditions, including water beyond local rainfall. Near the tropical boundary,
a separate adjustment uses **atmospheric effective moisture** to decide which
temperature zone applies. This is not normalized forcing `W` or the plant-water
index. The [Ecology meaning at that revision][ecology-meaning] explicitly
preserves this atmospheric context. The different inputs are deliberate; whether that
distinction is adequately calibrated is a separate question.

The [transition rule][transition] names its original purpose: preventing
row-perfect tropical cutoffs. [Earthlike's nominal threshold][earthlike-config]
is 24 degrees C.
The atmospheric adjustment is active only within the inclusive interval
22.75-25.25 degrees C. On its dry side, the adjusted tropical threshold can
rise to 25.4 degrees C, beyond the interval's upper edge. Outside the interval,
the ordinary temperature-zone rule applies.

The guard therefore clips the actual boundary: at the dry extreme, tropical
membership requires temperature **strictly above 25.25 degrees C**, not 25.4.
At the wet extreme it begins **at 22.75 degrees C, inclusively**. Between those
extremes the adaptive threshold applies. For the configurations shipped at that
revision, tropical admission is monotone in temperature at fixed atmospheric moisture,
and in atmospheric moisture at fixed temperature and plant inputs. Warming
alone or wetting alone does not reverse tropical admission; cooling and
wetting together need not preserve it.

That relationship makes the guard itself part of the effective decision
boundary. Entering it can change the category without crossing 24 degrees C.
The [lookup][lookup] can then replace a tropical biome with `temperateHumid`
while its subhumid, humid or perhumid moisture category stays the same. This
explains how a wetter location can lose the rainforest *biome label*; it does
not establish that wetter conditions have reduced the modeled water supply.

### What The Retained Pair Exposes

The [single-world thermal comparison][thermal-pair] changes only the admitted
upstream thermal gain, but later temperature, atmospheric moisture and other
consumer inputs can respond together. It is not a classifier test with every
other argument held fixed.

The retained pair's per-cell attribution reports 25 physical tropical-to-temperate-humid
changes: 19 from tropical rainforest and six from tropical seasonal. All cool,
none crosses the nominal 24 degree C center, and their plant-moisture/stress
category buckets and elevations stay unchanged. The numeric moisture and
stress values need not be identical.

| Transition | Reported Cells | Meaning |
| --- | ---: | --- |
| Entry into the adaptive guard from above 25.25 degrees C | 21 | The dry-side 25.4 degree C threshold becomes applicable. |
| Adaptive-threshold crossing while remaining inside the guard | 4 | Temperature and/or atmospheric effective moisture change the predicate. |

Cell 2017 illustrates why rainforest loss is not shorthand for drying:
temperature falls from 25.285952 to 24.971687 degrees C while precipitation,
wetness and plant moisture all rise, yet its category changes when the guard
activates. Across the 25 cells, precipitation rises in 11 and falls in 14;
wetness rises in 14 and falls in 11. Twenty-four cells form a localized cluster
across the map's horizontal wrap, not a whole-latitude-row replacement.

These are concrete consequences of that annual-gate policy. Cooling across a
categorical boundary does **not** demonstrate non-monotonic classification,
and mixed atmospheric responses do not support a broad-drying explanation.
The retained attribution also does not isolate pressure, rainfall and demand
as independent causes of the atmospheric-moisture change.

### Retained Meaning, Open Calibration

The bounded meaning review retained the annual-gate behavior at its source.
Near the nominal tropical boundary, wetter atmospheric climate permits tropical membership at a cooler
supplied temperature; drier climate requires more warmth. Local plant water
independently determines the moisture category and vegetation support. This
classifies the supplied climate; it neither computes a new temperature nor
claims that rainfall physically warms a tile.

The anti-banding origin is real, but it does not by itself demonstrate obsolete
compensation. The remaining objections concern both an aesthetic boundary
shaper without specific ecological calibration and the annual inputs' inability
to distinguish some seasonal histories. Retention acknowledges the empirical
status; it does not turn historical visual intent into Earth evidence or
establish that the constants are optimal.

Source algebra and the reported 39 scalar checks resolved the suspected
monotonicity defect in the then-shipped law for this discriminator. The 25 map
transitions remain ordinary consequences of the guarded policy under simultaneous input changes.
The disabled thermal candidate uses seasonal precipitation/demand relative to
an active row reference; the classifier uses absolute final atmospheric moisture.
Their interaction is not evidence of a duplicate temperature computation.

That review left open how well the joint annual envelope represented the
intended habitat, and what evidence would favor another classification. A meaningful
alternative would state the climatic or gameplay distinction it preserves,
the inputs it requires, and what outcomes would distinguish it from this proxy.
Removing the adjustment, widening its guard or substituting local plant water
would change that policy, not repair a demonstrated wiring error. More rainforest
alone would not justify any of those choices.

That retention would have been challenged by a same-input violation under a
configuration shipped at the reviewed revision, an explicit rejection of the
joint-envelope meaning, or evidence that the guard was intended only as an
optimization of an unbounded rule.
None was established by the retained pair. Ecological calibration and native
gameplay remain separate evidence questions, not conclusions of scalar checks.

## Evidence Boundaries

The current location mappings use adopted source `fe85600`; the historical
findings below remain scoped to the source and evidence that established them.

The original guard and thermal-pair source statements describe physics revision
`ae8fc94d790a769fb45c60584e47304f69f53a93`. The classifier operation and owning
step at that revision are unchanged from the earlier `2a31` source. The reported
pair executes
`ff7b40a7beca64ac2621f6ce07fc5f2f8485a327`, with only the separate diagnostic
filename repair added. Its [custody and comparison scope][pair-provenance]
remain with Q-006. The 21/four attribution comes from the sealed thermal outcome,
not a joint population independently recomputed for this sheet.

The separate 2026-10-11 retention decision reports source/history review and
39 actual one-cell operation checks, independently rerun by the director.
Their scope is the guarded law, climate forwarding and separation of atmospheric
and plant inputs, not map prevalence or ecological validity. The monotonicity
conclusion is scoped to configurations shipped at that reviewed revision: an
unordered hypothetical configuration admitted by the schema can violate it and does not explain this
pair. The private decision and counter-read have SHA-256 identities
`af2ce538baa6afe1aaef7774146b4d3f9ebb2e5883f86a42bd447f3bba778b15`
and `6d15c5f410179078ec853aa65a0152387dd1551a661204e37a769cbc389a1be4`.

No scalar experiment, generated map, native observation or Earth calibration
was rerun to prepare this sheet. The source and retained checks establish
bounded model behavior, not verified Earth physics. The suspected defect in that reviewed law
was closed by retention; empirical calibration remains open.

### Annual-Regime Review And Synthetic Probe

The separate physical-meaning review and three-profile probe inspect and execute
existing owners at `fa3dd579f2fc4b3fd8f2b22b7942eac8c26415f1`, with clean source
and unchanged runtime from `6c5c8a82e7d36c17371699104ec58b3830f0e06d`.
They do not replace the earlier 39 scalar checks or add maps to Q002's
fifteen-configuration/45-execution population. The semantic probe's method was
independently reviewed; its stored input/output equality and custody were
checked for this sheet without rerunning it. That probe adds no native sessions or production changes.

The research supplies external classification context, not calibration of the
pipeline's units, a source of new numerical constants or proof that all omitted
processes must be modeled. The reported three focused rainforest tests concern
implementation behavior, not ecological qualification. Raw reports and probe
artifacts remain private; the following hashes identify retained evidence, not
public reproduction downloads.

| Retained Evidence | SHA-256 |
| --- | --- |
| Rainforest physical-meaning report | `f6399cda1649b9879c03b798d3fffdb37c60166ef62bf87217f421a9cfd7ea6a` |
| Synthetic-probe method | `8c1d1162fb3dac23fde79310845d0c1c08dbd0eab0204e24e7e58d3796298c0d` |
| Synthetic-probe inputs and results | `a3cafee30bb331103f30f6ffe2059c735bab8db5cd0066515a91cebe17df36bd` |

### One Producer-Reachable Observation

The separate witness uses source `fa3dd579f2fc4b3fd8f2b22b7942eac8c26415f1`,
Standard 84 x 54, map/game seed `1327944073` and eight players: the existing
current-climate case 11-B. Exactly one full capture was repeated with additional
observation; all 49 existing integrity expectations passed. Original captured
outputs are identical except execution runtime and the added observation.
Artifacts absent from the original capture are outside that identity claim.
Temporary observation changes were removed; no production model changed.

The complete inventory covers 61 tropicalRainforest, six tropicalSeasonal and
399 temperateHumid cells, all also baseline land. The retained one-ULP check
reports no uncertain demand-versus-precipitation comparisons in these cohorts.
That is numerical sensitivity evidence, not biological certainty. Full phase
demand retains its original double precision rather than being rounded to the
single precision of precipitation, wetness and temperature.

The independent evidence review recomputed the phase reductions and annual-
water/feature joins; a separate physical/product review retained the annual
model. The final ordered placement partition was added afterward and checked
by the implementation owner, not retrospectively attributed to those completed
independent reviews. This sheet inspects retained evidence without repeating
the capture or reductions. It adds neither a native observation nor another
member to the separate fifteen-case river qualification.

| Retained Witness Evidence | SHA-256 |
| --- | --- |
| Generated seasonal-witness report | `ff18e2696f968393fdb579c3e8a01798d2b7116d4586b5f326aaa2ed85a41796` |
| One-capture receipt | `68d0666c85bce7d8760342006e4aff1d2109a2681d67221c303296b43db037b6` |
| Complete-cohort analysis | `9fefd3aebc2f28da892855a6feaf1fc9b8e8212db568a988e8f38fc03424cc16` |
| Ordered placement reconciliation | `5dae3cbf7ebb4b6cf5a790222bf329aa5c0aebb24e542e641db029a68a174b52` |
| Retained-model closure | `45e0581abe56358fb30e23a631c675012aa0ebace717dff504593fc7558e8c81` |

The separate seasonal-thermal mechanism retains its predeclared definition
below. That definition is not a result; the [source/headless evidence][seasonal-evidence]
has its own candidate source, 23 executions, reused fifteen-case baseline and
separately acquired eight-case baseline. The
[native realization and adoption evidence][seasonal-adoption] has its own
matched-case, installed-artifact and completed-source identities. Neither
evidence class establishes a full seasonal-water model or whole-world ecological
calibration. The water-witness closure above neither supplies nor invalidates
that different thermal evidence.

| Candidate Definition, Not Outcome | SHA-256 |
| --- | --- |
| Seasonal-thermal scope and provisional criterion | `4e12737019d8f5733bd6dcc05296c51e6a1511542ba8369f5002f4db1034af33` |

[step]: https://github.com/mateicanavra/civ7-modding-tools/blob/ae8fc94d790a769fb45c60584e47304f69f53a93/plugins/mod/map/swooper-physics/src/recipes/standard/stages/ecology/biomes/steps/biomes/step.ts#L21-L41
[transition]: https://github.com/mateicanavra/civ7-modding-tools/blob/ae8fc94d790a769fb45c60584e47304f69f53a93/plugins/mod/map/swooper-physics/src/domain/ecology/modules/biomes/ops/classify-biomes/rules/classify.ts#L66-L100
[ecology-meaning]: https://github.com/mateicanavra/civ7-modding-tools/blob/ae8fc94d790a769fb45c60584e47304f69f53a93/docs/system/libs/mapgen/reference/domains/ECOLOGY.md#config-posture
[lookup]: https://github.com/mateicanavra/civ7-modding-tools/blob/ae8fc94d790a769fb45c60584e47304f69f53a93/plugins/mod/map/swooper-physics/src/domain/ecology/modules/biomes/ops/classify-biomes/rules/lookup.ts#L21-L33
[earthlike-config]: https://github.com/mateicanavra/civ7-modding-tools/blob/ae8fc94d790a769fb45c60584e47304f69f53a93/plugins/mod/map/swooper-physics/src/maps/configs/swooper-earthlike.config.json#L819-L843
[thermal-pair]: q-006-regional-thermal-response.md#a-modest-response-in-one-procedural-world
[pair-provenance]: q-006-regional-thermal-response.md#procedural-pair
[benchmarks]: q-002-ecological-prevalence.md
[oasis]: q-004-point-water-support.md#two-meanings-of-dryness
[current-lookup]: https://github.com/mateicanavra/civ7-modding-tools/blob/fa3dd579f2fc4b3fd8f2b22b7942eac8c26415f1/plugins/mod/map/swooper-physics/src/domain/ecology/modules/biomes/ops/classify-biomes/rules/lookup.ts
[current-config]: https://github.com/mateicanavra/civ7-modding-tools/blob/fa3dd579f2fc4b3fd8f2b22b7942eac8c26415f1/plugins/mod/map/swooper-physics/src/maps/configs/swooper-earthlike.config.json
[seasonal-baseline]: https://github.com/mateicanavra/civ7-modding-tools/blob/fa3dd579f2fc4b3fd8f2b22b7942eac8c26415f1/plugins/mod/map/swooper-physics/src/recipes/standard/stages/hydrology/climate/baseline/steps/climate-baseline/step.ts
[annual-refinement]: https://github.com/mateicanavra/civ7-modding-tools/blob/fa3dd579f2fc4b3fd8f2b22b7942eac8c26415f1/plugins/mod/map/swooper-physics/src/recipes/standard/stages/hydrology/climate/refine/steps/climate-refine/step.ts
[annual-water]: https://github.com/mateicanavra/civ7-modding-tools/blob/fa3dd579f2fc4b3fd8f2b22b7942eac8c26415f1/plugins/mod/map/swooper-physics/src/domain/hydrology/modules/climate/ops/compute-land-water-budget/strategies/pet-aridity/index.ts
[freeze-description]: https://github.com/mateicanavra/civ7-modding-tools/blob/fa3dd579f2fc4b3fd8f2b22b7942eac8c26415f1/plugins/mod/map/swooper-physics/src/domain/hydrology/modules/climate/artifacts/climate-indices.artifact.ts
[freeze-producer]: https://github.com/mateicanavra/civ7-modding-tools/blob/fa3dd579f2fc4b3fd8f2b22b7942eac8c26415f1/plugins/mod/map/swooper-physics/src/domain/hydrology/modules/cryosphere/ops/compute-cryosphere-state/strategies/temperature-thresholds/index.ts
[rainforest-score]: https://github.com/mateicanavra/civ7-modding-tools/blob/fa3dd579f2fc4b3fd8f2b22b7942eac8c26415f1/plugins/mod/map/swooper-physics/src/domain/ecology/modules/features/ops/vegetation-score-rainforest/rules/score.ts
[vegetation-density]: https://github.com/mateicanavra/civ7-modding-tools/blob/fa3dd579f2fc4b3fd8f2b22b7942eac8c26415f1/plugins/mod/map/swooper-physics/src/domain/ecology/modules/biomes/ops/classify-biomes/rules/vegetation.ts
[wet-end-correction]: https://github.com/mateicanavra/civ7-modding-tools/blob/fa3dd579f2fc4b3fd8f2b22b7942eac8c26415f1/docs/projects/native-map-controls/earthlike-climate.md#rejected-pet-calibration-and-next-discriminator
[rainforest-population]: q-002-ecological-prevalence.md#rainforest-habitat-and-feature-occupancy
[mangrove-retention]: q-005-wetland-suitability.md#when-suitability-reserves-the-only-feature-slot
[current-river-choice]: q-002-ecological-prevalence.md#current-cooling-qualification-and-adoption
[whole-land-coverage]: q-002-ecological-prevalence.md#whole-land-habitat-and-feature-coverage
[seasonal-outcomes]: q-002-ecological-prevalence.md#seasonal-thermal-recovery-and-its-limits
[seasonal-evidence]: q-002-ecological-prevalence.md#whole-land-census-and-qualification-coverage
[seasonal-native]: q-002-ecological-prevalence.md#cold-season-admission-in-one-native-world
[seasonal-adoption]: q-002-ecological-prevalence.md#seasonal-native-realization-and-adoption
[seasonal-occurrence]: q-005-wetland-suitability.md#biome-compatibility-changes-cover-without-changing-scores
[adopted-thermal-rule]: https://github.com/mateicanavra/civ7-modding-tools/blob/fe85600bb814cdeb977e36f4e9b5656aa322eb57/plugins/mod/map/swooper-physics/src/domain/ecology/modules/biomes/ops/classify-biomes/rules/temperature.ts
[adopted-thermal-producer]: https://github.com/mateicanavra/civ7-modding-tools/blob/fe85600bb814cdeb977e36f4e9b5656aa322eb57/plugins/mod/map/swooper-physics/src/domain/hydrology/modules/climate/ops/compute-thermal-state/rules/periodic-response.ts
[peel]: https://hess.copernicus.org/articles/11/1633/2007/hess-11-1633-2007.pdf
[fao-zones]: https://www.fao.org/4/ap861e/ap861e00.pdf
[lugo]: https://data.fs.usda.gov/research/pubs/iitf/ja_iitf_1999_lugo002.pdf
[fao-mountains]: https://www.fao.org/4/ad652e/ad652e07.htm

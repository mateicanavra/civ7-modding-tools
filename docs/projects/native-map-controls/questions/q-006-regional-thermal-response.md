---
id: Q-006
title: Regional Thermal Response And Qualification
recordKind: question
disposition: open
sourceRevision: 2a31c96f8d61ee713075974838dfd36a0b008021
locations:
  - id: "hydrology-baseline-climate"
    label: "Baseline Climate"
    relation: "question-owner"
    stage: "hydrology-climate-baseline"
    step: "climate-baseline"
    sourceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/recipes/standard/stages/hydrology/climate/baseline/steps/climate-baseline/config.ts#L84-L111"
  - id: "benchmark-climate-structure"
    label: "Climate-Structure Benchmark"
    relation: "question-owner"
    sourceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/recipes/standard/metrics/studies/benchmarks/earthlike-climate-structure.study.ts#L17-L34"
assessments:
  - claim: "Baseline climate composes seasonal thermal, pressure, circulation, moisture and demand operations within one step."
    state: "supported"
    evidenceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/recipes/standard/stages/hydrology/climate/baseline/steps/climate-baseline/config.ts#L84-L111"
  - claim: "The retained current-source flat-fixture capture establishes broad same-row seasonal P/W contrast and exact input/publication replay; the historical deficit statistic has concentrated training-coordinate support."
    state: "supported"
  - claim: "The retained Standard1018 gain-0 versus diagnostic-gain-6 pair has a modest, spatially organized temperature response, passing mechanism and integrity checks with mixed downstream consequences; its inherited row-variation floor still fails."
    state: "supported"
  - claim: "The evaluated temperature response establishes Earth-temperature accuracy, adequate regional climate across procedural worlds, biome improvement or playable benefit."
    state: "unassessed"
  - claim: "Accepted qualification separates hard invariants, retained Earth diagnostics and procedural outcomes without changing executable targets or selecting a response model."
    state: "supported"
    evidenceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/fffe4e7b31291c75a8b47f2f93080e6a586295fc/docs/projects/native-map-controls/land-thermal-variance.md#prospective-regional-qualification"
verification:
  - kind: source-inspection
    scope: "Inspection confirms the frozen Learning-spine baseline step and its operation bindings, not current moisture-forcing behavior or physical qualification."
    revision: 2a31c96f8d61ee713075974838dfd36a0b008021
    date: '2026-10-11'
    evidenceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/recipes/standard/stages/hydrology/climate/baseline/steps/climate-baseline/config.ts#L84-L111"
  - kind: source-inspection
    scope: "Inspection confirms the climate-structure study's four-case population and separate thermal, biome and integrity targets; no study was rerun."
    revision: 2a31c96f8d61ee713075974838dfd36a0b008021
    date: '2026-10-11'
    evidenceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/recipes/standard/metrics/studies/benchmarks/earthlike-climate-structure.study.ts#L17-L34"
  - kind: source-inspection
    scope: "Inspection confirms the later baseline's final-atmosphere moisture reduction, phase-derived demand and annual publication. The private capture results remain separately reported evidence, not a new experiment executed for this sheet."
    revision: eff77c0f8cd3be5b8a8fd176997918b76848bc44
    date: '2026-10-11'
    evidenceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/eff77c0f8cd3be5b8a8fd176997918b76848bc44/plugins/mod/map/swooper-physics/src/recipes/standard/stages/hydrology/climate/baseline/steps/climate-baseline/step.ts#L339-L460"
  - kind: source-inspection
    scope: "Inspection confirms merged prospective qualification meaning, including preserved historical scores and unwaived targets; no response law, amended threshold or scientific outcome is verified."
    revision: fffe4e7b31291c75a8b47f2f93080e6a586295fc
    date: '2026-10-11'
    evidenceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/fffe4e7b31291c75a8b47f2f93080e6a586295fc/docs/projects/native-map-controls/land-thermal-variance.md#prospective-regional-qualification"
  - kind: source-inspection
    scope: "Inspection confirms exact producer-phase response and the bounded dense-incumbent-plus-seasonal-departure annual proxy. It is not a corrected continuous integral or an editorial execution of the owner tests."
    revision: ae8fc94d790a769fb45c60584e47304f69f53a93
    date: '2026-10-11'
    evidenceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/ae8fc94d790a769fb45c60584e47304f69f53a93/plugins/mod/map/swooper-physics/src/domain/hydrology/modules/climate/ops/compute-thermal-state/contract.ts"
  - kind: source-inspection
    scope: "Inspection confirms the producer-phase candidate's physical limits, separate consumer vintages and zero authored gains. The single-case procedural result is separately retained report evidence, not a fit, cohort or native qualification."
    revision: ae8fc94d790a769fb45c60584e47304f69f53a93
    date: '2026-10-11'
    evidenceHref: "https://github.com/mateicanavra/civ7-modding-tools/blob/ae8fc94d790a769fb45c60584e47304f69f53a93/docs/projects/native-map-controls/land-thermal-variance.md#producer-phase-candidate"
---

# Q-006: Regional Thermal Response And Qualification

What would make temperature differences between places at the same latitude
and height geographically meaningful, rather than simply larger? The aim is
a coherent regional climate that survives different Earthlike worlds and
reaches their water and ecological systems. A wider temperature distribution,
less biome banding or a better aggregate score cannot establish that by itself.

This question sits in the [baseline climate step][baseline-location], where
seasonal thermal, pressure, circulation, moisture and demand operations are
composed before river routing and later ecology. The
[climate-structure benchmark][climate-study] asks a related but different
question: which properties of the resulting maps are acceptable? The
[accepted qualification meaning][qualification] connects these two concerns
without treating an implemented temperature-response law as an established
physical explanation.

## A Modest Response In One Procedural World

One complete Standard Earthlike comparison establishes that the evaluated
seasonal response reaches the actual pipeline, but not that it makes a better
world. Both arms use an 84 x 54 map, map/game seeds 1018/1018, players 0-7 and
the same source and authored inputs. A uses gain zero; B uses a prospectively
fixed **diagnostic gain of 6 degrees C**, not a fitted coefficient or default.
Both complete all 53 recipe steps. The gain scales a dimensionless anomaly;
it does not mean that land warms by six degrees.

| Measurement | Retained Result |
| --- | --- |
| Annual temperature departure, B minus A | RMS 0.1998 degrees C over all 1,744 original land cells; range -0.474 to +0.642 degrees C. 1,642 cells respond; 102 are inactive in every phase. |
| Within-row thermal variation | 0.13276 degrees C in A and 0.21034 in B. This is the existing target statistic, not departure RMS; both remain below its 1 degree C floor. |
| Mechanism and integrity | All 36 source/input holds, nine mechanism checks and 49 existing sample-integrity expectations pass. No phase clipping or aggregate saturation occurs. |

The inherited floor is a [product amplitude heuristic][amplitude-bounds], not
Earth calibration. Both recorded failures remain unchanged.

The retained whole-map sheets show locally organized warmer and cooler areas,
not arbitrary noise, but absolute temperature remains strongly latitude-led.
The signed response, its relationship to the modeled driver and its increased
spread are **one mechanism result**, not three independent improvements.

Downstream effects are mixed: 50 physical-biome, 41 headless-policy biome,
31 feature and 35 resource cell identities change. Rainforest features fall
from 29 to 22 while forest rises from 142 to 149. Two of eight starts move;
freshwater access, regional assignment and minimum spacing remain acceptable,
but global start dispersion falls and score disparity rises within the existing
bounds. Terrain and lake footprints are stable, not every downstream value:
six final elevation cells change by one model unit despite exact initial relief.
Neither changed counts nor passing placement guards demonstrates improvement.

Among the physical-biome changes, 25 tropical cells become temperate humid
through an existing moisture-dependent thermal boundary. This is a separate
[biome-transition meaning question][classifier], not evidence that widespread
drying or a defective thermal producer caused the change. The complete pair
holds initial conditions, not every later classifier input.

Seven existing cohort target families are evaluated on this single case; six
pass in both arms and climate structure fails in both. No larger cohort,
observed-Earth fit, native comparison or gameplay qualification is established.
The candidate remains disabled in authored maps. The open issue is the
geographic and product adequacy of this response, not whether it can produce
a nonzero temperature difference.

## Geographic Information Is Present; Its Temperature Effect Is Open

The separate input-only diagnostic is one fixed Earth-mask fixture, not the
procedural comparison above. It uses the actual `ClimateBaselineStep` on the
original 192 x 94 Gaussian land mask, with zero model height. Comparing land
within one latitude row therefore holds both latitude and height fixed. Its
24 seasonal phases contain broad longitude variation in precipitation `P`
and normalized moisture `W`, not merely a few nonzero extreme values.

Across 76 rows with at least ten original land cells, covering 5,868 of 5,914
land cells, all 1,824 row-phase comparisons have nonzero W spread between the
10th and 90th percentiles. The median spread is 0.34970 for W and 74.4226 for P.
These are equal-cell descriptive summaries, not acceptance thresholds. P is
in model units, not calibrated millimetres of Earth rainfall.

The retained capture passes exact member P/W reduction, actual phase-demand
replay and independent annual P/W/demand publication checks. This supports
**input existence and integrity**, not a qualified regional temperature
response. The [current baseline source][current-baseline] keeps phase-derived
demand distinct from annual publication. Demand depends on temperature and W;
P, normalized W and demand are not three independent empirical predictors.

### A Deficit Summary Is Not A Temperature Law

The historical statistic `X` summarizes warm, illuminated seasonal demand
exceeding precipitation. It uses aligned phase inputs and their original
weights; it is neither actual evapotranspiration nor a temperature correction.
On the current inputs, 109 of the original 196 training coordinates have
warm-active X, compared with all-zero X on those coordinates in the
[closed historical pilot][historical-pilot]. This is not a paired attribution
experiment against every historical input, and it does not reopen that pilot.

Support is concentrated: the largest 20 training receivers account for 81.72%
of centered X squared, while North America contributes 75.84%. Centering uses
the full original-land row, not just the training subset. Broad direct P/W
variation and concentrated X are therefore different findings. Neither
establishes a response sign, coefficient, universal warmer-drier annual
ordering or alignment with observed temperature errors. Explained regional
concentration can be legitimate; unexplained concentration is a limitation,
not something a global score can conceal.

## Three Different Meanings Of Qualification

Earth supplies calibration evidence and diagnostics for a procedural world,
not an obligation to reproduce every observed temperature exactly. The
[qualification decision][qualification] separates three kinds of evidence:

| Evidence | What It Can Establish |
| --- | --- |
| Hard source and numerical controls | Correct authority, aligned arrays, datum, calendar, clipping, consumer vintages, deterministic nonmutation and justified numerical error bounds. A failure cannot be rescued by an attractive map. |
| Retained fixed-Earth diagnostics | Annual, monthly, regional, seasonal, bias and low-relief behavior against the frozen comparator. Scientific tradeoffs remain visible rather than disappearing into a global average. |
| Procedural Earthlike and downstream outcomes | A causal regional response across seeds and sizes, with climate, water, ecology, resource and playability protections, followed by the appropriate native proof. |

The historical scientific screen asks for held improvements greater than
0.0002 degrees C and at most 0.0001 degrees C of collateral worsening in its
supported groups. It is a conservative near-Pareto screen: favor improvement
while allowing almost no worsening elsewhere. These are not validated
product effect-size budgets, Earth observational uncertainties or substitutes
for hard floating-point and solver-equivalence tolerances.

That screen and its original verdicts remain intact. Prospectively, an adverse
scientific result calls for explicit review of the affected population, season,
bias and magnitude alongside reproducible procedural benefit and collateral
results. It is neither an automatic product veto nor permission to ignore
scientific harm. No replacement margin or threshold has been selected.

## Annual And Seasonal Responses Remain Distinct Choices

An annual correction and a phase-aware response make different claims about
when regional contrast matters. The [evaluated candidate][phase-candidate]
chooses the actual seasonal producer phases, without inventing precipitation
or demand between them. On warm, illuminated original land, its modeled
limitation is the positive fraction of potential demand not met by precipitation.
More-limited cells warm relative to the activity-weighted reference for their
row; less-limited cells cool. Less limited does not necessarily mean wet.
Cold or dark phases remain inactive.

This is an empirical temperature proxy, not soil-water storage, actual
evapotranspiration or a conserved heat exchange. The row reference anchors the
existing latitude pattern; it is not heat transported between distant cells.
The diagnostic gain demonstrates this declared response, not its calibration.

Annual publication retains the incumbent model's densely sampled annual
ground-temperature mean and adds weighted departures at the actual producer
phases, subject to thermal bounds. This **bounded annual proxy** is not a
reconstructed continuous corrected annual integral. An exactly inactive cell
retains the incumbent result; active seasonal changes cancelling in the annual
average are a different case.

The distinction is testable without treating spread as geography. Permuting
locations within a row or reversing anomaly signs can preserve a variance
score while destroying the declared physical relationship. A meaningful
response distinguishes those cases, recovers the incumbent when disabled and
preserves deliberately held fields. For a final-atmosphere intervention,
retaining SST2, the sea-surface temperature after the second ocean update,
can be correct rather than evidence of missing propagation. Phase sea-level
temperature for pressure, ground temperature for demand and annual ground
temperature remain different quantities. The early water network receives
baseline phase-derived climate; later ecological demand uses the refined
annual temperature. Neither later river water nor plant-water opportunity
is an upstream predictor of this thermal response.

The current 1-8 degrees C bounds apply to the pooled RMS deviation of land
temperatures from their row means, not the percentile spreads above. These
targets remain unwaived, including the inherited floor failure. An explicit,
evidence-justified prospective product-target amendment is possible, but none
is selected here. The single procedural case adds evidence of organized response
and actual consequences, not Earth temperature accuracy, biome repair,
cross-world adequacy or a completed regional thermal goal. The question remains
whether an explicitly justified regional response produces coherent seasonal
and annual geography with acceptable downstream tradeoffs. Larger spread or
more rainforest alone cannot answer it.

## Evidence Scope And Provenance

### Procedural Pair

The Standard1018 result is dated 2026-10-11. Its physics qualification base is
`ae8fc94d790a769fb45c60584e47304f69f53a93`; both complete arms execute
`ff7b40a7beca64ac2621f6ce07fc5f2f8485a327`, whose only additional source change
is the diagnostic filename repair and its test. Those are distinct source
identities, not a claim of whole-tree equivalence. A's populations were frozen
before B ran. The seven static sheets depict captured numeric grids, not native
game screenshots or an interactive-viewer qualification.

The private reduction and sealed outcome are the retained evidence for these
results. Their SHA-256 custody digests are
`8339c2ba2263ddbbc6fd47a676fed9ac2dbc4e60ca9b8896c994082d4e37997c`
and `31873f9edb9b3ab198b630300b2a2dab712f92e3e24f47ba61ce93ff5cd38237`,
respectively. Source inspection, the producer's mechanical qualification and
this reported procedural comparison remain distinct evidence classes. No model,
fit, scientific score or native operation was rerun to prepare this sheet.

### Separate Input-Only Capture

The reported input-only result is dated 2026-10-11. Its actual clean producer
revision is `eff77c0f8cd3be5b8a8fd176997918b76848bc44`; the recorded climate,
ocean, baseline and Earthlike paths are byte-current against production
`3e43bd59473825bb12e01a842df0cc55cef3e7ae`, not a claim of whole-tree identity.
The original Gaussian mask, flat geometry, source-limited 900/80 configuration,
24 phases, three thermal vintages and two ocean updates were retained.
Two memory-only access overlays expose evidence without changing algorithms;
the capture is not a second climate engine. No fit, observed-temperature
scoring, temperature correction, procedural run or native transfer test is
reported by this diagnostic.

The result and raw reports are retained private evidence, not public
reproduction downloads. Their custody digests identify the reported evidence;
reading this sheet does not independently reproduce it.

| Retained Artifact | SHA-256 |
| --- | --- |
| Result interpretation | `ec278f29b7a98941027ba6baf921700254af35507ac79859283ecf3adc94afe9` |
| Capture receipt | `5c1e7bde7194a8c0081af1efc95d827bf3778ff41755e5921a5bb395564d0624` |
| Seasonal arrays, compressed | `e7552ee33a9eb5d14b7fea26eb58a7344df8c95d667be065d1a5015e9e40bf99` |
| Support analysis | `3a1402ad5eecc9a009d7c929dfef011574af3795497055946e10ab4e0298722d` |

Pipeline navigation remains pinned to `2a31`; the later moisture implementation
is cited separately rather than backdated into that Learning source. The
merged qualification decision is a distinct source inspection, not verification
of response adequacy. [Active thermal ownership][thermal-owner] remains with
the workstream; this sheet is the linked research question, not its task queue.

[baseline-location]: https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/recipes/standard/stages/hydrology/climate/baseline/steps/climate-baseline/config.ts#L84-L111
[climate-study]: https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/recipes/standard/metrics/studies/benchmarks/earthlike-climate-structure.study.ts#L17-L34
[qualification]: https://github.com/mateicanavra/civ7-modding-tools/blob/fffe4e7b31291c75a8b47f2f93080e6a586295fc/docs/projects/native-map-controls/land-thermal-variance.md#prospective-regional-qualification
[current-baseline]: https://github.com/mateicanavra/civ7-modding-tools/blob/eff77c0f8cd3be5b8a8fd176997918b76848bc44/plugins/mod/map/swooper-physics/src/recipes/standard/stages/hydrology/climate/baseline/steps/climate-baseline/step.ts#L339-L460
[historical-pilot]: https://github.com/mateicanavra/civ7-modding-tools/blob/fffe4e7b31291c75a8b47f2f93080e6a586295fc/docs/projects/native-map-controls/annual-land-response-owner-decision.md#completed-deficit-pilot
[phase-candidate]: https://github.com/mateicanavra/civ7-modding-tools/blob/ae8fc94d790a769fb45c60584e47304f69f53a93/docs/projects/native-map-controls/land-thermal-variance.md#producer-phase-candidate
[amplitude-bounds]: https://github.com/mateicanavra/civ7-modding-tools/blob/ae8fc94d790a769fb45c60584e47304f69f53a93/plugins/mod/map/swooper-physics/src/recipes/standard/metrics/studies/benchmarks/earthlike-climate-structure.md#question-and-design
[classifier]: q-007-biome-transition-meaning.md
[thermal-owner]: ../triage.md#active-owners-not-deferred-questions

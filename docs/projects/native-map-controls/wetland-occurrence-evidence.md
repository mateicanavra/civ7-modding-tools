# Wetland Occurrence: Bounded Evidence

The current evidence distinguishes **changed environmental forcing** from
**changed ecological responses**. Source-limited moisture now reaches the
repaired consumers without returning the retired point-water, bog, mangrove or
taiga prerequisites. Six paired cases show how habitat, score and placement
respond. A separate 47-case bank checks the existing requirements. Neither
turns feature counts into abundance targets or establishes physical calibration.

- [Six-case attribution](#six-case-feature-attribution) explains the current
  forcing contrast, including watering-hole reachability and an unobserved bog cause.
- [The 47-case bank](#what-the-47-case-bank-establishes) has no newly failed
  expectation, but both raw banks remain FAIL on the inherited thermal requirement.
- [Earlier point-water](#qualified-source-led-point-water-result),
  [bog](#qualified-bog-consumer-result) and [mangrove](#qualified-mangrove-consumer-result)
  comparisons isolate different consumer changes. Their original observations,
  identities and limits remain intact below.
- The [historical native census](#a-separate-native-occurrence-observation)
  covers a different map. There is no native B comparison for the current integration.

## Source-Limited Moisture With Repaired Consumers

In this comparison, A is the repaired empirical-moisture baseline and B replaces
its moisture forcing with the fixed source-limited owner. Marine source is 900
and reference transport speed 80; the selected parameters, prescribed scenarios,
consumer laws and admission targets are not tuned in response to these counts.
Atmospheric supply comes from initial external marine water. Rainout debits
available stock before residual transport; land and finite inland water do not
supply new atmospheric water in this model. It is not a complete Earth water cycle.

### Four Quantities Through The Pipeline

The [current Hydrology contract][current-hydrology] separates quantities that
can look similar on a colored map but answer different questions:

| Quantity | Meaning | Not A Claim Of |
| --- | --- | --- |
| Precipitation `P` | Unclipped Float32 deposited model water, in empirical rainfall-index equivalents per tile area and representative interval | Measured millimetres per year |
| Normalized wetness `W` | Member `clamp01(P / 200)`, then independently averaged through phase and annual reductions | Measured humidity, soil water, or `clamp01(annual P / 200)` |
| Native rainfall byte | `min(200, round(annual P))`, derived for native projection | A cap on physical forcing or feedback into the water budget |
| Local opportunity `O` | Later non-withdrawal source/contact/access support for plant water, called `L` in the earlier consumer studies | Extra precipitation or a second conserved allocation |

In `hydrology-climate-baseline / climate-baseline`,
[`computeMoistureForcing`][moisture-owner] produces member P and W.
[`computeMoistureAggregate`][moisture-reduction] averages them independently;
phase demand follows that reduction, and annual baseline demand is the seasonal
mean. Averaging after a nonlinear clamp is not equivalent to clamping the average.

`hydrology-hydrography / network` consumes these baseline fields. Dry runoff is
`P * (1 - 0.18) * (1 - 0.22 * W)`. A final wet footprint **replaces** its dry
contribution with `P - D`, using baseline seasonal-mean all-surface demand.
It does not add both contributions. Later refined ecological demand is a
different product and is zero on wet cells; it does not create the earlier basins.

`hydrology-climate-refine / climate-refine` computes post-albedo demand and
the [land-water budget][plant-water-owner]. Atmospheric effective moisture is
`M = P + 0.35 * 255 * W`; local opportunity can raise plant moisture above M.
Opportunity combines available source offers by maximum, not summation, and
does not withdraw or reallocate conserved basin water. On exposed tiles with
O zero in all twelve retained captures, plant moisture equals atmospheric
moisture and plant stress equals atmospheric aridity exactly. On exposed tiles
with positive O, plant moisture never falls below atmospheric moisture and
plant stress never exceeds atmospheric aridity.

The [native rainfall step][native-rainfall] consumes only the byte codec.
A's actual rainfall and humidity are the earlier byte proxies; the comparison
does not invent a float-P history or reinterpret humidity/255 as source-limited W.
The notebook's `2a31` Learning/navigation snapshot predates the new forcing
operation. These scoped current-source links do not silently refresh that spine.

### Six-Case Feature Attribution

The six cases are prescribed, not randomly sampled: Huge is 106 x 66 with ten
players; Standard is 84 x 54 with eight. Map and game seeds equal each listed
seed, with latitude bounds 80/-80. Each entry below is **A to B final headless
feature count**, not a native-game census or an abundance target.

| Family | Huge 1018 | Huge 2024 | Huge 5050 | Standard 1018 | Standard 1 | Standard 42 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Forest | 237 to 224 | 375 to 218 | 319 to 187 | 240 to 142 | 270 to 140 | 152 to 83 |
| Rainforest | 5 to 18 | 4 to 21 | 4 to 11 | 15 to 29 | 12 to 17 | 5 to 12 |
| Taiga | 641 to 491 | 439 to 275 | 393 to 370 | 333 to 274 | 171 to 85 | 374 to 262 |
| Savanna woodland | 28 to 23 | 41 to 19 | 20 to 9 | 39 to 15 | 12 to 2 | 15 to 14 |
| Sagebrush steppe | 100 to 165 | 78 to 312 | 128 to 330 | 43 to 208 | 19 to 309 | 33 to 175 |
| Marsh | 0 to 1 | 4 to 1 | 3 to 1 | 1 to 1 | 2 to 5 | 2 to 3 |
| Tundra bog | 14 to 3 | 14 to 2 | 17 to 7 | 19 to 6 | 8 to 5 | 11 to 6 |
| Mangrove | 28 to 30 | 43 to 59 | 48 to 71 | 21 to 18 | 8 to 6 | 14 to 16 |
| Oasis | 0 to 0 | 0 to 0 | 0 to 0 | 0 to 0 | 0 to 0 | 0 to 0 |
| Watering hole | 0 to 0 | 0 to 0 | 0 to 1 | 0 to 9 | 0 to 2 | 0 to 0 |

Across all 120 arm/family funnels, recorded plan counts, projection attempts,
final counts and readback at planned coordinates agree. There are no recorded
out-of-gate plans, projection rejections, missing planned observations or
same-stage peer losses. Earlier occupancy remains consequential; a floodplain
or mangrove can occupy a site before vegetation is considered.

The attribution reads retained final scores rather than recomputing them.
Eligibility gates are inferred from captured exposure, terrain, biome and prior
intent plus inspected source. Transient hydromorphic/intertidal masks and
individual factor products were not retained. First-blocker transitions therefore
identify bounded explanations, not unique counterfactual causes.

**Point water.** A has no compatible-flat oasis site with both positive local
opportunity and aridity above 0.60. B has such overlap in 5, 84, 48, 42, 115 and
19 cells, in table order, but its maximum oasis scores are only 0.026405,
0.162630, 0.209933, 0.222416, 0.271177 and 0.029535. Watering holes cross the
unchanged 0.42 floor in three B maps. [Q-004][point-water] separates this
reachability result from ecological adequacy; neither the law nor its floor changes.

**Wetlands and vegetation.** Forest reductions primarily encounter changed
categorical habitat; every flat habitat-valid forest score clears its held
0.04 floor. Rainforest's habitat-valid population increases in all six cases,
and all such flat scores clear 0.29, although earlier occupancy still removes
opportunity. Taiga retains its annual-energy repair and atmospheric-water
envelope, with no new frost requirement. Bog still has no generic fertility
factor; of 49 former bog plans first blocked by a zero B score, 48 have
`M <= 130.9`, sufficient to zero the unchanged water ramp. Standard 42 cell 255
has M 165.906296 and a zero score; its exact substrate/factor cause remains
unobserved. [Q-005][wetland-question] retains that uncertainty and the distinct
marsh, bog and mangrove hypotheses. Their counts do not rank habitat quality.

### What The 47-Case Bank Establishes

The unchanged Earthlike bank comprises 16 studies, 47 unique prescribed
scenarios, 20 target IDs and 3,894 expectation occurrences. It is broader than
the six-case attribution but retains ordinary metrics and provenance, not
another 47-case collection of rich ecology and water fields.

| Paired expectation result | Occurrences |
| --- | ---: |
| Pass in A and B | 3,893 |
| Newly failed in B | 0 |
| Failed in A and B | 1 |
| Resolved in B | 0 |

**Both raw banks remain FAIL**: fifteen studies pass and one climate study
fails in each arm. All 840 initial expectation occurrences per arm recur
identically in the full bank. No requirement is waived. The inherited
within-row temperature-variation floor remains at least 1 degree C; the
reported cohort observation changes from 0.1390440682965476 to
0.13276011573193755 degrees C. An inherited failure is not an unchanged value
or a repaired thermal model.

All seven current orogeny requirements pass in both arms. [Q-003][relief-question]
explains the separately adopted regional-span policy; the frozen historical
rainfall candidate retains its original refusal. Zero new failures supports
bounded compatibility with the admitted bank, not an all-climate pass, Earth
rainfall calibration or general scoring vindication.

### Water And Thermal Limits

Captured upstream fields agree, including pre-refinement temperature. Hidden
seasonal/member thermal, pressure, wind and current equality is instead a
source/configuration/input-boundary argument, not an observation recoverable
from annual means. Downstream fields are allowed to respond to changed forcing;
the older consumer-only comparisons' forty-one-field holds do not transfer here.

Refined temperature changes occur only on below-zero retained-topography land.
Four per-map within-row deviations decline and two rise. The source-consistent
explanation is the unchanged precipitation-sensitive snow/ice feedback, not
a new thermal fit; individual iteration traces are unobserved. Warm-land
regional thermal structure is not repaired. Native codec saturation is a
separate representation diagnostic, not evidence that physical P should be clipped.

Water accounting remains explicit about unresolved supply: four B maps retain
positive shoreline-quantization terms, with a maximum of 112.68602329508147 in
Standard 1. Closure within the existing rounding guard does not mean unresolved
supply is zero. A wet footprint with negative local `P - D` can be supported
by imported network flow; it is not automatically an invalid lake. River
counts can also hold while locations change. None of these observations
calibrates hydroperiod, salinity, groundwater or ecological patch extent.

### Executed, Merged And Native Identities

- Executed A: `a19bede35a2c963a3ad45ba299b7261e9ebc814e`, tree
  `40a1d719c9bf0ec2e3e2fcad9eea0dcd86e07042`, plus the explicit two-file
  measurement-only overlay, SHA-256
  `a2452d2f42607db97601df8021425d45368e0936c3c4597599fdeaf18fd86d67`.
  This is not an unmodified-A execution.
- Executed B: `3e43bd59473825bb12e01a842df0cc55cef3e7ae`, tree
  `04918ea4efa9c58fc32b3dc3cba8def424850f61`.
- Merged source: `d17abf6f54b018600b2d13c139e8be485e2aa732`, with exactly the
  executed B tree. Portable [source links][moisture-owner] use this merged revision.
- Accepted documentation: `877fdb628de3b9045afa711b9d92247dd4544411`, merged as
  `eff77c0f8cd3be5b8a8fd176997918b76848bc44`; both have tree
  `913f943249d21410f9865a2fe6106508bb6d7553`. This is not B's execution revision.

The matched execution uses Bun 1.3.14 and Node 22.22.0, matched lock/resource
inputs, and official resources `9f6b93e129d47faf96ed6814f652560e7b7573d0`.
The source-limited kernel is bound by SHA-256
`c549b9374e64097ea07fea4c44264cf2780e982c63c0fdb9ce68a31ea0f17672`.
The reports describe 447 focused tests and 188 successful repository checks;
these are owner-reported qualification, not tests rerun by this editorial summary.

The source-adoption receipt records the merged source independently of native
qualification. **There is no native B comparison:** the closed native window
stopped after A's live-world identity changed, before B was built, installed or
launched. That is neither B-native success nor B-native failure. The earlier
qualified installed build was verified unchanged at closure. Source adoption,
headless qualification and native player-path acceptance are separate claims.

## Original Case And Source Identity

Both cases use Swooper Earthlike. Standard1 is 84 x 54 with map/game seeds 1/1
and eight major players. Huge2 is 106 x 66 with seeds 2/2 and ten major players.
They are two selected retained cases, not a random prevalence sample.

Three revisions have different roles:

- Original retained receipts: `5f82b5f1f39040e83d909793eb296fc526420511`.
- Runtime source bridge: `22e3976f276fd9a199635dd28e6e4d35777fb629`.
- Source inspected by this diagnostic: `2a31c96f8d61ee713075974838dfd36a0b008021`.

The source comparisons are empty across both bridges for definition domains,
recipe stages, Earthlike configuration, MapGen-core source and map-policy source.
The original receipts retain their original revision. Generated dependency
binaries are **not** asserted identical: installed bytes differ from historical
receipt bytes. The diagnostic instead records current runtime hashes and exact
agreement of the complete five-family score arrays and wetland planner output.

## What Was Checked

Receipt SHA-256 checks bind the consumed capture, raw, sample, artifact and
retained replay files. Raw observations agree with independently retained public
headless terrain, biome, feature and water observations. Here, "public" describes
the capture interface, not internet publication or live-game readback. The
coordinator independently checked 187 retained, source and runtime hash bindings.

The diagnostic reconstructs feature substrate from retained inputs; that result
is not an originally retained substrate step-return artifact. Each of the five
existing scoring operations reproduces every retained score element. The
wetland planner reproduces the retained intent, and the final named headless
features agree with those intents. Feature identities and compatibility come
from captured metadata rather than guessed numeric IDs.

The original planner seed was not retained. Diagnostic seed 0 is explicit; the
inspected strategy ignores that input, so it supplies no substituted random
draw. Two passes made 28 owner-operation replays in total. New recipe generation,
build and native calls were all zero. The additional support control below has
separate custody and four additional owner-operation replays.

## Baseline Point-Water Support

At inspected baseline `2a31c96f`, the [substrate rule][substrate] requires exposed
lowland within a radius-one
classified-river neighborhood, while excluding the broader floodplain substrate
mask. That proxy uses radius two and discharge at least 96 in the inspected
Earthlike configuration. These are authored neighborhood and discharge values,
not calibrated physical distances or flooding frequencies. This isolated-water
mask and the direct warmth response below are retired in the later source-led
implementation; the findings remain evidence about the original inputs and law.

| Measurement | Standard1 | Huge2 |
| --- | ---: | ---: |
| Lowland radius-one river precursors | 1,145 | 1,878 |
| Precursors also in floodplain substrate | 1,145 | 1,878 |
| Remaining isolated-waterpoint habitat | 0 | 0 |
| Minimum classified-river discharge | 173.0837 | 179.9637 |
| Actual prior floodplain feature occupancy | 95 | 244 |

Every classified river exceeds the discharge floor in these inputs. Its
radius-one neighborhood is contained in the radius-two neighborhood, so every
point-water precursor is also excluded by the floodplain proxy. Oasis and
watering-hole therefore have no habitat support before their individual climate
scores can matter. This establishes conditional support collapse, not universal
impossibility for every seed or configuration.

Actual prior floodplain features occupy far fewer tiles. Removing prior feature
occupancy is not the same as changing the substrate exclusion. The selected
point-water witnesses also fail dryness factors; their first mask loss does
not prove that deleting the mask veto alone would produce either feature.

### Independent Limits Beyond The Mask

A separate scalar comparison uses the retained land temperatures and the
[configured oasis response][oasis]. Standard1 and Huge2 have maximum annual
land temperatures of approximately 25.783157 and 25.802839 degrees C. With an
authored warmth ramp from 20 to 38 degrees C, the largest warmth factors are
approximately 0.321287 and 0.322380. Each other factor is at most one, so warmth
alone caps the product below the shared 0.42 admission floor. Approximately
27.56 degrees C is necessary even with perfect remaining factors.

This is an additional baseline-pair obstacle, independent of the empty
point-water mask. It does not prove all-seed impossibility, establish a physical
temperature requirement for oases or justify heating the climate model to
satisfy the feature scorer.

A separate diagnostic enables the habitat mask on every cell while holding
actual climate, plant-water, fertility, land identity and compiled configuration
fixed. Its four calls to the actual oasis and watering-hole scorers yield:

| Family / case | Positive land scores | Maximum score | Score >= 0.42 |
| --- | ---: | ---: | ---: |
| Oasis / Standard1 | 0 | 0 | 0 |
| Oasis / Huge2 | 0 | 0 | 0 |
| Watering hole / Standard1 | 6 | 0.0024374612 | 0 |
| Watering hole / Huge2 | 79 | 0.0095032779 | 0 |

This overpermissive control proves that mask-only intervention cannot admit
either family in the retained pair. It does not propose a physical source mask
or identify the appropriate response law. It was executed at
`889c4b79c41432ea41aa75d2c55fb2ac190e3813`, with both scorer subtrees and the
shared scalar helper verified unchanged from inspected `2a31c96f`. Original
raw inputs and compiled configurations remain bound to the original receipts.
The control made four additional owner-operation replays, zero generation calls
and zero native calls. These results and the temperature comparison have their
own program/result hashes below; they are not attributed to the older 28-call
diagnostic.

## Original Other-Family Observations

The [score-layers step][scores] already calls five separate family scorers.
Earthlike's [wetland planner][planner] uses a common minimum score of 0.42.
The count above that floor below is a diagnostic filter, not the planner's
execution order: the planner evaluates flat/free sites, compatible-family
selection and then the winning score's floor.

| Family / case | Habitat | Positive score | Score >= 0.42 | Final headless feature |
| --- | ---: | ---: | ---: | ---: |
| Marsh / Standard1 | 1,442 | 447 | 3 | 2 |
| Marsh / Huge2 | 2,432 | 569 | 2 | 2 |
| Tundra bog / Standard1 | 1,442 | 14 | 2 | 2 |
| Tundra bog / Huge2 | 2,432 | 36 | 1 | 1 |
| Mangrove / Standard1 | 94 | 45 | 0 | 0 |
| Mangrove / Huge2 | 493 | 190 | 0 | 0 |

One score-admitted Standard marsh candidate is a hill. No otherwise
score-admitted wetland in either case is lost to prior occupancy, arbitration or
final headless projection. Those filters still remove some merely positive
opportunities; they are not globally irrelevant.

Marsh maxima are approximately 0.488327 and 0.429449. Bog has positive scores
on only 14 and 36 sites after its coupled water, cold and freeze factors.
The best mangrove scores, 0.369707 and 0.373966, occur on legal, unoccupied flat
tropical coast. Their warmth/fertility/aridity products are approximately
`0.6364 * 0.5809 * 1` and `0.6414 * 0.5830 * 1`, both below 0.42. Rainforest
later occupies those unclaimed sites; it did not displace a qualifying mangrove.

The marsh and bog observations refute universal headless absence in this pair.
They do not establish adequate frequency, a calibrated meaning for 0.42 or
physical correctness of the score functions. Positive habitat, positive score,
legal/free opportunity and admitted placement have different denominators.

## Qualified Source-Led Point-Water Result

The [merged qualified outcome][qualified] establishes source-consumer coherence,
not restored generated occurrence. Hydrology publishes its existing local
source opportunity `L` directly. Oasis and watering-hole suitability becomes
`drySuit(A) * L / (L + D)` for positive source, otherwise zero, where `A` is
atmospheric aridity and `D` is published post-albedo potential demand. Direct
warmth, whole-tile plant-moisture and fertility multipliers and the isolated-water
mask are retired. Family dryness ramps and the 0.42 admission floor are unchanged.

Producer-consistent moderate-temperature fixtures admit oasis on DESERT and
watering-hole on PLAINS through the actual classifier, scorers and legal
planner. Ordinary imported flow and finite-body contact supply positive cases;
source absence, inaccessible or marine donors, incompatible biome or terrain
and actual prior occupancy retain their exclusions. The owner reports 45
focused tests and 1,830 assertions. This supports a bounded consumer law, not a
calibrated physical model or an occurrence target.

### Separate Identities And Paired Holds

The later qualification uses different evidence from the original diagnostic:

- Retained Standard 1/1 and Huge 2/2 comparator source:
  `ccb92fbc585ab0eddd1d2faa3a6b71c5aaa9179f`.
- Replay, four recipe captures and near-miss diagnostic runtime:
  `7b20d0b9da117bdaecb73a39f5a085d2964810da`.
- Qualified documentation head: `2a41b9c3d2d9d19c9c2e095636538c8b6e982368`.
- Merged report and inspected source: `09e8c9a87fba9c5078d20134ad1c8e04a858bfbb`.

Repeated case names and seeds do not make these the original `5f82b5f1`
captures. The paired retained replay reports unchanged pre-existing climate,
actual post-albedo demand, classifier, unrelated score layers and wetland and
vegetation intent. Five dependency-owner source trees match, but compiled
dependency bytes are not asserted exact: one SDK grid-wrapper entry differs
and its old bytes were unavailable. No cause or whole-SDK equivalence is inferred.

Four predeclared recipe captures pass integrity: Standard 1/1, Huge 2/2,
Standard 3/3 and Huge 4/4. The first two have incumbent comparisons that preserve
pre-existing public model fields, physical elevation/lake/river projection,
final feature cells, resources and starts. The other two are candidate variation
captures, not paired comparisons. **All four have zero oasis and watering-hole
attempts and features.**

### Conditional Dryness Ceilings

The near-miss diagnostic examines each family's native-biome-compatible,
captured-flat, observed-earlier-free population. "Earlier" means floodplain,
ice or reef occupancy, not later vegetation. The following are population
maxima, not all-land maxima or a claim of exact final planner legality.

| World / map and game seeds | Oasis max dryness factor | Watering-hole max dryness factor | Watering-hole max score |
| --- | ---: | ---: | ---: |
| Standard / 1/1 | 0 | 0.03881 | 0.01848 |
| Huge / 2/2 | 0 | 0.07702 | 0.04900 |
| Standard / 3/3 | 0 | 0.01505 | 0.00609 |
| Huge / 4/4 | 0 | 0.09005 | 0.02752 |

At fixed climate and class, source support is at most one, so even unlimited
source cannot lift these populations to 0.42. Increasing source can change
plant-responsive classification; the bound is not a source-tuning prescription.
Biome moisture uses plant-water indices, whereas family dryness uses
demand-relative atmospheric aridity. Their different meanings identify an
open ecological interpretation, not a demonstrated rainfall, thermal or
classification defect and not authority for new coefficients.

The diagnostic recovers a unique land humidity byte from captured atmospheric
moisture and rainfall on all 7,989 exposed-land cells, then calls the actual
unchanged post-albedo demand and budget owners. It closes all four captures'
published aridity, local opportunity and plant-water fields. For the paired
cases, recovered humidity and demand exactly match authentic retained inputs,
and observed prior occupancy agrees with the exact retained prior mask.
The variation cases have no such exact prior-intent validation. This is a
recovered-input diagnostic, not originally captured demand; earlier hydraulic
demand and water-cell humidity are outside that recovery claim.

The new retained replay reports 56 owner-operation calls. The separate margins
diagnostic reads four existing captures, compiles four configurations and makes
16 owner-operation calls, with zero generation, build or native calls. Those
counts are separate from the original diagnostic's 28 calls and its four-call
support control; the four recipe captures are a distinct qualification activity.
The editorial summary does not rerun any of them.

Reported full suites retain the thermal aggregate failure alongside 1,388
definition passes, with 371 realization and 412 Studio passes; no expectation
was weakened. There is no fresh native placement or installation proof.
Annual opportunity does not establish seasonal liquid-water survival,
groundwater, salinity, permanence or patch extent. Generated scarcity and
ecological adequacy remain open in [Q-004][point-water]; [Q-005][wetland-question]
remains a separate family-response/admission question.

### Separate Dry-Habitat Interpretation Check

A bounded 40-row contract trace at source
`2a41b9c3d2d9d19c9c2e095636538c8b6e982368` reuses the four captures above.
The four low-aridity DESERT witnesses follow the absolute plant-moisture bucket;
each world's highest-aridity land witness is polar/snow, not eligible dryland.
Source-only contrasts preserve ambient climate while altering plant fields
and sometimes native-compatible class. Existing producer-consistent positive
local regimes still admit oasis and watering hole. The trace identifies no
specific contradiction between these distinct meanings, but does not establish
generated-world reachability or validate the absolute moisture cutoff of 90,
family ramps or 0.42 floor. Empirical response scales and Earthlike dry-regime
coverage remain open.

This separate diagnostic reports 59 owner-operation calls, 24 scalar source
contrasts and zero generation, build or native calls. Capture contrasts are
scalar handoff equations, not rerouted Hydrology or whole-world experiments;
local positive fixtures have separately labeled reduced point-family planner
intent. Their scope does not imply final native legality. These are privately
retained report findings, not an added verification or a new run by this summary.

## Qualified Bog-Consumer Result

The [merged bog-consumer outcome][bog-qualified] removes only the generic
fertility prerequisite from tundra-bog suitability. Hydromorphic support,
atmospheric water, cold/freeze curves, native compatibility, flat/free admission,
planner ordering and the shared 0.42 floor remain unchanged. In that comparison,
marsh, mangrove, other fertility consumers and the pedology producer are not
retuned. This is a supported consumer correction with bounded downstream
qualification, not whole-wetland scientific validation.

### Retained Replay And Complete Pairs

The qualification has its own producer identities:

- Actual production runtime: `be9b403bdc2d586c990c56dfb543b8506f849e6c`.
- Accepted source/documentation head: `aa9b2006a3c0f2a2d2eae8a676fefa57061f23f7`.
- Merged report and inspected source: `4ae7b311a1e259449001b96b683860c5b682301e`.
- Corrected report labels: `7080b22891f2b77297132fa7699fd42fc5fdb4a7`.

The label correction changes documentation only, not the executed runtime or
its captures.

The retained production replay uses the `ccb92fbc` raw captures identified in
the point-water qualification, not the original `5f82b5f1` observations. Actual
climate-refinement, score, wetland and vegetation owners reproduce the sealed
bog-only discriminator: bog intent changes from 2 to 8 and 1 to 6, while taiga
intent changes from 177 to 171 and 298 to 294. No vegetation is added and no
other vegetation family changes. Unrelated scores and upstream physical,
climate and classifier inputs hold. The successful replay reports two compiles,
eight step calls and 52 owner-operation calls, with no generation, resource/start
owner calls or native execution.

That raw evidence lacks foundation inputs and the adapter/random-state lifetime
needed to resume resources and starts. The retained replay therefore stops at
vegetation; it does not fabricate a complete downstream continuation. Exactly
two fresh complete public recipe captures instead compare Standard 1/1 and
Huge 2/2 against the sealed `7b20d0b9` point-water captures:

| Completed recipe outcome | Standard 1/1 | Huge 2/2 |
| --- | ---: | ---: |
| Bog features | 2 to 8 | 1 to 6 |
| Taiga features | 177 to 171 | 298 to 294 |
| New bogs on previously bare cells | 0 | 1 |
| Clay placements | 4 to 6 | 2 to 6 |

Both unchanged integrity targets pass, forty-nine expectations per case. All
forty-one public model fields and their typed-array contracts, physical terrain,
biome, water, elevation, lakes and rivers remain exact. Actual feature changes
are six taiga-to-bog cells in Standard and four taiga-to-bog plus one bare-to-bog
cell in Huge, with no other changes or feature refusals. The full public
starts/fairness publication, resource support and natural wonders remain exact.
The coordinator's data-only review checked seventeen fresh-pair file bindings
and actual previous/current snapshot arrays; this summary does not repeat that
audit or execute the recipe.

### Resource Consequences Are Not Distribution Success

Clay gains follow existing final-feature compatibility, not added supply or
retuned habitat, ranges, targets or spacing. Both cases reach the existing
minimum six but remain two short of target eight. Standard replaces one former
Clay site with three newly eligible bog sites; Huge adds four bog sites. No
other final resource placements change. Some legal-site counts change without
changing placement: Wild Game gains candidates, while Huge Jade and Salt each
lose one legal site but retain their eligible sites and placements.

The [resource distribution measure][resource-distribution] divides each band's
share of placed land resources by its share of exposed land, then records the
maximum defined band ratio. One means equal shares, not an independently
justified ecological or gameplay target.

| Maximum latitude-band resource overrepresentation | Before | After |
| --- | ---: | ---: |
| Standard 1/1 | 1.58491 | 2.10335 |
| Huge 2/2 | 2.26540 | 4.43440 |

The after-change maximum occurs in Standard's 70 to 80 degree band and Huge's
-80 to -65 degree band. Those bands contain twenty-four and six land tiles,
with placed resources changing from four to six and one to two, respectively.
Standard's before-change maximum is near the equator
(-5 to 10 degrees), so its maximum shifts between bands rather than tracking one
fixed polar band. The northern polar band itself rises from 1.41808 to 2.10335.
These observations record increased polar concentration, not evidence of general
distribution improvement. Both candidates retain four-tile Clay spacing; changed
resource sites lie outside founder support zones, consistent with exact support
outputs. Remaining non-Clay authored-range deficits persist. Resource legality,
supply calibration and spatial distribution are separate claims, and neither
deficits nor concentration are waived by the consumer correction.

### Custody And Scientific Limits

The retained replay preserves the explicit local grid-wrapper byte exception
described above. The fresh pair has exact package source trees and no differences
among its 102 comparable compiled pins, with additional compiled extensions
disclosed separately. That fresh comparison does not retroactively remove the
retained exception or establish whole-SDK or whole-build byte identity.

Hydromorphic support covers 1,442/1,506 and 2,432/2,501 exposed-land cells
(95.75% and 97.24%) in the retained pair. This is broad eligibility, not measured
waterlogging. All eleven new bog witnesses are raw tundra/native TUNDRA,
thermally polar, with annual temperature -12.893 to -9.530 degrees C and
`permafrost01 = 1`. Annual fields establish neither seasonal active-layer thaw
nor its absence, peat formation or hydroperiod. They do not justify an
impossible-bog conclusion, a new frost veto or validation of the remaining
response.

The owner reports thirty focused tests / 595 assertions, 1,390 definition
passes with the exact known thermal aggregate failure, 371 realization passes,
412 Studio passes and 188 successful pre-push checks. No expectation or shared
floor was weakened. No new model run, capture or test was performed by this
editorial summary, and there is no fresh native-game proof. [Q-005][wetland-question]
remains open for substrate, seasonality, marsh/mangrove response and shared
admission adequacy.

## Qualified Mangrove-Consumer Result

The [merged mangrove outcome][mangrove-qualified] removes generic Pedology
fertility as an occurrence multiplier, along with its direct input, binding and
authored control. Warmth, low aridity, exposed marine-low-shore support, flatness,
official compatibility, prior occupancy, arbitration and admission policy hold.
Earthlike's floor stays 0.42; all three map configurations retire the dead control.
The fertility producer, marsh and bog are unchanged by this correction.

This is not the bog argument applied indiscriminately. Nutrients can affect
mangrove growth and establishment; the mixed growth composite is not measured
nutrient supply or evidence of a necessary occurrence condition. Removing the
multiplier neither models root-zone chemistry nor validates the unchanged
empirical warmth/aridity curves. [Q-005][wetland-question] supplies the Earth
context and keeps habitat and admission adequacy open.

### Source Identities And Local Controls

- Pre-implementation discriminator source:
  `3ae89fefad8fee376d69ad94d4624e34f134f398`.
- Actual production runtime: `4829c718eb1dfe5cddd57bb3b32c2208de184fbc`.
- Accepted result documentation: `a602477b62a547fe398164090d93f072612558e9`.
- Merged source and report: `22438584f152a420901c0fa0d0e90f175a815f32`.
- Complete-pair comparator: bog runtime
  `be9b403bdc2d586c990c56dfb543b8506f849e6c`.

The merged tree is identical to the accepted documentation tree; the latter
changes documentation only after the runtime. None is an installation or
fresh native-observation identity.

The retained discriminator first reproduces the sealed bog runtime, then
substitutes only a fertility-free mangrove score. It reports two compiles,
eight recipe-step calls and 54 owner-operation calls, plus two private candidate
score evaluations. The selected contrast admits eight and thirty-three mangrove
intentions and removes exactly as many later rainforest intentions. Other
wetland intentions hold. These are all eight and thirty-three currently legal,
flat, free marine-low-shore opportunities, not all 94 and 493 substrate cells.
The eligible retained cohort contains no climatic negative; it cannot establish
appropriate coastal coverage or all-seed occurrence.

Seventeen local regimes exercise the actual demand, water-budget, cryosphere,
Pedology, classifier, substrate, family-score and planner chain. Their annual
temperatures and 5-by-3 geometry are admitted local boundaries, not new generated
climate or reachable-world evidence. Humidity comes from the actual precipitation
helper. There are 241 input/configuration immutability checks, with source and
dependencies unchanged during the reported run.

At 24 degrees C, rainfall 200, produced humidity 255 and sediment 1, fertility
is 0.797797; the incumbent score is 0.381057, below 0.42, while the selected score
is 0.5. Sediment 0.2 gives fertility 0.628377 and incumbent score 0.281398, but
the same selected score. A warmer incumbent-positive case stays positive.
Moderate-rain cases can exceed the new score floor but fail actual native-biome
compatibility. Cold, dry, inland, finite-water-only, high-shore and water cases
reject. Nonflat, occupied and artificial-incompatibility cases are separately
identified planner-boundary guards, not generated-terrain or floodplain facts.
The controls discriminate modeled gates, not real seedling establishment.

### Production Replay And Complete Pairs

Production retained replay reports two compiles, eight actual recipe steps and
50 owner-operation calls. It exactly closes the selected mangrove scores,
wetland intentions and subsequent vegetation intentions; other family scores,
climate/cryosphere and authentic retained inputs hold. It makes zero generation,
resource/start-owner or native calls. As with the bog replay, missing foundation
inputs and adapter/random-state lifetime prevent a complete downstream
continuation from those raw inputs.

Exactly two complete public headless recipes instead compare Standard 1/1 and
Huge 2/2 with the sealed bog captures. Both integrity targets pass forty-nine
expectations each. All forty-one public model fields, their typed-array
contracts and physical terrain, biome, elevation, water, rivers and lakes hold.
Final feature changes are precisely eight and thirty-three rainforest-to-mangrove
cells, without feature or resource refusals. Marsh remains 2/2 and bog 8/6;
discovery and parity checks hold. Resource and start outputs are not exact.

| Completed recipe outcome | Standard 1/1 | Huge 2/2 |
| --- | ---: | ---: |
| Mangrove features | 0 to 8 | 0 to 33 |
| Rainforest features | 20 to 12 | 55 to 22 |
| Changed resource cells | 23 | 16 |
| Total placed resources | 223 to 224 | 240 to 246 |
| Clay placements | 6 to 7 | 6 to 8 |
| Kaolin placements | 0 to 1 | 0 to 2 |
| Rice placements | 0 to 1 | 0 to 6 |
| Mangos placed | 2 to 1 | 5 to 1 |
| Wool placements | 7 to 6 | Unchanged |
| Players with changed seat coordinates | 4 of 8 | 5 of 10 |
| Worst published start-score gap | 0.091495 to 0.058800 | 0.082232 to 0.082232 |
| Minimum start spacing, tiles | 11 to 11 | 10 to 9 |
| Global start-dispersion index | 1.011266 to 1.065929 | 0.866291 to 0.790411 |
| Radius-four resource support per start | 4-6 to 3-5 | 2-4 to 3-5 |

### Resource Opportunity And Seating Tradeoffs

Resource habitat masks and target/range/spacing controls hold. Official feature
legality nevertheless changes the available sites: new mangrove admits more
Clay, Kaolin and Rice while removing rainforest-only Mango opportunity. Huge
Mango eligible sites fall from twenty-six to zero. Its sole Mango, at plot 3654,
is a new `region-minimum` intent under the unchanged legal-only regional-minimum
exception, not player support or persistence of the same earlier placement.
The recorded target shortfall rises from zero to four. Increased total resource
count therefore does not mean every resource's supply improved.

All eight and ten players remain fully seated on legal dry land with modeled
nearby-water opportunity, without fallback, imputation or region relaxation.
This headless "freshwater" field is a soft preference, not native founding-bonus
proof; the [placement interpretation][freshwater-meaning] keeps those meanings
separate. The radius-four support
settings and empty shortfall records hold; realized support counts do not.
Standard changes from four-to-six resources per start to three-to-five; Huge
changes from two-to-four to three-to-five. Both candidates have a gap of two
and no support shortfall. Natural-wonder placements remain exact.

The [start-dispersion index][start-spread] divides mean nearest-neighbor start
spacing by the square root of land area per start. Huge's decline means less
spread relative to that reference; its worst start-score gap is unchanged.
The existing dispersion requirement is a cohort mean, not a per-map floor.
The two-case candidate mean is 0.928170, above 0.85. Existing placement and
resource-distribution requirements pass before and after on this two-map pair,
not a newly qualified full stable-seed bank. No target or physical field was
changed to offset the resource or seating consequences.

### Dependency Custody And Remaining Limits

The complete mangrove pair retains exact source trees for five dependency
packages, but one of 102 comparable compiled pins differs:
`packages/mapgen-core/dist/lib/grid/index.js`. Six additional CJS/type files
were not pinned by the prior bog captures. This explicit grid-entrypoint bridge
is not the earlier bog fresh pair's zero-difference comparison, and does not
establish whole-SDK or whole-build byte identity. Exact observed model/physical
fields support bounded downstream attribution, not an inferred explanation of
that binary difference.

Marine low shore is still only a coarse proxy. Tidal flooding, salinity,
shelter, waves, propagule arrival and recruitment remain unmodeled. Annual
ground temperature does not measure damaging cold extremes or leaf temperature.
The unbound bedrock-age input and its retained normalization weight remain an
open Pedology producer question, not a proven defect or a repair in this unit.

The owner reports 48 focused tests with 803 assertions, all 56 definition
Habitat rules and typing/build checks, plus 11 realization loader tests with
70 assertions across all three generated map bundles. Annual within-row
temperature variation remains 0.178088 and 0.129471 degrees C, still below the
unchanged one-degree requirement; this existing failure is not waived by the
consumer correction. These are reported qualification results, not executions
by this editorial summary. Merge, headless legality and local controls do not
establish installation, fresh native acceptance or physical calibration.

## A Separate Native Occurrence Observation

An independently retained native readback covers all 6,996 unique plots of a
different Huge map, 106 x 66, at turn one. Its map/game seed is 1777016547 and
its candidate runtime revision is `ccb92fbc585ab0eddd1d2faa3a6b71c5aaa9179f`.
The census contains zero oasis, zero watering-hole, four marsh, two tundra-bog
and zero mangrove features. For context, it also contains 576 taiga and 37
rainforest features. These are counts from that recorded turn, not the current
live game state.

The receipt binds eight complete grid captures, the original and continuation
receipts, and an official generated feature catalog by SHA-256. Turn and map
identity agree before and after the reads, with no autoplay during collection.
Feature names and terrain/biome compatibility come from that bound catalog,
not a new native `GameInfo` query. None of these seven observed feature families
violates the bound catalog's terrain or biome rules.

This is occurrence evidence, not a reconstruction of substrate, scores, river
support or prior occupancy. It cannot transfer the retained pair's causal
explanation to this map, establish a global prevalence rate or validate habitat
physics. The census reducer only reads existing captures; it makes no new
generation, native or owner-operation replay calls.

## Evidence Custody And Limits

This summary was curated on 2026-10-10 from privately retained analysis and
receipts. The raw captures, report and diagnostic program are not published
with this document. Consequently, the public summary is not independently
reproducible from this file alone. Content hashes identify the exact inspected
artifacts; they are identity checks, not substitutes for access or scientific
validation.

The current moisture comparison has separate, privately retained custody:

| Retained artifact | SHA-256 |
| --- | --- |
| Six-case decision manifest | `60de5c69c8f8185e2427485e9c3687785a22418d1205e6808d2d684718b7f458` |
| Six-case ecology attribution | `7c932a22133fa3a7a8dcf177ba3afcffd5ff728ef676e90d057c7367d6c0f932` |
| Six-case thermal metrics | `3e7ae5a4a510c0f9e5bd70b23629d16fbd4d177b94491bde30b1295eb0659369` |
| Six-case water attribution | `1ddd45ec138dce74fc40c659efd2440f2da55f5cb9418f05a68808e4f58a8614` |
| Water-attribution manifest | `e9e0ea6ea6f44ffdbe129fa2ff8bc5ce24a34812d1a91adb973c34a3c5c5ab66` |
| Full-bank decision manifest | `d0505b84f95d7acffc886936435f1462ea68eb07fe4973e40672f3470d031c93` |
| Full-bank paired comparison | `48e78e78f31036bb4ca1ae25f9d67e8fa11618460b6f3ec7849ad675af67877b` |
| Closed native-pair receipt | `32b71f0a1c8597fa5b6ce936db607ae80b45f948902ca269fe85d04f4371ef60` |
| Source-adoption final receipt | `449bb1fc6494f8c4b16273847c227ea7f13e8df3441d1f54c11b11ffccf49b1d` |

These identify the inspected reports; they do not publish the raw arrays or
replace the original capture bindings. The earlier qualifications retain their
own custody below.

| Retained artifact | SHA-256 |
| --- | --- |
| Standard1 candidate receipt | `a107a4bb8b2baf71ac1d35c428aa8465c2eb376b8a4f25b3266736b4ec238ddf` |
| Huge2 candidate receipt | `69954eb86cc91647d4539ae370d99b28e4b2ebab8b13e2dce0758b15cd71239a` |
| Structured diagnostic result | `0ec59f93649abcc94f94a907242d2dacd09238725e7a573d840866f5f36d55c3` |
| Diagnostic program | `ae79f92161bd34003a91ba8a9cdb37ff4a3cb840aa6704116c862b4dd70ef853` |
| Narrative diagnostic report | `cffb6f61a2a2fd61d1b16f3af6cf6eb80715a4ee101160fd2e4df5dfc711e372` |
| Point-water support control result | `74c4a5d6d44145c0b304246c26f2e88ca9b4d44cc63bc88340047d5dc2b58707` |
| Point-water support control program | `3010466d6c2740b6a8840a92460b3fc2d931326ce15fceeb25165393af69f400` |
| Native census result | `bb794bcc41ab9aabcc7c153926ca920622a503aac3539caca4a0e6bd4ca042b2` |
| Native census reducer | `b129ea5380ecfc3f3166954b45a13afb6a5dc484602a73a2aa1ef383e3c41f8f` |
| Native original receipt | `d5e119c30d2045c200b9c3012eed4ba05525ce61321b710b93c81abb33e5cbd8` |
| Native continuation receipt | `d87adeebef6dd608f53e69f70e352a2db99c98288ab69ab0f1e7c5a680d0eab9` |

The later source-led qualification has separate custody:

| Retained artifact | SHA-256 |
| --- | --- |
| Source-led retained replay result | `8aac7036f317bc34d05a604b1c23c68a595a1a7f8e562dd207418d6ff1faf31c` |
| Four-capture qualification manifest | `9748b8f1eaf296a024e75ca38e1def94e70bd4c753b045d90d126701e197bea9` |
| Conditional margins result | `be8241ee5526e992ed2026430c8e95e6d90503e667ee1677d9373d463d963dab` |
| Conditional margins program | `bb58f0f620b72b54f7416c229fd033a8a4d2a5a3bce9bca2d885572d055d7ee8` |
| Source-led Standard 1/1 capture receipt | `9241ad0d0b246c02709189e18b9d02625d810a715d383b95310d927135507835` |
| Source-led Huge 2/2 capture receipt | `7b5b185ae50cdd0b4fe31eab6db19854360f9283552bdab78babc713272fd001` |
| Source-led Standard 3/3 capture receipt | `1763d8ee3a855614d9783ce02b9b976b5da98f9b84783d52e2eed9902b91285b` |
| Source-led Huge 4/4 capture receipt | `4558ffac505e14c07f7c1870780a7a6b4e51a3fe392abcb64005828af6daf0ee` |
| Dry-habitat contract trace result | `11da2e0383a3822dfc0f3c6168d066a7eab3db7d66f08b82511d09154eb616fd` |
| Dry-habitat contract trace program | `5707a1d31a02a8c6cf54e3ff71458192bc7af00172c8c97223daea6d09e89350` |

The bog-consumer qualification is separately bound:

| Retained artifact | SHA-256 |
| --- | --- |
| Bog production retained-replay result | `50266b11b4aece7762b5af047e2cd60b2f9581ebdade5a205d3264eb3fda5ebf` |
| Bog production retained-replay program | `f89bc43a06e26197e532c7e895fb6f323c829cf85b173fc3e10bf3cdf10e8a6e` |
| Two-capture bog qualification manifest | `5c2348fcd50fd7f9986dde19ce5e1d065c9a4b6aea31d56d152ac9d16d88c887` |
| Bog-qualified Standard 1/1 capture receipt | `b6cae77c77cd3270d4d9a4b5fb9c9bd15a91f24db9c5df12f7e62ee0f271372e` |
| Bog-qualified Huge 2/2 capture receipt | `41842669c4f678d7f14d2263967f7ba65f43c491d752e9f334b492dd200e3c17` |

The mangrove discrimination and qualification have their own bindings:

| Retained artifact | SHA-256 |
| --- | --- |
| Mangrove retained discriminator result | `5a6ac52cb8bcacd7c74b77abceec3b3517320a43c052c4128e70675e913cf3ba` |
| Mangrove retained discriminator program | `5f1cdf20088c25371626f4d5262a721448130d56e05afcb21f8479cd39b2aa98` |
| Mangrove local discriminator result | `716242c99619318aa66276cb14894a18520b696efb71fb536a7321fd97b70484` |
| Mangrove local discriminator program | `75ed9eb53f1cd9bf2341cf2fdb28c7dcac5d79f021fac3455ba638e290b803a0` |
| Mangrove production retained-replay result | `3eda072f15ab6bddea8901e778cc8103d4dca644e6c0d98bacc3f1117f8b2c31` |
| Mangrove production retained-replay program | `6583c6266a4a2f4ba5927b1f6783708825801fb5a8a390de4455c9cf5ec6d8d1` |
| Two-capture mangrove qualification manifest | `f8ff6bb408a1ee471524ac9039a78d06c8d7c0bda56376639919a09937866f52` |
| Mangrove-qualified Standard 1/1 capture receipt | `6454031f4eb2575b48180b3b2c00f2e62ff035d06ccdff79d435eb7384da4a9a` |
| Mangrove-qualified Huge 2/2 capture receipt | `673d9eba8047c3f13c344834a2dc41ac93a450ec7fc5b7b5ef931c955261bf29` |

The private diagnostic programs and census reducer have no committed producer
revisions of their own. Their findings therefore remain prose evidence with
explicit custody and source limits, not a
fabricated structured verification record pinned to this editorial commit.
No current live-state claim, all-seed prevalence, physical calibration or
preferred threshold follows from these results.

[substrate]: https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/domain/ecology/modules/features/ops/compute-feature-substrate/rules/wetland-substrate-masks.ts
[scores]: https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/recipes/standard/stages/ecology/features/steps/score-layers/step.ts
[planner]: https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/domain/ecology/modules/features/ops/features-plan-wetlands/strategies/habitat-confidence/index.ts
[oasis]: https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/maps/configs/swooper-earthlike.config.json#L949-L957
[qualified]: https://github.com/mateicanavra/civ7-modding-tools/blob/09e8c9a87fba9c5078d20134ad1c8e04a858bfbb/docs/projects/native-map-controls/dryland-point-water-coherence.md#qualified-outcome
[point-water]: questions/q-004-point-water-support.md
[wetland-question]: questions/q-005-wetland-suitability.md
[bog-qualified]: https://github.com/mateicanavra/civ7-modding-tools/blob/7080b22891f2b77297132fa7699fd42fc5fdb4a7/docs/projects/native-map-controls/wetland-consumer-coherence.md#qualified-outcome
[resource-distribution]: https://github.com/mateicanavra/civ7-modding-tools/blob/4ae7b311a1e259449001b96b683860c5b682301e/plugins/mod/map/swooper-physics/src/recipes/standard/metrics/families/resources.ts#L386-L409
[mangrove-qualified]: https://github.com/mateicanavra/civ7-modding-tools/blob/22438584f152a420901c0fa0d0e90f175a815f32/docs/projects/native-map-controls/wetland-consumer-coherence.md#completed-mangrove-pair
[start-spread]: https://github.com/mateicanavra/civ7-modding-tools/blob/4829c718eb1dfe5cddd57bb3b32c2208de184fbc/plugins/mod/map/swooper-physics/src/recipes/standard/metrics/families/placement.ts#L468-L494
[current-hydrology]: https://github.com/mateicanavra/civ7-modding-tools/blob/eff77c0f8cd3be5b8a8fd176997918b76848bc44/docs/system/libs/mapgen/reference/domains/HYDROLOGY.md#L144-L217
[moisture-owner]: https://github.com/mateicanavra/civ7-modding-tools/blob/d17abf6f54b018600b2d13c139e8be485e2aa732/plugins/mod/map/swooper-physics/src/domain/hydrology/modules/climate/ops/compute-moisture-forcing/contract.ts
[moisture-reduction]: https://github.com/mateicanavra/civ7-modding-tools/blob/d17abf6f54b018600b2d13c139e8be485e2aa732/plugins/mod/map/swooper-physics/src/domain/hydrology/modules/climate/ops/compute-moisture-aggregate/rules/index.ts
[plant-water-owner]: https://github.com/mateicanavra/civ7-modding-tools/blob/d17abf6f54b018600b2d13c139e8be485e2aa732/plugins/mod/map/swooper-physics/src/domain/hydrology/modules/climate/ops/compute-land-water-budget/strategies/pet-aridity/index.ts
[native-rainfall]: https://github.com/mateicanavra/civ7-modding-tools/blob/d17abf6f54b018600b2d13c139e8be485e2aa732/plugins/mod/map/swooper-physics/src/recipes/standard/stages/hydrology/projection/steps/project-rainfall/step.ts
[relief-question]: questions/q-003-relief-support.md
[freshwater-meaning]: https://github.com/mateicanavra/civ7-modding-tools/blob/3532e8d34c28f6acb343b066338d761e9d2a3644/plugins/mod/map/swooper-physics/src/recipes/standard/metrics/studies/benchmarks/earthlike-placement.md

# Wetland Occurrence: Bounded Evidence

This portable evidence summary separates the original two-case headless
diagnostic, a later source-led point-water qualification, and a native feature
census on a different map. None is a wetland abundance target. Habitat,
suitability, compatibility, prior occupancy, admitted intent and final output
have different meanings and populations. The later qualification does not
replace the original observations or transfer their causal explanation to the
native census.

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

The private diagnostic programs and census reducer have no committed producer
revisions of their own. Their findings therefore remain prose evidence with
explicit custody and source limits, not a
fabricated structured verification record pinned to this editorial commit.
No current live-state claim, all-seed prevalence, physical calibration, repaired
output or preferred threshold follows from these results.

[substrate]: https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/domain/ecology/modules/features/ops/compute-feature-substrate/rules/wetland-substrate-masks.ts
[scores]: https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/recipes/standard/stages/ecology/features/steps/score-layers/step.ts
[planner]: https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/domain/ecology/modules/features/ops/features-plan-wetlands/strategies/habitat-confidence/index.ts
[oasis]: https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/maps/configs/swooper-earthlike.config.json#L949-L957
[qualified]: https://github.com/mateicanavra/civ7-modding-tools/blob/09e8c9a87fba9c5078d20134ad1c8e04a858bfbb/docs/projects/native-map-controls/dryland-point-water-coherence.md#qualified-outcome
[point-water]: questions/q-004-point-water-support.md
[wetland-question]: questions/q-005-wetland-suitability.md

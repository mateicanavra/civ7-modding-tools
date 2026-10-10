# Wetland Occurrence: Bounded Evidence

This is a portable summary of a two-case headless diagnostic and a separate
native feature census, not a wetland abundance target. The diagnostic
distinguishes absent habitat,
low suitability, terrain and biome compatibility, prior occupancy, feature
selection and final **headless/mock** output. The analysis identifies different
controlling conditions for point-water features and other wetland families.
The native census records occurrence on a different map; it does not establish
that the same upstream mechanisms caused those counts.

## Case And Source Identity

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
build and native calls were all zero. This summary adds no further replay.

## Point-Water Support

The [substrate rule][substrate] requires exposed lowland within a radius-one
classified-river neighborhood, while excluding the broader floodplain substrate
mask. That proxy uses radius two and discharge at least 96 in the inspected
Earthlike configuration. These are authored neighborhood and discharge values,
not calibrated physical distances or flooding frequencies.

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

## Other Wetland Families

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
| Native census result | `bb794bcc41ab9aabcc7c153926ca920622a503aac3539caca4a0e6bd4ca042b2` |
| Native census reducer | `b129ea5380ecfc3f3166954b45a13afb6a5dc484602a73a2aa1ef383e3c41f8f` |
| Native original receipt | `d5e119c30d2045c200b9c3012eed4ba05525ce61321b710b93c81abb33e5cbd8` |
| Native continuation receipt | `d87adeebef6dd608f53e69f70e352a2db99c98288ab69ab0f1e7c5a680d0eab9` |

The diagnostic and census reducer have no committed producer revisions of
their own. Their findings
therefore remain prose evidence with explicit custody and source limits, not a
fabricated structured verification record pinned to this editorial commit.
No current live-state claim, all-seed prevalence, physical calibration, repaired
output or preferred threshold follows from these results.

[substrate]: https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/domain/ecology/modules/features/ops/compute-feature-substrate/rules/wetland-substrate-masks.ts
[scores]: https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/recipes/standard/stages/ecology/features/steps/score-layers/step.ts
[planner]: https://github.com/mateicanavra/civ7-modding-tools/blob/2a31c96f8d61ee713075974838dfd36a0b008021/plugins/mod/map/swooper-physics/src/domain/ecology/modules/features/ops/features-plan-wetlands/strategies/habitat-confidence/index.ts

# Terrestrial Surface-Water Influence

## Frame

Vegetation should respond to admitted thermal, atmospheric, hydrologic and
substrate conditions, not quotas or an instruction to green every shore.
The existing vegetation substrate already consumes effective moisture,
temperature, aridity, freezing, biomass and fertility. Plant-water composition
belongs to Hydrology's existing `computeLandWaterBudget`, not a second Ecology
climate calculation. Wet-feature substrate and feature-specific suitability
remain Ecology-owned consumers; their actual dependencies must be qualified
before adopting an upstream simplification.

The retained Huge density contrast holds physical water and atmospheric
forcing exactly while changing 285 effective-moisture cells under the current
major `+8` / minor `+4` neighborhood rule. Another operation first increases
rainfall near ANY river and locally enclosed terrain, then reconstructs humidity
from that rainfall. Replacing only one would retain competing local wetness lanes.

The available physical products distinguish local runoff, principal routed
dry-edge flux, ordinary reaches, finite wet body identity, surface head and
ground. Positive discharge alone does not identify accessible water: all 539
isolated-interior controls in the retained join also carry positive dry-edge
flux. Land-to-lake inflow does not prove reverse supply to vegetation.

## Goal And Alternatives

Retire both local wetness injections. Preserve the baseline atmospheric
rainfall/humidity and the pre-hydrography demand used by finite-water accounting.
One post-network empirical ecological index may express local surface-water
opportunity; it is not rainfall, groundwater, soil saturation, plant uptake or
actual evapotranspiration. The refused conservative-transport candidate remains
closed. A new transport, ocean or root-zone solver is outside this decision.

**A: removal control.** On resolved exposed land, retain only
`M = rainfall + 0.35 * humidity`; terrestrial outputs remain zero on water.
This removes unsupported amplification without adding a local-water response.

**B: source-sensitive candidate.** Add a single bounded influence to A inside
the existing budget operation. Let `z` be sealed ground, `R` local runoff and
`Q` principal dry-edge flux. For ordinary exposed source `j`, define
`C[j] = Q[j] > 0 ? max(0, Q[j] - R[j]) / Q[j] : 0`.
Exclude hydraulic-component members, whose grid flux is not complete exchange.
Do not use major/minor/none labels as eligibility or strength.
Here an ordinary source means exposed ground outside hydraulic components,
including ordinary boundary-export cells. It is a routed-flow cue, not a new
channel detector or proof of permanent surface water.

Define bank response `G(d) = clamp01(1 - max(0, d) / 8)` in quantized normalized
relief units, not metres. At target `i`, each own-cell channel source contributes
`C[i]`; an adjacent ordinary channel source `j` contributes
`0.5 * C[j] * G(z[i] - z[j])`. Each adjacent strict finite-wet source contributes
`0.5 * G(z[i] - waterSurface[j])`, requiring both the lake mask and positive body
identity. Marine proximity alone contributes nothing to this terrestrial term.
Take the maximum of these contributions, not their sum, and set
`M = M_A + 8 * influence`. Use the existing wrapped hex neighborhood, bounded Y.

The cap `8`, bank scale `8` and adjacent weight `0.5` are one prospectively
fixed empirical product choice, not Earth calibration. The concentration cue
measures upstream fraction, not delivered volume: a tiny upstream-fed flux can
have the same fraction as a large one. Channel bed is not water stage. Finite
water opportunity is salinity-blind; body identity does not prove freshwater,
persistence or benefit to plants. Do not add parameters to conceal these gaps.

## Acceptance Criteria

| Contrast | Required direction or hold |
| --- | --- |
| River hierarchy only | Exactly invariant moisture; no class input |
| `Q = R > 0` | Zero own-cell concentration cue |
| Increasing routed concentration at fixed local runoff | Increasing bounded channel cue |
| Common positive runoff/discharge unit scaling | Exact mathematical invariance, numerical tolerance declared |
| Increasing positive bank height | Decreasing that adjacent contribution; zero at the fixed bank scale |
| Finite shore at head versus elevated shore | Greater opportunity at head, not a rainfall change |
| Marine versus strict finite-water source | No marine freshwater proxy |
| Repeated adjacent sources | No additive amplification |
| Common height-datum shift | Invariant response |
| Non-exposed cells | All established terrestrial outputs remain zero |

Isolate source contributions for the directional controls: another source or
the target's own cue can dominate the final maximum legitimately. Include the
equal-fraction tiny/large-flow contrast as an adversarial equality, not a claim
of equivalent ecological supply.

Run owner-local directional controls first, then examine the retained physical
map without regenerating it. Positive opportunity on unclassified flow must be
explained by concentration and relief, not dismissed merely because it is outside
the old classification. Conversely, widespread nearly uniform opportunity must
not be called useful localization. Retained geometry is not proof of plant access.

Before production adoption, compare the selected candidate with the current
incumbent in one actual recipe execution with identical Huge geography, seeds
and setup, plus the unchanged complete map-selected bank. B need not be
implemented merely to qualify A's removal.
Require baseline forcing, physical hydrology, lake ledgers and physical
ground/river/lake projection intent to hold. Refined rainfall/humidity, final
PET, albedo/temperature, cryosphere,
biomes, vegetation, resources and starts are downstream consequences, not blanket
identity holds. Explain those changes and preserve their existing collateral
requirements. The prospective gate is no new failed bank leaf and no
deterioration of an already failed leaf. The unresolved one-degree
thermal-variation floor stays failed and unwaived; this independent ownership
repair does not acquire the whole thermal-calibration obligation or claim its
resolution. The complete bank must still be reported as red while it fails.
More vegetation is not an adoption criterion. Refuse B if it does not earn its
complexity over A or produces unacceptable source/shore effects; no parameter
sweep, quota, artificial noise or relaxed test rescues it.

## Issues And Sequencing

1. Review the exact index meaning and directional controls; discriminate A/B
   against retained inputs before changing the recipe.
2. At the existing budget owner, admit the selected physical fields at their
   current precision. Keep rule computation out of the step. Retire the
   precipitation operation, schema binding, knobs, authored keys and obsolete
   tests together; no fallback lane or new artifact family.
3. Correct the stale baseline-demand description: seasonal empirical demand is
   computed on all surfaces, not zeroed on original water. Preserve the existing
   land-only final PET output convention and actual arrays.
4. Run the actual recipe contrast, owner checks and unchanged bank; review with
   fresh physical and SDK-simplicity stewards, then adopt or record refusal.
5. Only an adopted complete unit is deployed and freshly realized in Civ.

Use the existing worktree and Graphite lineage, with reviewed design/proof before
the dependent implementation layer. The already-qualified native density and
minor-vegetation delivery is independent of this candidate's adoption.

## Risks

The available artifacts lack channel stage/width, soil-water storage, roots,
infiltration, seasonality and salinity. A bounded advisory response cannot claim
those processes. Coast-driven atmospheric transport and marine habitats keep
their existing owners; removing a freshwater shore bonus does not remove them.
Removing rain-derived humidity also affects thermal feedback and final demand;
qualify these dependencies instead of preserving a duplicate compensating lane.

## Initial Formula Discrimination

Twenty private formula controls pass, including exact influence identity on the
retained major-percentile contrast. No new recipe run or production source change
is needed for that input-sensitivity check. The runtime for this formula-only
evaluation is about two milliseconds on the retained Huge map, not a complete
generation latency claim.

The formula gives positive influence to 2,236 of 2,501 exposed cells and 439 of
539 isolated-interior controls. Interior mean influence is `0.2156`, compared
with `0.8665` on the current major sources; it is not uniform, but it extends
widely through ordinary routed terrain. An isolated cell can receive an own-cell
increment of about `6.52` despite no classified river or adjacent water. Equal
fractions also give identical responses at arbitrarily different flow magnitudes.

These controls establish label invariance and input sensitivity, not adequate
water-source localization or plant supply. B is unselected and unqualified, not
disproved merely because it is empirical. Do not
ship it simply because it is smoother or creates more vegetation. A was selected
for actual recipe and bank discrimination; the completed result below refuses
its production adoption. A local river/lake ecological response remains a
separate open decision, not an obligation fulfilled by the removal control.

## Completed Removal Control

The implementation at `c6da7944` removes both unsupported wetness injections,
their operation/configuration paths and obsolete authoring controls. Baseline
physical-water demand remains unchanged; final terrestrial outputs use resolved
exposure, including formerly dry cells covered by finite water. This is a
complete experimental implementation, not a partially deployed migration.

One actual current Earthlike Huge recipe, map/game seeds `2/2`, retains all
31 declared physical/baseline products and all three declared river/lake
projection entries exactly. The 49 existing integrity expectations pass. Final rainfall
equals atmospheric baseline rainfall. This portable execution takes about
`2.54` seconds; it is not a native generation or complete player wait claim.
An independent retained-capture audit additionally holds projected elevation
and observed terrain/water/lake identity exactly; that fourth projection hold
is separate from the original recipe receipt's three declared entries.

Downstream effects are substantial: 683 biome cells change; rainforest moves
from `43` to `27`, forest from `261` to `123`, and sagebrush from `29` to `156`.
Vegetation total moves only `674 -> 656`, concealing those substitutions.
All ten founders remain legal dry, non-NAV starts and all 236 resource intents
are placed in this offline comparison. Proximity groups do not show uniform
drying: finite-shore vegetation rises `72 -> 93`, while marine-coast vegetation
falls `230 -> 207`. Those overlapping groups describe outcomes, not proof of
plant access or ecological improvement.

The unchanged complete bank retains 22 studies, 57 scenarios, all 4,430
expectation identities/descriptions/comparators and 98 changed observations.
It moves from 4,429 to 4,428 passing leaves, violating both prospective clauses:

| Existing requirement | Incumbent | Removal control |
| --- | --- | --- |
| Huge Archipelago `1018/1018` mangrove presence, at least one | 19 | 0 |
| Earthlike cohort within-row temperature variation, at least `1 C` | `0.1428814 C` | `0.1390441 C` |

**A is refused; B remains unselected.** PR #2341 is closed through Graphite,
and its local candidate branch is retired with the source and private proof
preserved. No candidate source is merged or deployed. The incumbent remains
the sole production path pending a qualified replacement; this is not an
endorsement of its wetness proxies as the final ecological model.

Types, policy and builds pass. Full candidate owner tests pass 1,321 definition,
371 realization and 412 Studio tests; the definition study aggregate fails on
the two scientific leaves above. No threshold, scenario or feature floor is
weakened to obtain adoption.

### Thermal Dependency Closure

On the retained Huge `2/2` map, all 276 temperature changes occur on formerly
subfreezing exposed land whose refined rainfall decreases. Existing albedo
feedback amplifies snow cooling with rainfall. Removing that amplification
therefore warms these cells by at most `0.1823 C`; it does not create the missing
regional thermal response.

The exact metric population is the original 2,603 land cells, including 102
later-covered finite-water cells. Row-centered `2Cov + Var` closes the observed
variance change to floating-point precision: SD `0.12956964 -> 0.12947079 C`,
variance delta `-0.0000256067 C^2`. This is not the four-case bank cohort above.
The pre-albedo temperature array was not retained, so the existing snow rule's
gain relation is a consistency check, not an exact intermediate-state replay.
No implementation defect is indicated by this bounded closure.

A lower variance scalar does not independently establish worse climate
physics, particularly when the removed compensation supplied some variance.
The prospective adoption gate still refuses this candidate. Resolve the open
thermal requirement through explained regional structure, never artificial
noise or restoration of rainfall amplification solely to recover the scalar.

### Completed Coastal Consumer Discriminator

The coastal wet-feature path has distinct eligibility and supply inputs:
`intertidalCoastMask` gates substrate, while mangrove scoring also multiplies
warmth, normalized effective moisture, fertility and low-aridity suitability.
Archipelago uses an unchanged wetland floor of `0.35` and zero albedo passes;
the Earthlike snow explanation does not attribute its lost mangroves. Its
coastal mask currently includes adjacency to any resolved water, not marine
water alone. That source-meaning limitation is not yet the cause of this loss.

The exact failing Huge `1018/1018` recipe runs once per clean, built arm. Both
retain 573 exposed intertidal cells, 500 flat/unoccupied candidates and 271
positive mangrove scores. Scores meeting the unchanged floor move `24 -> 0`;
actual winning intents, allowed offline projection calls, writes and final
mangroves move `19 -> 0`. The first empty stage is score admission, not engine
projection, missing coastal eligibility or changed warmth.

All 19 incumbent mangrove sites retain physical eligibility, flatness and
prior occupancy. Their scores move from `0.350013..0.411302` to
`0.254585..0.304308`; effective moisture moves from `222.55..231` to
`195.55..204`. Warmth and aridity factors hold. Water suitability falls by
`0.2055..0.2162`, while moisture-sensitive fertility suitability falls by
`0.0264..0.0279`. Substituting only the candidate water factor into each
incumbent factor product puts all 19 below the floor; substituting only
fertility does so for 12. These are diagnostic product substitutions, not
independent physical interventions or new recipe runs.

These are different reductions of the same final rainfall/humidity vintage,
not repeated consumption of one index. Vegetation normalizes effective
moisture by `230`; Pedology's climate contribution uses
`clamp01((rainfall + humidity) / 510)` alongside independent relief, sediment
and bedrock terms. Their correlated response does not establish accidental
double-counting or justify removing fertility's climate dependence.

The pure substrate/scorer/planner reductions match actual suitability and
intent artifacts exactly. Publisher snapshots qualify climate, fertility,
biomass and suitability stability; physical geometry has no independent
score-time snapshot. Whole prior occupancy changes at two unrelated cells;
the initially overbroad occupancy freeze is retained as a failed comparison
assumption, not promoted to a global identity claim. Offline mock legality is
not a native Civ7 predicate or fresh native feature-placement proof.

The next owner decision must distinguish plant-water supply from atmospheric
rainfall and from moisture's existing soil/fertility response. Retained
normalized moisture is still high: a floor loss does not distinguish missing
local supply from consumer scales/admission calibrated around the incumbent's
inflated index. The trace does not establish that either factor is wrong or
that coastal eligibility proves freshwater access. Carry both explanations
into the same owner decision before selecting another implementation. Do not
lower feature admission to rescue this case, promote every shore, or substitute
river display class for actual water availability. No new root-zone solver or
empirical shore bonus is selected.

## Marine Habitat Provenance Prerequisite

The next bounded repair carries an already-owned source distinction into
Ecology before selecting terrestrial water opportunity. `score-layers` already
reads `externalWaterMask`, separating prescribed external marine water from
finite resolved water. Admit that mask to `computeFeatureSubstrate` and qualify
the existing `intertidalCoastMask` with adjacency to external water, exposed
land and the unchanged relative-height limit. This is a marine low-shore
habitat proxy, not measured tides, salinity, freshwater quality or root access.

Keep the current neighborhood geometry and configured radius. Preserve generic
any-water `coastalLandMask` and its existing hydromorphic consequences for the
other wetland consumers. Narrowing mangrove provenance must not silently
remove lake-shore opportunities from marsh or bog. No new artifact, operation,
stage, solver, supply scalar, score coefficient or planner floor is selected.

The retained Archipelago geometry already gives all 573 intertidal candidates
an external-water neighbor, including all 19 incumbent mangroves. Therefore
this repair is expected to preserve that outcome; it does not recover the
refused removal control's lost scores and is not a climate improvement claim.

### Prospective Proof

- At fixed exposure, height and climate, marine-only low shores retain marine
  eligibility; finite-only shores do not; mixed shores retain it; high ground
  remains excluded. Generic coastal/hydromorphic outputs retain their declared
  any-water behavior.
- Baseline and final climate, Pedology, physical geometry, drainage, lake
  ledgers and river/elevation projection hold. No freshwater increment follows
  from a marine adjacency label.
- Qualify a retained procedural finite-only low-shore witness when available,
  not a newly generated geography created to fit the test.
- The actual Archipelago incumbent retains its 19 mangroves and complete
  feature result. Use the unchanged complete bank for collateral qualification;
  require no new failed leaf or deterioration of the existing failed leaf.
  Other downstream competition, resource and start changes are reported,
  rather than silently assumed identical.

Seal this source-meaning repair before returning to the explicitly empirical
terrestrial opportunity/consumer contract. Perfect salinity or root physics
is not a prerequisite for an honest approximation, but source adjacency must
not be promoted to those missing quantities. The original thermal objective,
consumer calibration and local plant-water response remain open.

### Completed Source-Provenance Qualification

The required `externalWaterMask` is now wired into the existing substrate
operation. Marine-only and mixed low shores retain intertidal eligibility;
finite-only low shores retain generic coastal and hydromorphic eligibility,
but not the marine label. The original neighborhood and height rules hold.
No score coefficient, admission floor, rainfall or water-supply formula changes.

One actual Huge Earthlike `2/2` capture is byte-identical to the qualified
incumbent, including all model, projection, feature, resource and start data.
Its 49 integrity expectations pass. On those retained physical inputs, the
source-only substrate contrast narrows intertidal eligibility `795 -> 493`,
removing 302 finite-only low-shore cells. All nine other substrate outputs
remain exact. Six retained finite-shore witnesses qualify the distinction;
these operation replays are not original score-time snapshots.

One actual Huge Archipelago `1018/1018` execution preserves its 573 marine
intertidal candidates, all 19 mangrove scores/intents/writes, and the complete
final mock readback. Physical/climate artifacts and all non-intertidal masks
hold. The executions take about `2.85` and `2.52` seconds respectively; neither
is a native-generation or complete player-wait claim.

The first Huge evidence reducer used the physical name `MAJOR` where the
captured projection enum is `NAVIGABLE`. It failed after writing the valid
capture. A versioned reduction reuses that immutable capture, checks the
original failed receipt and source pins, and completes the comparison with
zero additional generations. The failed first receipt remains retained.

Focused controls pass 12 tests and 212 assertions. Owner verification passes
1,324 definition tests, 371 realization tests and 412 Studio tests; the
definition study aggregate still fails on the known thermal requirement.
The unchanged complete bank is byte-identical: 22 studies, 57 unique scenarios
and 4,430 expectations, with 4,429 passing and the same thermal leaf failing
at `0.142881437915705 C` against `>= 1 C`. Independent comparison finds no
changed observation, new failure, deterioration or weakened gate.
Types, policy and builds pass. This qualifies source meaning, not salinity,
tidal habitat, root-zone access or a new terrestrial water response. The
loaded playable session is preserved; new-bundle native execution is unclaimed.

## Marine Mangrove Response Decision

The next selected repair is one Ecology consumer, not another Hydrology
amplitude. Retained-only source joins find no strict finite-water neighbor at
the 19 mangrove sites lost by A; principal discharge equals reconstructed local
runoff there and at their exposed radius-one neighbors. That does not prove
absent groundwater or plant access. Across all 500 eligible flat/unoccupied
sites, even granting B's full eight-unit increment and best aridity cannot
reach the unchanged `0.35` floor with A's warmth/fertility held. These bounds
refuse that adoption explanation; they are not restoration targets.

Select an empirical marine-coastal habitat score:
`eligibleMarineLowShore * warmth * fertility * lowAridity`. Retire the mandatory
generic terrestrial `water01 = clamp(M / 230)` multiplier from mangrove scoring
only, including its contract input, caller wiring and authored `waterMin01`
keys. Do not replace it with a constant freshwater credit, scalar or fallback.
Marine eligibility represents the existing wet-habitat approximation; it does
not assert measured inundation, salinity or root uptake.

This is a model choice supported by the qualitative habitat regime, not a
numerical Earth calibration. Mangroves tolerate saltwater-inundated coastal
conditions ([NOAA habitat description](https://www.fisheries.noaa.gov/news/july-26-international-mangrove-conservation-day)).
Temperature and rainfall constrain regional distribution
([USGS climatic-controls study](https://pubs.usgs.gov/publication/70179448)).
Freshwater remains physically relevant: drought observations show changing
groundwater flow and salinity, processes not resolved by these artifacts
([USGS field study](https://pubs.usgs.gov/publication/70023555)).
Keep the distinct Pedology rainfall/humidity/material reduction and the
existing empirical aridity response; neither is retired merely for covarying.

### Prospective Response And Proof

Preserve the current warmth `18..30 C`, fertility `0.15..1`, aridity `0.7..1`
ramps, marine/relief gate, flatness/occupancy checks and authored planner policy
(`0.35` Archipelago, `0.42` Earthlike, `0.32` Desert Mountains).
At fertility `0.6`, `30 C` and aridity `0.4`, the score is about `0.5294`;
cooling to `24 C` or increasing aridity to `0.85` halves it to `0.2647`.
Cold `18 C`, extreme aridity `1`, finite-only and excluded high shores stay
zero. No assertion about freshwater connection is added without that input.

Qualify those anchors in the existing wetland-family/substrate tests. Hold
physical geometry, marine eligibility, drainage/lake ledgers, climate,
Pedology and all other feature scorers exactly. Actual mangrove arbitration,
features, resources, starts and later occupancy are measured consequences,
not blanket identity claims. Use one actual selected recipe contrast and the
unchanged complete bank; refuse new failed leaves or deterioration of the
existing failed leaf. No mangrove count, extra greening, weakened floor or
noise is an acceptance target. Only a qualified unit is adopted and installed.

Generic river/lake opportunity remains the following Hydrology decision; this
marine consumer must not dictate its amplitude or reopen the refused A/B paths.

## Marine Response Candidate Discrimination

The bounded implementation at `11725ec6` removes the mangrove-only terrestrial
water input, multiplier and authored key. The marine gate and warmth, fertility,
aridity, flatness, occupancy and map-specific planner floors remain intact.
Marsh, bog, oasis and watering-hole water inputs are unchanged. Fifteen focused
tests pass with 232 assertions, including the declared response anchors and
retired-contract rejection; no alternative artifact or compatibility lane is added.

One actual Huge Archipelago `1018/1018`, ten-player execution takes about
`2.71` seconds. Fourteen named retained artifact objects, full replayed
substrates, all 24 other feature scorer layers and prior occupancy hold exactly.
Current-operation, factor-product and planner parity cover all 6,996 tiles.
These are retained captured products and terminal replays, not complete
uncaptured hydraulic ledgers or a native-generation claim.

Mangroves move `19 -> 31`: twelve final rainforest tiles become mangrove,
rainforest moves `174 -> 162`, and occupied ground does not increase. Only
31 of 500 eligible flat/unoccupied marine sites win; there is no all-shore
promotion or restoration-count target. All 31 mock attempts are allowed and
written, with zero mock refusals. Non-feature final readback is exact.
All 140 incumbent resource placements survive; eight additions occur on eight
of the twelve changed feature cells, giving 148 placements and no mock refusal.
This is habitat substitution plus newly legal resource opportunities, not a
change to physical hydrology or an engine-legality proof. Starts were not
captured by this observer; the complete bank retains its existing start checks.

The unchanged complete bank covers 22 studies, 57 unique scenarios and 4,430
expectations. All 4,429 passing expectations remain passing; the thermal leaf
remains exactly `0.142881437915705 C` against `>= 1 C`. Every identity,
comparator and bound holds. There are 22 changed numeric observations and no
status changes, new failed leaves or failed-leaf deterioration. All retained
Earthlike observations hold; changes occur in the two stress products.

The twelve passing observations that move toward their unchanged bounds are
fully reported, not concealed as exact output identity. Archipelago wetland
share moves `0.0235 -> 0.0384` under its `0.22` ceiling. Desert Mountains'
savanna counts across the five retained seeds move
`60/55/95/61/39 -> 8/8/21/7/25`; sagebrush counts move
`1414/1374/1348/1383/2602 -> 1368/1309/1290/1279/2599`.
Their feature-presence bounds remain intact, but that is insufficient product
qualification. The receipt-hashed log contains 57 complete feature-application
records. Five records attempt `108/125/137/171/17` mangroves respectively;
every one is refused by official biome legality, with zero mangrove writes.
Wetland share stays zero in these dry cases. Wetland intent reserves occupancy
before vegetation planning; later projection rejection leaves that ground bare.
The dry-map declines are therefore impossible-intent starvation, not realized
habitat substitution. Resource gains there cannot be called habitat improvement.
The bare `11725ec6` candidate is held, not adopted or installed. The numerical
bank law is unchanged; its presence/ceiling checks did not detect this defect.

The complete bank runs in about 101 seconds on the verification host; that is
not one map's player-path latency. Owner verification passes types, policy and
builds, 1,325 definition tests, 371 realization tests and 412 Studio tests.
The definition aggregate still fails solely on the retained thermal leaf.
Independent raw comparison qualifies the declared holds and twelve final
feature substitutions separately from the bank verdict. Installation and any
future native execution remain separate claims.

## Wetland Feasibility Prerequisite

Physical suitability and Civ7 representation are different decisions. Preserve
the honest marine score; do not repaint a biome, lower its habitat floor, add
freshwater credit, or retry a vegetation fallback after engine rejection.
Use the existing generated official feature-legality policy and the existing
canonical biome projection at the Ecology recipe boundary to admit feasibility
for planned flat ground. Supply that closed feasibility input to the existing
portable wetland planner. Filter candidates before choosing the winner and
publishing reserving intent, so an impossible high-score mangrove cannot hide
a legal lower-score wetland or suppress ordinary vegetation. The live engine
legality check remains a distinct final safeguard, not a physical scorer.

Acceptance: illegal best/legal runner-up selects the legal wetland; no feasible
wetland leaves ground unreserved for vegetation; a feasible marine winner stays
unchanged. Verify official policy wiring against canonical biome meaning, not a
hand-maintained tropical-ID test. Require physical/climate/substrate/score holds,
zero biome-incompatible wetland intents under this admitted policy, unchanged
bank gates and no new failure or existing-failure deterioration. Existing legal
feature counts are consequences, not fitted targets. Reuse the retained failure
logs; qualify the combined repaired candidate before merging this same branch.

### Completed Compatibility Qualification

The combined source at `739082916f` preserves the physical marine score and
admits the five required terrain/biome masks through shared Ecology recipe
policy. It filters candidates before arbitration and occupancy. Official
feature legality and the same canonical biome mapping used by projection own
this static admission; the final engine guard remains separate. No habitat
gain, biome repaint, fallback or new artifact is introduced.

The focused tests cover illegal-best/legal-runner-up selection, unreserved
ground for ordinary vegetation, required closed mask admission and canonical
official-policy parity. Types, policy and builds pass. Full owner verification
passes 1,328 definition tests, 371 realization tests and 412 Studio tests; the
definition aggregate still fails solely on the existing thermal requirement.

One actual Huge Archipelago `1018/1018`, ten-player recipe takes `2.68` seconds.
The captured physical/climate/Pedology products, substrates, all 24 other
scorer layers and prior occupancy hold exactly. All 6,996 current score,
factor-product and compatibility-aware planner samples agree. The twelve
rainforest-to-mangrove substitutions remain; all 31 mangrove intents are
statically compatible, allowed and written in the mock execution. All 140
prior resources survive with eight habitat-legal additions. Starts remain
uncaptured by this observer and separately checked by the unchanged bank.

SDK decoding of the receipt-hashed bank logs yields 57 complete application
records in each arm. Against the bare response candidate, mangrove attempts
move `674 -> 116`, writes remain `116`, and refusals move `558 -> 0`. Marsh
and bog writes remain exactly `245` and `190`; oasis and watering-hole writes
remain zero. Each of the five previously all-refused mangrove records now has
zero mangrove intent. Its ordinary vegetation recovers without changing any
physical score or floor: savanna returns to `60/55/95/61/39` and sagebrush to
`1414/1374/1348/1383/2602`, exactly the pre-unit dry-map outcomes. Log ordinals
are not invented seed identities; scenario-specific comparisons remain bank-owned.

The complete bank takes about 104 seconds and retains all 22 studies, 57
unique scenarios and 4,430 unchanged expectations. It has 4,429 passes, the
exact same thermal failure at `0.142881437915705 C`, no new failed leaf and no
failed-leaf deterioration. The eight numeric changes from the pre-unit bank
are confined to Archipelago habitat substitution and resource opportunity;
all Earthlike and Desert Mountains observations hold exactly. Wetland share
increases within its unchanged ceiling and rainforest decreases while retaining
its unchanged presence requirement. Those are explained outcomes, not blanket
directional improvement or restored-count acceptance.

The combined unit is qualified for adoption; the bare response remains
historical refused-release evidence. Generated, installed and freshly native
execution claims remain distinct. This closes impossible wetland reservation,
not the open terrestrial river/lake opportunity or root-zone balance.

## Hierarchy-Only Moisture Retirement

Fresh retained-input investigation refuses the proposed annual-deficit local
response before implementation. At the retained Huge `2/2` anchor, all 1,781
exposed cells with a represented channel or adjacent channel/strict finite
water have annual precipitation at least as large as final empirical demand.
The Archipelago `1018/1018` raw-demand replay independently finds no overlap
between its 360 local-source targets and 24 positive-deficit cells. A response
bounded by `max(0, demand - precipitation)` would therefore be identically zero
on both anchors. This is absence of candidate support, not evidence of
year-round root-water sufficiency, freshwater quality or seasonal persistence.
No new plant-stress field, gain, threshold or root-zone solver is selected.

The retained Huge consumer trace also finds no unrealized admitted rainforest
or forest: 52 rainforest-biome cells reduce to 43 after flat-terrain and prior
occupancy exclusions, and all 43 are realized; 584 forest-biome cells reduce to
261 and all 261 are realized. No local-source target receives an aridity
moisture-zone shift. Regional biome envelopes, rather than a demonstrated
score-admission defect, explain this anchor's sparse rainforest. Preserve
those rules; more vegetation is not the acceptance target.

Select the narrower demonstrated correction: retire the budget operation's
extra minor `+4` / major `+8` effective-moisture increment and its required
river-class input. At unchanged physical water supply, changing only the
navigable promotion threshold currently changes 285 moisture samples. A display
hierarchy must not supply additional ecological water. The operation will
publish `M = rainfall + 0.35 * humidity` on resolved exposed land and zero on
water. Preserve the existing PET and aridity arithmetic exactly.

This is a distinct transition from refused removal control A. The current
refined precipitation/humidity, albedo, temperature, freezing and final demand
remain unchanged; the existing any-river corridor relationship is not retired
or relabeled as a resolved plant-water budget. Finite-shore plant access and
atmospheric wetness-injection semantics remain open causal-owner obligations.
Baseline humidity is a rainfall-derived wetness proxy, and baseline demand is
computed on all surfaces; correct their stale descriptions without changing
the arrays or introducing parallel artifacts.

### Prospective Qualification

- Retire the input at its contract, sole recipe call and focused fixtures; no
  ignored compatibility key or fallback lane remains. Required demand keeps
  its double precision until the existing Float32 publication.
- At held rainfall/humidity/demand/exposure, the public operation is exactly
  independent of river display hierarchy. Verify the retained physical
  `.88/.92` contrast without another geography execution.
- One exact current-incumbent/candidate Huge `2/2` pair must hold physical geometry, baseline and
  refined climate, demand/aridity, freezing, drainage/lake ledgers and physical
  projection intent. Effective moisture, biome/density, features, resources
  and start arbitration are measured downstream consequences, not blanket
  identity claims.
- Preserve the complete map-selected bank, every comparator and bound. Require
  no new failed leaf and no deterioration of the existing failed leaf; report
  the unchanged thermal failure separately. Do not tune a score, count, gain or
  bank requirement to admit this correction.
- Use fresh SDK/semantic review and actual owner checks before adoption. Keep
  generated, installed, fresh native and gameplay proof distinct. A refused
  result remains a completed experiment, not a partially installed change.

### Completed Hierarchy Retirement Qualification

The clean candidate at `fee7fe8a1705` removes only the extra display-class
moisture increment and its closed input. Fresh SDK review finds no additional
abstraction, compatibility lane or owner-contract defect. Existing refined
rainfall/humidity, thermal and cryosphere operations, Number demand and aridity
arithmetic remain unchanged. The any-river refinement input remains explicit;
this is not complete atmospheric-injection retirement.

An exact paired Huge `2/2`, ten-player public recipe execution against current
main `2661c8b83312` holds all 35 nonconsequential public model fields, six
non-feature projection keys and physical readback. Both arms pass all 49
existing integrity expectations. The candidate takes about 2.78 seconds and
changes effective moisture at 1,706 cells, modeled biome at 162 and vegetation
density at 1,527. Final mock readback changes 144 biome, 71 feature and 52
resource cells. Forest moves `261 -> 227` and rainforest `43 -> 38`, with no
feature refusals; these are measured consequences, not vegetation-count goals.
All ten seats remain full and dry/non-NAV, with zero unseated players. Start
arbitration changes, and all 236 mock resource intentions are placed. This does
not imply corresponding native engine admission.

The historical `.88/.92` captures separately establish the actual defect:
98 display-class changes caused 285 moisture changes despite unchanged physical
network and forcing. The new closed public operation is hierarchy-independent
at explicitly held humidity and Number-demand controls and publishes exactly
`Float32(rainfall + 0.35 * humidity)` on exposed land. That control does not
reconstruct uncaptured raw climate or prove final vegetation identity when
navigable terrain changes.

Full owner verification passes 1,328 definition tests, 371 realization tests
and 412 Studio tests; types, policy and builds pass. Only the pre-existing
thermal aggregate fails. The unchanged complete bank takes about 104 seconds,
retains 22 studies, 57 unique scenarios and all 4,430 expectations, and records
4,429 passes with the exact same thermal failure at `0.142881437915705 C`.
The 97 numeric consequences introduce no new failure, status change or
failed-leaf deterioration. Fifty-two move toward a bound without crossing it;
they are not mislabeled universal improvement. No comparator, threshold or
vegetation quota is changed.

Public capture omits final raw humidity, Number demand, albedo and freezing.
Unchanged source and owner tests qualify their computation; the paired observer
does not invent their readback. Generated, installed and fresh native claims
remain separate. Finite-shore plant access, regional versus local habitat
composition and atmospheric wetness semantics remain open causal questions.

## Local Biome Support Before Additional Water Response

The existing classifier is per tile, not a single fixed category for an entire
region. A valid local moisture input can select a locally humid biome without
changing atmospheric temperature or precipitation. Before designing another
water-response law, qualify whether that admitted local support survives the
existing categorical refinement.

At the unchanged Earthlike selection (`radius: 1`, `iterations: 3`), a valid
synthetic single humid cell and one-tile-wide humid column both classify as
`temperateHumid` from their supplied temperature/moisture/aridity, then become
`temperateDry` solely through category-majority smoothing. The filter has no
receiver climate evidence, so it can also promote an unsupported dry receiver
when humid neighbors dominate. The four retained production witnesses remain
exclusion witnesses, not proof that those cells deserve trees or a particular
water-supply increment.

Density is already a continuous climate/soil response and does not depend on
the biome symbol. Its unchanged value is not a stale class-specific biomass
bug. The demonstrated inconsistency is local physical support versus the final
categorical gate used by native projection, vegetation and other habitat
consumers.

### Selected Owner Correction And Alternatives

Retire category-only majority smoothing, its obsolete configuration and its
Gaussian strategy identity at the existing classification owner. Keep one final
published biome artifact, the exact local classification law, continuous density,
treeline and forwarded climate. Migrate the three live authored selections; do
not leave an ignored control, legacy strategy or parallel raw-biome lane.

Retaining cosmetic refinement would require a defensible way to distinguish
unsupported noise from physically supported narrow habitat. The present filter
cannot do so. A second local/regional framework, downstream forest rescue or a
larger Hydrology gain to overpower the filter is not selected. If the underlying
physical inputs prove noisy, repair that owner rather than repaint categories.

### Prospective Qualification

- Existing public-operation tests must retain supplied narrow humid support,
  avoid promoting an unchanged dry receiver from neighbor popularity, and
  preserve the water sentinel, zero water density, cyclic-X translation,
  bounded north/south behavior, determinism and input nonmutation. Density,
  treeline and forwarded climate must remain exact. Retired selections must
  fail admission rather than silently doing nothing.
- An exact current-incumbent/candidate Huge `2/2` pair must hold physical
  morphology, climate, water budget, drainage, lakes, river hierarchy and
  continuous density. Biome, feature/resource outcomes and start arbitration
  are measured consequences, not restored-count targets.
- Preserve the complete existing map-selected study bank, all identities and
  bounds. Require no new failed leaf or worsening of the retained thermal
  failure. The bank's row-based biome measures do not establish two-dimensional
  patch coherence: inspect the paired viewer and attribute changed categories
  to each receiver's admitted local inputs before adopting the candidate.
- Use existing Standard `1/1`, `42/42`, `1018/1018` and Huge `2/2`
  identities for the bounded paired topology inspection. Compare per-biome
  wrapped-hex component sizes and singleton populations without manufacturing
  a new fragmentation threshold. Unresolved physical support or problematic
  topology is inconclusive, not an excuse to adjust classification parameters.
- Reuse current feature legality, resource and start checks, with fresh SDK
  review and owner verification. A greener map, larger rainforest count or
  lower row dominance alone does not qualify the correction. A failed topology,
  support or collateral guard refuses adoption without tuning a quota or gate.

This transition does not add plant-water supply, establish seasonal root access,
retire the remaining atmospheric wetness injection, or resolve the outstanding
thermal calibration. Precipitation, river/lake/coast opportunity, finite storage
and usable root water remain distinct parts of the causal investigation.

### Completed Local Classification Qualification

The clean candidate at `1426673bce1` returns the existing per-tile biophysical
classification directly. The three live selections use `biophysical`; the
Gaussian strategy and `edgeRefine` are retired and fail canonical admission.
There is still one final published biome artifact. Classification thresholds,
continuous density, treeline and forwarded climate are unchanged. Fresh SDK
review finds no additional abstraction, compatibility path or owner defect.

The four prospective current-main/candidate pairs hold all 37 non-category
public model keys, including moisture, temperature, rainfall, aridity,
vegetation density and the physical water network. Six non-feature projection
keys and eleven physical readback fields also hold. The former category
overrides affect `72 / 66 / 45 / 53` cells in Huge `2/2` and Standard `1/1`,
`42/42`, `1018/1018`; every candidate category now equals the unchanged helper
applied to its receiver's observed inputs. All 49 integrity expectations pass
per arm, all founders remain full and dry/non-NAV, all planned mock resources
are realized, and there are no feature refusals. Mock acceptance is not native
engine admission.

Forest moves `227 -> 230`, `263 -> 257`, `118 -> 114`, `198 -> 186`;
rainforest moves `38 -> 40`, `16 -> 18`, `11 -> 13`, `17 -> 24`.
Neither increase nor count restoration is an acceptance condition. Per-biome
wrapped-hex components increase `69 -> 83`, `57 -> 74`, `54 -> 71`, `54 -> 74`.
Singletons increase from 47 to 88 of 7,304 exposed land cells across the four
maps. Independent component-overlap tracing finds only three incumbent patch
splits; the dominant regions remain intact. The additional small patches have
local moisture, aridity or temperature explanations under the existing law.
These observations do not establish universal fragmentation limits or an
Earth-calibrated classifier. In particular, narrow cold-desert patches expose
an existing threshold discontinuity rather than a newly introduced noise law.

All four paired biome viewers are visually inspected. The changes are local
boundaries and pockets; the broad latitude bands predate this unit and remain.
The observer's category-only helper call does not reconstruct uncaptured raw
freezing or soil fields or claim a second density comparison.

Full owner verification passes 1,326 definition tests, 371 realization tests
and 412 Studio tests; types, policy and builds pass. The complete unchanged
bank takes about 103 seconds and retains all 22 studies, 57 unique scenarios,
112 targets and 4,430 expectations: 4,429 pass with the exact same thermal
failure at `0.142881437915705 C`. The 84 numeric consequences introduce no
new failure, status change or weakened gate. Twenty-seven move toward a bound
without crossing it; they are not mislabeled universal improvement. Independent
director review verifies the full authority tree, statuses and retained
input/receipt bindings before adoption.

This removes a demonstrated downstream override before further water-response
design. It does not establish root-zone supply, make every shoreline wet,
retire the any-river atmospheric proxy or resolve thermal calibration.

## Completed Seasonal Shortfall Discriminator

The next bounded investigation retains all 24 baseline integration phases for
procedural Earthlike Huge `2/2`, not the two/four visualization samples or fixed
Earth geography. Public recipe execution stops between the completed shelf and
baseline steps. The existing SDK test composition then invokes the actual
baseline owner once with cloned original topography, full shelf and compiled
configuration. A complete current recipe independently reproduces the same
published annual rainfall, humidity and demand exactly. Original inputs remain
unchanged; sealed ground, exposure, finite-water identity/head and routed-flow
cohort fields also match the retained capture exactly.

Preserve phase rainfall/humidity as `u8`, demand as `f64`, temperature as `f32`
and the exact normalized weights. The diagnostic is
`S = sum(w * max(0, D - P))`. Its warm contribution includes only coeval
`T > 0 C` without renormalizing weights; that gate is not a biological growing
season. Compare separately with `max(0, sum(w * (D - P)))` and published annual
deficit. Annual rainfall includes rounding and a clamp to 200; demand is
published as Float32. Reconstruct these exactly rather than attributing every
annual-versus-phase difference to temporal averaging.

| Exposed population | Tiles | Positive phase shortfall | Positive warm contribution |
| --- | ---: | ---: | ---: |
| All exposed land | 2,501 | 326 | 34 |
| Adjacent strict finite water | 308 | 42 | 2 |
| Shore at highest adjacent head | 69 | 10 | 0 |
| Shore above all adjacent heads | 239 | 32 | 2 |
| Own ordinary noncomponent routed `Q > R` | 1,236 | 189 | 17 |
| Marine-only control | 107 | 0 | 0 |

Thirty-seven finite-shore cells have positive phase shortfall while both raw
and published annual deficit are zero: real temporal cancellation is present.
Five other shores already have positive baseline annual deficit; this is not
the preceding investigation's final refined-demand comparison.
However, forty of the forty-two shore responses are cold-only under the
declared gate. The two warm responses have maximum annual-weighted magnitude
`0.12844` in empirical rainfall-index units, not millimetres or root uptake.
This does not support a blanket shore bonus or a gain chosen to restore forest.

All exposed members of this anchor were originally land. Originally wet but
later exposed terrain and below-head shore cohorts are empty, not qualified
zero-response controls. The earlier 539-cell unrepresented-channel interior
comparison includes unclassified routed flow; its 156 phase and 17 warm
responses do not prove an isolated source. A stricter no-local-cue population
has only seven cells, with no positive response; it cannot establish absence
of subsurface water or serve as a representative planet-wide control.

The complete observation, one procedural prefix and one complete recipe take
about five seconds, with no build or native request. Private retained raw data
is about 9.5 MB; no production observation hook, artifact family, test framework,
new model or dependency is introduced. Source and installed product are unchanged.

**Decision:** seasonal averaging matters, but this empirical atmospheric
shortfall does not establish usable local-water supply, lake persistence,
freshwater quality, channel stage or a vegetation response law. Do not promote
vegetation beside every river, lake or coast, or make river display class a
water source. Keep the remaining any-river rainfall injection and regional
thermal/moisture response as explicit upstream owner questions. Resolve those
meanings before adopting a replacement local-water calculation; the existing
Hydrology budget remains the composition owner and Ecology its consumer.

## Prospective Atmospheric-Proxy Retirement

The current-source comparison retires only the remaining river/enclosed-basin
precipitation operation, its controls and wiring. Hierarchy-only budget
retirement, marine consumers and local biome classification are already adopted.
Do not reuse the historical A implementation or receipt as current proof.
No new local-water index, shore gain, thermal model or habitat tuning belongs
to this unit. Baseline atmospheric rainfall and humidity become the sole final
rainfall/humidity vintage; existing thermal and ecological consumers remain.

The director and a fresh relief/climate steward prospectively replace the
workstream's scalar non-deterioration veto with attributed-retirement proof.
The executable `1 C` thermal requirement, comparator, original-land population,
scenarios and failed status remain unchanged. Unsupported snow variation is
not independent evidence of physical quality. Its removal does not by itself
establish harm, but explaining a scalar cannot excuse a bad map or habitat loss.
Historical A remains refused under its original protocol.

Before execution, freeze these holds and falsifiers:

- Keep baseline atmosphere and pre-network demand, initial/sealed geometry,
  drainage, lake ledgers, physical hydrography and physical projection intent
  exact. Final candidate rainfall/humidity must equal baseline arrays.
- Retain the actual pre-albedo thermal field. Replay the unchanged cooling
  owner with each rainfall arm and close every changed temperature to that
  mechanism. Zero-albedo controls retain temperature exactly.
- Attribute row-centered variance and covariance on every original-mask
  thermal-cohort case, including later-covered cells. The earlier Huge2
  decomposition is not this proof; sampled seasonal means are not the exact
  independently integrated annual thermal field.
- Run the unchanged full bank with no new failed leaf or comparator change.
  Explain material habitat substitutions, resource and founder consequences;
  vegetation totals alone are inadequate. Current marine behavior must be
  qualified rather than assumed safe from its earlier repair.
- Inspect aligned paired map views for coherent, usable habitat and placement.
  Fresh native realization is separate proof before claiming a deployed result.

Unexplained thermal changes, changed physical water, new bank failures, lost
legitimate habitat or unacceptable visible structure refuse this candidate.
No compensating constant rescues it. A qualified retirement still leaves local
plant-water opportunity and regional thermal response as distinct next owners;
missing physical measurements do not prohibit a defensible, explicitly modeled
game-scale approximation.

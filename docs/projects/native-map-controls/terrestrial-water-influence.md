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

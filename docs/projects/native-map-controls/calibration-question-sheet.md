# Earthlike Calibration And Projection Questions

Owner: root. Opened 2026-09-29. This is the single question/decision sheet for
the user's combined Earth benchmark, river-density and lake-height questions.
The user delegates sequencing, design, implementation, independent review and
coherence/native verification; the questions are material to investigate, not
a prescribed implementation pipeline. Continue in the existing worktree/stack.

## Intent And Authority

Produce a coherent Earthlike baseline before tuning for other worlds. Preserve
physical meaning while using Civ7's native representation rather than fighting
it with unqualified corrections. Keep three facts distinct: physical intent,
our projection inputs, and what Civ7 actually realizes. A pleasing shoreline
or preserved setter output cannot substitute for agreement between all three.

Real Earth constrains process plausibility; Firaxis Earth constrains one
playable game-scale representation. Neither is a universal river-count target.
The existing domain operations and Standard study infrastructure remain the
owners. Do not introduce a second engine, private artifact injection or a
parallel benchmark harness. Supporting design: [Earth calibration](earth-calibration.md).

## Questions And Discriminators

| Question group | What is established | What must discriminate the remaining hypotheses |
| --- | --- | --- |
| Baseline calibration | Current Earthlike hot/high controls compile to 28.44-degree tilt and warm thermal offsets | Correct effective Earthlike inputs first; hold geography and other identities; measure climate/hydrology consequences rather than declare empirical calibration complete |
| Physical versus native lake height | Cutoff20 preserves initial native water heights and fixes the tested cliffs; no wet-footprint expansion | Compare physical bed, physical spill/water surface, sea datum, projected setter input, immediate native level and final level for each body |
| Bounded lake classification | Unlimited cutoff reclassifies oceans; bounded20 succeeds on Huge1018; Huge42 has a 33-cell physical lake | Native classification/height fidelity and gameplay consequences under bounded controls, not just bigger cutoff or nicer rendering |
| Rivers and scale | Huge1018 has 1.93 times Firaxis Earth's land-normalized dry NAV density, with shorter dry components | Separate total drainage density, major-class policy, wet-connected trunks, terrain barriers and real vessel/era usability |
| Fixed Earth geography | Finished relief constrains routing but does not uniquely determine climate, water availability or lake beds | Reference-forcing and predicted-climate arms on the same admitted surface; declare units, materials, epoch, conditioning and missing processes |
| Network maturity and relief | Current incision uses preliminary routing; C3 design is not implemented | After baseline qualification, compare the climate-fed certified network with terrain evolution; preserve genuine closed basins and Earth irregularity |
| Native versus model defects | Wet outlet declarations are implemented; native category/height effects remain distinct | Change the earliest incorrect owner: config, physical operation, projection or native policy; never tune physics just to conceal realization loss |
| Completion and gameplay | Elevation/climate/relief/static basins/dry rivers/wet outlets exist in the local stack, not merged | State which fixes are default versus diagnostics; qualify ship passage with era-appropriate stock control; run full studies and refresh visible evidence |

## Lake-Height Hypotheses

- H1: Civ maintenance damages an otherwise faithful physical-surface projection.
  Compare physical surface intent to the pre-maintenance native water level;
  preserving an already wrong level cannot pass this test.
- H2: our writer supplies submerged ground where a water-surface projection is
  needed, leaving Civ to infer a different level. Current source supports this
  as a real contract gap: `projectStandardElevation` does not consume physical
  `waterSurface` or spill elevation. Quantify it before choosing a correction.
- H3: cutoff changes both water category and leveling behavior, potentially
  making a visual improvement physically wrong. V11 did not expand water and
  did not change the initial post-setter height array, but that does not reject
  H2 or establish physical surface fidelity. V12 proves category changes can
  also affect marine height/features; it does not invalidate every finite cutoff.
- H4: some apparent disconnections are legitimate divides, steep channels or
  distinct water surfaces. Directed physical paths, slopes, body identities
  and native evidence distinguish these from missing writes or unsupported joins.

No added water footprints in V11 is a resolved non-problem. Physical lake-height
fidelity, every gameplay effect and ship traversal are not resolved by it.
See [native water-height evidence](water-height-maintenance.md).

## Execution Order

1. Correct the demonstrated authored baseline mismatch and lock effective
   compiled parameters with regression tests. Run held-geography comparisons
   and existing climate/ecology/network/placement studies before adoption.
2. Establish a versioned fixed-Earth reference with a truthful admission and
   unit contract. Keep the Firaxis game geometry and empirical relief/forcing
   references explicitly different. Begin with bounded operation fixtures;
   full Standard support requires its complete producer dependencies.
3. Close the physical-to-native water-surface ledger, using the already retained
   maps first. Run only the ablations needed to distinguish leveling,
   classification, setter semantics and shoreline effects. Source inspection
   can proceed in parallel with baseline work; defer causal tuning until the
   baseline is stable.
4. Select the smallest complete solution set supported by those discriminators.
   Bounded native classification is preferable to compensation only if it
   preserves intended surface meaning. Repair projection if its inputs are
   wrong; repair physical algorithms only for demonstrated physical errors.
5. Implement one reviewed, tested Graphite domino at a time. Repeat the
   fixed-Earth, held-out basin, map-size and diverse-world cohorts; qualify
   native realization and actual movement separately, then refresh the gallery.

This sequence supersedes a blanket preference for either cutoff40 or a late
height-restamping pass. Both remain candidates until the physical-surface
comparison resolves their meaning. A constant must not be selected merely
because it repairs the current screenshot.

## Done Means

Every question has an observed disposition or a specific unmodeled limitation;
no unresolved question is silently encoded as a passing metric. Numerical
computation lives in domain operations and recipe steps compose it. Preserve
mass accounting, adjacency, marine identity, intended water footprints and
feature/wonder legality under the selected policy. Use identical seed/surface
for causal comparisons and independent regimes for generalization. Never
claim an ordinal game-cell result is measured Earth discharge.

## First Domino Expectations

Authored controls only; no model, native policy, density or study-bound changes.
Selected alternative: neutral temperature/seasonality knobs plus explicit
four-mode 23.44-degree tilt. Rejected alternative: retain hot/high and subtract
hidden offsets in thermal/tilt leaves, which conceals baseline meaning.

| ID | Expected result | Guard / falsifier |
| --- | --- | --- |
| B1 | Baseline tilt 28.44 to 23.44; four modes held | Assert effective compiled values, not authored JSON alone |
| B2 | Thermal baseline 10.5/60 to 8/50; refine 11.5/60 to 9/50 | Remove hot offsets in both owners; not a claim these constants match observed Earth temperatures |
| B3 | Pressure RMS 118.75 to 95; precipitation noise 18.6667 to 14 | These are the declared consequences of neutral seasonality; no other compiled leaf changes |
| B4 | Foundation, physical ground, marine mask and sea datum HOLD exactly | Same-seed Huge1018, Huge42, Standard1018 comparisons |
| B5 | Other seven shipped configs and outputs HOLD | Existing full study bank and configuration identity checks |
| B6 | Climate, lake budgets and river classes may respond | Preserve integrity, legitimate open/closed handling, climate/ecology/relief/placement guards; do not demand old water counts |
| B7 | Repeated output is deterministic | Repeat reference case; record hashes, effective inputs and failures |

Run existing owning check/test/build targets and study protocols; do not loosen
targets to accept the new baseline. A failed physical or collateral guard
requires causal investigation before acceptance. Native water behavior is a
separate domino and is not tested by this config-only change.

Results and dispositions will be appended as each complete slice is verified.

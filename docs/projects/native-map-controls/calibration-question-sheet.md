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
| Baseline calibration | The retained Earthlike hot/high controls compile to 28.44-degree tilt; the neutral candidate exposed conflicting thermal owners | Establish one independently published thermal chain, then calibrate with held geography and external references rather than accept knob names as empirical proof |
| Physical versus native lake height | All 55 V11 bodies match converted physical spill heights under observed native water encoding; no wet-footprint expansion | Qualify encoding and preservation beyond this open-basin cohort, including altered shoreline, sea-level and closed-basin controls |
| Bounded lake classification | Unlimited cutoff reclassifies oceans; bounded20 succeeds on Huge1018; Huge42 has a 33-cell physical lake | Native classification/height fidelity and gameplay consequences under bounded controls, not just bigger cutoff or nicer rendering |
| Derived cutoff and inland seas | A largest-lake bound is a projection requirement, not a physical lake-size limit; one global threshold may not separate all intended categories | Derive both the required lake bound and the protected non-lake bound after hydrology; verify native component semantics, strictness and when the setting can be applied; report an unrepresentable overlap rather than alter physical geography |
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
  needed, leaving Civ to infer a different level. The writer does not consume
  physical `waterSurface` or spill elevation, but the completed all-body census
  finds correct converted physical spill heights on all 55 V11 bodies. That
  rejects a mismatch on this cohort, not every future surface or lake regime.
- H3: cutoff changes both water category and leveling behavior, potentially
  making a visual improvement physically wrong. V11 did not expand water and
  did not change the initial post-setter height array. The separate physical
  surface census qualifies the numeric relation for this cohort. V12 proves category changes can
  also affect marine height/features; it does not invalidate every finite cutoff.
- H4: some apparent disconnections are legitimate divides, steep channels or
  distinct water surfaces. Directed physical paths, slopes, body identities
  and native evidence distinguish these from missing writes or unsupported joins.

No added water footprints and no physical-sill mismatch in V11's 55-body census
are resolved non-problems for that tested map. General surface semantics,
every gameplay effect and ship traversal are not resolved by it.
See [native water-height evidence](water-height-maintenance.md).

## Derived Classification Policy

The user's follow-up proposes deriving `LakeSizeCutoff` from the generated
water bodies. Prefer a derived requirement to an arbitrary authored constant,
but do not equate it with an implementable native runtime setter. Inspected
shipped source exposes this value in the `Maps` database rows; the successful
diagnostics change a map-scoped database component before generation. No
runtime mutation contract has yet been established.

Derivation belongs after physical basin/water-budget resolution, not solely
after Foundation or Morphology. It needs realized connected wet components,
their intended category and protected marine/non-lake components, including
connections or splits introduced by projection. A valid size threshold must
include every intended native lake while excluding every protected non-lake
component. Inclusive versus exclusive comparison and native component rules
remain measured questions. If those requirements overlap, no global size
threshold can express the requested classification; silently choosing the
largest lake anyway is not a solution. Do not clip lakes to make the threshold
convenient or turn marine water into lakes to preserve heights.

River outflow does not define lake versus sea. Open lakes have an outlet;
closed lakes do not. Salinity, water balance and exchange with marine water
are separate properties; even the term inland sea spans different hydrologic
settings. At our current resolution, retain basin identity, marine provenance,
surface and directed connections rather than infer a physical category from
the presence of a Civ NAV tile. Some marine provenance itself may be a model
limitation, not ground truth, and must be exposed in the fixed-Earth study.
References: [USGS lake hydrology](https://www.usgs.gov/water-science-school/science/lakes-and-reservoirs),
[NOAA/FGDC coastal and marine classification](https://coast.noaa.gov/data/digitalcoast/pdf/cmecs.pdf).

Required discriminators: an outflow lake, a closed lake, a narrow marine
connection, two basins linked by river tiles, and an intended lake larger than
a protected enclosed marine component. Test the classification request and
native realization separately. A host preflight/two-pass path is an option
only if necessary and compatible with ordinary in-game generation; it is not
assumed or authorized as a new default architecture by this hypothesis.

**Civ-specific connectivity hypothesis:** the user correctly distinguishes a
strait of ordinary water tiles from a visually wide navigable river. Shipped
`terrain.xml` marks COAST/OCEAN as water; NAVIGABLE_RIVER does not set that flag
(the schema default is false). Shipped `map-utilities.js` also checks a NAV
river's ocean connectivity separately from an ordinary water area's ocean
connectivity. These are source-backed reasons to test ordinary connected water
component size as the classifier, not to infer semantics from visual width.
Cutoff 6,996 may simply admit the whole connected ocean component because it
fits under the limit. That result does not reject a bounded cutoff of 100.

The next minimal native discriminator holds basin geometry and elevation fixed
and changes only its ocean connection: ordinary water-tile strait, dry NAV
corridor, dry MINOR corridor, or no outlet. Cross with bounded cutoffs and an
exact-boundary size case. Record ordinary water connectivity, native area IDs,
`isLake`, initial/final heights and river ocean connectivity separately. If
connectivity plus size explains the result, use that simple native contract;
do not invent additional salinity or lake/sea rules to solve this projection
problem. Real-world terminology remains context, not a new implementation gate.

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

### Baseline Acceptance Findings

The four authored edits compile to exactly the seven declared changes. Three
same-seed comparisons (Huge1018, Huge42, Standard1018) preserve physical ground,
original water mask, sea datum, drainage receivers, lake footprints and water
surfaces exactly. Huge1018 repeats with identical field hashes and all metrics.
Discharge and river classification respond; mountains/hills also respond to
the changed river exposure constraints, without changing physical ground.

The full owner test run found two adoption failures, not a completed baseline:
Standard seed1354 crosses the resource-density spread limit (1.408137 before,
2.006947 after; limit2), and seed3 loses dry/seasonal habitats and drops from
five vegetation families to three (minimum4). Paired retained/current config
replays reproduce both; the other seven presets did not fail. No target is
being weakened and neutral knob names are not evidence of empirical calibration.

The resource failure exposes an existing inconsistency: rotation and target
completion enforce density equity, but the later regional-minimum pass bypasses
the same guard. Repair that pass in its domain operation, admitting an alternate
legal site where possible and otherwise recording an explicit regional shortfall
like its existing spacing/exclusion refusals. Do not add unrelated resources
above target merely to repair a ratio. Preconditions: a synthetic crossing case
fails first; a valid alternate-site case succeeds; repeat the full placement
cohort with unchanged bounds. The repair now passes the placement cohort and
88 resource-domain tests, including validated regional shortfall reasons.
This shared repair is measured separately from
the configuration-only B5 hold, not hidden inside it.

The ecological discriminator finds two independent thermal owners: baseline
seasonal temperature drives evaporation/demand, while refine recomputes the
ecology field with different sunlight and 23-times stronger elevation cooling.
Their land means differ by roughly 28 degrees C in the retained seed3 case.
The [thermal coherence design](thermal-coherence.md) supersedes accepting the
config-only candidate as the next complete domino. Establish one thermal
handoff, repair independently demonstrated defects, then calibrate against
Earth evidence. B1-B7 above remain the historical config-only expectations,
not a false unchanged-output promise for this shared repair. A `hot` label
alone did not establish that the previous generated map was empirically warm.

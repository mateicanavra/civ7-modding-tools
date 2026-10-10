# Official Source Compatibility

Status: current-source API and policy/consumer migration implemented and verified
headlessly. This prerequisite is
separate from elevation and rivers because resource legality and distribution
must have a stable baseline before evaluating native controls.

## Required Semantics

Installed `Base/Assets/schema/gameplay/01_GameplaySchema.sql` establishes
`Weight=1`, `MinimumPerLandmass=1`, `LandmassUnique=false`, and placement-row
`Resource_ValidBiomes.Weight=1.0`. Defaults must come from official schema, not
the old assumption that omitted weights mean 10 or omitted minima mean zero.
Preserve positive fractional weights: gold 0.5, hides 0.25, tin 0.4.

Installed `Base/modules/base-standard/maps/resource-placement-common.js`
provides the consumer evidence:

- Lines 311-328 and 470-495 assign/enforce minima for every active resource
  with legal regional plots, not only resources required for the age.
- Line 128 reads engine landmass-region ID; line 319 iterates positive IDs.
  Swooper's existing published slots 1/2 map to native WEST/EAST through
  `plot-landmass-regions`. Physical connected-island IDs have a different role.
- Minimum admission uses existing positive slots with legal candidates, not
  hardcoded demands in both slots. Region zero receives no regional floor.
- No replacement exists for `MapResourceMinimumAmountModifier`. Remove its
  extraction, type, export, resolver, propagated input and arithmetic, rather
  than maintaining a misleading zero-returning compatibility shim.
- Lines 197-203 split unique resources into two shuffled groups. Positive
  regions match `(id - 1) % 2 + 1`; region zero is unrestricted (lines 96-101).
  This is not one-resource-per-connected-island semantics.

Only cocoa, spices, sugar and tea are unique in the installed base corpus, all
later-age resources. Swooper's initial authoring age remains Antiquity. Publish
the official flag, prove all currently admitted resources are non-unique, and
explicitly refuse future unique-resource admission until group assignment is
designed. Do not invent later-age placement to unblock an Antiquity generator.

## Deliberate Policy Boundary

Retain existing Swooper candidate selection, habitat targets, spacing and
resource-weight rotation. Remove `>=1` clamps/admission and normalize around
the new baseline 1, preserving relative fractional weights.

Firaxis prefers a per-placement-row weight at line 227 and uses it in native
density at line 291. Its density algorithm is not the same as Swooper's existing
product policy. Preserve the factual tuple weights but do not claim native
distribution parity or silently substitute a new algorithm.

## Implementation Layers

1. **Asset-edge materializer prerequisite.** Omit only a bare side-effect SCSS
   import with an evidenced canonical shipped CSS companion. Retain exact
   importer, specifier, source, map and CSS provenance in the schema 4 receipt.
   Unknown assets, bindings, attributed imports and re-exports remain refused.
   Preserve module scope when the omitted import was the only module marker.
   The pinned corpus remains supported and declaration-byte-identical.
2. **Current corpus and policy adoption.** Admit installed corpus facts and
   explicit non-script map evidence. The 15 config rows are 14 JavaScript maps
   and one binary `Earth_Huge.Civ7Map`, not 15 JS roots. Refresh source/API/policy
   through their owning generators and migrate all consumers in one green
   layer, or independently green preparatory layers. Never commit a knowingly
   broken gitlink update alone.
3. **Placement baseline.** Run focused schema/corpus/demand/site tests, broader
   graph checks and stable placement studies. Record changed distribution here
   before native-control comparisons start.

## Bounded Write Set

Paths below are relative to the repository, not new ownership:

| Owner | Changes |
| --- | --- |
| `packages/civ7-map-policy/scripts/generate.ts` | Schema-backed defaults and provenance; new landmass facts; delete modifier extraction; regenerate `src/civ7-tables.gen.ts` |
| `packages/civ7-map-policy/src/resources` | Refresh curated corpus facts and types/runtime IDs; delete modifier resolver and export; preserve curated dispositions |
| Swooper resource-demand schemas, policy, contract, strategy and artifact | Admitted-resource minima, positive fractional weights, exact fact validation, unique-admission refusal; remove obsolete engine/minimum inputs |
| Swooper site-selection contract and rotation strategy | Eligible positive-region minima and fractional rotation |
| Placement recipe demand/site steps | Remove old modifier/engine-observation plumbing; preserve published region owner |
| Adjacent tests and canonical resource documentation | Prove new facts, defaults and intentional product-policy boundary |

Refresh all changed corpus facts, not only cotton. Installed resources-v2 also
adds limestone tundra-hill placement and two hardwood feature placements.
No adapter change is needed for this policy migration. Do not delete generic
`isResourceRequiredForAge` helpers still used elsewhere.

## Acceptance

- Omitted/default and fractional weights; explicit/default minima; invalid
  values; schema provenance; absence of the removed modifier surface.
- Exact normalized official XML corpus facts, legality tuples and runtime IDs.
- Non-staple/non-required resources receive their admitted minimum without
  engine-availability dependence; unique initial-resource admission refuses.
- No region-zero floor, no floor for absent/ineligible regions, explicit minimum
  three, sparse-capacity shortfall, and distinguishable fractional rarity.
- Support adjustments cannot move a region below its protected floor.
- Policy generation/check/tests, Swooper check/resource tests, then broader
  build/test graph and placement studies. No checks bypassed for freshness.
- Snapshot, generated output and live realization identities agree before any
  native-controls runtime claim.

## Current-Source Verification

The published snapshot is `89cee44d5ae7192f126e8ae09484c04400df9146`.
All three generated policy outputs were regenerated at that commit. All 55
curated resource dispositions and rationale text are preserved; factual values
and legality tuples follow the new XML/SQL. Cotton's flat placement changes
from plains to grassland. Fractional weights and default regional minima are
preserved, and the removed modifier surface has no compatibility shim.

Policy build/check/test/test-types/tools-types pass (83 tests, 2,715 assertions).
Swooper's check graph passes, with 74 resource tests and 27 placement/generation
tests passing. Independent source-policy and consumer reviews found no material
defects. The 20-seed placement cohort and representative relief sample pass;
see studies.md. No native density parity or live legality result is claimed.
The final combined API-generator/API/policy/Swooper check graph passes all 44
tasks, and independent review of the source projection found no material issue.

The setup-parameter census changes from 63 to 65 rows for shipped sea-level
variants `shuffle-voronoi` and `terra-incognita-voronoi`; the 56 unique IDs,
16 groups and 31-column invariants remain. Binary `Earth_Huge.Civ7Map` is
recorded as a non-script asset, never a JavaScript declaration root.

## Finite Fisheries And Aquatic Supply

### Consumer Repair

The retained Huge Earthlike seed `-1152948646` has 226 positive-depth finite
water cells, including 111 that do not receive native lake identity. The
resource owner receives their physical mask, but Fish's primary habitat omits
it, its suppression includes it, and aquatic intensity is zero there. All
nine Fish intents are selected on exterior water. This is a consumer omission,
not evidence that the native resource writer rejected inland Fish.

Use the existing Resources habitat/demand operations. Admit the physical
finite-water mask as a Fish primary lane and retain ice suppression. Give
unfrozen finite water the existing aquatic baseline intensity plus the same
bounded shore and shore-adjacent physical-river bonuses; those are placement preferences,
not estimates of biomass or salinity. Preserve marine intensity byte-for-byte
and the other resource predicates. Apply the existing ice predicate to all
physical water, including finite water. No new artifact, strategy, body quota,
climate computation or native-category workaround is needed.

The official schema defaults `LakeEligible` to true and Fish does not override
it; Fish is available in all three ages. Ordinary engine legality and adjacency
still decide candidate admission. Whales are not an Antiquity resource and
explicitly exclude lakes; their absence in these turn-one games is not itself
a bug. Do not broaden every marine species merely because Fish can be inland.

Removing the suppressor alone leaves the primary/intensity omission intact.
A separate freshwater field adds redundant machinery without a demonstrated
distinct consumer. Both alternatives are rejected for this repair.

### Expectations Before Implementation

| Obligation | Expected Result | Proof |
| --- | --- | --- |
| Finite Fish admission | Eligible unfrozen shore/river-adjacent cells can be selected, independent of native lake classification | Mixed-water operation controls; retained Huge captures; existing size/seed cohort |
| Frozen or dry finite cells | No Fish admission; no invented wetness | Ice, exposure and legality controls |
| Marine and non-Fish habitat | Exact identity outside the deliberate finite-water/ice changes | Field comparisons and nearest domain tests |
| Physics and policy | Physical fields, age rules, count ranges, regional minima and spacing unchanged | Fixed-input capture and public study evaluation |
| Placement outcome | Deterministic legal Fish selections; no promise of one Fish per body or every seed | Site-selection tests and cohort distribution |
| Native outcome | Authored finite Fish appears in the matched fresh game | Realization deploy, log and map readback |

A changed non-Fish site caused by lawful Fish occupancy is not a habitat
change. Record that consequence rather than promising every final site holds.
This repair may redistribute the existing nine Fish away from the sea; it is
not admission of a richer total supply policy.

The focused implementation read qualifies the frozen-cell expectation above:
it applies to habitat admission and normal rotation, not the existing
legal-only regional-minimum phase. That phase can intentionally use an
officially legal habitat-suppressed site to satisfy an admitted regional floor;
this repair does not change its authority. Retain a discriminator for the two
phases rather than asserting a new universal placement ban. The generated
policy also already admits Fish interiors through its explicit runtime-optional
adjacency disposition; do not add a new shore-only legal restriction here.

### Separate Abundance Comparison

The photographed Huge game's 1,596 coastal cells receive nine Fish and seven
Crabs. Existing fixed count caps limit the aquatic-density knob; coast area
alone is not a defensible economic denominator. Compare a prospective
alive-major-player supply envelope (Fish `2P/3P/4P`, Crabs
`round(0.5P)/P/round(1.5P)`) against the repaired current policy and the current
policy at aquatic density two. This is authored gameplay supply, not an Earth
biological constant or a guarantee that habitat capacity satisfies demand.

Use the existing Earthlike/deep-ocean nine-scenario size/seed cohort: all five
sizes at seed 1337, plus Standard/Huge seeds 7 and 42. Hold actual numerical
spacing: the current target-count switch at twelve must not silently relax
spacing in this comparison. Demand-owner ranges, artifact validation, age,
legality, start support and the existing twenty-seed placement guards remain
authoritative. No default adoption is claimed before these results.

The repaired incumbent's actual density-two diagnostic now closes on all nine
scenarios: Fish reaches twelve, Crabs ten, Pearls five, Cowrie four and Turtles
three. Physical fields, projections and habitat/legality evidence hold, and all
442 declared expectations pass. However, every Fish spacing floor changes from
four to three at target twelve. Reject that arm as a clean count-only comparison;
do not hide this coupling with a global scale override. The primary comparison
is repaired density one versus player-scaled density one, both at floor four.

### Player-Scaled Supply Design

Resolve the two supply ranges once at the existing demand owner from
`context.initialSetup.aliveMajorPlayerIds.length`. Carry the required count at
the demand-plan root and one resolved range per candidate. Selection consumes
that published range; artifact validation checks it against the same resolver.
Replace the static expectation export, not supplement it with overrides or a
reference-player fallback. Private fixed tuples and two range callbacks suffice;
no public policy framework or new operation/artifact is needed.

Label the two ranges `alive-major-player-supply` / `authored-gameplay`; keep all
other range values and evidence unchanged. Reject absent, zero, fractional and
nonfinite player counts, consistent with the existing nonempty setup roster.
Crab rounding is nonnegative half-up: three players resolve to `2/3/5`, five
to `3/5/8`. Publish the resolved range in existing capture candidate evidence
rather than recomputing policy in metrics.

Make the existing spacing helper resource-aware so Fish and Crabs retain base
floor four on either side of target twelve. Other resources keep their current
target-dependent floors. Preserve authored spacing scale, sparsity, habitat
capacity, regional floors, age rules, legality and start-support algorithms.
Expected supply is not guaranteed placement; retain explicit shortfalls.

Before default admission, prove resolver and malformed artifact controls,
unchanged other ranges, actual setup-count forwarding, sparse-capacity behavior,
deterministic placement and spacing. Compare the same nine scenarios against
the repaired baseline with all physical/projection/non-resource observations
and habitat/legality held; record any resource-driven start changes. Run the
unchanged complete study bank and twenty-seed placement guards. Finally verify
the fresh Huge native game's authored Fish/Crabs, start plan and physical
collateral. Native resource mismatches remain visible, not waived by headless
success. No climate or geography tuning accompanies this supply decision.

### Finite Consumer Verification

The three focused resource suites pass 45 tests. Source and test types pass;
fresh SDK and consumer reviews found no material issue. The complete owner
graph passes its build, type and policy tasks, 371 realization tests and 412
Studio tests. Definition tests report 1,230 passing and the one existing
within-row temperature-variation expectation failing; that climate requirement
is unchanged and is not a resource regression.

The nine authored size/seed scenarios and two retained Huge negatives pass
539 unchanged sample expectations and one deep-ocean cohort expectation.
All 99 Fish selections are ordinary rotation, in authored habitat and
headless-policy legal. Actual Fish ranges remain `6/9/12`, spacing remains four
tiles, and no same-type spacing violations occur. Both negatives preserve all
38 model properties, eight projection properties, thirteen non-resource
observations and 54 non-Fish candidate evidence records. Fish admission changes
only at finite water: 206 added habitat cells in seed `-1152948646`, 198 in
seed `-3641438`; no exterior or dry cells change.

Lawful occupancy changes final resource sites. The first negative retains all
ten seats; the second replaces one seat location and changes player allocation
among seats, retaining ten full regional seats with no unseated or imputed
result. Record this downstream effect, not an invented final-placement hold.

Fresh Huge Civ7 generation at map/game seeds `-1152948646/-1152948677` with ten
players completes through the existing realization target in 29.1 seconds,
including orchestration. All nine authored Fish appear, including physical
finite water at `(102,33)` that Civ classifies as coastal non-lake water, and
at `(1,42)` that Civ classifies as a lake. All 6,996 native terrain, biome,
water, lake, elevation, river-class and feature readbacks hold against the
pre-repair game; all ten founder locations match the source plan. This proves
finite Fish realization without forcing native lake classification.

Five exact non-Fish source/native omissions already present in that baseline
remain unchanged: Flax, Iron, Wild Game, Silver and Hardwood. Native totals are
210 rather than the headless plan's 215. Their causes remain separate from
this repaired habitat omission; do not claim universal resource parity.
Whale age admission, richer marine supply and vessel movement are not proven
by this finite-Fish change.

### Player-Scaled Supply Verification

The player-count resolver, required demand-plan identity and resource-aware
spacing are implemented. Fresh SDK review is aligned. The complete owner graph
passes build, types and policy; 1,304 definition tests pass with only the retained
within-row thermal expectation failing. Realization passes 371 tests and Studio
passes 412. No climate expectation or placement guard is weakened.

All eleven fixed-input cases reach their headless Fish and Crab targets at
actual spacing four: 282 Fish, including 72 on finite water, and 94 coastal
Crabs. The unchanged study evaluates 539 sample expectations and one cohort
expectation successfully. All physical, projection and non-resource hashes
hold, as do the 55 retained habitat/legality evidence records and the other
53 resource ranges. Legal masks themselves were not retained; this is not a
claim of mask identity. No same-type spacing violation occurs.

Supply is scaled, not uniformly increased: Tiny and Small Crab targets become
four and six rather than seven. Ordinary occupancy moves other resource sites
and some founder allocations while preserving complete regional seating. On
Standard seed 42, Llamas drop from one to zero; their eligible habitat/legal
intersection was already zero in both arms, so this is sensitivity of legal-only
completion, not changed climate or habitat. Explicit other-resource shortfalls
remain visible rather than being presented as perfect supply.

Fresh Huge native generation at map/game seeds `-1152948646/-1152948677`, ten
players and the saved configuration completes in 29.4 seconds including
orchestration. Civ accepts 29 of 30 authored Fish and all ten Crabs. The fresh
placement log records `cannot-have-resource` for the Fish at `(53,30)`, a native
coastal lake tile; it is not a later startup deletion. This remains within the
authored Fish range `20/30/40`, but is not full target realization or universal
finite-water legality. Five incumbent non-Fish refusal locations remain, with
two resource types changed by occupancy. Native total is 234 of 240 intents.
All 6,996 terrain, biome, water, lake, elevation, river-class and feature values
hold against the preceding native run, and all ten founders match the plan.

Admit the supply policy independently of that native oracle limitation. Its
range is expected supply, not a promise that every preferred site is writable.
The existing best-effort writer retains each refusal; neither fallback fishing
sites nor a new physics rule is invented to hide this one. Navigable-river Crab
eligibility is the next separate habitat/legal repair, not part of this count
comparison. The current native capture does not establish vessel behavior or
refreshed screenshots.

### Navigable Crab Consumer Design

Stock Crabs carry `NAVIGABLE_RIVERS_ELIGIBLE` and five exact navigable-terrain /
biome / floodplain feature tuples. Fish does not carry that admission: ordinary
Fishing Boat yields on navigable rivers are not discrete Fish-resource legality.
The current demand owner vetoes every river cell after stock legality, while
Crab habitat names only coastal water and coastal mouth cells. These are two
demonstrated consumer omissions, not a reason to modify drainage or river density.

Add one `majorRiverMask` to the existing habitat vocabulary, derived solely from
exposed, non-lake physical land with river class at least two. This represents a
physical corridor, not proof of native navigation. Unfrozen major corridors use
the existing aquatic intensity baseline `0.4`; extend aquatic ice suppression
to those corridors without changing other family intensities or marine/lake
lanes. Only the Crab primary habitat adds this field. Reusing the general
alluvial/minor-river mask instead would obscure that distinction and widen
habitat capacity beyond the desired corridor.

Keep the generated stock legality predicate unchanged. At the demand owner,
preserve an already-legal river cell only when the resource has the official
navigable-eligibility tag and the current terrain is native navigable river.
The exact biome/feature tuple must still pass. Do not reinterpret the stock
ignore-weight tag as permission to alter authored resource weighting. All
other river exclusions, Fish policy, player-scaled ranges, spacing, ages,
regional minima and selection algorithms remain unchanged. No new operation,
artifact, recipe step, configuration knob or native write path is required.

Prove major/minor/submerged/frozen discriminators, the five exact legal tuples,
and mismatched-feature, coastal-river and Fish negatives through the existing
habitat/demand/selection tests. Compare the same eleven fixed-input cases to
the admitted supply baseline: physical and projection fields must hold, only
the declared habitat/intensity/Crab legality may widen, and actual navigable
Crab selections must be reported. Preserve all 539 sample and one cohort guards
and record ordinary occupancy/start effects. Choose a native witness from that
declared cohort with positive navigable selections; require actual stock oracle,
placement and readback evidence before claiming native delivery. Capacity alone
is not placement, and resource realization is not vessel movement.

### Navigable Crab Consumer Verification

The bounded implementation passes 76 focused habitat/demand/selection tests,
including a deterministic four-Crab navigable selection witness at unchanged
spacing. Source and test TypeScript pass. Fresh SDK review is aligned after
correcting the official corpus lookup to its existing record contract. The
complete owner graph passes build, types and policy, 371 realization tests and
412 Studio tests. Definition tests pass 1,308 cases with only the unchanged
within-row thermal expectation failing.

The same eleven fixed-input cases pass all 539 sample expectations and the one
cohort expectation. They select 102 Crabs: 84 coastal and 18 NAV, versus 94
coastal Crabs before the repair. All remain within the unchanged player-scaled
ranges and spacing. Existing regional minima explain some count increases;
these are not all ordinary-rotation placements. All 281 frozen major-corridor
cells remain ineligible. The 38 model properties, eight projection properties,
thirteen non-resource observations, all 55 ranges and Fish admission/counts
hold. Declared corridor habitat, aquatic intensity, ice suppression and exact
stock-qualified Crab legality are the only owner changes. Old raw habitat and
legal masks were not retained: the owner comparison uses a pinned same-input
replay, not invented retained-mask identity. Ordinary site and seat changes
are reported, with complete seating and no unseated players.

Fresh Huge generation at map/game seeds `-1152948646/-1152948677`, ten players
and the saved setup completes in 36.8 seconds including orchestration. Native
Crabs increase from ten to eleven solely at NAV plot `(85,54)`, a regional-minimum
selection with the exact tundra/floodplain tuple. All 6,996 terrain, biome,
water, lake, elevation, river-class and feature values hold, as do the preceding
234 native resource sites and all ten founder coordinates. The same six
incumbent resource refusals remain, including the previously documented Fish.
An earlier census was interrupted by a map restart and is not used as complete
proof; the repeated census holds its exact game identity before and after.

A second fresh Huge game at seeds `1337/1337` completes in 28.3 seconds.
Ordinary-rotation NAV Crab at `(64,41)` is accepted with the exact plains /
floodplain tuple. The other authored NAV Crab at `(43,38)` retains its exact
tropical / floodplain tuple but receives `cannot-have-resource`; it is also an
authored/native founder plot. That coincidence is not yet a causal diagnosis.
The game contains nine of ten authored Crabs and all thirty Fish, within the
unchanged expected ranges, with 221 of 233 total resource intents accepted.
There is no retained preceding native census for this seed, so this is source
readback and writer proof, not a matched native collateral comparison.

Both games confirm stock-qualified NAV Crab realization without changing river
authoring, Fish legality or geography. They do not promise every preferred
resource site is writable or prove vessel movement. Both also expose seven
NAV founder tiles despite exact planned-coordinate parity and native
`water=false`; the separate founder-admission repair must precede any claim of
all-player dry-start quality. Do not repair that outcome by removing rivers or
overriding native resource legality.

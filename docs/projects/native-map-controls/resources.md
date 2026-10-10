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

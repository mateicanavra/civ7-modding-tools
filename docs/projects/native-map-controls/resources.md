# Official Source Compatibility

Status: source-backed design, implementation pending. This prerequisite is
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

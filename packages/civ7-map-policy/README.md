# Civ7 Map Policy

Pure official map facts and deterministic compliance helpers. This package does
not own resource selection, density, spacing, habitat targets, or engine calls.

## Resource Facts

`CIV7_POLICY_TABLES_V1.resourceRows` and `requireResourceRuntimeId` expose
`weight`, `minimumPerLandmass`, and `landmassUnique`. Omitted XML values resolve
from `Base/Assets/schema/gameplay/01_GameplaySchema.sql`: respectively `1`, `1`,
and `false`. Positive fractional weights are preserved, including gold `0.5`,
hides `0.25`, and tin `0.4`.

`resourceValidPlacementRows` in V1 carries biome, terrain, feature, and the
independent placement-row weight (schema default `1.0`). V0 retains its
three-index legality tuples. Keeping these official weights is factual evidence,
not a promise that a consumer implements Firaxis resource density.

The official common placement script applies minima to active resources with
legal candidates in each existing positive native landmass region, regardless
of staple or required-for-age status. Region zero has no regional floor.
`landmassUnique` denotes native two-group regional eligibility, not one resource
per connected island. Currently only cocoa, spices, sugar, and tea have that flag;
none is Antiquity-valid. Initial-age consumers must explicitly reject unique
admission until they implement the native group assignment.

The removed `MapResourceMinimumAmountModifier` has no replacement table or
zero-returning compatibility resolver. Curated corpus placeability dispositions
remain separate from official normalized facts and runtime-ID proof.

## Verification

`nx run civ7-map-policy:generate` owns tracked generated outputs. Build and check
verify their freshness. Resource tests compare every corpus entry and placement
tuple to the pinned XML, verify SQL defaults and malformed-value refusal, and
prove agreement between symbolic resource IDs, row slots, and generated facts.

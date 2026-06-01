## Frame

This change treats map quality as a measurable product property, not a visual
one-off. The implementation repairs the owning truth domains and then proves
the result through full-recipe stats across shipped map identities.

## Ownership

Hydrology owns lake intent. The lake planner may use morphology land and
hydrography routing/discharge signals, but `map-hydrology` only projects the
published lake plan and records engine acceptance/drift.

Ecology feature families own score-to-intent policy. Reefs, wetlands,
vegetation, and ice may share the category "continuous score becomes sparse
intent," but each policy stays beside the planner it modulates. Reef spacing is
a reef-family policy because reefs, cold reefs, atolls, and lotus patches are
patch/bank features; it is not generic feature-planner machinery.

Runtime artifact publication checks belong at the nearest executable owner for
this branch: the producing step. The current stage artifact registry remains the
existing `artifacts.ts` schema/contract surface; this change does not introduce
Hydrology-only artifact machinery or claim a new repo-wide artifact-module
architecture. If artifact definitions and validators become one object per
artifact (`artifacts/<name>.artifact.ts`), that is a separate categorical
OpenSpec slice across all in-kind stage artifacts, not a local Hydrology patch.

## Lake Policy

Routing sinks are candidate terminal basins, not lake commands. Lake admission
uses two deterministic controls:

- `sinkDischargePercentileMin`: terminal basins must carry meaningful drainage
  compared with other positive land sinks on the same map.
- `maxLakeLandFraction`: each lakeiness knob owns a maximum primary sink-lake
  share of pre-lake land.

Optional upstream expansion still follows `flowDir` receivers and remains
bounded by lakeiness. This preserves physical drainage behavior while avoiding
the previous sink-mask carpet.

## Feature Policy

Planner configs expose only family-local admission controls:

- `minConfidence01` for reef, wetland, vegetation, and ice families.
- `stride` for reef-family spacing.

These are policies, not fallbacks. Feature-specific habitat physics stays in
the owning score ops/contracts. Map configs tune policy posture for their map
identity rather than moving habitat rules into shared buckets.

## Test Design

World-balance tests run the standard recipe through public runtime/config
surfaces and a mock adapter. They intentionally assert ratios and presence
properties rather than exact tile counts:

- lake share of pre-lake land;
- wetland share of pre-lake land;
- reef-family share of water;
- cold reef and atoll presence where the map identity should support them;
- desert rainforest cap.

These are category tests: if the same regression appears in another shipped map
identity, the suite should fail without needing a bespoke test for that exact
file.

## Sea-Level Evidence

Read-only scout checked current official resources and found:

- `MapSeaLevels` schema/UI text exists;
- Fractal/Continents/registered official scripts do not read a sea-level setup
  parameter or call an exposed sea-level API;
- official water behavior still runs through terrain stamping plus elevation
  and water-cache refresh;
- the local Civ7 adapter exposes `buildElevation`, `storeWaterData`, lake
  stamping/readback, and no sea-level API.

Therefore MapGen `seaLevel` remains morphology truth/config, and missing water
remains a projection/readback issue unless new official resources expose an
active engine setting.

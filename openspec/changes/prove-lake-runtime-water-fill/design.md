## Context

There are three lake surfaces:

1. Hydrology truth: the planned lake mask from drainage/sink logic.
2. Map projection: adapter terrain writes and immediate readback.
3. Civ7 runtime state: final terrain/water/lake/area state after elevation,
   rivers, validation, placement preparation, and engine cache refresh.

The bug report concerns surface 3. Repairing it by changing surface 1 without
evidence would hide the owner boundary.

## Design

Keep `map-hydrology/lakes` as the projection orchestrator and the Civ7 adapter
as the engine boundary. Expand the adapter readback to record enough state to
distinguish:

- terrain was not stamped as coast;
- terrain was coast but not water;
- terrain was water but not lake;
- lake was accepted early and dried later;
- lake remained valid but visual proof still disagrees.

Add a final lifecycle parity artifact or diagnostic check after the last engine
terrain/water maintenance point. The check should compare Hydrology planned
lakes, map-hydrology accepted lakes, and final `GameplayMap` state. It must
fail or emit bounded rejection evidence according to a named policy; it must
not silently accept complete lake rejection.

## FireTuner Proof

Runtime proof should use Scripting.log boundaries plus FireTuner probes of
`GameplayMap.getTerrainType`, `GameplayMap.isWater`, `GameplayMap.isLake`,
`GameplayMap.getElevation`, and `GameplayMap.getAreaId` for representative lake
tiles. If a hidden sea-level setup parameter appears in exported runtime DB
state, create a separate OpenSpec change before changing map logic for it.

## Review Lanes

- Architecture: Hydrology truth stays upstream; adapter owns engine facts.
- Product: players see filled lakes, not dry basins.
- DX: diagnostics explain which lifecycle surface failed.
- Adversarial: no generator fallback, no manual adapter bypass, no log-only
  claims without typed evidence where feasible.

## Why

Hydrology lake intent now exists and the map materialization order matches the
official Civ7 lifecycle more closely, but screenshots still show basins that
may not visibly fill as water. Current tests prove mock adapter cache refresh
and early `isWater` readback; they do not prove visible Civ7 lake
materialization after elevation, rivers, validation, placement preparation, and
the final runtime state.

Official resources show lakes are interior `TERRAIN_COAST` plus engine area
classification: terrain is assigned first, `AreaBuilder.recalculateAreas()` is
called, elevation is built afterward, and `GameplayMap.isLake()`/water state is
the runtime evidence. The recovery needs runtime proof and stronger typed
diagnostics, not a Hydrology compensation path.

## Target Authority Refs

- `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`:
  Hydrology owns lake truth; `map-hydrology` owns projection/materialization.
- `openspec/changes/archive/2026-05-30-normalize-projection-lakes/`: lake
  stamping/readback capability exists before fail-hard gates.
- `.civ7/outputs/resources/Base/modules/base-standard/maps/elevation-terrain-generator.js`:
  official lakes are stamped as coast terrain and areas are recalculated.
- User direction: no manual adapter bypasses, no reintroducing engine generator
  authority, no fallbacks.

## What Changes

- Expand lake projection diagnostics to prove terrain, water, lake, area, and
  post-lifecycle state instead of only planned/stamped count readback.
- Add final lifecycle lake preservation checks after engine calls that can
  rewrite terrain or caches.
- Use FireTuner/runtime logs to prove deployed maps reach placement and lake
  runtime state has no current fill drift.
- Keep Hydrology lake planning untouched unless evidence shows truth itself is
  wrong.

## Forbidden Non-Goals

- No `adapter.generateLakes(...)` as deterministic MapGen truth.
- No Hydrology-side dry-basin compensation.
- No manual step invocation as proof.
- No treating screenshots alone as closure evidence.
- No modeling Civ7 sea level as active map control without runtime DB evidence.

## Verification Gates

- focused map-hydrology and materialization-order tests;
- runtime-lake diagnostics from deployed Civ7/FireTuner;
- bounded `Scripting.log`/sibling log inspection;
- `bun run --cwd mods/mod-swooper-maps check`;
- targeted/global OpenSpec validation;
- `bun run build`;
- deploy;
- `git diff --check`.

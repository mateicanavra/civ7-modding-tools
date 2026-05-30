## Implementation Record

This slice separates three lake surfaces:

- Hydrology owns planned lake truth (`artifact:hydrology.lakePlan`).
- `map-hydrology/lakes` owns Civ7 projection and immediate adapter readback.
- `prepare-placement-surface` owns final placement-time maintenance evidence after Civ7 terrain validation, area recalculation, and water cache refresh.

The adapter now reads terrain, `isWater`, `isLake`, area id, and elevation after lake stamping. `map-hydrology` publishes that evidence without replacing Hydrology truth. Placement surface preparation reads the accepted map-hydrology lake mask and records whether any accepted lake tile no longer reads as water or lake-classified after the final maintenance boundary.

Local official-resource scan found `MapSeaLevels` in the gameplay schema, but no active base/DLC data rows or standard map script usage in the copied resources. Standard scripts continue to use `GameInfo.Maps.lookup(...).LakeGenerationFrequency` for vanilla lake generation. No sea-level logic change is included in this slice.

## Verification

- `bun run --cwd packages/civ7-adapter build`
- `bun run --cwd packages/civ7-adapter check`
- `bun run --cwd mods/mod-swooper-maps test -- test/map-hydrology/lakes-store-water-data.test.ts test/map-hydrology/lakes-runtime-fill-drift.test.ts test/placement/placement-lake-readback.test.ts test/pipeline/world-balance-stats.test.ts`
- `bun run --cwd mods/mod-swooper-maps check`
- `bun run openspec -- validate prove-lake-runtime-water-fill --strict`
- `bun run openspec:validate`
- `bun run build`
- `bun run --cwd mods/mod-swooper-maps deploy`
- `git diff --check`

## Runtime Proof

Deployed map file:

- `2026-05-30 14:34:51 -0400 /Users/mateicanavra/Library/Application Support/Civilization VII/Mods/mod-swooper-maps/maps/swooper-earthlike.js`

Fresh Civ7 map roll after the deploy:

- `Scripting.log` mtime: `2026-05-30 14:48:08 -0400`.
- MapGeneration context created at `2026-05-30 14:48:06`.
- The run reached `[36/50] ok mod-swooper-maps.standard.map-hydrology.lakes`.
- The run reached `[45/50] ok mod-swooper-maps.standard.placement.prepare-placement-surface`.
- The run reached `[50/50] ok mod-swooper-maps.standard.placement.placement`.
- The run ended with `Destroying Context -  MapGeneration`.

Bounded sibling-log review after the deploy found no Swooper MapGeneration
failure, `TextEncoder`, uncaught exception, or lake-runtime exception. The
remaining log noise in the same window is base/DLC/UI/online-service noise
outside this mod path, including another mod's UI import error.

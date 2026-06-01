# Implementation Record

## Changes

- Tightened `HYDROLOGY_LAKEINESS_TERMINAL_BASIN_POLICY` so lakeiness admits
  high-discharge basins and expands one upstream hop instead of exposing many
  single-tile sinks.
- Extended `world-balance-stats` with odd-row hex lake component metrics,
  engine lake projection mismatch, and adapter water-fill drift.
- Updated shipped-map strategy selections:
  - Earthlike pedology: `coastal-shelf`.
  - Desert mountains: `earthlike` ocean coupling and `mixed` resource basins.
  - Shattered ring: `mixed` resource basins and `continentality` ice planning.
  - Sundered archipelago: `continentality` ice planning.
- Retained Earthlike `boundaryShareTarget: 0.005` after probing showed normal
  values shift the sample into archipelago-level water coverage.

## Evidence

- `bun run openspec -- validate tighten-mapgen-visual-quality-gates --strict`
  passed.
- `bun run --cwd mods/mod-swooper-maps test -- test/hydrology-knobs.test.ts test/hydrology/plan-lakes.test.ts`
  passed: 9 tests, 31 assertions.
- `bun run --cwd mods/mod-swooper-maps test -- test/pipeline/world-balance-stats.test.ts test/config/maps-schema-valid.test.ts test/config/presets-schema-valid.test.ts test/config/studio-presets-schema-valid.test.ts`
  passed: 7 tests, 63 assertions.
- Full focused world/stat bundle passed:
  `bun run --cwd mods/mod-swooper-maps test -- test/hydrology/plan-lakes.test.ts test/hydrology-knobs.test.ts test/ecology/feature-planner-policies.test.ts test/config/maps-schema-valid.test.ts test/config/presets-schema-valid.test.ts test/config/studio-presets-schema-valid.test.ts test/ecology/earthlike-balance-smoke.test.ts test/pipeline/seed-matrix-stats.test.ts test/pipeline/earth-metrics.test.ts test/pipeline/world-balance-stats.test.ts test/map-hydrology/lakes-runtime-fill-drift.test.ts test/map-hydrology/lakes-store-water-data.test.ts`
  with 25 tests, 158 assertions.
- `bun run --cwd mods/mod-swooper-maps check` passed.
- `bun run openspec:validate` passed with specs and the active change.
- `git diff --check` passed.
- `bun run build` passed: 16 successful tasks.
- `bun run --cwd mods/mod-swooper-maps deploy` passed and deployed
  `/Users/mateicanavra/Library/Application Support/Civilization VII/Mods/mod-swooper-maps/maps/swooper-earthlike.js`
  at `2026-05-30 03:17:52 EDT`.
- Fresh post-deploy `Scripting.log` evidence after that deploy:
  - `Scripting.log` mtime: `2026-05-30 03:55:38 EDT`.
  - The run created `MapGeneration` at `2026-05-30 03:55:37 EDT`.
  - The run reached
    `[50/50] ok mod-swooper-maps.standard.placement.placement` at
    `2026-05-30 03:55:38 EDT`.
  - The run ended with `Destroying Context -  MapGeneration`.
  - No bounded-run `TextEncoder`, `Uncaught`, `Error`, or `Exception` failure
    was observed in the inspected lines.
- FireTuner runtime restart evidence:
  - Connected FireTuner to the running Civ7 process on `10.211.55.2:4318`.
  - Ran `Network.restartGame()` from the connected `App UI` state; FireTuner
    returned `true`.
  - The post-command `Scripting.log` window created `MapGeneration` at
    `2026-05-30 04:00:50 EDT`.
  - The post-command run reached
    `[50/50] ok mod-swooper-maps.standard.placement.placement` at
    `2026-05-30 04:00:51 EDT`.
  - The post-command run ended with `Destroying Context -  MapGeneration`.
  - No bounded-run `TextEncoder`, `Uncaught`, `Error`, or `Exception` failure
    was observed in the inspected lines.
- Post-archive `bun run openspec:validate` passed with promoted specs:
  `change-management` and `mapgen-normalization-workstreams`.
- Post-archive `git diff --check` passed.

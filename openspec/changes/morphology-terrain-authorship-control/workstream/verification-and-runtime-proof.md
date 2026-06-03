# Verification And Runtime Proof

## Local Statistics

- Branch/commit: `codex/morphology-terrain-authorship-workstream`; exact
  branch head is reported from `git rev-parse HEAD` in the final closure
  message.
- Seeds/configs:
  - Swooper Earthlike, seed `1018`, `106x66`.
  - Swooper Earthlike, seeds `[1,2,3,42,99,1234,7777]`, `80x50`.
- Command shape: `bun --eval` using `collectWorldBalanceStats` from
  `mods/mod-swooper-maps/test/support/world-balance-stats.ts`.
- Expected range source: `design.md` and `expectation-strategy-ledger.md`.
- Observed results:
  - seed `1018`: final mountains `6.535%`, planned hills `0.075%`, final
    hills `0.037%`, final flats `88.798%`.
  - 8-seed `80x50`: final hills `0-2.188%`, final flats about `84.968-94.301%`.
- Pass/fail: diagnostic fail against newly predeclared hill/flat bands.
- What this proves: local generated pipeline output under-authors hills/rough
  land before runtime.
- What this does not prove: live game terrain, engine elevation, cliffs,
  selected Studio setup, or downstream resource balance.

## Local Tests

- This branch is a docs/OpenSpec workstream slice. Focused local validation for
  this branch is OpenSpec strict validation, full OpenSpec validation, and
  `git diff --check`; no behavior files are changed in this slice.
- `bun test test/morphology/m11-mountains-physics-anchored.test.ts test/morphology/m12-mountains-present.test.ts`:
  passed before this branch.
- `bun test test/pipeline/world-balance-stats.test.ts`: failed before this
  branch due to `FEATURE_SAGEBRUSH_STEPPE` habitat mismatch.
- `bun test test/pipeline/mountains-nonzero-probe.test.ts`: failed before this
  branch due to stale recipe envelope handling.

## Direct-Control Surface Proof

- Branch/commit: `codex/agent-dra-morphology-direct-control-objective@63a077781`
  before opening this branch.
- Downstack package commit: `cd1e87fa3`
  `feat(civ7-direct-control): expand direct control surface`.
- Build path:
  - `bun run --cwd packages/civ7-direct-control build`
  - `bunx turbo run build --filter=@mateicanavra/civ7-cli`
- Static command: `packages/cli/bin/run.js game catalog --static --json`
- Result: passed; confirmed committed wrappers for restart/begin, playable
  status, map summary, plot grid, GameInfo rows, runtime catalog, autoplay, and
  validator-backed operations.

## Runtime Proof

- Branch/commit: `codex/morphology-terrain-authorship-workstream`; exact
  branch head is reported from `git rev-parse HEAD` in the final closure
  message.
- Downstack restart/control branch and commit:
  `codex/studio-run-in-game-workstream@692a04081`, but Studio setup is not
  proof-ready; committed package surface comes from downstack direct-control
  implementation.
- Command/API path attempted:
  `packages/cli/bin/run.js game status --json --timeout-ms 3000`.
- Request id: unavailable; status command timed out before a parsed runtime
  response.
- Response: `Civ7DirectControlError: Timed out waiting for Civ7 tuner response to LSQ`.
- Manual boundary: no reachable/ready Civ7 tuner session during local proof.
- Log paths: none fresh/bounded.
- Parsed payload: none.
- Readback API/surface: unresolved.
- Claim satisfied: no runtime terrain/elevation/cliff proof.
- Residual risk: product proof remains open until a live game session is
  restarted/begun through `@civ7/direct-control`, bounded map/grid/GameInfo
  payloads are captured, and cliff crossings are read through a first-class
  field or bounded read-only probe.

## Required Runtime Proof Path

1. `civ7 game restart --begin --wait-tuner --json`
2. `civ7 game status --json`
3. `civ7 game map --summary --json`
4. `civ7 game gameinfo Terrains --json`, plus `Biomes`, `Features`, and
   `Resources`.
5. `civ7 game map --bounds x,y,w,h --fields terrain,climate,hydrology,areaRegion --player-id 0 --max-plots 512 --json`
6. For cliffs, either:
   - add a first-class direct-control `cliffCrossings` map field, or
   - run a validator-approved, bounded, read-only `GameplayMap.isCliffCrossing`
     probe over explicit `{x,y,direction}` samples.

## Proof Label

- Local commit complete: yes after closure amend; exact branch head is reported
  outside this self-referential record.
- Graphite submitted: no. `gt submit --stack --dry-run --no-edit` passed in
  non-interactive dry-run mode without pushing branches or opening/updating PRs.
- PR created/updated: no.
- Local stats proof: diagnostic fail only.
- Runtime proof: unresolved.
- Product proof: unresolved.

## Post-Foundation Province Proof 2026-06-03

- Branch/worktree:
  `codex/swooper-earthlike-post-foundation-tuning` at
  `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-swooper-earthlike-tuning`.
- Generated artifacts:
  `bun run --cwd mods/mod-swooper-maps build:studio-recipes` passed and
  regenerated Studio recipe types plus the four shipped map artifacts.
- Focused tests:
  - `bun test packages/mapgen-core/test/lib/grid/distance-to-mask.test.ts
    packages/mapgen-core/test/lib/grid/hex-disk.test.ts
    packages/mapgen-core/test/lib/rng/hash.test.ts
    mods/mod-swooper-maps/test/morphology/mountain-family-controls.test.ts
    mods/mod-swooper-maps/test/morphology/plan-island-chains.test.ts
    mods/mod-swooper-maps/test/placement/plan-ops.test.ts
    mods/mod-swooper-maps/test/pipeline/viz-tile-space-contract.test.ts
    --timeout 90000`: passed.
  - `bun test mods/mod-swooper-maps/test/m11-config-knobs-and-presets.test.ts
    mods/mod-swooper-maps/test/config/maps-schema-valid.test.ts
    mods/mod-swooper-maps/test/standard-compile-errors.test.ts
    apps/mapgen-studio/test/viz/dataTypeModel.test.ts
    apps/mapgen-studio/test/browserRunner/standardLayerVisibility.test.ts
    --timeout 90000`: passed.
  - `bun test mods/mod-swooper-maps/test/pipeline/world-balance-stats.test.ts
    mods/mod-swooper-maps/test/pipeline/terrain-relief-diagnostics.test.ts
    --timeout 120000`: passed.
- Type checks:
  - `bun run --cwd packages/mapgen-core check`: passed.
  - `bun run --cwd mods/mod-swooper-maps check`: passed.
  - `bun run --cwd apps/mapgen-studio check`: passed.
- Studio proof: restarted the single Vite server from this worktree on
  `127.0.0.1:5174`; Browser confirmed the Morphology / Features public schema
  shows compact controls including `Range System Length Tiles` and omits raw
  internal fields such as `mountainRangeLengthTiles`, `Driver Signal Byte Min`,
  and `Mountain Threshold`.
- Deploy proof: `bun run --cwd mods/mod-swooper-maps deploy` passed and deployed
  to `/Users/mateicanavra/Library/Application Support/Civilization VII/Mods/mod-swooper-maps`.
- Live direct-control proof:
  - `bun run --filter @mateicanavra/civ7-cli dev -- game health --tuner`:
    Tuner ready at `127.0.0.1:4318`, turn `1`, map `84x54`.
  - `bun run --filter @mateicanavra/civ7-cli dev -- game map --summary --json`:
    map `84x54`, plot count `4536`, random seed `226012057`.
  - `bun run --filter @mateicanavra/civ7-cli dev -- game map --bounds 0,0,4,4
    --fields terrain,biome,resource --json`: row-major readback confirmed
    `(x=0,y=1) -> index 84`.
  - `bun run --filter @mateicanavra/civ7-cli dev -- game map --bounds 0,53,84,1
    --fields resource --max-plots 100 --json`: bottom row contained no
    resources on the loaded live map.
- Product proof boundary: local seed matrix proves the new Large-map province
  span target; live game readback proves coordinate/index parity and current
  runtime reachability. A broader live regenerated-map visual readback remains a
  separate optional proof task because the current loaded game was already at
  turn `1`.

## Follow-Up Runtime Attempt After Stats Slice

- Date: 2026-05-31.
- Corrected worktree:
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-dra-morphology-direct-control-objective`.
- Branch/head at the runtime attempt:
  `codex/morphology-terrain-stats-readback@406ea9332` before the proof-boundary
  branch was opened. Graphite later restacked this local commit; use the final
  closure message for current stack hashes.
- Direct-control source used: committed stack package, not the dirty Studio
  worktree; `packages/civ7-direct-control` and CLI code last changed in the
  local stack at `e5a952de4` before this morphology branch.
- Background-team overlap check: `git fetch origin` found no newer committed
  `packages/civ7-direct-control`, `packages/cli`, or Studio Civ7 endpoint
  changes beyond the local stack surface.
- Static package/CLI path:
  `packages/cli/bin/run.js game catalog --static --json`.
- Static result: parsed successfully with `source:"static"`,
  `version:"direct-control-v1"`, and wrapper entries for restart/begin,
  playable status, map summary, plot/grid snapshots, autoplay, validator-backed
  operations, and `GameInfo` tables including `Resources`, `Terrains`,
  `Biomes`, and `Features`.
- Runtime CLI path:
  `packages/cli/bin/run.js game status --json --timeout-ms 3000`.
- Runtime status result: failed with
  `Civ7DirectControlError: Timed out waiting for Civ7 tuner response to LSQ:`
  and `Code: response-timeout`.
- Runtime health path:
  `packages/cli/bin/run.js game health --json --timeout-ms 3000`.
- Runtime health parsed payload:
  `{"ok":false,"health":{"ok":false,"status":"unavailable","error":{"code":"all-hosts-unavailable","details":[{"host":"127.0.0.1","error":"Timed out waiting for Civ7 tuner response to LSQ:"}],"name":"Civ7DirectControlError"}}}`.
- Studio API path attempted:
  `GET http://127.0.0.1:5173/api/civ7/status`.
- Studio API result: `curl` timed out after `3004` ms with zero bytes received.
- Request id: unavailable; the failed LSQ/status/health/Studio timeout paths did
  not emit a direct-control request id.
- Log bounds: no fresh Civ7 or FireTuner log region was captured because no
  reachable socket response or Studio payload was obtained; no stale manual
  FireTuner command was used.
- Parsed terrain/elevation/cliff payloads: none.
- Restart/begin decision: not run after read-only status/health showed the
  socket unavailable, to avoid disrupting the parallel direct-control team with
  an unprovable lifecycle mutation.
- Remaining proof boundary: runtime proof still needs a reachable direct-control
  socket, `restart --begin --wait-tuner --json`, bounded `map` and `gameinfo`
  reads, and an engine cliff/elevation readback after `buildElevation()`.
- Cliff boundary: current first-class `game map` fields include terrain,
  biome, feature, resource, climate, hydrology, visibility, owner,
  area/region, tags, city, and units; a first-class cliff-crossing field or an
  approved bounded read-only `GameplayMap.isCliffCrossing` probe remains
  required before claiming cliff proof.

## Live Readback Retry After Direct-Control Downstack Update

- Date: 2026-05-31.
- Branch/head before opening this proof-boundary branch:
  `codex/morphology-rough-land-owner@b4ecc21a1`.
- Downstack direct-control/Studio commits observed in the corrected worktree:
  `fec2f4c07` (`docs(civ7): add Studio run-in-game closure packet`),
  `dfa03ab01` (`test(civ7): add live Studio run-in-game proof gate`), and
  `3bf9b9d62` (`feat(civ7): add Studio run-in-game control lane`).
- Static package/CLI path:
  `packages/cli/bin/run.js game catalog --static --json`.
- Static catalog result: parsed successfully at
  `2026-05-31T22:48:14.366Z` with `direct-control-v1` wrappers for
  restart/begin, playable status, Tuner map summary, plot/grid snapshots,
  autoplay, validator-backed operations, and `GameInfo` tables.
- Runtime catalog path:
  `packages/cli/bin/run.js game catalog --json --timeout-ms 5000`.
- Runtime catalog result: parsed successfully at
  `2026-05-31T22:54:48.553Z` with `source:"merged"` and runtime-proven App UI
  and Tuner roots. The catalog included `GameplayMap.getElevation`,
  `GameplayMap.isCliffCrossing`, `GameInfo`, `Players.Visibility`, and the
  package wrappers for restart/begin, playable status, map summary, plot grid,
  autoplay, and validator-backed operations.
- Runtime status path:
  `packages/cli/bin/run.js game status --json --timeout-ms 5000`.
- Runtime status parsed payload: `ok:true`, `playable:true`,
  `readiness:"tuner-ready"`, App UI state `65535`, Tuner state `1`, turn `1`,
  date `4000 BCE`, map `84x54`, plot count `4536`, random seed `753190001`,
  one alive human player, and eight alive players.
- Tuner map summary path:
  `packages/cli/bin/run.js game map --summary --json --timeout-ms 5000`.
- Tuner map summary parsed payload: `ok:true`, map `84x54`, plot count `4536`,
  random seed `753190001`, turn `1`, date `4000 BCE`, and area/region ids.
- `GameInfo` paths and parsed totals:
  - `Terrains`: `6` rows, including `TERRAIN_MOUNTAIN`, `TERRAIN_HILL`,
    `TERRAIN_FLAT`, `TERRAIN_COAST`, `TERRAIN_OCEAN`, and
    `TERRAIN_NAVIGABLE_RIVER`.
  - `Biomes`: `6` rows, including tundra, grassland, plains, tropical, desert,
    and marine.
  - `Features`: `46` rows, including official terrain-linked features and
    natural wonders such as `FEATURE_VOLCANO`, `FEATURE_MOUNT_EVEREST`,
    `FEATURE_GRAND_CANYON`, and vegetation/wetland/reef families.
  - `Resources`: `55` rows.
- Visibility path:
  `packages/cli/bin/run.js game visibility --player-id 0 --bounds 0,0,16,16 --json --timeout-ms 5000`.
- Visibility parsed payload: `ok:true`, `numPlotsRevealed:27`,
  `numPlotsVisible:7`, bounded grid `256` plots, selected bound count
  `{"0":256}`.
- Bounded map-grid path without hidden facts:
  `packages/cli/bin/run.js game map --bounds 0,0,16,16 --fields terrain,climate,hydrology,areaRegion,feature,resource --player-id 0 --max-plots 512 --json --timeout-ms 5000`.
- Bounded map-grid result: `ok:true`, `plotCount:256`, but all selected plots
  were hidden for player `0`, so facts were intentionally empty under the
  visibility-filtered policy.
- Bounded map-grid path with hidden facts:
  `packages/cli/bin/run.js game map --bounds 0,0,6,6 --fields terrain,climate,hydrology,areaRegion,feature,resource --player-id 0 --include-hidden --max-plots 64 --json --timeout-ms 5000`.
- Hidden-facts retry result: `ok:true`, bounds `0,0,6,6`, plot count `36`,
  omitted `0`, `hiddenInfoPolicy:"include-hidden"`, map `84x54`. Plot facts
  included terrain, feature, resource, elevation, rainfall, fertility,
  river type, water, area id, region id, and landmass id; the selected
  northwest sample was ocean/coast-edge evidence, not a target morphology band.
- Tuner API inspection path:
  `packages/cli/bin/run.js game inspect --state Tuner --roots GameplayMap,Game,Players --json --timeout-ms 5000`.
- Tuner API inspection result: `ok:true`; `GameplayMap`, `Game`, and `Players`
  existed. `GameplayMap` exposed readback methods including `getTerrainType`,
  `getBiomeType`, `getFeatureType`, `getResourceType`, `isWater`, `isMountain`,
  `isLake`, `isNavigableRiver`, `getElevation`, and `isCliffCrossing`.
- Engine elevation/cliff readback path:
  `packages/cli/bin/run.js game exec '<probe below>' --state Tuner --json --timeout-ms 5000`.
- Engine elevation/cliff probe:
  ```js
  JSON.stringify((() => {
    const width = GameplayMap.getGridWidth();
    const height = GameplayMap.getGridHeight();
    const terrainCounts = {};
    const elevationCounts = {};
    let water = 0, land = 0, min = Infinity, max = -Infinity;
    let sum = 0, count = 0, cliffCrossings = 0, cliffErrors = 0;
    const cliffSamples = [];
    const elevationSamples = [];
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const t = GameplayMap.getTerrainType(x, y);
        terrainCounts[t] = (terrainCounts[t] || 0) + 1;
        if (GameplayMap.isWater(x, y)) water++; else land++;
        const e = GameplayMap.getElevation(x, y);
        elevationCounts[e] = (elevationCounts[e] || 0) + 1;
        min = Math.min(min, e);
        max = Math.max(max, e);
        sum += e;
        count++;
        if (elevationSamples.length < 16 && (e !== 0 || !GameplayMap.isWater(x, y))) {
          elevationSamples.push({ x, y, terrain: t, elevation: e, water: GameplayMap.isWater(x, y) });
        }
        for (let d = 0; d < 6; d++) {
          try {
            if (GameplayMap.isCliffCrossing(x, y, d)) {
              cliffCrossings++;
              if (cliffSamples.length < 16) cliffSamples.push({ x, y, d, terrain: t, elevation: e });
            }
          } catch (_err) {
            cliffErrors++;
          }
        }
      }
    }
    return {
      width, height, plotCount: width * height, terrainCounts,
      elevation: { min, max, mean: Math.round((sum / count) * 1000) / 1000, counts: elevationCounts },
      water, land, cliffCrossings, cliffErrors, cliffSamples, elevationSamples
    };
  })())
  ```
- Engine elevation/cliff parsed payload: `ok:true`, map `84x54`, plot count
  `4536`, terrain counts `{0:70,1:20,2:1516,3:808,4:2075,5:47}`, land `1653`,
  water `2883`, elevation min `0`, max `1681`, mean `276.936`,
  `cliffCrossings:818`, and `cliffErrors:0`. Terrain ids match
  `GameInfo.Terrains` row indices: mountain, hill, flat, coast, ocean, and
  navigable river.
- Transient overlap note: during parallel direct-control testing, one
  intermediate hidden-facts read and one Tuner inspection returned
  `Code: state-not-found`, and a follow-up status saw an App UI
  `ReferenceError: Autoplay is not defined` while only `App UI` remained. A
  later health/status retry restored both App UI and Tuner and all readback
  paths above succeeded. Those intermediate failures are treated as live-session
  contention only, not evidence that the current direct-control surface is
  broken.
- Request id: unavailable by current CLI behavior. The `game exec --json`
  response echoed the command, host, port, and Tuner state, but did not emit a
  separate request id.
- Log bounds: no fresh Civ7 or FireTuner log region was captured because these
  were read-only socket/API probes and the CLI response itself contained the
  request/response evidence. No stale manual FireTuner command was used.
- Parsed terrain/elevation/cliff readback payloads: `GameInfo.Terrains`,
  bounded hidden plot facts, all-map terrain/elevation counts, and bounded
  `GameplayMap.isCliffCrossing(x,y,direction)` results were captured.
- Restart/begin decision: not run, despite the package support, because the
  live session appeared to belong to parallel direct-control testing.
- Product proof boundary at this retry: this is live direct-control surface proof, not proof
  that the current morphology branch generated the running map. Product proof
  still requires a controlled restart/begin of the target Swooper map, captured
  request ids/log bounds if the CLI exposes them, and terrain/elevation/cliff
  readback tied to that specific generated map. This boundary is superseded by
  the controlled target-map proof below.

## Studio Endpoint Retry

- Date: 2026-05-31.
- Branch/head at retry: `codex/morphology-live-readback-boundary@0ea492d00`.
- Studio status path:
  `GET http://127.0.0.1:5173/api/civ7/status`.
- Studio status result: `ok:true`, `playable:true`,
  `readiness:"tuner-ready"`, App UI state `65535`, Tuner state `1`, turn `1`,
  date `4000 BCE`, map `84x54`, plot count `4536`, random seed `753190004`,
  one alive human player, and eight alive players.
- Studio map-summary path:
  `GET http://127.0.0.1:5173/api/civ7/map-summary`.
- Studio map-summary result: `ok:true`, Tuner state `1`, map `84x54`, plot
  count `4536`, random seed `753190004`, turn `1`, date `4000 BCE`, and
  area/region ids.
- Studio GameInfo path:
  `GET http://127.0.0.1:5173/api/civ7/gameinfo?table=Terrains&limit=10`.
- Studio GameInfo result: `ok:true`, six terrain rows matching the direct CLI
  terrain rows: mountain, hill, flat, coast, ocean, and navigable river.

## Fresh Live Readback Retry After Shared-Session Contention

- Date: 2026-05-31.
- Branch/head at retry: `codex/morphology-peer-review-repairs@a8ab28cfe`.
- Direct-control freshness check: `git fetch --all --prune` completed, and
  recent stack/code review still showed the current package surface from
  `cd1e87fa3` plus the downstack Studio run-in-game commits.
- Initial non-evidence transition:
  `packages/cli/bin/run.js game status --json --timeout-ms 8000` first returned
  `ReferenceError: Autoplay is not defined`; `game health` immediately showed a
  reachable socket with only `App UI`, and a simultaneous `map --summary`
  returned `state-not-found` for missing `Tuner`.
- Retry classification: this is treated as live shared-session transition or
  overlap, not as evidence that direct-control readback is broken. A follow-up
  App UI `exec` showed `UI.isInGame():true`, `Network` defined, and `Autoplay`
  defined; the standard status path then succeeded.
- Runtime status path:
  `packages/cli/bin/run.js game status --json --timeout-ms 10000`.
- Runtime status parsed payload: `ok:true`, `playable:true`,
  `readiness:"tuner-ready"`, App UI state `65535`, Tuner state `1`, turn `1`,
  date `4000 BCE`, map `84x54`, plot count `4536`, random seed `753190008`,
  one alive human player, and eight alive players.
- Tuner map summary path:
  `packages/cli/bin/run.js game map --summary --json --timeout-ms 15000`.
- Tuner map summary parsed payload: `ok:true`, map `84x54`, plot count `4536`,
  random seed `753190008`, turn `1`, date `4000 BCE`, and area/region ids.
- Bounded map-grid path:
  `packages/cli/bin/run.js game map --bounds 0,0,8,8 --fields terrain,biome,feature,resource,visibility --include-hidden --max-plots 64 --json --timeout-ms 15000`.
- Bounded map-grid result: `ok:true`, bounds `0,0,8,8`, plot count `64`,
  omitted `0`, map `84x54`. The first-class map field set did not include
  `elevation`; engine elevation/cliff readback therefore used the approved
  read-only Tuner `exec` probe below.
- Visibility path:
  `packages/cli/bin/run.js game visibility --player-id 0 --bounds 0,0,8,8 --grid --json --timeout-ms 15000`.
- Visibility parsed payload: `ok:true`, `numPlotsRevealed:30`,
  `numPlotsVisible:7`, bounded grid `64` plots, selected bound count `{"0":64}`.
- `GameInfo` paths and parsed totals:
  - `Terrains`: `6` rows, including `TERRAIN_MOUNTAIN`, `TERRAIN_HILL`,
    `TERRAIN_FLAT`, `TERRAIN_COAST`, `TERRAIN_OCEAN`, and
    `TERRAIN_NAVIGABLE_RIVER`.
  - `Biomes`: `6` rows.
  - `Features`: `46` rows; the bounded sample included natural wonders,
    vegetation, floodplain, reef, wetland, and ice families.
  - `Resources`: `55` rows.
- Static catalog path:
  `packages/cli/bin/run.js game catalog --static --json --timeout-ms 15000`.
- Static catalog result: `ok:true`, `direct-control-v1`, with package-owned
  wrappers for restart/begin, playable status, Tuner map summary, plot/grid
  snapshots, autoplay, validator-backed operations, and targeted `GameInfo`
  tables.
- Tuner API inspection path:
  `packages/cli/bin/run.js game inspect --state Tuner --roots GameplayMap,GameInfo,Players,TerrainBuilder --json --timeout-ms 15000`.
- Tuner API inspection result: `ok:true`; `GameplayMap`, `GameInfo`, `Players`,
  and `TerrainBuilder` existed. `GameplayMap` exposed `getElevation` and
  `isCliffCrossing`; `TerrainBuilder` exposed `buildElevation`, confirming the
  engine elevation/cliff surfaces remain runtime/readback-owned.
- Studio endpoint retry paths:
  `GET /api/civ7/status`, `GET /api/civ7/map-summary`, and
  `GET /api/civ7/gameinfo?table=Terrains&limit=6`.
- Studio endpoint results: all returned `ok:true`, with the same live map
  `84x54`, plot count `4536`, random seed `753190008`, and the six canonical
  terrain rows.
- Engine elevation/cliff readback path:
  `packages/cli/bin/run.js game exec '<probe below>' --state Tuner --json --timeout-ms 15000`.
- Engine elevation/cliff parsed payload: `ok:true`, map `84x54`, plot count
  `4536`, terrain counts `{0:53,1:29,2:1549,3:879,4:1977,5:49}`, land `1680`,
  water `2856`, elevation min `0`, max `2053`, mean `319.921`,
  `cliffCrossings:1000`, and `cliffErrors:0`. Terrain ids map to the
  `GameInfo.Terrains` row indices: mountain, hill, flat, coast, ocean, and
  navigable river.
- Request id: unavailable by current read-only CLI behavior. The `game exec`
  response echoed command, host, port, and Tuner state; no lifecycle mutation
  request id was produced because no restart was sent.
- Log bounds: no fresh Civ7 or FireTuner log region was captured for this
  read-only retry. The evidence is the direct package/CLI and Studio response
  payloads; no stale manual FireTuner command was used.
- Restart/begin decision: still not run. The live game is shared with another
  direct-control team, so this retry proves runtime readback availability but
  does not claim controlled target-map product proof.
- Product proof boundary at this read-only retry: still open. Controlled proof requires
  `civ7 game restart --begin --wait-tuner --json` for the target Swooper map,
  then status/map/GameInfo/hidden grid/elevation/cliff payloads tied to that
  generated map. This boundary is superseded by the controlled target-map proof
  below.
- Shared-session boundary: the live seed changed from `753190001` in the CLI
  retry to `753190004` in the later Studio retry while the map shape stayed
  `84x54`. This is treated as evidence that the endpoints work in a shared live
  session, not as stable proof of this morphology branch's generated map.

## Controlled Target-Map Runtime Proof After Fresh Deploy

- Date: 2026-05-31.
- Branch/head before this proof-record update:
  `codex/morphology-peer-review-repairs@2528bd75994a`.
- Downstack package path: committed `@civ7/direct-control` surface and CLI
  wrappers from the local Graphite stack, including
  `codex/civ7-direct-control-surface-impl@cd1e87fa3` and the downstack
  Studio run-in-game commits.
- Direct-control surface check before mutation:
  `packages/cli/bin/run.js game catalog --static --json --timeout-ms 10000`
  returned `ok:true`, `direct-control-v1`, with restart/begin, playable
  status, setup snapshot/start, map summary, plot/grid, autoplay,
  validator-backed operations, and `GameInfo` table entries.
- Read-only status before mutation:
  `packages/cli/bin/run.js game status --json --timeout-ms 10000` returned
  `ok:true`, `readiness:"tuner-ready"`, App UI state `65535`, Tuner state `1`,
  and autoplay inactive.
- Stale-artifact diagnosis before the fresh deploy:
  a controlled seed `1018` run produced terrain counts
  `{0:98,1:5,2:1507,3:1083,4:1815,5:28}`. This is not counted as current
  product failure because the deployed/generated map bundle did not yet contain
  the `morphology/plan-rough-lands` owner, while source did.
- Deploy command:
  `bun run --cwd mods/mod-swooper-maps deploy`.
- Deploy result: passed. `mods/mod-swooper-maps/mod/maps/swooper-earthlike.js`
  and the deployed copy under
  `~/Library/Application Support/Civilization VII/Mods/mod-swooper-maps/maps/swooper-earthlike.js`
  both had timestamp `2026-05-31 19:48:57`, and `rg` confirmed the deployed
  bundle contains `morphology/plan-rough-lands`, `planRoughLands`, and
  `fractalRoughLand`.
- Generated target-map hash after deploy:
  `configHash:"c8dc3b3b6cac7f1790baf1526d25850674d51b5d5978d11fbaff704705caee32"`
  and
  `envelopeHash:"f4facc44407f9118c97dd39364ee6b45de7e91e64e14ec78ce5d740f2d4e7235"`.
- Integration replay note, 2026-06-01: those hashes belong to the source
  `codex/morphology-peer-review-repairs` runtime proof artifact. After replaying
  this behavior above the authoring-surface guards, the generated Swooper
  Earthlike artifact was regenerated from the semantic public config with
  `configHash:"7e3b100b867fc1f07b549d1373a60ebca61645cac0ea762becfcb1dd691c0381"`
  and
  `envelopeHash:"1c0bfa88c7fe8e3dc917e7eb84986d399a1c72022423add91646f2eb51caf2f5"`.
  The source runtime proof remains historical evidence until a fresh
  integration-branch deploy/readback proof is captured.
- Controlled setup/start command:
  `bun run verify:studio-run-in-game:live -- --mutate --map-script '{swooper-maps}/maps/swooper-earthlike.js' --map-size MAPSIZE_STANDARD --seed 1018 --game-seed 1018 --from-running-game exit-to-shell --timeout-ms 10000 --wait-timeout-ms 180000 --poll-interval-ms 2000`.
- Verifier proof id: `studio-run-in-game-live-proof-mpufnk77-239f`.
- Verifier timing: started `2026-05-31T23:50:47.300Z`, finished
  `2026-05-31T23:51:15.322Z`.
- Verifier parsed result: `ok:true`, mode `mutating-setup-start`,
  mutation attempted, setup row visibility matched
  `{swooper-maps}/maps/swooper-earthlike.js` in both setup-domain and
  config-db rows, `prepareVerified:true`, `startVerified:true`, map `84x54`,
  plot count `4536`, random seed `1018`, turn `1`, date `4000 BCE`.
- Post-start status path:
  `packages/cli/bin/run.js game status --json --timeout-ms 15000`.
- Post-start status result: `ok:true`, `playable:true`,
  `readiness:"tuner-ready"`, App UI state `65535`, Tuner state `1`, autoplay
  inactive, one alive human player, eight alive players, map `84x54`, plot
  count `4536`, random seed `1018`.
- Map summary path:
  `packages/cli/bin/run.js game map --summary --json --timeout-ms 15000`.
- Map summary result: `ok:true`, map `84x54`, plot count `4536`, random seed
  `1018`, turn `1`, date `4000 BCE`, and area/region ids.
- Bounded map paths:
  - `packages/cli/bin/run.js game map --bounds 0,0,8,8 --fields terrain,biome,feature,resource,visibility --include-hidden --max-plots 64 --json --timeout-ms 15000`
  - `packages/cli/bin/run.js game map --bounds 0,0,8,8 --fields terrain,biome,feature,resource,visibility,climate,hydrology --player-id 0 --include-hidden --max-plots 64 --json --timeout-ms 15000`
- Bounded map result: `ok:true`, bounds `0,0,8,8`, plot count `64`, omitted
  `0`, map `84x54`. The player-scoped hidden-facts retry included terrain,
  biome, feature, resource, elevation, rainfall, fertility, river type, water,
  revealed state, and visibility for the selected northwest sample.
- Visibility path:
  `packages/cli/bin/run.js game visibility --player-id 0 --bounds 0,0,8,8 --grid --json --timeout-ms 15000`.
- Visibility result: `ok:true`, `numPlotsRevealed:29`,
  `numPlotsVisible:7`, bounded grid `64` plots, selected bound count
  `{"0":64}`.
- `GameInfo` paths and parsed totals:
  - `Terrains`: `6` rows, row indices mapping `0` mountain, `1` hill, `2`
    flat, `3` coast, `4` ocean, and `5` navigable river.
  - `Biomes`: `6` rows.
  - `Features`: `46` rows.
  - `Resources`: `55` rows.
- Runtime catalog path:
  `packages/cli/bin/run.js game catalog --static --json --timeout-ms 15000`.
- Runtime catalog result: `ok:true`, `direct-control-v1`, package-owned
  restart/begin, setup/start, playable status, map summary, plot/grid,
  autoplay, validator-backed operations, and targeted `GameInfo` table entries.
- Tuner inspection path:
  `packages/cli/bin/run.js game inspect --state Tuner --roots GameplayMap,GameInfo,TerrainBuilder,Players,Units,Cities,MapUnits,MapCities --json --timeout-ms 15000`.
- Tuner inspection result: `ok:true`; `GameplayMap` exposed terrain, biome,
  feature, resource, water, lake, mountain, volcano, elevation, and
  cliff-crossing readback; `TerrainBuilder` exposed `buildElevation`; actor
  roots `Players`, `Units`, `Cities`, `MapUnits`, and `MapCities` existed.
- Engine elevation/cliff aggregate path:
  `packages/cli/bin/run.js game exec '<read-only aggregate probe>' --state Tuner --json --timeout-ms 30000`.
- Engine aggregate parsed payload: `ok:true`, map `84x54`, plot count `4536`,
  seed `1018`, terrain counts `{0:98,1:278,2:1234,3:1083,4:1815,5:28}`,
  terrain share `{mountain:2.16,hill:6.13,flat:27.2,coast:23.88,ocean:40.01,river:0.62}`,
  land `1638`, water `2898`, land terrain share
  `{mountain:5.98,hill:16.97,flat:75.34,river:1.71}`.
- Engine elevation/cliff readback: elevation min `0`, max `1420`, mean
  `200.498`, count `4536`; `cliffCrossings:994`, `cliffErrors:0`.
- Component/local-relief readback: mountain components `17`, max `60`, mean
  `5.765`; hill components `30`, max `69`, mean `9.267`; land local-relief
  max mean `304.378`, land local-relief max p95 `512`, neighbor-pair relief
  mean `72.815`, neighbor-pair relief p95 `346`.
- Shore-distance elevation profile: land distance `1` count `619`, hill share
  `15.83%`, mountain share `10.66%`; distance `2` count `426`, hill share
  `21.6%`; distance `3-5` count `540`, hill share `16.3%`; distance `6-10`
  count `53`, all flat. Flat interior at distance `6+` was `53` tiles,
  `3.24%` of land.
- Volcano readback: `16` volcano plots, `0` active, `0` errors; terrain split
  `{0:14,3:2}` and biome split `{0:5,1:2,2:3,3:5,4:1}`.
- Downstream feature/resource readback: numeric feature counts included
  `FEATURE_ICE`/marine/vegetation/wetland families in aggregate; resource
  counts found `22` placed resources across ids `33`, `34`, `35`, `36`, `38`,
  `41`, `43`, and `44`. Rich terrain-linked resource quality gates remain a
  downstream slice; this proof records aggregate placement/readback only.
- Log bounds:
  - `Scripting.log` mtime `2026-05-31 19:50:58`.
  - `Modding.log` mtime `2026-05-31 19:50:55`.
  - `Database.log` mtime `2026-05-31 19:51:11`.
- Fresh script log region: `[2026-05-31 19:50:57] [SWOOPER_MOD] [mapgen-proof]`
  emitted map id `swooper-earthlike`, seed `1018`, map size `2`, dimensions
  `84x54`, the generated hashes above, and `requestId:null`. Recipe steps
  `1/50` through `50/50` completed `ok`, including
  `map-elevation.build-elevation` at step `37/50`.
- Request id boundary: the verifier emitted proof id
  `studio-run-in-game-live-proof-mpufnk77-239f`; the map script log emitted
  `requestId:null`, and the current CLI responses do not expose a separate
  socket request id. This absence is recorded rather than invented.
- Claim satisfied: controlled target-map product proof for Swooper Earthlike
  seed `1018` on the freshly deployed current branch artifact. The stale
  5-hill runtime result is classified as stale deployed output, not current
  morphology failure.
- Remaining boundary: first-class aggregate cliff fields in `game map` and
  richer resource-quality proof remain downstream package/product polish.
  Current cliff/elevation proof is a package-routed, read-only Tuner aggregate
  probe after the map's `buildElevation()` step.

## Current Proof Labels

- Branch/head: current `codex/morphology-peer-review-repairs` top commit after
  the downstream ecology-feature repair and target-map proof-record update.
  Read the exact hash from `git log -1 --oneline`.
- Graphite submitted: no.
- PR created/updated: no.
- Narsil evidence: available for the root repo. Recent changes show the
  downstack direct-control/Studio commits, and hotspots identify Earthlike
  config files as high-churn, supporting the no-config-retune boundary.
- Local stats proof: focused terrain-relief diagnostics and balance tests pass
  after the rough-land owner slice; broad `world-balance-stats.test.ts` now
  passes after downstream ecology-feature repair of Sagebrush habitat,
  Rainforest seed presence, reef budget, and the stale atoll fixture.
- Runtime readback proof: live `@civ7/direct-control` CLI and Studio read
  surfaces are proven for status, catalog, map summary, GameInfo, visibility,
  hidden bounded plot facts, engine elevation, and cliff crossings. The latest
  retry confirms transient missing-`Tuner`/missing-`Autoplay` results are not
  counted as failure evidence when a follow-up read succeeds.
- Product proof: captured for Swooper Earthlike standard map seed `1018` after
  fresh deploy through the package-backed setup/start verifier, status/map/
  GameInfo/visibility reads, targeted inspection, and engine elevation/cliff
  aggregate readback.

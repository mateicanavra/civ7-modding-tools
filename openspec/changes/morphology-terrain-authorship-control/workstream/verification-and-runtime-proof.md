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
- Graphite submitted: no.
- PR created/updated: no.
- Local stats proof: diagnostic fail only.
- Runtime proof: unresolved.
- Product proof: unresolved.

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
  `codex/morphology-rough-land-owner@f6bef3685`.
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
- Product proof boundary: this is live direct-control surface proof, not proof
  that the current morphology branch generated the running map. Product proof
  still requires a controlled restart/begin of the target Swooper map, captured
  request ids/log bounds if the CLI exposes them, and terrain/elevation/cliff
  readback tied to that specific generated map.

## Studio Endpoint Retry

- Date: 2026-05-31.
- Branch/head at retry: `codex/morphology-live-readback-boundary@d42f35fe5`.
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
- Shared-session boundary: the live seed changed from `753190001` in the CLI
  retry to `753190004` in the later Studio retry while the map shape stayed
  `84x54`. This is treated as evidence that the endpoints work in a shared live
  session, not as stable proof of this morphology branch's generated map.

## Current Proof Labels

- Branch/head: `codex/morphology-live-readback-boundary@d42f35fe5` before the
  current closure-audit repair.
- Graphite submitted: no.
- PR created/updated: no.
- Narsil evidence: available for the root repo. Recent changes show the
  downstack direct-control/Studio commits, and hotspots identify Earthlike
  config files as high-churn, supporting the no-config-retune boundary.
- Local stats proof: focused terrain-relief diagnostics and balance tests pass
  after the rough-land owner slice; broad world-balance still fails downstream
  ecology/features checks (`FEATURE_SAGEBRUSH_STEPPE` habitat mismatch and
  Rainforest seed presence).
- Runtime readback proof: live `@civ7/direct-control` CLI and Studio read
  surfaces are proven for status, catalog, map summary, GameInfo, visibility,
  hidden bounded plot facts, engine elevation, and cliff crossings.
- Product proof: unresolved until a controlled restart/begin of the target
  Swooper map is run without disrupting the parallel direct-control team, then
  terrain/elevation/cliff payloads are tied to that generated map.

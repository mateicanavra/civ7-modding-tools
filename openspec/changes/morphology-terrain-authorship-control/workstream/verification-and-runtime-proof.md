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

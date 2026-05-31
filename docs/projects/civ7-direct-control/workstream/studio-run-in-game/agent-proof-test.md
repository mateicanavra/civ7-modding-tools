# Proof/Test Review

## Verdict

- [inferred] Implementation is blocked until the OpenSpec slices require fresh
  runtime evidence for every mutating setup/start wrapper and for reload
  semantics.
- [source-proven] Existing direct-control tests prove socket framing, state-role
  routing, restart/begin wrapper construction, read wrappers, approval checks,
  and no automatic replay for current operation requests.
- [unresolved] Current evidence does not prove that Studio can select a newly
  materialized Swooper map row, map size/options, and seed from setup without
  stale or manually selected runtime state.
- [rejected] Quiet logs, source-only setup claims, FireTuner/bridge fallback,
  and automatic mutation replay are not acceptable proof for this workstream.

## Proof Boundaries

| Boundary | What It Can Prove | What It Cannot Prove | Required Label |
|---|---|---|---|
| Build | Package/app TypeScript and bundle contracts are coherent. | Civ accepted setup mutations or loaded the selected map. | source-proven |
| Deploy | Swooper source generated/copied into the deploy target. | Civ has reloaded those files or selected the new map row. | source-proven |
| Log | A fresh map-generation context emitted expected markers. | The selected setup row, seed, and config were exact unless hash/identity markers match the request. | live-proven only with matching request evidence |
| In-game | Runtime row, seed, dimensions, and live map facts match after start. | Source code quality or Studio UI ergonomics. | live-proven |

## Proof Matrix

| Claim / Gate | Current Status | Required Proof Before Dependence | Pass Oracle |
|---|---|---|---|
| Direct-control owns setup/start wrappers. | [source-proven] Package owns current lifecycle wrappers and Studio already calls package reads/restart from Vite server. | New setup wrappers must live in `@civ7/direct-control`; Studio/CLI tests must assert no raw setup JavaScript or socket framing outside the package. | No caller-local setup command builders; package tests inspect exact state role and command payload. |
| App UI owns lifecycle/setup/start. | [source-proven] Existing specs route lifecycle to `App UI`; prior reports show `Network`/`UI` are App UI surfaces. | Fresh setup/start proof from shell/main-menu and from running-game return path. | `LSQ`, App UI snapshot, setup snapshot, start response, `GameStarted`, and Tuner canary are recorded in one ledger entry. |
| Tuner owns post-Begin reads. | [source-proven] Existing specs and tests route map/GameInfo/visibility reads through Tuner readiness. | Live sync endpoints must call package read wrappers after Tuner canary. | Failed Tuner canary blocks sync reads; no fallback role is used. |
| Selected `GameInfo.Maps` row exists. | [unresolved] Current Studio save/deploy can write config and deploy, but exact row selection is not proven. | Query `GameInfo.Maps` after deploy/reload for selected row id and expected metadata. | Row id, map script/domain fields, mtime/build id, and request id match the Studio run request. |
| Setup map row selected. | [unresolved] No current setup wrapper proof. | Before/after setup snapshot around selection. | Before row differs or is recorded; after row equals requested map row before host/start. |
| Setup seed applied outside Swooper config. | [unresolved] Existing policy says seed stays outside authored config, but setup write is not live-proven. | Setup snapshot after applying seed plus post-start `GameplayMap.getRandomSeed()`. | Setup seed equals Studio seed and post-start random seed equals the same value. |
| Map size/options applied. | [unresolved] Browser runner maps Studio size to dimensions; Civ setup application is not proven. | Setup snapshot and post-start map summary. | Setup size/options equal request; post-start width/height/map size equal expected row/options. |
| Exact current config loaded. | [unresolved] Save/deploy exists; reload semantics are not proven. | Config hash marker in Swooper log, tied to request id, after a defined reload boundary. | Logged config id/hash equals Studio request; stale prior hash fails the gate. |
| Reload semantics support exact-current-config claims. | [unresolved] Workstream ledger has no fresh proof. | Probe hot deploy, shell reload, and full process restart as separate cases. | The spec names the minimum proven boundary; stronger claims are rejected unless evidence exists. |
| Live sync is observational only. | [source-proven] Existing acceptance criteria and phase docs require no `pipelineConfig` auto-write. | Studio store/UI tests assert runtime snapshots enter a separate read model/overlay. | Runtime observations cannot mutate authored config without an explicit suggestion/apply action. |
| Failure/retry/no-replay semantics. | [source-proven] Existing spec forbids automatic replay of mutating commands; current operation tests assert one send. | New setup/start tests must simulate socket close/timeout after send. | Read probes may retry; setup/start mutations report classified error and require a new user request. |

## Live Proof Ledger Fields

- [inferred] Every live proof row should include: `proofId`, `timestamp`,
  `operator`, `machine`, `civVersion`, `repoCommit`, `branch`, `requestId`,
  `studioRunId`, `configId`, `configSourcePath`, `configHash`, `mapRowId`,
  `mapSizeId`, `expectedDimensions`, `studioSeed`, `setupStateBefore`,
  `setupStateAfter`, `reloadBoundary`, `deployCommand`, `deployResult`,
  `logSnapshotBefore`, `logMarkersAfter`, `appUiStateId`, `tunerStateId`,
  `startCommandIds`, `postStartRandomSeed`, `postStartMapSummary`,
  `gameInfoMapsRow`, `swooperLogHashMatch`, `failureClass`,
  `retryCount`, `mutationReplayCount`, `artifacts`, and `verdict`.
- [inferred] `reloadBoundary` must be one of `none-proven`, `hot-deploy`,
  `shell-reload`, or `process-restart`; exact-current-config claims require a
  value other than `none-proven`.
- [inferred] `mutationReplayCount` must be `0` for failed setup/start commands
  unless a later explicit user request creates a separate ledger entry.

## Required Observations

### Before Mutation

- [live-proven] Capture App UI shell/loading/session state before setup edits.
- [live-proven] Capture current setup map row, size/options, seed, player count,
  and any selected map script before mutation.
- [live-proven] Snapshot `Scripting.log` and deployed mod/config mtimes before
  deploy/reload/start.
- [live-proven] Record the Studio request payload after config sanitization and
  before any deploy or setup mutation.

### After Deploy / Reload

- [live-proven] Record deploy command, output, and exact generated/copied files
  without treating deploy as in-game proof.
- [live-proven] Query `GameInfo.Maps` for the selected row after the claimed
  reload boundary.
- [live-proven] Record whether hot deploy, shell reload, or process restart was
  required before the row/hash became visible.

### After Setup / Before Start

- [live-proven] Capture setup state after selecting map row, size/options, seed,
  and player options.
- [live-proven] Fail fast if the after snapshot cannot distinguish the requested
  row/seed/config from stale or manually selected state.

### After Start

- [live-proven] Capture `GameStarted`, Tuner readiness, `GameplayMap` seed,
  dimensions, map size, first-turn/date, alive players, and selected
  `GameInfo.Maps` row.
- [live-proven] Require fresh Swooper log markers with request id and config
  hash; a quiet log or generic map-generation context is insufficient.

## Test Suite Plan

| Package/App | Tests To Add | Failure Modes To Simulate | Gate |
|---|---|---|---|
| `packages/civ7-direct-control` | Setup snapshot, set map row, set seed, set size/options, start game, return-to-shell, and composed setup/start wrapper tests using fake tuner server. | Missing App UI state, Tuner listed but unready, invalid row id, invalid seed, timeout before send, close after send, failed postcondition, stale setup snapshot. | `bun run --cwd packages/civ7-direct-control test`, `check`, `build`. |
| `packages/cli` | CLI command tests that call new package wrappers only and expose `--dry-run`/`--json` proof output. | CLI attempts raw setup JS, reports success without postcondition, retries mutation after send failure. | `bun run --filter @mateicanavra/civ7-cli test`, `check`, `build` if touched. |
| `apps/mapgen-studio` | Server endpoint tests for Run in Game request shape, queueing, error classification, and no raw direct-control command construction; UI/store tests for separate runtime overlay state. | Save succeeds but deploy fails, deploy succeeds but setup fails, setup succeeds but start proof fails, live sync read fails, runtime overlay attempts `pipelineConfig` write. | Studio tests where available plus `bun run --cwd apps/mapgen-studio build`. |
| `mods/mod-swooper-maps` | Config identity/log marker tests that emit config id/hash/request id and reject missing hash in proof mode. | Log marker emitted without hash, stale hash, generated map row missing, authored config accidentally stores seed. | Focused mod tests plus deploy/generation scripts only through existing scripts. |
| `openspec` | Three change slices with requirement scenarios for setup/start, Studio materialization, and live sync. | Shortcut language, bridge fallback, source-only setup proof, exact-current-config claim without reload gate. | `bun run openspec -- validate <change-id> --strict` and `bun run openspec:validate`. |

## P1 Design Holes

- [unresolved] P1: There is no proven setup-state oracle that identifies the
  selected map row, seed, size/options, and config hash before start. Without
  it, proof cannot distinguish the requested run from stale/manual state.
- [unresolved] P1: Reload semantics are not proven. Exact-current-config claims
  must be blocked until the minimum reload boundary is known and encoded in the
  user-facing Run in Game contract.
- [unresolved] P1: New setup/start wrappers do not yet have no-replay tests for
  partial-send failure. This is required because setup/start are mutating.
- [unresolved] P1: Swooper config identity proof is not yet tied to the Studio
  request. Generic MapGeneration log markers can pass while loading the wrong
  config.
- [rejected] P1: Any bridge fallback or caller-local setup JavaScript would
  violate the direct-control boundary and hide proof failures.

## P2 Design Holes

- [unresolved] P2: Materialization policy needs explicit durable Save/Run versus
  disposable `studio-current` behavior, including cleanup and conflict rules.
- [unresolved] P2: Studio currently has runtime status/map/GameInfo endpoints,
  but no tested live sync store boundary that prevents runtime observations from
  mutating authored config.
- [unresolved] P2: Proof output shape is not yet standardized for reviewers;
  without a common ledger schema, later agents can record incompatible evidence.
- [unresolved] P2: CLI and Studio error messages need common classifications
  for deploy failure, reload required, setup rejected, start timeout, proof
  mismatch, and live-sync unavailable.
- [inferred] P2: Exact live sync snapshots should be turn-keyed and bounded;
  unbounded map reads risk latency/timeouts and make proof noisy.

## OpenSpec Readiness Checklist

- [unresolved] `direct-control-new-game-setup` exists with scenarios for setup
  snapshot, row selection, seed/size/options application, start, failure, and
  no replay.
- [unresolved] `studio-run-current-map-config` exists with materialization,
  durable/disposable config policy, deploy/reload semantics, and exact config
  hash proof.
- [unresolved] `studio-live-civ7-map-sync` exists with read-only Tuner snapshots,
  turn-keyed refresh, bounded payloads, and no authored-config writes.
- [unresolved] Each change names build, deploy, log, and in-game proof
  boundaries separately.
- [unresolved] Each change has strict OpenSpec validation passing.
- [rejected] Specs that allow fallback, silent skip, source-only mutating proof,
  or automatic replay are not ready.

## Concrete Next Steps

1. [inferred] Define the three OpenSpec changes above before implementation,
   with P1 findings as blocking scenarios.
2. [inferred] Add direct-control fake-server tests for setup/start payloads,
   postconditions, failure classification, and no mutation replay.
3. [inferred] Add Swooper request id/config hash logging in source before using
   logs as exact-config proof.
4. [inferred] Run live probes in this order: baseline setup snapshot, deploy,
   row visibility after each reload boundary, setup after mutation, start,
   post-start Tuner/map/log proof.
5. [inferred] Only after the ledger has a passing live entry should Studio
   depend on Run in Game for exact-current-config behavior.

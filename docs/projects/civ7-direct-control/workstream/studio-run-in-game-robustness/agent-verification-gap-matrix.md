# Studio Run In Game Robustness Verification Gap Matrix

## Scope

This artifact covers the verification and proof-gap lane for hardening Studio
Run in Game into a reliable, recoverable, phase-aware Civ7 launch workflow.

Selection:

- fake-socket tests;
- Studio middleware/UI tests;
- live proof matrix;
- OpenSpec task truthfulness;
- commands required to close claims.

Evidence boundary:

- No stale live proof should close this robustness phase.
- Existing live proof from
  `docs/projects/civ7-direct-control/workstream/studio-run-in-game/` is useful
  prior context, but it does not prove reload-resumable operation state, stale
  listener recovery, shell `Game` undefined handling, or no browser reload/lost
  status for this phase.
- Fresh proof for this phase starts with the empty robustness proof ledger at
  `docs/projects/civ7-direct-control/workstream/studio-run-in-game-robustness/proof-ledger.md`.

## Evidence Inspected

- OpenSpec robustness change:
  `openspec/changes/studio-run-in-game-robustness/tasks.md`,
  `openspec/changes/studio-run-in-game-robustness/specs/civ7-direct-control/spec.md`.
- Robustness project artifacts:
  `docs/projects/civ7-direct-control/workstream/studio-run-in-game-robustness/proof-ledger.md`,
  `docs/projects/civ7-direct-control/workstream/studio-run-in-game-robustness/closure-checklist.md`,
  `docs/projects/civ7-direct-control/workstream/studio-run-in-game-robustness/investigation-brief.md`.
- Direct-control implementation and tests:
  `packages/civ7-direct-control/src/index.ts`,
  `packages/civ7-direct-control/test/direct-control.test.ts`.
- Studio implementation and tests:
  `apps/mapgen-studio/vite.config.ts`,
  `apps/mapgen-studio/src/App.tsx`,
  `apps/mapgen-studio/src/ui/components/AppFooter.tsx`,
  `apps/mapgen-studio/test/**`.
- Live proof command:
  `scripts/civ7-direct-control/verify-studio-run-in-game-live.ts`.
- Package/root scripts:
  `package.json`,
  `apps/mapgen-studio/package.json`,
  `packages/civ7-direct-control/package.json`,
  `mods/mod-swooper-maps/package.json`.
- Dependent OpenSpec task ledgers:
  `openspec/changes/direct-control-new-game-setup/tasks.md`,
  `openspec/changes/studio-run-current-map-config/tasks.md`,
  `openspec/changes/studio-live-civ7-map-sync/tasks.md`,
  `openspec/changes/studio-disposable-setup-reload/tasks.md`,
  `openspec/changes/workspace-build-pipeline/tasks.md`.

Command actually run during this inspection:

```bash
bun run openspec -- validate studio-run-in-game-robustness --strict
```

Result: valid.

## Severity-Ordered Findings

### P0: Studio Run In Game Is Not Yet Resumable After Browser Reload

Evidence:

- `apps/mapgen-studio/vite.config.ts` implements `POST /api/civ7/run-in-game`
  as one synchronous request. The request id is created inside the POST handler,
  work is awaited through deploy, row proof, setup/start, log proof, and cleanup,
  and the response is written only after completion.
- `apps/mapgen-studio/src/App.tsx` keeps only local component state:
  `runInGameRunning` plus a success/error toast. There is no request-id keyed
  operation record, no status endpoint, and no mount-time resume query.
- `apps/mapgen-studio/src/ui/components/AppFooter.tsx` can show `Launching...`
  while the current component instance is alive, but a reload loses that state.

Why this matters:

The core robustness requirement says Run in Game must be request-id keyed,
phase-aware, and resumable after tab reload or fetch abort. The current code can
successfully launch, but cannot prove recoverability because the browser has no
durable operation identity to recover.

Proposed test/proof:

- Add middleware tests that start a Run in Game operation with a fake launch
  executor, capture a request id immediately, then query `GET
  /api/civ7/run-in-game/status/:requestId` while the operation is in progress.
- Add a resume test that simulates a fresh client instance with only the request
  id and proves it can render last phase, completed phases, proof fields, and
  final/failed status.
- Add a fetch-abort test where the POST client disconnects, the operation
  continues or transitions to a clear terminal/uncertain state, and later status
  polling does not replay mutations.

Exact files likely to change:

- `apps/mapgen-studio/vite.config.ts` or a new extracted middleware module such
  as `apps/mapgen-studio/src/server/runInGame.ts`.
- `apps/mapgen-studio/src/App.tsx`.
- `apps/mapgen-studio/src/ui/components/AppFooter.tsx`.
- New tests under `apps/mapgen-studio/test/runInGame/`.
- `openspec/changes/studio-run-in-game-robustness/tasks.md` only after tests and
  proof exist.

Do not mark complete yet:

- `studio-run-in-game-robustness` tasks `3.1`, `3.2`, `3.3`, `3.4`, `3.5`,
  and `4.4`.

### P0: Shell `Game` Undefined Is Still A Real Health/Status Gap

Evidence:

- `packages/civ7-direct-control/src/index.ts` has a shell-safe setup snapshot
  path through `buildSetupSnapshotCommand`, but `buildAppUiSnapshotCommand`
  still reads gameplay globals such as `Game.turn`, `GameContext.localPlayerID`,
  `Players.maxPlayers`, and `GameplayMap.getGridWidth()` directly.
- `getCiv7PlayableStatus` calls `getCiv7AppUiSnapshot` before composing shell,
  loading, begin-ready, and tuner readiness.
- Existing fake-socket tests cover a successful App UI snapshot and setup
  snapshot, but the fake server always returns gameplay-shaped App UI data. It
  does not simulate shell/main-menu with `Game`, `GameContext`, `Players`, or
  `GameplayMap` undefined.

Why this matters:

The investigation brief records a shell UI health failure with `Game is not
defined`. The robustness spec explicitly requires App UI shell/main-menu to be a
valid setup-control state without requiring gameplay globals.

Proposed test/proof:

- Add a fake-socket mode where App UI snapshot command execution fails if the
  command touches `Game`, `GameContext`, `Players`, or `GameplayMap` outside a
  guarded `probe`.
- Add direct tests for:
  - `getCiv7AppUiSnapshot` from shell with gameplay globals undefined;
  - `getCiv7PlayableStatus` returning `readiness: "shell"` instead of throwing;
  - `GET /api/civ7/live/status` surfacing shell/setup-control readiness without
    a 500.

Exact files likely to change:

- `packages/civ7-direct-control/src/index.ts`.
- `packages/civ7-direct-control/test/direct-control.test.ts`.
- `apps/mapgen-studio/vite.config.ts` if endpoint error shape needs adjustment.
- `apps/mapgen-studio/test/runInGame/` or `apps/mapgen-studio/test/live/`.

Do not mark complete yet:

- `studio-run-in-game-robustness` tasks `2.1`, `2.2`, `2.4`, `5.1`.

### P1: Loading, Begin-Ready, And Tuner-Listed-But-Not-Ready Are Under-Tested

Evidence:

- Direct-control types include readiness values `tuner-ready`, `app-ui-game`,
  `begin-ready`, `loading`, `shell`, and `unavailable`.
- The fake server has only a narrow `loadingState` progression around values `6`
  and `8`, and the tests assert happy-path `tuner-ready`, setup snapshot
  `shell`, row refresh, and start success.
- There is no focused fake-socket test for:
  - pure loading where Begin is not allowed;
  - begin-ready where Tuner is listed but not gameplay-ready;
  - Begin command failure preserving direct-control error details;
  - Tuner listed in `LSQ` but `GameplayMap`/`Game` probes fail.

Why this matters:

Without these cases, the launch workflow can misclassify "Tuner listed" as
playable or hide the highest proven phase. That is exactly the kind of
phase-awareness gap this robustness slice is meant to close.

Proposed test/proof:

- Extend `startTunerServer` in `packages/civ7-direct-control/test/direct-control.test.ts`
  with `initialPhase`, `tunerReady`, and `beginOutput/error` options.
- Assert `getCiv7PlayableStatus` phase ordering:
  - `shell` when only App UI shell is safe;
  - `loading` when `UI.isInLoading()` is true and Begin is false;
  - `begin-ready` when Begin can be pressed but Tuner is not ready;
  - not `tuner-ready` unless map dimensions and alive player probes succeed.
- Assert start failures include direct-control `code`, phase observations, and
  begin/start error details.

Exact files likely to change:

- `packages/civ7-direct-control/test/direct-control.test.ts`.
- `packages/civ7-direct-control/src/index.ts` if current error details are not
  structured enough.
- `openspec/changes/studio-run-in-game-robustness/tasks.md` after proof.

Do not mark complete yet:

- `studio-run-in-game-robustness` tasks `2.2`, `2.3`, `2.4`.

### P1: Stale Listener / LSQ Recovery Is Only Documented As Prior Live Context

Evidence:

- Prior live proof records repeated `LSQ:` timeouts while Civ was listening on
  port `4318`, then later success after Civ process restart.
- The current live proof command reports health failure and avoids mutation, but
  it does not classify stale listener as a distinct phase or recovery state.
- Fake-socket tests cover a normal `LSQ:` response and frame parsing. They do
  not simulate an accepted TCP connection that never replies to `LSQ:`, stale
  state list, half-open sockets, or state list success followed by command
  timeout.

Why this matters:

The robustness goal explicitly calls out stale listener/LSQ. If stale listener
is only a past ledger note, Studio cannot offer phase-specific recovery or
distinguish "Civ unavailable" from "socket accepts but protocol is stale."

Proposed test/proof:

- Add direct-control fake-socket tests for:
  - TCP accept with no `LSQ:` response;
  - `LSQ:` lists Tuner but Tuner health command times out;
  - App UI state responds but Tuner state is stale/unready.
- Add Studio endpoint tests that stale listener maps to a structured failure
  class and recovery action, not a generic toast.
- Add live proof rows that separately record stale-listener recovery:
  read-only stale detection, recovery action taken, then fresh successful
  status after recovery.

Exact files likely to change:

- `packages/civ7-direct-control/src/index.ts`.
- `packages/civ7-direct-control/test/direct-control.test.ts`.
- `scripts/civ7-direct-control/verify-studio-run-in-game-live.ts`.
- `apps/mapgen-studio/vite.config.ts`.
- `docs/projects/civ7-direct-control/workstream/studio-run-in-game-robustness/proof-ledger.md`.

Do not mark complete yet:

- `studio-run-in-game-robustness` tasks `2.2`, `2.4`, `5.4`.

### P1: Row-Refresh Failure Path Has No Studio Test And Loses Client Detail

Evidence:

- `apps/mapgen-studio/vite.config.ts` returns `409` with row-visibility details
  when setup cannot see the requested map script after refresh.
- `apps/mapgen-studio/src/App.tsx` parses only `{ ok, error }` from the response
  and discards `details`, so phase, reload boundary, completed phases, and
  materialization details cannot reach the UI today.
- Existing tests cover direct-control hidden row refresh success, but there are
  no Studio middleware/UI tests for row-missing `409` or failure cleanup.

Why this matters:

Row-refresh failure is one of the highest-risk recoverable states. If the server
returns structured details but the UI drops them, Studio still behaves like a
generic failure toaster.

Proposed test/proof:

- Add a middleware test where deploy succeeds, row refresh remains missing, and
  `/api/civ7/run-in-game` returns `409` with `code`, phase, map script,
  materialization mode/path, reload boundary, and cleanup result.
- Add UI/client tests proving `runCurrentConfigInGame` preserves server
  `details` and renders/copies diagnostics.
- Add a cleanup proof that disposable config files and generated maps are
  restored after row failure.

Exact files likely to change:

- `apps/mapgen-studio/vite.config.ts` or extracted middleware.
- `apps/mapgen-studio/src/App.tsx`.
- `apps/mapgen-studio/src/ui/components/AppFooter.tsx` or a new diagnostics UI
  component.
- `apps/mapgen-studio/test/runInGame/`.

Do not mark complete yet:

- `studio-run-in-game-robustness` tasks `3.3`, `3.4`, `3.5`.

### P1: Connection Loss During Start Or Log Proof Is Not Proven Recoverable

Evidence:

- Direct-control has a no-replay test for socket close during setup mutation.
- There is no equivalent fake-socket test for connection loss during
  `Network.hostGame`, Begin, post-start Tuner wait, map-summary proof, or Swooper
  log proof.
- The Studio middleware waits for fresh log markers after start and then cleans
  up. If log proof fails after a successful launch, current UI status is still a
  generic failed request unless a future operation store preserves the exact
  phase and uncertainty.

Why this matters:

After a mutating start request, uncertainty is more dangerous than a clean
failure. The workflow must avoid replaying start and must show whether the game
may already have launched.

Proposed test/proof:

- Add fake-socket close/fail modes for:
  - socket close after `Network.hostGame`;
  - Begin command timeout;
  - Tuner readiness timeout after App UI `GameStarted`;
  - map seed mismatch after start;
  - log proof timeout after start success.
- Assert no second `Network.hostGame` or setup mutation is sent.
- Assert operation status becomes `uncertain` or `failed` with completed phases
  and recovery guidance.

Exact files likely to change:

- `packages/civ7-direct-control/test/direct-control.test.ts`.
- `packages/civ7-direct-control/src/index.ts`.
- `apps/mapgen-studio/vite.config.ts` or operation-store module.
- `apps/mapgen-studio/test/runInGame/`.

Do not mark complete yet:

- `studio-run-in-game-robustness` tasks `2.3`, `2.4`, `3.3`, `3.5`.

### P1: No Browser Reload / Lost Status Proof Exists For This Phase

Evidence:

- Disposable materialization writes under
  `mods/mod-swooper-maps/src/maps/configs`, deploy regenerates map artifacts,
  cleanup restores the config and regenerates artifacts again.
- The investigation brief records browser Run in Game clicks triggering Vite
  reloads while generated/imported artifacts changed.
- The robustness proof ledger has no entries yet, and there is no automated
  browser or Vite-client test that proves Run in Game does not reload the active
  tab before terminal or resumable status is durable.

Why this matters:

Even if the backend launch succeeds, the user-facing workflow is not reliable if
the active Studio tab reloads and loses launch state. This cannot be closed with
the older live durable/disposable proof because that proof did not instrument
browser reload and status recovery.

Proposed test/proof:

- Add an automated Vite middleware/client test where file changes that normally
  trigger HMR/reload occur during a fake operation, then verify the operation is
  queryable by request id after a simulated remount.
- Add a manual or automated in-app-browser proof that records:
  - request id before file writes;
  - whether the tab reloads;
  - status recovered after reload/remount;
  - no second launch mutation.
- Only after the status endpoint exists, run fresh live browser-click proof for
  durable and disposable modes.

Exact files likely to change:

- `apps/mapgen-studio/vite.config.ts` or extracted server module.
- `apps/mapgen-studio/src/App.tsx`.
- `apps/mapgen-studio/test/runInGame/`.
- `docs/projects/civ7-direct-control/workstream/studio-run-in-game-robustness/proof-ledger.md`.

Do not mark complete yet:

- `studio-run-in-game-robustness` tasks `4.1`, `4.2`, `4.3`, `4.4`, `5.4`.

### P2: Current Package Scripts Verify Older Lanes, Not The New Robustness Closure

Evidence:

- Root `verify:studio-run-in-game` builds/checks/tests direct-control, SDK,
  Swooper, and Studio, then validates these OpenSpec changes:
  `direct-control-new-game-setup`, `studio-run-current-map-config`,
  `studio-live-civ7-map-sync`, `studio-disposable-setup-reload`, and
  `workspace-build-pipeline`.
- It does not validate `studio-run-in-game-robustness`.
- `apps/mapgen-studio` has Vitest tests for presets, viz, browser runner error
  formatting, config schema, and shared pipeline address. It has no Run in Game
  middleware or UI tests.

Why this matters:

Running the existing root verifier can still be useful, but it should not be
treated as closure for this robustness phase until the robustness change and new
tests are included.

Proposed test/proof:

- Add or update a verifier after the tests exist so it includes strict
  validation of `studio-run-in-game-robustness`.
- Keep the live command separate and explicit because mutation requires operator
  intent and a responsive Civ instance.

Exact files likely to change:

- `package.json`.
- `apps/mapgen-studio/package.json` if focused test scripts are added.
- `openspec/changes/studio-run-in-game-robustness/tasks.md`.

Do not mark complete yet:

- `studio-run-in-game-robustness` tasks `5.1`, `5.2`, `5.3`.

### P2: Existing OpenSpec Checkboxes Need Narrow Interpretation

Evidence:

- `openspec/changes/studio-run-in-game-robustness/tasks.md` is correctly still
  mostly incomplete.
- `openspec/changes/studio-run-current-map-config/tasks.md` marks `2.5 Show
  phase/proof result to the developer` complete, but the current client only
  emits a success toast and drops proof/failure details. Treat that as old-scope
  endpoint proof at most, not as robustness UI proof.
- `openspec/changes/studio-run-current-map-config/tasks.md` leaves Studio request
  assembly/endpoint tests and live proof tasks incomplete. They should stay
  incomplete unless reconciled with fresh evidence.
- `openspec/changes/studio-disposable-setup-reload/tasks.md` marks live
  disposable proof complete. That proves row visibility after shell/App UI reload
  in the older lane, but it does not prove browser reload recovery or status
  resume.
- `openspec/changes/workspace-build-pipeline/tasks.md` marks the read-only live
  proof command and LSQ blocker recording complete. That proves the command
  exists and can record a blocker; it does not close stale listener recovery.

Review responsibility:

- Do not check robustness tasks based solely on dependent task checkboxes.
- If dependent task state is reconciled, add a note describing the proof boundary
  rather than flipping checkboxes by implication.
- If `studio-run-current-map-config` task `2.5` remains checked, annotate the
  dependent reconciliation to say it does not satisfy structured resumable UI
  status for this robustness phase.

Exact files likely to change:

- `openspec/changes/studio-run-in-game-robustness/tasks.md`.
- Potentially dependent `tasks.md` files only if this lane deliberately
  reconciles stale task wording.
- `docs/projects/civ7-direct-control/workstream/studio-run-in-game-robustness/proof-ledger.md`.

Do not mark complete yet:

- `studio-run-in-game-robustness` tasks `1.3`, `5.5`.

## Risk-Prioritized Test And Proof Matrix

| Priority | Claim | Current evidence | Gap | Proposed closure |
|---|---|---|---|---|
| P0 | Shell/main-menu status does not fail when `Game` is undefined | Setup snapshot path is shell-safe; investigation records prior failure; App UI snapshot still touches gameplay globals directly | No fake-socket shell-undefined test for App UI/live status | Direct-control fake-socket shell test plus Studio `/api/civ7/live/status` test |
| P0 | Run in Game status survives browser reload/fetch abort | Current POST returns only after launch; client state is local | No operation store, status endpoint, or resume UI | Request-id operation store, status endpoint, remount/resume tests |
| P1 | Loading and begin-ready are phase-aware | Type model exists and happy path begins | No pure loading, begin failure, or Tuner-listed-not-ready tests | Fake-socket phase table tests |
| P1 | Stale listener/LSQ has explicit recovery class | Older live ledger recorded LSQ timeouts | No fake-socket stale listener classification; no Studio recovery UI | Fake stale socket modes plus live proof rows |
| P1 | Row-refresh failure returns actionable diagnostics | Server has a 409 details shape | Client drops details; no middleware/UI test | Middleware 409 test plus UI diagnostics test |
| P1 | Connection loss after mutation is uncertain, not replayed | No-replay setup mutation test exists | No start/log-proof uncertainty tests | Close-on-start/log-timeout tests and operation status assertions |
| P1 | No active-tab reload loses launch state | Prior live durable/disposable proof, but not reload-instrumented | No browser reload/status recovery proof | Browser or Vite-client remount proof with request-id status |
| P2 | Root verifier closes robustness | Existing verifier covers older changes | New robustness change omitted | Update verifier after tests exist |

## Commands Required To Close Claims

Static/spec gates:

```bash
bun run openspec -- validate studio-run-in-game-robustness --strict
bun run openspec:validate
git diff --check
```

Focused package gates after tests are added:

```bash
bun run --cwd packages/civ7-direct-control test -- test/direct-control.test.ts
bun run --cwd packages/civ7-direct-control check
bun run --cwd apps/mapgen-studio test
bun run --cwd apps/mapgen-studio check
```

Root lane gate after the robustness verifier includes the new change:

```bash
bun run verify:studio-run-in-game
```

Read-only live proof, fresh for this phase:

```bash
bun run verify:studio-run-in-game:live -- --timeout-ms 5000 --map-script '{swooper-maps}/maps/swooper-earthlike.js'
```

Mutating live proof from shell/menu:

```bash
bun run verify:studio-run-in-game:live -- \
  --mutate \
  --map-script '{swooper-maps}/maps/swooper-earthlike.js' \
  --map-size MAPSIZE_STANDARD \
  --seed <fresh-seed> \
  --game-seed <fresh-game-seed> \
  --from-running-game reject \
  --timeout-ms 10000 \
  --wait-timeout-ms 180000 \
  --poll-interval-ms 2000
```

Mutating live proof from running game with explicit destructive-exit boundary:

```bash
bun run verify:studio-run-in-game:live -- \
  --mutate \
  --map-script '{swooper-maps}/maps/swooper-earthlike.js' \
  --map-size MAPSIZE_STANDARD \
  --seed <fresh-seed> \
  --game-seed <fresh-game-seed> \
  --from-running-game exit-to-shell \
  --timeout-ms 10000 \
  --wait-timeout-ms 180000 \
  --poll-interval-ms 2000
```

Studio browser proof still needs either an added automated test or a documented
manual procedure after request-id status exists. Minimum proof fields:

- request id;
- browser reload observed yes/no;
- status endpoint result before and after reload/remount;
- completed phases;
- terminal or uncertain status;
- mutation replay count;
- fresh Swooper log proof for successful launches.

## Risks And Non-Goals

Risks:

- A green older `verify:studio-run-in-game` run can create false confidence
  because it does not cover the new robustness proof matrix.
- Live Civ proof is stateful. LSQ listener behavior can change after a process
  restart, so stale listener failures and later success must be recorded as
  separate fresh entries.
- Adding an operation store without tests can make UI status look durable while
  still losing mutation certainty after reload.
- Browser reload proof depends on Vite/dev-server behavior and must be observed,
  not inferred from middleware unit tests alone.

Non-goals for this artifact:

- No production-code changes.
- No new runtime transport or caller-local direct-control script.
- No broad Swooper morphology/ecology test-suite cleanup.
- No reuse of older live durable/disposable proof as closure for robustness
  status-resume or no-reload claims.

## Recommended Closure Order

1. Fix shell-safe App UI/live status and add fake-socket coverage for
   `Game` undefined, loading, begin-ready, and Tuner-listed-not-ready.
2. Extract or wrap Studio Run in Game middleware so it can be tested with fake
   deploy/direct-control/log-proof dependencies.
3. Add request-id operation state and status endpoint before browser proof.
4. Add Studio tests for validation, durable/disposable requests, row-missing
   `409`, cleanup, status resume, and no browser Run coupling.
5. Add stale listener and connection-loss tests, including no replay after
   setup/start uncertainty.
6. Run static/package/root gates and strict OpenSpec validation.
7. Run fresh live proof matrix and record results in the robustness proof
   ledger.
8. Only then reconcile OpenSpec checkboxes and closure checklist.

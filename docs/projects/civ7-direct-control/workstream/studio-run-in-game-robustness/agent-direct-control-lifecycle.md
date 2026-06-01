# Direct-Control Lifecycle And Readiness Review

## Scope

Frame: direct-control lifecycle/readiness lane for Studio Run in Game robustness.

Selection:

- App UI shell/setup classification.
- Tuner gameplay readiness.
- Stale listener / `LSQ:` uncertainty.
- Setup/start mutation replay safety.

Exterior:

- No FireTuner or Windows bridge fallback.
- No Studio ownership of raw control JavaScript.
- No production-code edits in this artifact pass.

Key observed failure: App UI shell/main-menu status failed with `Game is not defined`.

## Evidence

- Package router: `packages/civ7-direct-control/AGENTS.md` says this package owns tuner socket protocol, state discovery, reconnect polling, and raw control framing; CLI and Studio must stay above it.
- Active design: `openspec/changes/studio-run-in-game-robustness/design.md` requires shell-safe setup/UI probes before gameplay globals, distinct readiness states, no silent mutation replay after uncertainty, and structured failure details.
- Active spec: `openspec/changes/studio-run-in-game-robustness/specs/civ7-direct-control/spec.md` requires shell App UI to classify as setup-control ready even when `Game`, `GameContext`, `Players`, or `GameplayMap` are undefined.
- Current source: `packages/civ7-direct-control/src/index.ts`.
- Current tests: `packages/civ7-direct-control/test/direct-control.test.ts`.
- Studio caller: `apps/mapgen-studio/vite.config.ts` and `apps/mapgen-studio/src/App.tsx`.
- Validation command run in this pass: `bun run --cwd packages/civ7-direct-control test` passed 25 tests. This is source-level test proof only; no live Civ7 command or in-game proof was run.
- Working-tree note: while this artifact was being prepared, an uncommitted production diff appeared in `packages/civ7-direct-control/src/index.ts`. It partially guards App UI snapshot reads through `globalThis` fallback values and adds `begin`, `beginAttempted`, and `beginError` fields to `Civ7SinglePlayerStartResult`. This artifact treats that diff as uncommitted implementation evidence, not completed closure, because the readiness vocabulary, stale-listener classification, structured uncertainty, and targeted tests are still missing.

## Findings

### P1: App UI snapshot still reads gameplay globals before it can classify shell

`getCiv7AppUiSnapshot()` calls `buildAppUiSnapshotCommand()` (`packages/civ7-direct-control/src/index.ts:1200`, `packages/civ7-direct-control/src/index.ts:2501`). The committed baseline generated command wraps several calls in `probe()`, but directly reads gameplay globals:

- `Game.turn`, `Game.age`, `Game.maxTurns` at `packages/civ7-direct-control/src/index.ts:2528`.
- `GameContext.localPlayerID` and `GameContext.localObserverID` at `packages/civ7-direct-control/src/index.ts:2556`.
- `Players.maxPlayers` at `packages/civ7-direct-control/src/index.ts:2561`.

In App UI shell/main-menu, the active spec explicitly allows those globals to be undefined. That explains the observed `Game is not defined` shell failure: the whole command can throw before returning JSON, so `getCiv7PlayableStatus()` (`packages/civ7-direct-control/src/index.ts:1420`) and Studio `/api/civ7/status` (`apps/mapgen-studio/vite.config.ts:314`) receive a command failure instead of a shell/setup-control classification.

The current uncommitted production diff mitigates the immediate crash by routing these reads through `globalThis` and fallback values. That is directionally correct but not enough to close the P1 by itself: the status contract still needs an explicit shell/setup classifier, readiness phase vocabulary, and tests that reproduce the shell missing-globals condition.

This is a P1 blocker because the robustness goal overclaims if shell/main-menu is treated as broken health. Studio Run in Game starts from shell often, and the browser status surface currently depends on this unsafe snapshot.

### P1: Readiness classification lacks the required phase vocabulary and stale-listener state

`Civ7PlayableStatusResult.readiness` currently allows `tuner-ready`, `app-ui-game`, `begin-ready`, `loading`, `shell`, and `unavailable` (`packages/civ7-direct-control/src/index.ts:303`). The active design requires `connected`, `shell`, `loading`, `begin-ready`, `game-started`, `tuner-ready`, and `stale-listener`.

Current implementation gaps:

- `checkCiv7DirectControlHealth()` reports `ok: true, status: "ready"` after `LSQ:` and optional state selection only (`packages/civ7-direct-control/src/index.ts:1340`). That proves socket state listing, not gameplay readiness.
- `getCiv7PlayableStatus()` calls Tuner health unconditionally after App UI snapshot (`packages/civ7-direct-control/src/index.ts:1423`). If Tuner is listed but not command-ready, this becomes a string in `errors`, not a first-class phase.
- `app-ui-game` at `packages/civ7-direct-control/src/index.ts:1440` is close to the required `game-started`, but it is not the same contract: it should mean App UI has reached `GameStarted` while Tuner gameplay proof may still be pending.
- Response timeouts from `LSQ:` or command execution are represented as `response-timeout`, `all-hosts-unavailable`, or `unavailable` (`packages/civ7-direct-control/src/index.ts:1066`, `packages/civ7-direct-control/src/index.ts:1378`), not `stale-listener`.

This is a P1 blocker because Studio cannot make recoverable phase decisions if direct-control compresses stale listeners, missing Tuner readiness, and true unavailability into generic errors.

### P1: Start/begin mutation replay safety is incomplete after uncertainty

The package already avoids replaying the setup mutation in `prepareCiv7SinglePlayerSetup()` because it calls `executeCiv7AppUiCommand()` once for `buildPrepareSinglePlayerSetupCommand()` (`packages/civ7-direct-control/src/index.ts:1687`). The existing test `does not replay setup mutations after a socket close` verifies this narrow case (`packages/civ7-direct-control/test/direct-control.test.ts:456`).

The committed baseline start path is weaker:

- `startPreparedCiv7SinglePlayerGame()` sends `Network.hostGame()` once (`packages/civ7-direct-control/src/index.ts:1730`), then polls App UI.
- During polling, when begin-ready, it sends `UI.notifyUIReady()` via `executeSessionCommandWithReconnect(..., 1)` and suppresses any error with `.catch(() => undefined)` (`packages/civ7-direct-control/src/index.ts:1755`).
- Because there is no `beginAttempted` guard in the committed baseline, a later poll can send `UI.notifyUIReady()` again if the previous request timed out or the socket closed after Civ accepted it.
- The catch block around polling closes the session and continues (`packages/civ7-direct-control/src/index.ts:1770`), which is appropriate for read polling but unsafe for ambiguous post-mutation state unless the operation is marked uncertain.

`restartCiv7GameAndBegin()` has a `beginAttempted` guard (`packages/civ7-direct-control/src/index.ts:1270`) and records `beginError`, but it still reports timeout as `connection-timeout` with observations (`packages/civ7-direct-control/src/index.ts:1312`) rather than a structured uncertain/mutation phase. The current uncommitted production diff adds the same begin-attempt record to `startPreparedCiv7SinglePlayerGame()`, which addresses the narrow repeated-begin risk if accepted, but it still needs uncertainty semantics and tests.

This is a P1 blocker because the workstream explicitly requires no silent mutation replay after setup/start uncertainty. `Network.hostGame()`, `UI.notifyUIReady()`, `engine.call("exitToMainMenu")`, `UI.reloadUI()`, and setup mutations need explicit mutation attempt records and no automatic replay after response timeout or socket close.

### P2: Direct-control and Studio do not preserve structured failure details through Run in Game

`Civ7DirectControlError` has `code` and `details` (`packages/civ7-direct-control/src/index.ts:894`), but several Studio boundaries collapse that into a message:

- `/api/civ7/status` catches and returns `{ ok: false, error }` only (`apps/mapgen-studio/vite.config.ts:321`).
- `/api/civ7/run-in-game` preserves details only for `RunInGameHttpError`; direct-control errors become generic 500 responses with only `error` (`apps/mapgen-studio/vite.config.ts:605`).
- The client helper `runCurrentConfigInGame()` returns only `{ ok: false, error }` on failure (`apps/mapgen-studio/src/App.tsx:169`), and the UI emits a generic toast (`apps/mapgen-studio/src/App.tsx:1245`).

Direct-control also does not attach phase metadata to errors from setup/start wrappers. For example, row missing uses `setup-map-row-missing` (`packages/civ7-direct-control/src/index.ts:1679`), start timeout uses `setup-start-timeout` (`packages/civ7-direct-control/src/index.ts:1776`), and Tuner readiness timeout uses `connection-timeout` (`packages/civ7-direct-control/src/index.ts:4065`), but callers have to infer whether the operation was checking Civ, preparing setup, starting game, waiting for proof, or uncertain after a mutation.

This is a P2 blocker for the robustness goal because users need phase, failure class, direct-control code, completed phases, map script, materialization mode/path, and recovery options without reading terminal logs.

### P2: The current fake socket tests cannot catch shell-global regressions

`packages/civ7-direct-control/test/direct-control.test.ts` uses `startTunerServer()` (`packages/civ7-direct-control/test/direct-control.test.ts:684`). The fake server does not evaluate generated JavaScript; it pattern-matches command strings and returns canned JSON. For example, any command containing `Network.isInSession` returns a full App UI snapshot with gameplay fields (`packages/civ7-direct-control/test/direct-control.test.ts:889`).

Because the fake server never executes `Game.turn` or `Players.maxPlayers`, the test `returns the App UI snapshot from a package-owned command profile` (`packages/civ7-direct-control/test/direct-control.test.ts:151`) passes even though a real shell can throw `Game is not defined`. The test `reports playable status by composing App UI and Tuner readiness` (`packages/civ7-direct-control/test/direct-control.test.ts:212`) also only covers the happy path where both App UI and Tuner are ready.

This is a P2 blocker because the package test suite can pass while the key observed shell failure remains unfalsified.

### P2: README/runtime docs now overstate App UI gameplay global availability

`packages/civ7-direct-control/README.md` says current live evidence shows `Game`, `GameContext`, `Players`, and `GameplayMap` are available in `App UI`. The active robustness design and observed shell failure refine that: those globals may be available in App UI during a running game, but shell/main-menu App UI must be treated as setup/UI-only until gameplay roots are proven.

This matters because future callers may use the README as permission to add more App UI gameplay reads to health or setup probes.

## Proposed Implementation

### 1. Split App UI lifecycle classification from gameplay snapshot reads

Add a shell-safe App UI lifecycle/setup classifier owned by `@civ7/direct-control`. It should execute only guarded reads first:

- `typeof globalThis.UI`, `UI.isInShell()`, `UI.isInLoading()`, `UI.isInGame()`, `UI.getGameLoadingState()`, and `typeof UI.notifyUIReady`.
- `typeof globalThis.Network`, minimal guarded session/connectivity reads where needed.
- `typeof globalThis.Configuration` and `typeof globalThis.GameSetup` for setup-control capability.
- Setup row and parameter reads through the existing guarded `setupSnapshotScriptSource()` path.

Then make `getCiv7PlayableStatus()` compose:

1. `connected`: `LSQ:` responded.
2. App UI setup/lifecycle snapshot: classify `shell`, `loading`, `begin-ready`, or `game-started`.
3. Tuner gameplay canary only when the phase makes it meaningful, or run it as optional proof whose failure becomes a structured `tuner-not-ready` field.
4. Gameplay/map summary only after Tuner health is ready.

Keep gameplay-heavy App UI snapshot fields either fully guarded with `globalThis` or move them behind a `game-started` snapshot method so shell status cannot fail.

### 2. Make readiness states explicit and recoverable

Replace or extend `Civ7PlayableStatusResult.readiness` so callers can distinguish:

- `connected`: socket and `LSQ:` succeeded, no App UI classification yet.
- `shell`: App UI setup control is reachable; gameplay globals may be absent.
- `loading`: App UI reports transition/loading.
- `begin-ready`: App UI loading state is `WaitingForUIReady` or `WaitingToStart`.
- `game-started`: App UI reports `GameStarted` / in-game, but Tuner gameplay proof is not ready.
- `tuner-ready`: Tuner canary and map summary/readiness proof passed.
- `stale-listener`: TCP accepts or an existing listener partially responds, but `LSQ:` or required protocol commands do not complete inside the budget.
- `unavailable`: no usable endpoint.

Preserve lower-level `Civ7DirectControlError.code` and the strongest proven phase. Do not let `LSQ:` alone mean playable.

### 3. Separate read retries from mutation attempts

Introduce explicit command execution modes or helper names:

- Read/probe commands may reconnect and retry within a polling budget.
- Mutating commands may be attempted once per operation phase unless the caller starts a new explicit operation.

For setup/start wrappers, record mutation attempts and phase outcomes:

- `exit-to-shell`: command sent, response observed, or uncertain.
- `reload-ui`: command sent, response observed, or uncertain.
- `prepare-setup`: command sent, response observed/readback verified, or uncertain.
- `host-game`: command sent, response observed, or uncertain.
- `notify-ui-ready`: command sent, response observed, or uncertain.

If a mutating command hits `response-timeout`, `socket-closed`, or connection loss after write, return a structured `uncertain` failure instead of silently continuing or replaying. In `startPreparedCiv7SinglePlayerGame()`, keep the uncommitted `beginAttempted`-style guard if it lands, remove silent begin mutation suppression, and convert ambiguous begin loss into an uncertain phase result.

### 4. Preserve structured error details at Studio boundaries

Add a direct-control error serializer for Studio middleware:

- `code`
- `message`
- `phase`
- `readiness`
- `failureClass`
- `completedPhases`
- `directControlDetails`
- `mapScript`
- `materialization`
- `reloadBoundary`
- `requestId`
- `diagnostics`

Use it in `/api/civ7/status`, `/api/civ7/live/status`, and `/api/civ7/run-in-game`. Keep Studio from constructing raw Civ JavaScript; it should only display the package-owned phase/error contract and call explicit recovery endpoints/actions.

### 5. Update docs after behavior changes

After implementation, update `packages/civ7-direct-control/README.md` to say App UI has shell/setup and running-game subphases. Gameplay globals in App UI are conditional, not baseline health requirements.

## Tests And Proof Required

Focused package tests should be added under `packages/civ7-direct-control/test/direct-control.test.ts`:

- Shell-safe status: fake App UI command returns `ReferenceError: Game is not defined` for the current snapshot path; after the fix, `getCiv7PlayableStatus()` reports `readiness: "shell"` and does not fail. This directly covers the observed failure.
- Setup snapshot shell: `getCiv7SetupSnapshot()` continues to classify shell using setup/UI roots without gameplay globals.
- Tuner listed but not ready: `LSQ:` includes `Tuner`, but the Tuner canary times out or returns `ready: false`; status reports the strongest App UI phase and structured Tuner-not-ready detail, not playable.
- Game started but Tuner not ready: App UI reports `GameStarted`; Tuner canary fails; readiness is `game-started`, not `tuner-ready`.
- Stale listener: TCP accepts and either never answers `LSQ:` or answers `LSQ:` but not `CMD`; status reports `stale-listener` or an equivalent first-class error classification.
- Running-game rejection: `runCiv7SinglePlayerFromSetup()` rejects running-game state unless `fromRunningGame: "exit-to-shell"` is explicitly set.
- No replay after `Network.hostGame()` uncertainty: socket closes or response times out after the start mutation is written; assert only one `Network.hostGame` command and an uncertain/failure result.
- No replay after `UI.notifyUIReady()` uncertainty: begin-ready repeats during polling; assert only one `UI.notifyUIReady()` command and an uncertain/failure result.
- Row-refresh uncertainty: exit/reload commands are not replayed after socket loss, and the result preserves the phase.
- Error serialization: a direct-control error returned through the Studio Run in Game middleware preserves `code`, phase, details, and recovery-safe fields.

Existing tests that should be kept but are insufficient by themselves:

- `does not replay setup mutations after a socket close` covers setup mutation only (`packages/civ7-direct-control/test/direct-control.test.ts:456`).
- `prepares and starts a single-player game through setup wrappers` covers happy-path setup/start (`packages/civ7-direct-control/test/direct-control.test.ts:357`).
- `refreshes setup map rows from a running game when a deployed row is not yet visible` covers happy-path row refresh (`packages/civ7-direct-control/test/direct-control.test.ts:391`).
- `reports playable status by composing App UI and Tuner readiness` covers only the fully ready happy path (`packages/civ7-direct-control/test/direct-control.test.ts:212`).

Command gates from the package router:

- `bun run --cwd packages/civ7-direct-control test`
- `bun run --cwd packages/civ7-direct-control check`
- `bun run --cwd packages/civ7-direct-control build`

Workstream-level proof still needs live Civ7 runs before claiming in-game robustness:

- Shell/main-menu status from App UI.
- Running-game status.
- Durable Run in Game launch.
- Disposable Run in Game launch.
- Tuner-listed-but-not-ready transition.
- Stale listener or `LSQ:` failure recovery.

This artifact only ran package tests; it did not run live Civ7, deploy, log, or browser proof.

## Risks And Non-Goals

- Risk: treating shell as healthy may hide real setup API absence. Mitigation: report shell only when App UI setup-control roots are present or setup snapshot probes succeed; otherwise report `connected` or `unavailable` with details.
- Risk: stale listener classification can be too broad. Mitigation: distinguish connection failure, `LSQ:` timeout, command timeout, and socket closed after write in `Civ7DirectControlError.details`.
- Risk: no-replay semantics may leave Civ launching while Studio reports uncertain. That is intentional; recovery must be explicit because the mutation may already have landed.
- Risk: Studio status may need a request-id operation store to survive Vite reload; direct-control should expose phase/error contracts, while Studio owns operation persistence and display.
- Non-goal: restore FireTuner, Windows bridge fallback, or alternate transports.
- Non-goal: let Studio own raw setup/start JavaScript.
- Non-goal: claim live in-game proof from unit tests, build checks, or static inspection.

## Review Responsibility

The robustness goal would overclaim unless these blockers are resolved:

- P1: shell-safe App UI classification must replace gameplay-global health reads.
- P1: readiness must distinguish shell, loading, begin-ready, game-started, tuner-ready, stale-listener, and unavailable.
- P1: mutating setup/start phases must never replay silently after timeout/socket uncertainty.
- P2: structured direct-control error details must survive through Studio middleware and UI.
- P2: tests must directly falsify `Game is not defined`, Tuner-listed-not-ready, stale listener, and no-replay failure modes.

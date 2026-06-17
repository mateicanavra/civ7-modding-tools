## 1. Frame And Contract

- [x] 1.1 Reconfirm D8 `StudioEventHub` and D9 operation push are present on
      the implementation base.
- [x] 1.2 Define the `live-game` event payload in the existing TypeBox
      `StudioEvent` union; do not add a Zod mirror or bridge.
- [x] 1.3 Add or reuse one package-owned live-game state/keying helper shared by
      watcher code and client model tests.
- [x] 1.4 Prove the live-game key excludes `observedAt`, retry timestamps,
      clock-only fields, and failure-count-only churn.

## 2. Daemon Runtime Watcher

- [x] 2.1 Implement `StudioLiveGameWatcher` as an Effect-scoped daemon runtime
      service/layer, not as a browser loop or unscoped handler timer.
- [x] 2.2 Compose the watcher with production daemon `ManagedRuntime`,
      `Civ7TunerClient`, `Civ7TunerSession`, and D8 `StudioEventHub`.
- [x] 2.3 Keep fake live-status read functions isolated to package tests.
- [x] 2.4 Publish the first observed live-game state.
- [x] 2.5 Publish when the stable live-game key changes.
- [x] 2.6 Stay quiet when the key is unchanged or only clock/retry fields
      changed.
- [x] 2.7 Dispose watcher fibers/timers with daemon runtime scope before
      EventHub/runtime teardown.
- [x] 2.8 Add production composition proof that the daemon supplies the shared
      session/event hub and does not construct an alternate FireTuner status
      path for the watcher.

## 3. Client Live-Game Event Application

- [x] 3.1 Extend the single Studio event hook to dispatch `live-game` events.
- [x] 3.2 Apply pushed live-game state in `StudioShell` without reintroducing
      operation polling, identity polling, or browser live-status polling.
- [x] 3.3 Trigger `civ7.live.snapshot` request/response reads from pushed state
      only when the pushed state makes the visible snapshot stale.
- [x] 3.4 Preserve snapshot request-key stale commit guards and abort/ignore
      older work when a newer live-game event arrives.
- [x] 3.5 Trigger setup suggestion request/response reads from pushed state
      only, with newer-event abort/supersede handling.
- [x] 3.6 Add client scenario tests that prove pushed events update state,
      trigger bounded snapshot/setup follow-ups, and do not create a cadence.

## 4. Delete Browser Live-Status Cadence

- [x] 4.1 Delete `nextLiveRuntimePollDelayMs` and cadence-pinning tests.
- [x] 4.2 Delete browser live-status `setTimeout` and `setInterval` loops.
- [x] 4.3 Delete background app/browser `civ7.live.status` callers.
- [x] 4.4 Delete background `liveControlPort.readiness.current` cadence calls.
- [x] 4.5 Delete polling hook, retry loop, and `refetchInterval` ownership for
      live status freshness.
- [x] 4.6 Classify retained deliberate user-triggered request/response actions
      separately from background freshness.

## 5. Verification

- [x] 5.1 `bun run openspec -- validate mapgen-studio-live-game-watch --strict`.
- [x] 5.2 `bun run openspec:validate`.
- [x] 5.3 Focused package tests for watcher first/change/quiet/clock-only
      behavior and disposal.
- [x] 5.4 Focused package/daemon composition test proving shared
      `Civ7TunerSession` and EventHub ownership.
- [x] 5.5 Focused app tests for live-game event application plus event-triggered
      snapshot/setup follow-ups.
- [x] 5.6 Package/app check gates selected by the implementation write set.
- [x] 5.7 Negative searches for deleted browser cadence symbols and alternate
      watcher/session/event paths.
- [x] 5.8 Live Civ7 proof with branch, commit, command/API path, timestamps,
      relevant logs, and parsed payload shape.
- [x] 5.9 If Civ7 is unavailable, write `workstream/next-packet.md` and leave
      D10 not-green for live-game watcher behavior.

Historical live-proof reconciliation note, 2026-06-16, superseded by the
completion note below:

- D12 later ran live Run in Game and Save&Deploy state-machine proof through
  Nx Studio, `studio.events.watch`, keyed status, and
  `studio.operations.current({})`.
- That proof consumes the broad operation/product handoff from D10/D11, but it
  does not explicitly prove D10's live-game watcher-specific subclaims: first
  retained `live-game`, reconnect replay, unchanged-key quiet behavior, and
  changed live-game state publication against a real Civ7 session.
- At that time, task 5.8 remained open as a narrowed live-game watcher proof gap,
  not as a blocker for D12 drain or Run in Game / Save&Deploy state-machine
  closure.

Live-proof completion note, 2026-06-16:

- Branch `codex/studio-dev-port-env` at `aa8325a83` ran the D10 narrowed
  watcher proof against a local tuner-ready Civ7 session through full Studio
  dev surfaces: daemon `127.0.0.1:5274`, frontend `http://localhost:5273`.
- Raw captures are recorded in `workstream/testing-ledger.md`: preflight JSON,
  first stream, reconnect stream, quiet-window streams, changed-turn stream,
  parsed summaries, listener/daemon-health captures, and browser/network proof.
- The accepted live claim is watcher-specific: `hello`, first retained
  `live-game`, reconnect replay, unchanged-key quiet window, changed
  `live-game` state after a real autoplay trigger including `turn: 34 -> 35`,
  source-composition proof, and browser event-stream consumption without
  background live-status/readiness cadence.

## 6. Closure

- [x] 6.1 Review findings dispositioned with no unresolved P1/P2.
- [x] 6.2 Downstream realignment recorded for D11 Nx dev runner and D12 game-door
      invariant.
- [x] 6.3 Closure checklist distinguishes OpenSpec validation, tests, negative
      searches, live proof, and Graphite state.
- [x] 6.4 Graphite branch is committed cleanly without unrelated staged files.

## 1. Frame And Contract

- [ ] 1.1 Reconfirm D8 `StudioEventHub` and D9 operation push are present on
      the implementation base.
- [ ] 1.2 Define the `live-game` event payload in the existing TypeBox
      `StudioEvent` union; do not add a Zod mirror or bridge.
- [ ] 1.3 Add or reuse one package-owned live-game state/keying helper shared by
      watcher code and client model tests.
- [ ] 1.4 Prove the live-game key excludes `observedAt`, retry timestamps,
      clock-only fields, and failure-count-only churn.

## 2. Daemon Runtime Watcher

- [ ] 2.1 Implement `StudioLiveGameWatcher` as an Effect-scoped daemon runtime
      service/layer, not as a browser loop or unscoped handler timer.
- [ ] 2.2 Compose the watcher with production daemon `ManagedRuntime`,
      `Civ7TunerClient`, `Civ7TunerSession`, and D8 `StudioEventHub`.
- [ ] 2.3 Keep fake live-status read functions isolated to package tests.
- [ ] 2.4 Publish the first observed live-game state.
- [ ] 2.5 Publish when the stable live-game key changes.
- [ ] 2.6 Stay quiet when the key is unchanged or only clock/retry fields
      changed.
- [ ] 2.7 Dispose watcher fibers/timers with daemon runtime scope before
      EventHub/runtime teardown.
- [ ] 2.8 Add production composition proof that the daemon supplies the shared
      session/event hub and does not construct an alternate FireTuner status
      path for the watcher.

## 3. Client Live-Game Event Application

- [ ] 3.1 Extend the single Studio event hook to dispatch `live-game` events.
- [ ] 3.2 Apply pushed live-game state in `StudioShell` without reintroducing
      operation polling, identity polling, or browser live-status polling.
- [ ] 3.3 Trigger `civ7.live.snapshot` request/response reads from pushed state
      only when the pushed state makes the visible snapshot stale.
- [ ] 3.4 Preserve snapshot request-key stale commit guards and abort/ignore
      older work when a newer live-game event arrives.
- [ ] 3.5 Trigger setup suggestion request/response reads from pushed state
      only, with newer-event abort/supersede handling.
- [ ] 3.6 Add client scenario tests that prove pushed events update state,
      trigger bounded snapshot/setup follow-ups, and do not create a cadence.

## 4. Delete Browser Live-Status Cadence

- [ ] 4.1 Delete `nextLiveRuntimePollDelayMs` and cadence-pinning tests.
- [ ] 4.2 Delete browser live-status `setTimeout` and `setInterval` loops.
- [ ] 4.3 Delete background app/browser `civ7.live.status` callers.
- [ ] 4.4 Delete background `liveControlPort.readiness.current` cadence calls.
- [ ] 4.5 Delete polling hook, retry loop, and `refetchInterval` ownership for
      live status freshness.
- [ ] 4.6 Classify retained deliberate user-triggered request/response actions
      separately from background freshness.

## 5. Verification

- [ ] 5.1 `bun run openspec -- validate mapgen-studio-live-game-watch --strict`.
- [ ] 5.2 `bun run openspec:validate`.
- [ ] 5.3 Focused package tests for watcher first/change/quiet/clock-only
      behavior and disposal.
- [ ] 5.4 Focused package/daemon composition test proving shared
      `Civ7TunerSession` and EventHub ownership.
- [ ] 5.5 Focused app tests for live-game event application plus event-triggered
      snapshot/setup follow-ups.
- [ ] 5.6 Package/app check gates selected by the implementation write set.
- [ ] 5.7 Negative searches for deleted browser cadence symbols and alternate
      watcher/session/event paths.
- [ ] 5.8 Live Civ7 proof with branch, commit, command/API path, timestamps,
      relevant logs, and parsed payload shape.
- [ ] 5.9 If Civ7 is unavailable, write `workstream/next-packet.md` and leave
      D10 not-green for live behavior.

## 6. Closure

- [ ] 6.1 Review findings dispositioned with no unresolved P1/P2.
- [ ] 6.2 Downstream realignment recorded for D11 Nx dev runner and D12 game-door
      invariant.
- [ ] 6.3 Closure checklist distinguishes OpenSpec validation, tests, negative
      searches, live proof, and Graphite state.
- [ ] 6.4 Graphite branch is committed cleanly without unrelated staged files.

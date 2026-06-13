## 1. Frame

- [x] 1.1 Create S3.3 proposal/design/tasks/spec delta from the accepted plan,
      S3.1/S3.2 changes, and watcher context.
- [x] 1.2 Run strict OpenSpec validation before implementation.
- [x] 1.3 Keep watcher/review lane active through implementation and record
      dispositions.

## 2. Server Live-Game Watcher

- [x] 2.1 Define the TypeBox `live-game` event state contract without adding
      new Zod schemas.
- [x] 2.2 Add shared live-game state/keying helpers used by both watcher and
      client model.
- [x] 2.3 Add a daemon-enabled watcher that polls through the unified runtime's
      shared `Civ7TunerSession`.
- [x] 2.4 Publish `live-game` events only when the live-game key changes.
- [x] 2.5 Dispose the watcher with the unified handler/runtime.
- [x] 2.6 Add focused package tests for publish-on-change and quiet-when-unchanged.

## 3. Client Live-Game Events

- [x] 3.1 Extend the single Studio event hook to dispatch `live-game` events.
- [x] 3.2 Apply pushed live-game state in `StudioShell` and preserve event-driven
      request/response snapshot reads.
- [x] 3.3 Preserve event-triggered setup suggestions without adding a background
      setup/status cadence.
- [x] 3.4 Add/adjust focused client tests for live-game event application.

## 4. Delete Client Status Polling

- [x] 4.1 Delete `nextLiveRuntimePollDelayMs` and its poll-cadence test.
- [x] 4.2 Delete the live status `setTimeout` loop from `StudioShell`.
- [x] 4.3 Remove background readiness overlay calls from the deleted loop while
      keeping deliberate control actions intact.

## 5. Verification + Closure

- [x] 5.1 `bun run openspec -- validate mapgen-studio-live-game-watch --strict`.
- [x] 5.2 Focused package/app tests for watcher and event application.
- [x] 5.3 Negative search proofs for deleted live status polling paths.
- [x] 5.4 Package/app check gates selected by blast radius.
- [x] 5.5 Watcher findings dispositioned, downstream realignment recorded, and
      Graphite submit/merge/drain complete.

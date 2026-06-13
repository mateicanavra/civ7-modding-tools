## 1. Frame

- [x] 1.1 Create S3.2 proposal/design/tasks/spec delta from the accepted plan,
      S3.1 handoff, and watcher findings.
- [x] 1.2 Run strict OpenSpec validation before implementation.
- [x] 1.3 Keep watcher/review lane active through implementation and record
      dispositions.

## 2. Server Operation Publishers

- [x] 2.1 Inject the S3.1 EventHub into app-side Studio engine construction.
- [x] 2.2 Add one audited publisher callback path for Run in Game operation
      store transitions.
- [x] 2.3 Add one audited publisher callback path for Save&Deploy operation
      store transitions.
- [x] 2.4 Add focused falsification tests proving operation transitions publish
      events for both registries.

## 3. Client Operation Push

- [x] 3.1 Add explicit `operation` event handling to the Studio event hook.
- [x] 3.2 Preserve Run in Game terminal toast behavior for live pushed terminal
      events while still suppressing stale boot/reconnect terminal toasts.
- [x] 3.3 Add focused app tests proving pushed Run in Game and Save&Deploy
      operation events update client state.

## 4. Delete Operation Polling + Identity Watchdog

- [x] 4.1 Delete `useOperationStatusPolls` and remove its call sites.
- [x] 4.2 Delete polling-only status refresh callbacks and synthetic 404
      status-missing mapping from `StudioShell`.
- [x] 4.3 Delete the hidden Save&Deploy background completion loop.
- [x] 4.4 Delete `useDaemonInstanceWatchdog` and remove the client
      `serverInfo` identity polling path.
- [x] 4.5 Keep live-game polling unchanged for S3.3.

## 5. Verification + Closure

- [x] 5.1 `bun run openspec -- validate mapgen-studio-operations-push --strict`.
- [x] 5.2 Focused package/app tests for operation publication and event
      application.
- [x] 5.3 Negative search proofs for deleted operation polling/watchdog paths.
- [x] 5.4 Package/app check gates selected by blast radius.
- [x] 5.5 Graphite submit/merge/drain according to repo rules.

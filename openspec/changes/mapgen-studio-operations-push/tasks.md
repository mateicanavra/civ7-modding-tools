## 1. Packet Entrance

- [x] 1.1 Confirm D0-D8 are accepted in `OPENSPEC-PACKET-TRAIN.md`.
- [x] 1.2 Classify the existing `mapgen-studio-operations-push` change as
      historical implementation-closure notes requiring D9 frame-standard
      repair.
- [x] 1.3 Complete D9 prework, testing/vendor-alignment, downstream, and
      hardening/black-ice scout lanes.
- [x] 1.4 Run D9 operation-publisher, testing/vendor-alignment,
      hardening/black-ice, and downstream realignment review lanes.
- [x] 1.5 Record packet entrance proof: branch/status, selected baseline,
      dirty-file quarantine, dependency/build entrance, and Graphite stack
      state.

## 2. Packet Scope

- [x] 2.1 Specify one D8 `StudioEventHub` publisher path for Run in Game
      operation transitions.
- [x] 2.2 Specify one D8 `StudioEventHub` publisher path for Save&Deploy
      operation transitions.
- [x] 2.3 Specify create/update/complete/fail publication obligations for both
      operation families.
- [x] 2.4 Specify publisher failure semantics: diagnostic only, no polling
      retained path, transition remains recorded.
- [x] 2.4a Specify production daemon composition must supply D8 EventHub; any
      no-publisher seam is test/non-daemon only.
- [x] 2.5 Specify client `operation` event application for Run in Game and
      Save&Deploy.
- [x] 2.6 Specify terminal toast parity for adopted terminal vs live pushed
      terminal Run in Game operations.
- [x] 2.7 Specify deletion of `useOperationStatusPolls`, polling-only
      `StudioShell` callbacks, synthetic polling-only 404 handling, hidden
      Save&Deploy completion loop, `useDaemonInstanceWatchdog`, and client
      `serverInfo` identity polling.
- [x] 2.8 Specify D10 ownership for live-game event publication and browser
      live-game cadence deletion.

## 3. Packet Proof Strategy

- [x] 3.1 Define publisher path falsification tests for both operation stores.
- [x] 3.1a Define production-composition proof that daemon engine construction
      supplies EventHub.
- [x] 3.2 Define operation event payload parity tests against canonical DTOs.
- [x] 3.3 Define client pushed Run in Game state test.
- [x] 3.4 Define client pushed Save&Deploy state test.
- [x] 3.5 Define terminal toast parity test.
- [x] 3.6 Define negative searches for deleted polling/watchdog symbols.
- [x] 3.7 Define negative searches for alternate operation event route/bus,
      browser event recovery, and app-local operation DTO mirrors.
- [x] 3.8 Define D10 protected live-game boundary checks.

## 3A. Future Implementation Closure Gates

These are D9 implementation obligations recorded by this packet, not
pre-acceptance authoring tasks.

- [ ] 3A.1 Implement or preserve Run in Game transition publication through the
      D8 `StudioEventHub`.
- [ ] 3A.2 Implement or preserve Save&Deploy transition publication through the
      D8 `StudioEventHub`.
- [ ] 3A.3 Prove publisher path falsification for both operation families.
- [ ] 3A.3a Prove production daemon composition supplies EventHub and no
      no-publisher production path exists.
- [ ] 3A.4 Prove pushed Run in Game events update client state.
- [ ] 3A.5 Prove pushed Save&Deploy events update client state.
- [ ] 3A.6 Prove terminal toast parity for adopted terminal vs live pushed
      terminal Run in Game operations.
- [ ] 3A.7 Delete operation polling/watchdog symbols and prove with negative
      searches.
- [ ] 3A.8 Prove no hidden Save&Deploy sleep/status completion loop remains.
- [ ] 3A.9 Prove D10 live-game polling/timer behavior is untouched by D9.

## 4. Verification

- [x] 4.1 `bun run openspec -- validate mapgen-studio-operations-push --strict`.
- [x] 4.2 `bun run openspec:validate`.
- [x] 4.3 `git diff --check`.
- [x] 4.4 Shortcut/black-ice scan.
- [x] 4.5 `git status --short --branch`, `gt status`, and
      `gt log --no-interactive`.

## 5. Closure

- [x] 5.1 Record review acceptance in `review-disposition-ledger.md`.
- [x] 5.2 Mark D9 accepted in `OPENSPEC-PACKET-TRAIN.md`.
- [ ] 5.3 Commit accepted D9 packet through Graphite with clean/quarantined
      worktree state.

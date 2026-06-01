# Review Disposition Ledger

## Findings

### Direct-Control Lifecycle

- Shell `Game is not defined` health failure: resolved. App UI snapshots now
  guard gameplay globals through `globalThis` probes and shell classifies as
  `shell` instead of breaking health.
- Tuner listed but not gameplay-ready: resolved for the critical readiness
  gate. `getCiv7PlayableStatus` no longer reports playable unless the Tuner
  canary succeeds; fake-socket coverage asserts listed-but-unready Tuner does
  not count as playable.
- Begin mutation replay: resolved for the setup/start path. Begin attempts are
  recorded, begin errors are surfaced, and the fake-socket close-on-begin test
  asserts `UI.notifyUIReady()` is sent once.
- Stale-listener vocabulary: partially addressed. Ambiguous socket failures
  during start/proof classify the Studio operation as `uncertain`; a dedicated
  `stale-listener` readiness literal and live LSQ failure proof were not added
  in this slice.

### Studio And Vite Robustness

- One long browser POST: resolved. `POST /api/civ7/run-in-game` returns `202`
  with request-id operation state, and the long launch runs in the server queue.
- Lost status after tab reload/fetch abort: resolved for same dev-server
  lifetime. The client stores the request id, resumes from the status endpoint
  on mount, and browser proof confirmed a completed operation survives reload.
- Dev-server identity: resolved for the local recovery surface. Studio exposes
  `/api/studio/server-info` with server instance, start time, and API version.
- Vite refresh from generated artifacts: addressed with server-side operation
  state plus watcher ignores for generated mod outputs touched by Run in Game.
  Browser proof showed the tab preserved and resumed operation status.
- Active-operation de-dupe: resolved for same-server operation state. The Vite
  middleware returns the active operation with HTTP `202` and
  `duplicateRequest: true` instead of queueing a second mutation.

### UX Recovery Surface

- Phase visibility: resolved. The footer now renders phase labels such as
  `Materializing`, `Waiting for Proof`, `Complete`, `Failed`, `Blocked`, and
  `Uncertain`.
- Diagnostics: resolved. Failed or active operations expose request id, phase,
  materialization, direct-control code, completed phases, and copyable
  diagnostics.
- Recovery actions: partially resolved. The UI exposes retry status, retry run,
  and copy diagnostics. Separate one-click recovery actions such as "reload
  Civ7 UI" or "exit to main menu and continue" were not added because the live
  shell/menu path completed without requiring them.

### Verification Review

- OpenSpec truthfulness: resolved. This robustness change validates strictly,
  and proof/test gaps are recorded here and in `proof-ledger.md` rather than
  reused from stale prior evidence.
- Root verification: resolved. `bun run verify:studio-run-in-game` passes.
- Browser/live proof: resolved for the shell/menu disposable click path,
  current/stale operation-state rendering, and same-server reload resume;
  bounded for stale listener, durable launch, and injected connection-loss live
  recovery.

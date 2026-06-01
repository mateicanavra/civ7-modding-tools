## 1. State Reframe

- [x] 1.1 Preserve unrelated Swooper Earthlike config edits in a separate
  Graphite slice.
- [x] 1.2 Define Studio operation-state reliability as a follow-up change rather
  than overclaiming the first robustness slice.
- [x] 1.3 Record authored/preview/runtime/operation state boundaries.

## 2. Implementation

- [x] 2.1 Stop Save/Deploy from implicitly restarting Civ.
- [x] 2.2 Track Run in Game current-vs-stale authored Studio state.
- [x] 2.3 Persist the client operation snapshot across tab reload while the Vite
  server remains alive.
- [x] 2.4 Prevent duplicate active Run in Game mutations from being queued.
- [x] 2.5 Extract operation-state and request-validation helpers for focused
  tests.

## 3. Verification

- [x] 3.1 Add tests for request validation and raw command rejection.
- [x] 3.2 Add tests for operation phase tracking, duplicate active operation,
  blocked/uncertain failure classes, recovery actions, and TTL pruning.
- [x] 3.3 Add tests for current/stale/unknown client snapshot relation.
- [x] 3.4 Add footer tests for stale operation status.
- [x] 3.5 Run full Studio/Turbo/OpenSpec verification after implementation.
- [x] 3.6 Run browser/live proof where Civ and the dev server are available.

## 4. Closure

- [x] 4.1 Update the prior robustness closure artifacts so remaining bounds are
  accurate.
- [x] 4.2 Commit the completion slice and leave the Graphite stack clean.

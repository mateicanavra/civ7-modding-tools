## 1. Live Runtime Completion

- [x] 1.1 Inspect the current `studio-live-civ7-map-sync` implementation and
  record exact remaining code/doc deltas in the workstream record.
- [x] 1.2 Add turn/hash snapshot keying to the Studio live runtime model.
- [x] 1.3 Add bounded request cancellation and backoff for stale, superseded, or
  failed snapshot reads.
- [x] 1.4 Record runtime-to-config translation disposition; exposed translation
  paths must emit explicit suggestion records through the visible config edit
  path.

## 2. Verification

- [x] 2.1 Add focused Studio tests for snapshot keying, stale-state rejection,
  and cancellation/backoff behavior.
- [x] 2.2 Run focused Studio check/test gates.
- [x] 2.3 Update the downstream `studio-live-civ7-map-sync` task/workstream
  state with repaired evidence.
- [x] 2.4 Run `bun run openspec -- validate studio-live-runtime-snapshot-completion --strict`.
- [x] 2.5 Run `bun run openspec:validate`.

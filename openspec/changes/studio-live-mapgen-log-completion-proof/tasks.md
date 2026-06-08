## 1. Runtime Proof

- [x] 1.1 Restore fresh Scripting.log snapshotting before live launch.
- [x] 1.2 Wait for fresh `[mapgen-complete]` evidence tied to the requested
  seed.
  - Current repair emits `[mapgen-complete]` from SDK `createMap` after a
    successful recipe run; previous recovered state only emitted
    `[mapgen-proof]`, causing Studio to time out in `waiting-for-proof`.
- [x] 1.3 Reject fresh failure markers during verification.
- [x] 1.4 Include mapgen log proof in the verifier output.
- [x] 1.5 Treat a Civ-rewritten `Scripting.log` as fresh from byte `0` when
  the current log no longer matches the pre-run prefix, even if the rewritten
  file grows beyond the old byte offset.

## 2. Verification

- [x] 2.1 Run the verifier help/smoke path.
- [x] 2.2 Run focused direct-control tests.
- [x] 2.3 Run focused SDK mapgen marker test and SDK typecheck.
- [x] 2.4 Run focused Studio run-in-game tests and Studio typecheck after the
  direct-control log reader repair.
- [x] 2.5 Run the Studio production build; keep the worker-bundle guard focused
  on actual virtual `/base-standard/...` imports rather than official
  `Base/modules/base-standard/...` source-path metadata.

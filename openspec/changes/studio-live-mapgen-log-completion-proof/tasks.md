## 1. Runtime Proof

- [x] 1.1 Restore fresh Scripting.log snapshotting before live launch.
- [x] 1.2 Wait for fresh `[mapgen-complete]` evidence tied to the requested
  seed.
  - Current repair emits `[mapgen-complete]` from SDK `createMap` after a
    successful recipe run; previous recovered state only emitted
    `[mapgen-proof]`, causing Studio to time out in `waiting-for-proof`.
- [x] 1.3 Reject fresh failure markers during verification.
- [x] 1.4 Include mapgen log proof in the verifier output.

## 2. Verification

- [x] 2.1 Run the verifier help/smoke path.
- [x] 2.2 Run focused direct-control tests.
- [x] 2.3 Run focused SDK mapgen marker test and SDK typecheck.

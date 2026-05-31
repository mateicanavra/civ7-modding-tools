## 1. Package Setup Surface

- [x] 1.1 Add setup result/input/error types and map-row proof types.
- [x] 1.2 Implement App UI setup snapshot and bounded map row lookup wrappers.
- [x] 1.3 Implement approved setup preparation with domain validation,
  revision/readback proof, and no retry after command send.
- [x] 1.4 Implement approved start/orchestration wrapper with expected setup
  validation, Begin/GameStarted wait, optional Tuner wait, and post-start
  seed/dimensions proof.
- [x] 1.5 Add setup wrappers to the static capability catalog.

## 2. Tests

- [x] 2.1 Add fake socket tests for setup snapshot and map row lookup.
- [x] 2.2 Add fake socket tests for setup mutation command construction and
  readback.
- [x] 2.3 Add no-replay tests for socket close after setup send.
- [x] 2.4 Add seed mismatch tests.

## 3. Verification

- [x] 3.1 Run `bun run --cwd packages/civ7-direct-control test`.
- [x] 3.2 Run `bun run --cwd packages/civ7-direct-control check`.
- [x] 3.3 Run `bun run --cwd packages/civ7-direct-control build`.
- [x] 3.4 Record live proof or explicit LSQ blocker in the workstream ledger.

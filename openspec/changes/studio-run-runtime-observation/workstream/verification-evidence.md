# Verification Evidence

Packet 12 remains open. This ledger records the committed sub-slice that
introduces the private runtime-observation boundary and production public `/rpc`
readback path.

| Gate | Evidence | Result | Proof Class | Notes |
| --- | --- | --- | --- | --- |
| Studio contract typecheck | `bun nx run studio-contract:check` | Passed | Typecheck | Added typed `civ7.live.status` and `civ7.live.snapshot` output aliases. |
| Server typecheck | `bun nx run control-studio-server:check` | Passed | Typecheck | Runtime observation port, workflow transition, private operation model, and proof-builder changes compile. |
| App typecheck | `bun nx run mapgen-studio:check` | Passed | Typecheck | Production observer compiles with typed oRPC endpoint outputs and abortable calls. |
| Server behavior tests | `bun nx run control-studio-server:test` | Passed, 8 files / 122 tests | Unit/integration tests | Workflow fakes updated for the private observation record. |
| App behavior tests | `bun nx run mapgen-studio:test` | Passed, 68 files / 384 tests | Unit/integration tests | One-mount/server tests updated for the observation port. |
| Whitespace/diff sanity | `git diff --check` | Passed | Static guard | No whitespace errors in the slice. |
| TypeScript refactoring review | Reviewer lane Aquinas | Cleared P1/P2 | Peer review | Blockers repaired: successful observation records no longer encode false marker states, live endpoint payloads are typed, and embedded `{ error }` checks are reachable. Remaining P3s are non-blocking export/test-helper cleanup. |
| Code quality/structure review | Reviewer lane Aquinas the 2nd | Cleared P1/P2 | Peer review | Private runtime observation is retained on the internal complete operation; public projection stays unchanged. No Habitat `structure.toml` change is warranted for this sub-slice. |
| oRPC/Effect/library correctness review | Reviewer lane Tesla the 2nd | Cleared P1/P2/P3 | Peer review | Production readback uses public `/rpc` via `RPCLink`, not direct-control or an in-process router shortcut; `AbortSignal` is passed to endpoint calls. |

## Sub-Slice Coverage

Implemented and locally verified:

- private `RunInGameRuntimeObservation` records for scripting log, setup row,
  loaded-game readback, deployment evidence, and correlation;
- `observeRunInGameRuntime` workflow port between fresh log proof and final proof;
- production observer using the running daemon's public `/rpc` mount for
  `civ7.live.status` and `civ7.live.snapshot`;
- requested map-size dimensions resolved from Civ7 map-size presets, matched
  against the generated runtime marker and live snapshot dimensions;
- loaded-game oracle rejects embedded `status`, `appUi`, and `mapSummary` errors
  and requires App UI `inGame` proof;
- successful private observation is retained on the internal operation for
  diagnostics lookup while public status projection remains safe.

Still open for Packet 12 closure:

- targeted behavior tests for stale-log exclusion, setup-row missing/mismatch,
  marker missing/mismatch, partial status/snapshot failures, and shape-only
  evidence rejection;
- SA-12 Pattern Authority registration;
- OpenSpec strict validation after the full packet slice;
- Habitat classify-reported packet checks;
- live Studio endpoint plus Civ7-controlled runtime observation gate.

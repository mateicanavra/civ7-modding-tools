# Studio Run Explicit Cancellation

## Why

Run in Game is a mutating long-running operation. HTTP aborts and browser
disconnects must not imply cancellation, and cancellation must not be hidden in
recovery branches. Users and tools need one explicit cancellation command with
deterministic terminal behavior.

## System Context

Affected owners:

- Run in Game oRPC/API contract
- operation runtime worker lifecycle
- operation registry records from Packet 2
- public status projection from Packet 1

This packet consumes the runtime ownership lease introduced by the operation
registry packet. Cancellation releases that lease after cleanup and diagnostics
finalization.

## Before And After

Before:

- browser abort and cancellation semantics are ambiguous;
- repeated cancellation and terminal-operation cancellation are not a closed
  contract.

After:

- `runInGame.cancel({ requestId })` is the only cancellation surface;
- HTTP abort does not cancel;
- cancellation is idempotent for an active matching request;
- terminal operations are not mutated;
- cancellation interrupts the worker, runs cleanup, records diagnostics, emits
  exactly one terminal event, and projects status `cancelled` with category
  `operation-cancelled`.

## Behavior Verification

Tests verify cancellation state transitions, idempotency, no mutation of
terminal records, worker interruption, terminal event count, and HTTP abort not
cancelling.

## Structural Enforcement

Permanent positive assertion:

- Run in Game has exactly one public cancellation command and no implicit
  cancellation owner in browser fetch abort handling.

Structural authority row: SA-03 `grit-studio-run-cancel-command-owner`.
Worker interruption, lease release, and event behavior are behavior tests.

## Verification Gates

- API contract tests for cancel input/output.
- Runtime behavior tests for idempotency and terminalization.
- Live Studio endpoint evidence for active, repeated, terminal, and unknown
  cancellation requests.
- UI cancel-affordance behavior gate: run focused UI behavior tests when the
  cancel affordance changes, or record source-diff evidence that this packet did
  not change any UI cancellation surface.
- SA-03 `grit-studio-run-cancel-command-owner`.
- No declared verification gate is skipped; packet closure records evidence in
  `workstream/verification-evidence.md`.
- `bun run openspec -- validate studio-run-explicit-cancellation --strict`.

# Studio Run Operation Registry Identity

## Why

Run in Game operation admission currently conflates authored-content digests with
operation identity. That is the root of repeated-seed/request-expired failures:
a fresh click with the same authored content can be treated as the old
operation. Runtime identity must be simpler: request id is operation identity;
content digests are correlation data.

This packet also makes Run in Game single-flight and makes ownership loss
durable enough to be honest after daemon restart.

## System Context

Affected owners:

- `packages/studio-server/src/operationRuntime/registry.ts`
- `packages/studio-server/src/operationRuntime/model.ts`
- `packages/studio-server/src/operationRuntime/StudioOperationRuntime.ts`
- status/current/event projection code from Packet 1

This packet introduces the admission-time runtime lease and durable ownership
reconciliation. Deployment copy/snapshot behavior is attached to the already
held lease by `studio-run-deployment-snapshot-lease`.

## Before And After

Before:

- duplicate admission can use a content fingerprint;
- expired tombstones can block a fresh launch with identical authored content;
- operation ownership is mostly in-memory.

After:

- `requestId` is the only operation identity and admission key;
- content digests are named correlation or attribution fields only;
- expired request ids are lookup facts for that request id only;
- `RuntimeOwnershipLease` is acquired at operation admission and held through
  terminal cleanup/diagnostics finalization;
- a second Run in Game request or Save/Deploy deployed-mod write while the lease
  is held returns public category `ownership`;
- a minimal durable `RunOperationRecord` records request id, daemon id, phase,
  status, diagnostics id, lease id, timestamps, and terminal outcome;
- daemon startup terminalizes non-terminal records owned by another daemon as
  public category `ownership`.

## Behavior Verification

Tests verify that identical authored content can start a new operation with a
new request id after the prior operation terminalizes, expired records do not
block fresh launches, active Run in Game is single-flight, Save/Deploy
deployed-mod writes conflict while the lease is held, status lookup by old
request id returns the old terminal/expired answer, and daemon startup
terminalizes abandoned records.

## Structural Enforcement

Permanent positive assertions:

- operation registry admission indexes by request id only;
- content digests are stored under correlation/attribution concepts and are not
  admission keys;
- `RunOperationRecord` is the durable operation ledger owner for restart
  reconciliation;
- `RuntimeOwnershipLease` is the single active ownership slot for Run in Game
  and Save/Deploy deployed-mod writes.

Structural authority row: SA-02
`grit-studio-run-operation-identity-owner`.

## Verification Gates

- Focused registry behavior tests.
- Focused daemon-startup reconciliation tests.
- Live Studio endpoint evidence for request-id operation admission,
  same-content repeat admission after terminalization, and active ownership
  conflict projection.
- SA-02 `grit-studio-run-operation-identity-owner`.
- No declared verification gate is skipped; packet closure records evidence in
  `workstream/verification-evidence.md`.
- `bun run openspec -- validate studio-run-operation-registry-identity --strict`.

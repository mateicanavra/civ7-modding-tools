# Design

## Identity

`requestId` is operation identity. The registry admits or rejects an operation
by request id only. `LaunchSourceDigest`, `LaunchEnvelopeDigest`, and later
generation/deployment digests are correlation and attribution data.

## Durable Record

`RunOperationRecord` stores:

- request id;
- daemon id;
- lease id;
- current public phase and status;
- diagnostics id;
- created, updated, and terminal timestamps;
- terminal outcome when terminalized.

Operation registry TTL governs active/recent lookup only. Workspace and
diagnostics retention is owned by the later retention packet.

## Restart Reconciliation

On daemon startup, the runtime scans non-terminal records. Records owned by a
different daemon are terminalized as failed with category `ownership` and a
private diagnostic note. Any stale durable lease slot owned by those abandoned
records is released during terminalization. The server does not ask the client
to infer ownership loss from an empty current-operation response.

## Runtime Ownership Lease

Run in Game is single-flight. Admission acquires `RuntimeOwnershipLease`; if a
lease already exists, admission returns public category `ownership`. The lease
covers shared Civ7 resources: deployed mod writes, Civ7 setup/start control,
setup workflow, and scripting-log observation window.

Save/Deploy keeps its durable catalog semantics, but any deployed-mod write it
performs must acquire the same lease. A Save/Deploy deployed-mod write attempted
while Run in Game holds the lease returns the same public ownership category.

The lease is released only after terminal cleanup and diagnostics finalization.

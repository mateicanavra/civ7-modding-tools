## ADDED Requirements

### Requirement: Studio Exposes Runtime-Owned Current Operations

MapGen Studio SHALL expose `studio.operations.current` as a TypeBox-backed oRPC procedure that reports D4 `StudioOperationRuntime` operation truth for retained Studio operations.

#### Scenario: Fresh daemon reports no current operations

- **WHEN** a newly started daemon has accepted no retained Studio operation
- **THEN** `studio.operations.current` returns the daemon `serverInstanceId`, `serverStartedAt`, and `observedAt`
- **AND** Run in Game reports `active: null` and `recent: []`
- **AND** Save/Deploy reports `active: null` and `recent: []`
- **AND** the response does not ask the browser to replay request ids from localStorage

#### Scenario: Active operations are visible through current

- **WHEN** Run in Game or Save/Deploy is active in `StudioOperationRuntime`
- **THEN** `studio.operations.current` returns the matching public operation projection in that registry's `active` field
- **AND** the same operation does not appear in that registry's terminal-only `recent` list
- **AND** the projection is derived from D2.5 TypeBox and D3/D4 public ADTs, not app-private store state

#### Scenario: Recent terminal operations remain visible until TTL pruning

- **WHEN** an operation reaches a terminal state and remains inside the D4 retained-operation TTL window
- **THEN** `studio.operations.current` includes it in the matching `recent` list
- **AND** it is not reported as `active`

#### Scenario: Expired known operations return typed expiry

- **WHEN** an operation has left the D4 retained-operation TTL window but D4 still knows its expiry tombstone
- **THEN** `studio.operations.current` no longer reports that operation
- **AND** a status lookup by the old operation id returns D3 `OperationExpired` data with the current daemon identity

#### Scenario: Physically pruned and never-known operations return typed not-found

- **WHEN** an operation id has been physically pruned from D4 or was never known by the current daemon
- **THEN** `studio.operations.current` does not report that operation
- **AND** a status lookup by that id returns D3 typed not-found data with the current daemon identity

#### Scenario: Daemon-identity mismatches are explicit

- **WHEN** a status lookup uses an operation id from another daemon identity
- **THEN** `studio.operations.current` remains scoped to the current daemon
- **AND** the status lookup returns D3 `DaemonIdentityMismatch` data with the current daemon identity

### Requirement: Client Boot Adoption Reads Daemon Truth

MapGen Studio SHALL adopt retained operation state on boot from `studio.operations.current` instead of browser-persisted operation recovery.

#### Scenario: Boot adopts daemon-retained operations

- **GIVEN** the daemon reports a retained Run in Game or Save/Deploy operation
- **WHEN** the Studio shell mounts
- **THEN** the client seeds displayed operation state from `studio.operations.current`
- **AND** retained terminal operations seed only recent/current terminal display and do not restart work
- **AND** existing status polling continues only for active operations until D8/D9 event-push slices delete polling

#### Scenario: Browser operation recovery bridge is deleted

- **WHEN** the Studio shell mounts
- **THEN** it does not read Run in Game or Save/Deploy request ids from localStorage
- **AND** it does not persist operation request ids or source snapshots to localStorage for recovery
- **AND** production recovery code does not retain `runInGameRequestId`, `saveDeployRequestId`, `runInGameSnapshot`, `lastRunInGameSource`, `setRunInGameSnapshot`, `setLastRunInGameSource`, `sourceSnapshotStorage`, or `readStoredRunInGameSourceSnapshot` as cross-reload operation recovery surfaces
- **AND** any retained `parseRunInGameClientSnapshot` or `parseRunInGameSourceSnapshot` helper is pure relation/proof logic with no storage read/write path
- **AND** it does not synthesize an uncertain operation from browser-only persisted request ids
- **AND** unrelated localStorage owners such as authoring, view, theme, presets, and non-operation UI preferences are unchanged

### Requirement: Operations Current Has TypeBox And Failure Discipline

MapGen Studio SHALL keep the `operations.current` public contract schema-derived and aligned with D3 expected failure semantics.

#### Scenario: Operations current uses TypeBox public DTOs

- **WHEN** the `operations.current` request and response schemas are defined
- **THEN** they originate in TypeBox and use the repo Standard Schema adapter with recoverable `TSchema` origin
- **AND** operation projections reuse canonical public operation DTO schemas instead of wider local duplicates
- **AND** static public TypeScript types are no broader than runtime validation
- **AND** no new Zod schema is introduced for operation-current request, response, or expected error data

#### Scenario: Operations current exposes public operation data only

- **WHEN** `operations.current` projects operation state
- **THEN** it includes public operation identity, kind, lifecycle status, phase, timestamps, failure/recovery/proof summaries, and daemon identity
- **AND** it excludes registry internals, callback references, request fingerprint internals, raw control fields, app-private store state, and public `details?: unknown` expected-failure truth

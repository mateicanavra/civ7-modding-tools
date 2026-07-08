---
level: error
---
# Grit Studio Run Operation Identity Owner

Packet 2 makes `requestId` the only Run in Game operation identity. Content
digests remain correlation data. The operation runtime owns a durable
`RunOperationRecord` for restart reconciliation and one `RuntimeOwnershipLease`
slot for Run in Game plus Save/Deploy deployed-mod ownership.

```grit
language js(typescript)

or {
  program(statements=$modelSlotBody) where {
    $filename <: r".*packages/studio-server/src/operationRuntime/model\.ts$",
    ! $modelSlotBody <: contains `RuntimeActiveSlot`
  },
  program(statements=$modelSlotShapeBody) where {
    $filename <: r".*packages/studio-server/src/operationRuntime/model\.ts$",
    ! $modelSlotShapeBody <: contains `export type RuntimeActiveSlot = Readonly<{
  $...
  requestId: string;
  leaseId: string;
  $...
}>`
  },
  program(statements=$modelOperationBody) where {
    $filename <: r".*packages/studio-server/src/operationRuntime/model\.ts$",
    ! $modelOperationBody <: contains `RunInGameInternalOperation`
  },
  program(statements=$modelOperationShapeBody) where {
    $filename <: r".*packages/studio-server/src/operationRuntime/model\.ts$",
    ! $modelOperationShapeBody <: contains `export type RunInGameInternalOperation = Readonly<{
  $...
  requestId: string;
  leaseId: string;
  correlationDigest: string;
  $...
}>`
  },
  program(statements=$modelCorrelationBody) where {
    $filename <: r".*packages/studio-server/src/operationRuntime/model\.ts$",
    ! $modelCorrelationBody <: contains `correlationDigest: string`
  },
  program(statements=$recordsLeaseBody) where {
    $filename <: r".*packages/studio-server/src/operationRuntime/operationRecords\.ts$",
    ! $recordsLeaseBody <: contains `RuntimeOwnershipLease`
  },
  program(statements=$recordsLeaseShapeBody) where {
    $filename <: r".*packages/studio-server/src/operationRuntime/operationRecords\.ts$",
    ! $recordsLeaseShapeBody <: contains `export type RuntimeOwnershipLease = Readonly<{
  $...
  leaseId: string;
  ownerKind: $ownerKind;
  requestId: string;
  daemonId: string;
  daemonStartedAt: string;
  processId: number;
  acquiredAt: string;
  updatedAt: string;
  $...
}>`
  },
  program(statements=$recordsRecordBody) where {
    $filename <: r".*packages/studio-server/src/operationRuntime/operationRecords\.ts$",
    ! $recordsRecordBody <: contains `RunOperationRecord`
  },
  program(statements=$recordsRecordBaseShapeBody) where {
    $filename <: r".*packages/studio-server/src/operationRuntime/operationRecords\.ts$",
    ! $recordsRecordBaseShapeBody <: contains `type RunOperationRecordBase = Readonly<{
  $...
  recordType: "RunOperationRecord";
  requestId: string;
  daemonId: string;
  daemonStartedAt: string;
  leaseId: string;
  phase: RunInGameInternalOperation["phase"];
  operationRevision: number;
  diagnosticsId?: string;
  createdAt: string;
  updatedAt: string;
  $...
}>`
  },
  program(statements=$recordsRunningShapeBody) where {
    $filename <: r".*packages/studio-server/src/operationRuntime/operationRecords\.ts$",
    ! $recordsRunningShapeBody <: contains `type RunningRunOperationRecord = RunOperationRecordBase &
  Readonly<{
    status: "running";
    terminalAt?: never;
    terminalOutcome?: never;
  }>`
  },
  program(statements=$recordsTerminalShapeBody) where {
    $filename <: r".*packages/studio-server/src/operationRuntime/operationRecords\.ts$",
    ! $recordsTerminalShapeBody <: contains `type TerminalRunOperationRecord = RunOperationRecordBase &
  Readonly<{
    status: Exclude<RunInGameInternalOperation["status"], "running">;
    terminalAt: string;
    terminalOutcome: Exclude<RunInGameInternalOperation["status"], "running">;
  }>`
  },
  program(statements=$recordsAcquireBody) where {
    $filename <: r".*packages/studio-server/src/operationRuntime/operationRecords\.ts$",
    ! $recordsAcquireBody <: contains `acquireRuntimeOwnershipLease`
  },
  program(statements=$recordsAcquireLockBody) where {
    $filename <: r".*packages/studio-server/src/operationRuntime/operationRecords\.ts$",
    ! $recordsAcquireLockBody <: contains `export function acquireRuntimeOwnershipLease($args): $returnType {
  $...
  return Effect.tryPromise({
    try: async () => {
      $...
      return await withRuntimeLeaseLock(root, async () => {
        $...
        await writeJsonFileIfAbsent(path, lease);
        return lease;
      });
    },
    $...
  });
}`
  },
  program(statements=$recordsReleaseLockBody) where {
    $filename <: r".*packages/studio-server/src/operationRuntime/operationRecords\.ts$",
    ! $recordsReleaseLockBody <: contains `export function releaseRuntimeOwnershipLease($args): $returnType {
  $...
  return Effect.tryPromise({
    try: async () => {
      $...
      await withRuntimeLeaseLock(root, async () => {
        $...
        await rm(path, { force: true });
      });
    },
    $...
  }).pipe($...);
}`
  },
  program(statements=$recordsStaleReleaseLockBody) where {
    $filename <: r".*packages/studio-server/src/operationRuntime/operationRecords\.ts$",
    ! $recordsStaleReleaseLockBody <: contains `export function releaseStaleRuntimeOwnershipLease($args): $returnType {
  $...
  return Effect.tryPromise({
    try: async () => {
      $...
      return await withRuntimeLeaseLock(root, async () => {
        $...
        await rm(path, { force: true });
        return lease;
      });
    },
    $...
  }).pipe($...);
}`
  },
  program(statements=$recordsWriteBody) where {
    $filename <: r".*packages/studio-server/src/operationRuntime/operationRecords\.ts$",
    ! $recordsWriteBody <: contains `writeRunOperationRecord`
  },
  program(statements=$recordsAbandonedBody) where {
    $filename <: r".*packages/studio-server/src/operationRuntime/operationRecords\.ts$",
    ! $recordsAbandonedBody <: contains `readAbandonedRunOperationRecords`
  },
  program(statements=$recordsAdoptBody) where {
    $filename <: r".*packages/studio-server/src/operationRuntime/operationRecords\.ts$",
    ! $recordsAdoptBody <: contains `operationFromAbandonedRecord`
  },
  `"ambiguous-live-pid"` as $match where {
    $filename <: r".*packages/studio-server/src/operationRuntime/operationRecords\.ts$"
  },
  program(statements=$registryKnownBody) where {
    $filename <: r".*packages/studio-server/src/operationRuntime/registry\.ts$",
    ! $registryKnownBody <: contains `const known = state.runInGame[args.requestId]`
  },
  program(statements=$registryTombstoneBody) where {
    $filename <: r".*packages/studio-server/src/operationRuntime/registry\.ts$",
    ! $registryTombstoneBody <: contains `const tombstone = state.tombstones[args.requestId]`
  },
  program(statements=$runtimeLeaseBody) where {
    $filename <: r".*packages/studio-server/src/operationRuntime/StudioOperationRuntime\.ts$",
    ! $runtimeLeaseBody <: contains `acquireRuntimeOwnershipLease`
  },
  program(statements=$runtimeAbandonedBody) where {
    $filename <: r".*packages/studio-server/src/operationRuntime/StudioOperationRuntime\.ts$",
    ! $runtimeAbandonedBody <: contains `readAbandonedRunOperationRecords`
  },
  program(statements=$runtimeRecordBody) where {
    $filename <: r".*packages/studio-server/src/operationRuntime/StudioOperationRuntime\.ts$",
    ! $runtimeRecordBody <: contains `writeRunOperationRecord`
  },
  `fingerprint?: string` where {
    $filename <: r".*packages/studio-server/src/operationRuntime/model\.ts$"
  },
  `fingerprint: string` where {
    $filename <: r".*packages/studio-server/src/operationRuntime/model\.ts$"
  },
  `operation.fingerprint === args.prepared.fingerprint` as $match where {
    $filename <: r".*packages/studio-server/src/operationRuntime/registry\.ts$",
    $match <: within `export function admitRunInGame($args) { $body }`
  },
  `tombstone.fingerprint === args.prepared.fingerprint` as $match where {
    $filename <: r".*packages/studio-server/src/operationRuntime/registry\.ts$",
    $match <: within `export function admitRunInGame($args) { $body }`
  },
  `operation.correlationDigest === args.prepared.correlationDigest` as $match where {
    $filename <: r".*packages/studio-server/src/operationRuntime/registry\.ts$",
    $match <: within `export function admitRunInGame($args) { $body }`
  },
  `tombstone.correlationDigest === args.prepared.correlationDigest` as $match where {
    $filename <: r".*packages/studio-server/src/operationRuntime/registry\.ts$",
    $match <: within `export function admitRunInGame($args) { $body }`
  },
  `Object.values(state.runInGame).find($predicate)` as $match where {
    $filename <: r".*packages/studio-server/src/operationRuntime/registry\.ts$",
    $match <: within `export function admitRunInGame($args) { $body }`
  },
  `Object.values(state.runInGame).some($predicate)` as $match where {
    $filename <: r".*packages/studio-server/src/operationRuntime/registry\.ts$",
    $match <: within `export function admitRunInGame($args) { $body }`
  },
  `Object.values(state.tombstones).find($predicate)` as $match where {
    $filename <: r".*packages/studio-server/src/operationRuntime/registry\.ts$",
    $match <: within `export function admitRunInGame($args) { $body }`
  },
  `Object.values(state.tombstones).some($predicate)` as $match where {
    $filename <: r".*packages/studio-server/src/operationRuntime/registry\.ts$",
    $match <: within `export function admitRunInGame($args) { $body }`
  }
}
```

## Matches Fixture

```typescript
// @filename: packages/studio-server/src/operationRuntime/registry.ts
export function admitRunInGame(args) {
  const duplicate = Object.values(state.runInGame).find(
    (operation) => operation.fingerprint === args.prepared.fingerprint
  );
  const expired = Object.values(state.tombstones).find(
    (tombstone) => tombstone.fingerprint === args.prepared.fingerprint
  );
}

// @filename: packages/studio-server/src/operationRuntime/model.ts
export type RuntimeTombstone = Readonly<{ requestId: string; fingerprint?: string }>;
export type RunInGameInternalOperation = Readonly<{ requestId: string; fingerprint: string }>;

// @filename: packages/studio-server/src/operationRuntime/operationRecords.ts
export function acquireRuntimeOwnershipLease(args): Effect.Effect<RuntimeOwnershipLease, Failure> {
  return Effect.tryPromise({
    try: async () => {
      const lease = {};
      await writeJsonFileIfAbsent(path, lease);
      return lease;
    },
    catch: (err) => err,
  });
}
type LeaseOwnerState = "dead" | "live" | "ambiguous-live-pid";
async function withRuntimeLeaseLock() {}
function leaseOwnerState(root: string, lease: RuntimeOwnershipLease): LeaseOwnerState {
  return heartbeatMatchesLease(root, lease) ? "live" : "ambiguous-live-pid";
}
export function acquireRuntimeDaemonHeartbeat() {}

// @filename: packages/studio-server/src/operationRuntime/StudioOperationRuntime.ts
function makeStudioOperationRuntime() {
  releaseStaleRuntimeOwnershipLease();
  const abandonedRecords = readAbandonedRunOperationRecords({});
}
```

## Ignores Fixture

```typescript
// @filename: packages/studio-server/src/operationRuntime/registry.ts
export function admitRunInGame(args) {
  const known = state.runInGame[args.requestId];
  const tombstone = state.tombstones[args.requestId];
}

// @filename: packages/studio-server/src/operationRuntime/model.ts
export type RuntimeActiveSlot = Readonly<{ requestId: string; leaseId: string }>;
export type RunInGameInternalOperation = Readonly<{
  requestId: string;
  leaseId: string;
  correlationDigest: string;
}>;

// @filename: packages/studio-server/src/operationRuntime/operationRecords.ts
export type RuntimeOwnershipLease = Readonly<{
  leaseId: string;
  ownerKind: "run-in-game" | "save-deploy";
  requestId: string;
  daemonId: string;
  daemonStartedAt: string;
  processId: number;
  acquiredAt: string;
  updatedAt: string;
}>;
type RunOperationRecordBase = Readonly<{
  recordType: "RunOperationRecord";
  requestId: string;
  daemonId: string;
  daemonStartedAt: string;
  leaseId: string;
  phase: RunInGameInternalOperation["phase"];
  operationRevision: number;
  diagnosticsId?: string;
}>;
type RunningRunOperationRecord = RunOperationRecordBase &
  Readonly<{
    status: "running";
    terminalAt?: never;
    terminalOutcome?: never;
  }>;
type TerminalRunOperationRecord = RunOperationRecordBase &
  Readonly<{
    status: Exclude<RunInGameInternalOperation["status"], "running">;
    terminalAt: string;
    terminalOutcome: Exclude<RunInGameInternalOperation["status"], "running">;
  }>;
export type RunOperationRecord = RunningRunOperationRecord | TerminalRunOperationRecord;
export function acquireRuntimeOwnershipLease() {}
type LeaseOwnerState = "dead" | "live";
async function withRuntimeLeaseLock() {}
type RuntimeLeaseLockOwner = Readonly<{
  token: string;
  processId: number;
  acquiredAt: string;
}>;
async function acquireRuntimeLeaseLock() {
  await writeJsonFile(runtimeLeaseLockOwnerPath(lockPath), owner);
}
async function releaseRuntimeLeaseLock(lockPath: string, token: string): Promise<void> {
  const owner = {};
  if (owner?.token === token) {
    await rm(lockPath, { recursive: true, force: true });
  }
}
async function removeStaleRuntimeLeaseLock(lockPath: string): Promise<void> {
  if (owner && processIsLive(owner.processId)) return;
  await rename(lockPath, stalePath).catch(() => undefined);
  await rm(stalePath, { recursive: true, force: true });
}
export function acquireRuntimeOwnershipLease(args): Effect.Effect<RuntimeOwnershipLease, Failure> {
  return Effect.tryPromise({
    try: async () => {
      return await withRuntimeLeaseLock(root, async () => {
        const lease = {};
        await writeJsonFileIfAbsent(path, lease);
        return lease;
      });
    },
    catch: (err) => err,
  });
}
export function releaseRuntimeOwnershipLease(args): Effect.Effect<void, never> {
  return Effect.tryPromise({
    try: async () => {
      await withRuntimeLeaseLock(root, async () => {
        await rm(path, { force: true });
      });
    },
    catch: (err) => err,
  }).pipe(Effect.catchAll(() => Effect.void));
}
export function releaseStaleRuntimeOwnershipLease(args): Effect.Effect<RuntimeOwnershipLease | undefined, never> {
  return Effect.tryPromise({
    try: async () => {
      return await withRuntimeLeaseLock(root, async () => {
        await rm(path, { force: true });
        return lease;
      });
    },
    catch: (err) => err,
  }).pipe(Effect.catchAll(() => Effect.succeed(undefined)));
}
function leaseOwnerState(root: string, lease: RuntimeOwnershipLease): LeaseOwnerState {
  return heartbeatMatchesLease(root, lease) ? "live" : "dead";
}
export function readAbandonedRunOperationRecords() {}
export function operationFromAbandonedRecord() {}
export function acquireRuntimeDaemonHeartbeat() {}

// @filename: packages/studio-server/src/operationRuntime/StudioOperationRuntime.ts
yield* acquireRuntimeDaemonHeartbeat({});
const lease = yield* acquireRuntimeOwnershipLease({ requestId });
admitRunInGame({
  requestId,
  leaseId: lease.leaseId,
});
yield* releaseStaleRuntimeOwnershipLease({});
const abandonedRecords = yield* readAbandonedRunOperationRecords({});
const abandonedOperations = abandonedRecords.map((record) =>
  operationFromAbandonedRecord(record, nowIso())
);
yield* adoptRunInGameOperations(registry, abandonedOperations);
writeRunOperationRecord(marked ?? operation, identity, {});
```

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
  program(statements=$body) where {
    $filename <: r".*packages/studio-server/src/operationRuntime/model\.ts$",
    ! $body <: contains `export type RuntimeActiveSlot = Readonly<{
  $...
  requestId: string;
  leaseId: string;
  $...
}>`
  },
  program(statements=$body) where {
    $filename <: r".*packages/studio-server/src/operationRuntime/model\.ts$",
    ! $body <: contains `export type RunInGameInternalOperation = Readonly<{
  $...
  requestId: string;
  leaseId: string;
  correlationDigest: string;
  $...
}>`
  },
  program(statements=$body) where {
    $filename <: r".*packages/studio-server/src/operationRuntime/operationRecords\.ts$",
    ! $body <: contains `export type RuntimeOwnershipLease = Readonly<{
  $...
  leaseId: string;
  ownerKind: "run-in-game" | "save-deploy";
  requestId: string;
  daemonId: string;
  daemonStartedAt: string;
  processId: number;
  acquiredAt: string;
  updatedAt: string;
  $...
}>`
  },
  program(statements=$body) where {
    $filename <: r".*packages/studio-server/src/operationRuntime/operationRecords\.ts$",
    ! $body <: contains `type RunOperationRecordBase = Readonly<{
  $...
  recordType: "RunOperationRecord";
  requestId: string;
  daemonId: string;
  daemonStartedAt: string;
  leaseId: string;
  phase: RunInGameInternalOperation["phase"];
  operationRevision: number;
  $...
}>`
  },
  program(statements=$body) where {
    $filename <: r".*packages/studio-server/src/operationRuntime/operationRecords\.ts$",
    ! $body <: contains `type RunningRunOperationRecord = RunOperationRecordBase &
  Readonly<{
    status: "running";
    terminalAt?: never;
    terminalOutcome?: never;
  }>`
  },
  program(statements=$body) where {
    $filename <: r".*packages/studio-server/src/operationRuntime/operationRecords\.ts$",
    ! $body <: contains `type TerminalRunOperationRecord = RunOperationRecordBase &
  Readonly<{
    status: Exclude<RunInGameInternalOperation["status"], "running">;
    terminalAt: string;
    terminalOutcome: Exclude<RunInGameInternalOperation["status"], "running">;
  }>`
  },
  program(statements=$body) where {
    $filename <: r".*packages/studio-server/src/operationRuntime/operationRecords\.ts$",
    ! $body <: contains `export type RunOperationRecord = RunningRunOperationRecord | TerminalRunOperationRecord`
  },
  program(statements=$body) where {
    $filename <: r".*packages/studio-server/src/operationRuntime/operationRecords\.ts$",
    ! $body <: contains `export function acquireRuntimeOwnershipLease`
  },
  program(statements=$body) where {
    $filename <: r".*packages/studio-server/src/operationRuntime/operationRecords\.ts$",
    ! $body <: contains `type LeaseOwnerState = "dead" | "live" | "ambiguous-live-pid"`
  },
  program(statements=$body) where {
    $filename <: r".*packages/studio-server/src/operationRuntime/operationRecords\.ts$",
    ! $body <: contains `async function withRuntimeLeaseLock`
  },
  program(statements=$body) where {
    $filename <: r".*packages/studio-server/src/operationRuntime/operationRecords\.ts$",
    ! $body <: contains `type RuntimeLeaseLockOwner = Readonly<{
  $...
  token: string;
  processId: number;
  acquiredAt: string;
  $...
}>`
  },
  program(statements=$body) where {
    $filename <: r".*packages/studio-server/src/operationRuntime/operationRecords\.ts$",
    ! $body <: contains `await writeJsonFile(runtimeLeaseLockOwnerPath(lockPath), owner)`
  },
  program(statements=$body) where {
    $filename <: r".*packages/studio-server/src/operationRuntime/operationRecords\.ts$",
    ! $body <: contains `async function releaseRuntimeLeaseLock(lockPath: string, token: string): Promise<void> {
  $...
  if (owner?.token === token) {
    await rm(lockPath, { recursive: true, force: true });
  }
}`
  },
  program(statements=$body) where {
    $filename <: r".*packages/studio-server/src/operationRuntime/operationRecords\.ts$",
    ! $body <: contains `async function removeStaleRuntimeLeaseLock(lockPath: string): Promise<void> {
  $...
  if (owner && processIsLive(owner.processId)) return;
  $...
  await rename(lockPath, stalePath).catch(() => undefined);
  await rm(stalePath, { recursive: true, force: true });
}`
  },
  program(statements=$body) where {
    $filename <: r".*packages/studio-server/src/operationRuntime/operationRecords\.ts$",
    ! $body <: contains `export function acquireRuntimeOwnershipLease($args): $returnType {
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
  program(statements=$body) where {
    $filename <: r".*packages/studio-server/src/operationRuntime/operationRecords\.ts$",
    ! $body <: contains `export function releaseRuntimeOwnershipLease($args): $returnType {
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
  program(statements=$body) where {
    $filename <: r".*packages/studio-server/src/operationRuntime/operationRecords\.ts$",
    ! $body <: contains `export function releaseStaleRuntimeOwnershipLease($args): $returnType {
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
  program(statements=$body) where {
    $filename <: r".*packages/studio-server/src/operationRuntime/operationRecords\.ts$",
    ! $body <: contains `function leaseOwnerState(root: string, lease: RuntimeOwnershipLease): LeaseOwnerState {
  $...
  return heartbeatMatchesLease(root, lease) ? "live" : "ambiguous-live-pid";
}`
  },
  program(statements=$body) where {
    $filename <: r".*packages/studio-server/src/operationRuntime/operationRecords\.ts$",
    ! $body <: contains `export function readAbandonedRunOperationRecords`
  },
  program(statements=$body) where {
    $filename <: r".*packages/studio-server/src/operationRuntime/operationRecords\.ts$",
    ! $body <: contains `export function releaseStaleRuntimeOwnershipLease`
  },
  program(statements=$body) where {
    $filename <: r".*packages/studio-server/src/operationRuntime/operationRecords\.ts$",
    ! $body <: contains `export function operationFromAbandonedRecord`
  },
  program(statements=$body) where {
    $filename <: r".*packages/studio-server/src/operationRuntime/operationRecords\.ts$",
    ! $body <: contains `export function acquireRuntimeDaemonHeartbeat`
  },
  program(statements=$body) where {
    $filename <: r".*packages/studio-server/src/operationRuntime/registry\.ts$",
    ! $body <: contains `const known = state.runInGame[args.requestId]`
  },
  program(statements=$body) where {
    $filename <: r".*packages/studio-server/src/operationRuntime/registry\.ts$",
    ! $body <: contains `const tombstone = state.tombstones[args.requestId]`
  },
  program(statements=$body) where {
    $filename <: r".*packages/studio-server/src/operationRuntime/StudioOperationRuntime\.ts$",
    ! $body <: contains `const lease = yield* acquireRuntimeOwnershipLease($leaseArgs);
$...
leaseId: lease.leaseId,
$...`
  },
  program(statements=$body) where {
    $filename <: r".*packages/studio-server/src/operationRuntime/StudioOperationRuntime\.ts$",
    ! $body <: contains `yield* acquireRuntimeDaemonHeartbeat($heartbeatArgs);
$...
yield* releaseStaleRuntimeOwnershipLease($staleLeaseArgs);
$...
const abandonedRecords = yield* readAbandonedRunOperationRecords($recordArgs);
$...
const abandonedOperations = abandonedRecords.map(($record) =>
  operationFromAbandonedRecord($record, $nowIso)
);
$...
yield* adoptRunInGameOperations(registry, abandonedOperations)`
  },
  program(statements=$body) where {
    $filename <: r".*packages/studio-server/src/operationRuntime/StudioOperationRuntime\.ts$",
    ! $body <: contains `releaseStaleRuntimeOwnershipLease`
  },
  program(statements=$body) where {
    $filename <: r".*packages/studio-server/src/operationRuntime/StudioOperationRuntime\.ts$",
    ! $body <: contains `writeRunOperationRecord(marked ?? operation, identity, $options)`
  },
  `fingerprint?: string` where {
    $filename <: r".*packages/studio-server/src/operationRuntime/model\.ts$",
    within `export type RuntimeTombstone = Readonly<$shape>`
  },
  `fingerprint: string` where {
    $filename <: r".*packages/studio-server/src/operationRuntime/model\.ts$",
    within `export type RunInGameInternalOperation = Readonly<$shape>`
  },
  `operation.fingerprint === args.prepared.fingerprint` where {
    $filename <: r".*packages/studio-server/src/operationRuntime/registry\.ts$",
    within `export function admitRunInGame($args) { $body }`
  },
  `tombstone.fingerprint === args.prepared.fingerprint` where {
    $filename <: r".*packages/studio-server/src/operationRuntime/registry\.ts$",
    within `export function admitRunInGame($args) { $body }`
  },
  `operation.correlationDigest === args.prepared.correlationDigest` where {
    $filename <: r".*packages/studio-server/src/operationRuntime/registry\.ts$",
    within `export function admitRunInGame($args) { $body }`
  },
  `tombstone.correlationDigest === args.prepared.correlationDigest` where {
    $filename <: r".*packages/studio-server/src/operationRuntime/registry\.ts$",
    within `export function admitRunInGame($args) { $body }`
  },
  `Object.values(state.runInGame).find($predicate)` where {
    $filename <: r".*packages/studio-server/src/operationRuntime/registry\.ts$",
    within `export function admitRunInGame($args) { $body }`
  },
  `Object.values(state.runInGame).some($predicate)` where {
    $filename <: r".*packages/studio-server/src/operationRuntime/registry\.ts$",
    within `export function admitRunInGame($args) { $body }`
  },
  `Object.values(state.tombstones).find($predicate)` where {
    $filename <: r".*packages/studio-server/src/operationRuntime/registry\.ts$",
    within `export function admitRunInGame($args) { $body }`
  },
  `Object.values(state.tombstones).some($predicate)` where {
    $filename <: r".*packages/studio-server/src/operationRuntime/registry\.ts$",
    within `export function admitRunInGame($args) { $body }`
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
type LeaseOwnerState = "dead" | "live" | "ambiguous-live-pid";
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
  return heartbeatMatchesLease(root, lease) ? "live" : "ambiguous-live-pid";
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

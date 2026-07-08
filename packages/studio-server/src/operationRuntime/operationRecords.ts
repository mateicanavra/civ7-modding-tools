import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { link, mkdir, readdir, readFile, rename, rm, stat, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { Effect, type Scope } from "effect";
import { operationBlocked, type StudioRuntimeFailure } from "../errors/index.js";
import { SAFE_RUN_DIAGNOSTICS_ID } from "../runInGamePublic.js";
import {
  type RunInGameInternalOperation,
  type SaveDeployInternalOperation,
  statusForRunInGamePhase,
} from "./model.js";
import type { StudioDaemonIdentity } from "./ports.js";
import {
  assertSafeRunRequestId,
  assertSafeRunStorageId,
  jailedRunWorkspacePath,
  resolveRunWorkspaceRoot,
  SAFE_RUN_REQUEST_ID,
} from "./runWorkspace/paths.js";

const OPERATION_RECORD_FILE = "operation-record.json";
const RUNTIME_LEASE_FILE = "runtime-ownership-lease.json";
const RUNTIME_LEASE_LOCK_DIR = "runtime-ownership-lease.lock";
const RUNTIME_LEASE_LOCK_OWNER_FILE = "owner.json";
const RUNTIME_LEASE_LOCK_RETRY_MS = 25;
const RUNTIME_LEASE_LOCK_TIMEOUT_MS = 2_000;
const RUNTIME_LEASE_LOCK_STALE_MS = 30_000;
const DAEMON_HEARTBEAT_TTL_MS = 10_000;
const DAEMON_HEARTBEAT_INTERVAL_MS = 1_000;
const RUN_IN_GAME_RECORD_PHASES = new Set<RunInGameInternalOperation["phase"]>([
  "accepted",
  "materializing",
  "deploying",
  "restarting-civ",
  "checking-civ7",
  "reload-needed",
  "preparing-setup",
  "starting-game",
  "waiting-for-proof",
  "complete",
  "blocked",
  "failed",
  "uncertain",
  "cancelled",
  "runtime-disposed",
]);
const RUN_IN_GAME_RECORD_STATUSES = new Set<RunInGameInternalOperation["status"]>([
  "running",
  "complete",
  "blocked",
  "failed",
  "uncertain",
  "cancelled",
]);

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

type RuntimeDaemonHeartbeat = Readonly<{
  daemonId: string;
  daemonStartedAt: string;
  processId: number;
  updatedAt: string;
}>;

type RuntimeLeaseLockOwner = Readonly<{
  token: string;
  processId: number;
  acquiredAt: string;
}>;

type LeaseReadState =
  | Readonly<{ state: "missing" }>
  | Readonly<{ state: "valid"; lease: RuntimeOwnershipLease }>
  | Readonly<{ state: "corrupt"; error: unknown }>;

type LeaseOwnerState = "dead" | "live";

type RunRecordReadState =
  | Readonly<{ state: "missing" }>
  | Readonly<{ state: "valid"; record: RunOperationRecord }>
  | Readonly<{ state: "corrupt"; requestId: string; error: unknown }>;

/**
 * Private restart ledger for Run in Game operations.
 *
 * The public API is still `requestId` + safe status. This record exists so a
 * later Studio daemon can honestly terminalize work abandoned by an earlier
 * daemon instead of making the client infer ownership loss from a missing
 * in-memory operation.
 */
type RunOperationRecordBase = Readonly<{
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

/**
 * Acquires the single durable owner for Civ7-facing runtime writes.
 *
 * The lease is intentionally independent of content digests: a repeated map
 * request is a new operation, while shared deployed-mod and Civ7 control
 * resources remain single-flight.
 */
export function acquireRuntimeOwnershipLease(
  args: Readonly<{
    workspaceRoot?: string;
    identity: StudioDaemonIdentity;
    ownerKind: RuntimeOwnershipLease["ownerKind"];
    requestId: string;
    nowIso: string;
  }>
): Effect.Effect<RuntimeOwnershipLease, StudioRuntimeFailure> {
  return Effect.tryPromise({
    try: async () => {
      const root = workspaceRoot(args.workspaceRoot);
      return await withRuntimeLeaseLock(root, async () => {
        const path = runtimeLeasePath(root);
        await mkdir(dirname(path), { recursive: true });
        const current = await readRuntimeOwnershipLeaseState(path);
        if (current.state === "valid" && leaseOwnerState(root, current.lease) !== "dead") {
          throw new RuntimeLeaseConflict(current.lease);
        }
        if (current.state === "valid") await rm(path, { force: true });
        if (current.state === "corrupt") await quarantineRuntimeLease(path);
        const lease: RuntimeOwnershipLease = {
          leaseId: `runtime-lease-${randomUUID()}`,
          ownerKind: args.ownerKind,
          requestId: args.requestId,
          daemonId: args.identity.serverInstanceId,
          daemonStartedAt: args.identity.serverStartedAt,
          processId: process.pid,
          acquiredAt: args.nowIso,
          updatedAt: args.nowIso,
        };
        await writeJsonFileIfAbsent(path, lease);
        return lease;
      });
    },
    catch: (err) => ownershipConflict(err, args.requestId),
  });
}

export function releaseRuntimeOwnershipLease(
  args: Readonly<{
    workspaceRoot?: string;
    leaseId: string;
    requestId: string;
  }>
): Effect.Effect<void, never> {
  return Effect.tryPromise({
    try: async () => {
      const root = workspaceRoot(args.workspaceRoot);
      await withRuntimeLeaseLock(root, async () => {
        const path = runtimeLeasePath(root);
        const current = await readRuntimeOwnershipLeaseAt(path).catch(() => undefined);
        if (!current || current.leaseId !== args.leaseId || current.requestId !== args.requestId) {
          return;
        }
        await rm(path, { force: true });
      });
    },
    catch: (err) => err,
  }).pipe(Effect.catchAll(() => Effect.void));
}

export function releaseRuntimeOwnershipLeaseForRecord(
  args: Readonly<{
    workspaceRoot?: string;
    record: RunOperationRecord;
  }>
): Effect.Effect<void, never> {
  return releaseRuntimeOwnershipLease({
    workspaceRoot: args.workspaceRoot,
    leaseId: args.record.leaseId,
    requestId: args.record.requestId,
  });
}

export function writeRunOperationRecord(
  operation: RunInGameInternalOperation,
  identity: StudioDaemonIdentity,
  options: Readonly<{ workspaceRoot?: string }> = {}
): Effect.Effect<void, unknown> {
  return Effect.tryPromise({
    try: async () => {
      const path = runOperationRecordPath(
        workspaceRoot(options.workspaceRoot),
        operation.requestId
      );
      await writeJsonFile(path, toRunOperationRecord(operation, identity));
    },
    catch: (err) => err,
  });
}

export function readAbandonedRunOperationRecords(
  args: Readonly<{
    workspaceRoot?: string;
    identity: StudioDaemonIdentity;
  }>
): Effect.Effect<ReadonlyArray<RunOperationRecord>, never> {
  return Effect.tryPromise({
    try: async () => {
      const root = workspaceRoot(args.workspaceRoot);
      const activeLeaseState = await readRuntimeOwnershipLeaseState(runtimeLeasePath(root));
      const activeLease = activeLeaseState.state === "valid" ? activeLeaseState.lease : undefined;
      const entries = await readdir(root, { withFileTypes: true }).catch((err: unknown) => {
        if (isNotFoundError(err)) return [];
        throw err;
      });
      const records: RunOperationRecord[] = [];
      for (const entry of entries) {
        if (!entry.isDirectory() || !SAFE_RUN_REQUEST_ID.test(entry.name)) continue;
        const recordState = await readRunOperationRecordState(root, entry.name);
        const record =
          recordState.state === "valid"
            ? recordState.record
            : recordState.state === "corrupt"
              ? corruptRecordForRequest(recordState.requestId, nowIsoFromSystem())
              : undefined;
        if (
          record?.status === "running" &&
          !recordOwnedByIdentity(record, args.identity) &&
          !leaseMayKeepRecordAlive(root, activeLease, record)
        ) {
          records.push(record);
        }
      }
      return records;
    },
    catch: (err) => err,
  }).pipe(
    Effect.catchAll((error) =>
      Effect.sync(() => {
        console.error("[studio-server] failed to scan Run in Game operation records", error);
        return [];
      })
    )
  );
}

export function releaseStaleRuntimeOwnershipLease(
  args: Readonly<{
    workspaceRoot?: string;
    identity: StudioDaemonIdentity;
  }>
): Effect.Effect<RuntimeOwnershipLease | undefined, never> {
  return Effect.tryPromise({
    try: async () => {
      const root = workspaceRoot(args.workspaceRoot);
      return await withRuntimeLeaseLock(root, async () => {
        const path = runtimeLeasePath(root);
        const leaseState = await readRuntimeOwnershipLeaseState(path);
        if (leaseState.state === "missing") return undefined;
        if (leaseState.state === "corrupt") {
          await quarantineRuntimeLease(path);
          return undefined;
        }
        const lease = leaseState.lease;
        if (leaseOwnedByIdentity(lease, args.identity) || leaseOwnerState(root, lease) !== "dead") {
          return undefined;
        }
        await rm(path, { force: true });
        return lease;
      });
    },
    catch: (err) => err,
  }).pipe(Effect.catchAll(() => Effect.succeed(undefined)));
}

/**
 * Publishes the current daemon's liveness inside the runtime workspace.
 *
 * PID checks only prove some process exists. The heartbeat ties that process to
 * this Studio daemon id and start time so restart reconciliation can distinguish
 * a live peer from a stale or reused PID.
 */
export function acquireRuntimeDaemonHeartbeat(
  args: Readonly<{
    workspaceRoot?: string;
    identity: StudioDaemonIdentity;
  }>
): Effect.Effect<void, never, Scope.Scope> {
  return Effect.acquireRelease(
    Effect.tryPromise({
      try: async () => {
        const heartbeatPath = runtimeDaemonHeartbeatPath(
          workspaceRoot(args.workspaceRoot),
          args.identity.serverInstanceId
        );
        const writeHeartbeat = () =>
          writeJsonFile(heartbeatPath, {
            daemonId: args.identity.serverInstanceId,
            daemonStartedAt: args.identity.serverStartedAt,
            processId: process.pid,
            updatedAt: new Date().toISOString(),
          } satisfies RuntimeDaemonHeartbeat);
        await writeHeartbeat();
        const timer = setInterval(
          () => void writeHeartbeat().catch(() => undefined),
          DAEMON_HEARTBEAT_INTERVAL_MS
        );
        timer.unref();
        return { heartbeatPath, timer };
      },
      catch: (err) => err,
    }),
    ({ heartbeatPath, timer }) =>
      Effect.tryPromise({
        try: async () => {
          clearInterval(timer);
          await rm(heartbeatPath, { force: true });
        },
        catch: (err) => err,
      }).pipe(Effect.catchAll(() => Effect.void))
  ).pipe(
    Effect.asVoid,
    Effect.catchAll((error) =>
      Effect.sync(() => {
        console.error("[studio-server] failed to publish runtime daemon heartbeat", error);
      })
    )
  );
}

export function operationFromAbandonedRecord(
  record: RunOperationRecord,
  nowIso: string
): RunInGameInternalOperation {
  return {
    kind: "run-in-game",
    requestId: record.requestId,
    leaseId: record.leaseId,
    correlationDigest: `abandoned:${record.requestId}`,
    request: {},
    phase: "failed",
    status: "failed",
    operationRevision: record.operationRevision + 1,
    startedAt: record.createdAt,
    updatedAt: nowIso,
    diagnosticsId: record.diagnosticsId,
    completedPhases: [],
    failure: operationBlocked({
      message: "Run in Game operation ownership was lost after Studio daemon restart.",
      activeRequestId: record.requestId,
      activePhase: record.phase,
      diagnostics: {
        code: "run-in-game-ownership-lost-after-restart",
        previousDaemonId: record.daemonId,
        leaseId: record.leaseId,
      },
    }),
  };
}

export function isRuntimeOperationTerminal(
  operation: RunInGameInternalOperation | SaveDeployInternalOperation
): boolean {
  return operation.status !== "running";
}

function toRunOperationRecord(
  operation: RunInGameInternalOperation,
  identity: StudioDaemonIdentity
): RunOperationRecord {
  const base: RunOperationRecordBase = {
    recordType: "RunOperationRecord",
    requestId: operation.requestId,
    daemonId: identity.serverInstanceId,
    daemonStartedAt: identity.serverStartedAt,
    leaseId: operation.leaseId,
    phase: operation.phase,
    operationRevision: operation.operationRevision,
    ...(operation.diagnosticsId === undefined ? {} : { diagnosticsId: operation.diagnosticsId }),
    createdAt: operation.startedAt,
    updatedAt: operation.updatedAt,
  };
  if (operation.status === "running") {
    return { ...base, status: "running" };
  }
  return { ...base, status: operation.status, ...terminalRecordFields(operation) };
}

function terminalRecordFields(
  operation: RunInGameInternalOperation
): Pick<TerminalRunOperationRecord, "terminalAt" | "terminalOutcome"> {
  if (operation.status === "running") {
    throw new Error("Running operation cannot produce terminal record fields.");
  }
  return {
    terminalAt: operation.updatedAt,
    terminalOutcome: operation.status,
  };
}

async function readRuntimeOwnershipLeaseAt(path: string): Promise<RuntimeOwnershipLease> {
  const parsed = JSON.parse(await readFile(path, "utf8")) as unknown;
  if (!isRuntimeOwnershipLease(parsed)) throw new Error("Invalid runtime ownership lease.");
  return parsed;
}

async function readRuntimeOwnershipLeaseState(path: string): Promise<LeaseReadState> {
  try {
    return { state: "valid", lease: await readRuntimeOwnershipLeaseAt(path) };
  } catch (err) {
    if (isNotFoundError(err)) return { state: "missing" };
    return { state: "corrupt", error: err };
  }
}

async function readRunOperationRecordAt(
  path: string,
  requestId: string
): Promise<RunOperationRecord> {
  const parsed = JSON.parse(await readFile(path, "utf8")) as unknown;
  if (!isRunOperationRecord(parsed, requestId)) throw new Error("Invalid RunOperationRecord.");
  return parsed;
}

async function readRunOperationRecordState(
  root: string,
  requestId: string
): Promise<RunRecordReadState> {
  try {
    return {
      state: "valid",
      record: await readRunOperationRecordAt(runOperationRecordPath(root, requestId), requestId),
    };
  } catch (err) {
    if (isNotFoundError(err)) return { state: "missing" };
    await quarantineRunOperationRecord(root, requestId);
    return { state: "corrupt", requestId, error: err };
  }
}

function workspaceRoot(root: string | undefined): string {
  return resolveRunWorkspaceRoot(root);
}

function runtimeLeasePath(root: string): string {
  return jailedRunWorkspacePath(root, "_runtime", RUNTIME_LEASE_FILE);
}

function runtimeLeaseLockPath(root: string): string {
  return jailedRunWorkspacePath(root, "_runtime", RUNTIME_LEASE_LOCK_DIR);
}

function runtimeDaemonHeartbeatPath(root: string, daemonId: string): string {
  assertSafeRunStorageId(daemonId, "Studio daemon id");
  return jailedRunWorkspacePath(root, "_runtime", "daemons", `${daemonId}.json`);
}

function runOperationRecordPath(root: string, requestId: string): string {
  assertSafeRunRequestId(requestId);
  return jailedRunWorkspacePath(root, requestId, OPERATION_RECORD_FILE);
}

function corruptRecordForRequest(requestId: string, nowIso: string): RunOperationRecord {
  return {
    recordType: "RunOperationRecord",
    requestId,
    daemonId: "unknown-corrupt-record",
    daemonStartedAt: nowIso,
    leaseId: `corrupt-record:${requestId}`,
    phase: "accepted",
    status: "running",
    operationRevision: 0,
    diagnosticsId: `run-diagnostics-corrupt-${requestId}`,
    createdAt: nowIso,
    updatedAt: nowIso,
  };
}

function nowIsoFromSystem(): string {
  return new Date().toISOString();
}

function ownershipConflict(err: unknown, requestId: string): StudioRuntimeFailure {
  if (err instanceof RuntimeLeaseConflict) {
    return operationBlocked({
      message: "Studio runtime ownership is held by another operation.",
      activeRequestId: err.lease.requestId,
      activePhase: err.lease.ownerKind,
      diagnostics: {
        code: "studio-runtime-ownership-lease-held",
        ownerKind: err.lease.ownerKind,
      },
    });
  }
  return operationBlocked({
    message: "Studio runtime ownership is held by another operation.",
    activeRequestId: requestId,
    diagnostics: {
      code: "studio-runtime-ownership-lease-held",
    },
  });
}

async function withRuntimeLeaseLock<T>(root: string, task: () => Promise<T>): Promise<T> {
  const lockPath = runtimeLeaseLockPath(root);
  const owner: RuntimeLeaseLockOwner = {
    token: `runtime-lease-lock-${randomUUID()}`,
    processId: process.pid,
    acquiredAt: new Date().toISOString(),
  };
  await mkdir(dirname(lockPath), { recursive: true });
  await acquireRuntimeLeaseLock(lockPath, owner);
  try {
    return await task();
  } finally {
    await releaseRuntimeLeaseLock(lockPath, owner.token);
  }
}

async function acquireRuntimeLeaseLock(
  lockPath: string,
  owner: RuntimeLeaseLockOwner
): Promise<void> {
  const deadline = Date.now() + RUNTIME_LEASE_LOCK_TIMEOUT_MS;
  while (true) {
    try {
      await mkdir(lockPath);
      try {
        await writeJsonFile(runtimeLeaseLockOwnerPath(lockPath), owner);
      } catch (err) {
        await rm(lockPath, { recursive: true, force: true });
        throw err;
      }
      return;
    } catch (err) {
      if (!isAlreadyExistsError(err) || Date.now() >= deadline) throw err;
      await removeStaleRuntimeLeaseLock(lockPath);
      await sleep(RUNTIME_LEASE_LOCK_RETRY_MS);
    }
  }
}

async function releaseRuntimeLeaseLock(lockPath: string, token: string): Promise<void> {
  const owner = await readRuntimeLeaseLockOwner(lockPath).catch(() => undefined);
  if (owner?.token === token) {
    await rm(lockPath, { recursive: true, force: true });
  }
}

async function removeStaleRuntimeLeaseLock(lockPath: string): Promise<void> {
  const lockStat = await stat(lockPath).catch(() => undefined);
  if (!lockStat || Date.now() - lockStat.mtimeMs <= RUNTIME_LEASE_LOCK_STALE_MS) {
    return;
  }
  const owner = await readRuntimeLeaseLockOwner(lockPath).catch(() => undefined);
  if (owner && processIsLive(owner.processId)) return;
  const stalePath = `${lockPath}.stale-${Date.now()}-${randomUUID()}`;
  await rename(lockPath, stalePath).catch(() => undefined);
  await rm(stalePath, { recursive: true, force: true });
}

function runtimeLeaseLockOwnerPath(lockPath: string): string {
  return resolve(lockPath, RUNTIME_LEASE_LOCK_OWNER_FILE);
}

async function readRuntimeLeaseLockOwner(lockPath: string): Promise<RuntimeLeaseLockOwner> {
  const parsed = JSON.parse(await readFile(runtimeLeaseLockOwnerPath(lockPath), "utf8")) as unknown;
  if (!isRuntimeLeaseLockOwner(parsed)) throw new Error("Invalid runtime lease lock owner.");
  return parsed;
}

function isRuntimeOwnershipLease(value: unknown): value is RuntimeOwnershipLease {
  return (
    value != null &&
    typeof value === "object" &&
    typeof (value as RuntimeOwnershipLease).leaseId === "string" &&
    ((value as RuntimeOwnershipLease).ownerKind === "run-in-game" ||
      (value as RuntimeOwnershipLease).ownerKind === "save-deploy") &&
    typeof (value as RuntimeOwnershipLease).requestId === "string" &&
    typeof (value as RuntimeOwnershipLease).daemonId === "string" &&
    isTimestampString((value as RuntimeOwnershipLease).daemonStartedAt) &&
    typeof (value as RuntimeOwnershipLease).processId === "number" &&
    isTimestampString((value as RuntimeOwnershipLease).acquiredAt) &&
    isTimestampString((value as RuntimeOwnershipLease).updatedAt)
  );
}

function isRuntimeLeaseLockOwner(value: unknown): value is RuntimeLeaseLockOwner {
  return (
    value != null &&
    typeof value === "object" &&
    typeof (value as RuntimeLeaseLockOwner).token === "string" &&
    typeof (value as RuntimeLeaseLockOwner).processId === "number" &&
    isTimestampString((value as RuntimeLeaseLockOwner).acquiredAt)
  );
}

function isRunOperationRecord(value: unknown, requestId: string): value is RunOperationRecord {
  if (value == null || typeof value !== "object") return false;
  const record = value as RunOperationRecord;
  if (
    record.recordType !== "RunOperationRecord" ||
    record.requestId !== requestId ||
    !SAFE_RUN_REQUEST_ID.test(record.requestId) ||
    record.requestId === "." ||
    record.requestId === ".." ||
    typeof record.daemonId !== "string" ||
    !isTimestampString(record.daemonStartedAt) ||
    typeof record.leaseId !== "string" ||
    !RUN_IN_GAME_RECORD_PHASES.has(record.phase) ||
    !RUN_IN_GAME_RECORD_STATUSES.has(record.status) ||
    typeof record.operationRevision !== "number" ||
    !isTimestampString(record.createdAt) ||
    !isTimestampString(record.updatedAt)
  ) {
    return false;
  }
  if (
    record.diagnosticsId !== undefined &&
    (typeof record.diagnosticsId !== "string" ||
      !SAFE_RUN_DIAGNOSTICS_ID.test(record.diagnosticsId))
  ) {
    return false;
  }
  if (statusForRunInGamePhase(record.phase) !== record.status) return false;
  if (record.status === "running") {
    return record.terminalAt === undefined && record.terminalOutcome === undefined;
  }
  return isTimestampString(record.terminalAt) && record.terminalOutcome === record.status;
}

function isNotFoundError(err: unknown): boolean {
  return (
    err != null &&
    typeof err === "object" &&
    "code" in err &&
    (err as { code?: unknown }).code === "ENOENT"
  );
}

function isAlreadyExistsError(err: unknown): boolean {
  return (
    err != null &&
    typeof err === "object" &&
    "code" in err &&
    (err as { code?: unknown }).code === "EEXIST"
  );
}

function isTimestampString(value: unknown): value is string {
  return typeof value === "string" && Number.isFinite(Date.parse(value));
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolveSleep) => setTimeout(resolveSleep, ms));
}

function leaseMayKeepRecordAlive(
  root: string,
  lease: RuntimeOwnershipLease | undefined,
  record: RunOperationRecord
): boolean {
  return (
    lease?.leaseId === record.leaseId &&
    lease.requestId === record.requestId &&
    lease.daemonId === record.daemonId &&
    lease.daemonStartedAt === record.daemonStartedAt &&
    leaseOwnerState(root, lease) !== "dead"
  );
}

function recordOwnedByIdentity(
  record: RunOperationRecord,
  identity: StudioDaemonIdentity
): boolean {
  return (
    record.daemonId === identity.serverInstanceId &&
    record.daemonStartedAt === identity.serverStartedAt
  );
}

function leaseOwnedByIdentity(
  lease: RuntimeOwnershipLease,
  identity: StudioDaemonIdentity
): boolean {
  return (
    lease.daemonId === identity.serverInstanceId &&
    lease.daemonStartedAt === identity.serverStartedAt
  );
}

function leaseOwnerState(root: string, lease: RuntimeOwnershipLease): LeaseOwnerState {
  return heartbeatMatchesLease(root, lease) ? "live" : "dead";
}

function processIsLive(processId: number): boolean {
  try {
    process.kill(processId, 0);
    return true;
  } catch {
    return false;
  }
}

async function writeJsonFile(path: string, value: unknown): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  const tempPath = `${path}.${process.pid}.${randomUUID()}.tmp`;
  await writeFile(tempPath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  await rename(tempPath, path);
}

async function writeJsonFileIfAbsent(path: string, value: unknown): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  const tempPath = `${path}.${process.pid}.${randomUUID()}.tmp`;
  await writeFile(tempPath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  try {
    await link(tempPath, path);
  } finally {
    await rm(tempPath, { force: true });
  }
}

async function quarantineRuntimeLease(path: string): Promise<void> {
  await rename(path, `${path}.corrupt-${Date.now()}-${randomUUID()}`).catch(() => undefined);
}

async function quarantineRunOperationRecord(root: string, requestId: string): Promise<void> {
  const path = runOperationRecordPath(root, requestId);
  await rename(path, `${path}.corrupt-${Date.now()}-${randomUUID()}`).catch(() => undefined);
}

function heartbeatMatchesLease(root: string, lease: RuntimeOwnershipLease): boolean {
  try {
    const path = runtimeDaemonHeartbeatPath(root, lease.daemonId);
    // Startup reconciliation needs one coherent liveness snapshot before it
    // decides whether to release or preserve the durable lease.
    const heartbeat = JSON.parse(readFileSync(path, "utf8")) as unknown;
    if (!isRuntimeDaemonHeartbeat(heartbeat)) return false;
    return (
      heartbeat.daemonId === lease.daemonId &&
      heartbeat.daemonStartedAt === lease.daemonStartedAt &&
      heartbeat.processId === lease.processId &&
      Date.now() - Date.parse(heartbeat.updatedAt) <= DAEMON_HEARTBEAT_TTL_MS
    );
  } catch {
    return false;
  }
}

function isRuntimeDaemonHeartbeat(value: unknown): value is RuntimeDaemonHeartbeat {
  return (
    value != null &&
    typeof value === "object" &&
    typeof (value as RuntimeDaemonHeartbeat).daemonId === "string" &&
    typeof (value as RuntimeDaemonHeartbeat).daemonStartedAt === "string" &&
    typeof (value as RuntimeDaemonHeartbeat).processId === "number" &&
    typeof (value as RuntimeDaemonHeartbeat).updatedAt === "string"
  );
}

class RuntimeLeaseConflict extends Error {
  constructor(readonly lease: RuntimeOwnershipLease) {
    super(`Studio runtime lease is held by ${lease.requestId}.`);
  }
}

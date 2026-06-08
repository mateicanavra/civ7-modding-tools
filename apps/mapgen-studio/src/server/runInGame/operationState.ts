import { Civ7DirectControlError } from "@civ7/direct-control";
import type {
  RunInGameFailureDetails,
  RunInGameMaterializationStatus,
  RunInGameOperationKind,
  RunInGameOperationStatus,
  RunInGamePhase,
  RunInGameRequestStatus,
} from "../../features/runInGame/status";

export type RunInGameOperationState = RunInGameOperationStatus & Readonly<{
  serverInstanceId: string;
  serverStartedAt: string;
}>;

export class RunInGameHttpError extends Error {
  constructor(
    readonly statusCode: number,
    message: string,
    readonly details?: unknown
  ) {
    super(message);
  }
}

type StoreOptions = Readonly<{
  serverInstanceId: string;
  serverStartedAt: string;
  ttlMs: number;
  now?: () => Date;
}>;

export function createRunInGameOperationStore(options: StoreOptions) {
  const operations = new Map<string, RunInGameOperationState>();
  const now = () => (options.now ?? (() => new Date()))();
  const nowIso = () => now().toISOString();

  function prune(): void {
    const cutoff = now().getTime() - options.ttlMs;
    for (const [requestId, state] of operations) {
      if (Date.parse(state.updatedAt) < cutoff) operations.delete(requestId);
    }
  }

  function get(requestId: string): RunInGameOperationState | undefined {
    prune();
    return operations.get(requestId);
  }

  function findActive(): RunInGameOperationState | undefined {
    prune();
    return [...operations.values()].find((state) => state.status === "running");
  }

  function create(requestId: string, request?: RunInGameRequestStatus): RunInGameOperationState {
    prune();
    const startedAt = nowIso();
    const state: RunInGameOperationState = {
      ok: true,
      requestId,
      ...(request === undefined ? {} : { request }),
      phase: "materializing",
      status: "running",
      startedAt,
      updatedAt: startedAt,
      serverInstanceId: options.serverInstanceId,
      serverStartedAt: options.serverStartedAt,
      completedPhases: [],
      recoveryActions: ["copy-diagnostics", "retry-status"],
    };
    operations.set(requestId, state);
    return state;
  }

  function update(
    requestId: string,
    patch: Partial<Omit<RunInGameOperationState, "requestId" | "startedAt" | "serverInstanceId" | "serverStartedAt">>,
  ): RunInGameOperationState {
    const current = operations.get(requestId);
    if (!current) throw new Error(`Unknown Run in Game request id: ${requestId}`);
    const phase = patch.phase ?? current.phase;
    const completedPhases = [...current.completedPhases];
    if (phase !== current.phase && current.status === "running" && !completedPhases.includes(current.phase)) {
      completedPhases.push(current.phase);
    }
    const status = patch.status ?? statusForPhase(phase);
    const next: RunInGameOperationState = {
      ...current,
      ...patch,
      phase,
      status,
      completedPhases: patch.completedPhases ? [...patch.completedPhases] : completedPhases,
      updatedAt: nowIso(),
      recoveryActions: patch.recoveryActions ?? recoveryActionsFor({
        phase,
        status,
        details: patch.details ?? current.details,
      }),
    };
    operations.set(requestId, next);
    return next;
  }

  function complete(
    requestId: string,
    result: unknown,
    materialization?: RunInGameMaterializationStatus,
  ): RunInGameOperationState {
    return update(requestId, {
      ok: true,
      phase: "complete",
      status: "complete",
      result,
      ...(materialization === undefined ? {} : { materialization }),
      recoveryActions: ["copy-diagnostics"],
    });
  }

  function fail(
    requestId: string,
    phase: RunInGamePhase,
    err: unknown,
    materialization?: RunInGameMaterializationStatus,
  ): RunInGameOperationState {
    const current = operations.get(requestId);
    const details = runInGameFailureDetails(err, phase, current, materialization);
    const status = details.failureClass === "blocked"
      ? "blocked"
      : details.failureClass === "uncertain"
        ? "uncertain"
        : "failed";
    return update(requestId, {
      ok: false,
      phase: status,
      status,
      error: err instanceof Error ? err.message : String(err),
      details,
      ...(materialization === undefined ? {} : { materialization }),
    });
  }

  return {
    create,
    complete,
    fail,
    findActive,
    get,
    prune,
    update,
  };
}

export function statusForPhase(phase: RunInGamePhase): RunInGameOperationKind {
  if (phase === "idle") return "idle";
  if (phase === "complete") return "complete";
  if (phase === "blocked") return "blocked";
  if (phase === "failed") return "failed";
  if (phase === "uncertain") return "uncertain";
  return "running";
}

export function recoveryActionsFor(state: Pick<RunInGameOperationStatus, "phase" | "status" | "details">): string[] {
  const actions = ["copy-diagnostics"];
  if (state.status === "running" || state.status === "blocked" || state.status === "failed" || state.status === "uncertain") {
    actions.push("retry-status");
  }
  if (state.status === "failed" || state.status === "blocked" || state.status === "uncertain") {
    actions.push("retry-run");
  }
  if (state.details?.reloadRequired === true || state.phase === "reload-needed") {
    actions.push("exit-to-shell-and-continue");
  }
  if (state.details?.reloadBoundary === "process-restart-required") {
    actions.push("restart-civ-process-and-retry");
  }
  if (state.details?.dismissNotificationRequired === true || state.details?.recoveryBoundary === "civ-notification-dismiss") {
    actions.push("dismiss-civ-notification-and-retry");
  }
  return [...new Set(actions)];
}

export function runInGameFailureDetails(
  err: unknown,
  phase: RunInGamePhase,
  state?: RunInGameOperationStatus,
  materialization?: RunInGameMaterializationStatus,
): RunInGameFailureDetails {
  const directControlCode = err instanceof Civ7DirectControlError ? err.code : undefined;
  const httpDetails = err instanceof RunInGameHttpError && isRecord(err.details)
    ? err.details
    : {};
  const failureClass = classifyRunInGameFailure(err, phase);
  const nextMaterialization = materialization ?? (isMaterializationStatus(httpDetails.materialization) ? httpDetails.materialization : undefined);
  const code = directControlCode ?? (typeof httpDetails.code === "string" ? httpDetails.code : undefined);
  const cause = err instanceof Civ7DirectControlError ? cloneForJson(err.details) : undefined;
  return {
    ...httpDetails,
    failureClass,
    phase,
    completedPhases: state?.completedPhases ?? [],
    ...(nextMaterialization === undefined ? {} : { materialization: nextMaterialization }),
    ...(directControlCode === undefined ? {} : { directControlCode }),
    ...(code === undefined ? {} : { code }),
    ...(cause === undefined ? {} : { cause }),
  };
}

export function classifyRunInGameFailure(err: unknown, phase: RunInGamePhase): "blocked" | "failed" | "uncertain" {
  if (err instanceof RunInGameHttpError && err.statusCode === 409) return "blocked";
  const code = err instanceof Civ7DirectControlError ? err.code : undefined;
  if (
    (phase === "starting-game" || phase === "waiting-for-proof") &&
    (code === "response-timeout" || code === "socket-closed" || code === "connection-timeout" || code === "all-hosts-unavailable")
  ) {
    return "uncertain";
  }
  return "failed";
}

function cloneForJson(value: unknown): unknown {
  if (value === undefined) return undefined;
  return JSON.parse(JSON.stringify(value));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isMaterializationStatus(value: unknown): value is RunInGameMaterializationStatus {
  return isRecord(value);
}

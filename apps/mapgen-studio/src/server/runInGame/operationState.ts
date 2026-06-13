import { Civ7DirectControlError } from "@civ7/direct-control";
import type {
  RunInGameFailureDetails,
  RunInGameExactAuthorshipProof,
  RunInGameMaterializationStatus,
  RunInGameOperationKind,
  RunInGameOperationStatus,
  RunInGamePhase,
  RunInGameRequestStatus,
} from "../../features/runInGame/status";
import { StudioEngineError } from "../studio/engineErrors";

export type RunInGameOperationState = RunInGameOperationStatus & Readonly<{
  serverInstanceId: string;
  serverStartedAt: string;
}>;

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

  function list(): RunInGameOperationState[] {
    prune();
    return [...operations.values()].sort((left, right) => Date.parse(right.updatedAt) - Date.parse(left.updatedAt));
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
    exactAuthorshipProof?: RunInGameExactAuthorshipProof,
  ): RunInGameOperationState {
    return update(requestId, {
      ok: true,
      phase: "complete",
      status: "complete",
      result,
      ...(materialization === undefined ? {} : { materialization }),
      ...(exactAuthorshipProof === undefined ? {} : { exactAuthorshipProof }),
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
      error: publicRunInGameFailureMessage(err, details),
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
    list,
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
  const httpDetails = err instanceof StudioEngineError && isRecord(err.details)
    ? err.details
    : {};
  const failureClass = classifyRunInGameFailure(err, phase);
  const nextMaterialization = materialization ?? (isMaterializationStatus(httpDetails.materialization) ? httpDetails.materialization : undefined);
  const code = directControlCode ?? (typeof httpDetails.code === "string" ? httpDetails.code : undefined);
  const publicHttpDetails = sanitizeRunInGameStatusRecord(httpDetails);
  const cause = err instanceof Civ7DirectControlError
    ? sanitizeRunInGameStatusValue(err.details)
    : undefined;
  return {
    ...publicHttpDetails,
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
  if (err instanceof StudioEngineError && err.statusCode === 409) return "blocked";
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

function publicRunInGameFailureMessage(
  err: unknown,
  details: RunInGameFailureDetails,
): string {
  const phase = details.phase ?? "failed";
  const phaseLabel = publicRunInGamePhaseLabel(phase);
  if (err instanceof StudioEngineError) {
    return redactRuntimeCommandText(err.message);
  }
  if (err instanceof Civ7DirectControlError) {
    switch (err.code) {
      case "response-timeout":
        return `Civ7 did not respond during ${phaseLabel}; status is uncertain.`;
      case "socket-closed":
        return `Civ7 tuner connection closed during ${phaseLabel}; status is uncertain.`;
      case "connection-timeout":
        return `Timed out connecting to Civ7 during ${phaseLabel}.`;
      case "all-hosts-unavailable":
      case "no-hosts":
        return `No configured Civ7 tuner endpoint was available during ${phaseLabel}.`;
      default:
        return `Civ7 direct-control failed during ${phaseLabel}.`;
    }
  }
  return redactRuntimeCommandText(err instanceof Error ? err.message : String(err));
}

function publicRunInGamePhaseLabel(phase: RunInGamePhase): string {
  switch (phase) {
    case "materializing":
      return "materialization";
    case "deploying":
      return "deployment";
    case "restarting-civ":
      return "Civ restart";
    case "checking-civ7":
      return "Civ7 readiness check";
    case "reload-needed":
      return "reload recovery";
    case "preparing-setup":
      return "setup preparation";
    case "starting-game":
      return "game start";
    case "waiting-for-proof":
      return "runtime proof";
    case "idle":
    case "complete":
    case "blocked":
    case "failed":
    case "uncertain":
      return phase;
  }
}

function sanitizeRunInGameStatusValue(value: unknown): unknown {
  if (value === undefined) return undefined;
  const cloned = cloneForJson(value);
  return sanitizeClonedRunInGameStatusValue(cloned);
}

function sanitizeRunInGameStatusRecord(value: Record<string, unknown>): Record<string, unknown> {
  const sanitized = sanitizeRunInGameStatusValue(value);
  return isRecord(sanitized) ? sanitized : {};
}

function sanitizeClonedRunInGameStatusValue(value: unknown): unknown {
  if (typeof value === "string") return redactRuntimeCommandText(value);
  if (Array.isArray(value)) return value.map(sanitizeClonedRunInGameStatusValue);
  if (!isRecord(value)) return value;

  const out: Record<string, unknown> = {};
  for (const [key, next] of Object.entries(value)) {
    if (isRawRuntimeCommandDetailKey(key)) continue;
    out[key] = sanitizeClonedRunInGameStatusValue(next);
  }
  return out;
}

function isRawRuntimeCommandDetailKey(key: string): boolean {
  return /(?:^|\.)(?:command|rawCommand|jsLiteral|payload|startPayload|state|stateName|session|sessionSelection)(?:$|\.)/i.test(key);
}

function redactRuntimeCommandText(value: string): string {
  return value
    .replace(/CMD:[0-9]+:[\s\S]*/g, "[redacted-runtime-command]")
    .replace(/LSQ:[\s\S]*/g, "[redacted-runtime-command]");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isMaterializationStatus(value: unknown): value is RunInGameMaterializationStatus {
  return isRecord(value);
}

/** Runtime domains whose failures may cross the Studio error-mapping boundary. */
export const STUDIO_OPERATION_NAMESPACES = ["autoplay", "runInGame", "saveDeploy"] as const;

export type StudioOperationNamespace = (typeof STUDIO_OPERATION_NAMESPACES)[number];

/** Client actions that remain valid after private runtime evidence is redacted. */
export const STUDIO_RECOVERY_ACTIONS = [
  "check-dev-server",
  "copy-diagnostics",
  "dismiss-civ-notification-and-retry",
  "edit-config",
  "inspect-deploy-output",
  "restart-civ-process-and-retry",
  "retry-run",
  "retry-save-deploy",
  "retry-status",
] as const;

export type StudioRecoveryAction = (typeof STUDIO_RECOVERY_ACTIONS)[number];

/** Discriminants for the closed internal failure algebra. */
export const STUDIO_FAILURE_TAGS = [
  "OperationBlocked",
  "InvalidRequest",
  "OperationNotFound",
  "OperationExpired",
  "DaemonIdentityMismatch",
  "RuntimeDisposed",
  "UnsupportedOperationType",
  "DependencyUnavailable",
  "MaterializationFailed",
  "DeployFailed",
  "VerificationFailed",
  "AutoplayStartStopFailed",
  "AutoplayVerificationFailed",
] as const;

export type StudioFailureTag = (typeof STUDIO_FAILURE_TAGS)[number];

/** Stable machine-readable reasons paired with the failure discriminants. */
export const STUDIO_FAILURE_REASON_CODES = [
  "active-operation-conflict",
  "daemon-identity-mismatch",
  "deploy-failed",
  "direct-control-unavailable",
  "exact-authorship-mismatch",
  "expired-operation",
  "invalid-request",
  "log-evidence-missing",
  "materialization-evidence-missing",
  "path-jail-rejection",
  "restart-failed",
  "restart-unsupported",
  "rollback-failed",
  "runtime-disposed",
  "save-failed",
  "start-failed",
  "start-game-failed",
  "status-not-found",
  "stop-failed",
  "timeout-uncertain",
  "unsupported-operation-type",
  "verification-failed",
] as const;

export type StudioFailureReasonCode = (typeof STUDIO_FAILURE_REASON_CODES)[number];

/** External or process-local dependencies whose availability can block an operation. */
export const STUDIO_DEPENDENCY_KINDS = [
  "civ7-process",
  "direct-control",
  "filesystem",
  "runtime",
  "tuner-session",
] as const;

export type StudioDependencyKind = (typeof STUDIO_DEPENDENCY_KINDS)[number];

export type StudioBoundedDiagnosticValue = string | number | boolean | null | string[];

export type StudioBoundedDiagnostics = Readonly<Record<string, StudioBoundedDiagnosticValue>>;

const STUDIO_RUNTIME_FAILURE_BRAND = Symbol.for("@civ7/studio-server/StudioRuntimeFailure");

export type StudioRuntimeFailure = Readonly<{
  _tag: "StudioRuntimeFailure";
  tag: StudioFailureTag;
  reason: StudioFailureReasonCode;
  message: string;
  recoveryActions: ReadonlyArray<StudioRecoveryAction>;
  requestId?: string;
  activeRequestId?: string;
  activePhase?: string;
  operationType?: string;
  dependency?: StudioDependencyKind;
  directControlCode?: string;
  causeSummary?: string;
  diagnostics?: StudioBoundedDiagnostics;
}>;

/** Recognizes branded runtime failures and rejects invalid tag/reason combinations. */
export function isStudioRuntimeFailure(value: unknown): value is StudioRuntimeFailure {
  if (
    !value ||
    typeof value !== "object" ||
    (value as { [STUDIO_RUNTIME_FAILURE_BRAND]?: unknown })[STUDIO_RUNTIME_FAILURE_BRAND] !== true
  ) {
    return false;
  }
  const candidate = value as Partial<StudioRuntimeFailure>;
  return (
    candidate._tag === "StudioRuntimeFailure" &&
    typeof candidate.message === "string" &&
    isFailureTag(candidate.tag) &&
    isFailureReason(candidate.reason) &&
    Array.isArray(candidate.recoveryActions) &&
    candidate.recoveryActions.every(isRecoveryAction) &&
    tagAllowsReason(candidate.tag, candidate.reason)
  );
}

function studioFailure(args: Omit<StudioRuntimeFailure, "_tag">): StudioRuntimeFailure {
  const failure = {
    _tag: "StudioRuntimeFailure" as const,
    ...args,
    recoveryActions: [...new Set(args.recoveryActions)],
  };
  Object.defineProperty(failure, STUDIO_RUNTIME_FAILURE_BRAND, {
    value: true,
  });
  return failure;
}

/**
 * Locks a failure behind observation-only recovery after a mutation may have landed.
 * The original classification and diagnostics remain private evidence; callers may
 * refresh status or copy diagnostics, but they cannot infer replay authority.
 */
export function preventStudioRuntimeFailureReplay(
  failure: StudioRuntimeFailure
): StudioRuntimeFailure {
  return studioFailure({
    ...failure,
    recoveryActions: ["retry-status", "copy-diagnostics"],
    diagnostics: { ...failure.diagnostics, noRepeat: true },
  });
}

function isFailureTag(value: unknown): value is StudioFailureTag {
  return typeof value === "string" && STUDIO_FAILURE_TAGS.includes(value as StudioFailureTag);
}

function isFailureReason(value: unknown): value is StudioFailureReasonCode {
  return (
    typeof value === "string" &&
    STUDIO_FAILURE_REASON_CODES.includes(value as StudioFailureReasonCode)
  );
}

function isRecoveryAction(value: unknown): value is StudioRecoveryAction {
  return (
    typeof value === "string" && STUDIO_RECOVERY_ACTIONS.includes(value as StudioRecoveryAction)
  );
}

function tagAllowsReason(tag: StudioFailureTag, reason: StudioFailureReasonCode): boolean {
  switch (tag) {
    case "OperationBlocked":
      return reason === "active-operation-conflict";
    case "InvalidRequest":
      return reason === "invalid-request" || reason === "path-jail-rejection";
    case "OperationNotFound":
      return reason === "status-not-found";
    case "OperationExpired":
      return reason === "expired-operation";
    case "DaemonIdentityMismatch":
      return reason === "daemon-identity-mismatch";
    case "RuntimeDisposed":
      return reason === "runtime-disposed";
    case "UnsupportedOperationType":
      return reason === "unsupported-operation-type";
    case "DependencyUnavailable":
      return (
        reason === "direct-control-unavailable" ||
        reason === "restart-failed" ||
        reason === "restart-unsupported"
      );
    case "MaterializationFailed":
      return reason === "materialization-evidence-missing";
    case "DeployFailed":
      return reason === "deploy-failed" || reason === "save-failed" || reason === "rollback-failed";
    case "VerificationFailed":
      return (
        reason === "exact-authorship-mismatch" ||
        reason === "log-evidence-missing" ||
        reason === "start-game-failed" ||
        reason === "timeout-uncertain"
      );
    case "AutoplayStartStopFailed":
      return reason === "start-failed" || reason === "stop-failed";
    case "AutoplayVerificationFailed":
      return reason === "verification-failed";
  }
}

/** Builds a terminal ownership failure for an operation evicted after its retention window. */
export function operationExpired(args: {
  message: string;
  requestId?: string;
  diagnostics?: StudioBoundedDiagnostics;
}): StudioRuntimeFailure {
  return studioFailure({
    tag: "OperationExpired",
    reason: "expired-operation",
    message: args.message,
    recoveryActions: ["retry-status", "copy-diagnostics"],
    ...(args.requestId === undefined ? {} : { requestId: args.requestId }),
    ...(args.diagnostics === undefined ? {} : { diagnostics: args.diagnostics }),
  });
}

/** Builds a lookup failure when durable state belongs to a different daemon lifetime. */
export function daemonIdentityMismatch(args: {
  message: string;
  requestId?: string;
  diagnostics?: StudioBoundedDiagnostics;
}): StudioRuntimeFailure {
  return studioFailure({
    tag: "DaemonIdentityMismatch",
    reason: "daemon-identity-mismatch",
    message: args.message,
    recoveryActions: ["retry-status", "copy-diagnostics"],
    ...(args.requestId === undefined ? {} : { requestId: args.requestId }),
    ...(args.diagnostics === undefined ? {} : { diagnostics: args.diagnostics }),
  });
}

/** Marks requests rejected after the process-local operation runtime has begun disposal. */
export function runtimeDisposed(args: {
  message: string;
  causeSummary?: string;
  diagnostics?: StudioBoundedDiagnostics;
}): StudioRuntimeFailure {
  return studioFailure({
    tag: "RuntimeDisposed",
    reason: "runtime-disposed",
    message: args.message,
    recoveryActions: ["check-dev-server", "retry-status", "copy-diagnostics"],
    dependency: "runtime",
    ...(args.causeSummary === undefined ? {} : { causeSummary: args.causeSummary }),
    ...(args.diagnostics === undefined ? {} : { diagnostics: args.diagnostics }),
  });
}

/** Captures durable records whose operation discriminator this runtime cannot adopt. */
export function unsupportedOperationType(args: {
  message: string;
  operationType: string;
  diagnostics?: StudioBoundedDiagnostics;
}): StudioRuntimeFailure {
  return studioFailure({
    tag: "UnsupportedOperationType",
    reason: "unsupported-operation-type",
    message: args.message,
    recoveryActions: ["copy-diagnostics"],
    operationType: args.operationType,
    ...(args.diagnostics === undefined ? {} : { diagnostics: args.diagnostics }),
  });
}

/** Describes admission denied by an already active mutually exclusive operation. */
export function operationBlocked(args: {
  message: string;
  activeRequestId?: string;
  activePhase?: string;
  diagnostics?: StudioBoundedDiagnostics;
}): StudioRuntimeFailure {
  return studioFailure({
    tag: "OperationBlocked",
    reason: "active-operation-conflict",
    message: args.message,
    recoveryActions: ["retry-status", "copy-diagnostics"],
    ...(args.activeRequestId === undefined ? {} : { activeRequestId: args.activeRequestId }),
    ...(args.activePhase === undefined ? {} : { activePhase: args.activePhase }),
    ...(args.diagnostics === undefined ? {} : { diagnostics: args.diagnostics }),
  });
}

/** Describes structural or path-jail admission rejection before mutation starts. */
export function invalidRequest(args: {
  message: string;
  reason?: Extract<StudioFailureReasonCode, "invalid-request" | "path-jail-rejection">;
  requestId?: string;
  diagnostics?: StudioBoundedDiagnostics;
}): StudioRuntimeFailure {
  return studioFailure({
    tag: "InvalidRequest",
    reason: args.reason ?? "invalid-request",
    message: args.message,
    recoveryActions: ["edit-config", "copy-diagnostics"],
    ...(args.requestId === undefined ? {} : { requestId: args.requestId }),
    ...(args.diagnostics === undefined ? {} : { diagnostics: args.diagnostics }),
  });
}

/** Describes a request identity absent from both live and durable operation state. */
export function operationNotFound(args: {
  message: string;
  requestId: string;
  diagnostics?: StudioBoundedDiagnostics;
}): StudioRuntimeFailure {
  return studioFailure({
    tag: "OperationNotFound",
    reason: "status-not-found",
    message: args.message,
    recoveryActions: ["retry-status", "copy-diagnostics"],
    requestId: args.requestId,
    ...(args.diagnostics === undefined ? {} : { diagnostics: args.diagnostics }),
  });
}

/** Captures an unavailable dependency while preserving bounded provider diagnostics. */
export function dependencyUnavailable(args: {
  message: string;
  reason?: Extract<
    StudioFailureReasonCode,
    "direct-control-unavailable" | "restart-failed" | "restart-unsupported"
  >;
  dependency?: StudioDependencyKind;
  directControlCode?: string;
  causeSummary?: string;
  diagnostics?: StudioBoundedDiagnostics;
  recoveryActions?: ReadonlyArray<StudioRecoveryAction>;
}): StudioRuntimeFailure {
  return studioFailure({
    tag: "DependencyUnavailable",
    reason: args.reason ?? "direct-control-unavailable",
    message: args.message,
    recoveryActions: args.recoveryActions ?? ["check-dev-server", "copy-diagnostics"],
    ...(args.dependency === undefined ? {} : { dependency: args.dependency }),
    ...(args.directControlCode === undefined ? {} : { directControlCode: args.directControlCode }),
    ...(args.causeSummary === undefined ? {} : { causeSummary: args.causeSummary }),
    ...(args.diagnostics === undefined ? {} : { diagnostics: args.diagnostics }),
  });
}

/** Marks artifact generation incomplete when required materialization evidence is missing. */
export function materializationFailed(args: {
  message: string;
  reason?: Extract<StudioFailureReasonCode, "materialization-evidence-missing">;
  diagnostics?: StudioBoundedDiagnostics;
}): StudioRuntimeFailure {
  return studioFailure({
    tag: "MaterializationFailed",
    reason: args.reason ?? "materialization-evidence-missing",
    message: args.message,
    recoveryActions: ["edit-config", "copy-diagnostics"],
    ...(args.diagnostics === undefined ? {} : { diagnostics: args.diagnostics }),
  });
}

/** Marks save, deploy, or rollback failure with recovery appropriate to the failed stage. */
export function deployFailed(args: {
  message: string;
  reason?: Extract<StudioFailureReasonCode, "deploy-failed" | "save-failed" | "rollback-failed">;
  diagnostics?: StudioBoundedDiagnostics;
  recoveryActions?: ReadonlyArray<StudioRecoveryAction>;
}): StudioRuntimeFailure {
  return studioFailure({
    tag: "DeployFailed",
    reason: args.reason ?? "deploy-failed",
    message: args.message,
    recoveryActions: args.recoveryActions ?? ["inspect-deploy-output", "copy-diagnostics"],
    ...(args.diagnostics === undefined ? {} : { diagnostics: args.diagnostics }),
  });
}

/** Marks a mutation outcome that could not be proven from runtime or authorship evidence. */
export function verificationFailed(args: {
  message: string;
  reason: Extract<
    StudioFailureReasonCode,
    "start-game-failed" | "log-evidence-missing" | "exact-authorship-mismatch" | "timeout-uncertain"
  >;
  diagnostics?: StudioBoundedDiagnostics;
  recoveryActions?: ReadonlyArray<StudioRecoveryAction>;
}): StudioRuntimeFailure {
  return studioFailure({
    tag: "VerificationFailed",
    reason: args.reason,
    message: args.message,
    recoveryActions: args.recoveryActions ?? ["retry-run", "copy-diagnostics"],
    ...(args.diagnostics === undefined ? {} : { diagnostics: args.diagnostics }),
  });
}

/** Captures a failed autoplay control command before its requested state is established. */
export function autoplayStartStopFailed(args: {
  message: string;
  reason: Extract<StudioFailureReasonCode, "start-failed" | "stop-failed">;
  diagnostics?: StudioBoundedDiagnostics;
}): StudioRuntimeFailure {
  return studioFailure({
    tag: "AutoplayStartStopFailed",
    reason: args.reason,
    message: args.message,
    recoveryActions: ["retry-status", "copy-diagnostics"],
    ...(args.diagnostics === undefined ? {} : { diagnostics: args.diagnostics }),
  });
}

/** Captures autoplay commands whose resulting state could not be verified. */
export function autoplayVerificationFailed(args: {
  message: string;
  diagnostics?: StudioBoundedDiagnostics;
}): StudioRuntimeFailure {
  return studioFailure({
    tag: "AutoplayVerificationFailed",
    reason: "verification-failed",
    message: args.message,
    recoveryActions: ["retry-status", "copy-diagnostics"],
    ...(args.diagnostics === undefined ? {} : { diagnostics: args.diagnostics }),
  });
}

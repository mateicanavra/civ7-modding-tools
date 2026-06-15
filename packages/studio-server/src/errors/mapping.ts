import type { ORPCError } from "@orpc/server";
import { ORPCError as ServerORPCError } from "@orpc/server";

import type {
  DependencyUnavailableData,
  StatusNotFoundData,
  StudioFailureData,
  UnexpectedDefectData,
} from "./errorData.js";
import type { StudioFailureTag, StudioOperationNamespace, StudioRuntimeFailure } from "./failure.js";
import { isStudioRuntimeFailure } from "./failure.js";

export const STUDIO_OPERATION_PROCEDURES = [
  "autoplay.command",
  "runInGame.start",
  "runInGame.status",
  "saveDeploy.start",
  "saveDeploy.status",
] as const;

export type StudioOperationProcedure = (typeof STUDIO_OPERATION_PROCEDURES)[number];

export type StudioDeclaredErrorCode =
  | "AUTOPLAY_BLOCKED"
  | "AUTOPLAY_INVALID"
  | "AUTOPLAY_UNAVAILABLE"
  | "AUTOPLAY_FAILED"
  | "RUN_IN_GAME_BLOCKED"
  | "RUN_IN_GAME_INVALID"
  | "RUN_IN_GAME_FAILED"
  | "RUN_IN_GAME_UNAVAILABLE"
  | "RUN_IN_GAME_STATUS_NOT_FOUND"
  | "SAVE_DEPLOY_BLOCKED"
  | "SAVE_DEPLOY_INVALID"
  | "SAVE_DEPLOY_UNAVAILABLE"
  | "SAVE_DEPLOY_FAILED"
  | "SAVE_DEPLOY_STATUS_NOT_FOUND";

export type StudioDefinedErrorProjection = Readonly<{
  code: StudioDeclaredErrorCode;
  status: 400 | 404 | 409 | 500 | 503;
  message: string;
  data?: StudioFailureData | StatusNotFoundData | DependencyUnavailableData | UnexpectedDefectData;
}>;

export type StudioDaemonIdentity = Readonly<{
  serverInstanceId: string;
  serverStartedAt: string;
}>;

const procedureNamespace = {
  "autoplay.command": "autoplay",
  "runInGame.start": "runInGame",
  "runInGame.status": "runInGame",
  "saveDeploy.start": "saveDeploy",
  "saveDeploy.status": "saveDeploy",
} as const satisfies Record<StudioOperationProcedure, StudioOperationNamespace>;

const namespaceCodes = {
  autoplay: {
    blocked: "AUTOPLAY_BLOCKED",
    invalid: "AUTOPLAY_INVALID",
    unavailable: "AUTOPLAY_UNAVAILABLE",
    failed: "AUTOPLAY_FAILED",
  },
  runInGame: {
    blocked: "RUN_IN_GAME_BLOCKED",
    invalid: "RUN_IN_GAME_INVALID",
    unavailable: "RUN_IN_GAME_UNAVAILABLE",
    failed: "RUN_IN_GAME_FAILED",
    statusNotFound: "RUN_IN_GAME_STATUS_NOT_FOUND",
  },
  saveDeploy: {
    blocked: "SAVE_DEPLOY_BLOCKED",
    invalid: "SAVE_DEPLOY_INVALID",
    unavailable: "SAVE_DEPLOY_UNAVAILABLE",
    failed: "SAVE_DEPLOY_FAILED",
    statusNotFound: "SAVE_DEPLOY_STATUS_NOT_FOUND",
  },
} as const;

function codeStatusFor(
  procedure: StudioOperationProcedure,
  tag: StudioFailureTag
): Pick<StudioDefinedErrorProjection, "code" | "status"> {
  const namespace = procedureNamespace[procedure];
  if (tag === "OperationBlocked") {
    return { code: namespaceCodes[namespace].blocked, status: 409 };
  }
  if (tag === "DependencyUnavailable" || tag === "RuntimeDisposed") {
    return { code: namespaceCodes[namespace].unavailable, status: 503 };
  }
  if (
    (tag === "OperationNotFound" ||
      tag === "OperationExpired" ||
      tag === "DaemonIdentityMismatch") &&
    procedure === "runInGame.status"
  ) {
    return { code: namespaceCodes.runInGame.statusNotFound, status: 404 };
  }
  if (
    (tag === "OperationNotFound" ||
      tag === "OperationExpired" ||
      tag === "DaemonIdentityMismatch") &&
    procedure === "saveDeploy.status"
  ) {
    return { code: namespaceCodes.saveDeploy.statusNotFound, status: 404 };
  }
  if (tag === "OperationNotFound") {
    throw new Error("OperationNotFound can only be mapped by status procedures.");
  }
  if (
    tag === "InvalidRequest" ||
    tag === "OperationExpired" ||
    tag === "DaemonIdentityMismatch" ||
    tag === "UnsupportedOperationType"
  ) {
    return { code: namespaceCodes[namespace].invalid, status: 400 };
  }
  return { code: namespaceCodes[namespace].failed, status: 500 };
}

export function mapStudioFailureToDefinedError(args: {
  failure: StudioRuntimeFailure;
  procedure: StudioOperationProcedure;
  identity?: StudioDaemonIdentity;
}): StudioDefinedErrorProjection {
  const namespace = procedureNamespace[args.procedure];
  const { code, status } = codeStatusFor(args.procedure, args.failure.tag);
  return {
    code,
    status,
    message: args.failure.message,
    data: failureData(args.failure, namespace, args.identity, status),
  };
}

export function mapUnexpectedDefectToDefinedError(args: {
  err: unknown;
  procedure: StudioOperationProcedure;
  fallbackMessage: string;
}): StudioDefinedErrorProjection & { data: UnexpectedDefectData } {
  const namespace = procedureNamespace[args.procedure];
  const message = args.err instanceof Error && args.err.message ? args.err.message : args.fallbackMessage;
  return {
    code: namespaceCodes[namespace].failed,
    status: 500,
    message,
    data: {
      tag: "UnexpectedDefect",
      namespace,
      message,
      recoveryActions: ["copy-diagnostics"],
      ...(args.err instanceof Error && args.err.name ? { causeName: args.err.name } : {}),
      ...(args.err instanceof Error && args.err.message ? { causeMessage: args.err.message } : {}),
    },
  };
}

export function mapUnknownToStudioDefinedError(args: {
  err: unknown;
  procedure: StudioOperationProcedure;
  fallbackMessage: string;
  identity?: StudioDaemonIdentity;
  dependencyUnavailable?: (err: unknown) => StudioRuntimeFailure | undefined;
}): StudioDefinedErrorProjection {
  if (isStudioRuntimeFailure(args.err)) {
    return mapStudioFailureToDefinedError({
      failure: args.err,
      procedure: args.procedure,
      identity: args.identity,
    });
  }
  const dependencyFailure = args.dependencyUnavailable?.(args.err);
  if (dependencyFailure) {
    return mapStudioFailureToDefinedError({
      failure: dependencyFailure,
      procedure: args.procedure,
      identity: args.identity,
    });
  }
  return mapUnexpectedDefectToDefinedError(args);
}

export function toStudioDefinedOrpcError(args: {
  err: unknown;
  procedure: StudioOperationProcedure;
  fallbackMessage: string;
  identity?: StudioDaemonIdentity;
  dependencyUnavailable?: (err: unknown) => StudioRuntimeFailure | undefined;
}): ORPCError<string, unknown> {
  const projected = mapUnknownToStudioDefinedError(args);
  return new ServerORPCError(projected.code, {
    status: projected.status,
    message: projected.message,
    ...(projected.data === undefined ? {} : { data: projected.data }),
  });
}

function failureData(
  failure: StudioRuntimeFailure,
  namespace: StudioOperationNamespace,
  identity: StudioDaemonIdentity | undefined,
  status: number
): StudioFailureData | StatusNotFoundData | DependencyUnavailableData {
  const base = {
    tag: failure.tag,
    namespace,
    reason: failure.reason,
    message: failure.message,
    recoveryActions: [...failure.recoveryActions],
    ...(failure.requestId === undefined ? {} : { requestId: failure.requestId }),
    ...(failure.activeRequestId === undefined ? {} : { activeRequestId: failure.activeRequestId }),
    ...(failure.activePhase === undefined ? {} : { activePhase: failure.activePhase }),
    ...(failure.operationType === undefined ? {} : { operationType: failure.operationType }),
    ...(failure.diagnostics === undefined ? {} : { diagnostics: failure.diagnostics }),
  };
  if (status === 404) {
    if (namespace === "autoplay") {
      throw new Error("Autoplay does not declare a status-not-found failure surface.");
    }
    if (!identity) {
      throw new Error(`${namespace} status-not-found mapping requires daemon identity.`);
    }
    if (!failure.requestId) {
      throw new Error(`${namespace} status-not-found mapping requires a request id.`);
    }
    return {
      ...base,
      requestId: failure.requestId,
      serverInstanceId: identity.serverInstanceId,
      serverStartedAt: identity.serverStartedAt,
    };
  }
  if (failure.tag === "DependencyUnavailable" || failure.tag === "RuntimeDisposed") {
    return {
      ...base,
      ...(failure.dependency === undefined ? {} : { dependency: failure.dependency }),
      ...(failure.directControlCode === undefined
        ? {}
        : { directControlCode: failure.directControlCode }),
      ...(failure.causeSummary === undefined ? {} : { causeSummary: failure.causeSummary }),
    };
  }
  return base;
}

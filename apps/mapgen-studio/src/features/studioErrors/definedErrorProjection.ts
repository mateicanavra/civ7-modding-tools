import { isDefinedError } from "@orpc/client";

export type StudioBrowserErrorDetails = Readonly<Record<string, unknown>>;

export type StudioBrowserErrorProjection<TDetails = StudioBrowserErrorDetails> = Readonly<{
  error: string;
  code?: string;
  statusCode?: number;
  observedAt?: string;
  details?: TDetails;
}>;

export function projectStudioBrowserError<TDetails = StudioBrowserErrorDetails>(
  error: unknown,
  fallbackMessage: string
): StudioBrowserErrorProjection<TDetails> {
  if (isDefinedError(error) || isOrpcErrorLike(error)) {
    return projectStudioBrowserDefinedError<TDetails>({
      code: error.code,
      message: error.message,
      statusCode: typeof error.status === "number" ? error.status : undefined,
      data: error.data,
      fallbackMessage,
    });
  }
  return {
    error: error instanceof Error && error.message ? error.message : fallbackMessage,
  };
}

export function projectStudioBrowserDefinedError<TDetails = StudioBrowserErrorDetails>(args: {
  code: string;
  message?: string;
  statusCode?: number;
  data?: unknown;
  fallbackMessage: string;
}): StudioBrowserErrorProjection<TDetails> {
  const data = isRecord(args.data) ? args.data : {};
  const diagnostics = isRecord(data.diagnostics) ? data.diagnostics : {};
  const details: Record<string, unknown> = { ...diagnostics };
  details.definedErrorCode = args.code;
  if (details.code === undefined) details.code = args.code;
  copyString(data, details, "tag", "failureTag");
  copyString(data, details, "reason");
  copyString(data, details, "requestId");
  copyString(data, details, "activeRequestId");
  copyString(data, details, "activePhase");
  copyString(data, details, "operationType");
  copyString(data, details, "safeFailureCategory");
  copyString(data, details, "diagnosticsId");
  copyString(data, details, "dependency");
  copyString(data, details, "directControlCode");
  copyString(data, details, "causeSummary");
  copyString(data, details, "serverInstanceId");
  copyString(data, details, "serverStartedAt");
  copyString(data, details, "observedAt");
  copyString(data, details, "message", "definedErrorMessage");
  if (Array.isArray(data.recoveryActions)) {
    details.recoveryActions = data.recoveryActions.filter(
      (action): action is string => typeof action === "string"
    );
  }
  if (args.statusCode !== undefined) details.statusCode = args.statusCode;

  const observedAt = typeof data.observedAt === "string" ? data.observedAt : undefined;
  return {
    error: args.message || args.fallbackMessage,
    code: args.code,
    ...(args.statusCode === undefined ? {} : { statusCode: args.statusCode }),
    ...(observedAt === undefined ? {} : { observedAt }),
    ...(Object.keys(details).length === 0 ? {} : { details: details as TDetails }),
  };
}

function copyString(
  source: Record<string, unknown>,
  target: Record<string, unknown>,
  sourceKey: string,
  targetKey = sourceKey
): void {
  const value = source[sourceKey];
  if (typeof value === "string") target[targetKey] = value;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === "object" && !Array.isArray(value);
}

function isOrpcErrorLike(value: unknown): value is {
  code: string;
  message?: string;
  status?: number;
  data?: unknown;
} {
  return isRecord(value) && typeof value.code === "string";
}

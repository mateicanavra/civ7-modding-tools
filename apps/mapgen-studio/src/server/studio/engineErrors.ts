export const STUDIO_ENGINE_FAILURE_KINDS = [
  "blocked",
  "invalid",
  "not-found",
  "unavailable",
  "failed",
] as const;

export type StudioEngineFailureKind = (typeof STUDIO_ENGINE_FAILURE_KINDS)[number];

export type StudioEngineFailureStatus = 400 | 404 | 409 | 500 | 503;

export type StudioEngineFailure = Readonly<{
  kind: StudioEngineFailureKind;
  statusCode: StudioEngineFailureStatus;
  message: string;
  details?: unknown;
}>;

function failureKindForStatus(statusCode: StudioEngineFailureStatus): StudioEngineFailureKind {
  switch (statusCode) {
    case 400:
      return "invalid";
    case 404:
      return "not-found";
    case 409:
      return "blocked";
    case 500:
      return "failed";
    case 503:
      return "unavailable";
  }
}

export function createStudioEngineFailure(
  statusCode: StudioEngineFailureStatus,
  message: string,
  details?: unknown,
): StudioEngineFailure {
  return {
    kind: failureKindForStatus(statusCode),
    statusCode,
    message,
    ...(details === undefined ? {} : { details }),
  };
}

export class StudioEngineError extends Error {
  readonly statusCode: StudioEngineFailureStatus;
  readonly details?: unknown;
  readonly failure: StudioEngineFailure;

  constructor(failure: StudioEngineFailure);
  constructor(
    statusCode: StudioEngineFailureStatus,
    message: string,
    details?: unknown,
  );
  constructor(
    statusOrFailure: StudioEngineFailureStatus | StudioEngineFailure,
    message?: string,
    details?: unknown,
  ) {
    const failure = typeof statusOrFailure === "number"
      ? createStudioEngineFailure(statusOrFailure, message ?? "Studio engine failed", details)
      : statusOrFailure;
    super(failure.message);
    this.name = "StudioEngineError";
    this.statusCode = failure.statusCode;
    this.details = failure.details;
    this.failure = failure;
  }
}

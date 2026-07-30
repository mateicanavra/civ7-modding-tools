import type {
  Civ7CommandDispatchStatus,
  Civ7DirectControlErrorCode,
} from "./direct-control-error-boundary.js";
import { errorMessage } from "./error-message.js";

export type {
  Civ7CommandDispatchStatus,
  Civ7DirectControlErrorCode,
} from "./direct-control-error-boundary.js";

/**
 * Carries a bounded machine-readable failure code across the direct-control boundary.
 *
 * The public code is safe for higher layers to classify. `message`, `cause`, and
 * `details` can contain endpoint or command evidence and must not cross a public
 * service boundary without an explicit projection.
 */
export class Civ7DirectControlError extends Error {
  readonly code: Civ7DirectControlErrorCode;
  readonly details?: unknown;
  readonly dispatchStatus?: Civ7CommandDispatchStatus;

  constructor(
    code: Civ7DirectControlErrorCode,
    message: string,
    options?: {
      cause?: unknown;
      details?: unknown;
      dispatchStatus?: Civ7CommandDispatchStatus;
    }
  ) {
    super(message, options?.cause !== undefined ? { cause: options.cause } : undefined);
    this.name = "Civ7DirectControlError";
    this.code = code;
    this.details = options?.details;
    if (options?.dispatchStatus !== undefined) {
      this.dispatchStatus = options.dispatchStatus;
    }
  }
}

export function directControlErrorWithDispatchStatus(
  cause: unknown,
  dispatchStatus: Civ7CommandDispatchStatus
): Civ7DirectControlError {
  if (cause instanceof Civ7DirectControlError) {
    return new Civ7DirectControlError(cause.code, cause.message, {
      cause,
      details: cause.details,
      dispatchStatus,
    });
  }
  return new Civ7DirectControlError("command-failed", errorMessage(cause), {
    cause,
    dispatchStatus,
  });
}

import type { Civ7DirectControlErrorCode } from "./direct-control-error-boundary.js";

export type { Civ7DirectControlErrorCode } from "./direct-control-error-boundary.js";

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

  constructor(
    code: Civ7DirectControlErrorCode,
    message: string,
    options?: { cause?: unknown; details?: unknown }
  ) {
    super(message, options?.cause !== undefined ? { cause: options.cause } : undefined);
    this.name = "Civ7DirectControlError";
    this.code = code;
    this.details = options?.details;
  }
}

export type Civ7DirectControlErrorCode =
  | "invalid-port"
  | "connection-timeout"
  | "connection-failed"
  | "response-timeout"
  | "socket-closed"
  | "state-not-found"
  | "no-hosts"
  | "all-hosts-unavailable"
  | "command-failed"
  | "log-timeout"
  | "setup-api-unavailable"
  | "setup-phase-invalid"
  | "setup-map-row-missing"
  | "setup-parameter-invalid"
  | "setup-apply-timeout"
  | "setup-readback-mismatch"
  | "setup-start-timeout"
  | "setup-seed-mismatch"
  | "setup-map-size-mismatch"
  | "setup-config-load-failed"
  | "setup-config-proof-missing"
  | "procedure-descriptor-invalid"
  | "procedure-call-failed"
  | "clean-frame-unverified"
  | "window-shot-helper-unavailable"
  | "window-shot-permission-required"
  | "window-shot-window-not-found"
  | "window-shot-failed";

export class Civ7DirectControlError extends Error {
  readonly code: Civ7DirectControlErrorCode;
  readonly details?: unknown;

  constructor(
    code: Civ7DirectControlErrorCode,
    message: string,
    options?: { cause?: unknown; details?: unknown },
  ) {
    super(message, options?.cause !== undefined ? { cause: options.cause } : undefined);
    this.name = "Civ7DirectControlError";
    this.code = code;
    this.details = options?.details;
  }
}

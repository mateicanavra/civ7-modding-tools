const CIV7_DIRECT_CONTROL_ERROR_CODES = [
  "invalid-port",
  "connection-timeout",
  "connection-failed",
  "response-timeout",
  "socket-closed",
  "state-not-found",
  "no-hosts",
  "all-hosts-unavailable",
  "command-failed",
  "log-timeout",
  "setup-api-unavailable",
  "setup-phase-invalid",
  "setup-phase-refused",
  "setup-map-row-missing",
  "setup-mod-reconciliation-failed",
  "setup-parameter-invalid",
  "setup-apply-timeout",
  "setup-readback-mismatch",
  "setup-start-timeout",
  "setup-host-rejected",
  "setup-seed-mismatch",
  "setup-map-size-mismatch",
  "setup-config-load-failed",
  "setup-config-evidence-missing",
  "procedure-descriptor-invalid",
  "procedure-call-failed",
  "clean-frame-unverified",
  "window-shot-helper-unavailable",
  "window-shot-permission-required",
  "window-shot-window-not-found",
  "window-shot-failed",
] as const;

const civ7DirectControlErrorCodes = new Set<string>(CIV7_DIRECT_CONTROL_ERROR_CODES);

/** Stable failure classifications emitted by the low-level Civ7 control boundary. */
export type Civ7DirectControlErrorCode = (typeof CIV7_DIRECT_CONTROL_ERROR_CODES)[number];

/** The bounded direct-control failure data that higher layers may safely classify. */
export type Civ7DirectControlErrorShape = Error &
  Readonly<{
    name: "Civ7DirectControlError";
    code: Civ7DirectControlErrorCode;
  }>;

/**
 * Recognizes the bounded direct-control failure shape without relying on package entry identity.
 *
 * ESM and CJS builds may load different class constructors, so the public boundary owns
 * the exact error name and admitted code set. Raw messages, causes, and details remain
 * outside this projection and must not cross a public service boundary.
 */
export function isCiv7DirectControlError(cause: unknown): cause is Civ7DirectControlErrorShape {
  if (!(cause instanceof Error) || cause.name !== "Civ7DirectControlError" || !("code" in cause)) {
    return false;
  }
  const code = cause.code;
  return typeof code === "string" && civ7DirectControlErrorCodes.has(code);
}

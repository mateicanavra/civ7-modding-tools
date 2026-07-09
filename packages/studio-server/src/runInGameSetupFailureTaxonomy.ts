import type { Civ7DirectControlErrorCode } from "@civ7/direct-control";

export const SETUP_FAILURE_REASONS = [
  "setup-map-row-not-visible",
  "setup-map-row-mismatched",
  "generated-map-mod-not-enabled",
  "setup-read-timeout",
  "tuner-unavailable",
  "direct-control-command-failed",
] as const;

export type SetupFailureReason = (typeof SETUP_FAILURE_REASONS)[number];

const TUNER_UNAVAILABLE_CODES = new Set<Civ7DirectControlErrorCode>([
  "all-hosts-unavailable",
  "connection-failed",
  "connection-timeout",
  "no-hosts",
  "response-timeout",
  "socket-closed",
  "state-not-found",
]);
const STUDIO_TUNER_UNAVAILABLE_CODES = new Set(["civ7-tuner-backoff"]);

const SETUP_ROW_NOT_VISIBLE_CODES = new Set<Civ7DirectControlErrorCode>([
  "setup-map-row-missing",
]);

const SETUP_READ_TIMEOUT_CODES = new Set<Civ7DirectControlErrorCode>([
  "log-timeout",
  "setup-apply-timeout",
  "setup-phase-invalid",
  "setup-start-timeout",
]);

const SETUP_MISMATCH_CODES = new Set<Civ7DirectControlErrorCode>([
  "setup-config-proof-missing",
  "setup-map-size-mismatch",
  "setup-readback-mismatch",
  "setup-seed-mismatch",
]);

export function isSetupFailureReason(value: unknown): value is SetupFailureReason {
  return (
    typeof value === "string" &&
    SETUP_FAILURE_REASONS.includes(value as SetupFailureReason)
  );
}

export function setupFailureReasonFromDirectControlCode(
  code: string | undefined
): SetupFailureReason {
  if (code === undefined) return "direct-control-command-failed";
  if (STUDIO_TUNER_UNAVAILABLE_CODES.has(code)) return "tuner-unavailable";
  if (TUNER_UNAVAILABLE_CODES.has(code as Civ7DirectControlErrorCode)) {
    return "tuner-unavailable";
  }
  if (SETUP_ROW_NOT_VISIBLE_CODES.has(code as Civ7DirectControlErrorCode)) {
    return "setup-map-row-not-visible";
  }
  if (SETUP_READ_TIMEOUT_CODES.has(code as Civ7DirectControlErrorCode)) {
    return "setup-read-timeout";
  }
  if (SETUP_MISMATCH_CODES.has(code as Civ7DirectControlErrorCode)) {
    return "setup-map-row-mismatched";
  }
  return "direct-control-command-failed";
}

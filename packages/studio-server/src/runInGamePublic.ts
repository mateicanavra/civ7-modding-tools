import { randomUUID } from "node:crypto";
import type { RunInGameSafeFailureCategory, StudioRuntimeFailure } from "@civ7/studio-contract";

const RUN_DIAGNOSTICS_ID_PREFIX = "run-diagnostics-";

export function createRunDiagnosticsId(): string {
  return `${RUN_DIAGNOSTICS_ID_PREFIX}${randomUUID()}`;
}

export function publicRunInGameFailureCategory(
  failure: StudioRuntimeFailure
): RunInGameSafeFailureCategory {
  switch (failure.tag) {
    case "OperationBlocked":
      return "ownership";
    case "InvalidRequest":
    case "OperationExpired":
    case "OperationNotFound":
    case "DaemonIdentityMismatch":
    case "UnsupportedOperationType":
      return "request-validation";
    case "MaterializationFailed":
      return "artifact-generation";
    case "DeployFailed":
      return "deployment";
    case "DependencyUnavailable":
      return failure.reason === "direct-control-unavailable" || failure.reason === "restart-failed"
        ? "runtime-control"
        : "dependency-unavailable";
    case "ProofFailed":
      return failure.reason === "start-game-failed" ? "runtime-control" : "runtime-observation";
    case "RuntimeDisposed":
      return "dependency-unavailable";
    case "AutoplayStartStopFailed":
    case "AutoplayVerificationFailed":
      return "internal-defect";
  }
}

export function publicRunInGameFailureMessage(category: RunInGameSafeFailureCategory): string {
  switch (category) {
    case "request-validation":
      return "Run in Game request could not be accepted.";
    case "ownership":
      return "Run in Game is blocked by another Studio operation.";
    case "dependency-unavailable":
      return "Run in Game dependency is unavailable.";
    case "artifact-generation":
      return "Run in Game artifact generation failed.";
    case "deployment":
      return "Run in Game deployment failed.";
    case "runtime-control":
      return "Run in Game runtime control failed.";
    case "runtime-observation":
      return "Run in Game runtime observation failed.";
    case "source-resolution":
      return "Run in Game source resolution failed.";
    case "attribution":
      return "Run in Game attribution failed.";
    case "cleanup":
      return "Run in Game cleanup failed.";
    case "operation-cancelled":
      return "Run in Game was cancelled.";
    case "internal-defect":
      return "Run in Game failed.";
  }
}

import type {
  DiagnosticAdapterFailureKind,
  DiagnosticFindingProjection,
  GritDiagnosticIdentity,
  InjectedProbeOutcome,
  InjectedProbeRefusalReason,
} from "../diagnostic-catalog/index.js";

export function probeRefused(
  reason: InjectedProbeRefusalReason,
  message: string
): InjectedProbeOutcome {
  return { kind: "probe-refused", reason, message };
}

export function probeAdapterFailed(
  failure: DiagnosticAdapterFailureKind,
  message: string
): InjectedProbeOutcome {
  return { kind: "probe-adapter-failed", failure, message };
}

export function probeProjectionMissed(
  expectedIdentity: GritDiagnosticIdentity,
  message: string
): InjectedProbeOutcome {
  return { kind: "probe-projection-missed", expectedIdentity, message };
}

export function probeCleanupFailed(
  finalStatus: "dirty" | "not-restored",
  observedFinding: DiagnosticFindingProjection | undefined,
  message: string
): InjectedProbeOutcome {
  return { kind: "probe-cleanup-failed", finalStatus, observedFinding, message };
}

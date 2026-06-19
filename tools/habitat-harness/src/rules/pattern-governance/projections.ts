import { Value } from "typebox/value";
import {
  type ApplyAdmissionProjection,
  ApplyAdmissionProjectionSchema,
  type CandidateHandoffProjection,
  CandidateHandoffProjectionSchema,
  type DiagnosticAdmissionProjection,
  DiagnosticAdmissionProjectionSchema,
  type LocalFeedbackAdmissionProjection,
  LocalFeedbackAdmissionProjectionSchema,
  type PatternAuthorityProjection,
  PatternAuthorityProjectionSchema,
  type PatternAuthorityState,
  type PatternRecoveryProjection,
  PatternRecoveryProjectionSchema,
} from "./schema.js";

export function patternAuthorityProjection(
  state: PatternAuthorityState
): PatternAuthorityProjection {
  switch (state.kind) {
    case "candidate-draft":
      return parseAuthorityProjection({
        patternId: state.candidate.ruleId,
        manifestPath: state.candidate.candidateArtifacts.manifestPath,
        lifecycle: state.kind,
        admittedCapabilities: [],
      });
    case "candidate-under-review":
      return parseAuthorityProjection({
        patternId: state.candidate.ruleId,
        lifecycle: state.kind,
        admittedCapabilities: [],
      });
    case "manifest-invalid-candidate":
    case "refused":
      return parseAuthorityProjection({
        patternId: state.refusal.patternId ?? state.refusal.path,
        lifecycle: state.kind,
        admittedCapabilities: [],
        refusalReason: state.refusal.reason,
      });
    case "diagnostic-admitted":
      return parseAuthorityProjection({
        patternId: state.admission.patternId,
        manifestPath: state.admission.manifestPath,
        lifecycle: state.kind,
        admittedCapabilities: ["diagnostic"],
      });
    case "local-feedback-admitted":
      return parseAuthorityProjection({
        patternId: state.admission.patternId,
        manifestPath: state.admission.manifestPath,
        lifecycle: state.kind,
        admittedCapabilities: ["diagnostic", "local-feedback"],
      });
    case "apply-admitted":
      return parseAuthorityProjection({
        patternId: state.admission.patternId,
        manifestPath: state.admission.manifestPath,
        lifecycle: state.kind,
        admittedCapabilities: ["apply"],
      });
    case "retired":
      return parseAuthorityProjection({
        patternId: state.retirement.patternId,
        manifestPath: state.retirement.manifestPath,
        lifecycle: state.kind,
        admittedCapabilities: [],
        supersededBy: state.retirement.replacementPatternId,
      });
  }
}

export function diagnosticAdmissionProjection(
  state: PatternAuthorityState
): DiagnosticAdmissionProjection | undefined {
  return state.kind === "diagnostic-admitted"
    ? Value.Parse(DiagnosticAdmissionProjectionSchema, state.admission)
    : undefined;
}

export function localFeedbackAdmissionProjection(
  state: PatternAuthorityState
): LocalFeedbackAdmissionProjection | undefined {
  return state.kind === "local-feedback-admitted"
    ? Value.Parse(LocalFeedbackAdmissionProjectionSchema, state.admission)
    : undefined;
}

export function applyAdmissionProjection(
  state: PatternAuthorityState
): ApplyAdmissionProjection | undefined {
  return state.kind === "apply-admitted"
    ? Value.Parse(ApplyAdmissionProjectionSchema, state.admission)
    : undefined;
}

export function candidateHandoffProjection(
  state: PatternAuthorityState
): CandidateHandoffProjection | undefined {
  if (state.kind === "candidate-draft") {
    return Value.Parse(CandidateHandoffProjectionSchema, {
      kind: "candidate-handoff",
      patternId: state.candidate.ruleId,
      candidatePaths: state.candidate.candidateArtifacts,
      registrationPrerequisites: state.candidate.requiredForRegistration,
    });
  }
  if (state.kind === "manifest-invalid-candidate") {
    return Value.Parse(CandidateHandoffProjectionSchema, {
      kind: "candidate-handoff",
      patternId: state.refusal.patternId ?? state.refusal.path,
      candidatePaths: {
        patternPath: state.refusal.path,
        manifestPath: state.refusal.path,
      },
      registrationPrerequisites: ["repair Pattern Authority Manifest"],
      refusal: state.refusal,
    });
  }
  return undefined;
}

export function patternRecoveryProjection(
  state: PatternAuthorityState
): PatternRecoveryProjection | undefined {
  if (state.kind === "refused" || state.kind === "manifest-invalid-candidate") {
    return Value.Parse(PatternRecoveryProjectionSchema, {
      kind: "pattern-recovery",
      patternId: state.refusal.patternId ?? state.refusal.path,
      owner: "D8",
      reason: state.refusal.reason,
      nextAction: state.refusal.message,
      nonClaims: ["Recovery guidance does not create pattern admission."],
    });
  }
  if (state.kind === "retired") return state.retirement.recovery;
  return undefined;
}

function parseAuthorityProjection(value: Omit<PatternAuthorityProjection, never>) {
  return Value.Parse(PatternAuthorityProjectionSchema, value);
}

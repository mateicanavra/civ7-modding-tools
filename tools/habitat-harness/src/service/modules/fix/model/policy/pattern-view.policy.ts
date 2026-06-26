import { Value } from "typebox/value";
import {
  type ApplyAdmission,
  ApplyAdmissionSchema,
  type CandidateHandoff,
  CandidateHandoffSchema,
  type DiagnosticAdmission,
  DiagnosticAdmissionSchema,
  type PatternRecovery,
  PatternRecoverySchema,
  type PatternState,
  type PatternView,
  PatternViewSchema,
} from "../dto/pattern-management.schema.js";

export function patternView(state: PatternState): PatternView {
  switch (state.kind) {
    case "candidate-draft":
      return parsePatternView({
        patternId: state.candidate.ruleId,
        manifestPath: state.candidate.candidateArtifacts.manifestPath,
        lifecycle: state.kind,
        admittedCapabilities: [],
      });
    case "candidate-under-review":
      return parsePatternView({
        patternId: state.candidate.ruleId,
        lifecycle: state.kind,
        admittedCapabilities: [],
      });
    case "manifest-invalid-candidate":
    case "refused":
      return parsePatternView({
        patternId: state.refusal.patternId ?? state.refusal.path,
        lifecycle: state.kind,
        admittedCapabilities: [],
        refusalReason: state.refusal.reason,
      });
    case "diagnostic-admitted":
      return parsePatternView({
        patternId: state.admission.patternId,
        manifestPath: state.admission.manifestPath,
        lifecycle: state.kind,
        admittedCapabilities: ["diagnostic"],
      });
    case "apply-admitted":
      return parsePatternView({
        patternId: state.admission.patternId,
        manifestPath: state.admission.manifestPath,
        lifecycle: state.kind,
        admittedCapabilities: ["apply"],
      });
    case "retired":
      return parsePatternView({
        patternId: state.retirement.patternId,
        manifestPath: state.retirement.manifestPath,
        lifecycle: state.kind,
        admittedCapabilities: [],
        supersededBy: state.retirement.replacementPatternId,
      });
  }
}

export function diagnosticAdmission(state: PatternState): DiagnosticAdmission | undefined {
  return state.kind === "diagnostic-admitted"
    ? Value.Parse(DiagnosticAdmissionSchema, state.admission)
    : undefined;
}

export function applyAdmission(state: PatternState): ApplyAdmission | undefined {
  return state.kind === "apply-admitted"
    ? Value.Parse(ApplyAdmissionSchema, state.admission)
    : undefined;
}

export function candidateHandoff(state: PatternState): CandidateHandoff | undefined {
  if (state.kind === "candidate-draft") {
    return Value.Parse(CandidateHandoffSchema, {
      kind: "candidate-handoff",
      patternId: state.candidate.ruleId,
      candidatePaths: state.candidate.candidateArtifacts,
      registrationPrerequisites: state.candidate.requiredForRegistration,
    });
  }
  if (state.kind === "manifest-invalid-candidate") {
    return Value.Parse(CandidateHandoffSchema, {
      kind: "candidate-handoff",
      patternId: state.refusal.patternId ?? state.refusal.path,
      candidatePaths: {
        patternPath: state.refusal.path,
        manifestPath: state.refusal.path,
      },
      registrationPrerequisites: ["repair pattern manifest"],
      refusal: state.refusal,
    });
  }
  return undefined;
}

export function patternRecovery(state: PatternState): PatternRecovery | undefined {
  if (state.kind === "refused" || state.kind === "manifest-invalid-candidate") {
    return Value.Parse(PatternRecoverySchema, {
      kind: "pattern-recovery",
      patternId: state.refusal.patternId ?? state.refusal.path,
      reason: state.refusal.reason,
      nextAction: state.refusal.message,
    });
  }
  if (state.kind === "retired") return state.retirement.recovery;
  return undefined;
}

function parsePatternView(value: Omit<PatternView, never>) {
  return Value.Parse(PatternViewSchema, value);
}

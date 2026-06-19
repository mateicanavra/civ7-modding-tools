import { Value } from "typebox/value";
import {
  type CandidatePatternAuthorityManifest,
  type PatternAdmissionRefusal,
  type PatternAuthorityState,
  type PatternRetirementDecision,
  PatternAuthorityStateSchema,
} from "./schema.js";

export function candidateDraftState(
  candidate: CandidatePatternAuthorityManifest
): PatternAuthorityState {
  return Value.Parse(PatternAuthorityStateSchema, { kind: "candidate-draft", candidate });
}

export function candidateUnderReviewState(input: {
  candidate: Pick<
    CandidatePatternAuthorityManifest,
    "ruleId" | "patternName" | "openspecChangeId" | "ownerProject" | "ownerTool"
  >;
  missingInputs: [string, ...string[]];
}): PatternAuthorityState {
  return Value.Parse(PatternAuthorityStateSchema, {
    kind: "candidate-under-review",
    candidate: input.candidate,
    missingInputs: input.missingInputs,
  });
}

export function invalidCandidateState(refusal: PatternAdmissionRefusal): PatternAuthorityState {
  return Value.Parse(PatternAuthorityStateSchema, {
    kind: "manifest-invalid-candidate",
    refusal,
  });
}

export function refusedPatternState(refusal: PatternAdmissionRefusal): PatternAuthorityState {
  return Value.Parse(PatternAuthorityStateSchema, { kind: "refused", refusal });
}

export function retiredPatternState(retirement: PatternRetirementDecision): PatternAuthorityState {
  return Value.Parse(PatternAuthorityStateSchema, { kind: "retired", retirement });
}

export function isAdmittedPatternState(state: PatternAuthorityState): boolean {
  return (
    state.kind === "diagnostic-admitted" ||
    state.kind === "local-feedback-admitted" ||
    state.kind === "apply-admitted"
  );
}

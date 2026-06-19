import { Value } from "typebox/value";
import {
  type CandidatePatternManifest,
  type PatternAdmissionRefusal,
  type PatternState,
  type PatternRetirementDecision,
  PatternStateSchema,
} from "./schema.js";

export function candidateDraftState(
  candidate: CandidatePatternManifest
): PatternState {
  return Value.Parse(PatternStateSchema, { kind: "candidate-draft", candidate });
}

export function candidateUnderReviewState(input: {
  candidate: Pick<
    CandidatePatternManifest,
    "ruleId" | "patternName" | "openspecChangeId" | "ownerProject" | "ownerTool"
  >;
  missingInputs: [string, ...string[]];
}): PatternState {
  return Value.Parse(PatternStateSchema, {
    kind: "candidate-under-review",
    candidate: input.candidate,
    missingInputs: input.missingInputs,
  });
}

export function invalidCandidateState(refusal: PatternAdmissionRefusal): PatternState {
  return Value.Parse(PatternStateSchema, {
    kind: "manifest-invalid-candidate",
    refusal,
  });
}

export function refusedPatternState(refusal: PatternAdmissionRefusal): PatternState {
  return Value.Parse(PatternStateSchema, { kind: "refused", refusal });
}

export function retiredPatternState(retirement: PatternRetirementDecision): PatternState {
  return Value.Parse(PatternStateSchema, { kind: "retired", retirement });
}

export function isAdmittedPatternState(state: PatternState): boolean {
  return (
    state.kind === "diagnostic-admitted" ||
    state.kind === "apply-admitted"
  );
}

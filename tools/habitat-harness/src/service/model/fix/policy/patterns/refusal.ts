import { Value } from "typebox/value";
import {
  type PatternAdmissionRefusal,
  type PatternAdmissionRefusalReason,
  PatternAdmissionRefusalSchema,
} from "./schema.js";

export function patternAdmissionRefusal(input: {
  reason: PatternAdmissionRefusalReason;
  path: string;
  message: string;
  protectedPaths?: string[];
}): PatternAdmissionRefusal {
  return Value.Parse(PatternAdmissionRefusalSchema, {
    kind: "pattern-admission-refusal",
    protectedPaths: input.protectedPaths ?? [],
    ...input,
  });
}

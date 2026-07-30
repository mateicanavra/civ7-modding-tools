import { Type } from "typebox";

import { base } from "../../../base";
import { toStandardSchema as standard } from "../../../schema/typebox-standard-schema";

const Civ7ProgressionTargetInputSchema = Type.Object(
  {
    node: Type.Integer({
      description: "Runtime progression node selected as the new research target.",
    }),
  },
  {
    additionalProperties: false,
    description: "Technology or culture progression target to submit.",
  }
);

const Civ7ProgressionTargetPostconditionClassificationSchema = Type.Union([
  Type.Literal("not-sent"),
  Type.Literal("pending-runtime-proof"),
  Type.Literal("missing-postcondition"),
]);

const Civ7ProgressionTargetProofOutcomeSchema = Type.Union([
  Type.Literal("not-sent"),
  Type.Literal("unknown"),
]);

const Civ7ProgressionTargetRequestStatusSchema = Type.Union([
  Type.Literal("not-sent"),
  Type.Literal("sent-unverified"),
]);

const Civ7ProgressionTargetValidationSummarySchema = Type.Object(
  {
    beforeValid: Type.Boolean({
      description: "Whether the target validated before the request.",
    }),
    afterValid: Type.Boolean({
      description: "Whether the target still validated after the request.",
    }),
  },
  {
    additionalProperties: false,
    description: "Validation evidence sampled around the target request.",
  }
);

const Civ7ProgressionTargetPostconditionSummarySchema = Type.Object(
  {
    classification: Civ7ProgressionTargetPostconditionClassificationSchema,
    reason: Type.String({
      description: "Evidence-based explanation for the postcondition classification.",
    }),
    outcome: Civ7ProgressionTargetProofOutcomeSchema,
    confidence: Type.Union([Type.Literal("unverified"), Type.Literal("pending-runtime-proof")], {
      description: "Strength of the evidence supporting the reported outcome.",
    }),
    confirmed: Type.Boolean({
      description: "Whether runtime evidence confirmed the target change.",
    }),
    noRepeatAfterUnverified: Type.Boolean({
      description: "Whether callers must avoid retrying until fresh evidence is read.",
    }),
  },
  {
    additionalProperties: false,
    description: "Postcondition evidence for a progression target mutation.",
  }
);

const Civ7ProgressionTechnologyTargetNextStepSchema = Type.Object(
  {
    kind: Type.Union([Type.Literal("do-not-repeat"), Type.Literal("inspect-progression-target")], {
      description: "Recommended follow-up category.",
    }),
    source: Type.Literal("progression.technology.target.request", {
      description: "Technology-target procedure that produced the recommendation.",
    }),
    label: Type.String({
      description: "Human-readable follow-up recommendation.",
    }),
  },
  { additionalProperties: false }
);

const Civ7ProgressionCultureTargetNextStepSchema = Type.Object(
  {
    kind: Type.Union([Type.Literal("do-not-repeat"), Type.Literal("inspect-progression-target")], {
      description: "Recommended follow-up category.",
    }),
    source: Type.Literal("progression.culture.target.request", {
      description: "Culture-target procedure that produced the recommendation.",
    }),
    label: Type.String({
      description: "Human-readable follow-up recommendation.",
    }),
  },
  { additionalProperties: false }
);

const Civ7ProgressionTechnologyTargetResultSchema = Type.Object(
  {
    playerId: Type.Integer({
      minimum: 0,
      description: "Runtime player identifier that submitted the technology target.",
    }),
    node: Type.Integer({
      description: "Runtime technology node submitted as the new target.",
    }),
    sent: Type.Boolean({
      description: "Whether the technology target was sent to the game runtime.",
    }),
    status: Civ7ProgressionTargetRequestStatusSchema,
    validation: Civ7ProgressionTargetValidationSummarySchema,
    postcondition: Civ7ProgressionTargetPostconditionSummarySchema,
    nextSteps: Type.Array(Civ7ProgressionTechnologyTargetNextStepSchema, {
      description: "Evidence-based follow-ups after the technology target request.",
    }),
  },
  {
    additionalProperties: false,
    description: "Technology target outcome and postcondition proof.",
  }
);

const Civ7ProgressionCultureTargetResultSchema = Type.Object(
  {
    playerId: Type.Integer({
      minimum: 0,
      description: "Runtime player identifier that submitted the culture target.",
    }),
    node: Type.Integer({
      description: "Runtime culture node submitted as the new target.",
    }),
    sent: Type.Boolean({
      description: "Whether the culture target was sent to the game runtime.",
    }),
    status: Civ7ProgressionTargetRequestStatusSchema,
    validation: Civ7ProgressionTargetValidationSummarySchema,
    postcondition: Civ7ProgressionTargetPostconditionSummarySchema,
    nextSteps: Type.Array(Civ7ProgressionCultureTargetNextStepSchema, {
      description: "Evidence-based follow-ups after the culture target request.",
    }),
  },
  {
    additionalProperties: false,
    description: "Culture target outcome and postcondition proof.",
  }
);

export const targetRequest = {
  technology: base
    .input(standard(Civ7ProgressionTargetInputSchema))
    .output(standard(Civ7ProgressionTechnologyTargetResultSchema))
    .meta({
      family: "progression",
      procedureKey: "progression.technology.target.request",
      proofBoundary: "local-package-test",
      risk: "mutation",
    }),
  culture: base
    .input(standard(Civ7ProgressionTargetInputSchema))
    .output(standard(Civ7ProgressionCultureTargetResultSchema))
    .meta({
      family: "progression",
      procedureKey: "progression.culture.target.request",
      proofBoundary: "local-package-test",
      risk: "mutation",
    }),
};

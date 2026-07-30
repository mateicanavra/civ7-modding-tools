import { Type } from "typebox";

import { base } from "../../../base";
import { toStandardSchema as standard } from "../../../schema/typebox-standard-schema";

const Civ7GovernmentChoiceInputSchema = Type.Object(
  {
    governmentType: Type.Integer({
      description: "Engine government type selected by the player.",
    }),
    action: Type.Optional(
      Type.Integer({
        description: "Optional engine action paired with the government selection.",
      })
    ),
  },
  { additionalProperties: false }
);

const Civ7GovernmentCelebrationChoiceInputSchema = Type.Object(
  {
    goldenAgeType: Type.Integer({
      description: "Engine golden-age type selected for the celebration.",
    }),
  },
  { additionalProperties: false }
);

const Civ7GovernmentChoicePostconditionClassificationSchema = Type.Union([
  Type.Literal("not-sent"),
  Type.Literal("pending-runtime-proof"),
  Type.Literal("missing-postcondition"),
]);

const Civ7GovernmentChoiceProofOutcomeSchema = Type.Union([
  Type.Literal("not-sent"),
  Type.Literal("unknown"),
]);

const Civ7GovernmentChoiceRequestStatusSchema = Type.Union([
  Type.Literal("not-sent"),
  Type.Literal("sent-unverified"),
]);

const Civ7GovernmentChoiceValidationSummarySchema = Type.Object(
  {
    beforeValid: Type.Boolean({
      description: "Whether the choice validated before the request.",
    }),
    afterValid: Type.Boolean({
      description: "Whether the choice still validates after the request.",
    }),
  },
  { additionalProperties: false }
);

const Civ7GovernmentChoicePostconditionSummarySchema = Type.Object(
  {
    classification: Civ7GovernmentChoicePostconditionClassificationSchema,
    reason: Type.String({
      description: "Evidence-based reason for the postcondition classification.",
    }),
    outcome: Civ7GovernmentChoiceProofOutcomeSchema,
    confidence: Type.Union([Type.Literal("unverified"), Type.Literal("pending-runtime-proof")], {
      description: "Confidence established by postcondition evidence.",
    }),
    confirmed: Type.Boolean({
      description: "Whether postcondition evidence confirms the choice outcome.",
    }),
    noRepeatAfterUnverified: Type.Boolean({
      description: "Whether an unverified send must not be repeated without fresh evidence.",
    }),
  },
  { additionalProperties: false }
);

const Civ7GovernmentChoiceNextStepSchema = Type.Object(
  {
    kind: Type.Union([Type.Literal("do-not-repeat"), Type.Literal("inspect-government-choice")], {
      description: "Recommended follow-up action for the government result.",
    }),
    source: Type.Literal("government.choice.request", {
      description: "Procedure that supplied the recommendation.",
    }),
    label: Type.String({
      description: "Human-readable follow-up recommendation.",
    }),
  },
  { additionalProperties: false }
);

const Civ7GovernmentCelebrationChoiceNextStepSchema = Type.Object(
  {
    kind: Type.Union([Type.Literal("do-not-repeat"), Type.Literal("inspect-government-choice")], {
      description: "Recommended follow-up action for the celebration result.",
    }),
    source: Type.Literal("government.celebration.choice.request", {
      description: "Procedure that supplied the recommendation.",
    }),
    label: Type.String({
      description: "Human-readable follow-up recommendation.",
    }),
  },
  { additionalProperties: false }
);

const Civ7GovernmentChoiceResultSchema = Type.Object(
  {
    playerId: Type.Integer({
      minimum: 0,
      description: "Local player that sent the government choice.",
    }),
    governmentType: Type.Integer({
      description: "Engine government type returned for the choice.",
    }),
    action: Type.Integer({
      description: "Engine action returned for the government choice.",
    }),
    sent: Type.Boolean({
      description: "Whether the government request was sent to the game runtime.",
    }),
    status: Civ7GovernmentChoiceRequestStatusSchema,
    validation: Civ7GovernmentChoiceValidationSummarySchema,
    postcondition: Civ7GovernmentChoicePostconditionSummarySchema,
    nextSteps: Type.Array(Civ7GovernmentChoiceNextStepSchema, {
      description: "Evidence-based follow-up actions.",
    }),
  },
  { additionalProperties: false }
);

const Civ7GovernmentCelebrationChoiceResultSchema = Type.Object(
  {
    playerId: Type.Integer({
      minimum: 0,
      description: "Local player that sent the celebration choice.",
    }),
    goldenAgeType: Type.Integer({
      description: "Engine golden-age type returned for the celebration choice.",
    }),
    sent: Type.Boolean({
      description: "Whether the celebration request was sent to the game runtime.",
    }),
    status: Civ7GovernmentChoiceRequestStatusSchema,
    validation: Civ7GovernmentChoiceValidationSummarySchema,
    postcondition: Civ7GovernmentChoicePostconditionSummarySchema,
    nextSteps: Type.Array(Civ7GovernmentCelebrationChoiceNextStepSchema, {
      description: "Evidence-based follow-up actions.",
    }),
  },
  { additionalProperties: false }
);

export const choiceRequest = {
  government: base
    .input(standard(Civ7GovernmentChoiceInputSchema))
    .output(standard(Civ7GovernmentChoiceResultSchema))
    .meta({
      family: "government",
      procedureKey: "government.choice.request",
      proofBoundary: "local-package-test",
      risk: "mutation",
    }),
  celebration: base
    .input(standard(Civ7GovernmentCelebrationChoiceInputSchema))
    .output(standard(Civ7GovernmentCelebrationChoiceResultSchema))
    .meta({
      family: "government",
      procedureKey: "government.celebration.choice.request",
      proofBoundary: "local-package-test",
      risk: "mutation",
    }),
};

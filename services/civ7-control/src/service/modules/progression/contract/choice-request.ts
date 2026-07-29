import { Type } from "typebox";

import { base } from "../../../base";
import { Civ7ControlOrpcComponentIdSchema } from "../../../model/dto/primitives";
import { toStandardSchema as standard } from "../../../schema/typebox-standard-schema";

const Civ7ProgressionChoiceInputSchema = Type.Object(
  {
    node: Type.Integer({
      description: "Runtime progression node selected as the new choice.",
    }),
    notificationId: Type.Optional(Civ7ControlOrpcComponentIdSchema),
  },
  {
    additionalProperties: false,
    description: "Technology or culture progression choice to submit.",
  }
);

const Civ7ProgressionChoicePostconditionClassificationSchema = Type.Union([
  Type.Literal("not-sent"),
  Type.Literal("pending-runtime-proof"),
  Type.Literal("turn-unblocked"),
  Type.Literal("technology-choice-cleared"),
  Type.Literal("technology-choice-transitioned"),
  Type.Literal("technology-state-changed-blocker-still-live"),
  Type.Literal("technology-choice-sticky-blocker"),
  Type.Literal("culture-choice-cleared"),
  Type.Literal("culture-choice-transitioned"),
  Type.Literal("culture-state-changed-blocker-still-live"),
  Type.Literal("culture-choice-sticky-blocker"),
]);

const Civ7ProgressionChoiceProofOutcomeSchema = Type.Union([
  Type.Literal("cleared"),
  Type.Literal("state-changed"),
  Type.Literal("still-blocked"),
  Type.Literal("no-state-change"),
  Type.Literal("not-sent"),
  Type.Literal("stale"),
  Type.Literal("unknown"),
]);

const Civ7ProgressionChoiceRequestStatusSchema = Type.Union([
  Type.Literal("not-sent"),
  Type.Literal("sent-confirmed"),
  Type.Literal("sent-unverified"),
]);

const Civ7ProgressionChoiceEvidenceSummarySchema = Type.Object(
  {
    beforeBlockerPresent: Type.Boolean({
      description: "Whether the matching progression blocker existed before the request.",
    }),
    afterReadStatus: Type.Union(
      [Type.Literal("read"), Type.Literal("failed"), Type.Literal("skipped-not-sent")],
      {
        description: "Availability of the post-request progression read.",
      }
    ),
    afterBlockerPresent: Type.Union([Type.Boolean(), Type.Null()], {
      description: "Whether the blocker remained afterward, or null when unreadable.",
    }),
    canEndTurnAfter: Type.Union([Type.Boolean(), Type.Null()], {
      description: "Whether the turn could end afterward, or null when unreadable.",
    }),
  },
  {
    additionalProperties: false,
    description: "Progression and turn evidence sampled around the choice request.",
  }
);

const Civ7ProgressionChoicePostconditionSummarySchema = Type.Object(
  {
    classification: Civ7ProgressionChoicePostconditionClassificationSchema,
    reason: Type.String({
      description: "Evidence-based explanation for the postcondition classification.",
    }),
    outcome: Civ7ProgressionChoiceProofOutcomeSchema,
    confidence: Type.Union(
      [
        Type.Literal("confirmed"),
        Type.Literal("unverified"),
        Type.Literal("pending-runtime-proof"),
      ],
      {
        description: "Strength of the evidence supporting the reported outcome.",
      }
    ),
    confirmed: Type.Boolean({
      description: "Whether runtime evidence confirmed the progression choice.",
    }),
    noRepeatAfterUnverified: Type.Boolean({
      description: "Whether callers must avoid retrying until fresh evidence is read.",
    }),
  },
  {
    additionalProperties: false,
    description: "Postcondition evidence for a progression choice mutation.",
  }
);

const Civ7ProgressionTechnologyChoiceNextStepSchema = Type.Object(
  {
    kind: Type.Union(
      [
        Type.Literal("refresh-attention"),
        Type.Literal("do-not-repeat"),
        Type.Literal("inspect-progression-choice"),
      ],
      {
        description: "Recommended follow-up category.",
      }
    ),
    source: Type.Literal("progression.technology.choice.request", {
      description: "Technology-choice procedure that produced the recommendation.",
    }),
    label: Type.String({
      description: "Human-readable follow-up recommendation.",
    }),
  },
  { additionalProperties: false }
);

const Civ7ProgressionCultureChoiceNextStepSchema = Type.Object(
  {
    kind: Type.Union(
      [
        Type.Literal("refresh-attention"),
        Type.Literal("do-not-repeat"),
        Type.Literal("inspect-progression-choice"),
      ],
      {
        description: "Recommended follow-up category.",
      }
    ),
    source: Type.Literal("progression.culture.choice.request", {
      description: "Culture-choice procedure that produced the recommendation.",
    }),
    label: Type.String({
      description: "Human-readable follow-up recommendation.",
    }),
  },
  { additionalProperties: false }
);

const Civ7ProgressionTechnologyChoiceResultSchema = Type.Object(
  {
    playerId: Type.Integer({
      minimum: 0,
      description: "Runtime player identifier that submitted the technology choice.",
    }),
    node: Type.Integer({
      description: "Runtime technology node submitted by the request.",
    }),
    notificationId: Type.Optional(Civ7ControlOrpcComponentIdSchema),
    sent: Type.Boolean({
      description: "Whether the technology choice was sent to the game runtime.",
    }),
    status: Civ7ProgressionChoiceRequestStatusSchema,
    evidence: Civ7ProgressionChoiceEvidenceSummarySchema,
    postcondition: Civ7ProgressionChoicePostconditionSummarySchema,
    nextSteps: Type.Array(Civ7ProgressionTechnologyChoiceNextStepSchema, {
      description: "Evidence-based follow-ups after the technology choice.",
    }),
  },
  {
    additionalProperties: false,
    description: "Technology choice outcome and postcondition proof.",
  }
);

const Civ7ProgressionCultureChoiceResultSchema = Type.Object(
  {
    playerId: Type.Integer({
      minimum: 0,
      description: "Runtime player identifier that submitted the culture choice.",
    }),
    node: Type.Integer({
      description: "Runtime culture node submitted by the request.",
    }),
    notificationId: Type.Optional(Civ7ControlOrpcComponentIdSchema),
    sent: Type.Boolean({
      description: "Whether the culture choice was sent to the game runtime.",
    }),
    status: Civ7ProgressionChoiceRequestStatusSchema,
    evidence: Civ7ProgressionChoiceEvidenceSummarySchema,
    postcondition: Civ7ProgressionChoicePostconditionSummarySchema,
    nextSteps: Type.Array(Civ7ProgressionCultureChoiceNextStepSchema, {
      description: "Evidence-based follow-ups after the culture choice.",
    }),
  },
  {
    additionalProperties: false,
    description: "Culture choice outcome and postcondition proof.",
  }
);

export const choiceRequest = {
  technology: base
    .input(standard(Civ7ProgressionChoiceInputSchema))
    .output(standard(Civ7ProgressionTechnologyChoiceResultSchema))
    .meta({
      family: "progression",
      procedureKey: "progression.technology.choice.request",
      proofBoundary: "local-package-test",
      risk: "mutation",
    }),
  culture: base
    .input(standard(Civ7ProgressionChoiceInputSchema))
    .output(standard(Civ7ProgressionCultureChoiceResultSchema))
    .meta({
      family: "progression",
      procedureKey: "progression.culture.choice.request",
      proofBoundary: "local-package-test",
      risk: "mutation",
    }),
};

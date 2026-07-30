import { Type } from "typebox";

import { base } from "../../../base";
import { toStandardSchema as standard } from "../../../schema/typebox-standard-schema";

const Civ7ProgressionAttributePurchaseInputSchema = Type.Object(
  {
    node: Type.Integer({
      description: "Runtime attribute node selected for purchase.",
    }),
  },
  {
    additionalProperties: false,
    description: "Player attribute purchase to submit.",
  }
);

const Civ7ProgressionPlayerReviewInputSchema = Type.Object(
  {},
  {
    additionalProperties: false,
    description: "Empty request that closes the current player progression review.",
  }
);

const Civ7ProgressionTraditionChangeInputSchema = Type.Object(
  {
    traditionType: Type.Integer({
      description: "Runtime tradition identifier selected for the change.",
    }),
    action: Type.Integer({
      description: "Runtime action identifier for activating or deactivating the tradition.",
    }),
  },
  {
    additionalProperties: false,
    description: "Tradition change to submit for the local player.",
  }
);

const Civ7ProgressionPlayerChoicePostconditionClassificationSchema = Type.Union([
  Type.Literal("not-sent"),
  Type.Literal("pending-runtime-proof"),
  Type.Literal("missing-postcondition"),
]);

const Civ7ProgressionPlayerChoiceProofOutcomeSchema = Type.Union([
  Type.Literal("not-sent"),
  Type.Literal("unknown"),
]);

const Civ7ProgressionPlayerChoiceRequestStatusSchema = Type.Union([
  Type.Literal("not-sent"),
  Type.Literal("sent-unverified"),
]);

const Civ7ProgressionPlayerChoiceValidationSummarySchema = Type.Object(
  {
    beforeValid: Type.Boolean({
      description: "Whether the player-choice mutation validated before the request.",
    }),
    afterValid: Type.Boolean({
      description: "Whether the same mutation still validated after the request.",
    }),
  },
  {
    additionalProperties: false,
    description: "Validation evidence sampled around the player-choice request.",
  }
);

const Civ7ProgressionPlayerChoicePostconditionSummarySchema = Type.Object(
  {
    classification: Civ7ProgressionPlayerChoicePostconditionClassificationSchema,
    reason: Type.String({
      description: "Evidence-based explanation for the postcondition classification.",
    }),
    outcome: Civ7ProgressionPlayerChoiceProofOutcomeSchema,
    confidence: Type.Union([Type.Literal("unverified"), Type.Literal("pending-runtime-proof")], {
      description: "Strength of the evidence supporting the reported outcome.",
    }),
    confirmed: Type.Boolean({
      description: "Whether runtime evidence confirmed the player-choice mutation.",
    }),
    noRepeatAfterUnverified: Type.Boolean({
      description: "Whether callers must avoid retrying until fresh evidence is read.",
    }),
  },
  {
    additionalProperties: false,
    description: "Postcondition evidence for a player progression mutation.",
  }
);

const Civ7ProgressionAttributePurchaseNextStepSchema = Type.Object(
  {
    kind: Type.Union(
      [Type.Literal("do-not-repeat"), Type.Literal("inspect-progression-attribute")],
      {
        description: "Recommended follow-up category.",
      }
    ),
    source: Type.Literal("progression.attribute.purchase.request", {
      description: "Attribute-purchase procedure that produced the recommendation.",
    }),
    label: Type.String({
      description: "Human-readable follow-up recommendation.",
    }),
  },
  { additionalProperties: false }
);

const Civ7ProgressionAttributeReviewNextStepSchema = Type.Object(
  {
    kind: Type.Union(
      [Type.Literal("do-not-repeat"), Type.Literal("inspect-progression-attribute")],
      {
        description: "Recommended follow-up category.",
      }
    ),
    source: Type.Literal("progression.attribute.review.request", {
      description: "Attribute-review procedure that produced the recommendation.",
    }),
    label: Type.String({
      description: "Human-readable follow-up recommendation.",
    }),
  },
  { additionalProperties: false }
);

const Civ7ProgressionTraditionChangeNextStepSchema = Type.Object(
  {
    kind: Type.Union(
      [Type.Literal("do-not-repeat"), Type.Literal("inspect-progression-tradition")],
      {
        description: "Recommended follow-up category.",
      }
    ),
    source: Type.Literal("progression.tradition.change.request", {
      description: "Tradition-change procedure that produced the recommendation.",
    }),
    label: Type.String({
      description: "Human-readable follow-up recommendation.",
    }),
  },
  { additionalProperties: false }
);

const Civ7ProgressionTraditionReviewNextStepSchema = Type.Object(
  {
    kind: Type.Union(
      [Type.Literal("do-not-repeat"), Type.Literal("inspect-progression-tradition")],
      {
        description: "Recommended follow-up category.",
      }
    ),
    source: Type.Literal("progression.tradition.review.request", {
      description: "Tradition-review procedure that produced the recommendation.",
    }),
    label: Type.String({
      description: "Human-readable follow-up recommendation.",
    }),
  },
  { additionalProperties: false }
);

const Civ7ProgressionPlayerChoiceResultBaseSchema = Type.Object(
  {
    playerId: Type.Integer({
      minimum: 0,
      description: "Runtime player identifier that submitted the progression mutation.",
    }),
    sent: Type.Boolean({
      description: "Whether the mutation was sent to the game runtime.",
    }),
    status: Civ7ProgressionPlayerChoiceRequestStatusSchema,
    validation: Civ7ProgressionPlayerChoiceValidationSummarySchema,
    postcondition: Civ7ProgressionPlayerChoicePostconditionSummarySchema,
  },
  {
    additionalProperties: false,
    description: "Fields shared by player progression mutation outcomes.",
  }
);

const Civ7ProgressionAttributePurchaseResultSchema = Type.Object(
  {
    ...Civ7ProgressionPlayerChoiceResultBaseSchema.properties,
    node: Type.Integer({
      description: "Runtime attribute node submitted for purchase.",
    }),
    nextSteps: Type.Array(Civ7ProgressionAttributePurchaseNextStepSchema, {
      description: "Evidence-based follow-ups after the attribute purchase.",
    }),
  },
  {
    additionalProperties: false,
    description: "Attribute purchase outcome and postcondition proof.",
  }
);

const Civ7ProgressionAttributeReviewResultSchema = Type.Object(
  {
    ...Civ7ProgressionPlayerChoiceResultBaseSchema.properties,
    nextSteps: Type.Array(Civ7ProgressionAttributeReviewNextStepSchema, {
      description: "Evidence-based follow-ups after closing attribute review.",
    }),
  },
  {
    additionalProperties: false,
    description: "Attribute review closeout outcome and postcondition proof.",
  }
);

const Civ7ProgressionTraditionChangeResultSchema = Type.Object(
  {
    ...Civ7ProgressionPlayerChoiceResultBaseSchema.properties,
    traditionType: Type.Integer({
      description: "Runtime tradition identifier submitted for the change.",
    }),
    action: Type.Integer({
      description: "Runtime action identifier submitted for the tradition.",
    }),
    nextSteps: Type.Array(Civ7ProgressionTraditionChangeNextStepSchema, {
      description: "Evidence-based follow-ups after the tradition change.",
    }),
  },
  {
    additionalProperties: false,
    description: "Tradition change outcome and postcondition proof.",
  }
);

const Civ7ProgressionTraditionReviewResultSchema = Type.Object(
  {
    ...Civ7ProgressionPlayerChoiceResultBaseSchema.properties,
    nextSteps: Type.Array(Civ7ProgressionTraditionReviewNextStepSchema, {
      description: "Evidence-based follow-ups after closing tradition review.",
    }),
  },
  {
    additionalProperties: false,
    description: "Tradition review closeout outcome and postcondition proof.",
  }
);

export const playerChoiceRequest = {
  attribute: {
    purchase: base
      .input(standard(Civ7ProgressionAttributePurchaseInputSchema))
      .output(standard(Civ7ProgressionAttributePurchaseResultSchema))
      .meta({
        family: "progression",
        procedureKey: "progression.attribute.purchase.request",
        proofBoundary: "local-package-test",
        risk: "mutation",
      }),
    review: base
      .input(standard(Civ7ProgressionPlayerReviewInputSchema))
      .output(standard(Civ7ProgressionAttributeReviewResultSchema))
      .meta({
        family: "progression",
        procedureKey: "progression.attribute.review.request",
        proofBoundary: "local-package-test",
        risk: "mutation",
      }),
  },
  tradition: {
    change: base
      .input(standard(Civ7ProgressionTraditionChangeInputSchema))
      .output(standard(Civ7ProgressionTraditionChangeResultSchema))
      .meta({
        family: "progression",
        procedureKey: "progression.tradition.change.request",
        proofBoundary: "local-package-test",
        risk: "mutation",
      }),
    review: base
      .input(standard(Civ7ProgressionPlayerReviewInputSchema))
      .output(standard(Civ7ProgressionTraditionReviewResultSchema))
      .meta({
        family: "progression",
        procedureKey: "progression.tradition.review.request",
        proofBoundary: "local-package-test",
        risk: "mutation",
      }),
  },
};

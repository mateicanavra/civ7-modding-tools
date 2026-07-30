import { Type } from "typebox";

import { base } from "../../../base";
import { Civ7ControlOrpcComponentIdSchema } from "../../../model/dto/primitives";
import { toStandardSchema as standard } from "../../../schema/typebox-standard-schema";

const Civ7NarrativeChoiceInputSchema = Type.Object(
  {
    targetType: Type.String({
      minLength: 1,
      description: "Runtime narrative target category used to route the choice.",
    }),
    target: Civ7ControlOrpcComponentIdSchema,
    action: Type.Integer({
      description: "Runtime action identifier for the selected narrative option.",
    }),
  },
  {
    additionalProperties: false,
    description: "Narrative option selected for a runtime target.",
  }
);

const Civ7NarrativeChoicePostconditionClassificationSchema = Type.Union([
  Type.Literal("not-sent"),
  Type.Literal("turn-unblocked"),
  Type.Literal("narrative-blocker-cleared"),
  Type.Literal("narrative-panel-cleared"),
  Type.Literal("validation-changed"),
  Type.Literal("no-state-change"),
  Type.Literal("missing-postcondition"),
]);

const Civ7NarrativeChoiceProofOutcomeSchema = Type.Union([
  Type.Literal("cleared"),
  Type.Literal("state-changed"),
  Type.Literal("still-blocked"),
  Type.Literal("no-state-change"),
  Type.Literal("not-sent"),
  Type.Literal("stale"),
  Type.Literal("unknown"),
]);

const Civ7NarrativeChoiceRequestStatusSchema = Type.Union([
  Type.Literal("not-sent"),
  Type.Literal("sent-confirmed"),
  Type.Literal("sent-unverified"),
]);

const Civ7NarrativeChoiceValidationSummarySchema = Type.Object(
  {
    beforeValid: Type.Boolean({
      description: "Whether the choice validated before the request.",
    }),
    afterValid: Type.Boolean({
      description: "Whether the same choice validated after the request.",
    }),
  },
  {
    additionalProperties: false,
    description: "Validation evidence sampled around the narrative request.",
  }
);

const Civ7NarrativeChoicePostconditionSummarySchema = Type.Object(
  {
    classification: Civ7NarrativeChoicePostconditionClassificationSchema,
    reason: Type.String({
      description: "Evidence-based explanation for the postcondition classification.",
    }),
    outcome: Civ7NarrativeChoiceProofOutcomeSchema,
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
      description: "Whether runtime evidence confirmed the requested state change.",
    }),
    noRepeatAfterUnverified: Type.Boolean({
      description: "Whether callers must avoid retrying until fresh evidence is read.",
    }),
  },
  {
    additionalProperties: false,
    description: "Postcondition evidence for the narrative choice mutation.",
  }
);

const Civ7NarrativeChoiceNextStepSchema = Type.Object(
  {
    kind: Type.Union(
      [
        Type.Literal("refresh-attention"),
        Type.Literal("do-not-repeat"),
        Type.Literal("inspect-narrative-choice"),
      ],
      {
        description: "Recommended follow-up category.",
      }
    ),
    source: Type.Literal("narrative.choice.request", {
      description: "Procedure that produced the recommendation.",
    }),
    label: Type.String({
      description: "Human-readable follow-up recommendation.",
    }),
  },
  { additionalProperties: false }
);

const Civ7NarrativeChoiceResultSchema = Type.Object(
  {
    playerId: Type.Integer({
      minimum: 0,
      description: "Runtime player identifier that submitted the choice.",
    }),
    targetType: Type.String({
      description: "Runtime narrative target category used for the request.",
    }),
    target: Civ7ControlOrpcComponentIdSchema,
    action: Type.Integer({
      description: "Runtime action identifier submitted for the narrative target.",
    }),
    sent: Type.Boolean({
      description: "Whether the narrative request was sent to the game runtime.",
    }),
    status: Civ7NarrativeChoiceRequestStatusSchema,
    validation: Civ7NarrativeChoiceValidationSummarySchema,
    postcondition: Civ7NarrativeChoicePostconditionSummarySchema,
    nextSteps: Type.Array(Civ7NarrativeChoiceNextStepSchema, {
      description: "Evidence-based follow-ups after the narrative request.",
    }),
  },
  {
    additionalProperties: false,
    description: "Narrative choice request outcome and postcondition proof.",
  }
);

export const choiceRequest = base
  .input(standard(Civ7NarrativeChoiceInputSchema))
  .output(standard(Civ7NarrativeChoiceResultSchema))
  .meta({
    family: "narrative",
    procedureKey: "narrative.choice.request",
    proofBoundary: "local-package-test",
    risk: "mutation",
  });

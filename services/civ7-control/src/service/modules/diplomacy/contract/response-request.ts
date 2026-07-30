import { Type } from "typebox";

import { Civ7ControlOrpcComponentIdSchema } from "#civ7-control-service/model/dto/primitives";
import { base } from "../../../base";
import { toStandardSchema as standard } from "../../../schema/typebox-standard-schema";

const Civ7DiplomacyResponseInputSchema = Type.Object(
  {
    actionId: Type.Integer({
      description: "Engine diplomacy action being answered.",
    }),
    responseType: Type.Integer({
      description: "Engine response selected for the diplomacy action.",
    }),
    notificationId: Type.Optional(Civ7ControlOrpcComponentIdSchema),
  },
  { additionalProperties: false }
);

const Civ7DiplomacyResponsePostconditionClassificationSchema = Type.Union([
  Type.Literal("not-sent"),
  Type.Literal("turn-unblocked"),
  Type.Literal("diplomacy-blocker-cleared"),
  Type.Literal("blocking-notification-changed"),
  Type.Literal("validation-changed"),
  Type.Literal("no-state-change"),
  Type.Literal("missing-postcondition"),
]);

const Civ7DiplomacyResponseProofOutcomeSchema = Type.Union([
  Type.Literal("cleared"),
  Type.Literal("state-changed"),
  Type.Literal("still-blocked"),
  Type.Literal("no-state-change"),
  Type.Literal("not-sent"),
  Type.Literal("stale"),
  Type.Literal("unknown"),
]);

const Civ7DiplomacyResponseRequestStatusSchema = Type.Union([
  Type.Literal("not-sent"),
  Type.Literal("sent-confirmed"),
  Type.Literal("sent-unverified"),
]);

const Civ7DiplomacyResponseValidationSummarySchema = Type.Object(
  {
    beforeValid: Type.Boolean({
      description: "Whether the diplomacy response validated before the request.",
    }),
    afterValid: Type.Boolean({
      description: "Whether the diplomacy response still validates after the request.",
    }),
  },
  { additionalProperties: false }
);

const Civ7DiplomacyResponsePostconditionSummarySchema = Type.Object(
  {
    classification: Civ7DiplomacyResponsePostconditionClassificationSchema,
    reason: Type.String({
      description: "Evidence-based reason for the postcondition classification.",
    }),
    outcome: Civ7DiplomacyResponseProofOutcomeSchema,
    confidence: Type.Union(
      [
        Type.Literal("confirmed"),
        Type.Literal("unverified"),
        Type.Literal("pending-runtime-proof"),
      ],
      {
        description: "Confidence established by postcondition evidence.",
      }
    ),
    confirmed: Type.Boolean({
      description: "Whether postcondition evidence confirms the diplomacy outcome.",
    }),
    noRepeatAfterUnverified: Type.Boolean({
      description: "Whether an unverified send must not be repeated without fresh evidence.",
    }),
  },
  { additionalProperties: false }
);

const Civ7DiplomacyResponseNextStepSchema = Type.Object(
  {
    kind: Type.Union(
      [
        Type.Literal("refresh-attention"),
        Type.Literal("do-not-repeat"),
        Type.Literal("inspect-diplomacy-response"),
      ],
      {
        description: "Recommended follow-up action for the diplomacy result.",
      }
    ),
    source: Type.Literal("diplomacy.response.request", {
      description: "Procedure that supplied the recommendation.",
    }),
    label: Type.String({
      description: "Human-readable follow-up recommendation.",
    }),
  },
  { additionalProperties: false }
);

const Civ7DiplomacyResponseResultSchema = Type.Object(
  {
    playerId: Type.Integer({
      minimum: 0,
      description: "Local player that sent the diplomacy response.",
    }),
    actionId: Type.Integer({
      description: "Engine diplomacy action that was answered.",
    }),
    responseType: Type.Integer({
      description: "Engine response selected for the diplomacy action.",
    }),
    notificationId: Type.Optional(Civ7ControlOrpcComponentIdSchema),
    sent: Type.Boolean({
      description: "Whether the response request was sent to the game runtime.",
    }),
    status: Civ7DiplomacyResponseRequestStatusSchema,
    validation: Civ7DiplomacyResponseValidationSummarySchema,
    postcondition: Civ7DiplomacyResponsePostconditionSummarySchema,
    nextSteps: Type.Array(Civ7DiplomacyResponseNextStepSchema, {
      description: "Evidence-based follow-up actions.",
    }),
  },
  { additionalProperties: false }
);

export const responseRequest = base
  .input(standard(Civ7DiplomacyResponseInputSchema))
  .output(standard(Civ7DiplomacyResponseResultSchema))
  .meta({
    family: "diplomacy",
    procedureKey: "diplomacy.response.request",
    proofBoundary: "local-package-test",
    risk: "mutation",
  });

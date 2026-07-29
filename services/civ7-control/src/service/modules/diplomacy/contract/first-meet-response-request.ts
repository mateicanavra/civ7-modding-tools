import { Type } from "typebox";

import { base } from "../../../base";
import { toStandardSchema as standard } from "../../../schema/typebox-standard-schema";

const Civ7FirstMeetResponseInputSchema = Type.Object(
  {
    metPlayerId: Type.Integer({
      minimum: 0,
      maximum: 1024,
      description: "Player encountered by the local player.",
    }),
    responseType: Type.Integer({
      description: "Engine response selected for the first-meet encounter.",
    }),
  },
  { additionalProperties: false }
);

const Civ7FirstMeetResponsePostconditionClassificationSchema = Type.Union([
  Type.Literal("not-sent"),
  Type.Literal("turn-unblocked"),
  Type.Literal("first-meet-cleared"),
  Type.Literal("first-meet-blocker-transitioned"),
  Type.Literal("first-meet-sticky-blocker"),
  Type.Literal("first-meet-blocker-unmatched"),
  Type.Literal("missing-postcondition"),
]);

const Civ7FirstMeetResponseProofOutcomeSchema = Type.Union([
  Type.Literal("cleared"),
  Type.Literal("state-changed"),
  Type.Literal("still-blocked"),
  Type.Literal("not-sent"),
  Type.Literal("unknown"),
]);

const Civ7FirstMeetResponseRequestStatusSchema = Type.Union([
  Type.Literal("not-sent"),
  Type.Literal("sent-confirmed"),
  Type.Literal("sent-unverified"),
]);

const Civ7FirstMeetResponseValidationSummarySchema = Type.Object(
  {
    beforeValid: Type.Boolean({
      description: "Whether the first-meet response validated before the request.",
    }),
    afterValid: Type.Boolean({
      description: "Whether the first-meet response still validates after the request.",
    }),
  },
  { additionalProperties: false }
);

const Civ7FirstMeetResponsePostconditionSummarySchema = Type.Object(
  {
    classification: Civ7FirstMeetResponsePostconditionClassificationSchema,
    reason: Type.String({
      description: "Evidence-based reason for the postcondition classification.",
    }),
    outcome: Civ7FirstMeetResponseProofOutcomeSchema,
    confidence: Type.Union([Type.Literal("confirmed"), Type.Literal("unverified")], {
      description: "Confidence established by postcondition evidence.",
    }),
    confirmed: Type.Boolean({
      description: "Whether postcondition evidence confirms the first-meet outcome.",
    }),
    noRepeatAfterUnverified: Type.Boolean({
      description: "Whether an unverified send must not be repeated without fresh evidence.",
    }),
  },
  { additionalProperties: false }
);

const Civ7FirstMeetResponseNextStepSchema = Type.Object(
  {
    kind: Type.Union(
      [
        Type.Literal("refresh-attention"),
        Type.Literal("do-not-repeat"),
        Type.Literal("inspect-first-meet-response"),
      ],
      {
        description: "Recommended follow-up action for the first-meet result.",
      }
    ),
    source: Type.Literal("diplomacy.firstMeet.response.request", {
      description: "Procedure that supplied the recommendation.",
    }),
    label: Type.String({
      description: "Human-readable follow-up recommendation.",
    }),
  },
  { additionalProperties: false }
);

const Civ7FirstMeetResponseResultSchema = Type.Object(
  {
    playerId: Type.Integer({
      minimum: 0,
      description: "Local player that sent the first-meet response.",
    }),
    metPlayerId: Type.Integer({
      minimum: 0,
      description: "Player encountered by the local player.",
    }),
    responseType: Type.Integer({
      description: "Engine response selected for the first-meet encounter.",
    }),
    sent: Type.Boolean({
      description: "Whether the response request was sent to the game runtime.",
    }),
    status: Civ7FirstMeetResponseRequestStatusSchema,
    validation: Civ7FirstMeetResponseValidationSummarySchema,
    postcondition: Civ7FirstMeetResponsePostconditionSummarySchema,
    nextSteps: Type.Array(Civ7FirstMeetResponseNextStepSchema, {
      description: "Evidence-based follow-up actions.",
    }),
  },
  { additionalProperties: false }
);

export const firstMeetResponseRequest = base
  .input(standard(Civ7FirstMeetResponseInputSchema))
  .output(standard(Civ7FirstMeetResponseResultSchema))
  .meta({
    family: "diplomacy",
    procedureKey: "diplomacy.firstMeet.response.request",
    proofBoundary: "local-package-test",
    risk: "mutation",
  });

import { type TSchema, Type } from "typebox";

import { base } from "../../../base";
import { toStandardSchema as standard } from "../../../schema/typebox-standard-schema";

const Civ7FirstMeetResponseNameSchema = Type.Union(
  [
    Type.Literal("friendly", {
      description: "Friendly first-meet greeting.",
    }),
    Type.Literal("neutral", {
      description: "Neutral first-meet greeting.",
    }),
    Type.Literal("unfriendly", {
      description: "Unfriendly first-meet greeting.",
    }),
  ],
  {
    description: "Named first-meet greeting exposed by the official Civ7 diplomacy surface.",
  }
);

const Civ7FirstMeetResponseInputSchema = Type.Object(
  {
    metPlayerId: Type.Integer({
      minimum: 0,
      description: "Player encountered by the ambient local player.",
    }),
    response: Civ7FirstMeetResponseNameSchema,
  },
  {
    additionalProperties: false,
    description:
      "Named first-meet greeting; the runtime supplies local-player identity and resolves its native response type.",
  }
);

const Civ7FirstMeetResponseCheckResultSchema = Type.Object(
  {
    metPlayerId: Type.Integer({
      minimum: 0,
      description: "Player encountered by the ambient local player.",
    }),
    response: Civ7FirstMeetResponseNameSchema,
    available: Type.Boolean({
      description: "Whether fresh native evidence admits the exact first-meet greeting.",
    }),
  },
  {
    additionalProperties: false,
    description: "Native availability for one named first-meet greeting.",
  }
);

const nextStepVariant = <
  const Kind extends "refresh-attention" | "do-not-repeat" | "inspect-first-meet-response",
>(
  kind: Kind
) =>
  Type.Array(
    Type.Object(
      {
        kind: Type.Literal(kind, {
          description: "Recommended follow-up action for the first-meet result.",
        }),
        source: Type.Literal("diplomacy.firstMeet.response.request", {
          description: "Procedure that supplied the recommendation.",
        }),
        label: Type.String({
          description: "Human-readable follow-up recommendation.",
        }),
      },
      { additionalProperties: false }
    ),
    {
      minItems: 1,
      maxItems: 1,
      description: "The single evidence-based follow-up action for this status.",
    }
  );

const inspectNextStep = nextStepVariant("inspect-first-meet-response");
const noRepeatNextStep = nextStepVariant("do-not-repeat");
const refreshNextStep = nextStepVariant("refresh-attention");

const confirmedPostcondition = Type.Object(
  {
    classification: Type.Literal("first-meet-cleared", {
      description:
        "The exact first-meet blocker observed before dispatch no longer occupies the blocking slot.",
    }),
    reason: Type.String({
      description: "Evidence-based reason for confirmed first-meet clearance.",
    }),
    outcome: Type.Literal("cleared", {
      description: "Semantic outcome of a confirmed first-meet greeting.",
    }),
    confidence: Type.Literal("confirmed", {
      description: "Evidence strength after exact blocker clearance is observed.",
    }),
    confirmed: Type.Literal(true, {
      description: "Whether runtime evidence confirmed consumption of the first-meet blocker.",
    }),
    noRepeatAfterUnverified: Type.Literal(false, {
      description: "Whether callers must avoid a repeat while evidence remains unverified.",
    }),
  },
  { additionalProperties: false }
);

const unverifiedPostconditionVariant = <
  const Classification extends
    | "not-sent"
    | "first-meet-still-active"
    | "first-meet-runtime-state-changed"
    | "missing-postcondition",
  const Outcome extends "not-sent" | "still-blocked" | "state-changed" | "unknown",
>(
  classification: Classification,
  outcome: Outcome
) =>
  Type.Object(
    {
      classification: Type.Literal(classification, {
        description: "Unverified classification for the first-meet greeting.",
      }),
      reason: Type.String({
        description: "Evidence-based reason for the first-meet classification.",
      }),
      outcome: Type.Literal(outcome, {
        description: "Semantic outcome supported by the available first-meet evidence.",
      }),
      confidence: Type.Literal("unverified", {
        description: "Evidence strength when runtime state did not confirm blocker clearance.",
      }),
      confirmed: Type.Literal(false, {
        description: "Whether runtime evidence confirmed consumption of the first-meet blocker.",
      }),
      noRepeatAfterUnverified: Type.Literal(true, {
        description: "Whether callers must avoid a repeat until fresh evidence is observed.",
      }),
    },
    {
      additionalProperties: false,
      description: "Guarded first-meet dispatch and semantic completion evidence.",
    }
  );

const notSentPostcondition = unverifiedPostconditionVariant("not-sent", "not-sent");
const stillActivePostcondition = unverifiedPostconditionVariant(
  "first-meet-still-active",
  "still-blocked"
);
const runtimeChangedPostcondition = unverifiedPostconditionVariant(
  "first-meet-runtime-state-changed",
  "state-changed"
);
const missingPostcondition = unverifiedPostconditionVariant("missing-postcondition", "unknown");

const resultVariant = <
  const Status extends "not-sent" | "dispatch-unknown" | "sent-confirmed" | "sent-unverified",
  PostconditionSchema extends TSchema,
  NextStepsSchema extends TSchema,
>(
  status: Status,
  postconditionSchema: PostconditionSchema,
  nextStepsSchema: NextStepsSchema
) =>
  Type.Object(
    {
      metPlayerId: Type.Integer({
        minimum: 0,
        description: "Player encountered by the ambient local player.",
      }),
      response: Civ7FirstMeetResponseNameSchema,
      status: Type.Literal(status, {
        description: "Service-level dispatch and verification status for the greeting.",
      }),
      postcondition: postconditionSchema,
      nextSteps: nextStepsSchema,
    },
    { additionalProperties: false }
  );

const Civ7FirstMeetResponseResultSchema = Type.Union([
  resultVariant("not-sent", notSentPostcondition, inspectNextStep),
  resultVariant("dispatch-unknown", confirmedPostcondition, refreshNextStep),
  resultVariant(
    "dispatch-unknown",
    Type.Union([stillActivePostcondition, runtimeChangedPostcondition, missingPostcondition]),
    noRepeatNextStep
  ),
  resultVariant("sent-confirmed", confirmedPostcondition, refreshNextStep),
  resultVariant(
    "sent-unverified",
    Type.Union([stillActivePostcondition, runtimeChangedPostcondition, missingPostcondition]),
    noRepeatNextStep
  ),
]);

/** Public native availability and guarded-mutation contracts for first-meet greetings. */
export const firstMeetResponse = {
  check: base
    .input(standard(Civ7FirstMeetResponseInputSchema))
    .output(standard(Civ7FirstMeetResponseCheckResultSchema))
    .meta({
      family: "diplomacy",
      procedureKey: "diplomacy.firstMeet.response.check",
      proofBoundary: "local-package-test",
      risk: "read-only",
    }),
  request: base
    .input(standard(Civ7FirstMeetResponseInputSchema))
    .output(standard(Civ7FirstMeetResponseResultSchema))
    .meta({
      family: "diplomacy",
      procedureKey: "diplomacy.firstMeet.response.request",
      proofBoundary: "local-package-test",
      risk: "mutation",
    }),
};

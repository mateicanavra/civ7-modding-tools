import { type TSchema, Type } from "typebox";

import { base } from "../../../base";
import { toStandardSchema as standard } from "../../../schema/typebox-standard-schema";

const Civ7DiplomacyResponseInputSchema = Type.Object(
  {
    actionId: Type.Integer({
      minimum: 0,
      description: "Native diplomatic action being answered.",
    }),
    responseType: Type.Integer({
      description: "Native response selected from the action's current offered-response list.",
    }),
  },
  {
    additionalProperties: false,
    description:
      "One ordinary diplomacy response; the runtime supplies ambient local-player identity.",
  }
);

const availabilityVariant = <
  const Available extends boolean,
  const Classification extends
    | "ordinary-response"
    | "dedicated-war-workflow-required"
    | "not-admitted",
>(
  available: Available,
  classification: Classification
) =>
  Type.Object(
    {
      actionId: Type.Integer({
        minimum: 0,
        description: "Native diplomatic action being inspected.",
      }),
      responseType: Type.Integer({
        description: "Native response being checked against the action's current offers.",
      }),
      available: Type.Literal(available, {
        description: "Whether fresh native evidence admits the ordinary response path.",
      }),
      classification: Type.Literal(classification, {
        description: "Why the response is available or refused by the ordinary-response service.",
      }),
    },
    { additionalProperties: false }
  );

const Civ7DiplomacyResponseCheckResultSchema = Type.Union([
  availabilityVariant(true, "ordinary-response"),
  availabilityVariant(false, "dedicated-war-workflow-required"),
  availabilityVariant(false, "not-admitted"),
]);

const nextStepVariant = <
  const Kind extends
    | "refresh-attention"
    | "do-not-repeat"
    | "inspect-diplomacy-response"
    | "use-war-confirmation",
>(
  kind: Kind
) =>
  Type.Array(
    Type.Object(
      {
        kind: Type.Literal(kind, {
          description: "Recommended follow-up action for the diplomacy result.",
        }),
        source: Type.Literal("diplomacy.response.request", {
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

const inspectNextStep = nextStepVariant("inspect-diplomacy-response");
const noRepeatNextStep = nextStepVariant("do-not-repeat");
const refreshNextStep = nextStepVariant("refresh-attention");
const warConfirmationNextStep = nextStepVariant("use-war-confirmation");

const notSentPostcondition = Type.Object(
  {
    classification: Type.Literal("not-sent", {
      description: "The ordinary response did not reach native dispatch.",
    }),
    reason: Type.String({
      description: "Evidence-based reason the ordinary response was not sent.",
    }),
    outcome: Type.Literal("not-sent", {
      description: "Semantic outcome for a response refused before dispatch.",
    }),
    confidence: Type.Literal("unverified", {
      description: "Evidence strength when no native response was dispatched.",
    }),
    confirmed: Type.Literal(false, {
      description: "Whether runtime evidence confirmed consumption of the diplomacy blocker.",
    }),
    noRepeatAfterUnverified: Type.Literal(true, {
      description: "Whether callers must await fresh evidence before another ordinary response.",
    }),
  },
  { additionalProperties: false }
);

const warConfirmationPostcondition = Type.Object(
  {
    classification: Type.Literal("war-confirmation-required", {
      description: "The response belongs to Civ7's dedicated war-confirmation workflow.",
    }),
    reason: Type.String({
      description: "Evidence-based reason the ordinary response path refused the request.",
    }),
    outcome: Type.Literal("requires-war-confirmation", {
      description: "Semantic outcome directing the caller to the dedicated war workflow.",
    }),
    confidence: Type.Literal("confirmed", {
      description: "Evidence strength for the native action and response discriminator match.",
    }),
    confirmed: Type.Literal(false, {
      description: "Whether the ordinary response service consumed the diplomacy blocker.",
    }),
    noRepeatAfterUnverified: Type.Literal(false, {
      description: "Whether uncertainty prevents the dedicated war workflow from proceeding.",
    }),
  },
  { additionalProperties: false }
);

const confirmedPostcondition = Type.Object(
  {
    classification: Type.Literal("diplomacy-response-cleared", {
      description: "The exact pre-dispatch diplomacy blocker no longer occupies the blocking slot.",
    }),
    reason: Type.String({
      description: "Evidence-based reason for confirmed diplomacy-response clearance.",
    }),
    outcome: Type.Literal("cleared", {
      description: "Semantic outcome after exact blocker clearance.",
    }),
    confidence: Type.Literal("confirmed", {
      description: "Evidence strength after exact blocker clearance is observed.",
    }),
    confirmed: Type.Literal(true, {
      description: "Whether runtime evidence confirmed consumption of the diplomacy blocker.",
    }),
    noRepeatAfterUnverified: Type.Literal(false, {
      description: "Whether callers must avoid a repeat while evidence remains unverified.",
    }),
  },
  { additionalProperties: false }
);

const unverifiedPostconditionVariant = <
  const Classification extends
    | "diplomacy-response-still-active"
    | "diplomacy-response-runtime-state-changed"
    | "missing-postcondition",
  const Outcome extends "still-blocked" | "state-changed" | "unknown",
>(
  classification: Classification,
  outcome: Outcome
) =>
  Type.Object(
    {
      classification: Type.Literal(classification, {
        description: "Unverified classification for the ordinary diplomacy response.",
      }),
      reason: Type.String({
        description: "Evidence-based reason for the diplomacy-response classification.",
      }),
      outcome: Type.Literal(outcome, {
        description: "Semantic outcome supported by the available diplomacy evidence.",
      }),
      confidence: Type.Literal("unverified", {
        description: "Evidence strength when runtime state did not confirm blocker clearance.",
      }),
      confirmed: Type.Literal(false, {
        description: "Whether runtime evidence confirmed consumption of the diplomacy blocker.",
      }),
      noRepeatAfterUnverified: Type.Literal(true, {
        description: "Whether callers must avoid a repeat until fresh evidence is observed.",
      }),
    },
    { additionalProperties: false }
  );

const stillActivePostcondition = unverifiedPostconditionVariant(
  "diplomacy-response-still-active",
  "still-blocked"
);
const runtimeChangedPostcondition = unverifiedPostconditionVariant(
  "diplomacy-response-runtime-state-changed",
  "state-changed"
);
const missingPostcondition = unverifiedPostconditionVariant("missing-postcondition", "unknown");
const unverifiedPostcondition = Type.Union([
  stillActivePostcondition,
  runtimeChangedPostcondition,
  missingPostcondition,
]);

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
      actionId: Type.Integer({
        minimum: 0,
        description: "Native diplomatic action that received the response.",
      }),
      responseType: Type.Integer({
        description: "Native response selected for the diplomatic action.",
      }),
      status: Type.Literal(status, {
        description: "Service-level dispatch and verification status for the response.",
      }),
      postcondition: postconditionSchema,
      nextSteps: nextStepsSchema,
    },
    { additionalProperties: false }
  );

const Civ7DiplomacyResponseResultSchema = Type.Union([
  resultVariant("not-sent", notSentPostcondition, inspectNextStep),
  resultVariant("not-sent", warConfirmationPostcondition, warConfirmationNextStep),
  resultVariant("dispatch-unknown", confirmedPostcondition, refreshNextStep),
  resultVariant("dispatch-unknown", unverifiedPostcondition, noRepeatNextStep),
  resultVariant("sent-confirmed", confirmedPostcondition, refreshNextStep),
  resultVariant("sent-unverified", unverifiedPostcondition, noRepeatNextStep),
]);

/** Public native availability and guarded-mutation contracts for ordinary diplomacy responses. */
export const response = {
  check: base
    .input(standard(Civ7DiplomacyResponseInputSchema))
    .output(standard(Civ7DiplomacyResponseCheckResultSchema))
    .meta({
      family: "diplomacy",
      procedureKey: "diplomacy.response.check",
      proofBoundary: "local-package-test",
      risk: "read-only",
    }),
  request: base
    .input(standard(Civ7DiplomacyResponseInputSchema))
    .output(standard(Civ7DiplomacyResponseResultSchema))
    .meta({
      family: "diplomacy",
      procedureKey: "diplomacy.response.request",
      proofBoundary: "local-package-test",
      risk: "mutation",
    }),
};

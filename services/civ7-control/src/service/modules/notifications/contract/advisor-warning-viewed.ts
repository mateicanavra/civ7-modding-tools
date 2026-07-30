import { type TSchema, Type } from "typebox";

import { base } from "../../../base";
import { Civ7ControlOrpcComponentIdSchema } from "../../../model/dto/primitives";
import { toStandardSchema as standard } from "../../../schema/typebox-standard-schema";

const Civ7NotificationAdvisorWarningViewedInputSchema = Type.Object(
  {
    target: Civ7ControlOrpcComponentIdSchema,
  },
  {
    additionalProperties: false,
    description: "Advisor-warning target to acknowledge as viewed.",
  }
);

const Civ7NotificationAdvisorWarningViewedCheckResultSchema = Type.Object(
  {
    target: Civ7ControlOrpcComponentIdSchema,
    available: Type.Boolean({
      description:
        "Whether fresh native evidence admits acknowledgement of the exact advisor warning.",
    }),
  },
  { additionalProperties: false }
);

const nextStep = <
  const Kind extends "refresh-attention" | "do-not-repeat" | "inspect-notification",
>(
  kind: Kind
) =>
  Type.Array(
    Type.Object(
      {
        kind: Type.Literal(kind, {
          description: "Recommended follow-up action for the advisor warning.",
        }),
        source: Type.Literal("notifications.advisorWarning.viewed.request", {
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

const inspectNextStep = nextStep("inspect-notification");
const noRepeatNextStep = nextStep("do-not-repeat");
const refreshNextStep = nextStep("refresh-attention");

const unverifiedPostcondition = <
  const Classification extends
    | "not-sent"
    | "advisor-warning-still-active"
    | "missing-postcondition",
  const Outcome extends "not-sent" | "still-active" | "unknown",
>(
  classification: Classification,
  outcome: Outcome
) =>
  Type.Object(
    {
      classification: Type.Literal(classification, {
        description: "Evidence classification for the unverified advisor-warning outcome.",
      }),
      reason: Type.String({
        description: "Evidence-based reason for the advisor-warning classification.",
      }),
      outcome: Type.Literal(outcome, {
        description: "Observed advisor-warning outcome after the acknowledgement attempt.",
      }),
      confidence: Type.Literal("unverified", {
        description: "Indicates that native evidence did not confirm warning clearance.",
      }),
      confirmed: Type.Literal(false, {
        description: "Whether native evidence confirmed advisor-warning clearance.",
      }),
      noRepeatAfterUnverified: Type.Literal(true, {
        description:
          "Whether callers must avoid repeating the acknowledgement without fresh evidence.",
      }),
    },
    { additionalProperties: false }
  );

const confirmedPostcondition = <
  const Classification extends "advisor-warning-disappeared" | "active-queue-removed",
>(
  classification: Classification
) =>
  Type.Object(
    {
      classification: Type.Literal(classification, {
        description: "Evidence classification for confirmed advisor-warning clearance.",
      }),
      reason: Type.String({
        description: "Evidence-based reason for confirmed advisor-warning clearance.",
      }),
      outcome: Type.Literal("cleared", {
        description: "Observed advisor-warning outcome after the acknowledgement.",
      }),
      confidence: Type.Literal("confirmed", {
        description: "Indicates that native evidence confirmed warning clearance.",
      }),
      confirmed: Type.Literal(true, {
        description: "Whether native evidence confirmed advisor-warning clearance.",
      }),
      noRepeatAfterUnverified: Type.Literal(false, {
        description:
          "Whether callers must avoid repeating the acknowledgement without fresh evidence.",
      }),
    },
    { additionalProperties: false }
  );

const notSentPostcondition = unverifiedPostcondition("not-sent", "not-sent");
const stillActivePostcondition = unverifiedPostcondition(
  "advisor-warning-still-active",
  "still-active"
);
const missingPostcondition = unverifiedPostcondition("missing-postcondition", "unknown");
const disappearedPostcondition = confirmedPostcondition("advisor-warning-disappeared");
const queueRemovedPostcondition = confirmedPostcondition("active-queue-removed");

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
      target: Civ7ControlOrpcComponentIdSchema,
      status: Type.Literal(status, {
        description:
          "Semantic acknowledgement status derived from native dispatch and clearance evidence.",
      }),
      postcondition: postconditionSchema,
      nextSteps: nextStepsSchema,
    },
    {
      additionalProperties: false,
      description: "Guarded advisor-warning acknowledgement and semantic proof.",
    }
  );

const Civ7NotificationAdvisorWarningViewedResultSchema = Type.Union([
  resultVariant("not-sent", notSentPostcondition, inspectNextStep),
  resultVariant(
    "dispatch-unknown",
    Type.Union([
      stillActivePostcondition,
      missingPostcondition,
      disappearedPostcondition,
      queueRemovedPostcondition,
    ]),
    noRepeatNextStep
  ),
  resultVariant(
    "sent-confirmed",
    Type.Union([disappearedPostcondition, queueRemovedPostcondition]),
    refreshNextStep
  ),
  resultVariant(
    "sent-unverified",
    Type.Union([stillActivePostcondition, missingPostcondition]),
    noRepeatNextStep
  ),
]);

export const advisorWarningViewed = {
  check: base
    .input(standard(Civ7NotificationAdvisorWarningViewedInputSchema))
    .output(standard(Civ7NotificationAdvisorWarningViewedCheckResultSchema))
    .meta({
      family: "notifications",
      procedureKey: "notifications.advisorWarning.viewed.check",
      proofBoundary: "local-package-test",
      risk: "read-only",
    }),
  request: base
    .input(standard(Civ7NotificationAdvisorWarningViewedInputSchema))
    .output(standard(Civ7NotificationAdvisorWarningViewedResultSchema))
    .meta({
      family: "notifications",
      procedureKey: "notifications.advisorWarning.viewed.request",
      proofBoundary: "local-package-test",
      risk: "mutation",
    }),
};

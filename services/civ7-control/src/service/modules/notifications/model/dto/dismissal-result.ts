import { type TSchema, Type } from "typebox";

import { Civ7ControlOrpcComponentIdSchema } from "../../../../model/dto/primitives";

const dismissalNextStep = <
  const Kind extends "refresh-attention" | "do-not-repeat" | "inspect-notification",
>(
  kind: Kind
) =>
  Type.Array(
    Type.Object(
      {
        kind: Type.Literal(kind, {
          description: "Recommended follow-up action for the notification dismissal.",
        }),
        source: Type.Literal("notifications.dismiss.request", {
          description: "Procedure that supplied the recommendation.",
        }),
        label: Type.String({
          description: "Human-readable follow-up recommendation.",
        }),
      },
      { additionalProperties: false }
    ),
    {
      description: "The single evidence-based follow-up action for this status.",
      minItems: 1,
      maxItems: 1,
    }
  );

const inspectNextStep = dismissalNextStep("inspect-notification");
const noRepeatNextStep = dismissalNextStep("do-not-repeat");
const refreshNextStep = dismissalNextStep("refresh-attention");

const unverifiedPostcondition = <
  const Classification extends "not-sent" | "missing-postcondition" | "notification-still-active",
  const Outcome extends "not-sent" | "unknown" | "still-active",
>(
  classification: Classification,
  outcome: Outcome
) =>
  Type.Object(
    {
      classification: Type.Literal(classification, {
        description: "Unverified classification for the notification dismissal.",
      }),
      reason: Type.String({
        description: "Evidence-based reason for the dismissal classification.",
      }),
      outcome: Type.Literal(outcome, {
        description: "Semantic outcome supported by the available notification evidence.",
      }),
      confidence: Type.Literal("unverified", {
        description: "Evidence strength when notification dismissal was not confirmed.",
      }),
      confirmed: Type.Literal(false, {
        description: "Whether available evidence confirms notification dismissal.",
      }),
      noRepeatAfterUnverified: Type.Literal(true, {
        description: "An unverified dismissal must not repeat until fresh evidence is read.",
      }),
    },
    { additionalProperties: false }
  );

const confirmedPostcondition = <
  const Classification extends
    | "notification-disappeared"
    | "active-queue-removed"
    | "notification-dismissed",
>(
  classification: Classification
) =>
  Type.Object(
    {
      classification: Type.Literal(classification, {
        description: "Confirmed classification for the notification dismissal.",
      }),
      reason: Type.String({
        description: "Evidence-based reason for the dismissal classification.",
      }),
      outcome: Type.Literal("cleared", {
        description: "Semantic outcome of confirmed notification dismissal.",
      }),
      confidence: Type.Literal("confirmed", {
        description: "Evidence strength after observing target-specific clearance.",
      }),
      confirmed: Type.Literal(true, {
        description: "Whether available evidence confirms notification dismissal.",
      }),
      noRepeatAfterUnverified: Type.Literal(false, {
        description: "Confirmed clearance does not require an unverified no-repeat guard.",
      }),
    },
    { additionalProperties: false }
  );

const notSentPostcondition = unverifiedPostcondition("not-sent", "not-sent");
const missingPostcondition = unverifiedPostcondition("missing-postcondition", "unknown");
const stillActivePostcondition = unverifiedPostcondition(
  "notification-still-active",
  "still-active"
);
const disappearedPostcondition = confirmedPostcondition("notification-disappeared");
const activeQueueRemovedPostcondition = confirmedPostcondition("active-queue-removed");
const dismissedPostcondition = confirmedPostcondition("notification-dismissed");

const resultVariant = <
  const Status extends "not-sent" | "dispatch-unknown" | "sent-confirmed" | "sent-unverified",
  PostconditionSchema extends TSchema,
  NextStepsSchema extends TSchema,
>(
  status: Status,
  postcondition: PostconditionSchema,
  nextSteps: NextStepsSchema
) =>
  Type.Object(
    {
      notificationId: Civ7ControlOrpcComponentIdSchema,
      status: Type.Literal(status, {
        description: "Service-level dispatch and verification status.",
      }),
      postcondition,
      nextSteps,
    },
    {
      additionalProperties: false,
      description: "Guarded notification dismissal outcome and semantic proof.",
    }
  );

/** Reusable public result schema shared by item and queue dismissal contracts. */
export const Civ7NotificationDismissalResultSchema = Type.Union([
  resultVariant("not-sent", notSentPostcondition, inspectNextStep),
  resultVariant(
    "dispatch-unknown",
    Type.Union([stillActivePostcondition, missingPostcondition]),
    noRepeatNextStep
  ),
  resultVariant(
    "sent-confirmed",
    Type.Union([disappearedPostcondition, activeQueueRemovedPostcondition, dismissedPostcondition]),
    refreshNextStep
  ),
  resultVariant(
    "sent-unverified",
    Type.Union([stillActivePostcondition, missingPostcondition]),
    noRepeatNextStep
  ),
]);

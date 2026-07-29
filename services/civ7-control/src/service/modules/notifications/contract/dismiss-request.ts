import { Type } from "typebox";

import { base } from "../../../base";
import { Civ7ControlOrpcComponentIdSchema } from "../../../model/dto/primitives";
import { toStandardSchema as standard } from "../../../schema/typebox-standard-schema";

const Civ7NotificationDismissInputSchema = Type.Object(
  {
    notificationId: Civ7ControlOrpcComponentIdSchema,
  },
  {
    additionalProperties: false,
    description: "Live notification selected for guarded dismissal.",
  }
);

const Civ7NotificationDismissalProofOutcomeSchema = Type.Union([
  Type.Literal("cleared"),
  Type.Literal("state-changed"),
  Type.Literal("still-blocked"),
  Type.Literal("no-state-change"),
  Type.Literal("not-sent"),
  Type.Literal("stale"),
  Type.Literal("unknown"),
]);

const Civ7NotificationDismissalRequestStatusSchema = Type.Union([
  Type.Literal("not-sent"),
  Type.Literal("sent-confirmed"),
  Type.Literal("sent-unverified"),
]);

const Civ7NotificationDismissalPostconditionClassificationSchema = Type.Union([
  Type.Literal("not-sent"),
  Type.Literal("missing-after"),
  Type.Literal("notification-disappeared"),
  Type.Literal("engine-front-still-live"),
  Type.Literal("notification-dismissed"),
  Type.Literal("engine-queue-cleared"),
  Type.Literal("notification-train-cleared"),
  Type.Literal("engine-front-moved"),
  Type.Literal("notification-train-front-moved"),
  Type.Literal("no-state-change"),
]);

const Civ7NotificationDismissalPostconditionSummarySchema = Type.Object(
  {
    classification: Type.Union(
      [
        Civ7NotificationDismissalPostconditionClassificationSchema,
        Type.Literal("missing-postcondition"),
      ],
      {
        description: "Observed notification state transition after the request.",
      }
    ),
    reason: Type.String({
      description: "Evidence-based explanation for the postcondition classification.",
    }),
    outcome: Civ7NotificationDismissalProofOutcomeSchema,
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
      description: "Whether runtime evidence confirmed the dismissal.",
    }),
    noRepeatAfterUnverified: Type.Boolean({
      description: "Whether callers must avoid retrying until fresh evidence is read.",
    }),
  },
  {
    additionalProperties: false,
    description: "Postcondition evidence for the notification dismissal.",
  }
);

const Civ7NotificationDismissalValidationSummarySchema = Type.Object(
  {
    beforeExists: Type.Boolean({
      description: "Whether the selected notification existed before the request.",
    }),
    canDismiss: Type.Boolean({
      description: "Whether runtime validation allowed the notification to be dismissed.",
    }),
    afterExists: Type.Union([Type.Boolean(), Type.Null()], {
      description: "Whether the notification existed afterward, or null when unreadable.",
    }),
  },
  {
    additionalProperties: false,
    description: "Notification existence and dismissal validation evidence.",
  }
);

const Civ7NotificationDismissalNextStepSchema = Type.Object(
  {
    kind: Type.Union(
      [
        Type.Literal("refresh-attention"),
        Type.Literal("do-not-repeat"),
        Type.Literal("inspect-notification"),
      ],
      {
        description: "Recommended follow-up category.",
      }
    ),
    source: Type.Literal("notifications.dismiss.request", {
      description: "Procedure that produced the recommendation.",
    }),
    label: Type.String({
      description: "Human-readable follow-up recommendation.",
    }),
  },
  { additionalProperties: false }
);

const Civ7NotificationDismissalResultSchema = Type.Object(
  {
    notificationId: Civ7ControlOrpcComponentIdSchema,
    sent: Type.Boolean({
      description: "Whether the dismissal was sent to the game runtime.",
    }),
    status: Civ7NotificationDismissalRequestStatusSchema,
    validation: Civ7NotificationDismissalValidationSummarySchema,
    postcondition: Civ7NotificationDismissalPostconditionSummarySchema,
    nextSteps: Type.Array(Civ7NotificationDismissalNextStepSchema, {
      description: "Evidence-based follow-ups after the dismissal attempt.",
    }),
  },
  {
    additionalProperties: false,
    description: "Notification dismissal outcome and postcondition proof.",
  }
);

export const dismissRequest = base
  .input(standard(Civ7NotificationDismissInputSchema))
  .output(standard(Civ7NotificationDismissalResultSchema))
  .meta({
    family: "notifications",
    procedureKey: "notifications.dismiss.request",
    proofBoundary: "local-package-test",
    risk: "mutation",
  });

import { Type } from "typebox";

import { base } from "../../../base";
import { Civ7ControlOrpcComponentIdSchema } from "../../../model/dto/primitives";
import { toStandardSchema as standard } from "../../../schema/typebox-standard-schema";

const Civ7NotificationQueueInputSchema = Type.Object(
  {
    maxNotifications: Type.Optional(
      Type.Integer({
        minimum: 1,
        maximum: 100,
        description: "Maximum number of live notifications to schedule.",
      })
    ),
  },
  {
    additionalProperties: false,
    description: "Limits for reading the current notification queue.",
  }
);

const Civ7NotificationQueueDismissInputSchema = Type.Object(
  {
    maxNotifications: Type.Optional(
      Type.Integer({
        minimum: 1,
        maximum: 100,
        description: "Maximum number of live notifications to inspect.",
      })
    ),
    maxDismissals: Type.Optional(
      Type.Integer({
        minimum: 1,
        maximum: 25,
        description: "Maximum number of eligible notifications to select for dismissal.",
      })
    ),
    send: Type.Optional(
      Type.Boolean({
        description: "Whether to send the selected dismissals instead of previewing them.",
      })
    ),
  },
  {
    additionalProperties: false,
    description: "Limits and send policy for reviewed queue dismissal.",
  }
);

const Civ7NotificationQueueDispositionSchema = Type.Union([
  Type.Literal("operate-with-live-inputs"),
  Type.Literal("reviewed-dismissal-candidate"),
  Type.Literal("inspect-ready-unit"),
  Type.Literal("inspect-handler"),
  Type.Literal("review-only"),
]);

const Civ7NotificationQueueNextStepSchema = Type.Object(
  {
    kind: Type.Union(
      [
        Type.Literal("inspect-ready-unit"),
        Type.Literal("inspect-ready-city"),
        Type.Literal("inspect-progression"),
        Type.Literal("inspect-decision"),
        Type.Literal("inspect-notification"),
        Type.Literal("validate-operation"),
        Type.Literal("dismiss-notification"),
        Type.Literal("observe"),
      ],
      {
        description: "Recommended semantic action for the queue item.",
      }
    ),
    source: Type.Literal("notifications.queue.current", {
      description: "Procedure that produced the queue recommendation.",
    }),
    label: Type.String({
      description: "Human-readable queue recommendation.",
    }),
    parameters: Type.Object(
      {
        notificationId: Type.Optional(Civ7ControlOrpcComponentIdSchema),
        category: Type.Optional(
          Type.String({
            description: "Notification category relevant to the recommendation.",
          })
        ),
        operationFamily: Type.Optional(
          Type.String({
            description: "Runtime operation family relevant to the recommendation.",
          })
        ),
        operationType: Type.Optional(
          Type.String({
            description: "Runtime operation type relevant to the recommendation.",
          })
        ),
      },
      {
        additionalProperties: false,
        description: "Structured inputs for the recommended follow-up.",
      }
    ),
  },
  { additionalProperties: false }
);

const Civ7NotificationQueueStepSchema = Type.Object(
  {
    step: Type.Integer({
      minimum: 1,
      description: "One-based execution order in the notification schedule.",
    }),
    priority: Type.Integer({
      minimum: 0,
      description: "Relative urgency assigned to the notification.",
    }),
    disposition: Civ7NotificationQueueDispositionSchema,
    notificationId: Type.Union([Civ7ControlOrpcComponentIdSchema, Type.Null()], {
      description: "Runtime notification identity, or null when unavailable.",
    }),
    isEndTurnBlocking: Type.Boolean({
      description: "Whether the notification currently blocks turn completion.",
    }),
    category: Type.String({
      description: "Semantic notification category.",
    }),
    typeName: Type.Union([Type.String(), Type.Null()], {
      description: "Runtime notification type name, or null when unavailable.",
    }),
    summary: Type.Union([Type.String(), Type.Null()], {
      description: "Concise notification summary, or null when unavailable.",
    }),
    message: Type.Union([Type.String(), Type.Null()], {
      description: "Notification message text, or null when unavailable.",
    }),
    operationFamily: Type.Optional(
      Type.String({
        description: "Runtime operation family exposed by the notification.",
      })
    ),
    operationType: Type.Optional(
      Type.String({
        description: "Runtime operation type exposed by the notification.",
      })
    ),
    requiredInputs: Type.Array(Type.String(), {
      description: "Input names required to resolve the notification.",
    }),
    nextStep: Type.Union([Civ7NotificationQueueNextStepSchema, Type.Null()], {
      description: "Recommended response, or null when no action is available.",
    }),
    safeToBatch: Type.Boolean({
      description: "Whether the item may be included in reviewed batch dismissal.",
    }),
    reason: Type.String({
      description: "Evidence-based explanation for the assigned disposition.",
    }),
    guardrails: Type.Array(Type.String(), {
      description: "Conditions that constrain action on the notification.",
    }),
  },
  {
    additionalProperties: false,
    description: "One prioritized notification and its guarded response.",
  }
);

const Civ7NotificationQueueResultSchema = Type.Object(
  {
    localPlayerId: Type.Union([Type.Integer({ minimum: 0 }), Type.Null()], {
      description: "Local runtime player identifier, or null when unavailable.",
    }),
    turn: Type.Unknown({
      description: "Raw turn observation supplied by the notification view.",
    }),
    turnDate: Type.Unknown({
      description: "Raw in-game date observation supplied by the notification view.",
    }),
    blocker: Type.Unknown({
      description: "Raw turn-blocker observation supplied by the notification view.",
    }),
    blockingNotificationId: Type.Union([Civ7ControlOrpcComponentIdSchema, Type.Null()], {
      description: "Current end-turn-blocking notification, or null when none is identified.",
    }),
    canEndTurn: Type.Unknown({
      description: "Raw turn-completion capability observation.",
    }),
    limits: Type.Unknown({
      description: "Effective queue limits reported by the runtime view.",
    }),
    queueLength: Type.Integer({
      minimum: 0,
      description: "Number of notifications represented by the schedule.",
    }),
    schedule: Type.Array(Civ7NotificationQueueStepSchema, {
      description: "Prioritized notification schedule.",
    }),
    nextSteps: Type.Array(Civ7NotificationQueueNextStepSchema, {
      description: "Highest-value follow-ups derived from the queue.",
    }),
    notes: Type.Array(Type.String(), {
      description: "Additional evidence and interpretation notes.",
    }),
  },
  {
    additionalProperties: false,
    description: "Current prioritized notification queue and recommended actions.",
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
        description: "Observed notification state transition after dismissal.",
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
  { additionalProperties: false }
);

const Civ7NotificationDismissalValidationSummarySchema = Type.Object(
  {
    beforeExists: Type.Boolean({
      description: "Whether the notification existed before dismissal.",
    }),
    canDismiss: Type.Boolean({
      description: "Whether runtime validation allowed dismissal.",
    }),
    afterExists: Type.Union([Type.Boolean(), Type.Null()], {
      description: "Whether the notification existed afterward, or null when unreadable.",
    }),
  },
  { additionalProperties: false }
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
      description: "Procedure that produced the dismissal recommendation.",
    }),
    label: Type.String({
      description: "Human-readable dismissal recommendation.",
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
  { additionalProperties: false }
);

const Civ7NotificationQueueExcludedSchema = Type.Object(
  {
    notificationId: Type.Union([Civ7ControlOrpcComponentIdSchema, Type.Null()], {
      description: "Runtime notification identity, or null when unavailable.",
    }),
    category: Type.String({
      description: "Semantic category of the excluded notification.",
    }),
    typeName: Type.Union([Type.String(), Type.Null()], {
      description: "Runtime notification type name, or null when unavailable.",
    }),
    summary: Type.Union([Type.String(), Type.Null()], {
      description: "Concise notification summary, or null when unavailable.",
    }),
    isEndTurnBlocking: Type.Boolean({
      description: "Whether the excluded notification blocks turn completion.",
    }),
    reason: Type.String({
      description: "Why the notification was excluded from reviewed dismissal.",
    }),
  },
  {
    additionalProperties: false,
    description: "Notification excluded from the reviewed dismissal set.",
  }
);

const Civ7NotificationQueueDismissStatusSchema = Type.Union([
  Type.Literal("not-sent"),
  Type.Literal("sent-confirmed"),
  Type.Literal("sent-guarded"),
]);

const Civ7NotificationQueueDismissPostconditionSchema = Type.Object(
  {
    classification: Type.Union(
      [
        Type.Literal("not-sent"),
        Type.Literal("all-selected-confirmed"),
        Type.Literal("selection-unverified"),
      ],
      {
        description: "Aggregate verification state for the selected dismissals.",
      }
    ),
    reason: Type.String({
      description: "Evidence-based explanation for the aggregate classification.",
    }),
    outcome: Type.Union(
      [Type.Literal("not-sent"), Type.Literal("cleared"), Type.Literal("unknown")],
      {
        description: "Aggregate outcome of the reviewed dismissal request.",
      }
    ),
    confidence: Type.Union([Type.Literal("confirmed"), Type.Literal("unverified")], {
      description: "Strength of evidence across all selected dismissals.",
    }),
    confirmed: Type.Boolean({
      description: "Whether every selected dismissal was confirmed.",
    }),
    noRepeatAfterUnverified: Type.Boolean({
      description: "Whether callers must avoid retrying until fresh evidence is read.",
    }),
  },
  {
    additionalProperties: false,
    description: "Aggregate postcondition for the reviewed dismissal request.",
  }
);

const Civ7NotificationQueueDismissResultSchema = Type.Object(
  {
    localPlayerId: Type.Union([Type.Integer({ minimum: 0 }), Type.Null()], {
      description: "Local runtime player identifier, or null when unavailable.",
    }),
    turn: Type.Unknown({
      description: "Raw turn observation used to select dismissal candidates.",
    }),
    turnDate: Type.Unknown({
      description: "Raw in-game date observation used to select candidates.",
    }),
    blocker: Type.Unknown({
      description: "Raw turn-blocker observation used to guard dismissals.",
    }),
    blockingNotificationId: Type.Union([Civ7ControlOrpcComponentIdSchema, Type.Null()], {
      description: "Current end-turn-blocking notification, or null when none is identified.",
    }),
    canEndTurn: Type.Unknown({
      description: "Raw turn-completion capability observation.",
    }),
    queueLength: Type.Integer({
      minimum: 0,
      description: "Number of notifications inspected for dismissal.",
    }),
    sent: Type.Boolean({
      description: "Whether any selected dismissals were sent to the game runtime.",
    }),
    status: Civ7NotificationQueueDismissStatusSchema,
    postcondition: Civ7NotificationQueueDismissPostconditionSchema,
    maxDismissals: Type.Integer({
      minimum: 1,
      description: "Effective maximum number of selected dismissals.",
    }),
    eligibleCount: Type.Integer({
      minimum: 0,
      description: "Number of notifications eligible for reviewed dismissal.",
    }),
    selectedCount: Type.Integer({
      minimum: 0,
      description: "Number of notifications selected for dismissal.",
    }),
    omittedEligibleCount: Type.Integer({
      minimum: 0,
      description: "Eligible notifications omitted because of the dismissal limit.",
    }),
    candidates: Type.Array(Civ7NotificationQueueStepSchema, {
      description: "Queue items selected as reviewed dismissal candidates.",
    }),
    excluded: Type.Array(Civ7NotificationQueueExcludedSchema, {
      description: "Notifications excluded from the reviewed dismissal set.",
    }),
    results: Type.Array(Civ7NotificationDismissalResultSchema, {
      description: "Individual outcomes for selected dismissal candidates.",
    }),
    noRepeatAfterUnverified: Type.Boolean({
      description: "Whether any unverified result forbids retrying without fresh evidence.",
    }),
    nextSteps: Type.Array(
      Type.Object(
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
          source: Type.Literal("notifications.queue.dismiss.request", {
            description: "Procedure that produced the recommendation.",
          }),
          label: Type.String({
            description: "Human-readable follow-up recommendation.",
          }),
        },
        { additionalProperties: false }
      ),
      {
        description: "Evidence-based follow-ups after reviewed dismissal.",
      }
    ),
    notes: Type.Array(Type.String(), {
      description: "Additional evidence and guardrail notes.",
    }),
  },
  {
    additionalProperties: false,
    description: "Selection, outcomes, and proof for reviewed notification dismissal.",
  }
);

export const queue = {
  current: base
    .input(standard(Civ7NotificationQueueInputSchema))
    .output(standard(Civ7NotificationQueueResultSchema))
    .meta({
      family: "notifications",
      procedureKey: "notifications.queue.current",
      proofBoundary: "local-package-test",
      risk: "read-only",
    }),
  dismiss: {
    request: base
      .input(standard(Civ7NotificationQueueDismissInputSchema))
      .output(standard(Civ7NotificationQueueDismissResultSchema))
      .meta({
        family: "notifications",
        procedureKey: "notifications.queue.dismiss.request",
        proofBoundary: "local-package-test",
        risk: "mutation",
      }),
  },
};

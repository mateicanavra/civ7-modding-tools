import type { ContractProcedure } from "@orpc/contract";
import { Type, type Static } from "typebox";

import { civ7ControlOrpcContractBase } from "../../contract-base";
import type { Civ7ControlOrpcErrorMap } from "../../errors";
import type { Civ7ControlOrpcProcedureMeta } from "../../metadata";
import { Civ7ControlOrpcComponentIdSchema } from "../../model/primitives";
import { toStandardSchema } from "../../typebox-standard-schema";

const Civ7NotificationDismissInputSchema = Type.Object(
  {
    notificationId: Civ7ControlOrpcComponentIdSchema,
  },
  { additionalProperties: false },
);
export type Civ7NotificationDismissInput = Static<
  typeof Civ7NotificationDismissInputSchema
>;

const Civ7NotificationDismissInputStandardSchema = toStandardSchema(
  Civ7NotificationDismissInputSchema,
);

const Civ7NotificationQueueInputSchema = Type.Object(
  {
    maxNotifications: Type.Optional(Type.Integer({ minimum: 1, maximum: 100 })),
  },
  { additionalProperties: false },
);
export type Civ7NotificationQueueInput = Static<
  typeof Civ7NotificationQueueInputSchema
>;

const Civ7NotificationQueueDismissInputSchema = Type.Object(
  {
    maxNotifications: Type.Optional(Type.Integer({ minimum: 1, maximum: 100 })),
    maxDismissals: Type.Optional(Type.Integer({ minimum: 1, maximum: 25 })),
    send: Type.Optional(Type.Boolean()),
  },
  { additionalProperties: false },
);
export type Civ7NotificationQueueDismissInput = Static<
  typeof Civ7NotificationQueueDismissInputSchema
>;

const Civ7NotificationQueueInputStandardSchema = toStandardSchema(
  Civ7NotificationQueueInputSchema,
);
const Civ7NotificationQueueDismissInputStandardSchema = toStandardSchema(
  Civ7NotificationQueueDismissInputSchema,
);

export const Civ7NotificationDismissalProofOutcomeSchema = Type.Union([
  Type.Literal("cleared"),
  Type.Literal("state-changed"),
  Type.Literal("still-blocked"),
  Type.Literal("no-state-change"),
  Type.Literal("not-sent"),
  Type.Literal("stale"),
  Type.Literal("unknown"),
]);

export const Civ7NotificationDismissalRequestStatusSchema = Type.Union([
  Type.Literal("not-sent"),
  Type.Literal("sent-confirmed"),
  Type.Literal("sent-unverified"),
]);

export const Civ7NotificationDismissalPostconditionClassificationSchema =
  Type.Union([
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

export const Civ7NotificationDismissalPostconditionSummarySchema = Type.Object(
  {
    classification: Type.Union([
      Civ7NotificationDismissalPostconditionClassificationSchema,
      Type.Literal("missing-postcondition"),
    ]),
    reason: Type.String(),
    outcome: Civ7NotificationDismissalProofOutcomeSchema,
    confidence: Type.Union([
      Type.Literal("confirmed"),
      Type.Literal("unverified"),
      Type.Literal("pending-runtime-proof"),
    ]),
    confirmed: Type.Boolean(),
    noRepeatAfterUnverified: Type.Boolean(),
  },
  { additionalProperties: false },
);

export const Civ7NotificationDismissalValidationSummarySchema = Type.Object(
  {
    beforeExists: Type.Boolean(),
    canDismiss: Type.Boolean(),
    afterExists: Type.Union([Type.Boolean(), Type.Null()]),
  },
  { additionalProperties: false },
);

export const Civ7NotificationDismissalNextStepSchema = Type.Object(
  {
    kind: Type.Union([
      Type.Literal("refresh-attention"),
      Type.Literal("do-not-repeat"),
      Type.Literal("inspect-notification"),
    ]),
    source: Type.Literal("notifications.dismiss.request"),
    label: Type.String(),
  },
  { additionalProperties: false },
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
    kind: Type.Union([
      Type.Literal("inspect-ready-unit"),
      Type.Literal("inspect-ready-city"),
      Type.Literal("inspect-progression"),
      Type.Literal("inspect-decision"),
      Type.Literal("inspect-notification"),
      Type.Literal("validate-operation"),
      Type.Literal("dismiss-notification"),
      Type.Literal("observe"),
    ]),
    source: Type.Literal("notifications.queue.current"),
    label: Type.String(),
    parameters: Type.Object(
      {
        notificationId: Type.Optional(Civ7ControlOrpcComponentIdSchema),
        category: Type.Optional(Type.String()),
        operationFamily: Type.Optional(Type.String()),
        operationType: Type.Optional(Type.String()),
      },
      { additionalProperties: false },
    ),
  },
  { additionalProperties: false },
);

const Civ7NotificationQueueStepSchema = Type.Object(
  {
    step: Type.Integer({ minimum: 1 }),
    priority: Type.Integer({ minimum: 0 }),
    disposition: Civ7NotificationQueueDispositionSchema,
    notificationId: Type.Union([Civ7ControlOrpcComponentIdSchema, Type.Null()]),
    isEndTurnBlocking: Type.Boolean(),
    category: Type.String(),
    typeName: Type.Union([Type.String(), Type.Null()]),
    summary: Type.Union([Type.String(), Type.Null()]),
    message: Type.Union([Type.String(), Type.Null()]),
    operationFamily: Type.Optional(Type.String()),
    operationType: Type.Optional(Type.String()),
    requiredInputs: Type.Array(Type.String()),
    nextStep: Type.Union([Civ7NotificationQueueNextStepSchema, Type.Null()]),
    safeToBatch: Type.Boolean(),
    reason: Type.String(),
    guardrails: Type.Array(Type.String()),
  },
  { additionalProperties: false },
);

const Civ7NotificationQueueResultSchema = Type.Object(
  {
    localPlayerId: Type.Union([Type.Integer({ minimum: 0 }), Type.Null()]),
    turn: Type.Unknown(),
    turnDate: Type.Unknown(),
    blocker: Type.Unknown(),
    blockingNotificationId: Type.Union([
      Civ7ControlOrpcComponentIdSchema,
      Type.Null(),
    ]),
    canEndTurn: Type.Unknown(),
    limits: Type.Unknown(),
    queueLength: Type.Integer({ minimum: 0 }),
    schedule: Type.Array(Civ7NotificationQueueStepSchema),
    nextSteps: Type.Array(Civ7NotificationQueueNextStepSchema),
    notes: Type.Array(Type.String()),
  },
  { additionalProperties: false },
);
export type Civ7NotificationQueueResult = Static<
  typeof Civ7NotificationQueueResultSchema
>;

const Civ7NotificationDismissalResultSchema = Type.Object(
  {
    notificationId: Civ7ControlOrpcComponentIdSchema,
    sent: Type.Boolean(),
    status: Civ7NotificationDismissalRequestStatusSchema,
    validation: Civ7NotificationDismissalValidationSummarySchema,
    postcondition: Civ7NotificationDismissalPostconditionSummarySchema,
    nextSteps: Type.Array(Civ7NotificationDismissalNextStepSchema),
  },
  { additionalProperties: false },
);
export type Civ7NotificationDismissalResult = Static<
  typeof Civ7NotificationDismissalResultSchema
>;

const Civ7NotificationQueueExcludedSchema = Type.Object(
  {
    notificationId: Type.Union([Civ7ControlOrpcComponentIdSchema, Type.Null()]),
    category: Type.String(),
    typeName: Type.Union([Type.String(), Type.Null()]),
    summary: Type.Union([Type.String(), Type.Null()]),
    isEndTurnBlocking: Type.Boolean(),
    reason: Type.String(),
  },
  { additionalProperties: false },
);

const Civ7NotificationQueueDismissStatusSchema = Type.Union([
  Type.Literal("not-sent"),
  Type.Literal("sent-confirmed"),
  Type.Literal("sent-guarded"),
]);

const Civ7NotificationQueueDismissPostconditionSchema = Type.Object(
  {
    classification: Type.Union([
      Type.Literal("not-sent"),
      Type.Literal("all-selected-confirmed"),
      Type.Literal("selection-unverified"),
    ]),
    reason: Type.String(),
    outcome: Type.Union([
      Type.Literal("not-sent"),
      Type.Literal("cleared"),
      Type.Literal("unknown"),
    ]),
    confidence: Type.Union([
      Type.Literal("confirmed"),
      Type.Literal("unverified"),
    ]),
    confirmed: Type.Boolean(),
    noRepeatAfterUnverified: Type.Boolean(),
  },
  { additionalProperties: false },
);

const Civ7NotificationQueueDismissResultSchema = Type.Object(
  {
    localPlayerId: Type.Union([Type.Integer({ minimum: 0 }), Type.Null()]),
    turn: Type.Unknown(),
    turnDate: Type.Unknown(),
    blocker: Type.Unknown(),
    blockingNotificationId: Type.Union([
      Civ7ControlOrpcComponentIdSchema,
      Type.Null(),
    ]),
    canEndTurn: Type.Unknown(),
    queueLength: Type.Integer({ minimum: 0 }),
    sent: Type.Boolean(),
    status: Civ7NotificationQueueDismissStatusSchema,
    postcondition: Civ7NotificationQueueDismissPostconditionSchema,
    maxDismissals: Type.Integer({ minimum: 1 }),
    eligibleCount: Type.Integer({ minimum: 0 }),
    selectedCount: Type.Integer({ minimum: 0 }),
    omittedEligibleCount: Type.Integer({ minimum: 0 }),
    candidates: Type.Array(Civ7NotificationQueueStepSchema),
    excluded: Type.Array(Civ7NotificationQueueExcludedSchema),
    results: Type.Array(Civ7NotificationDismissalResultSchema),
    noRepeatAfterUnverified: Type.Boolean(),
    nextSteps: Type.Array(Type.Object(
      {
        kind: Type.Union([
          Type.Literal("refresh-attention"),
          Type.Literal("do-not-repeat"),
          Type.Literal("inspect-notification"),
        ]),
        source: Type.Literal("notifications.queue.dismiss.request"),
        label: Type.String(),
      },
      { additionalProperties: false },
    )),
    notes: Type.Array(Type.String()),
  },
  { additionalProperties: false },
);
export type Civ7NotificationQueueDismissResult = Static<
  typeof Civ7NotificationQueueDismissResultSchema
>;

const Civ7NotificationDismissalResultStandardSchema = toStandardSchema(
  Civ7NotificationDismissalResultSchema,
);
const Civ7NotificationQueueResultStandardSchema = toStandardSchema(
  Civ7NotificationQueueResultSchema,
);
const Civ7NotificationQueueDismissResultStandardSchema = toStandardSchema(
  Civ7NotificationQueueDismissResultSchema,
);

export type Civ7NotificationDismissalContract = ContractProcedure<
  typeof Civ7NotificationDismissInputStandardSchema,
  typeof Civ7NotificationDismissalResultStandardSchema,
  Civ7ControlOrpcErrorMap,
  Civ7ControlOrpcProcedureMeta
>;

export const Civ7NotificationDismissalContract: Civ7NotificationDismissalContract =
  civ7ControlOrpcContractBase
    .input(Civ7NotificationDismissInputStandardSchema)
    .output(Civ7NotificationDismissalResultStandardSchema)
    .meta({
      family: "notifications",
      procedureKey: "notifications.dismiss.request",
      proofBoundary: "local-package-test",
      risk: "mutation",
    });

type Civ7NotificationQueueCurrentContract = ContractProcedure<
  typeof Civ7NotificationQueueInputStandardSchema,
  typeof Civ7NotificationQueueResultStandardSchema,
  Civ7ControlOrpcErrorMap,
  Civ7ControlOrpcProcedureMeta
>;

const Civ7NotificationQueueCurrentContract:
  Civ7NotificationQueueCurrentContract = civ7ControlOrpcContractBase
    .input(Civ7NotificationQueueInputStandardSchema)
    .output(Civ7NotificationQueueResultStandardSchema)
    .meta({
      family: "notifications",
      procedureKey: "notifications.queue.current",
      proofBoundary: "local-package-test",
      risk: "read-only",
    });

type Civ7NotificationQueueDismissContract = ContractProcedure<
  typeof Civ7NotificationQueueDismissInputStandardSchema,
  typeof Civ7NotificationQueueDismissResultStandardSchema,
  Civ7ControlOrpcErrorMap,
  Civ7ControlOrpcProcedureMeta
>;

const Civ7NotificationQueueDismissContract:
  Civ7NotificationQueueDismissContract = civ7ControlOrpcContractBase
    .input(Civ7NotificationQueueDismissInputStandardSchema)
    .output(Civ7NotificationQueueDismissResultStandardSchema)
    .meta({
      family: "notifications",
      procedureKey: "notifications.queue.dismiss.request",
      proofBoundary: "local-package-test",
      risk: "mutation",
    });

export type Civ7NotificationsContract = Readonly<{
  dismiss: Readonly<{
    request: Civ7NotificationDismissalContract;
  }>;
  queue: Readonly<{
    current: Civ7NotificationQueueCurrentContract;
    dismiss: Readonly<{
      request: Civ7NotificationQueueDismissContract;
    }>;
  }>;
}>;

export const Civ7NotificationsContract: Civ7NotificationsContract = {
  dismiss: {
    request: Civ7NotificationDismissalContract,
  },
  queue: {
    current: Civ7NotificationQueueCurrentContract,
    dismiss: {
      request: Civ7NotificationQueueDismissContract,
    },
  },
};

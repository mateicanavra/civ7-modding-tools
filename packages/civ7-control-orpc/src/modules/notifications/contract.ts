import {
  Civ7ComponentIdSchema,
  Civ7NotificationDismissInputSchema,
  Civ7NotificationDismissalPostconditionClassificationSchema,
} from "@civ7/direct-control";
import type { ContractProcedure } from "@orpc/contract";
import { Type, type Static } from "typebox";

import { civ7ControlOrpcContractBase } from "../../contract-base";
import type { Civ7ControlOrpcErrorMap } from "../../errors";
import type { Civ7ControlOrpcProcedureMeta } from "../../metadata";
import { toStandardSchema } from "../../typebox-standard-schema";

export const Civ7NotificationDismissInputStandardSchema = toStandardSchema(
  Civ7NotificationDismissInputSchema,
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

export const Civ7NotificationDismissalResultSchema = Type.Object(
  {
    notificationId: Civ7ComponentIdSchema,
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

export const Civ7NotificationDismissalResultStandardSchema = toStandardSchema(
  Civ7NotificationDismissalResultSchema,
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

export type Civ7NotificationsContract = Readonly<{
  dismiss: Readonly<{
    request: Civ7NotificationDismissalContract;
  }>;
}>;

export const Civ7NotificationsContract: Civ7NotificationsContract = {
  dismiss: {
    request: Civ7NotificationDismissalContract,
  },
};

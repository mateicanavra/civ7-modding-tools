import type { ContractProcedure } from "@orpc/contract";
import { Type, type Static } from "typebox";

import { civ7ControlOrpcContractBase } from "../../contract-base";
import type { Civ7ControlOrpcErrorMap } from "../../errors";
import type { Civ7ControlOrpcProcedureMeta } from "../../metadata";
import { Civ7ControlOrpcComponentIdSchema } from "../../model/primitives";
import { toStandardSchema } from "../../typebox-standard-schema";

export const Civ7DiplomacyResponseInputSchema = Type.Object(
  {
    playerId: Type.Integer({ minimum: 0, maximum: 1024 }),
    actionId: Type.Integer(),
    responseType: Type.Integer(),
    notificationId: Type.Optional(Civ7ControlOrpcComponentIdSchema),
  },
  { additionalProperties: false },
);
export type Civ7DiplomacyResponseInput = Static<
  typeof Civ7DiplomacyResponseInputSchema
>;

export const Civ7DiplomacyResponsePostconditionClassificationSchema =
  Type.Union([
    Type.Literal("not-sent"),
    Type.Literal("turn-unblocked"),
    Type.Literal("diplomacy-blocker-cleared"),
    Type.Literal("blocking-notification-changed"),
    Type.Literal("validation-changed"),
    Type.Literal("no-state-change"),
    Type.Literal("missing-postcondition"),
  ]);

export const Civ7DiplomacyResponseProofOutcomeSchema = Type.Union([
  Type.Literal("cleared"),
  Type.Literal("state-changed"),
  Type.Literal("still-blocked"),
  Type.Literal("no-state-change"),
  Type.Literal("not-sent"),
  Type.Literal("stale"),
  Type.Literal("unknown"),
]);

export const Civ7DiplomacyResponseRequestStatusSchema = Type.Union([
  Type.Literal("not-sent"),
  Type.Literal("sent-confirmed"),
  Type.Literal("sent-unverified"),
]);

export const Civ7DiplomacyResponseValidationSummarySchema = Type.Object(
  {
    beforeValid: Type.Boolean(),
    afterValid: Type.Boolean(),
  },
  { additionalProperties: false },
);

export const Civ7DiplomacyResponsePostconditionSummarySchema = Type.Object(
  {
    classification: Civ7DiplomacyResponsePostconditionClassificationSchema,
    reason: Type.String(),
    outcome: Civ7DiplomacyResponseProofOutcomeSchema,
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

export const Civ7DiplomacyResponseNextStepSchema = Type.Object(
  {
    kind: Type.Union([
      Type.Literal("refresh-attention"),
      Type.Literal("do-not-repeat"),
      Type.Literal("inspect-diplomacy-response"),
    ]),
    source: Type.Literal("diplomacy.response.request"),
    label: Type.String(),
  },
  { additionalProperties: false },
);

export const Civ7DiplomacyResponseResultSchema = Type.Object(
  {
    playerId: Type.Integer({ minimum: 0 }),
    actionId: Type.Integer(),
    responseType: Type.Integer(),
    notificationId: Type.Optional(Civ7ControlOrpcComponentIdSchema),
    sent: Type.Boolean(),
    status: Civ7DiplomacyResponseRequestStatusSchema,
    validation: Civ7DiplomacyResponseValidationSummarySchema,
    postcondition: Civ7DiplomacyResponsePostconditionSummarySchema,
    nextSteps: Type.Array(Civ7DiplomacyResponseNextStepSchema),
  },
  { additionalProperties: false },
);
export type Civ7DiplomacyResponseResult = Static<
  typeof Civ7DiplomacyResponseResultSchema
>;

export const Civ7DiplomacyResponseInputStandardSchema = toStandardSchema(
  Civ7DiplomacyResponseInputSchema,
);
export const Civ7DiplomacyResponseResultStandardSchema = toStandardSchema(
  Civ7DiplomacyResponseResultSchema,
);

export type Civ7DiplomacyResponseContract = ContractProcedure<
  typeof Civ7DiplomacyResponseInputStandardSchema,
  typeof Civ7DiplomacyResponseResultStandardSchema,
  Civ7ControlOrpcErrorMap,
  Civ7ControlOrpcProcedureMeta
>;

export const Civ7DiplomacyResponseContract: Civ7DiplomacyResponseContract =
  civ7ControlOrpcContractBase
    .input(Civ7DiplomacyResponseInputStandardSchema)
    .output(Civ7DiplomacyResponseResultStandardSchema)
    .meta({
      family: "diplomacy",
      procedureKey: "diplomacy.response.request",
      proofBoundary: "local-package-test",
      risk: "mutation",
    });

export type Civ7DiplomacyContract = Readonly<{
  response: Readonly<{
    request: Civ7DiplomacyResponseContract;
  }>;
}>;

export const Civ7DiplomacyContract: Civ7DiplomacyContract = {
  response: {
    request: Civ7DiplomacyResponseContract,
  },
};

import type { ContractProcedure } from "@orpc/contract";
import { Type, type Static } from "typebox";

import { civ7ControlOrpcContractBase } from "../../contract-base";
import type { Civ7ControlOrpcErrorMap } from "../../errors";
import type { Civ7ControlOrpcProcedureMeta } from "../../metadata";
import { Civ7ControlOrpcComponentIdSchema } from "../../model/primitives";
import { toStandardSchema } from "../../typebox-standard-schema";

const Civ7DiplomacyResponseInputSchema = Type.Object(
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

const Civ7DiplomacyResponseResultSchema = Type.Object(
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

const Civ7FirstMeetResponseInputSchema = Type.Object(
  {
    playerId: Type.Integer({ minimum: 0, maximum: 1024 }),
    metPlayerId: Type.Integer({ minimum: 0, maximum: 1024 }),
    responseType: Type.Integer(),
  },
  { additionalProperties: false },
);
export type Civ7FirstMeetResponseInput = Static<
  typeof Civ7FirstMeetResponseInputSchema
>;

export const Civ7FirstMeetResponsePostconditionClassificationSchema =
  Type.Union([
    Type.Literal("not-sent"),
    Type.Literal("turn-unblocked"),
    Type.Literal("first-meet-cleared"),
    Type.Literal("first-meet-blocker-transitioned"),
    Type.Literal("first-meet-sticky-blocker"),
    Type.Literal("first-meet-blocker-unmatched"),
    Type.Literal("missing-postcondition"),
  ]);

export const Civ7FirstMeetResponseProofOutcomeSchema = Type.Union([
  Type.Literal("cleared"),
  Type.Literal("state-changed"),
  Type.Literal("still-blocked"),
  Type.Literal("not-sent"),
  Type.Literal("unknown"),
]);

export const Civ7FirstMeetResponseRequestStatusSchema = Type.Union([
  Type.Literal("not-sent"),
  Type.Literal("sent-confirmed"),
  Type.Literal("sent-unverified"),
]);

export const Civ7FirstMeetResponseValidationSummarySchema = Type.Object(
  {
    beforeValid: Type.Boolean(),
    afterValid: Type.Boolean(),
  },
  { additionalProperties: false },
);

export const Civ7FirstMeetResponsePostconditionSummarySchema = Type.Object(
  {
    classification: Civ7FirstMeetResponsePostconditionClassificationSchema,
    reason: Type.String(),
    outcome: Civ7FirstMeetResponseProofOutcomeSchema,
    confidence: Type.Union([
      Type.Literal("confirmed"),
      Type.Literal("unverified"),
    ]),
    confirmed: Type.Boolean(),
    noRepeatAfterUnverified: Type.Boolean(),
  },
  { additionalProperties: false },
);

export const Civ7FirstMeetResponseNextStepSchema = Type.Object(
  {
    kind: Type.Union([
      Type.Literal("refresh-attention"),
      Type.Literal("do-not-repeat"),
      Type.Literal("inspect-first-meet-response"),
    ]),
    source: Type.Literal("diplomacy.firstMeet.response.request"),
    label: Type.String(),
  },
  { additionalProperties: false },
);

const Civ7FirstMeetResponseResultSchema = Type.Object(
  {
    playerId: Type.Integer({ minimum: 0 }),
    metPlayerId: Type.Integer({ minimum: 0 }),
    responseType: Type.Integer(),
    sent: Type.Boolean(),
    status: Civ7FirstMeetResponseRequestStatusSchema,
    validation: Civ7FirstMeetResponseValidationSummarySchema,
    postcondition: Civ7FirstMeetResponsePostconditionSummarySchema,
    nextSteps: Type.Array(Civ7FirstMeetResponseNextStepSchema),
  },
  { additionalProperties: false },
);
export type Civ7FirstMeetResponseResult = Static<
  typeof Civ7FirstMeetResponseResultSchema
>;

const Civ7DiplomacyResponseInputStandardSchema = toStandardSchema(
  Civ7DiplomacyResponseInputSchema,
);
const Civ7DiplomacyResponseResultStandardSchema = toStandardSchema(
  Civ7DiplomacyResponseResultSchema,
);
const Civ7FirstMeetResponseInputStandardSchema = toStandardSchema(
  Civ7FirstMeetResponseInputSchema,
);
const Civ7FirstMeetResponseResultStandardSchema = toStandardSchema(
  Civ7FirstMeetResponseResultSchema,
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

export type Civ7FirstMeetResponseContract = ContractProcedure<
  typeof Civ7FirstMeetResponseInputStandardSchema,
  typeof Civ7FirstMeetResponseResultStandardSchema,
  Civ7ControlOrpcErrorMap,
  Civ7ControlOrpcProcedureMeta
>;

export const Civ7FirstMeetResponseContract: Civ7FirstMeetResponseContract =
  civ7ControlOrpcContractBase
    .input(Civ7FirstMeetResponseInputStandardSchema)
    .output(Civ7FirstMeetResponseResultStandardSchema)
    .meta({
      family: "diplomacy",
      procedureKey: "diplomacy.firstMeet.response.request",
      proofBoundary: "local-package-test",
      risk: "mutation",
    });

export type Civ7DiplomacyContract = Readonly<{
  firstMeet: Readonly<{
    response: Readonly<{
      request: Civ7FirstMeetResponseContract;
    }>;
  }>;
  response: Readonly<{
    request: Civ7DiplomacyResponseContract;
  }>;
}>;

export const Civ7DiplomacyContract: Civ7DiplomacyContract = {
  firstMeet: {
    response: {
      request: Civ7FirstMeetResponseContract,
    },
  },
  response: {
    request: Civ7DiplomacyResponseContract,
  },
};

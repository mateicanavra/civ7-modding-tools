import type { ContractProcedure } from "@orpc/contract";
import { Type, type Static } from "typebox";

import { civ7ControlOrpcContractBase } from "../../contract-base";
import type { Civ7ControlOrpcErrorMap } from "../../errors";
import type { Civ7ControlOrpcProcedureMeta } from "../../metadata";
import { Civ7ControlOrpcComponentIdSchema } from "../../model/primitives";
import { toStandardSchema } from "../../typebox-standard-schema";

export const Civ7ProgressionChoiceInputSchema = Type.Object(
  {
    playerId: Type.Integer({ minimum: 0, maximum: 1024 }),
    node: Type.Integer(),
    notificationId: Type.Optional(Civ7ControlOrpcComponentIdSchema),
  },
  { additionalProperties: false },
);
export type Civ7ProgressionChoiceInput = Static<
  typeof Civ7ProgressionChoiceInputSchema
>;

export const Civ7ProgressionChoicePostconditionClassificationSchema =
  Type.Union([
    Type.Literal("not-sent"),
    Type.Literal("pending-runtime-proof"),
    Type.Literal("turn-unblocked"),
    Type.Literal("technology-choice-cleared"),
    Type.Literal("technology-choice-transitioned"),
    Type.Literal("technology-state-changed-blocker-still-live"),
    Type.Literal("technology-choice-sticky-blocker"),
    Type.Literal("culture-choice-cleared"),
    Type.Literal("culture-choice-transitioned"),
    Type.Literal("culture-state-changed-blocker-still-live"),
    Type.Literal("culture-choice-sticky-blocker"),
  ]);

export const Civ7ProgressionChoiceProofOutcomeSchema = Type.Union([
  Type.Literal("cleared"),
  Type.Literal("state-changed"),
  Type.Literal("still-blocked"),
  Type.Literal("no-state-change"),
  Type.Literal("not-sent"),
  Type.Literal("stale"),
  Type.Literal("unknown"),
]);

export const Civ7ProgressionChoiceRequestStatusSchema = Type.Union([
  Type.Literal("not-sent"),
  Type.Literal("sent-confirmed"),
  Type.Literal("sent-unverified"),
]);

export const Civ7ProgressionChoiceEvidenceSummarySchema = Type.Object(
  {
    beforeBlockerPresent: Type.Boolean(),
    afterReadStatus: Type.Union([
      Type.Literal("read"),
      Type.Literal("failed"),
      Type.Literal("skipped-not-sent"),
    ]),
    afterBlockerPresent: Type.Union([Type.Boolean(), Type.Null()]),
    canEndTurnAfter: Type.Union([Type.Boolean(), Type.Null()]),
  },
  { additionalProperties: false },
);

export const Civ7ProgressionChoicePostconditionSummarySchema = Type.Object(
  {
    classification: Civ7ProgressionChoicePostconditionClassificationSchema,
    reason: Type.String(),
    outcome: Civ7ProgressionChoiceProofOutcomeSchema,
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

export const Civ7ProgressionTechnologyChoiceNextStepSchema = Type.Object(
  {
    kind: Type.Union([
      Type.Literal("refresh-attention"),
      Type.Literal("do-not-repeat"),
      Type.Literal("inspect-progression-choice"),
    ]),
    source: Type.Literal("progression.technology.choice.request"),
    label: Type.String(),
  },
  { additionalProperties: false },
);

export const Civ7ProgressionCultureChoiceNextStepSchema = Type.Object(
  {
    kind: Type.Union([
      Type.Literal("refresh-attention"),
      Type.Literal("do-not-repeat"),
      Type.Literal("inspect-progression-choice"),
    ]),
    source: Type.Literal("progression.culture.choice.request"),
    label: Type.String(),
  },
  { additionalProperties: false },
);

export const Civ7ProgressionTechnologyChoiceResultSchema = Type.Object(
  {
    playerId: Type.Integer({ minimum: 0 }),
    node: Type.Integer(),
    notificationId: Type.Optional(Civ7ControlOrpcComponentIdSchema),
    sent: Type.Boolean(),
    status: Civ7ProgressionChoiceRequestStatusSchema,
    evidence: Civ7ProgressionChoiceEvidenceSummarySchema,
    postcondition: Civ7ProgressionChoicePostconditionSummarySchema,
    nextSteps: Type.Array(Civ7ProgressionTechnologyChoiceNextStepSchema),
  },
  { additionalProperties: false },
);
export type Civ7ProgressionTechnologyChoiceResult = Static<
  typeof Civ7ProgressionTechnologyChoiceResultSchema
>;

export const Civ7ProgressionCultureChoiceResultSchema = Type.Object(
  {
    playerId: Type.Integer({ minimum: 0 }),
    node: Type.Integer(),
    notificationId: Type.Optional(Civ7ControlOrpcComponentIdSchema),
    sent: Type.Boolean(),
    status: Civ7ProgressionChoiceRequestStatusSchema,
    evidence: Civ7ProgressionChoiceEvidenceSummarySchema,
    postcondition: Civ7ProgressionChoicePostconditionSummarySchema,
    nextSteps: Type.Array(Civ7ProgressionCultureChoiceNextStepSchema),
  },
  { additionalProperties: false },
);
export type Civ7ProgressionCultureChoiceResult = Static<
  typeof Civ7ProgressionCultureChoiceResultSchema
>;

export const Civ7ProgressionChoiceInputStandardSchema =
  toStandardSchema(Civ7ProgressionChoiceInputSchema);
export const Civ7ProgressionTechnologyChoiceResultStandardSchema =
  toStandardSchema(Civ7ProgressionTechnologyChoiceResultSchema);
export const Civ7ProgressionCultureChoiceResultStandardSchema =
  toStandardSchema(Civ7ProgressionCultureChoiceResultSchema);

export type Civ7ProgressionTechnologyChoiceContract = ContractProcedure<
  typeof Civ7ProgressionChoiceInputStandardSchema,
  typeof Civ7ProgressionTechnologyChoiceResultStandardSchema,
  Civ7ControlOrpcErrorMap,
  Civ7ControlOrpcProcedureMeta
>;

export const Civ7ProgressionTechnologyChoiceContract:
  Civ7ProgressionTechnologyChoiceContract = civ7ControlOrpcContractBase
    .input(Civ7ProgressionChoiceInputStandardSchema)
    .output(Civ7ProgressionTechnologyChoiceResultStandardSchema)
    .meta({
      family: "progression",
      procedureKey: "progression.technology.choice.request",
      proofBoundary: "local-package-test",
      risk: "mutation",
    });

export type Civ7ProgressionCultureChoiceContract = ContractProcedure<
  typeof Civ7ProgressionChoiceInputStandardSchema,
  typeof Civ7ProgressionCultureChoiceResultStandardSchema,
  Civ7ControlOrpcErrorMap,
  Civ7ControlOrpcProcedureMeta
>;

export const Civ7ProgressionCultureChoiceContract:
  Civ7ProgressionCultureChoiceContract = civ7ControlOrpcContractBase
    .input(Civ7ProgressionChoiceInputStandardSchema)
    .output(Civ7ProgressionCultureChoiceResultStandardSchema)
    .meta({
      family: "progression",
      procedureKey: "progression.culture.choice.request",
      proofBoundary: "local-package-test",
      risk: "mutation",
    });

export type Civ7ProgressionContract = Readonly<{
  technology: Readonly<{
    choice: Readonly<{
      request: Civ7ProgressionTechnologyChoiceContract;
    }>;
  }>;
  culture: Readonly<{
    choice: Readonly<{
      request: Civ7ProgressionCultureChoiceContract;
    }>;
  }>;
}>;

export const Civ7ProgressionContract: Civ7ProgressionContract = {
  technology: {
    choice: {
      request: Civ7ProgressionTechnologyChoiceContract,
    },
  },
  culture: {
    choice: {
      request: Civ7ProgressionCultureChoiceContract,
    },
  },
};

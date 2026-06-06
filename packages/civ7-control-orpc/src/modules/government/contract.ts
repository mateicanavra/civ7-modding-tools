import type { ContractProcedure } from "@orpc/contract";
import { Type, type Static } from "typebox";

import { civ7ControlOrpcContractBase } from "../../contract-base";
import type { Civ7ControlOrpcErrorMap } from "../../errors";
import type { Civ7ControlOrpcProcedureMeta } from "../../metadata";
import { toStandardSchema } from "../../typebox-standard-schema";

export const Civ7GovernmentChoiceInputSchema = Type.Object(
  {
    playerId: Type.Integer({ minimum: 0, maximum: 1024 }),
    governmentType: Type.Integer(),
    action: Type.Optional(Type.Integer()),
  },
  { additionalProperties: false },
);
export type Civ7GovernmentChoiceInput = Static<
  typeof Civ7GovernmentChoiceInputSchema
>;

export const Civ7GovernmentCelebrationChoiceInputSchema = Type.Object(
  {
    playerId: Type.Integer({ minimum: 0, maximum: 1024 }),
    goldenAgeType: Type.Integer(),
  },
  { additionalProperties: false },
);
export type Civ7GovernmentCelebrationChoiceInput = Static<
  typeof Civ7GovernmentCelebrationChoiceInputSchema
>;

export const Civ7GovernmentChoicePostconditionClassificationSchema =
  Type.Union([
    Type.Literal("not-sent"),
    Type.Literal("pending-runtime-proof"),
    Type.Literal("missing-postcondition"),
  ]);

export const Civ7GovernmentChoiceProofOutcomeSchema = Type.Union([
  Type.Literal("not-sent"),
  Type.Literal("unknown"),
]);

export const Civ7GovernmentChoiceRequestStatusSchema = Type.Union([
  Type.Literal("not-sent"),
  Type.Literal("sent-unverified"),
]);

export const Civ7GovernmentChoiceValidationSummarySchema = Type.Object(
  {
    beforeValid: Type.Boolean(),
    afterValid: Type.Boolean(),
  },
  { additionalProperties: false },
);

export const Civ7GovernmentChoicePostconditionSummarySchema = Type.Object(
  {
    classification: Civ7GovernmentChoicePostconditionClassificationSchema,
    reason: Type.String(),
    outcome: Civ7GovernmentChoiceProofOutcomeSchema,
    confidence: Type.Union([
      Type.Literal("unverified"),
      Type.Literal("pending-runtime-proof"),
    ]),
    confirmed: Type.Boolean(),
    noRepeatAfterUnverified: Type.Boolean(),
  },
  { additionalProperties: false },
);

export const Civ7GovernmentChoiceNextStepSchema = Type.Object(
  {
    kind: Type.Union([
      Type.Literal("do-not-repeat"),
      Type.Literal("inspect-government-choice"),
    ]),
    source: Type.Literal("government.choice.request"),
    label: Type.String(),
  },
  { additionalProperties: false },
);

export const Civ7GovernmentCelebrationChoiceNextStepSchema = Type.Object(
  {
    kind: Type.Union([
      Type.Literal("do-not-repeat"),
      Type.Literal("inspect-government-choice"),
    ]),
    source: Type.Literal("government.celebration.choice.request"),
    label: Type.String(),
  },
  { additionalProperties: false },
);

export const Civ7GovernmentChoiceResultSchema = Type.Object(
  {
    playerId: Type.Integer({ minimum: 0 }),
    governmentType: Type.Integer(),
    action: Type.Integer(),
    sent: Type.Boolean(),
    status: Civ7GovernmentChoiceRequestStatusSchema,
    validation: Civ7GovernmentChoiceValidationSummarySchema,
    postcondition: Civ7GovernmentChoicePostconditionSummarySchema,
    nextSteps: Type.Array(Civ7GovernmentChoiceNextStepSchema),
  },
  { additionalProperties: false },
);
export type Civ7GovernmentChoiceResult = Static<
  typeof Civ7GovernmentChoiceResultSchema
>;

export const Civ7GovernmentCelebrationChoiceResultSchema = Type.Object(
  {
    playerId: Type.Integer({ minimum: 0 }),
    goldenAgeType: Type.Integer(),
    sent: Type.Boolean(),
    status: Civ7GovernmentChoiceRequestStatusSchema,
    validation: Civ7GovernmentChoiceValidationSummarySchema,
    postcondition: Civ7GovernmentChoicePostconditionSummarySchema,
    nextSteps: Type.Array(Civ7GovernmentCelebrationChoiceNextStepSchema),
  },
  { additionalProperties: false },
);
export type Civ7GovernmentCelebrationChoiceResult = Static<
  typeof Civ7GovernmentCelebrationChoiceResultSchema
>;

export const Civ7GovernmentChoiceInputStandardSchema =
  toStandardSchema(Civ7GovernmentChoiceInputSchema);
export const Civ7GovernmentCelebrationChoiceInputStandardSchema =
  toStandardSchema(Civ7GovernmentCelebrationChoiceInputSchema);
export const Civ7GovernmentChoiceResultStandardSchema =
  toStandardSchema(Civ7GovernmentChoiceResultSchema);
export const Civ7GovernmentCelebrationChoiceResultStandardSchema =
  toStandardSchema(Civ7GovernmentCelebrationChoiceResultSchema);

export type Civ7GovernmentChoiceContract = ContractProcedure<
  typeof Civ7GovernmentChoiceInputStandardSchema,
  typeof Civ7GovernmentChoiceResultStandardSchema,
  Civ7ControlOrpcErrorMap,
  Civ7ControlOrpcProcedureMeta
>;

export const Civ7GovernmentChoiceContract: Civ7GovernmentChoiceContract =
  civ7ControlOrpcContractBase
    .input(Civ7GovernmentChoiceInputStandardSchema)
    .output(Civ7GovernmentChoiceResultStandardSchema)
    .meta({
      family: "government",
      procedureKey: "government.choice.request",
      proofBoundary: "local-package-test",
      risk: "mutation",
    });

export type Civ7GovernmentCelebrationChoiceContract = ContractProcedure<
  typeof Civ7GovernmentCelebrationChoiceInputStandardSchema,
  typeof Civ7GovernmentCelebrationChoiceResultStandardSchema,
  Civ7ControlOrpcErrorMap,
  Civ7ControlOrpcProcedureMeta
>;

export const Civ7GovernmentCelebrationChoiceContract:
  Civ7GovernmentCelebrationChoiceContract = civ7ControlOrpcContractBase
    .input(Civ7GovernmentCelebrationChoiceInputStandardSchema)
    .output(Civ7GovernmentCelebrationChoiceResultStandardSchema)
    .meta({
      family: "government",
      procedureKey: "government.celebration.choice.request",
      proofBoundary: "local-package-test",
      risk: "mutation",
    });

export type Civ7GovernmentContract = Readonly<{
  choice: Readonly<{
    request: Civ7GovernmentChoiceContract;
  }>;
  celebration: Readonly<{
    choice: Readonly<{
      request: Civ7GovernmentCelebrationChoiceContract;
    }>;
  }>;
}>;

export const Civ7GovernmentContract: Civ7GovernmentContract = {
  choice: {
    request: Civ7GovernmentChoiceContract,
  },
  celebration: {
    choice: {
      request: Civ7GovernmentCelebrationChoiceContract,
    },
  },
};

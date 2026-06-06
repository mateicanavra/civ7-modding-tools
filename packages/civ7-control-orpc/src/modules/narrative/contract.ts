import type { ContractProcedure } from "@orpc/contract";
import { Type, type Static } from "typebox";

import { civ7ControlOrpcContractBase } from "../../contract-base";
import type { Civ7ControlOrpcErrorMap } from "../../errors";
import type { Civ7ControlOrpcProcedureMeta } from "../../metadata";
import { Civ7ControlOrpcComponentIdSchema } from "../../model/primitives";
import { toStandardSchema } from "../../typebox-standard-schema";

const Civ7NarrativeChoiceInputSchema = Type.Object(
  {
    playerId: Type.Integer({ minimum: 0, maximum: 1024 }),
    targetType: Type.String({ minLength: 1 }),
    target: Civ7ControlOrpcComponentIdSchema,
    action: Type.Integer(),
  },
  { additionalProperties: false },
);
export type Civ7NarrativeChoiceInput = Static<
  typeof Civ7NarrativeChoiceInputSchema
>;

export const Civ7NarrativeChoicePostconditionClassificationSchema =
  Type.Union([
    Type.Literal("not-sent"),
    Type.Literal("turn-unblocked"),
    Type.Literal("narrative-blocker-cleared"),
    Type.Literal("narrative-panel-cleared"),
    Type.Literal("validation-changed"),
    Type.Literal("no-state-change"),
    Type.Literal("missing-postcondition"),
  ]);

export const Civ7NarrativeChoiceProofOutcomeSchema = Type.Union([
  Type.Literal("cleared"),
  Type.Literal("state-changed"),
  Type.Literal("still-blocked"),
  Type.Literal("no-state-change"),
  Type.Literal("not-sent"),
  Type.Literal("stale"),
  Type.Literal("unknown"),
]);
export const Civ7NarrativeChoiceRequestStatusSchema = Type.Union([
  Type.Literal("not-sent"),
  Type.Literal("sent-confirmed"),
  Type.Literal("sent-unverified"),
]);
export const Civ7NarrativeChoiceValidationSummarySchema = Type.Object(
  {
    beforeValid: Type.Boolean(),
    afterValid: Type.Boolean(),
  },
  { additionalProperties: false },
);
export const Civ7NarrativeChoicePostconditionSummarySchema =
  Type.Object(
    {
      classification: Civ7NarrativeChoicePostconditionClassificationSchema,
      reason: Type.String(),
      outcome: Civ7NarrativeChoiceProofOutcomeSchema,
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
export const Civ7NarrativeChoiceNextStepSchema = Type.Object(
  {
    kind: Type.Union([
      Type.Literal("refresh-attention"),
      Type.Literal("do-not-repeat"),
      Type.Literal("inspect-narrative-choice"),
    ]),
    source: Type.Literal("narrative.choice.request"),
    label: Type.String(),
  },
  { additionalProperties: false },
);
const Civ7NarrativeChoiceResultSchema = Type.Object(
  {
    playerId: Type.Integer({ minimum: 0 }),
    targetType: Type.String(),
    target: Civ7ControlOrpcComponentIdSchema,
    action: Type.Integer(),
    sent: Type.Boolean(),
    status: Civ7NarrativeChoiceRequestStatusSchema,
    validation: Civ7NarrativeChoiceValidationSummarySchema,
    postcondition: Civ7NarrativeChoicePostconditionSummarySchema,
    nextSteps: Type.Array(Civ7NarrativeChoiceNextStepSchema),
  },
  { additionalProperties: false },
);
export type Civ7NarrativeChoiceResult = Static<
  typeof Civ7NarrativeChoiceResultSchema
>;

const Civ7NarrativeChoiceInputStandardSchema =
  toStandardSchema(Civ7NarrativeChoiceInputSchema);
const Civ7NarrativeChoiceResultStandardSchema =
  toStandardSchema(Civ7NarrativeChoiceResultSchema);
export type Civ7NarrativeChoiceContract = ContractProcedure<
  typeof Civ7NarrativeChoiceInputStandardSchema,
  typeof Civ7NarrativeChoiceResultStandardSchema,
  Civ7ControlOrpcErrorMap,
  Civ7ControlOrpcProcedureMeta
>;

export const Civ7NarrativeChoiceContract:
  Civ7NarrativeChoiceContract = civ7ControlOrpcContractBase
    .input(Civ7NarrativeChoiceInputStandardSchema)
    .output(Civ7NarrativeChoiceResultStandardSchema)
    .meta({
      family: "narrative",
      procedureKey: "narrative.choice.request",
      proofBoundary: "local-package-test",
      risk: "mutation",
    });

export type Civ7NarrativeContract = Readonly<{
  choice: Readonly<{
    request: Civ7NarrativeChoiceContract;
  }>;
}>;

export const Civ7NarrativeContract: Civ7NarrativeContract = {
  choice: {
    request: Civ7NarrativeChoiceContract,
  },
};

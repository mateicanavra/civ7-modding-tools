import type { ContractProcedure } from "@orpc/contract";
import { Type, type Static } from "typebox";

import { civ7ControlOrpcContractBase } from "../../contract-base";
import type { Civ7ControlOrpcErrorMap } from "../../errors";
import type { Civ7ControlOrpcProcedureMeta } from "../../metadata";
import { Civ7ControlOrpcComponentIdSchema } from "../../model/primitives";
import { toStandardSchema } from "../../typebox-standard-schema";

export const Civ7DecisionsNarrativeChoiceInputSchema = Type.Object(
  {
    playerId: Type.Integer({ minimum: 0, maximum: 1024 }),
    targetType: Type.String({ minLength: 1 }),
    target: Civ7ControlOrpcComponentIdSchema,
    action: Type.Integer(),
  },
  { additionalProperties: false },
);
export type Civ7DecisionsNarrativeChoiceInput = Static<
  typeof Civ7DecisionsNarrativeChoiceInputSchema
>;

export const Civ7DecisionsNarrativeChoicePostconditionClassificationSchema =
  Type.Union([
    Type.Literal("not-sent"),
    Type.Literal("turn-unblocked"),
    Type.Literal("narrative-blocker-cleared"),
    Type.Literal("narrative-panel-cleared"),
    Type.Literal("validation-changed"),
    Type.Literal("no-state-change"),
    Type.Literal("missing-postcondition"),
  ]);

export const Civ7DecisionsNarrativeChoiceProofOutcomeSchema = Type.Union([
  Type.Literal("cleared"),
  Type.Literal("state-changed"),
  Type.Literal("still-blocked"),
  Type.Literal("no-state-change"),
  Type.Literal("not-sent"),
  Type.Literal("stale"),
  Type.Literal("unknown"),
]);
export const Civ7DecisionsNarrativeChoiceRequestStatusSchema = Type.Union([
  Type.Literal("not-sent"),
  Type.Literal("sent-confirmed"),
  Type.Literal("sent-unverified"),
]);
export const Civ7DecisionsNarrativeChoiceValidationSummarySchema = Type.Object(
  {
    beforeValid: Type.Boolean(),
    afterValid: Type.Boolean(),
  },
  { additionalProperties: false },
);
export const Civ7DecisionsNarrativeChoicePostconditionSummarySchema =
  Type.Object(
    {
      classification: Civ7DecisionsNarrativeChoicePostconditionClassificationSchema,
      reason: Type.String(),
      outcome: Civ7DecisionsNarrativeChoiceProofOutcomeSchema,
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
export const Civ7DecisionsNarrativeChoiceNextStepSchema = Type.Object(
  {
    kind: Type.Union([
      Type.Literal("refresh-attention"),
      Type.Literal("do-not-repeat"),
      Type.Literal("inspect-narrative-choice"),
    ]),
    source: Type.Literal("decisions.narrative.choice.request"),
    label: Type.String(),
  },
  { additionalProperties: false },
);
export const Civ7DecisionsNarrativeChoiceResultSchema = Type.Object(
  {
    playerId: Type.Integer({ minimum: 0 }),
    targetType: Type.String(),
    target: Civ7ControlOrpcComponentIdSchema,
    action: Type.Integer(),
    sent: Type.Boolean(),
    status: Civ7DecisionsNarrativeChoiceRequestStatusSchema,
    validation: Civ7DecisionsNarrativeChoiceValidationSummarySchema,
    postcondition: Civ7DecisionsNarrativeChoicePostconditionSummarySchema,
    nextSteps: Type.Array(Civ7DecisionsNarrativeChoiceNextStepSchema),
  },
  { additionalProperties: false },
);
export type Civ7DecisionsNarrativeChoiceResult = Static<
  typeof Civ7DecisionsNarrativeChoiceResultSchema
>;

export const Civ7DecisionsNarrativeChoiceInputStandardSchema =
  toStandardSchema(Civ7DecisionsNarrativeChoiceInputSchema);
export const Civ7DecisionsNarrativeChoiceResultStandardSchema =
  toStandardSchema(Civ7DecisionsNarrativeChoiceResultSchema);
export type Civ7DecisionsNarrativeChoiceContract = ContractProcedure<
  typeof Civ7DecisionsNarrativeChoiceInputStandardSchema,
  typeof Civ7DecisionsNarrativeChoiceResultStandardSchema,
  Civ7ControlOrpcErrorMap,
  Civ7ControlOrpcProcedureMeta
>;

export const Civ7DecisionsNarrativeChoiceContract:
  Civ7DecisionsNarrativeChoiceContract = civ7ControlOrpcContractBase
    .input(Civ7DecisionsNarrativeChoiceInputStandardSchema)
    .output(Civ7DecisionsNarrativeChoiceResultStandardSchema)
    .meta({
      family: "decisions",
      procedureKey: "decisions.narrative.choice.request",
      proofBoundary: "local-package-test",
      risk: "mutation",
    });

export type Civ7DecisionsContract = Readonly<{
  narrative: Readonly<{
    choice: Readonly<{
      request: Civ7DecisionsNarrativeChoiceContract;
    }>;
  }>;
}>;

export const Civ7DecisionsContract: Civ7DecisionsContract = {
  narrative: {
    choice: {
      request: Civ7DecisionsNarrativeChoiceContract,
    },
  },
};

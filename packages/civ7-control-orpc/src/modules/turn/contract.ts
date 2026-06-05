import type { ContractProcedure } from "@orpc/contract";
import { Type, type Static } from "typebox";

import { civ7ControlOrpcContractBase } from "../../contract-base";
import type { Civ7ControlOrpcErrorMap } from "../../errors";
import type { Civ7ControlOrpcProcedureMeta } from "../../metadata";
import { Civ7ControlOrpcComponentIdSchema } from "../../model/primitives";
import { toStandardSchema } from "../../typebox-standard-schema";

export const Civ7TurnCompletionInputSchema = Type.Object(
  {},
  { additionalProperties: false },
);
export type Civ7TurnCompletionInput = Static<
  typeof Civ7TurnCompletionInputSchema
>;

export const Civ7TurnCompletionInputStandardSchema = toStandardSchema(
  Civ7TurnCompletionInputSchema,
);

export const Civ7TurnCompletionRequestStatusSchema = Type.Union([
  Type.Literal("not-sent"),
  Type.Literal("sent-confirmed"),
  Type.Literal("sent-guarded"),
  Type.Literal("sent-unverified"),
]);

export const Civ7TurnCompletionPostconditionClassificationSchema = Type.Union(
  [
    Type.Literal("turn-advanced"),
    Type.Literal("turn-complete-sent"),
    Type.Literal("already-complete"),
    Type.Literal("turn-completion-blocked"),
    Type.Literal("no-state-change"),
    Type.Literal("missing-postcondition"),
    Type.Literal("pending-runtime-proof"),
  ],
);

export const Civ7TurnCompletionProofOutcomeSchema = Type.Union([
  Type.Literal("cleared"),
  Type.Literal("state-changed"),
  Type.Literal("not-sent"),
  Type.Literal("no-state-change"),
  Type.Literal("unknown"),
]);

export const Civ7TurnCompletionProbeSummarySchema = Type.Object(
  {
    turn: Type.Union([Type.Number(), Type.Null()]),
    turnDate: Type.Union([Type.String(), Type.Null()]),
    hasSentTurnComplete: Type.Union([Type.Boolean(), Type.Null()]),
    canEndTurn: Type.Union([Type.Boolean(), Type.Null()]),
    blocker: Type.Union([Type.Number(), Type.String(), Type.Null()]),
    firstReadyUnitId: Type.Union([
      Civ7ControlOrpcComponentIdSchema,
      Type.Null(),
    ]),
  },
  { additionalProperties: false },
);

export const Civ7TurnCompletionPostconditionSummarySchema = Type.Object(
  {
    classification: Civ7TurnCompletionPostconditionClassificationSchema,
    reason: Type.String(),
    outcome: Civ7TurnCompletionProofOutcomeSchema,
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

export const Civ7TurnCompletionNextStepSchema = Type.Object(
  {
    kind: Type.Union([
      Type.Literal("refresh-attention"),
      Type.Literal("do-not-repeat"),
      Type.Literal("inspect-turn-completion"),
    ]),
    source: Type.Literal("turn.complete.request"),
    label: Type.String(),
  },
  { additionalProperties: false },
);

export const Civ7TurnCompletionResultSchema = Type.Object(
  {
    sent: Type.Boolean(),
    status: Civ7TurnCompletionRequestStatusSchema,
    before: Civ7TurnCompletionProbeSummarySchema,
    after: Type.Union([Civ7TurnCompletionProbeSummarySchema, Type.Null()]),
    postcondition: Civ7TurnCompletionPostconditionSummarySchema,
    nextSteps: Type.Array(Civ7TurnCompletionNextStepSchema),
  },
  { additionalProperties: false },
);
export type Civ7TurnCompletionResult = Static<
  typeof Civ7TurnCompletionResultSchema
>;

export const Civ7TurnCompletionResultStandardSchema = toStandardSchema(
  Civ7TurnCompletionResultSchema,
);

export type Civ7TurnCompletionContract = ContractProcedure<
  typeof Civ7TurnCompletionInputStandardSchema,
  typeof Civ7TurnCompletionResultStandardSchema,
  Civ7ControlOrpcErrorMap,
  Civ7ControlOrpcProcedureMeta
>;

export const Civ7TurnCompletionContract: Civ7TurnCompletionContract =
  civ7ControlOrpcContractBase
    .input(Civ7TurnCompletionInputStandardSchema)
    .output(Civ7TurnCompletionResultStandardSchema)
    .meta({
      family: "turn",
      procedureKey: "turn.complete.request",
      proofBoundary: "local-package-test",
      risk: "mutation",
    });

export type Civ7TurnContract = Readonly<{
  complete: Readonly<{
    request: Civ7TurnCompletionContract;
  }>;
}>;

export const Civ7TurnContract: Civ7TurnContract = {
  complete: {
    request: Civ7TurnCompletionContract,
  },
};

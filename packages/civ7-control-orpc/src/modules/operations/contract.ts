import {
  Civ7ComponentIdSchema,
  Civ7MapLocationSchema,
  Civ7UnitTargetActionInputSchema,
} from "@civ7/direct-control";
import type { ContractProcedure } from "@orpc/contract";
import { Type, type Static } from "typebox";

import { civ7ControlOrpcContractBase } from "../../contract-base";
import type { Civ7ControlOrpcErrorMap } from "../../errors";
import type { Civ7ControlOrpcProcedureMeta } from "../../metadata";
import { toStandardSchema } from "../../typebox-standard-schema";

export const Civ7OperationsUnitTargetActionInputStandardSchema =
  toStandardSchema(Civ7UnitTargetActionInputSchema);

export const Civ7OperationsUnitTargetActionFamilySchema = Type.Union([
  Type.Literal("unit-operation"),
  Type.Literal("unit-command"),
]);

export const Civ7OperationsUnitTargetActionVerificationClassificationSchema =
  Type.Union([
    Type.Literal("target-reached"),
    Type.Literal("path-shortfall"),
    Type.Literal("unit-state-changed"),
    Type.Literal("target-state-changed"),
    Type.Literal("no-state-change"),
    Type.Literal("not-sent"),
    Type.Literal("missing-postcondition"),
  ]);

export const Civ7OperationsUnitTargetActionProofOutcomeSchema = Type.Union([
  Type.Literal("cleared"),
  Type.Literal("state-changed"),
  Type.Literal("no-state-change"),
  Type.Literal("not-sent"),
  Type.Literal("unknown"),
]);

export const Civ7OperationsUnitTargetActionRequestStatusSchema = Type.Union([
  Type.Literal("not-sent"),
  Type.Literal("sent-confirmed"),
  Type.Literal("sent-guarded"),
  Type.Literal("sent-unverified"),
]);

export const Civ7OperationsUnitTargetActionSelectedSummarySchema = Type.Object(
  {
    family: Civ7OperationsUnitTargetActionFamilySchema,
    operationType: Type.String(),
    valid: Type.Boolean(),
    targetInReturnedPlots: Type.Union([Type.Boolean(), Type.Null()]),
    rejectedReason: Type.Union([Type.String(), Type.Null()]),
  },
  { additionalProperties: false },
);

export const Civ7OperationsUnitTargetActionValidationSummarySchema =
  Type.Object(
    {
      candidateCount: Type.Integer({ minimum: 0 }),
      acceptedCandidateCount: Type.Integer({ minimum: 0 }),
      selected: Type.Union([
        Civ7OperationsUnitTargetActionSelectedSummarySchema,
        Type.Null(),
      ]),
    },
    { additionalProperties: false },
  );

export const Civ7OperationsUnitTargetActionPostconditionSummarySchema =
  Type.Object(
    {
      classification: Civ7OperationsUnitTargetActionVerificationClassificationSchema,
      reason: Type.String(),
      outcome: Civ7OperationsUnitTargetActionProofOutcomeSchema,
      confidence: Type.Union([
        Type.Literal("confirmed"),
        Type.Literal("unverified"),
      ]),
      confirmed: Type.Boolean(),
      noRepeatAfterUnverified: Type.Boolean(),
      destinationReached: Type.Union([Type.Boolean(), Type.Null()]),
      requestedLocation: Civ7MapLocationSchema,
      landedLocation: Type.Union([Civ7MapLocationSchema, Type.Null()]),
      source: Type.Union([
        Type.Literal("immediate"),
        Type.Literal("bounded-poll"),
        Type.Null(),
      ]),
    },
    { additionalProperties: false },
  );

export const Civ7OperationsUnitTargetActionNextStepSchema = Type.Object(
  {
    kind: Type.Union([
      Type.Literal("refresh-attention"),
      Type.Literal("do-not-repeat"),
      Type.Literal("inspect-unit-action"),
    ]),
    source: Type.Literal("unit.target.action.request"),
    label: Type.String(),
  },
  { additionalProperties: false },
);

export const Civ7OperationsUnitTargetActionResultSchema = Type.Object(
  {
    unitId: Civ7ComponentIdSchema,
    target: Civ7MapLocationSchema,
    sent: Type.Boolean(),
    status: Civ7OperationsUnitTargetActionRequestStatusSchema,
    validation: Civ7OperationsUnitTargetActionValidationSummarySchema,
    postcondition: Civ7OperationsUnitTargetActionPostconditionSummarySchema,
    nextSteps: Type.Array(Civ7OperationsUnitTargetActionNextStepSchema),
  },
  { additionalProperties: false },
);
export type Civ7OperationsUnitTargetActionResult = Static<
  typeof Civ7OperationsUnitTargetActionResultSchema
>;

export const Civ7OperationsUnitTargetActionResultStandardSchema =
  toStandardSchema(Civ7OperationsUnitTargetActionResultSchema);

export type Civ7OperationsUnitTargetActionContract = ContractProcedure<
  typeof Civ7OperationsUnitTargetActionInputStandardSchema,
  typeof Civ7OperationsUnitTargetActionResultStandardSchema,
  Civ7ControlOrpcErrorMap,
  Civ7ControlOrpcProcedureMeta
>;

export const Civ7OperationsUnitTargetActionContract:
  Civ7OperationsUnitTargetActionContract = civ7ControlOrpcContractBase
    .input(Civ7OperationsUnitTargetActionInputStandardSchema)
    .output(Civ7OperationsUnitTargetActionResultStandardSchema)
    .meta({
      family: "operations",
      procedureKey: "unit.target.action.request",
      proofBoundary: "local-package-test",
      risk: "mutation",
    });

export type Civ7OperationsContract = Readonly<{
  unit: Readonly<{
    target: Readonly<{
      action: Readonly<{
        request: Civ7OperationsUnitTargetActionContract;
      }>;
    }>;
  }>;
}>;

export const Civ7OperationsContract: Civ7OperationsContract = {
  unit: {
    target: {
      action: {
        request: Civ7OperationsUnitTargetActionContract,
      },
    },
  },
};

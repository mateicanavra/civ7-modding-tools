import {
  Civ7ComponentIdSchema,
  Civ7MapLocationSchema,
  Civ7UnitTargetActionInputSchema,
  Civ7UnitSummaryInputSchema,
  Civ7UnitSummaryResultSchema,
} from "@civ7/direct-control";
import type { ContractProcedure } from "@orpc/contract";
import { Type, type Static } from "typebox";

import { civ7ControlOrpcContractBase } from "../../contract-base";
import type { Civ7ControlOrpcErrorMap } from "../../errors";
import type { Civ7ControlOrpcProcedureMeta } from "../../metadata";
import { toStandardSchema } from "../../typebox-standard-schema";

export const Civ7UnitSummaryInputStandardSchema = toStandardSchema(
  Civ7UnitSummaryInputSchema,
);
export const Civ7UnitSummaryResultStandardSchema = toStandardSchema(
  Civ7UnitSummaryResultSchema,
);
export const Civ7UnitTargetActionInputStandardSchema = toStandardSchema(
  Civ7UnitTargetActionInputSchema,
);

export const Civ7UnitTargetActionFamilySchema = Type.Union([
  Type.Literal("unit-operation"),
  Type.Literal("unit-command"),
]);

export const Civ7UnitTargetActionVerificationClassificationSchema =
  Type.Union([
    Type.Literal("target-reached"),
    Type.Literal("path-shortfall"),
    Type.Literal("unit-state-changed"),
    Type.Literal("target-state-changed"),
    Type.Literal("no-state-change"),
    Type.Literal("not-sent"),
    Type.Literal("missing-postcondition"),
  ]);

export const Civ7UnitTargetActionProofOutcomeSchema = Type.Union([
  Type.Literal("cleared"),
  Type.Literal("state-changed"),
  Type.Literal("no-state-change"),
  Type.Literal("not-sent"),
  Type.Literal("unknown"),
]);

export const Civ7UnitTargetActionRequestStatusSchema = Type.Union([
  Type.Literal("not-sent"),
  Type.Literal("sent-confirmed"),
  Type.Literal("sent-guarded"),
  Type.Literal("sent-unverified"),
]);

export const Civ7UnitTargetActionSelectedSummarySchema = Type.Object(
  {
    family: Civ7UnitTargetActionFamilySchema,
    operationType: Type.String(),
    valid: Type.Boolean(),
    targetInReturnedPlots: Type.Union([Type.Boolean(), Type.Null()]),
    rejectedReason: Type.Union([Type.String(), Type.Null()]),
  },
  { additionalProperties: false },
);

export const Civ7UnitTargetActionValidationSummarySchema = Type.Object(
  {
    candidateCount: Type.Integer({ minimum: 0 }),
    acceptedCandidateCount: Type.Integer({ minimum: 0 }),
    selected: Type.Union([
      Civ7UnitTargetActionSelectedSummarySchema,
      Type.Null(),
    ]),
  },
  { additionalProperties: false },
);

export const Civ7UnitTargetActionPostconditionSummarySchema = Type.Object(
  {
    classification: Civ7UnitTargetActionVerificationClassificationSchema,
    reason: Type.String(),
    outcome: Civ7UnitTargetActionProofOutcomeSchema,
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

export const Civ7UnitTargetActionNextStepSchema = Type.Object(
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

export const Civ7UnitTargetActionResultSchema = Type.Object(
  {
    unitId: Civ7ComponentIdSchema,
    target: Civ7MapLocationSchema,
    sent: Type.Boolean(),
    status: Civ7UnitTargetActionRequestStatusSchema,
    validation: Civ7UnitTargetActionValidationSummarySchema,
    postcondition: Civ7UnitTargetActionPostconditionSummarySchema,
    nextSteps: Type.Array(Civ7UnitTargetActionNextStepSchema),
  },
  { additionalProperties: false },
);
export type Civ7UnitTargetActionResult = Static<
  typeof Civ7UnitTargetActionResultSchema
>;

export const Civ7UnitTargetActionResultStandardSchema = toStandardSchema(
  Civ7UnitTargetActionResultSchema,
);

export type Civ7UnitSummaryContract = ContractProcedure<
  typeof Civ7UnitSummaryInputStandardSchema,
  typeof Civ7UnitSummaryResultStandardSchema,
  Civ7ControlOrpcErrorMap,
  Civ7ControlOrpcProcedureMeta
>;

export const Civ7UnitSummaryContract: Civ7UnitSummaryContract =
  civ7ControlOrpcContractBase
    .input(Civ7UnitSummaryInputStandardSchema)
    .output(Civ7UnitSummaryResultStandardSchema)
    .meta({
      family: "unit",
      procedureKey: "unit.summary.read",
      proofBoundary: "local-package-test",
      risk: "read-only",
    });

export type Civ7UnitTargetActionContract = ContractProcedure<
  typeof Civ7UnitTargetActionInputStandardSchema,
  typeof Civ7UnitTargetActionResultStandardSchema,
  Civ7ControlOrpcErrorMap,
  Civ7ControlOrpcProcedureMeta
>;

export const Civ7UnitTargetActionContract: Civ7UnitTargetActionContract =
  civ7ControlOrpcContractBase
    .input(Civ7UnitTargetActionInputStandardSchema)
    .output(Civ7UnitTargetActionResultStandardSchema)
    .meta({
      family: "unit",
      procedureKey: "unit.target.action.request",
      proofBoundary: "local-package-test",
      risk: "mutation",
    });

export type Civ7UnitContract = Readonly<{
  summary: Readonly<{
    read: Civ7UnitSummaryContract;
  }>;
  target: Readonly<{
    action: Readonly<{
      request: Civ7UnitTargetActionContract;
    }>;
  }>;
}>;

export const Civ7UnitContract: Civ7UnitContract = {
  summary: {
    read: Civ7UnitSummaryContract,
  },
  target: {
    action: {
      request: Civ7UnitTargetActionContract,
    },
  },
};

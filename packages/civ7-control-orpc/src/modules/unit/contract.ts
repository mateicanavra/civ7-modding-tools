import type { ContractProcedure } from "@orpc/contract";
import { Type, type Static } from "typebox";

import { civ7ControlOrpcContractBase } from "../../contract-base";
import type { Civ7ControlOrpcErrorMap } from "../../errors";
import type { Civ7ControlOrpcProcedureMeta } from "../../metadata";
import {
  Civ7ControlOrpcComponentIdSchema,
  Civ7ControlOrpcMapLocationSchema,
} from "../../model/primitives";
import { toStandardSchema } from "../../typebox-standard-schema";

const Civ7UnitTargetActionInputSchema = Type.Object(
  {
    unitId: Civ7ControlOrpcComponentIdSchema,
    x: Type.Integer({ minimum: 0, maximum: 1_000_000 }),
    y: Type.Integer({ minimum: 0, maximum: 1_000_000 }),
  },
  { additionalProperties: false }
);
export type Civ7UnitTargetActionInput = Static<typeof Civ7UnitTargetActionInputSchema>;

const Civ7UnitTargetActionInputStandardSchema = toStandardSchema(Civ7UnitTargetActionInputSchema);

export const Civ7UnitTargetActionFamilySchema = Type.Union([
  Type.Literal("unit-operation"),
  Type.Literal("unit-command"),
]);

export const Civ7UnitTargetActionVerificationClassificationSchema = Type.Union([
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
  { additionalProperties: false }
);

export const Civ7UnitTargetActionValidationSummarySchema = Type.Object(
  {
    candidateCount: Type.Integer({ minimum: 0 }),
    acceptedCandidateCount: Type.Integer({ minimum: 0 }),
    selected: Type.Union([Civ7UnitTargetActionSelectedSummarySchema, Type.Null()]),
  },
  { additionalProperties: false }
);

export const Civ7UnitTargetActionPostconditionSummarySchema = Type.Object(
  {
    classification: Civ7UnitTargetActionVerificationClassificationSchema,
    reason: Type.String(),
    outcome: Civ7UnitTargetActionProofOutcomeSchema,
    confidence: Type.Union([Type.Literal("confirmed"), Type.Literal("unverified")]),
    confirmed: Type.Boolean(),
    noRepeatAfterUnverified: Type.Boolean(),
    destinationReached: Type.Union([Type.Boolean(), Type.Null()]),
    requestedLocation: Civ7ControlOrpcMapLocationSchema,
    landedLocation: Type.Union([Civ7ControlOrpcMapLocationSchema, Type.Null()]),
    source: Type.Union([Type.Literal("immediate"), Type.Literal("bounded-poll"), Type.Null()]),
  },
  { additionalProperties: false }
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
  { additionalProperties: false }
);

const Civ7UnitTargetActionResultSchema = Type.Object(
  {
    unitId: Civ7ControlOrpcComponentIdSchema,
    target: Civ7ControlOrpcMapLocationSchema,
    sent: Type.Boolean(),
    status: Civ7UnitTargetActionRequestStatusSchema,
    validation: Civ7UnitTargetActionValidationSummarySchema,
    postcondition: Civ7UnitTargetActionPostconditionSummarySchema,
    nextSteps: Type.Array(Civ7UnitTargetActionNextStepSchema),
  },
  { additionalProperties: false }
);
export type Civ7UnitTargetActionResult = Static<typeof Civ7UnitTargetActionResultSchema>;

const Civ7UnitTargetActionResultStandardSchema = toStandardSchema(Civ7UnitTargetActionResultSchema);

const Civ7UnitUpgradeInputSchema = Type.Object(
  {
    unitId: Civ7ControlOrpcComponentIdSchema,
  },
  { additionalProperties: false }
);
export type Civ7UnitUpgradeInput = Static<typeof Civ7UnitUpgradeInputSchema>;

const Civ7UnitUpgradeInputStandardSchema = toStandardSchema(Civ7UnitUpgradeInputSchema);

const Civ7UnitResettleInputSchema = Type.Object(
  {
    unitId: Civ7ControlOrpcComponentIdSchema,
    destination: Civ7ControlOrpcMapLocationSchema,
  },
  { additionalProperties: false }
);
export type Civ7UnitResettleInput = Static<typeof Civ7UnitResettleInputSchema>;

const Civ7UnitResettleInputStandardSchema = toStandardSchema(Civ7UnitResettleInputSchema);

export const Civ7UnitCommandPostconditionClassificationSchema = Type.Union([
  Type.Literal("not-sent"),
  Type.Literal("queue-advanced"),
  Type.Literal("selected-unit-changed"),
  Type.Literal("activity-changed"),
  Type.Literal("unit-state-changed"),
  Type.Literal("blocker-changed"),
  Type.Literal("validation-changed"),
  Type.Literal("no-state-change"),
  Type.Literal("missing-postcondition"),
]);

export const Civ7UnitCommandProofOutcomeSchema = Type.Union([
  Type.Literal("cleared"),
  Type.Literal("state-changed"),
  Type.Literal("no-state-change"),
  Type.Literal("not-sent"),
  Type.Literal("unknown"),
]);

export const Civ7UnitCommandRequestStatusSchema = Type.Union([
  Type.Literal("not-sent"),
  Type.Literal("sent-confirmed"),
  Type.Literal("sent-guarded"),
  Type.Literal("sent-unverified"),
]);

export const Civ7UnitCommandSummarySchema = Type.Union([
  Type.Object(
    {
      kind: Type.Literal("upgrade"),
      unitId: Civ7ControlOrpcComponentIdSchema,
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      kind: Type.Literal("resettle"),
      unitId: Civ7ControlOrpcComponentIdSchema,
      destination: Civ7ControlOrpcMapLocationSchema,
    },
    { additionalProperties: false }
  ),
]);

export const Civ7UnitCommandValidationSummarySchema = Type.Object(
  {
    beforeValid: Type.Boolean(),
    afterValid: Type.Boolean(),
  },
  { additionalProperties: false }
);

export const Civ7UnitCommandPostconditionSummarySchema = Type.Object(
  {
    classification: Civ7UnitCommandPostconditionClassificationSchema,
    reason: Type.String(),
    outcome: Civ7UnitCommandProofOutcomeSchema,
    confidence: Type.Union([Type.Literal("confirmed"), Type.Literal("unverified")]),
    confirmed: Type.Boolean(),
    noRepeatAfterUnverified: Type.Boolean(),
  },
  { additionalProperties: false }
);

export const Civ7UnitCommandNextStepSchema = Type.Object(
  {
    kind: Type.Union([
      Type.Literal("refresh-attention"),
      Type.Literal("do-not-repeat"),
      Type.Literal("inspect-unit-command"),
    ]),
    source: Type.Union([
      Type.Literal("unit.upgrade.request"),
      Type.Literal("unit.resettle.request"),
    ]),
    label: Type.String(),
  },
  { additionalProperties: false }
);

const Civ7UnitCommandResultSchema = Type.Object(
  {
    action: Civ7UnitCommandSummarySchema,
    sent: Type.Boolean(),
    status: Civ7UnitCommandRequestStatusSchema,
    validation: Civ7UnitCommandValidationSummarySchema,
    postcondition: Civ7UnitCommandPostconditionSummarySchema,
    nextSteps: Type.Array(Civ7UnitCommandNextStepSchema),
  },
  { additionalProperties: false }
);
export type Civ7UnitCommandResult = Static<typeof Civ7UnitCommandResultSchema>;

const Civ7UnitCommandResultStandardSchema = toStandardSchema(Civ7UnitCommandResultSchema);

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

export type Civ7UnitUpgradeContract = ContractProcedure<
  typeof Civ7UnitUpgradeInputStandardSchema,
  typeof Civ7UnitCommandResultStandardSchema,
  Civ7ControlOrpcErrorMap,
  Civ7ControlOrpcProcedureMeta
>;

export const Civ7UnitUpgradeContract: Civ7UnitUpgradeContract = civ7ControlOrpcContractBase
  .input(Civ7UnitUpgradeInputStandardSchema)
  .output(Civ7UnitCommandResultStandardSchema)
  .meta({
    family: "unit",
    procedureKey: "unit.upgrade.request",
    proofBoundary: "local-package-test",
    risk: "mutation",
  });

export type Civ7UnitResettleContract = ContractProcedure<
  typeof Civ7UnitResettleInputStandardSchema,
  typeof Civ7UnitCommandResultStandardSchema,
  Civ7ControlOrpcErrorMap,
  Civ7ControlOrpcProcedureMeta
>;

export const Civ7UnitResettleContract: Civ7UnitResettleContract = civ7ControlOrpcContractBase
  .input(Civ7UnitResettleInputStandardSchema)
  .output(Civ7UnitCommandResultStandardSchema)
  .meta({
    family: "unit",
    procedureKey: "unit.resettle.request",
    proofBoundary: "local-package-test",
    risk: "mutation",
  });

export type Civ7UnitContract = Readonly<{
  resettle: Readonly<{
    request: Civ7UnitResettleContract;
  }>;
  target: Readonly<{
    action: Readonly<{
      request: Civ7UnitTargetActionContract;
    }>;
  }>;
  upgrade: Readonly<{
    request: Civ7UnitUpgradeContract;
  }>;
}>;

export const Civ7UnitContract: Civ7UnitContract = {
  resettle: {
    request: Civ7UnitResettleContract,
  },
  target: {
    action: {
      request: Civ7UnitTargetActionContract,
    },
  },
  upgrade: {
    request: Civ7UnitUpgradeContract,
  },
};

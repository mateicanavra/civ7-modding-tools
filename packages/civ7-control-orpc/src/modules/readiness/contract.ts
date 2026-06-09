import type { ContractProcedure } from "@orpc/contract";
import { Type, type Static } from "typebox";

import { civ7ControlOrpcContractBase } from "../../contract-base";
import type { Civ7ControlOrpcErrorMap } from "../../errors";
import type { Civ7ControlOrpcProcedureMeta } from "../../metadata";
import { toStandardSchema } from "../../typebox-standard-schema";

const Civ7ReadinessCurrentInputSchema = Type.Object(
  {},
  { additionalProperties: false },
);
export type Civ7ReadinessCurrentInput = Static<
  typeof Civ7ReadinessCurrentInputSchema
>;

export const Civ7ReadinessLevelSchema = Type.Union([
  Type.Literal("tuner-ready"),
  Type.Literal("app-ui-game"),
  Type.Literal("begin-ready"),
  Type.Literal("loading"),
  Type.Literal("shell"),
  Type.Literal("unavailable"),
]);

export const Civ7ReadinessCapabilitySchema = Type.Object(
  {
    canObserve: Type.Boolean(),
    canMutate: Type.Boolean(),
    reason: Type.String(),
  },
  { additionalProperties: false },
);

export const Civ7ReadinessSourceSummarySchema = Type.Object(
  {
    gameUi: Type.Object(
      {
        inGame: Type.Union([Type.Boolean(), Type.Null()]),
        inShell: Type.Union([Type.Boolean(), Type.Null()]),
        inLoading: Type.Union([Type.Boolean(), Type.Null()]),
        canBeginGame: Type.Union([Type.Boolean(), Type.Null()]),
      },
      { additionalProperties: false },
    ),
    runtimeControl: Type.Object(
      {
        ready: Type.Union([Type.Boolean(), Type.Null()]),
      },
      { additionalProperties: false },
    ),
  },
  { additionalProperties: false },
);

export const Civ7ReadinessControllerProcedureRiskSchema = Type.Union([
  Type.Literal("read-only"),
  Type.Literal("mutation"),
]);

export const Civ7ReadinessControllerProcedureSchema = Type.Object(
  {
    procedureKey: Type.String({ minLength: 1 }),
    risk: Civ7ReadinessControllerProcedureRiskSchema,
  },
  { additionalProperties: false },
);

export const Civ7ReadinessControllerSummarySchema = Type.Object(
  {
    supportedProcedures: Type.Array(Civ7ReadinessControllerProcedureSchema),
  },
  { additionalProperties: false },
);

export const Civ7ReadinessNextStepSchema = Type.Object(
  {
    kind: Type.Union([
      Type.Literal("read-attention"),
      Type.Literal("read-strategy-front"),
      Type.Literal("read-world"),
      Type.Literal("restore-tuner"),
      Type.Literal("begin-game"),
      Type.Literal("wait-loading"),
      Type.Literal("enter-game"),
      Type.Literal("inspect-runtime"),
    ]),
    source: Type.Literal("readiness.current"),
    label: Type.String(),
  },
  { additionalProperties: false },
);

const Civ7ReadinessCurrentResultSchema = Type.Object(
  {
    playable: Type.Boolean(),
    readiness: Civ7ReadinessLevelSchema,
    capability: Civ7ReadinessCapabilitySchema,
    sources: Civ7ReadinessSourceSummarySchema,
    controller: Civ7ReadinessControllerSummarySchema,
    errorCount: Type.Integer({ minimum: 0 }),
    nextSteps: Type.Array(Civ7ReadinessNextStepSchema),
  },
  { additionalProperties: false },
);
export type Civ7ReadinessCurrentResult = Static<
  typeof Civ7ReadinessCurrentResultSchema
>;

const Civ7ReadinessCurrentInputStandardSchema = toStandardSchema(
  Civ7ReadinessCurrentInputSchema,
);
const Civ7ReadinessCurrentResultStandardSchema = toStandardSchema(
  Civ7ReadinessCurrentResultSchema,
);

export type Civ7ReadinessCurrentContract = ContractProcedure<
  typeof Civ7ReadinessCurrentInputStandardSchema,
  typeof Civ7ReadinessCurrentResultStandardSchema,
  Civ7ControlOrpcErrorMap,
  Civ7ControlOrpcProcedureMeta
>;

export const Civ7ReadinessCurrentContract: Civ7ReadinessCurrentContract =
  civ7ControlOrpcContractBase
    .input(Civ7ReadinessCurrentInputStandardSchema)
    .output(Civ7ReadinessCurrentResultStandardSchema)
    .meta({
      family: "readiness",
      procedureKey: "readiness.current",
      proofBoundary: "local-package-test",
      risk: "runtime-support",
    });

export type Civ7ReadinessContract = Readonly<{
  current: Civ7ReadinessCurrentContract;
}>;

export const Civ7ReadinessContract: Civ7ReadinessContract = {
  current: Civ7ReadinessCurrentContract,
};

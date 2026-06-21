import {
  CheckCommandContextSchema,
  CheckReportSchema,
  SelectorRequestSchema,
} from "@internal/habitat-harness/service/modules/check/structural/schema";
import type { ContractProcedure } from "@orpc/contract";
import { eoc } from "effect-orpc";
import { type Static, Type } from "typebox";
import { type HabitatServiceErrorMap, habitatServiceErrorMap } from "../../errors.js";
import type { HabitatServiceProcedureMeta } from "../../metadata.js";
import { toStandardSchema } from "../../typebox-standard-schema.js";

const CheckServiceRunInputSchema = Type.Object(
  {
    selectors: Type.Optional(SelectorRequestSchema),
    base: Type.Optional(Type.String({ minLength: 1 })),
    baselineIntegrity: Type.Optional(Type.Boolean()),
    command: Type.Optional(CheckCommandContextSchema),
    commandArgs: Type.Optional(Type.Array(Type.String())),
    staged: Type.Optional(Type.Boolean()),
    stagedPaths: Type.Optional(Type.Array(Type.String())),
  },
  { additionalProperties: false, description: "Habitat check service run request." }
);
export type CheckServiceRunInput = Static<typeof CheckServiceRunInputSchema>;

const CheckServiceExpandBaselineInputSchema = Type.Object(
  {
    selectors: Type.Optional(SelectorRequestSchema),
    base: Type.Optional(Type.String({ minLength: 1 })),
    command: Type.Optional(CheckCommandContextSchema),
    commandArgs: Type.Optional(Type.Array(Type.String())),
  },
  { additionalProperties: false, description: "Habitat check baseline expansion request." }
);
export type CheckServiceExpandBaselineInput = Static<typeof CheckServiceExpandBaselineInputSchema>;

const CheckServiceExpandBaselineOutputSchema = Type.Union(
  [
    Type.Object(
      {
        kind: Type.Literal("expanded"),
        messages: Type.Array(Type.String()),
      },
      { additionalProperties: false, description: "Baseline expansion completed." }
    ),
    Type.Object(
      {
        kind: Type.Literal("refused"),
        message: Type.String({ minLength: 1 }),
      },
      { additionalProperties: false, description: "Baseline expansion was refused." }
    ),
  ],
  { description: "Habitat check baseline expansion result." }
);
export type CheckServiceExpandBaselineOutput = Static<
  typeof CheckServiceExpandBaselineOutputSchema
>;

const CheckServiceRunInputStandardSchema = toStandardSchema(CheckServiceRunInputSchema);
const CheckServiceRunOutputStandardSchema = toStandardSchema(CheckReportSchema);
const CheckServiceExpandBaselineInputStandardSchema = toStandardSchema(
  CheckServiceExpandBaselineInputSchema
);
const CheckServiceExpandBaselineOutputStandardSchema = toStandardSchema(
  CheckServiceExpandBaselineOutputSchema
);

export type CheckServiceRunContract = ContractProcedure<
  typeof CheckServiceRunInputStandardSchema,
  typeof CheckServiceRunOutputStandardSchema,
  HabitatServiceErrorMap,
  HabitatServiceProcedureMeta
>;

export type CheckServiceExpandBaselineContract = ContractProcedure<
  typeof CheckServiceExpandBaselineInputStandardSchema,
  typeof CheckServiceExpandBaselineOutputStandardSchema,
  HabitatServiceErrorMap,
  HabitatServiceProcedureMeta
>;

export const checkServiceRunContract: CheckServiceRunContract = eoc
  .errors(habitatServiceErrorMap)
  .input(CheckServiceRunInputStandardSchema)
  .output(CheckServiceRunOutputStandardSchema);

export const checkServiceExpandBaselineContract: CheckServiceExpandBaselineContract = eoc
  .errors(habitatServiceErrorMap)
  .input(CheckServiceExpandBaselineInputStandardSchema)
  .output(CheckServiceExpandBaselineOutputStandardSchema);

export type CheckServiceContract = Readonly<{
  run: CheckServiceRunContract;
  expandBaseline: CheckServiceExpandBaselineContract;
}>;

export const checkServiceContract: CheckServiceContract = {
  run: checkServiceRunContract,
  expandBaseline: checkServiceExpandBaselineContract,
};

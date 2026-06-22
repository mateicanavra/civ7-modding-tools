import { habitatServiceErrorMap } from "@internal/habitat-harness/service/errors";
import {
  CheckCommandContextSchema,
  CheckReportSchema,
  SelectorRequestSchema,
} from "@internal/habitat-harness/service/model/check/structural/schema";
import type { HabitatServiceProcedureContract } from "@internal/habitat-harness/service/procedure-contract";
import { toStandardSchema } from "@internal/habitat-harness/service/typebox-standard-schema";
import { eoc } from "effect-orpc";
import { type Static, Type } from "typebox";

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

export const checkServiceRunContract: HabitatServiceProcedureContract<
  typeof CheckServiceRunInputStandardSchema,
  typeof CheckServiceRunOutputStandardSchema
> = eoc
  .errors(habitatServiceErrorMap)
  .input(CheckServiceRunInputStandardSchema)
  .output(CheckServiceRunOutputStandardSchema);

export const checkServiceExpandBaselineContract: HabitatServiceProcedureContract<
  typeof CheckServiceExpandBaselineInputStandardSchema,
  typeof CheckServiceExpandBaselineOutputStandardSchema
> = eoc
  .errors(habitatServiceErrorMap)
  .input(CheckServiceExpandBaselineInputStandardSchema)
  .output(CheckServiceExpandBaselineOutputStandardSchema);

export const checkServiceContract = {
  run: checkServiceRunContract,
  expandBaseline: checkServiceExpandBaselineContract,
};

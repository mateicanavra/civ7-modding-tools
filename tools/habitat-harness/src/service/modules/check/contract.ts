import { habitatServiceErrorMap } from "@internal/habitat-harness/service/errors";
import {
  CheckReportSchema,
  SelectorRequestSchema,
} from "@internal/habitat-harness/service/model/check/index";
import { toStandardSchema } from "@internal/habitat-harness/service/typebox-standard-schema";
import { eoc } from "effect-orpc";
import { type Static, Type } from "typebox";

const CheckReportInputSchema = Type.Object(
  {
    selectors: Type.Optional(SelectorRequestSchema),
    base: Type.Optional(Type.String({ minLength: 1 })),
    baselineIntegrity: Type.Optional(Type.Boolean()),
    staged: Type.Optional(Type.Boolean()),
    stagedPaths: Type.Optional(Type.Array(Type.String())),
  },
  { additionalProperties: false, description: "Habitat check report request." }
);
export type CheckReportInput = Static<typeof CheckReportInputSchema>;

const CheckServiceExpandBaselineInputSchema = Type.Object(
  {
    selectors: Type.Optional(SelectorRequestSchema),
    base: Type.Optional(Type.String({ minLength: 1 })),
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

const CheckReportInputStandardSchema = toStandardSchema(CheckReportInputSchema);
const CheckReportOutputStandardSchema = toStandardSchema(CheckReportSchema);
const CheckServiceExpandBaselineInputStandardSchema = toStandardSchema(
  CheckServiceExpandBaselineInputSchema
);
const CheckServiceExpandBaselineOutputStandardSchema = toStandardSchema(
  CheckServiceExpandBaselineOutputSchema
);

export const checkReportContract = eoc
  .errors(habitatServiceErrorMap)
  .input(CheckReportInputStandardSchema)
  .output(CheckReportOutputStandardSchema);

export const checkServiceExpandBaselineContract = eoc
  .errors(habitatServiceErrorMap)
  .input(CheckServiceExpandBaselineInputStandardSchema)
  .output(CheckServiceExpandBaselineOutputStandardSchema);

export const checkServiceContract = {
  report: checkReportContract,
  expandBaseline: checkServiceExpandBaselineContract,
};

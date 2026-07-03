import { habitatServiceErrorMap } from "@habitat/cli/service/errors";
import {
  CheckCommandContextSchema,
  CheckReportSchema,
  SelectorRequestSchema,
} from "@habitat/cli/service/model/check/index";
import { toStandardSchema } from "@habitat/cli/service/typebox-standard-schema";
import { eoc } from "effect-orpc";
import { type Static, Type } from "typebox";

const CheckReportInputSchema = Type.Object(
  {
    selectors: Type.Optional(SelectorRequestSchema),
    base: Type.Optional(Type.String({ minLength: 1 })),
    baselineIntegrity: Type.Optional(Type.Boolean()),
    command: Type.Optional(CheckCommandContextSchema),
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

export const checkServiceContract = {
  report: eoc
    .errors(habitatServiceErrorMap)
    .input(toStandardSchema(CheckReportInputSchema))
    .output(toStandardSchema(CheckReportSchema)),
  expandBaseline: eoc
    .errors(habitatServiceErrorMap)
    .input(toStandardSchema(CheckServiceExpandBaselineInputSchema))
    .output(toStandardSchema(CheckServiceExpandBaselineOutputSchema)),
};

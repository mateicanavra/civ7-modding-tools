import { CheckReportSchema } from "@internal/habitat-harness/service/modules/check/structural/schema";
import { VerifyTargetPlanSchema } from "@internal/habitat-harness/service/modules/graph/workspace/index";
import { VerifyReceiptSchema } from "@internal/habitat-harness/service/modules/verify/proof/schema";
import { eoc } from "effect-orpc";
import { type Static, Type } from "typebox";
import { habitatServiceErrorMap } from "../../errors.js";
import type { HabitatServiceProcedureContract } from "../../procedure-contract.js";
import { toStandardSchema } from "../../typebox-standard-schema.js";

const VerifyServiceRunInputSchema = Type.Object(
  {
    base: Type.Optional(Type.String({ minLength: 1 })),
    commandArgs: Type.Optional(Type.Array(Type.String())),
    affectedExecution: Type.Optional(
      Type.Union([Type.Literal("run"), Type.Literal("plan-only")], {
        description:
          "Whether verify should execute Nx affected targets or emit a bounded receipt from the checked target plan.",
      })
    ),
  },
  { additionalProperties: false, description: "Habitat verify service run request." }
);
export type VerifyServiceRunInput = Static<typeof VerifyServiceRunInputSchema>;

const VerifyServiceAffectedResultSchema = Type.Object(
  {
    exitCode: Type.Integer(),
    stdout: Type.String(),
    stderr: Type.String(),
  },
  { additionalProperties: false, description: "Raw affected command streams for CLI handoff." }
);
export type VerifyServiceAffectedResult = Static<typeof VerifyServiceAffectedResultSchema>;

const VerifyServiceRunOutputSchema = Type.Union(
  [
    Type.Object(
      {
        kind: Type.Literal("base-refused"),
        message: Type.String({ minLength: 1 }),
      },
      { additionalProperties: false, description: "Verify refused before structural checks." }
    ),
    Type.Object(
      {
        kind: Type.Literal("completed"),
        base: Type.String({ minLength: 1 }),
        checkReport: CheckReportSchema,
        targetPlan: VerifyTargetPlanSchema,
        affectedResult: Type.Optional(VerifyServiceAffectedResultSchema),
        receipt: VerifyReceiptSchema,
      },
      { additionalProperties: false, description: "Completed Habitat verify service result." }
    ),
  ],
  { description: "Habitat verify service run result." }
);
export type VerifyServiceRunOutput = Static<typeof VerifyServiceRunOutputSchema>;

const VerifyServiceRunInputStandardSchema = toStandardSchema(VerifyServiceRunInputSchema);
const VerifyServiceRunOutputStandardSchema = toStandardSchema(VerifyServiceRunOutputSchema);

export const verifyServiceRunContract: HabitatServiceProcedureContract<
  typeof VerifyServiceRunInputStandardSchema,
  typeof VerifyServiceRunOutputStandardSchema
> = eoc
  .errors(habitatServiceErrorMap)
  .input(VerifyServiceRunInputStandardSchema)
  .output(VerifyServiceRunOutputStandardSchema);

export const verifyServiceContract = {
  run: verifyServiceRunContract,
};

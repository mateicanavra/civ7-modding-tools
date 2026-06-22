import { habitatServiceErrorMap } from "@internal/habitat-harness/service/errors";
import { CheckReportSchema } from "@internal/habitat-harness/service/model/check/index";
import { VerifyReceiptSchema } from "@internal/habitat-harness/service/model/verify/index";
import { VerifyTargetPlanSchema } from "@internal/habitat-harness/service/model/workspace/index";
import type { HabitatServiceProcedureContract } from "@internal/habitat-harness/service/procedure-contract";
import { toStandardSchema } from "@internal/habitat-harness/service/typebox-standard-schema";
import { eoc } from "effect-orpc";
import { type Static, Type } from "typebox";

const VerifyChangesInputSchema = Type.Object(
  {
    base: Type.Optional(Type.String({ minLength: 1 })),
    affectedExecution: Type.Optional(
      Type.Union([Type.Literal("run"), Type.Literal("plan-only")], {
        description:
          "Whether verify should execute Nx affected targets or emit a bounded receipt from the checked target plan.",
      })
    ),
  },
  { additionalProperties: false, description: "Habitat changes verification request." }
);
export type VerifyChangesInput = Static<typeof VerifyChangesInputSchema>;

const VerifyServiceAffectedResultSchema = Type.Object(
  {
    exitCode: Type.Integer(),
    stdout: Type.String(),
    stderr: Type.String(),
  },
  { additionalProperties: false, description: "Habitat affected verification execution result." }
);
export type VerifyServiceAffectedResult = Static<typeof VerifyServiceAffectedResultSchema>;

const VerifyChangesOutputSchema = Type.Union(
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
  { description: "Habitat changes verification result." }
);
export type VerifyChangesOutput = Static<typeof VerifyChangesOutputSchema>;

const VerifyChangesInputStandardSchema = toStandardSchema(VerifyChangesInputSchema);
const VerifyChangesOutputStandardSchema = toStandardSchema(VerifyChangesOutputSchema);

export const verifyChangesContract: HabitatServiceProcedureContract<
  typeof VerifyChangesInputStandardSchema,
  typeof VerifyChangesOutputStandardSchema
> = eoc
  .errors(habitatServiceErrorMap)
  .input(VerifyChangesInputStandardSchema)
  .output(VerifyChangesOutputStandardSchema);

export const verifyServiceContract = {
  changes: verifyChangesContract,
};

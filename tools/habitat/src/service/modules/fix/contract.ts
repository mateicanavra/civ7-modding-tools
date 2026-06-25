import { habitatServiceErrorMap } from "@habitat/cli/service/errors";
import { toStandardSchema } from "@habitat/cli/service/typebox-standard-schema";
import { eoc } from "effect-orpc";
import { type Static, Type } from "typebox";

const FixPlanPatternsInputSchema = Type.Object(
  {},
  { additionalProperties: false, description: "Habitat pattern apply planning action request." }
);

const FixApplyPatternsInputSchema = Type.Object(
  {},
  { additionalProperties: false, description: "Habitat pattern apply write action request." }
);

const FixApplyPatternsOutputSchema = Type.Object(
  {
    exitCode: Type.Integer(),
    stdout: Type.String(),
    stderr: Type.String(),
  },
  { additionalProperties: false, description: "Habitat pattern apply result." }
);

export type FixPlanPatternsInput = Static<typeof FixPlanPatternsInputSchema>;
export type FixApplyPatternsInput = Static<typeof FixApplyPatternsInputSchema>;
export type FixApplyPatternsOutput = Static<typeof FixApplyPatternsOutputSchema>;

export const fixServiceContract = {
  planPatterns: eoc
    .errors(habitatServiceErrorMap)
    .input(toStandardSchema(FixPlanPatternsInputSchema))
    .output(toStandardSchema(FixApplyPatternsOutputSchema)),
  applyPatterns: eoc
    .errors(habitatServiceErrorMap)
    .input(toStandardSchema(FixApplyPatternsInputSchema))
    .output(toStandardSchema(FixApplyPatternsOutputSchema)),
};

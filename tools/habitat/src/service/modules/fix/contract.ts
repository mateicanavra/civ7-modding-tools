import { habitatServiceErrorMap } from "@habitat/cli/service/errors";
import { toStandardSchema } from "@habitat/cli/service/typebox-standard-schema";
import { eoc } from "effect-orpc";
import { type Static, Type } from "typebox";

const FixPlanPatternsInputSchema = Type.Object(
  {
    rules: Type.Optional(Type.Array(Type.String({ minLength: 1 }), { minItems: 1 })),
  },
  { additionalProperties: false, description: "Habitat admitted fix planning request." }
);

const FixPlanPatternsOutputSchema = Type.Object(
  {
    exitCode: Type.Integer(),
    stdout: Type.String(),
    stderr: Type.String(),
  },
  { additionalProperties: false, description: "Habitat no-write fix planning result." }
);

export type FixPlanPatternsInput = Static<typeof FixPlanPatternsInputSchema>;
export type FixPlanPatternsOutput = Static<typeof FixPlanPatternsOutputSchema>;

export const fixServiceContract = {
  planPatterns: eoc
    .errors(habitatServiceErrorMap)
    .input(toStandardSchema(FixPlanPatternsInputSchema))
    .output(toStandardSchema(FixPlanPatternsOutputSchema)),
};

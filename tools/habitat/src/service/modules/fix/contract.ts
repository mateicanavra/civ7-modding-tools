import { habitatServiceErrorMap } from "@habitat/cli/service/errors";
import { toStandardSchema } from "@habitat/cli/service/typebox-standard-schema";
import { eoc } from "effect-orpc";
import { type Static, Type } from "typebox";

const FixPreviewPatternsInputSchema = Type.Object(
  {
    rules: Type.Optional(Type.Array(Type.String({ minLength: 1 }), { minItems: 1 })),
  },
  { additionalProperties: false, description: "Habitat admitted fix preview request." }
);

const FixPreviewPatternsOutputSchema = Type.Object(
  {
    exitCode: Type.Integer(),
    stdout: Type.String(),
    stderr: Type.String(),
  },
  { additionalProperties: false, description: "Habitat no-write fix preview result." }
);

export type FixPreviewPatternsInput = Static<typeof FixPreviewPatternsInputSchema>;
export type FixPreviewPatternsOutput = Static<typeof FixPreviewPatternsOutputSchema>;

export const fixServiceContract = {
  previewPatterns: eoc
    .errors(habitatServiceErrorMap)
    .input(toStandardSchema(FixPreviewPatternsInputSchema))
    .output(toStandardSchema(FixPreviewPatternsOutputSchema)),
};

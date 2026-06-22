import { habitatServiceErrorMap } from "@internal/habitat-harness/service/errors";
import { toStandardSchema } from "@internal/habitat-harness/service/typebox-standard-schema";
import { eoc } from "effect-orpc";
import { type Static, Type } from "typebox";

const FixCommandIntentSchema = Type.Object(
  {
    kind: Type.Union([Type.Literal("dry-run-intent"), Type.Literal("live-write-intent")]),
  },
  { additionalProperties: false, description: "Habitat pattern apply intent." }
);

const FixApplyPatternsOutputSchema = Type.Object(
  {
    exitCode: Type.Integer(),
    stdout: Type.String(),
    stderr: Type.String(),
  },
  { additionalProperties: false, description: "Habitat pattern apply result." }
);

export type FixApplyPatternsInput = Static<typeof FixCommandIntentSchema>;
export type FixApplyPatternsOutput = Static<typeof FixApplyPatternsOutputSchema>;

export const fixServiceContract = {
  applyPatterns: eoc
    .errors(habitatServiceErrorMap)
    .input(toStandardSchema(FixCommandIntentSchema))
    .output(toStandardSchema(FixApplyPatternsOutputSchema)),
};

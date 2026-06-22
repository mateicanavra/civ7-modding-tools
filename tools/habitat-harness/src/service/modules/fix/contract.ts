import { habitatServiceErrorMap } from "@internal/habitat-harness/service/errors";
import type { HabitatServiceProcedureContract } from "@internal/habitat-harness/service/procedure-contract";
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

const FixApplyPatternsInputStandardSchema = toStandardSchema(FixCommandIntentSchema);
const FixApplyPatternsOutputStandardSchema = toStandardSchema(FixApplyPatternsOutputSchema);

export type FixApplyPatternsInput = Static<typeof FixCommandIntentSchema>;
export type FixApplyPatternsOutput = Static<typeof FixApplyPatternsOutputSchema>;

export const fixApplyPatternsContract: HabitatServiceProcedureContract<
  typeof FixApplyPatternsInputStandardSchema,
  typeof FixApplyPatternsOutputStandardSchema
> = eoc
  .errors(habitatServiceErrorMap)
  .input(FixApplyPatternsInputStandardSchema)
  .output(FixApplyPatternsOutputStandardSchema);

export const fixServiceContract = {
  applyPatterns: fixApplyPatternsContract,
};

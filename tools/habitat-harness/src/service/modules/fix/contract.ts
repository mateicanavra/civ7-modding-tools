import { habitatServiceErrorMap } from "@internal/habitat-harness/service/errors";
import type { HabitatServiceProcedureContract } from "@internal/habitat-harness/service/procedure-contract";
import { toStandardSchema } from "@internal/habitat-harness/service/typebox-standard-schema";
import { eoc } from "effect-orpc";
import { type Static, Type } from "typebox";

const FixCommandIntentSchema = Type.Object(
  {
    kind: Type.Union([Type.Literal("dry-run-intent"), Type.Literal("live-write-intent")]),
  },
  { additionalProperties: false, description: "Habitat fix command intent." }
);

const FixServiceRunOutputSchema = Type.Object(
  {
    exitCode: Type.Integer(),
    stdout: Type.String(),
    stderr: Type.String(),
  },
  { additionalProperties: false, description: "Habitat fix service execution result." }
);

const FixServiceRunInputStandardSchema = toStandardSchema(FixCommandIntentSchema);
const FixServiceRunOutputStandardSchema = toStandardSchema(FixServiceRunOutputSchema);

export type FixServiceRunInput = Static<typeof FixCommandIntentSchema>;
export type FixServiceRunOutput = Static<typeof FixServiceRunOutputSchema>;

export const fixServiceRunContract: HabitatServiceProcedureContract<
  typeof FixServiceRunInputStandardSchema,
  typeof FixServiceRunOutputStandardSchema
> = eoc
  .errors(habitatServiceErrorMap)
  .input(FixServiceRunInputStandardSchema)
  .output(FixServiceRunOutputStandardSchema);

export const fixServiceContract = {
  run: fixServiceRunContract,
};

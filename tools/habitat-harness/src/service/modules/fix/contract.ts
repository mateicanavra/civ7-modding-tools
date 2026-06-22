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

export type FixServiceRunInput = Static<typeof FixCommandIntentSchema>;

const FixServiceRunOutputSchema = Type.Object(
  {
    exitCode: Type.Integer(),
    stdout: Type.String(),
    stderr: Type.String(),
  },
  { additionalProperties: false, description: "Raw fix command streams for CLI handoff." }
);
export type FixServiceRunOutput = Static<typeof FixServiceRunOutputSchema>;

const FixServiceRunInputStandardSchema = toStandardSchema(FixCommandIntentSchema);
const FixServiceRunOutputStandardSchema = toStandardSchema(FixServiceRunOutputSchema);

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

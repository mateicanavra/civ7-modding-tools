import type { ContractProcedure } from "@orpc/contract";
import { eoc } from "effect-orpc";
import { type Static, Type } from "typebox";
import { type HabitatServiceErrorMap, habitatServiceErrorMap } from "../../errors.js";
import type { HabitatServiceProcedureMeta } from "../../metadata.js";
import { toStandardSchema } from "../../typebox-standard-schema.js";

export const FixCommandIntentSchema = Type.Object(
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

export type FixServiceRunContract = ContractProcedure<
  typeof FixServiceRunInputStandardSchema,
  typeof FixServiceRunOutputStandardSchema,
  HabitatServiceErrorMap,
  HabitatServiceProcedureMeta
>;

export const fixServiceRunContract: FixServiceRunContract = eoc
  .errors(habitatServiceErrorMap)
  .input(FixServiceRunInputStandardSchema)
  .output(FixServiceRunOutputStandardSchema);

export type FixServiceContract = Readonly<{
  run: FixServiceRunContract;
}>;

export const fixServiceContract: FixServiceContract = {
  run: fixServiceRunContract,
};

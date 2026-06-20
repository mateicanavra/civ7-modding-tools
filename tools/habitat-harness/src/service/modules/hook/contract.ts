import type { ContractProcedure } from "@orpc/contract";
import { eoc } from "effect-orpc";
import { type Static, Type } from "typebox";
import { type HabitatServiceErrorMap, habitatServiceErrorMap } from "../../errors.js";
import type { HabitatServiceProcedureMeta } from "../../metadata.js";
import { toStandardSchema } from "../../typebox-standard-schema.js";

const HookServiceRunInputSchema = Type.Object(
  {
    name: Type.Optional(Type.String()),
    base: Type.Optional(Type.String()),
  },
  { additionalProperties: false, description: "Habitat hook service run request." }
);
export type HookServiceRunInput = Static<typeof HookServiceRunInputSchema>;

const HookServiceRunOutputSchema = Type.Object(
  {
    exitCode: Type.Integer(),
    stdout: Type.String(),
    stderr: Type.String(),
  },
  { additionalProperties: false, description: "Raw hook command streams for CLI handoff." }
);
export type HookServiceRunOutput = Static<typeof HookServiceRunOutputSchema>;

const HookServiceRunInputStandardSchema = toStandardSchema(HookServiceRunInputSchema);
const HookServiceRunOutputStandardSchema = toStandardSchema(HookServiceRunOutputSchema);

export type HookServiceRunContract = ContractProcedure<
  typeof HookServiceRunInputStandardSchema,
  typeof HookServiceRunOutputStandardSchema,
  HabitatServiceErrorMap,
  HabitatServiceProcedureMeta
>;

export const hookServiceRunContract: HookServiceRunContract = eoc
  .errors(habitatServiceErrorMap)
  .input(HookServiceRunInputStandardSchema)
  .output(HookServiceRunOutputStandardSchema);

export type HookServiceContract = Readonly<{
  run: HookServiceRunContract;
}>;

export const hookServiceContract: HookServiceContract = {
  run: hookServiceRunContract,
};

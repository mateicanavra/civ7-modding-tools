import { habitatServiceErrorMap } from "@internal/habitat-harness/service/errors";
import type { HabitatServiceProcedureContract } from "@internal/habitat-harness/service/procedure-contract";
import { toStandardSchema } from "@internal/habitat-harness/service/typebox-standard-schema";
import { eoc } from "effect-orpc";
import { type Static, Type } from "typebox";

const HookServiceRunInputSchema = Type.Object(
  {
    name: Type.Optional(Type.String()),
    base: Type.Optional(Type.String()),
    resourcePolicy: Type.Optional(
      Type.Object(
        {
          path: Type.String({ minLength: 1 }),
          commands: Type.Object(
            {
              publish: Type.String({ minLength: 1 }),
              status: Type.String({ minLength: 1 }),
              init: Type.String({ minLength: 1 }),
              unlock: Type.String({ minLength: 1 }),
            },
            { additionalProperties: false }
          ),
        },
        { additionalProperties: false }
      )
    ),
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
  { additionalProperties: false, description: "Habitat hook service execution result." }
);
export type HookServiceRunOutput = Static<typeof HookServiceRunOutputSchema>;

const HookServiceRunInputStandardSchema = toStandardSchema(HookServiceRunInputSchema);
const HookServiceRunOutputStandardSchema = toStandardSchema(HookServiceRunOutputSchema);

export const hookServiceRunContract: HabitatServiceProcedureContract<
  typeof HookServiceRunInputStandardSchema,
  typeof HookServiceRunOutputStandardSchema
> = eoc
  .errors(habitatServiceErrorMap)
  .input(HookServiceRunInputStandardSchema)
  .output(HookServiceRunOutputStandardSchema);

export const hookServiceContract = {
  run: hookServiceRunContract,
};

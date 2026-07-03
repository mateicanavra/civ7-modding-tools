import { habitatServiceErrorMap } from "@internal/habitat-harness/service/errors";
import type { HabitatServiceProcedureContract } from "@internal/habitat-harness/service/procedure-contract";
import { toStandardSchema } from "@internal/habitat-harness/service/typebox-standard-schema";
import { eoc } from "effect-orpc";
import { type Static, Type } from "typebox";

const HookExecuteInputSchema = Type.Object(
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
  { additionalProperties: false, description: "Habitat hook execution request." }
);
export type HookExecuteInput = Static<typeof HookExecuteInputSchema>;

const HookExecuteOutputSchema = Type.Object(
  {
    exitCode: Type.Integer(),
    stdout: Type.String(),
    stderr: Type.String(),
  },
  { additionalProperties: false, description: "Habitat hook execution result." }
);
export type HookExecuteOutput = Static<typeof HookExecuteOutputSchema>;

const HookExecuteInputStandardSchema = toStandardSchema(HookExecuteInputSchema);
const HookExecuteOutputStandardSchema = toStandardSchema(HookExecuteOutputSchema);

export const hookExecuteContract: HabitatServiceProcedureContract<
  typeof HookExecuteInputStandardSchema,
  typeof HookExecuteOutputStandardSchema
> = eoc
  .errors(habitatServiceErrorMap)
  .input(HookExecuteInputStandardSchema)
  .output(HookExecuteOutputStandardSchema);

export const hookServiceContract = {
  execute: hookExecuteContract,
};

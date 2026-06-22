import { habitatServiceErrorMap } from "@internal/habitat-harness/service/errors";
import type { HabitatServiceProcedureContract } from "@internal/habitat-harness/service/procedure-contract";
import { toStandardSchema } from "@internal/habitat-harness/service/typebox-standard-schema";
import { eoc } from "effect-orpc";
import { type Static, Type } from "typebox";

const HookPreCommitInputSchema = Type.Object(
  {
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
  { additionalProperties: false, description: "Habitat pre-commit hook action request." }
);
export type HookPreCommitInput = Static<typeof HookPreCommitInputSchema>;

const HookPrePushInputSchema = Type.Object(
  {
    base: Type.Optional(Type.String()),
  },
  { additionalProperties: false, description: "Habitat pre-push hook action request." }
);
export type HookPrePushInput = Static<typeof HookPrePushInputSchema>;

const HookResultSchema = Type.Object(
  {
    exitCode: Type.Integer(),
    stdout: Type.String(),
    stderr: Type.String(),
  },
  { additionalProperties: false, description: "Habitat hook action result." }
);
export type HookResult = Static<typeof HookResultSchema>;

const HookPreCommitInputStandardSchema = toStandardSchema(HookPreCommitInputSchema);
const HookPrePushInputStandardSchema = toStandardSchema(HookPrePushInputSchema);
const HookResultStandardSchema = toStandardSchema(HookResultSchema);

export const hookPreCommitContract: HabitatServiceProcedureContract<
  typeof HookPreCommitInputStandardSchema,
  typeof HookResultStandardSchema
> = eoc
  .errors(habitatServiceErrorMap)
  .input(HookPreCommitInputStandardSchema)
  .output(HookResultStandardSchema);

export const hookPrePushContract: HabitatServiceProcedureContract<
  typeof HookPrePushInputStandardSchema,
  typeof HookResultStandardSchema
> = eoc
  .errors(habitatServiceErrorMap)
  .input(HookPrePushInputStandardSchema)
  .output(HookResultStandardSchema);

export const hookServiceContract = {
  preCommit: hookPreCommitContract,
  prePush: hookPrePushContract,
};

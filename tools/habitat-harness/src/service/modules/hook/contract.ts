import { habitatServiceErrorMap } from "@internal/habitat-harness/service/errors";
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

export const hookServiceContract = {
  preCommit: eoc
    .errors(habitatServiceErrorMap)
    .input(toStandardSchema(HookPreCommitInputSchema))
    .output(toStandardSchema(HookResultSchema)),
  prePush: eoc
    .errors(habitatServiceErrorMap)
    .input(toStandardSchema(HookPrePushInputSchema))
    .output(toStandardSchema(HookResultSchema)),
};

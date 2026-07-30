import {
  Civ7GameOptionsSchema,
  Civ7MapOptionsSchema,
  Civ7PlayerSetupsSchema,
  Civ7SignedIntSeedSchema,
} from "@civ7/map-policy/setup";
import { ORPCTaggedError } from "effect-orpc";
import { Type } from "typebox";

import { base } from "../../../base";
import { Civ7ControlOrpcCorrelationIdSchema } from "../../../model/dto/correlation";
import { toStandardSchema as standard } from "../../../schema/typebox-standard-schema";

const Civ7LifecycleSinglePlayerFailureDataSchema = Type.Object(
  {
    procedureKey: Type.Literal("lifecycle.singlePlayer.start", {
      description: "Lifecycle procedure that reported the failure.",
    }),
    source: Type.Literal("direct-control-facade", {
      description: "Runtime boundary that reported the failure.",
    }),
    step: Type.Optional(
      Type.String({
        description: "Lifecycle step that failed, when the procedure reached one.",
      })
    ),
    detail: Type.Optional(
      Type.String({
        description: "Human-readable detail from the failed runtime operation.",
      })
    ),
    correlationId: Type.Optional(Civ7ControlOrpcCorrelationIdSchema),
  },
  {
    additionalProperties: false,
    description: "Failure evidence shared by single-player lifecycle errors.",
  }
);

const Civ7LifecycleStateRefusedErrorDataSchema = Type.Object(
  {
    ...Civ7LifecycleSinglePlayerFailureDataSchema.properties,
    initialPhase: Type.Union(
      [Type.Literal("loading"), Type.Literal("begin-ready"), Type.Literal("unavailable")],
      {
        description: "Observed phase that refused the single-player start request.",
      }
    ),
  },
  {
    additionalProperties: false,
    description: "Evidence for a lifecycle request refused before mutation.",
  }
);

const Civ7LifecycleDependencyUnavailableErrorDataSchema = Type.Object(
  {
    ...Civ7LifecycleSinglePlayerFailureDataSchema.properties,
  },
  {
    additionalProperties: false,
    description: "Evidence for unavailable lifecycle dependencies.",
  }
);

const Civ7LifecycleMutationUncertainErrorDataSchema = Type.Object(
  {
    ...Civ7LifecycleSinglePlayerFailureDataSchema.properties,
    noRepeat: Type.Literal(true, {
      description: "Forbids automatic repetition while the mutation outcome is uncertain.",
    }),
  },
  {
    additionalProperties: false,
    description: "Evidence for a lifecycle mutation with an uncertain outcome.",
  }
);

const Civ7LifecycleVerificationFailedErrorDataSchema = Type.Object(
  {
    ...Civ7LifecycleSinglePlayerFailureDataSchema.properties,
    noRepeat: Type.Literal(true, {
      description: "Forbids automatic repetition after start verification fails.",
    }),
  },
  {
    additionalProperties: false,
    description: "Evidence for a lifecycle start that could not be verified.",
  }
);

const Civ7LifecycleStateRefusedError = ORPCTaggedError("Civ7LifecycleStateRefusedError", {
  code: "LIFECYCLE_STATE_REFUSED",
  message: "Civ7 lifecycle start was refused before mutation.",
  schema: standard(Civ7LifecycleStateRefusedErrorDataSchema),
  status: 409,
});

const Civ7LifecycleDependencyUnavailableError = ORPCTaggedError(
  "Civ7LifecycleDependencyUnavailableError",
  {
    code: "LIFECYCLE_DEPENDENCY_UNAVAILABLE",
    message: "Civ7 lifecycle dependencies are unavailable.",
    schema: standard(Civ7LifecycleDependencyUnavailableErrorDataSchema),
    status: 503,
  }
);

const Civ7LifecycleMutationUncertainError = ORPCTaggedError("Civ7LifecycleMutationUncertainError", {
  code: "LIFECYCLE_MUTATION_UNCERTAIN",
  message: "Civ7 lifecycle mutation outcome is uncertain; do not repeat automatically.",
  schema: standard(Civ7LifecycleMutationUncertainErrorDataSchema),
  status: 502,
});

const Civ7LifecycleVerificationFailedError = ORPCTaggedError(
  "Civ7LifecycleVerificationFailedError",
  {
    code: "LIFECYCLE_VERIFICATION_FAILED",
    message: "Civ7 lifecycle start could not be verified.",
    schema: standard(Civ7LifecycleVerificationFailedErrorDataSchema),
    status: 502,
  }
);

const lifecycleErrors = {
  LIFECYCLE_DEPENDENCY_UNAVAILABLE: Civ7LifecycleDependencyUnavailableError,
  LIFECYCLE_MUTATION_UNCERTAIN: Civ7LifecycleMutationUncertainError,
  LIFECYCLE_STATE_REFUSED: Civ7LifecycleStateRefusedError,
  LIFECYCLE_VERIFICATION_FAILED: Civ7LifecycleVerificationFailedError,
};

const Civ7SingleLineSchema = Type.String({
  minLength: 1,
  maxLength: 512,
  pattern: "^(?=.*\\S)[^\\r\\n\\0]+$",
  description: "A non-empty single-line value accepted by the Civ7 setup UI.",
});

const Civ7MapScriptSchema = Civ7SingleLineSchema;

const Civ7MapSizeTypeSchema = Type.String({
  pattern: "^MAPSIZE_[A-Z0-9_]+$",
  description: "The Civ7 map-size type selected for the new game.",
});

const Civ7PlayerCountSchema = Type.Integer({
  minimum: 1,
  maximum: 64,
  description: "Number of players configured for the new game.",
});

const Civ7MapDimensionSchema = Type.Integer({
  minimum: 1,
  maximum: 10_000,
  description: "Observed map width or height in plots.",
});

const Civ7PlotCountSchema = Type.Integer({
  minimum: 1,
  maximum: 100_000_000,
  description: "Observed number of plots in the generated map.",
});

const Civ7TurnSchema = Type.Integer({
  minimum: 0,
  description: "Observed turn number after the game starts.",
});

const Civ7TargetModIdSchema = Type.String({
  minLength: 1,
  maxLength: 512,
  pattern: "^(?=.*[A-Za-z0-9])(?!.*[\\r\\n\\0{}])\\S(?:.*\\S)?$",
  description: "Mod identifier that must be active before setup begins.",
});

const Civ7LifecycleSetupEvidenceSchema = Type.Object(
  {
    mapScript: Civ7MapScriptSchema,
    mapSize: Civ7MapSizeTypeSchema,
    mapSeed: Civ7SignedIntSeedSchema,
    gameSeed: Civ7SignedIntSeedSchema,
    playerCount: Type.Optional(Civ7PlayerCountSchema),
    targetModId: Civ7TargetModIdSchema,
    mapRowFiles: Type.Array(Civ7MapScriptSchema, {
      minItems: 1,
      uniqueItems: true,
      description: "Setup-screen map rows observed while selecting the requested map script.",
    }),
  },
  {
    additionalProperties: false,
    description: "Requested setup values confirmed before beginning the game.",
  }
);

const Civ7LifecycleRuntimeEvidenceSchema = Type.Object(
  {
    seed: Civ7SignedIntSeedSchema,
    mapSize: Civ7MapSizeTypeSchema,
    width: Type.Optional(Civ7MapDimensionSchema),
    height: Type.Optional(Civ7MapDimensionSchema),
    plotCount: Type.Optional(Civ7PlotCountSchema),
    turn: Type.Optional(Civ7TurnSchema),
    gameHash: Type.Optional(
      Type.Number({
        description: "Runtime game hash observed after the new game starts.",
      })
    ),
  },
  {
    additionalProperties: false,
    description: "Runtime values observed after the requested game starts.",
  }
);

const Civ7SavedConfigIdentitySchema = Type.Object(
  {
    id: Civ7SingleLineSchema,
    displayName: Civ7SingleLineSchema,
    fileName: Type.String({
      minLength: 9,
      maxLength: 512,
      pattern: "^[^/\\\\\\r\\n\\0]+\\.[Cc][Ii][Vv]7[Cc][Ff][Gg]$",
      description: "Civ7 configuration filename selected for the setup request.",
    }),
  },
  {
    additionalProperties: false,
    description: "Identity of an optional saved Civ7 setup configuration.",
  }
);

const Civ7LifecycleSinglePlayerStartInputSchema = Type.Object(
  {
    mapScript: Civ7MapScriptSchema,
    mapSize: Civ7MapSizeTypeSchema,
    mapSeed: Civ7SignedIntSeedSchema,
    gameSeed: Civ7SignedIntSeedSchema,
    playerCount: Type.Optional(Civ7PlayerCountSchema),
    targetModId: Civ7TargetModIdSchema,
    savedConfig: Type.Optional(Civ7SavedConfigIdentitySchema),
    gameOptions: Civ7GameOptionsSchema,
    mapOptions: Civ7MapOptionsSchema,
    playerOptions: Civ7PlayerSetupsSchema,
    activeGamePolicy: Type.Literal("exit-active-game", {
      description: "Required policy for leaving an active game before applying setup.",
    }),
  },
  {
    additionalProperties: false,
    description: "Complete setup request for starting a Civ7 single-player game.",
  }
);

const Civ7LifecycleSinglePlayerStartResultSchema = Type.Object(
  {
    correlationId: Type.Optional(Civ7ControlOrpcCorrelationIdSchema),
    status: Type.Literal("started", {
      description: "Confirms that the requested single-player game reached runtime.",
    }),
    evidence: Type.Object(
      {
        setup: Civ7LifecycleSetupEvidenceSchema,
        runtime: Civ7LifecycleRuntimeEvidenceSchema,
      },
      {
        additionalProperties: false,
        description: "Setup and runtime evidence proving which game started.",
      }
    ),
    transition: Type.Union(
      [
        Type.Object(
          {
            initialPhase: Type.Literal("shell", {
              description: "Setup began from the Civ7 shell.",
            }),
            activeGameExit: Type.Literal("not-needed", {
              description: "No active game needed to be exited.",
            }),
          },
          { additionalProperties: false }
        ),
        Type.Object(
          {
            initialPhase: Type.Literal("running-game", {
              description: "Setup began while another game was running.",
            }),
            activeGameExit: Type.Literal("exited", {
              description: "The previous active game was exited before setup.",
            }),
          },
          { additionalProperties: false }
        ),
      ],
      {
        description: "State transition performed before applying the requested setup.",
      }
    ),
  },
  {
    additionalProperties: false,
    description: "Verified outcome of a single-player start request.",
  }
);

export const singlePlayerStart = base
  .errors(lifecycleErrors)
  .input(standard(Civ7LifecycleSinglePlayerStartInputSchema))
  .output(standard(Civ7LifecycleSinglePlayerStartResultSchema))
  .meta({
    family: "lifecycle",
    procedureKey: "lifecycle.singlePlayer.start",
    proofBoundary: "pending-runtime-proof",
    risk: "mutation",
  });

import { Type } from "typebox";

import { base } from "../../../base";
import { toStandardSchema as standard } from "../../../schema/typebox-standard-schema";

const Civ7ReadinessCurrentInputSchema = Type.Object(
  {},
  {
    additionalProperties: false,
    description: "Empty request for the current Civ7 control readiness snapshot.",
  }
);

const Civ7ReadinessLevelSchema = Type.Union([
  Type.Literal("tuner-ready"),
  Type.Literal("app-ui-game"),
  Type.Literal("begin-ready"),
  Type.Literal("loading"),
  Type.Literal("shell"),
  Type.Literal("unavailable"),
]);

const Civ7ReadinessCapabilitySchema = Type.Object(
  {
    canObserve: Type.Boolean({
      description: "Whether the current runtime state supports service reads.",
    }),
    canMutate: Type.Boolean({
      description: "Whether the current runtime state supports guarded mutations.",
    }),
    reason: Type.String({
      description: "Why the reported observe and mutate capabilities are available.",
    }),
  },
  {
    additionalProperties: false,
    description: "Control capabilities available at the current readiness level.",
  }
);

const Civ7ReadinessSourceSummarySchema = Type.Object(
  {
    gameUi: Type.Object(
      {
        inGame: Type.Union([Type.Boolean(), Type.Null()], {
          description: "Whether the game UI reported an active game, or null if unreadable.",
        }),
        inShell: Type.Union([Type.Boolean(), Type.Null()], {
          description: "Whether the game UI reported the shell, or null if unreadable.",
        }),
        inLoading: Type.Union([Type.Boolean(), Type.Null()], {
          description: "Whether the game UI reported loading, or null if unreadable.",
        }),
        canBeginGame: Type.Union([Type.Boolean(), Type.Null()], {
          description: "Whether the game UI can begin the configured game, or null if unreadable.",
        }),
      },
      {
        additionalProperties: false,
        description: "Readiness signals observed from the Civ7 application UI.",
      }
    ),
    runtimeControl: Type.Object(
      {
        ready: Type.Union([Type.Boolean(), Type.Null()], {
          description: "Whether low-level runtime control is ready, or null if unavailable.",
        }),
      },
      {
        additionalProperties: false,
        description: "Readiness signal observed from the runtime control connection.",
      }
    ),
  },
  {
    additionalProperties: false,
    description: "Source observations used to classify control readiness.",
  }
);

const Civ7ReadinessControllerProcedureRiskSchema = Type.Union([
  Type.Literal("read-only"),
  Type.Literal("mutation"),
]);

const Civ7ReadinessControllerProcedureSchema = Type.Object(
  {
    procedureKey: Type.String({
      minLength: 1,
      description: "Stable identifier of a procedure supported by the active controller.",
    }),
    risk: Civ7ReadinessControllerProcedureRiskSchema,
  },
  {
    additionalProperties: false,
    description: "Controller-supported procedure and its operation risk.",
  }
);

const Civ7ReadinessControllerSummarySchema = Type.Object(
  {
    supportedProcedures: Type.Array(Civ7ReadinessControllerProcedureSchema, {
      description: "Procedures exposed by the active controller.",
    }),
  },
  {
    additionalProperties: false,
    description: "Capabilities advertised by the optional controller.",
  }
);

const Civ7ReadinessNextStepSchema = Type.Object(
  {
    kind: Type.Union(
      [
        Type.Literal("read-attention"),
        Type.Literal("read-strategy-front"),
        Type.Literal("read-world"),
        Type.Literal("restore-tuner"),
        Type.Literal("begin-game"),
        Type.Literal("wait-loading"),
        Type.Literal("enter-game"),
        Type.Literal("inspect-runtime"),
      ],
      {
        description: "Recommended action for the current readiness level.",
      }
    ),
    source: Type.Literal("readiness.current", {
      description: "Procedure that produced the readiness recommendation.",
    }),
    label: Type.String({
      description: "Human-readable readiness recommendation.",
    }),
  },
  { additionalProperties: false }
);

const Civ7ReadinessCurrentResultSchema = Type.Object(
  {
    playable: Type.Boolean({
      description: "Whether Civ7 currently supports both service reads and guarded actions.",
    }),
    readiness: Civ7ReadinessLevelSchema,
    capability: Civ7ReadinessCapabilitySchema,
    sources: Civ7ReadinessSourceSummarySchema,
    controller: Civ7ReadinessControllerSummarySchema,
    errorCount: Type.Integer({
      minimum: 0,
      description: "Number of runtime probe errors observed while classifying readiness.",
    }),
    nextSteps: Type.Array(Civ7ReadinessNextStepSchema, {
      description: "Recommended actions for reaching or using a playable state.",
    }),
  },
  {
    additionalProperties: false,
    description: "Current Civ7 control readiness, evidence, and supported follow-ups.",
  }
);

export const current = base
  .input(standard(Civ7ReadinessCurrentInputSchema))
  .output(standard(Civ7ReadinessCurrentResultSchema))
  .meta({
    family: "readiness",
    procedureKey: "readiness.current",
    proofBoundary: "local-package-test",
    risk: "runtime-support",
  });

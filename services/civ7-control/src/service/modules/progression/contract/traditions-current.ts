import { Type } from "typebox";

import { base } from "../../../base";
import { toStandardSchema as standard } from "../../../schema/typebox-standard-schema";

const Civ7ProgressionTraditionsInputSchema = Type.Object(
  {
    playerId: Type.Optional(
      Type.Integer({
        minimum: 0,
        maximum: 1024,
        description: "Player whose traditions should be read.",
      })
    ),
  },
  {
    additionalProperties: false,
    description: "Optional player selection for the traditions view.",
  }
);

const Civ7ProgressionTraditionsProbeSchema = Type.Union([
  Type.Object(
    {
      ok: Type.Literal(true, {
        description: "Confirms that the runtime probe succeeded.",
      }),
      value: Type.Unknown({
        description: "Raw value returned by the successful runtime probe.",
      }),
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      ok: Type.Literal(false, {
        description: "Confirms that the runtime probe failed.",
      }),
      error: Type.String({
        description: "Failure detail returned by the runtime probe.",
      }),
    },
    { additionalProperties: false }
  ),
]);

const Civ7ProgressionTraditionActionDescriptorSchema = Type.Object(
  {
    kind: Type.Union([Type.Literal("activate"), Type.Literal("deactivate")], {
      description: "Semantic tradition change offered by the runtime.",
    }),
    action: Type.Union([Type.Number(), Type.Null()], {
      description: "Runtime action identifier, or null when unavailable.",
    }),
    validationSuccess: Type.Union([Type.Boolean(), Type.Null()], {
      description: "Whether runtime validation succeeded, or null when unreadable.",
    }),
    parameters: Type.Object(
      {
        traditionType: Type.Number({
          description: "Runtime tradition identifier for the action.",
        }),
        action: Type.Union([Type.Number(), Type.Null()], {
          description: "Runtime action identifier, or null when unavailable.",
        }),
      },
      {
        additionalProperties: false,
        description: "Structured inputs required to request the tradition change.",
      }
    ),
    nextSteps: Type.Array(
      Type.Object(
        {
          kind: Type.Union(
            [Type.Literal("validate-tradition-change"), Type.Literal("request-tradition-change")],
            {
              description: "Recommended stage of the tradition-change workflow.",
            }
          ),
          source: Type.Literal("progression.traditions.current", {
            description: "Procedure that produced the tradition recommendation.",
          }),
          label: Type.String({
            description: "Human-readable tradition recommendation.",
          }),
          parameters: Type.Object(
            {
              traditionType: Type.Number({
                description: "Runtime tradition identifier for the follow-up.",
              }),
              action: Type.Union([Type.Number(), Type.Null()], {
                description: "Runtime action identifier, or null when unavailable.",
              }),
            },
            {
              additionalProperties: false,
              description: "Structured inputs for the recommended follow-up.",
            }
          ),
        },
        { additionalProperties: false }
      ),
      {
        description: "Validation and request steps for this tradition action.",
      }
    ),
  },
  {
    additionalProperties: false,
    description: "Available runtime action for one tradition.",
  }
);

const Civ7ProgressionTraditionRowSchema = Type.Object(
  {
    id: Type.Number({
      description: "Stable runtime tradition identifier.",
    }),
    type: Type.Union([Type.String(), Type.Null()], {
      description: "Runtime tradition type, or null when unavailable.",
    }),
    name: Type.Union([Type.String(), Type.Null()], {
      description: "Localized tradition name, or null when unavailable.",
    }),
    description: Type.Union([Type.String(), Type.Null()], {
      description: "Localized tradition description, or null when unavailable.",
    }),
    ageType: Type.Union([Type.String(), Type.Null()], {
      description: "Age associated with the tradition, or null when unavailable.",
    }),
    cultureSlotType: Type.Union([Type.String(), Type.Null()], {
      description: "Culture slot type used by the tradition, or null when unavailable.",
    }),
    traitType: Type.Union([Type.String(), Type.Null()], {
      description: "Trait associated with the tradition, or null when unavailable.",
    }),
    isCrisis: Type.Boolean({
      description: "Whether the tradition occupies a crisis slot.",
    }),
    active: Type.Boolean({
      description: "Whether the tradition is currently active.",
    }),
    unlocked: Type.Boolean({
      description: "Whether the player has unlocked the tradition.",
    }),
    recentUnlock: Type.Boolean({
      description: "Whether the tradition was unlocked recently.",
    }),
    actions: Type.Array(Civ7ProgressionTraditionActionDescriptorSchema, {
      description: "Runtime-validated actions available for the tradition.",
    }),
  },
  {
    additionalProperties: false,
    description: "Player-visible tradition state and available actions.",
  }
);

const Civ7ProgressionTraditionsNextStepSchema = Type.Object(
  {
    kind: Type.Union(
      [
        Type.Literal("inspect-tradition-change"),
        Type.Literal("free-policy-slot"),
        Type.Literal("observe"),
      ],
      {
        description: "Recommended semantic action based on traditions evidence.",
      }
    ),
    source: Type.Literal("progression.traditions.current", {
      description: "Procedure that produced the traditions recommendation.",
    }),
    label: Type.String({
      description: "Human-readable traditions recommendation.",
    }),
  },
  { additionalProperties: false }
);

const Civ7ProgressionTraditionsResultSchema = Type.Object(
  {
    playerId: Type.Integer({
      minimum: 0,
      description: "Runtime player identifier represented by the traditions view.",
    }),
    sourceStatus: Type.Object(
      {
        traditions: Type.Literal("read", {
          description: "Confirms that runtime tradition evidence was read.",
        }),
      },
      {
        additionalProperties: false,
        description: "Read coverage for traditions evidence sources.",
      }
    ),
    hiddenInfoPolicy: Type.Literal("player-culture-runtime", {
      description: "Policy limiting the view to the player's runtime culture evidence.",
    }),
    summary: Type.Object(
      {
        activeCount: Type.Integer({
          minimum: 0,
          description: "Number of active traditions.",
        }),
        availableCount: Type.Integer({
          minimum: 0,
          description: "Number of traditions available to the player.",
        }),
        recentUnlockCount: Type.Integer({
          minimum: 0,
          description: "Number of recently unlocked traditions.",
        }),
        openSlotCount: Type.Integer({
          minimum: 0,
          description: "Number of currently open policy slots.",
        }),
        enabledAvailableCount: Type.Integer({
          minimum: 0,
          description: "Available traditions with at least one valid action.",
        }),
        disabledAvailableCount: Type.Integer({
          minimum: 0,
          description: "Available traditions without a valid action.",
        }),
        nextStepCount: Type.Integer({
          minimum: 0,
          description: "Number of recommended follow-ups.",
        }),
      },
      {
        additionalProperties: false,
        description: "Counts summarizing tradition availability and actions.",
      }
    ),
    turn: Civ7ProgressionTraditionsProbeSchema,
    turnDate: Civ7ProgressionTraditionsProbeSchema,
    governmentType: Civ7ProgressionTraditionsProbeSchema,
    government: Type.Object(
      {
        type: Type.Union([Type.String(), Type.Null()], {
          description: "Runtime government type, or null when unavailable.",
        }),
        name: Type.Union([Type.String(), Type.Null()], {
          description: "Localized government name, or null when unavailable.",
        }),
      },
      {
        additionalProperties: false,
        description: "Government associated with the player's policy slots.",
      }
    ),
    slots: Type.Object(
      {
        total: Civ7ProgressionTraditionsProbeSchema,
        normal: Civ7ProgressionTraditionsProbeSchema,
        crisis: Civ7ProgressionTraditionsProbeSchema,
        active: Type.Integer({
          minimum: 0,
          description: "Number of active traditions occupying slots.",
        }),
        unlocked: Type.Integer({
          minimum: 0,
          description: "Number of unlocked traditions.",
        }),
        available: Type.Integer({
          minimum: 0,
          description: "Number of traditions available for activation.",
        }),
        open: Type.Integer({
          minimum: 0,
          description: "Number of policy slots currently open.",
        }),
      },
      {
        additionalProperties: false,
        description: "Policy-slot capacity and occupancy evidence.",
      }
    ),
    actions: Type.Object(
      {
        activate: Type.Union([Type.Number(), Type.Null()], {
          description: "Runtime activation action identifier, or null when unavailable.",
        }),
        deactivate: Type.Union([Type.Number(), Type.Null()], {
          description: "Runtime deactivation action identifier, or null when unavailable.",
        }),
      },
      {
        additionalProperties: false,
        description: "Runtime action identifiers for tradition changes.",
      }
    ),
    active: Type.Array(Civ7ProgressionTraditionRowSchema, {
      description: "Traditions currently active for the player.",
    }),
    available: Type.Array(Civ7ProgressionTraditionRowSchema, {
      description: "Traditions currently available to the player.",
    }),
    recentUnlocks: Type.Array(Civ7ProgressionTraditionRowSchema, {
      description: "Traditions unlocked recently.",
    }),
    traditions: Type.Array(Civ7ProgressionTraditionRowSchema, {
      description: "Complete player-visible tradition projection.",
    }),
    omitted: Type.Array(
      Type.Object(
        {
          path: Type.String({
            description: "Omitted runtime or presentation field path.",
          }),
          reason: Type.String({
            description: "Why the field is outside the service projection.",
          }),
        },
        { additionalProperties: false }
      ),
      {
        description: "Fields deliberately omitted from the service projection.",
      }
    ),
    notes: Type.Array(Type.String(), {
      description: "Additional evidence and interpretation notes.",
    }),
    nextSteps: Type.Array(Civ7ProgressionTraditionsNextStepSchema, {
      description: "Recommended tradition follow-ups.",
    }),
  },
  {
    additionalProperties: false,
    description: "Current tradition state, available actions, and supporting evidence.",
  }
);

export const traditionsCurrent = base
  .input(standard(Civ7ProgressionTraditionsInputSchema))
  .output(standard(Civ7ProgressionTraditionsResultSchema))
  .meta({
    family: "progression",
    procedureKey: "progression.traditions.current",
    proofBoundary: "local-package-test",
    risk: "read-only",
  });

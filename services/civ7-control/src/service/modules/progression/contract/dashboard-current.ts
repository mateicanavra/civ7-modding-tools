import { Type } from "typebox";

import { base } from "../../../base";
import { toStandardSchema as standard } from "../../../schema/typebox-standard-schema";

const Civ7ProgressionDashboardInputSchema = Type.Object(
  {
    playerId: Type.Optional(
      Type.Integer({
        minimum: 0,
        maximum: 1024,
        description: "Player whose progression dashboard should be read.",
      })
    ),
  },
  {
    additionalProperties: false,
    description: "Optional player selection for the progression dashboard.",
  }
);

const Civ7ProgressionDashboardProbeSchema = Type.Union([
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

const Civ7ProgressionDashboardLegacyPathSchema = Type.Object(
  {
    legacyPathType: Type.Union([Type.String(), Type.Null()], {
      description: "Runtime legacy-path type, or null when unavailable.",
    }),
    classType: Type.Union([Type.String(), Type.Null()], {
      description: "Victory class associated with the path, or null when unavailable.",
    }),
    name: Type.Union([Type.String(), Type.Null()], {
      description: "Localized legacy-path name, or null when unavailable.",
    }),
    score: Type.Union([Type.Number(), Type.Null()], {
      description: "Current path score, or null when unreadable.",
    }),
    finalRequiredPathPoints: Type.Union([Type.Number(), Type.Null()], {
      description: "Points required to complete the path, or null when unreadable.",
    }),
    progressPercent: Type.Union([Type.Number(), Type.Null()], {
      description: "Computed completion percentage, or null when it cannot be derived.",
    }),
    nextMilestone: Type.Union([Type.String(), Type.Null()], {
      description: "Next legacy milestone, or null when none is available.",
    }),
    enabledForPlayer: Type.Union([Type.Boolean(), Type.Null()], {
      description: "Whether the path is enabled for the player, or null when unreadable.",
    }),
  },
  {
    additionalProperties: false,
    description: "Current progress along one Civ7 legacy path.",
  }
);

const Civ7ProgressionDashboardNextStepSchema = Type.Object(
  {
    kind: Type.Union(
      [
        Type.Literal("read-attention-priorities"),
        Type.Literal("inspect-progression-choice"),
        Type.Literal("inspect-victory-progress"),
        Type.Literal("observe"),
      ],
      {
        description: "Recommended semantic action based on dashboard evidence.",
      }
    ),
    source: Type.Literal("progression.dashboard.current", {
      description: "Procedure that produced the dashboard recommendation.",
    }),
    label: Type.String({
      description: "Human-readable dashboard recommendation.",
    }),
  },
  { additionalProperties: false }
);

const Civ7ProgressionDashboardResultSchema = Type.Object(
  {
    playerId: Type.Integer({
      minimum: 0,
      description: "Runtime player identifier represented by the dashboard.",
    }),
    localPlayerId: Type.Integer({
      minimum: 0,
      description: "Runtime identifier of the local player.",
    }),
    sourceStatus: Type.Object(
      {
        progressDashboard: Type.Literal("read", {
          description: "Confirms that progression dashboard evidence was read.",
        }),
      },
      {
        additionalProperties: false,
        description: "Read coverage for dashboard evidence sources.",
      }
    ),
    hiddenInfoPolicy: Type.Literal("local-player-runtime-progress", {
      description: "Policy limiting the dashboard to local-player runtime progress.",
    }),
    summary: Type.Object(
      {
        headline: Type.String({
          description: "Concise summary of the player's current progression.",
        }),
        legacyPathCount: Type.Integer({
          minimum: 0,
          description: "Number of legacy paths represented.",
        }),
        victoryClassCount: Type.Integer({
          minimum: 0,
          description: "Number of distinct victory classes represented.",
        }),
        triumphCount: Type.Integer({
          minimum: 0,
          description: "Number of runtime triumph rows observed.",
        }),
        nextStepCount: Type.Integer({
          minimum: 0,
          description: "Number of recommended follow-ups.",
        }),
      },
      {
        additionalProperties: false,
        description: "Counts and headline summarizing the dashboard.",
      }
    ),
    turn: Civ7ProgressionDashboardProbeSchema,
    turnDate: Civ7ProgressionDashboardProbeSchema,
    age: Type.Object(
      {
        ageType: Type.Union([Type.String(), Type.Null()], {
          description: "Current age type, or null when unavailable.",
        }),
        name: Type.Union([Type.String(), Type.Null()], {
          description: "Current age name, or null when unavailable.",
        }),
        chronologyIndex: Type.Unknown({
          description: "Raw chronology index reported by the runtime.",
        }),
        currentAgeProgressionPoints: Civ7ProgressionDashboardProbeSchema,
        maxAgeProgressionPoints: Civ7ProgressionDashboardProbeSchema,
        ageProgressPercent: Type.Union([Type.Number(), Type.Null()], {
          description: "Computed age completion percentage, or null when unavailable.",
        }),
        isFinalAge: Civ7ProgressionDashboardProbeSchema,
        isAgeOver: Civ7ProgressionDashboardProbeSchema,
      },
      {
        additionalProperties: false,
        description: "Current age identity and progression evidence.",
      }
    ),
    player: Type.Object(
      {
        team: Type.Unknown({
          description: "Raw team identity reported for the selected player.",
        }),
        historicalLegacyPointCountForTeam: Civ7ProgressionDashboardProbeSchema,
      },
      {
        additionalProperties: false,
        description: "Player and team progression evidence.",
      }
    ),
    legacyPaths: Type.Array(Civ7ProgressionDashboardLegacyPathSchema, {
      description: "Legacy-path progress visible to the selected player.",
    }),
    victories: Type.Object(
      {
        rowCount: Type.Integer({
          minimum: 0,
          description: "Number of runtime victory rows observed.",
        }),
        classes: Type.Array(Type.String(), {
          description: "Distinct victory classes represented by runtime rows.",
        }),
      },
      {
        additionalProperties: false,
        description: "Summary of visible victory-progress rows.",
      }
    ),
    triumphs: Type.Object(
      {
        count: Type.Integer({
          minimum: 0,
          description: "Number of visible triumph rows.",
        }),
        source: Type.Literal("runtime-gameinfo", {
          description: "Runtime GameInfo authority used for triumph rows.",
        }),
        rows: Type.Array(Type.Unknown(), {
          description: "Raw triumph rows reported by runtime GameInfo.",
        }),
      },
      {
        additionalProperties: false,
        description: "Visible triumph evidence from runtime GameInfo.",
      }
    ),
    proof: Type.Object(
      {
        victoryManagerGlobal: Civ7ProgressionDashboardProbeSchema,
        sources: Type.Array(Type.String(), {
          description: "Runtime sources consulted for the dashboard.",
        }),
      },
      {
        additionalProperties: false,
        description: "Probe evidence supporting the dashboard.",
      }
    ),
    warnings: Type.Array(Type.String(), {
      description: "Read or interpretation warnings encountered while building the dashboard.",
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
    nextSteps: Type.Array(Civ7ProgressionDashboardNextStepSchema, {
      description: "Recommended progression follow-ups.",
    }),
  },
  {
    additionalProperties: false,
    description: "Current player progression dashboard and supporting evidence.",
  }
);

export const dashboardCurrent = base
  .input(standard(Civ7ProgressionDashboardInputSchema))
  .output(standard(Civ7ProgressionDashboardResultSchema))
  .meta({
    family: "progression",
    procedureKey: "progression.dashboard.current",
    proofBoundary: "local-package-test",
    risk: "read-only",
  });

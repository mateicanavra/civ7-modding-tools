import { Effect } from "effect";

import type { Civ7ControlOrpcContext } from "../../../context";
import type { Civ7ControlOrpcProgressDashboardResult } from "../../../dependencies/direct-control";
import {
  civ7ControlOrpcErrorCorrelationData,
  civ7ControlOrpcFailureDetail,
} from "../../../model/correlation";
import { civ7ControlOrpcImplementer } from "../../../procedure";
import type { Civ7ProgressionDashboardInput, Civ7ProgressionDashboardResult } from "../contract";

type RuntimeProbe<T = unknown> =
  | Readonly<{ ok: true; value: T }>
  | Readonly<{ ok: false; error: string }>;

export const progressionDashboardCurrentProcedure =
  civ7ControlOrpcImplementer.progression.dashboard.current.effect(function* ({
    context,
    errors,
    input,
  }) {
    return yield* Effect.tryPromise({
      try: async () => {
        const dashboard = await context.directControl.getCiv7ProgressDashboard(
          input,
          context.endpointDefaults
        );
        return progressionDashboardResult(input, dashboard);
      },
      catch: (cause) =>
        errors.PROGRESSION_DASHBOARD_UNAVAILABLE({
          data: {
            detail: civ7ControlOrpcFailureDetail(cause),
            procedureKey: "progression.dashboard.current",
            source: "direct-control-facade",
            ...civ7ControlOrpcErrorCorrelationData(context),
          },
        }),
    });
  });

function progressionDashboardResult(
  _input: Civ7ProgressionDashboardInput,
  dashboard: Civ7ControlOrpcProgressDashboardResult
): Civ7ProgressionDashboardResult {
  const legacyPaths = dashboard.legacyPaths.map(compactLegacyPath);
  const victoryClasses = uniqueStrings(
    dashboard.victories.rows.map((row) => stringField(row, "victoryClassType"))
  );
  const warnings = progressionDashboardWarnings(dashboard);
  const nextSteps = progressionDashboardNextSteps(dashboard);

  return {
    playerId: dashboard.playerId,
    localPlayerId: dashboard.localPlayerId,
    sourceStatus: {
      progressDashboard: "read",
    },
    hiddenInfoPolicy: dashboard.hiddenInfoPolicy,
    summary: {
      headline: progressionDashboardHeadline(dashboard, legacyPaths),
      legacyPathCount: legacyPaths.length,
      victoryClassCount: victoryClasses.length,
      triumphCount: dashboard.triumphs.count,
      nextStepCount: nextSteps.length,
    },
    turn: dashboard.turn,
    turnDate: dashboard.turnDate,
    age: {
      ageType: dashboard.age.ageType,
      name: dashboard.age.name,
      chronologyIndex: dashboard.age.chronologyIndex,
      currentAgeProgressionPoints: dashboard.age.currentAgeProgressionPoints,
      maxAgeProgressionPoints: dashboard.age.maxAgeProgressionPoints,
      ageProgressPercent: ratioPercent(
        probeValue(dashboard.age.currentAgeProgressionPoints),
        probeValue(dashboard.age.maxAgeProgressionPoints)
      ),
      isFinalAge: dashboard.age.isFinalAge,
      isAgeOver: dashboard.age.isAgeOver,
    },
    player: {
      team: dashboard.player.team,
      historicalLegacyPointCountForTeam: dashboard.player.historicalLegacyPointCountForTeam,
    },
    legacyPaths,
    victories: {
      rowCount: dashboard.victories.rows.length,
      classes: victoryClasses,
    },
    triumphs: {
      count: dashboard.triumphs.count,
      source: dashboard.triumphs.source,
      rows: dashboard.triumphs.rows.slice(0, 8),
    },
    proof: {
      victoryManagerGlobal: dashboard.proof.victoryManagerGlobal,
      sources: [...dashboard.proof.sources],
    },
    warnings,
    omitted: [
      {
        path: "dashboard.legacyPaths[].milestones",
        reason:
          "Milestone probe details stay in the direct-control runtime evidence surface; this service result keeps a summary-first progression view.",
      },
      {
        path: "dashboard.victories.rows",
        reason: "Victory rows are summarized by class for the caller-facing progression view.",
      },
      {
        path: "dashboard.triumphs.rows",
        reason: "The service result includes only the first 8 runtime triumph rows.",
      },
    ],
    notes: [...dashboard.notes],
    nextSteps,
  };
}

function compactLegacyPath(
  path: Civ7ControlOrpcProgressDashboardResult["legacyPaths"][number]
): Civ7ProgressionDashboardResult["legacyPaths"][number] {
  const score = probeValue(path.score);
  const nextMilestone =
    path.nextMilestone && typeof path.nextMilestone === "object"
      ? (path.nextMilestone as Record<string, unknown>)
      : null;

  return {
    legacyPathType: path.legacyPathType,
    classType: shortClass(path.legacyPathClassType),
    name: path.name,
    score: typeof score === "number" ? score : null,
    finalRequiredPathPoints: path.finalRequiredPathPoints,
    progressPercent: ratioPercent(score, path.finalRequiredPathPoints),
    nextMilestone:
      typeof nextMilestone?.ageProgressionMilestoneType === "string"
        ? `${nextMilestone.ageProgressionMilestoneType} at ${nextMilestone.requiredPathPoints ?? "?"}`
        : null,
    enabledForPlayer: path.enabledForPlayer,
  };
}

function progressionDashboardHeadline(
  dashboard: Civ7ControlOrpcProgressDashboardResult,
  legacyPaths: Civ7ProgressionDashboardResult["legacyPaths"]
): string {
  const pathSummary = legacyPaths
    .map(
      (path) =>
        `${path.classType ?? path.legacyPathType}: ${path.score ?? "?"}/${path.finalRequiredPathPoints ?? "?"}`
    )
    .join(", ");
  return `${dashboard.age.ageType ?? "unknown age"} progress: ${pathSummary || "no current-age legacy paths surfaced"}`;
}

function progressionDashboardWarnings(dashboard: Civ7ControlOrpcProgressDashboardResult): string[] {
  return [
    probeValue(dashboard.proof.victoryManagerGlobal) === "undefined"
      ? "VictoryManager is module-local in the official UI; this service uses exposed lower-level legacy and age-progress APIs."
      : null,
    dashboard.triumphs.count === 0
      ? "Runtime GameInfo.Triumphs returned no rows; do not infer that all reward systems are absent."
      : null,
  ].filter((warning): warning is string => Boolean(warning));
}

function progressionDashboardNextSteps(
  dashboard: Civ7ControlOrpcProgressDashboardResult
): Civ7ProgressionDashboardResult["nextSteps"] {
  const steps: Civ7ProgressionDashboardResult["nextSteps"] = [
    {
      kind: "read-attention-priorities",
      source: "progression.dashboard.current",
      label: "Read current attention priorities before choosing the next progression action.",
    },
  ];

  if (dashboard.legacyPaths.length > 0) {
    steps.push({
      kind: "inspect-progression-choice",
      source: "progression.dashboard.current",
      label:
        "Inspect available technology, culture, attribute, or tradition choices before mutating progression.",
    });
  }

  if (dashboard.victories.rows.length > 0) {
    steps.push({
      kind: "inspect-victory-progress",
      source: "progression.dashboard.current",
      label: "Use victory classes as progress context, not as an automatic action plan.",
    });
  }

  return steps.length > 0
    ? steps
    : [
        {
          kind: "observe",
          source: "progression.dashboard.current",
          label: "Observe current attention before selecting a progression follow-up.",
        },
      ];
}

function probeValue<T>(probe: RuntimeProbe<T> | null | undefined): T | null {
  return probe?.ok ? probe.value : null;
}

function ratioPercent(current: unknown, total: unknown): number | null {
  return typeof current === "number" && typeof total === "number" && total > 0
    ? Math.round((current / total) * 1000) / 10
    : null;
}

function shortClass(value: string | null): string | null {
  return value?.replace(/^LEGACY_PATH_CLASS_/, "").toLowerCase() ?? null;
}

function stringField(value: unknown, key: string): string | null {
  return value &&
    typeof value === "object" &&
    typeof (value as Record<string, unknown>)[key] === "string"
    ? (value as Record<string, string>)[key]
    : null;
}

function uniqueStrings(values: ReadonlyArray<string | null>): string[] {
  return [...new Set(values.filter((value): value is string => Boolean(value)))];
}

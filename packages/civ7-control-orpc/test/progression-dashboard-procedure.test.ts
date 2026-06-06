import { call } from "@orpc/server";
import { describe, expect, test } from "vitest";

import {
  Civ7ControlOrpcContract,
  Civ7ControlOrpcRouter,
  createCiv7ControlOrpcServerClient,
  type Civ7ControlOrpcContext,
} from "../src/index";
import type { Civ7ControlOrpcProgressDashboardResult } from "../src/dependencies/direct-control";

describe("progression dashboard control-oRPC procedure", () => {
  test("projects runtime progress evidence into a semantic dashboard result", async () => {
    const fake = fakeContext(progressDashboardResult());

    const result = await call(
      Civ7ControlOrpcRouter.progression.dashboard.current,
      {},
      { context: fake.context },
    );

    expect(fake.calls.dashboard).toEqual([{
      input: {},
      options: {
        host: "127.0.0.1",
        port: 4318,
        timeoutMs: 1_000,
      },
    }]);
    expect(result).toMatchObject({
      playerId: 0,
      localPlayerId: 0,
      sourceStatus: {
        progressDashboard: "read",
      },
      hiddenInfoPolicy: "local-player-runtime-progress",
      summary: {
        headline: expect.stringContaining("AGE_ANTIQUITY progress"),
        legacyPathCount: 2,
        victoryClassCount: 2,
        triumphCount: 0,
        nextStepCount: 3,
      },
      age: {
        ageType: "AGE_ANTIQUITY",
        ageProgressPercent: 10,
      },
      victories: {
        rowCount: 2,
        classes: ["VICTORY_CLASS_CULTURE", "VICTORY_CLASS_SCIENCE"],
      },
      warnings: [
        expect.stringContaining("VictoryManager is module-local"),
        expect.stringContaining("GameInfo.Triumphs returned no rows"),
      ],
    });
    expect(result.legacyPaths[0]).toMatchObject({
      classType: "culture",
      score: 2,
      finalRequiredPathPoints: 10,
      progressPercent: 20,
      nextMilestone: "ANTIQUITY_CULTURE_MILESTONE_1 at 4",
    });
    expect(result.nextSteps.map((step) => step.kind)).toEqual([
      "read-attention-priorities",
      "inspect-progression-choice",
      "inspect-victory-progress",
    ]);

    const serialized = JSON.stringify(result);
    expect(serialized).not.toContain("\"host\"");
    expect(serialized).not.toContain("\"port\"");
    expect(serialized).not.toContain("\"state\"");
    expect(serialized).not.toContain("\"command\"");
    expect(serialized).not.toContain("game play ");
    expect(serialized).not.toContain("CMD:");
    expect(serialized).not.toContain("approval");
  });

  test("uses optional caller player id only as runtime read selection", async () => {
    const fake = fakeContext(progressDashboardResult({ playerId: 2 }));

    const result = await call(
      Civ7ControlOrpcRouter.progression.dashboard.current,
      { playerId: 2 },
      { context: fake.context },
    );

    expect(fake.calls.dashboard[0]?.input).toEqual({ playerId: 2 });
    expect(result.playerId).toBe(2);
    expect(result.localPlayerId).toBe(0);
  });

  test("rejects endpoint, session, raw command, and unknown input fields before facade execution", async () => {
    const fake = fakeContext(progressDashboardResult());
    const client = createCiv7ControlOrpcServerClient(fake.context);

    for (const input of [
      { host: "127.0.0.1" },
      { port: 4318 },
      { state: { role: "tuner" } },
      { session: "abc" },
      { command: "Game.turn" },
      { rawCommand: "Game.turn" },
      { approvalReason: "go" },
    ]) {
      await expect(
        client.progression.dashboard.current(input as never),
      ).rejects.toMatchObject({
        code: "BAD_REQUEST",
      });
    }

    expect(fake.calls.dashboard).toEqual([]);
  });

  test("maps direct-control failures to tagged unavailable errors without raw cause text", async () => {
    const fake = fakeContext(
      new Error("Timed out waiting for Civ7 tuner response to CMD:65535:Game.turn"),
    );

    try {
      await call(
        Civ7ControlOrpcRouter.progression.dashboard.current,
        {},
        { context: fake.context },
      );
      throw new Error("expected progression dashboard call to fail");
    } catch (err) {
      const serialized = JSON.stringify(err);
      expect(serialized).toContain("PROGRESSION_DASHBOARD_UNAVAILABLE");
      expect(serialized).not.toContain("CMD:");
      expect(serialized).not.toContain("Game.turn");
    }
  });

  test("keeps the dashboard leaf under the progression contract and router", () => {
    expect(Civ7ControlOrpcContract.progression.dashboard.current).toBeDefined();
    expect(Civ7ControlOrpcRouter.progression.dashboard.current).toBeDefined();
  });
});

function fakeContext(
  dashboard: Civ7ControlOrpcProgressDashboardResult | Error,
): {
  calls: {
    dashboard: Array<Readonly<{
      input: unknown;
      options: Civ7ControlOrpcContext["endpointDefaults"];
    }>>;
  };
  context: Civ7ControlOrpcContext;
} {
  const calls = {
    dashboard: [] as Array<Readonly<{
      input: unknown;
      options: Civ7ControlOrpcContext["endpointDefaults"];
    }>>,
  };

  return {
    calls,
    context: {
      endpointDefaults: {
        host: "127.0.0.1",
        port: 4318,
        timeoutMs: 1_000,
      },
      directControl: {
        getCiv7ProgressDashboard: async (input, options) => {
          calls.dashboard.push({
            input,
            options,
          });
          if (dashboard instanceof Error) throw dashboard;
          return dashboard;
        },
      } as Civ7ControlOrpcContext["directControl"],
    },
  };
}

function progressDashboardResult(
  overrides: Partial<Pick<Civ7ControlOrpcProgressDashboardResult, "playerId">> = {},
): Civ7ControlOrpcProgressDashboardResult {
  return {
    host: "127.0.0.1",
    port: 4318,
    state: { id: "65535", name: "App UI" },
    localPlayerId: 0,
    playerId: overrides.playerId ?? 0,
    turn: probe(12),
    turnDate: probe("3200 BCE"),
    age: {
      hash: 2077444219,
      ageType: "AGE_ANTIQUITY",
      name: "Antiquity Age",
      chronologyIndex: 0,
      isFinalAge: probe(false),
      isSingleAge: probe(false),
      isExtendedGame: probe(false),
      isAgeOver: probe(false),
      currentAgeProgressionPoints: probe(10),
      maxAgeProgressionPoints: probe(100),
      primaryAgeProgression: probe(-2084768148),
    },
    player: {
      team: 0,
      historicalLegacyPointCountForTeam: probe(2),
    },
    legacyPaths: [
      legacyPath("LEGACY_PATH_ANTIQUITY_CULTURE", "LEGACY_PATH_CLASS_CULTURE", 2, 10, 4),
      legacyPath("LEGACY_PATH_ANTIQUITY_SCIENCE", "LEGACY_PATH_CLASS_SCIENCE", 1, 8, 3),
    ],
    victories: {
      rows: [
        { victoryType: "VICTORY_CULTURE", victoryClassType: "VICTORY_CLASS_CULTURE", name: "Culture", description: null },
        { victoryType: "VICTORY_SCIENCE", victoryClassType: "VICTORY_CLASS_SCIENCE", name: "Science", description: null },
      ],
    },
    triumphs: {
      count: 0,
      rows: [],
      source: "runtime-gameinfo",
    },
    proof: {
      victoryManagerGlobal: probe("undefined"),
      sources: [
        "GameInfo.LegacyPaths",
        "player.LegacyPaths.getScore",
        "GameInfo.AgeProgressionMilestones",
        "Game.AgeProgressManager",
        "GameInfo.Victories",
        "GameInfo.Triumphs",
      ],
    },
    hiddenInfoPolicy: "local-player-runtime-progress",
    notes: [
      "Read-only progress dashboard; it does not choose technologies, civics, productions, policies, or victory strategy.",
    ],
  };
}

function legacyPath(
  legacyPathType: string,
  legacyPathClassType: string,
  score: number,
  finalRequiredPathPoints: number,
  nextRequired: number,
): Civ7ControlOrpcProgressDashboardResult["legacyPaths"][number] {
  return {
    legacyPathType,
    legacyPathClassType,
    ageType: "AGE_ANTIQUITY",
    name: legacyPathType.replace("LEGACY_PATH_ANTIQUITY_", "Antiquity "),
    description: null,
    enabledByDefault: true,
    enabledForPlayer: null,
    score: probe(score),
    finalRequiredPathPoints,
    nextMilestone: {
      ageProgressionMilestoneType:
        `${legacyPathType.replace("LEGACY_PATH_", "")}_MILESTONE_1`,
      legacyPathType,
      requiredPathPoints: nextRequired,
      finalMilestone: false,
      progressionPoints: probe(5),
      complete: probe(false),
      reachedByScore: score >= nextRequired,
    },
    milestones: [],
  };
}

function probe<T>(value: T): Readonly<{ ok: true; value: T }> {
  return { ok: true, value };
}

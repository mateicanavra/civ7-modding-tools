import { describe, expect, test } from "vitest";
import { Value } from "typebox/value";

import {
  Civ7ProgressDashboardProcedureDescriptor,
  Civ7ProgressDashboardProcedureSchemaArtifacts,
  callCiv7ProgressDashboardProcedure,
  getCiv7ProgressDashboard,
  resolveCiv7ProcedureCoreSchemas,
  summarizeCiv7ProcedureCoreDescriptor,
  type ProgressDashboardDependencies,
} from "../src/index";

describe("Civ7 progress-dashboard procedure descriptor", () => {
  test("records the read-only progress dashboard atom and resolves its schemas", () => {
    const summary = summarizeCiv7ProcedureCoreDescriptor(Civ7ProgressDashboardProcedureDescriptor);
    expect(summary).toMatchObject({
      procedureKey: "strategy.progress.dashboard",
      family: "strategy",
      risk: "read",
      atomOwner: "packages/civ7-direct-control/src/play/progression/reads.ts",
      atomFunction: "getCiv7ProgressDashboard",
      normalCliProjection: "semantic-projection",
      debugServiceProjection: "omitted",
      aiIngestionProjection: "blocked-until-ingestion-contract",
      telemetryProjection: "blocked-until-procedure-middleware",
      procedureCoreProjection: "typed-procedure-core",
    });
    expect(getCiv7ProgressDashboard.name).toBe(summary.atomFunction);

    const resolved = resolveCiv7ProcedureCoreSchemas(
      Civ7ProgressDashboardProcedureDescriptor,
      Civ7ProgressDashboardProcedureSchemaArtifacts
    );
    expect(Object.keys(resolved.inputSchema.properties ?? {})).toEqual(
      expect.arrayContaining(Civ7ProgressDashboardProcedureDescriptor.inputFields)
    );
    expect(Object.keys(resolved.outputSchema.properties ?? {})).toEqual(
      expect.arrayContaining(Civ7ProgressDashboardProcedureDescriptor.outputFields)
    );
    expect(Value.Check(resolved.inputSchema, { playerId: 0 })).toBe(true);
    expect(Value.Check(resolved.inputSchema, { playerId: -1 })).toBe(false);
    expect(Value.Check(resolved.inputSchema, { host: "127.0.0.1" })).toBe(false);
    expect(Value.Check(resolved.inputSchema, { rawCommand: "readProgressDashboard()" })).toBe(
      false
    );
    expect(Value.Check(resolved.outputSchema, progressDashboardResult())).toBe(true);
    expect(
      Value.Check(resolved.outputSchema, {
        ...progressDashboardResult(),
        triumphs: {
          ...progressDashboardResult().triumphs,
          source: "raw-debug-output",
        },
      })
    ).toBe(false);
    expect(
      Value.Check(resolved.outputSchema, {
        ...progressDashboardResult(),
        rawCommand: "readProgressDashboard()",
      })
    ).toBe(false);
  });

  test("calls the progress dashboard atom through the procedure core without touching the live tuner", async () => {
    const validatedPlayers: number[] = [];
    const executeCalls: Array<{ host?: string; port?: number; command: string }> = [];
    const dependencies: ProgressDashboardDependencies = {
      validatePlayerId: (playerId) => {
        validatedPlayers.push(playerId);
      },
      executeAppUiCommand: async (options) => {
        executeCalls.push({
          host: options.host,
          port: options.port,
          command: options.command,
        });
        return {
          host: options.host ?? "127.0.0.1",
          port: options.port ?? 4318,
          state: { id: "65535", name: "App UI" },
          output: ["{}"],
        };
      },
      parseProgressDashboard: () => progressDashboardResult(),
    };

    const result = await callCiv7ProgressDashboardProcedure(
      {
        playerId: 0,
      },
      {
        directControl: {
          host: "127.0.0.1",
          port: 4318,
        },
        procedure: {
          correlationId: "progress-dashboard-procedure-test",
        },
        dependencies,
      }
    );

    expect(result.output).toEqual(progressDashboardResult());
    expect(result.output.hiddenInfoPolicy).toBe("local-player-runtime-progress");
    expect(result.output.proof.sources).toEqual([
      "GameInfo.LegacyPaths",
      "player.LegacyPaths.getScore",
      "GameInfo.AgeProgressionMilestones",
      "Game.AgeProgressManager",
      "GameInfo.Victories",
      "GameInfo.Triumphs",
    ]);
    expect(result.output.notes.join("\n")).toContain("Read-only progress dashboard");
    expect(result.diagnostics).toMatchObject({
      procedureKey: "strategy.progress.dashboard",
      correlationId: "progress-dashboard-procedure-test",
      proofBoundary: "local-package-test",
      playerScope: "local-player-scoped",
      debugServiceCorrelation: true,
      telemetryCorrelation: false,
    });
    expect(validatedPlayers).toEqual([0]);
    expect(executeCalls).toHaveLength(1);
    expect(executeCalls[0]).toMatchObject({
      host: "127.0.0.1",
      port: 4318,
    });
    expect(executeCalls[0]?.command).toContain("readProgressDashboard");
    expect(executeCalls[0]?.command).toContain('"playerId":0');
    expect(executeCalls[0]?.command).not.toContain("sendRequest");
    expect(executeCalls[0]?.command).not.toContain("sendOperation(");
    expect(executeCalls[0]?.command).not.toContain("SET_TECH_TREE_NODE");
    expect(executeCalls[0]?.command).not.toContain("SET_CULTURE_TREE_NODE");
  });

  test("rejects invalid procedure input before progress dashboard dependencies run", async () => {
    let executed = false;
    const dependencies: ProgressDashboardDependencies = {
      validatePlayerId: () => {
        throw new Error("validatePlayerId should not run after procedure input rejection");
      },
      executeAppUiCommand: async () => {
        executed = true;
        throw new Error("executeAppUiCommand should not run after procedure input rejection");
      },
      parseProgressDashboard: () => progressDashboardResult(),
    };

    await expect(
      callCiv7ProgressDashboardProcedure(
        { playerId: -1 },
        {
          procedure: { correlationId: "progress-dashboard-invalid-player" },
          dependencies,
        }
      )
    ).rejects.toMatchObject({
      code: "procedure-descriptor-invalid",
      details: {
        reason: "input-schema-invalid",
        procedureKey: "strategy.progress.dashboard",
        role: "input",
      },
    });
    await expect(
      callCiv7ProgressDashboardProcedure(
        {
          stateName: "App UI",
        } as never,
        {
          procedure: { correlationId: "progress-dashboard-context-input" },
          dependencies,
        }
      )
    ).rejects.toMatchObject({
      code: "procedure-descriptor-invalid",
      details: {
        reason: "input-schema-invalid",
        procedureKey: "strategy.progress.dashboard",
        role: "input",
      },
    });
    expect(executed).toBe(false);
  });
});

function progressDashboardResult() {
  return {
    host: "127.0.0.1",
    port: 4318,
    state: { id: "65535", name: "App UI" },
    localPlayerId: 0,
    playerId: 0,
    turn: { ok: true as const, value: 42 },
    turnDate: { ok: true as const, value: "1200 BCE" },
    age: {
      hash: 11,
      ageType: "AGE_ANTIQUITY",
      name: "Antiquity",
      chronologyIndex: 1,
      isFinalAge: { ok: true as const, value: false },
      isSingleAge: { ok: true as const, value: false },
      isExtendedGame: { ok: true as const, value: false },
      isAgeOver: { ok: true as const, value: false },
      currentAgeProgressionPoints: { ok: true as const, value: 13 },
      maxAgeProgressionPoints: { ok: true as const, value: 30 },
      primaryAgeProgression: { ok: true as const, value: "LEGACY_PATH_ANTIQUITY_CULTURE" },
    },
    player: {
      team: 3,
      historicalLegacyPointCountForTeam: { ok: true as const, value: 4 },
    },
    legacyPaths: [
      {
        legacyPathType: "LEGACY_PATH_ANTIQUITY_CULTURE",
        legacyPathClassType: "LEGACY_PATH_CLASS_CULTURE",
        ageType: "AGE_ANTIQUITY",
        name: "Culture",
        description: "Culture legacy path.",
        enabledByDefault: true,
        enabledForPlayer: true,
        score: { ok: true as const, value: 7 },
        finalRequiredPathPoints: 10,
        nextMilestone: milestone("MILESTONE_CULTURE_2", 10, true, false),
        milestones: [
          milestone("MILESTONE_CULTURE_1", 5, false, true),
          milestone("MILESTONE_CULTURE_2", 10, true, false),
        ],
      },
    ],
    victories: {
      rows: [
        {
          victoryType: "VICTORY_CULTURE",
          victoryClassType: "VICTORY_CLASS_CULTURE",
          name: "Culture Victory",
          description: "Win through culture.",
        },
      ],
    },
    triumphs: {
      count: 1,
      rows: [
        {
          type: "TRIUMPH_CULTURE",
          name: "Culture Triumph",
          description: "Complete a culture triumph.",
        },
      ],
      source: "runtime-gameinfo" as const,
    },
    proof: {
      victoryManagerGlobal: { ok: true as const, value: "undefined" },
      sources: [
        "GameInfo.LegacyPaths",
        "player.LegacyPaths.getScore",
        "GameInfo.AgeProgressionMilestones",
        "Game.AgeProgressManager",
        "GameInfo.Victories",
        "GameInfo.Triumphs",
      ],
    },
    hiddenInfoPolicy: "local-player-runtime-progress" as const,
    notes: [
      "Read-only progress dashboard; it does not choose technologies, civics, productions, policies, or victory strategy.",
      "Legacy path scores come from the local player's LegacyPaths component and milestone thresholds come from GameInfo.AgeProgressionMilestones.",
    ],
  };
}

function milestone(
  ageProgressionMilestoneType: string,
  requiredPathPoints: number,
  finalMilestone: boolean,
  complete: boolean
) {
  return {
    ageProgressionMilestoneType,
    legacyPathType: "LEGACY_PATH_ANTIQUITY_CULTURE",
    requiredPathPoints,
    finalMilestone,
    progressionPoints: { ok: true as const, value: complete ? 3 : 5 },
    complete: { ok: true as const, value: complete },
    reachedByScore: complete,
  };
}

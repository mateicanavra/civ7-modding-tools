import { describe, expect, test } from "vitest";
import { Value } from "typebox/value";

import {
  Civ7TraditionsViewProcedureDescriptor,
  Civ7TraditionsViewProcedureSchemaArtifacts,
  callCiv7TraditionsViewProcedure,
  getCiv7TraditionsView,
  resolveCiv7ProcedureCoreSchemas,
  summarizeCiv7ProcedureCoreDescriptor,
  type TraditionsViewDependencies,
} from "../src/index";

describe("Civ7 traditions-view procedure descriptor", () => {
  test("records the read-only traditions view atom and resolves its schemas", () => {
    const summary = summarizeCiv7ProcedureCoreDescriptor(Civ7TraditionsViewProcedureDescriptor);
    expect(summary).toMatchObject({
      procedureKey: "strategy.traditions.view",
      family: "strategy",
      risk: "read",
      atomOwner: "packages/civ7-direct-control/src/play/progression/reads.ts",
      atomFunction: "getCiv7TraditionsView",
      normalCliProjection: "semantic-projection",
      debugServiceProjection: "omitted",
      aiIngestionProjection: "blocked-until-ingestion-contract",
      telemetryProjection: "blocked-until-procedure-middleware",
      procedureCoreProjection: "typed-procedure-core",
    });
    expect(getCiv7TraditionsView.name).toBe(summary.atomFunction);

    const resolved = resolveCiv7ProcedureCoreSchemas(
      Civ7TraditionsViewProcedureDescriptor,
      Civ7TraditionsViewProcedureSchemaArtifacts,
    );
    expect(Object.keys(resolved.inputSchema.properties ?? {})).toEqual(
      expect.arrayContaining(Civ7TraditionsViewProcedureDescriptor.inputFields),
    );
    expect(Object.keys(resolved.outputSchema.properties ?? {})).toEqual(
      expect.arrayContaining(Civ7TraditionsViewProcedureDescriptor.outputFields),
    );
    expect(Value.Check(resolved.inputSchema, { playerId: 0 })).toBe(true);
    expect(Value.Check(resolved.inputSchema, { playerId: -1 })).toBe(false);
    expect(Value.Check(resolved.inputSchema, { host: "127.0.0.1" })).toBe(false);
    expect(Value.Check(resolved.inputSchema, { rawCommand: "readTraditionsView()" })).toBe(false);
    expect(Value.Check(resolved.outputSchema, traditionsViewResult())).toBe(true);
    expect(Value.Check(resolved.outputSchema, {
      ...traditionsViewResult(),
      active: [
        {
          ...traditionsViewResult().active[0],
          actionHints: [
            {
              ...traditionsViewResult().active[0].actionHints[0],
              operationType: "sendRequest",
            },
          ],
        },
      ],
    })).toBe(false);
    expect(Value.Check(resolved.outputSchema, {
      ...traditionsViewResult(),
      rawCommand: "readTraditionsView()",
    })).toBe(false);
  });

  test("calls the traditions view atom through the procedure core without touching the live tuner", async () => {
    const validatedPlayers: number[] = [];
    const executeCalls: Array<{ host?: string; port?: number; command: string }> = [];
    const dependencies: TraditionsViewDependencies = {
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
      parseTraditionsView: () => traditionsViewResult(),
    };

    const result = await callCiv7TraditionsViewProcedure({
      playerId: 0,
    }, {
      directControl: {
        host: "127.0.0.1",
        port: 4318,
      },
      procedure: {
        correlationId: "traditions-view-procedure-test",
      },
      dependencies,
    });

    expect(result.output).toEqual(traditionsViewResult());
    expect(result.output.active[0].actionHints[0]).toMatchObject({
      operationType: "CHANGE_TRADITION",
      cli: "game play change-tradition --player-id 0 --tradition-type 101 --action 2",
    });
    expect(result.output.notes.join("\n")).toContain("Read-only traditions view");
    expect(result.diagnostics).toMatchObject({
      procedureKey: "strategy.traditions.view",
      correlationId: "traditions-view-procedure-test",
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
    expect(executeCalls[0]?.command).toContain("readTraditionsView");
    expect(executeCalls[0]?.command).toContain('"playerId":0');
    expect(executeCalls[0]?.command).not.toContain("sendRequest");
    expect(executeCalls[0]?.command).not.toContain("sendOperation(");
  });

  test("rejects invalid procedure input before traditions view dependencies run", async () => {
    let executed = false;
    const dependencies: TraditionsViewDependencies = {
      validatePlayerId: () => {
        throw new Error("validatePlayerId should not run after procedure input rejection");
      },
      executeAppUiCommand: async () => {
        executed = true;
        throw new Error("executeAppUiCommand should not run after procedure input rejection");
      },
      parseTraditionsView: () => traditionsViewResult(),
    };

    await expect(callCiv7TraditionsViewProcedure({ playerId: -1 }, {
      procedure: { correlationId: "traditions-view-invalid-player" },
      dependencies,
    })).rejects.toMatchObject({
      code: "procedure-descriptor-invalid",
      details: {
        reason: "input-schema-invalid",
        procedureKey: "strategy.traditions.view",
        role: "input",
      },
    });
    await expect(callCiv7TraditionsViewProcedure({
      stateName: "App UI",
    } as never, {
      procedure: { correlationId: "traditions-view-context-input" },
      dependencies,
    })).rejects.toMatchObject({
      code: "procedure-descriptor-invalid",
      details: {
        reason: "input-schema-invalid",
        procedureKey: "strategy.traditions.view",
        role: "input",
      },
    });
    expect(executed).toBe(false);
  });
});

function traditionsViewResult() {
  return {
    host: "127.0.0.1",
    port: 4318,
    state: { id: "65535", name: "App UI" },
    playerId: 0,
    turn: { ok: true as const, value: 42 },
    turnDate: { ok: true as const, value: "1200 BCE" },
    governmentType: { ok: true as const, value: 77 },
    government: {
      type: "GOVERNMENT_CHIEFDOM",
      name: "Chiefdom",
    },
    slots: {
      total: { ok: true as const, value: 2 },
      normal: { ok: true as const, value: 2 },
      crisis: { ok: true as const, value: 0 },
      active: 1,
      unlocked: 2,
      available: 1,
      open: 1,
    },
    actions: { activate: 1, deactivate: 2 },
    active: [
      traditionSummary({
        id: 101,
        type: "TRADITION_CODE_OF_LAWS",
        active: true,
        action: 2,
        kind: "deactivate",
      }),
    ],
    available: [
      traditionSummary({
        id: 202,
        type: "TRADITION_ORAL_TRADITION",
        active: false,
        action: 1,
        kind: "activate",
        recentUnlock: true,
      }),
    ],
    recentUnlocks: [
      traditionSummary({
        id: 202,
        type: "TRADITION_ORAL_TRADITION",
        active: false,
        action: 1,
        kind: "activate",
        recentUnlock: true,
      }),
    ],
    traditions: [
      traditionSummary({
        id: 101,
        type: "TRADITION_CODE_OF_LAWS",
        active: true,
        action: 2,
        kind: "deactivate",
      }),
      traditionSummary({
        id: 202,
        type: "TRADITION_ORAL_TRADITION",
        active: false,
        action: 1,
        kind: "activate",
        recentUnlock: true,
      }),
    ],
    recommendedCli: [
      "game play change-tradition --player-id 0 --tradition-type 202 --action 1",
    ],
    hiddenInfoPolicy: "player-culture-runtime" as const,
    notes: [
      "Read-only traditions view; it does not send CHANGE_TRADITION or CONSIDER_ASSIGN_TRADITIONS.",
      "Use the exact TraditionType and Action values from actionHints, then validate with game play change-tradition before sending.",
    ],
  };
}

function traditionSummary(input: {
  id: number;
  type: string;
  active: boolean;
  action: number;
  kind: "activate" | "deactivate";
  recentUnlock?: boolean;
}) {
  return {
    id: input.id,
    type: input.type,
    name: input.type.replace("TRADITION_", "").replaceAll("_", " "),
    description: `${input.type} description`,
    ageType: "AGE_ANTIQUITY",
    cultureSlotType: "SLOT_TRADITION",
    traitType: null,
    isCrisis: false,
    active: input.active,
    unlocked: true,
    recentUnlock: input.recentUnlock === true,
    actionHints: [
      {
        kind: input.kind,
        action: input.action,
        operationType: "CHANGE_TRADITION" as const,
        args: { TraditionType: input.id, Action: input.action },
        validation: { ok: true as const, value: { Success: true } },
        cli: `game play change-tradition --player-id 0 --tradition-type ${input.id} --action ${input.action}`,
      },
    ],
  };
}

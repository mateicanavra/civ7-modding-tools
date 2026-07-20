import { Value } from "typebox/value";
import { describe, expect, test } from "vitest";

import {
  type Civ7TurnCompletionStatusDependencies,
  Civ7TurnCompletionStatusProcedureDescriptor,
  Civ7TurnCompletionStatusProcedureSchemaArtifacts,
  callCiv7TurnCompletionStatusProcedure,
  getCiv7TurnCompletionStatus,
  resolveCiv7ProcedureCoreSchemas,
  summarizeCiv7ProcedureCoreDescriptor,
} from "../src/index";

import { schemaPropertyKeys } from "./support/procedure-schema";

describe("Civ7 turn-completion status procedure descriptor", () => {
  test("records the turn-completion status read atom and resolves its schemas", () => {
    const summary = summarizeCiv7ProcedureCoreDescriptor(
      Civ7TurnCompletionStatusProcedureDescriptor
    );
    expect(summary).toMatchObject({
      procedureKey: "runtime.turn.completion.status",
      family: "runtime",
      risk: "read",
      atomOwner: "packages/civ7-direct-control/src/play/turn-completion.ts",
      atomFunction: "getCiv7TurnCompletionStatus",
      playerScope: "local-player-scoped",
      normalCliProjection: "summarized-state-machine-status",
      debugServiceProjection: "omitted",
      aiIngestionProjection: "blocked-until-ingestion-contract",
      telemetryProjection: "blocked-until-procedure-middleware",
      procedureCoreProjection: "typed-procedure-core",
    });
    expect(getCiv7TurnCompletionStatus.name).toBe(summary.atomFunction);

    const resolved = resolveCiv7ProcedureCoreSchemas(
      Civ7TurnCompletionStatusProcedureDescriptor,
      Civ7TurnCompletionStatusProcedureSchemaArtifacts
    );
    expect(schemaPropertyKeys(resolved.inputSchema)).toEqual([]);
    expect(schemaPropertyKeys(resolved.outputSchema)).toEqual(
      expect.arrayContaining(Civ7TurnCompletionStatusProcedureDescriptor.outputFields)
    );
    expect(Value.Check(resolved.inputSchema, {})).toBe(true);
    expect(Value.Check(resolved.inputSchema, { host: "127.0.0.1" })).toBe(false);
    expect(Value.Check(resolved.inputSchema, { port: 4318 })).toBe(false);
    expect(Value.Check(resolved.inputSchema, { state: { role: "app-ui" } })).toBe(false);
    expect(
      Value.Check(resolved.inputSchema, { rawCommand: "GameContext.sendTurnComplete()" })
    ).toBe(false);
    expect(Value.Check(resolved.outputSchema, turnCompletionStatusResult())).toBe(true);
    expect(
      Value.Check(resolved.outputSchema, {
        ...turnCompletionStatusResult(),
        command: "GameContext.sendTurnComplete()",
      })
    ).toBe(false);
  });

  test("calls the status atom through the procedure core without sending turn commands", async () => {
    const executeCalls: Array<{ host?: string; port?: number; command: string }> = [];
    const dependencies: Civ7TurnCompletionStatusDependencies = {
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
      parseTurnCompletionStatus: () => turnCompletionStatusResult(),
    };

    const result = await callCiv7TurnCompletionStatusProcedure(
      {},
      {
        directControl: {
          host: "127.0.0.1",
          port: 4318,
        },
        procedure: {
          correlationId: "turn-completion-status-procedure-test",
        },
        dependencies,
      }
    );

    expect(result.output).toEqual(turnCompletionStatusResult());
    expect(result.diagnostics).toMatchObject({
      procedureKey: "runtime.turn.completion.status",
      correlationId: "turn-completion-status-procedure-test",
      proofBoundary: "local-package-test",
      playerScope: "local-player-scoped",
      debugServiceCorrelation: true,
      telemetryCorrelation: false,
    });
    expect(executeCalls).toHaveLength(1);
    expect(executeCalls[0]).toMatchObject({
      host: "127.0.0.1",
      port: 4318,
    });
    expect(executeCalls[0]?.command).toContain("GameContext.hasSentTurnComplete");
    expect(executeCalls[0]?.command).toContain("canEndTurn");
    expect(executeCalls[0]?.command).not.toContain("GameContext.sendTurnComplete()");
    expect(executeCalls[0]?.command).not.toContain("GameContext.sendUnreadyTurn()");
  });

  test("rejects context and raw command input before status dependencies run", async () => {
    let executed = false;
    const dependencies: Civ7TurnCompletionStatusDependencies = {
      executeAppUiCommand: async () => {
        executed = true;
        throw new Error("executeAppUiCommand should not run after procedure input rejection");
      },
      parseTurnCompletionStatus: () => turnCompletionStatusResult(),
    };

    for (const input of [
      { host: "127.0.0.1" },
      { port: 4318 },
      { state: { role: "app-ui" } },
      { rawCommand: "GameContext.sendTurnComplete()" },
    ]) {
      await expect(
        callCiv7TurnCompletionStatusProcedure(input as never, {
          procedure: { correlationId: "turn-completion-status-invalid-input" },
          dependencies,
        })
      ).rejects.toMatchObject({
        code: "procedure-descriptor-invalid",
        details: {
          reason: "input-schema-invalid",
          procedureKey: "runtime.turn.completion.status",
          role: "input",
        },
      });
    }
    expect(executed).toBe(false);
  });
});

function turnCompletionStatusResult() {
  return {
    host: "127.0.0.1",
    port: 4318,
    state: { id: "65535", name: "App UI" },
    localPlayerId: 0,
    turn: { ok: true as const, value: 12 },
    turnDate: { ok: true as const, value: "3990 BCE" },
    hasSentTurnComplete: { ok: true as const, value: false },
    canEndTurn: { ok: true as const, value: true },
    blocker: { ok: true as const, value: 0 },
    firstReadyUnitId: { ok: true as const, value: null },
  };
}

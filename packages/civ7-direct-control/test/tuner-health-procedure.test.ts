import { describe, expect, test } from "vitest";
import { Value } from "typebox/value";

import {
  Civ7DirectControlSession,
  Civ7TunerHealthProcedureDescriptor,
  Civ7TunerHealthProcedureSchemaArtifacts,
  callCiv7TunerHealthProcedure,
  checkCiv7TunerHealth,
  resolveCiv7ProcedureCoreSchemas,
  summarizeCiv7ProcedureCoreDescriptor,
  type Civ7DirectControlOptions,
  type Civ7TunerStateSelection,
  type TunerHealthDependencies,
} from "../src/index";

describe("Civ7 Tuner health procedure descriptor", () => {
  test("records the Tuner health runtime atom and resolves its schemas", () => {
    const summary = summarizeCiv7ProcedureCoreDescriptor(Civ7TunerHealthProcedureDescriptor);
    expect(summary).toMatchObject({
      procedureKey: "runtime.tuner.health",
      family: "runtime",
      risk: "runtime-support",
      atomOwner: "packages/civ7-direct-control/src/runtime/tuner-health.ts",
      atomFunction: "checkCiv7TunerHealth",
      normalCliProjection: "omitted",
      debugServiceProjection: "raw-diagnostic-projection",
      aiIngestionProjection: "omitted",
      telemetryProjection: "blocked-until-procedure-middleware",
      procedureCoreProjection: "typed-procedure-core",
    });
    expect(checkCiv7TunerHealth.name).toBe(summary.atomFunction);

    const resolved = resolveCiv7ProcedureCoreSchemas(
      Civ7TunerHealthProcedureDescriptor,
      Civ7TunerHealthProcedureSchemaArtifacts
    );
    expect(Object.keys(resolved.inputSchema.properties ?? {})).toEqual([]);
    expect(Object.keys(resolved.outputSchema.properties ?? {})).toEqual(
      expect.arrayContaining(Civ7TunerHealthProcedureDescriptor.outputFields)
    );
    expect(Value.Check(resolved.inputSchema, {})).toBe(true);
    expect(Value.Check(resolved.inputSchema, { host: "127.0.0.1" })).toBe(false);
    expect(Value.Check(resolved.inputSchema, { port: 4318 })).toBe(false);
    expect(Value.Check(resolved.inputSchema, { state: { role: "tuner" } })).toBe(false);
    expect(Value.Check(resolved.inputSchema, { session: { state: "Tuner" } })).toBe(false);
    expect(Value.Check(resolved.inputSchema, { command: "Game.turn" })).toBe(false);
    expect(Value.Check(resolved.inputSchema, { rawCommand: "Game.turn" })).toBe(false);
    expect(Value.Check(resolved.outputSchema, tunerHealthResult())).toBe(true);
    expect(
      Value.Check(resolved.outputSchema, {
        ...tunerHealthResult(),
        rawCommand: "Game.turn",
      })
    ).toBe(false);
  });

  test("calls the Tuner health atom through the procedure core without touching the live tuner", async () => {
    const sessions: Civ7DirectControlOptions[] = [];
    const commands: Array<{
      state?: Civ7TunerStateSelection;
      timeoutMs?: number;
      command: string;
      attempts?: number;
    }> = [];
    const fakeSession = Object.create(
      Civ7DirectControlSession.prototype
    ) as Civ7DirectControlSession;
    const dependencies: TunerHealthDependencies = {
      withSession: async (options, run) => {
        sessions.push(options);
        return await run(fakeSession);
      },
      executeSessionCommandWithReconnect: async (_session, options, attempts) => {
        commands.push({
          state: options.state,
          timeoutMs: options.timeoutMs,
          command: options.command,
          attempts,
        });
        return {
          host: "127.0.0.1",
          port: 4318,
          state: { id: "1", name: "Tuner" },
          output: [JSON.stringify(tunerHealthResult().snapshot)],
        };
      },
    };

    const result = await callCiv7TunerHealthProcedure(
      {},
      {
        directControl: {
          host: "127.0.0.1",
          port: 4318,
          timeoutMs: 750,
        },
        procedure: {
          correlationId: "tuner-health-procedure-test",
        },
        dependencies,
      }
    );

    expect(result.output).toEqual(tunerHealthResult());
    expect(result.diagnostics).toMatchObject({
      procedureKey: "runtime.tuner.health",
      correlationId: "tuner-health-procedure-test",
      proofBoundary: "local-package-test",
      playerScope: "debug-observer-only",
      debugServiceCorrelation: true,
      telemetryCorrelation: false,
    });
    expect(sessions).toEqual([
      {
        host: "127.0.0.1",
        port: 4318,
        timeoutMs: 750,
      },
    ]);
    expect(commands).toHaveLength(1);
    expect(commands[0]).toMatchObject({
      state: { role: "tuner" },
      timeoutMs: 750,
      attempts: 1,
    });
    expect(commands[0]?.command).toContain("evalOk: 1 + 1");
    expect(commands[0]?.command).toContain("GameplayMap.getGridWidth");
  });

  test("rejects context-owned procedure input before Tuner dependencies run", async () => {
    let touchedRuntime = false;
    const dependencies: TunerHealthDependencies = {
      withSession: async () => {
        touchedRuntime = true;
        throw new Error("withSession should not run after procedure input rejection");
      },
      executeSessionCommandWithReconnect: async () => {
        touchedRuntime = true;
        throw new Error(
          "executeSessionCommandWithReconnect should not run after procedure input rejection"
        );
      },
    };

    await expect(
      callCiv7TunerHealthProcedure({ host: "127.0.0.1" } as never, {
        procedure: { correlationId: "tuner-health-invalid-input" },
        dependencies,
      })
    ).rejects.toMatchObject({
      code: "procedure-descriptor-invalid",
      details: {
        reason: "input-schema-invalid",
        procedureKey: "runtime.tuner.health",
        role: "input",
      },
    });
    expect(touchedRuntime).toBe(false);
  });
});

function tunerHealthResult() {
  return {
    host: "127.0.0.1",
    port: 4318,
    state: { id: "1", name: "Tuner" },
    ready: true,
    snapshot: {
      evalOk: 2,
      ready: true,
      globals: {
        Game: "object",
        Autoplay: "object",
        GameplayMap: "object",
        Players: "object",
        Network: "object",
      },
      turn: { ok: true, value: 2 },
      turnDate: { ok: true, value: "3975 BCE" },
      width: { ok: true, value: 84 },
      height: { ok: true, value: 54 },
      aliveIds: { ok: true, value: [0, 62] },
      aliveHumanIds: { ok: true, value: [0] },
      autoplayActive: { ok: true, value: false },
    },
  };
}

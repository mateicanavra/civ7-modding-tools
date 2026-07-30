import { call } from "@orpc/server";
import { describe, expect, test } from "vitest";

import {
  type Civ7ControlOrpcContext,
  Civ7ControlOrpcContract,
  Civ7ControlOrpcRouter,
  createCiv7ControlOrpcServerClient,
} from "../../../../src/index";
import type {
  Civ7ControlOrpcCommandDispatchStatus,
  Civ7ControlOrpcRuntimeProbe,
  Civ7ControlOrpcUnitCommandCheckResult,
  Civ7ControlOrpcUnitCommandSendResult,
  Civ7ControlOrpcUnitCommandSnapshot,
} from "../../../../src/service/model/ports/direct-control";
import { directControlFacadeFixture } from "../../../support/direct-control-facade";
import { playableStatusResult } from "../../../support/playable-status";
import { standardSchemaAccepts } from "../../../support/standard-schema";

const unitId = { owner: 0, id: 1_769_488, type: 26 };
const otherUnitId = { owner: 0, id: 1_769_489, type: 26 };
const destination = { x: 17, y: 25 };
const endpointDefaults = {
  host: "127.0.0.1",
  port: 4318,
  timeoutMs: 1_000,
};

describe("unit upgrade/resettle control-oRPC procedures", () => {
  test("publishes exact read-only check and mutation request contracts", () => {
    const upgradeCheck = Civ7ControlOrpcContract.unit.upgrade.check["~orpc"];
    const upgradeRequest = Civ7ControlOrpcContract.unit.upgrade.request["~orpc"];
    const resettleCheck = Civ7ControlOrpcContract.unit.resettle.check["~orpc"];
    const resettleRequest = Civ7ControlOrpcContract.unit.resettle.request["~orpc"];

    expect(upgradeCheck.meta).toMatchObject({
      procedureKey: "unit.upgrade.check",
      risk: "read-only",
    });
    expect(upgradeRequest.meta).toMatchObject({
      procedureKey: "unit.upgrade.request",
      risk: "mutation",
    });
    expect(resettleCheck.meta).toMatchObject({
      procedureKey: "unit.resettle.check",
      risk: "read-only",
    });
    expect(resettleRequest.meta).toMatchObject({
      procedureKey: "unit.resettle.request",
      risk: "mutation",
    });

    expect(standardSchemaAccepts(upgradeCheck.inputSchema, { unitId })).toBe(true);
    expect(standardSchemaAccepts(upgradeRequest.inputSchema, { unitId })).toBe(true);
    expect(
      standardSchemaAccepts(upgradeCheck.inputSchema, {
        unitId,
        operationType: "UNITCOMMAND_UPGRADE",
      })
    ).toBe(false);
    expect(standardSchemaAccepts(resettleCheck.inputSchema, { unitId, destination })).toBe(true);
    expect(standardSchemaAccepts(resettleRequest.inputSchema, { unitId, destination })).toBe(true);
    expect(
      standardSchemaAccepts(resettleRequest.inputSchema, {
        unitId,
        destination,
        args: { X: destination.x, Y: destination.y },
      })
    ).toBe(false);
    expect(
      standardSchemaAccepts(resettleCheck.inputSchema, {
        unitId,
        destination: { x: -1, y: destination.y },
      })
    ).toBe(false);
  });

  test("checks upgrade availability without mutation admission or raw validator output", async () => {
    const fake = fakeContext({
      upgradeChecks: [validation(true, { Success: true, rawCommand: "hidden" })],
    });

    const result = await call(
      Civ7ControlOrpcRouter.unit.upgrade.check,
      { unitId },
      { context: fake.context }
    );

    expect(result).toEqual({
      action: {
        kind: "upgrade",
        unitId,
      },
      available: true,
    });
    expect(fake.events).toEqual([
      {
        kind: "upgrade-check",
        input: { unitId },
        options: endpointDefaults,
      },
    ]);
    expectSemanticUnitCommandOmitsRawRuntimeDetails(result);
  });

  test("supports the in-process client for resettle checks with the exact semantic input", async () => {
    const fake = fakeContext({
      resettleChecks: [validation(false, { Success: false })],
    });
    const client = createCiv7ControlOrpcServerClient(fake.context);

    const result = await client.unit.resettle.check({ unitId, destination });

    expect(result).toEqual({
      action: {
        kind: "resettle",
        unitId,
        destination,
      },
      available: false,
    });
    expect(fake.events).toEqual([
      {
        kind: "resettle-check",
        input: { unitId, destination },
        options: endpointDefaults,
      },
    ]);
  });

  test("orchestrates readiness, precheck, one guarded send, and postcheck in order", async () => {
    const before = snapshot();
    const after = snapshot({
      firstReadyUnitId: probe(otherUnitId),
    });
    const fake = fakeContext({
      upgradeChecks: [validation(true), validation(true)],
      upgradeSends: [sendResult({ before, after })],
    });

    const result = await call(
      Civ7ControlOrpcRouter.unit.upgrade.request,
      { unitId },
      { context: fake.context }
    );

    expect(result).toMatchObject({
      action: {
        kind: "upgrade",
        unitId,
      },
      status: "sent-confirmed",
      postcondition: {
        classification: "queue-advanced",
        outcome: "cleared",
        confidence: "confirmed",
        confirmed: true,
        noRepeatAfterUnverified: false,
      },
      nextSteps: [
        {
          kind: "refresh-attention",
          source: "unit.upgrade.request",
        },
      ],
    });
    expect(fake.events).toEqual([
      { kind: "readiness", options: endpointDefaults },
      { kind: "upgrade-check", input: { unitId }, options: endpointDefaults },
      { kind: "upgrade-send", input: { unitId }, options: endpointDefaults },
      { kind: "upgrade-check", input: { unitId }, options: endpointDefaults },
    ]);
    expectSemanticUnitCommandOmitsRawRuntimeDetails(result);
  });

  test("does not send or postcheck when the explicit precheck rejects resettlement", async () => {
    const fake = fakeContext({
      resettleChecks: [validation(false, { Success: false, reason: "blocked" })],
    });

    const result = await call(
      Civ7ControlOrpcRouter.unit.resettle.request,
      { unitId, destination },
      { context: fake.context }
    );

    expect(result).toMatchObject({
      action: {
        kind: "resettle",
        unitId,
        destination,
      },
      status: "not-sent",
      postcondition: {
        classification: "not-sent",
        outcome: "not-sent",
        confidence: "unverified",
        confirmed: false,
        noRepeatAfterUnverified: true,
      },
      nextSteps: [
        {
          kind: "inspect-unit-command",
          source: "unit.resettle.request",
        },
      ],
    });
    expect(fake.events).toEqual([
      { kind: "readiness", options: endpointDefaults },
      {
        kind: "resettle-check",
        input: { unitId, destination },
        options: endpointDefaults,
      },
    ]);
  });

  test("treats an atomic guarded-send refusal as definitively not sent without postchecking", async () => {
    const rejected = validation(false, { Success: false, reason: "runtime guard changed" });
    const fake = fakeContext({
      upgradeChecks: [validation(true)],
      upgradeSends: [
        sendResult({
          sent: false,
          validation: rejected,
        }),
      ],
    });

    const result = await call(
      Civ7ControlOrpcRouter.unit.upgrade.request,
      { unitId },
      { context: fake.context }
    );

    expect(result).toMatchObject({
      status: "not-sent",
      postcondition: {
        classification: "not-sent",
        outcome: "not-sent",
      },
    });
    expect(fake.events).toEqual([
      { kind: "readiness", options: endpointDefaults },
      { kind: "upgrade-check", input: { unitId }, options: endpointDefaults },
      { kind: "upgrade-send", input: { unitId }, options: endpointDefaults },
    ]);
  });

  test("classifies observed postconditions in service-owned precedence order", async () => {
    const base = snapshot({
      unit: probe({
        id: unitId,
        activity: "AWAITING_COMMAND",
        health: 100,
      }),
      blocker: probe({ kind: "unit-command", active: true }),
    });
    const changedUnit = {
      id: unitId,
      activity: "DONE",
      health: 90,
    };
    const cases: ReadonlyArray<{
      name: string;
      before: Civ7ControlOrpcUnitCommandSnapshot;
      after: Civ7ControlOrpcUnitCommandSnapshot;
      beforeValidation?: Civ7ControlOrpcUnitCommandCheckResult;
      afterValidation?: Civ7ControlOrpcUnitCommandCheckResult;
      classification:
        | "queue-advanced"
        | "selected-unit-changed"
        | "activity-changed"
        | "unit-state-changed"
        | "blocker-changed"
        | "validation-changed"
        | "no-state-change";
      confirmed: boolean;
    }> = [
      {
        name: "queue change wins over every lower-priority transition",
        before: base,
        after: snapshot({
          firstReadyUnitId: probe(otherUnitId),
          selectedUnitId: probe(otherUnitId),
          unit: probe(changedUnit),
          blocker: probe(null),
        }),
        classification: "queue-advanced",
        confirmed: true,
      },
      {
        name: "selected-unit change wins over unit and blocker transitions",
        before: base,
        after: snapshot({
          selectedUnitId: probe(otherUnitId),
          unit: probe(changedUnit),
          blocker: probe(null),
        }),
        classification: "selected-unit-changed",
        confirmed: true,
      },
      {
        name: "activity change wins over other unit and blocker transitions",
        before: base,
        after: snapshot({
          unit: probe(changedUnit),
          blocker: probe(null),
        }),
        classification: "activity-changed",
        confirmed: true,
      },
      {
        name: "other unit change wins over blocker and validation transitions",
        before: base,
        after: snapshot({
          unit: probe({
            id: unitId,
            activity: "AWAITING_COMMAND",
            health: 90,
          }),
          blocker: probe(null),
        }),
        beforeValidation: validation(true),
        afterValidation: validation(false),
        classification: "unit-state-changed",
        confirmed: true,
      },
      {
        name: "blocker change wins over validation transitions",
        before: base,
        after: snapshot({
          unit: base.unit,
          blocker: probe(null),
        }),
        beforeValidation: validation(true),
        afterValidation: validation(false),
        classification: "blocker-changed",
        confirmed: true,
      },
      {
        name: "validation transition is retained when runtime snapshots are stable",
        before: base,
        after: base,
        beforeValidation: validation(true),
        afterValidation: validation(false),
        classification: "validation-changed",
        confirmed: false,
      },
      {
        name: "object key order alone is not a state transition",
        before: snapshot({
          unit: probe({
            id: unitId,
            activity: "AWAITING_COMMAND",
            nested: { alpha: 1, beta: 2 },
          }),
          blocker: probe({ alpha: 1, beta: 2 }),
        }),
        after: snapshot({
          unit: probe({
            nested: { beta: 2, alpha: 1 },
            activity: "AWAITING_COMMAND",
            id: unitId,
          }),
          blocker: probe({ beta: 2, alpha: 1 }),
        }),
        beforeValidation: validation(true, {
          Success: true,
          nested: { alpha: 1, beta: 2 },
        }),
        afterValidation: validation(true, {
          nested: { beta: 2, alpha: 1 },
          Success: true,
        }),
        classification: "no-state-change",
        confirmed: false,
      },
    ];

    for (const scenario of cases) {
      const beforeValidation = scenario.beforeValidation ?? validation(true);
      const afterValidation = scenario.afterValidation ?? validation(true);
      const fake = fakeContext({
        upgradeChecks: [validation(true), afterValidation],
        upgradeSends: [
          sendResult({
            validation: beforeValidation,
            before: scenario.before,
            after: scenario.after,
          }),
        ],
      });

      const result = await call(
        Civ7ControlOrpcRouter.unit.upgrade.request,
        { unitId },
        { context: fake.context }
      );

      expect(result.postcondition.classification, scenario.name).toBe(scenario.classification);
      expect(result.postcondition.confirmed, scenario.name).toBe(scenario.confirmed);
      expect(result.status, scenario.name).toBe(
        scenario.confirmed ? "sent-confirmed" : "sent-unverified"
      );
      expect(result.nextSteps[0]?.kind, scenario.name).toBe(
        scenario.confirmed ? "refresh-attention" : "do-not-repeat"
      );
    }
  });

  test("keeps failed state probes unverified instead of promoting them to mutation proof", async () => {
    const fake = fakeContext({
      upgradeChecks: [validation(true), validation(true)],
      upgradeSends: [
        sendResult({
          after: snapshot({
            firstReadyUnitId: probe(otherUnitId),
            selectedUnitId: failedProbe("selected-unit read failed"),
          }),
        }),
      ],
    });

    const result = await call(
      Civ7ControlOrpcRouter.unit.upgrade.request,
      { unitId },
      { context: fake.context }
    );

    expect(result).toMatchObject({
      status: "sent-unverified",
      postcondition: {
        classification: "missing-postcondition",
        outcome: "unknown",
        confidence: "unverified",
        confirmed: false,
        noRepeatAfterUnverified: true,
        reason: expect.stringContaining("required unit-state probes failed"),
      },
      nextSteps: [
        {
          kind: "do-not-repeat",
          source: "unit.upgrade.request",
        },
      ],
    });
  });

  test("reports a definitive pre-dispatch failure as not sent without postchecking", async () => {
    const fake = fakeContext({
      upgradeChecks: [validation(true)],
      upgradeSends: [
        dispatchError(
          "not-dispatched",
          "Civ7 tuner state selection failed before command dispatch"
        ),
      ],
    });

    const result = await call(
      Civ7ControlOrpcRouter.unit.upgrade.request,
      { unitId },
      { context: fake.context }
    );

    expect(result).toMatchObject({
      status: "not-sent",
      postcondition: {
        classification: "not-sent",
        outcome: "not-sent",
      },
      nextSteps: [
        {
          kind: "inspect-unit-command",
          source: "unit.upgrade.request",
        },
      ],
    });
    expect(fake.events).toEqual([
      { kind: "readiness", options: endpointDefaults },
      { kind: "upgrade-check", input: { unitId }, options: endpointDefaults },
      { kind: "upgrade-send", input: { unitId }, options: endpointDefaults },
    ]);
  });

  test("keeps an indeterminate send explicitly unknown and forbids repetition", async () => {
    const fake = fakeContext({
      upgradeChecks: [validation(true)],
      upgradeSends: [
        dispatchError(
          "indeterminate",
          "Timed out waiting for Civ7 tuner response to CMD:1:Game.UnitCommands.sendRequest(...)"
        ),
      ],
    });

    const result = await call(
      Civ7ControlOrpcRouter.unit.upgrade.request,
      { unitId },
      { context: fake.context }
    );

    expect(result).toMatchObject({
      status: "dispatch-unknown",
      postcondition: {
        classification: "missing-postcondition",
        outcome: "unknown",
        confidence: "unverified",
        confirmed: false,
        noRepeatAfterUnverified: true,
        reason: expect.stringContaining("gameplay dispatch is unknown"),
      },
      nextSteps: [
        {
          kind: "do-not-repeat",
          source: "unit.upgrade.request",
        },
      ],
    });
    expect(result.postcondition.reason).toContain("must not be repeated");
    expect(fake.events).toEqual([
      { kind: "readiness", options: endpointDefaults },
      { kind: "upgrade-check", input: { unitId }, options: endpointDefaults },
      { kind: "upgrade-send", input: { unitId }, options: endpointDefaults },
    ]);
    expectSemanticUnitCommandOmitsRawRuntimeDetails(result);
  });

  test("does not promote an outer tuner response into gameplay dispatch proof", async () => {
    const fake = fakeContext({
      upgradeChecks: [validation(true)],
      upgradeSends: [
        dispatchError(
          "dispatched",
          "Civ7 returned an invalid unit-command result after accepting the command"
        ),
      ],
    });

    const result = await call(
      Civ7ControlOrpcRouter.unit.upgrade.request,
      { unitId },
      { context: fake.context }
    );

    expect(result).toMatchObject({
      status: "dispatch-unknown",
      postcondition: {
        classification: "missing-postcondition",
        outcome: "unknown",
        confidence: "unverified",
        confirmed: false,
        noRepeatAfterUnverified: true,
        reason: expect.stringContaining("gameplay dispatch is unknown"),
      },
      nextSteps: [
        {
          kind: "do-not-repeat",
          source: "unit.upgrade.request",
        },
      ],
    });
    expect(fake.events).toEqual([
      { kind: "readiness", options: endpointDefaults },
      { kind: "upgrade-check", input: { unitId }, options: endpointDefaults },
      { kind: "upgrade-send", input: { unitId }, options: endpointDefaults },
    ]);
    expectSemanticUnitCommandOmitsRawRuntimeDetails(result);
  });

  test("does not trust dispatchStatus on a foreign thrown object", async () => {
    const fake = fakeContext({
      upgradeChecks: [validation(true)],
      upgradeSends: [
        Object.assign(new Error("foreign failure"), { dispatchStatus: "not-dispatched" }),
      ],
    });

    const result = await call(
      Civ7ControlOrpcRouter.unit.upgrade.request,
      { unitId },
      { context: fake.context }
    );

    expect(result).toMatchObject({
      status: "dispatch-unknown",
      postcondition: { classification: "missing-postcondition" },
      nextSteps: [{ kind: "do-not-repeat" }],
    });
  });

  test("keeps a sent request no-repeat guarded when its separate postcheck fails", async () => {
    const fake = fakeContext({
      resettleChecks: [
        validation(true),
        new Error("postcheck failed after Game.UnitCommands.sendRequest(...)"),
      ],
      resettleSends: [
        sendResult({
          before: snapshot(),
          after: snapshot({ firstReadyUnitId: probe(otherUnitId) }),
        }),
      ],
    });

    const result = await call(
      Civ7ControlOrpcRouter.unit.resettle.request,
      { unitId, destination },
      { context: fake.context }
    );

    expect(result).toMatchObject({
      status: "sent-unverified",
      postcondition: {
        classification: "missing-postcondition",
        outcome: "unknown",
        confidence: "unverified",
        confirmed: false,
        noRepeatAfterUnverified: true,
        reason: expect.stringContaining("post-send validation read failed"),
      },
      nextSteps: [
        {
          kind: "do-not-repeat",
          source: "unit.resettle.request",
        },
      ],
    });
    expect(fake.events).toEqual([
      { kind: "readiness", options: endpointDefaults },
      {
        kind: "resettle-check",
        input: { unitId, destination },
        options: endpointDefaults,
      },
      {
        kind: "resettle-send",
        input: { unitId, destination },
        options: endpointDefaults,
      },
      {
        kind: "resettle-check",
        input: { unitId, destination },
        options: endpointDefaults,
      },
    ]);
  });

  test("maps check and precheck failures to bounded tagged errors before any possible send", async () => {
    const checkFailure = fakeContext({
      upgradeChecks: [new Error("CMD:1:Game.UnitCommands.canStart(...) exposed check internals")],
    });
    const requestFailure = fakeContext({
      resettleChecks: [
        new Error("CMD:2:Game.UnitCommands.canStart(...) exposed precheck internals"),
      ],
    });

    const caughtCheck = await captureFailure(() =>
      call(Civ7ControlOrpcRouter.unit.upgrade.check, { unitId }, { context: checkFailure.context })
    );
    const caughtRequest = await captureFailure(() =>
      call(
        Civ7ControlOrpcRouter.unit.resettle.request,
        { unitId, destination },
        { context: requestFailure.context }
      )
    );

    expect(caughtCheck).toMatchObject({
      code: "UNIT_REQUEST_UNAVAILABLE",
      status: 503,
      data: {
        procedureKey: "unit.upgrade.check",
        source: "direct-control-facade",
      },
    });
    expect(caughtRequest).toMatchObject({
      code: "UNIT_REQUEST_UNAVAILABLE",
      status: 503,
      data: {
        procedureKey: "unit.resettle.request",
        source: "direct-control-facade",
      },
    });
    expect(JSON.stringify(caughtCheck)).not.toContain("CMD");
    expect(JSON.stringify(caughtCheck)).not.toContain("Game.UnitCommands");
    expect(JSON.stringify(caughtRequest)).not.toContain("CMD");
    expect(JSON.stringify(caughtRequest)).not.toContain("Game.UnitCommands");
    expect(checkFailure.events).toEqual([
      {
        kind: "upgrade-check",
        input: { unitId },
        options: endpointDefaults,
      },
    ]);
    expect(requestFailure.events).toEqual([
      { kind: "readiness", options: endpointDefaults },
      {
        kind: "resettle-check",
        input: { unitId, destination },
        options: endpointDefaults,
      },
    ]);
  });
});

type Scripted<T> = T | Error;

type FakeContextOptions = Readonly<{
  upgradeChecks?: ReadonlyArray<Scripted<Civ7ControlOrpcUnitCommandCheckResult>>;
  upgradeSends?: ReadonlyArray<Scripted<Civ7ControlOrpcUnitCommandSendResult>>;
  resettleChecks?: ReadonlyArray<Scripted<Civ7ControlOrpcUnitCommandCheckResult>>;
  resettleSends?: ReadonlyArray<Scripted<Civ7ControlOrpcUnitCommandSendResult>>;
}>;

type FixtureEvent = Readonly<{
  kind: "readiness" | "upgrade-check" | "upgrade-send" | "resettle-check" | "resettle-send";
  input?: unknown;
  options: unknown;
}>;

function fakeContext(options: FakeContextOptions): {
  context: Civ7ControlOrpcContext;
  events: Array<FixtureEvent>;
} {
  const events: Array<FixtureEvent> = [];
  const upgradeChecks = [...(options.upgradeChecks ?? [])];
  const upgradeSends = [...(options.upgradeSends ?? [])];
  const resettleChecks = [...(options.resettleChecks ?? [])];
  const resettleSends = [...(options.resettleSends ?? [])];

  return {
    context: {
      endpointDefaults,
      directControl: directControlFacadeFixture({
        getCiv7PlayableStatus: async (callOptions) => {
          events.push({ kind: "readiness", options: callOptions });
          return playableStatusResult();
        },
        checkCiv7UnitUpgrade: async (input, callOptions) => {
          events.push({ kind: "upgrade-check", input, options: callOptions });
          return scriptedResult(upgradeChecks, "upgrade check");
        },
        sendCiv7UnitUpgrade: async (input, callOptions) => {
          events.push({ kind: "upgrade-send", input, options: callOptions });
          return scriptedResult(upgradeSends, "upgrade send");
        },
        checkCiv7UnitResettle: async (input, callOptions) => {
          events.push({ kind: "resettle-check", input, options: callOptions });
          return scriptedResult(resettleChecks, "resettle check");
        },
        sendCiv7UnitResettle: async (input, callOptions) => {
          events.push({ kind: "resettle-send", input, options: callOptions });
          return scriptedResult(resettleSends, "resettle send");
        },
      }),
    },
    events,
  };
}

function scriptedResult<T>(script: Array<Scripted<T>>, label: string): T {
  const result = script.shift();
  if (result === undefined) throw new Error(`Missing scripted ${label} result`);
  if (result instanceof Error) throw result;
  return result;
}

function validation(
  valid: boolean,
  result: unknown = { Success: valid }
): Civ7ControlOrpcUnitCommandCheckResult {
  return { valid, result };
}

function probe<T>(value: T): Civ7ControlOrpcRuntimeProbe<T> {
  return { ok: true, value };
}

function failedProbe(error: string): Civ7ControlOrpcRuntimeProbe<never> {
  return { ok: false, error };
}

function dispatchError(
  dispatchStatus: Civ7ControlOrpcCommandDispatchStatus,
  message: string
): Error & { dispatchStatus: Civ7ControlOrpcCommandDispatchStatus } {
  const error = Object.assign(new Error(message), {
    code: "command-failed" as const,
    dispatchStatus,
  });
  error.name = "Civ7DirectControlError";
  return error;
}

function snapshot(
  overrides: Partial<Civ7ControlOrpcUnitCommandSnapshot> = {}
): Civ7ControlOrpcUnitCommandSnapshot {
  return {
    unit: probe({
      id: unitId,
      activity: "AWAITING_COMMAND",
    }),
    selectedUnitId: probe(unitId),
    firstReadyUnitId: probe(unitId),
    blocker: probe({ kind: "unit-command", active: true }),
    ...overrides,
  };
}

function sendResult(
  overrides: Partial<Civ7ControlOrpcUnitCommandSendResult> = {}
): Civ7ControlOrpcUnitCommandSendResult {
  return {
    sent: true,
    validation: validation(true),
    before: snapshot(),
    after: snapshot(),
    ...overrides,
  };
}

async function captureFailure(run: () => Promise<unknown>): Promise<unknown> {
  try {
    await run();
  } catch (error) {
    return error;
  }
  throw new Error("Expected procedure call to fail");
}

function expectSemanticUnitCommandOmitsRawRuntimeDetails(result: unknown) {
  const serialized = JSON.stringify(result);
  expect(serialized).not.toContain("CMD");
  expect(serialized).not.toContain("Game.UnitCommands");
  expect(serialized).not.toContain('"host"');
  expect(serialized).not.toContain('"port"');
  expect(serialized).not.toContain('"rawCommand"');
  expect(serialized).not.toContain('"command"');
  expect(serialized).not.toContain('"operationType"');
  expect(serialized).not.toContain('"result"');
  expect(serialized).not.toContain('"before"');
  expect(serialized).not.toContain('"after"');
}

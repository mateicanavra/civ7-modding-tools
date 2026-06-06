import { call } from "@orpc/server";
import { Value } from "typebox/value";
import { describe, expect, test } from "vitest";

import {
  Civ7ControlOrpcContract,
  Civ7ControlOrpcRouter,
  Civ7UnitRequestUnavailableError,
  Civ7UnitResettleInputSchema,
  Civ7UnitUpgradeInputSchema,
  createCiv7ControlOrpcServerClient,
  type Civ7ControlOrpcContext,
} from "../src/index";

const unitId = { owner: 0, id: 1769488, type: 26 };
const destination = { x: 17, y: 25 };

type UnitCommandRuntimeResult = Awaited<
  ReturnType<Civ7ControlOrpcContext["directControl"]["requestCiv7UnitCommand"]>
>;

describe("unit upgrade/resettle control-oRPC procedures", () => {
  test("own semantic unit input contracts without endpoint or raw command fields", () => {
    expect(Value.Check(Civ7UnitUpgradeInputSchema, { unitId })).toBe(true);
    expect(Value.Check(Civ7UnitResettleInputSchema, {
      unitId,
      destination,
    })).toBe(true);

    for (const invalid of [
      { unitId, rawCommand: "Game.UnitCommands.sendRequest(...)" },
      { unitId, command: "Game.UnitCommands.sendRequest(...)" },
      { unitId, session: { state: "Tuner" } },
      { unitId, state: { role: "tuner" } },
      { unitId, host: "127.0.0.1" },
      { unitId, port: 4318 },
    ]) {
      expect(Value.Check(Civ7UnitUpgradeInputSchema, invalid)).toBe(false);
    }

    expect(Value.Check(Civ7UnitResettleInputSchema, {
      unitId,
      destination: { x: 17.5, y: 25 },
    })).toBe(false);
    expect(Value.Check(Civ7UnitResettleInputSchema, {
      unitId,
      destination: { x: -1, y: 25 },
    })).toBe(false);
    expect(Value.Check(Civ7UnitResettleInputSchema, {
      unitId,
      destination: { x: 17, y: 1_000_001 },
    })).toBe(false);
  });

  test("calls unit upgrade through native Effect/oRPC and omits raw runtime fields", async () => {
    const fake = fakeContext(unitCommandResult("queue-advanced"));

    const result = await call(
      Civ7ControlOrpcRouter.unit.upgrade.request,
      { unitId },
      { context: fake.context },
    );

    expect(result).toMatchObject({
      action: {
        kind: "upgrade",
        unitId,
      },
      sent: true,
      status: "sent-confirmed",
      validation: {
        beforeValid: true,
        afterValid: true,
      },
      postcondition: {
        classification: "queue-advanced",
        outcome: "cleared",
        confidence: "confirmed",
        confirmed: true,
        noRepeatAfterUnverified: false,
      },
      nextSteps: [{
        kind: "refresh-attention",
        source: "unit.upgrade.request",
      }],
    });
    expect(fake.calls).toEqual([{
      input: {
        unitId,
        operationType: "UNITCOMMAND_UPGRADE",
        args: {},
      },
      options: {
        host: "127.0.0.1",
        port: 4318,
        timeoutMs: 1_000,
      },
    }]);
    expectSemanticUnitRequestOmitsRawRuntimeDetails(result);
  });

  test("supports the in-process server-side router client for resettle", async () => {
    const fake = fakeContext(unitCommandResult("unit-state-changed"));
    const client = createCiv7ControlOrpcServerClient(fake.context);

    const result = await client.unit.resettle.request({
      unitId,
      destination,
    });

    expect(result).toMatchObject({
      action: {
        kind: "resettle",
        unitId,
        destination,
      },
      sent: true,
      status: "sent-confirmed",
      postcondition: {
        classification: "unit-state-changed",
        confidence: "confirmed",
        noRepeatAfterUnverified: false,
      },
    });
    expect(fake.calls[0]?.input).toEqual({
      unitId,
      operationType: "UNITCOMMAND_RESETTLE",
      args: {
        X: 17,
        Y: 25,
      },
    });
    expectSemanticUnitRequestOmitsRawRuntimeDetails(result);
  });

  test("keeps validation-only and no-state-change postconditions guarded", async () => {
    for (const classification of ["validation-changed", "no-state-change"] as const) {
      const fake = fakeContext(unitCommandResult(classification));

      const result = await call(
        Civ7ControlOrpcRouter.unit.upgrade.request,
        { unitId },
        { context: fake.context },
      );

      expect(result).toMatchObject({
        sent: true,
        status: "sent-unverified",
        postcondition: {
          classification,
          confidence: "unverified",
          confirmed: false,
          noRepeatAfterUnverified: true,
        },
        nextSteps: [{
          kind: "do-not-repeat",
          source: "unit.upgrade.request",
        }],
      });
    }
  });

  test("keeps missing postconditions no-repeat guarded", async () => {
    const fake = fakeContext(unitCommandResult("queue-advanced", {
      includePostcondition: false,
    }));

    const result = await call(
      Civ7ControlOrpcRouter.unit.upgrade.request,
      { unitId },
      { context: fake.context },
    );

    expect(result).toMatchObject({
      sent: true,
      status: "sent-unverified",
      postcondition: {
        classification: "missing-postcondition",
        outcome: "unknown",
        confidence: "unverified",
        confirmed: false,
        noRepeatAfterUnverified: true,
      },
      nextSteps: [{
        kind: "do-not-repeat",
        source: "unit.upgrade.request",
      }],
    });
  });

  test("projects validator-blocked unit requests as not-sent", async () => {
    const fake = fakeContext(unitCommandResult("not-sent", {
      sent: false,
    }));

    const result = await call(
      Civ7ControlOrpcRouter.unit.resettle.request,
      { unitId, destination },
      { context: fake.context },
    );

    expect(result).toMatchObject({
      sent: false,
      status: "not-sent",
      validation: {
        beforeValid: false,
        afterValid: false,
      },
      postcondition: {
        classification: "not-sent",
        outcome: "not-sent",
        confidence: "unverified",
        noRepeatAfterUnverified: true,
      },
      nextSteps: [{
        kind: "inspect-unit-command",
        source: "unit.resettle.request",
      }],
    });
  });

  test("maps facade failures to tagged errors without raw details", async () => {
    const fake = fakeContext(new Error(
      "Timed out waiting for Civ7 tuner response to CMD:1:Game.UnitCommands.sendRequest(...)",
    ));

    await expect(
      call(Civ7ControlOrpcRouter.unit.upgrade.request, { unitId }, {
        context: fake.context,
      }),
    ).rejects.toMatchObject({
      code: "UNIT_REQUEST_UNAVAILABLE",
      status: 503,
      data: {
        procedureKey: "unit.upgrade.request",
        source: "direct-control-facade",
      },
    });

    try {
      await call(Civ7ControlOrpcRouter.unit.upgrade.request, { unitId }, {
        context: fake.context,
      });
    } catch (err) {
      const serialized = JSON.stringify(err);
      expect(serialized).not.toContain("CMD");
      expect(serialized).not.toContain("Game.UnitCommands");
      expect(serialized).not.toContain("rawCommand");
      expect(serialized).not.toContain("command-failed");
    }
  });

  test("publishes contract-first unit upgrade and resettle leaves", () => {
    expect(Civ7ControlOrpcContract.unit.upgrade.request["~orpc"]).toMatchObject({
      meta: {
        family: "unit",
        procedureKey: "unit.upgrade.request",
        proofBoundary: "local-package-test",
        risk: "mutation",
      },
    });
    expect(Civ7ControlOrpcContract.unit.resettle.request["~orpc"]).toMatchObject({
      meta: {
        family: "unit",
        procedureKey: "unit.resettle.request",
        proofBoundary: "local-package-test",
        risk: "mutation",
      },
    });
    expect(
      Civ7ControlOrpcContract.unit.upgrade.request["~orpc"].errorMap,
    ).toHaveProperty("UNIT_REQUEST_UNAVAILABLE");
    expect(Civ7UnitRequestUnavailableError.code).toBe("UNIT_REQUEST_UNAVAILABLE");
  });
});

function fakeContext(
  resultOrError: UnitCommandRuntimeResult | Error,
): {
  context: Civ7ControlOrpcContext;
  calls: Array<{
    input: unknown;
    options: unknown;
  }>;
} {
  const calls: Array<{
    input: unknown;
    options: unknown;
  }> = [];

  return {
    context: {
      endpointDefaults: {
        host: "127.0.0.1",
        port: 4318,
        timeoutMs: 1_000,
      },
      directControl: {
        getCiv7PlayableStatus: async () => ({
          playable: true,
          readiness: "tuner-ready",
        }),
        requestCiv7UnitCommand: async (input, endpointDefaults) => {
          calls.push({ input, options: endpointDefaults });
          if (resultOrError instanceof Error) throw resultOrError;
          return resultOrError;
        },
      } as Civ7ControlOrpcContext["directControl"],
    },
    calls,
  };
}

function unitCommandResult(
  classification: NonNullable<
    UnitCommandRuntimeResult["postcondition"]
  >["classification"],
  options: {
    includePostcondition?: boolean;
    sent?: boolean;
  } = {},
): UnitCommandRuntimeResult {
  const sent = options.sent ?? classification !== "not-sent";
  const beforeValid = classification === "not-sent" ? false : true;
  const afterValid = classification === "validation-changed"
    ? !beforeValid
    : beforeValid;
  return {
    before: {
      family: "unit-command",
      operationType: "UNITCOMMAND_UPGRADE",
      valid: beforeValid,
      result: { Success: beforeValid },
      host: "127.0.0.1",
      port: 4318,
      state: { id: "1", name: "Tuner", role: "tuner" },
      enumValue: "UNITCOMMAND_UPGRADE",
      target: { unitId },
      args: {},
    },
    after: {
      family: "unit-command",
      operationType: "UNITCOMMAND_UPGRADE",
      valid: afterValid,
      result: { Success: afterValid },
      host: "127.0.0.1",
      port: 4318,
      state: { id: "1", name: "Tuner", role: "tuner" },
      enumValue: "UNITCOMMAND_UPGRADE",
      target: { unitId },
      args: {},
    },
    sent,
    verified: sent && classification !== "no-state-change",
    ...(sent
      ? {
          command: {
            output: "Game.UnitCommands.sendRequest(...)",
          },
        }
      : {}),
    ...(options.includePostcondition === false
      ? {}
      : {
          postcondition: {
            family: "unit-command",
            operationType: "UNITCOMMAND_UPGRADE",
            classification,
            reason: `test ${classification}`,
          },
        }),
  } as UnitCommandRuntimeResult;
}

function expectSemanticUnitRequestOmitsRawRuntimeDetails(result: unknown) {
  const serialized = JSON.stringify(result);
  expect(serialized).not.toContain("CMD");
  expect(serialized).not.toContain("Game.UnitCommands");
  expect(serialized).not.toContain("Game.UnitOperations");
  expect(serialized).not.toContain("\"host\"");
  expect(serialized).not.toContain("\"port\"");
  expect(serialized).not.toContain("\"state\"");
  expect(serialized).not.toContain("\"session\"");
  expect(serialized).not.toContain("\"rawCommand\"");
  expect(serialized).not.toContain("\"command\"");
  expect(serialized).not.toContain("\"operationType\"");
  expect(serialized).not.toContain("\"sendResult\"");
  expect(serialized).not.toContain("\"result\"");
  expect(serialized).not.toContain("\"verified\"");
  expect(serialized).not.toContain("\"before\"");
  expect(serialized).not.toContain("\"after\"");
}

import { call } from "@orpc/server";
import { describe, expect, test } from "vitest";

import {
  Civ7ControlOrpcContract,
  Civ7ControlOrpcRouter,
  Civ7MutationApprovalRequiredError,
  Civ7UnitTargetActionUnavailableError,
  createCiv7ControlOrpcServerClient,
  type Civ7ControlOrpcContext,
  type Civ7ControlOrpcUnitTargetActionResult,
} from "../src/index";

const unitId = { owner: 0, id: 42, type: 1 };
const target = { x: 22, y: 31 };

describe("unit.target.action.request control-oRPC procedure", () => {
  test("calls the unit target action mutation through native Effect/oRPC with context approval", async () => {
    const fake = fakeContext(unitTargetActionResult("target-reached"));

    const result = await call(
      Civ7ControlOrpcRouter.unit.target.action.request,
      { unitId, ...target },
      { context: fake.context },
    );

    expect(result).toMatchObject({
      unitId,
      target,
      sent: true,
      status: "sent-confirmed",
      validation: {
        candidateCount: 2,
        acceptedCandidateCount: 1,
        selected: {
          family: "unit-operation",
          operationType: "MOVE_TO",
          valid: true,
          targetInReturnedPlots: true,
          rejectedReason: null,
        },
      },
      postcondition: {
        classification: "target-reached",
        outcome: "cleared",
        confidence: "confirmed",
        confirmed: true,
        noRepeatAfterUnverified: false,
        destinationReached: true,
        requestedLocation: target,
        landedLocation: target,
        source: "bounded-poll",
      },
      nextSteps: [{
        kind: "refresh-attention",
        source: "unit.target.action.request",
      }],
    });
    const serialized = JSON.stringify(result);
    expect(serialized).not.toContain("CMD");
    expect(serialized).not.toContain("Game.UnitOperations");
    expect(serialized).not.toContain("Game.UnitCommands");
    expect(serialized).not.toContain("\"host\"");
    expect(serialized).not.toContain("\"port\"");
    expect(serialized).not.toContain("\"state\"");
    expect(serialized).not.toContain("\"sendResult\"");
    expect(serialized).not.toContain("\"result\"");
    expect(serialized).not.toContain("\"verified\"");
    expect(fake.calls).toEqual([{
      input: { unitId, ...target },
      options: {
        host: "127.0.0.1",
        port: 4318,
        timeoutMs: 1_000,
      },
      approval: {
        approved: true,
        reason: "test approved unit target action",
        disposableSession: true,
      },
    }]);
  });

  test("supports the in-process server-side router client", async () => {
    const fake = fakeContext(unitTargetActionResult("target-reached"));
    const client = createCiv7ControlOrpcServerClient(fake.context);

    const result = await client.unit.target.action.request({
      unitId,
      ...target,
    });

    expect(result.status).toBe("sent-confirmed");
    expect(fake.calls).toHaveLength(1);
  });

  test("requires context approval before the direct-control mutation port runs", async () => {
    const fake = fakeContext(unitTargetActionResult("target-reached"), {
      approval: undefined,
    });

    await expect(
      call(Civ7ControlOrpcRouter.unit.target.action.request, {
        unitId,
        ...target,
      }, { context: fake.context }),
    ).rejects.toMatchObject({
      code: "MUTATION_APPROVAL_REQUIRED",
      status: 403,
      data: {
        procedureKey: "unit.target.action.request",
        source: "context.approval",
        risk: "mutation",
      },
    });
    expect(fake.calls).toEqual([]);
  });

  test("rejects empty approval reasons before the direct-control mutation port runs", async () => {
    const fake = fakeContext(unitTargetActionResult("target-reached"), {
      approval: {
        approved: true,
        reason: "   ",
      },
    });

    await expect(
      call(Civ7ControlOrpcRouter.unit.target.action.request, {
        unitId,
        ...target,
      }, { context: fake.context }),
    ).rejects.toMatchObject({
      code: "MUTATION_APPROVAL_REQUIRED",
      status: 403,
      data: {
        procedureKey: "unit.target.action.request",
        source: "context.approval",
        risk: "mutation",
      },
    });
    expect(fake.calls).toEqual([]);
  });

  test("keeps confirmed path shortfalls no-repeat guarded", async () => {
    const fake = fakeContext(unitTargetActionResult("path-shortfall"));

    const result = await call(
      Civ7ControlOrpcRouter.unit.target.action.request,
      { unitId, ...target },
      { context: fake.context },
    );

    expect(result).toMatchObject({
      sent: true,
      status: "sent-guarded",
      postcondition: {
        classification: "path-shortfall",
        outcome: "state-changed",
        confidence: "confirmed",
        confirmed: true,
        noRepeatAfterUnverified: true,
        destinationReached: false,
        landedLocation: { x: 21, y: 31 },
      },
      nextSteps: [{
        kind: "do-not-repeat",
        source: "unit.target.action.request",
      }],
    });
  });

  test("keeps unverified no-state-change results no-repeat guarded", async () => {
    const fake = fakeContext(unitTargetActionResult("no-state-change"));

    const result = await call(
      Civ7ControlOrpcRouter.unit.target.action.request,
      { unitId, ...target },
      { context: fake.context },
    );

    expect(result).toMatchObject({
      sent: true,
      status: "sent-unverified",
      postcondition: {
        classification: "no-state-change",
        outcome: "no-state-change",
        confidence: "unverified",
        confirmed: false,
        noRepeatAfterUnverified: true,
      },
      nextSteps: [{
        kind: "do-not-repeat",
        source: "unit.target.action.request",
      }],
    });
  });

  test("keeps missing postconditions no-repeat guarded", async () => {
    const fake = fakeContext(unitTargetActionResult("target-reached", {
      includeVerification: false,
      verified: false,
    }));

    const result = await call(
      Civ7ControlOrpcRouter.unit.target.action.request,
      { unitId, ...target },
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
    });
  });

  test("projects validator-blocked unit target actions as not-sent", async () => {
    const fake = fakeContext(unitTargetActionResult("not-sent", {
      sent: false,
      selected: null,
      verified: false,
    }));

    const result = await call(
      Civ7ControlOrpcRouter.unit.target.action.request,
      { unitId, ...target },
      { context: fake.context },
    );

    expect(result).toMatchObject({
      sent: false,
      status: "not-sent",
      validation: {
        selected: null,
      },
      postcondition: {
        classification: "not-sent",
        outcome: "not-sent",
        confidence: "unverified",
        noRepeatAfterUnverified: true,
      },
      nextSteps: [{
        kind: "inspect-unit-action",
        source: "unit.target.action.request",
      }],
    });
  });

  test("keeps approval, endpoint, session, state, and raw command fields out of procedure input", async () => {
    const invalidInputs = [
      { unitId, ...target, approvalReason: "test approved unit target action" },
      { unitId, ...target, disposableSession: true },
      { unitId, ...target, host: "127.0.0.1" },
      { unitId, ...target, port: 4318 },
      { unitId, ...target, state: { role: "app-ui" } },
      { unitId, ...target, stateName: "App UI" },
      { unitId, ...target, session: { state: "App UI" } },
      { unitId, ...target, command: "Game.UnitOperations.sendRequest(...)" },
      { unitId, ...target, rawCommand: "Game.UnitOperations.sendRequest(...)" },
      { unitId, x: 22.5, y: 31 },
      { unitId, x: -1, y: 31 },
      { unitId, x: 22, y: 1_000_001 },
      { unitId: { owner: 0, type: 1 }, ...target },
    ];

    for (const input of invalidInputs) {
      const fake = fakeContext(unitTargetActionResult("target-reached"));

      await expect(
        call(
          Civ7ControlOrpcRouter.unit.target.action.request,
          input as never,
          { context: fake.context },
        ),
      ).rejects.toMatchObject({ code: "BAD_REQUEST" });
      expect(fake.calls).toEqual([]);
    }
  });

  test("maps unit target action facade failures to a tagged error without raw details", async () => {
    const fake = fakeContext(new Error(
      "Timed out waiting for Civ7 tuner response to CMD:65535:Game.UnitOperations.sendRequest(...)",
    ));

    await expect(
      call(Civ7ControlOrpcRouter.unit.target.action.request, {
        unitId,
        ...target,
      }, { context: fake.context }),
    ).rejects.toMatchObject({
      code: "UNIT_TARGET_ACTION_UNAVAILABLE",
      status: 503,
      data: {
        procedureKey: "unit.target.action.request",
        source: "direct-control-facade",
      },
    });

    try {
      await call(Civ7ControlOrpcRouter.unit.target.action.request, {
        unitId,
        ...target,
      }, { context: fake.context });
    } catch (err) {
      const serialized = JSON.stringify(err);
      expect(serialized).not.toContain("CMD");
      expect(serialized).not.toContain("Game.UnitOperations");
      expect(serialized).not.toContain("rawCommand");
      expect(serialized).not.toContain("command-failed");
    }
  });

  test("publishes a contract-first unit.target.action.request leaf", () => {
    expect(
      Civ7ControlOrpcContract.unit.target.action.request["~orpc"],
    ).toMatchObject({
      meta: {
        family: "unit",
        procedureKey: "unit.target.action.request",
        proofBoundary: "local-package-test",
        risk: "mutation",
      },
    });
    expect(
      Civ7ControlOrpcContract.unit.target.action.request["~orpc"]
        .errorMap,
    ).toHaveProperty("MUTATION_APPROVAL_REQUIRED");
    expect(
      Civ7ControlOrpcContract.unit.target.action.request["~orpc"]
        .errorMap,
    ).toHaveProperty("UNIT_TARGET_ACTION_UNAVAILABLE");
    expect(Civ7MutationApprovalRequiredError.code).toBe(
      "MUTATION_APPROVAL_REQUIRED",
    );
    expect(Civ7UnitTargetActionUnavailableError.code).toBe(
      "UNIT_TARGET_ACTION_UNAVAILABLE",
    );
  });
});

function fakeContext(
  resultOrError: Civ7ControlOrpcUnitTargetActionResult | Error,
  options: {
    approval?: Civ7ControlOrpcContext["approval"];
  } = {},
): {
  context: Civ7ControlOrpcContext;
  calls: Array<{
    input: unknown;
    options: unknown;
    approval: unknown;
  }>;
} {
  const calls: Array<{
    input: unknown;
    options: unknown;
    approval: unknown;
  }> = [];

  return {
    context: {
      endpointDefaults: {
        host: "127.0.0.1",
        port: 4318,
        timeoutMs: 1_000,
      },
      approval: options.approval === undefined && !("approval" in options)
        ? {
            approved: true,
            reason: "test approved unit target action",
            disposableSession: true,
          }
        : options.approval,
      directControl: {
        getCiv7PlayableStatus: async () => ({
          playable: true,
          readiness: "tuner-ready",
        }),
        requestCiv7UnitTargetAction: async (
          input,
          endpointDefaults,
          approval,
        ) => {
          calls.push({ input, options: endpointDefaults, approval });
          if (resultOrError instanceof Error) throw resultOrError;
          return resultOrError;
        },
      } as Civ7ControlOrpcContext["directControl"],
    },
    calls,
  };
}

function unitTargetActionResult(
  classification: NonNullable<
    Civ7ControlOrpcUnitTargetActionResult["verification"]
  >["classification"],
  options: {
    includeVerification?: boolean;
    selected?: Civ7ControlOrpcUnitTargetActionResult["selected"];
    sent?: boolean;
    verified?: boolean;
  } = {},
): Civ7ControlOrpcUnitTargetActionResult {
  const sent = options.sent ?? classification !== "not-sent";
  const selected = "selected" in options ? options.selected : moveCandidate();
  const includeVerification = options.includeVerification ?? true;
  const verification = includeVerification
    ? unitTargetVerification(classification)
    : undefined;

  return {
    host: "127.0.0.1",
    port: 4318,
    state: { id: "65535", name: "App UI" },
    unitId,
    target: {
      ...target,
      index: { ok: true, value: 713_967_338 },
    },
    beforeUnit: unitProbe({ x: 20, y: 31 }),
    beforeTargetUnits: { ok: true, value: [] },
    candidates: [
      rejectedCandidate(),
      moveCandidate(),
    ],
    selected,
    sent,
    ...(sent
      ? {
          sendResult: {
            rawCommand: "Game.UnitOperations.sendRequest(...)",
          },
          afterUnit: unitProbe(verification?.landedLocation ?? target),
          afterTargetUnits: { ok: true, value: [] },
        }
      : {}),
    verified: options.verified
      ?? (verification?.status === "verified"),
    ...(verification ? { verification } : {}),
    notes: ["fixture"],
  } as Civ7ControlOrpcUnitTargetActionResult;
}

function unitTargetVerification(
  classification: NonNullable<
    Civ7ControlOrpcUnitTargetActionResult["verification"]
  >["classification"],
): NonNullable<Civ7ControlOrpcUnitTargetActionResult["verification"]> {
  const landedLocation = classification === "path-shortfall"
    ? { x: 21, y: 31 }
    : classification === "not-sent" || classification === "no-state-change"
    ? { x: 20, y: 31 }
    : target;
  const verified =
    classification !== "not-sent" && classification !== "no-state-change";

  return {
    status: verified ? "verified" : classification,
    classification,
    unitChanged: verified,
    targetUnitsChanged: classification === "target-state-changed",
    destinationReached: classification === "path-shortfall"
      ? false
      : classification === "target-reached"
      ? true
      : null,
    requestedLocation: target,
    landedLocation,
    source: "bounded-poll",
    attempts: 2,
    observedAfterMs: 500,
    reason: `test ${classification}`,
  };
}

function moveCandidate(): NonNullable<
  Civ7ControlOrpcUnitTargetActionResult["selected"]
> {
  return {
    family: "unit-operation",
    operationType: "MOVE_TO",
    args: {
      X: target.x,
      Y: target.y,
      Modifiers: 0,
    },
    valid: true,
    result: {
      raw: "Game.UnitOperations.canStart(...)",
    },
    targetInReturnedPlots: true,
  };
}

function rejectedCandidate(): NonNullable<
  Civ7ControlOrpcUnitTargetActionResult["selected"]
> {
  return {
    family: "unit-command",
    operationType: "UNITCOMMAND_ARMY_OVERRUN",
    args: {
      X: target.x,
      Y: target.y,
    },
    valid: false,
    result: {
      error: "not available",
    },
    targetInReturnedPlots: null,
    rejectedReason: "canStart false",
  };
}

function unitProbe(location: { x: number; y: number }) {
  return {
    ok: true as const,
    value: {
      id: unitId,
      owner: unitId.owner,
      type: unitId.type,
      location,
      movementMovesRemaining: 1,
      movementTurnsRemaining: 0,
      attacksRemaining: 1,
    },
  };
}

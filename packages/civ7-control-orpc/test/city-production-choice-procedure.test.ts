import { call } from "@orpc/server";
import { describe, expect, test } from "vitest";

import {
  Civ7ControlOrpcContract,
  Civ7ControlOrpcRouter,
  Civ7MutationApprovalRequiredError,
  Civ7ProductionChoiceUnavailableError,
  createCiv7ControlOrpcServerClient,
  type Civ7ControlOrpcContext,
  type Civ7ControlOrpcProductionChoiceResult,
} from "../src/index";

const cityId = { owner: 0, id: 65_536, type: 1 };
const args = { ConstructibleType: 713_967_338, X: 22, Y: 31 };

describe("city.production.choice.request control-oRPC procedure", () => {
  test("calls the production choice mutation through native Effect/oRPC with context approval", async () => {
    const fake = fakeContext(
      productionChoiceResult("production-choice-cleared"),
    );

    const result = await call(
      Civ7ControlOrpcRouter.city.production.choice.request,
      { cityId, args },
      { context: fake.context },
    );

    expect(result).toMatchObject({
      cityId,
      args,
      sent: true,
      status: "sent-confirmed",
      validation: {
        beforeValid: true,
        afterValid: true,
      },
      postcondition: {
        classification: "production-choice-cleared",
        outcome: "cleared",
        confidence: "confirmed",
        confirmed: true,
        noRepeatAfterUnverified: false,
        productionStateChanged: false,
        blockerStillLive: false,
      },
      nextSteps: [{
        kind: "refresh-attention",
        source: "city.production.choice.request",
      }],
    });
    expect(JSON.stringify(result)).not.toContain("CMD");
    expect(JSON.stringify(result)).not.toContain("Game.CityOperations");
    expect(JSON.stringify(result)).not.toContain("host");
    expect(JSON.stringify(result)).not.toContain("port");
    expect(JSON.stringify(result)).not.toContain("state");
    expect(JSON.stringify(result)).not.toContain("command");
    expect(JSON.stringify(result)).not.toContain("sendResult");
    expect(fake.calls).toEqual([{
      input: { cityId, args },
      options: {
        host: "127.0.0.1",
        port: 4318,
        timeoutMs: 1_000,
      },
      approval: {
        approved: true,
        reason: "test approved production choice",
        disposableSession: true,
      },
    }]);
  });

  test("supports the in-process server-side router client", async () => {
    const fake = fakeContext(
      productionChoiceResult("production-choice-cleared"),
    );
    const client = createCiv7ControlOrpcServerClient(fake.context);

    const result = await client.city.production.choice.request({ cityId, args });

    expect(result.status).toBe("sent-confirmed");
    expect(fake.calls).toHaveLength(1);
  });

  test("requires context approval before the direct-control mutation port runs", async () => {
    const fake = fakeContext(productionChoiceResult("production-choice-cleared"), {
      approval: undefined,
    });

    await expect(
      call(Civ7ControlOrpcRouter.city.production.choice.request, {
        cityId,
        args,
      }, { context: fake.context }),
    ).rejects.toMatchObject({
      code: "MUTATION_APPROVAL_REQUIRED",
      status: 403,
      data: {
        procedureKey: "city.production.choice.request",
        source: "context.approval",
        risk: "mutation",
      },
    });
    expect(fake.calls).toEqual([]);
  });

  test("rejects empty approval reasons before the direct-control mutation port runs", async () => {
    const fake = fakeContext(productionChoiceResult("production-choice-cleared"), {
      approval: {
        approved: true,
        reason: "   ",
      },
    });

    await expect(
      call(Civ7ControlOrpcRouter.city.production.choice.request, {
        cityId,
        args,
      }, { context: fake.context }),
    ).rejects.toMatchObject({
      code: "MUTATION_APPROVAL_REQUIRED",
      status: 403,
      data: {
        procedureKey: "city.production.choice.request",
        source: "context.approval",
        risk: "mutation",
      },
    });
    expect(fake.calls).toEqual([]);
  });

  test("projects unexpected middleware failures without raw implementation details", async () => {
    const fake = fakeContext(productionChoiceResult("production-choice-cleared"), {
      approval: {
        approved: true,
        reason: 7,
      } as never,
    });

    await expect(
      call(Civ7ControlOrpcRouter.city.production.choice.request, {
        cityId,
        args,
      }, { context: fake.context }),
    ).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
      status: 500,
      message: "Civ7 control-oRPC procedure failed.",
    });
    expect(fake.calls).toEqual([]);

    try {
      await call(Civ7ControlOrpcRouter.city.production.choice.request, {
        cityId,
        args,
      }, { context: fake.context });
    } catch (err) {
      const serialized = JSON.stringify(err);
      expect(serialized).not.toContain("trim");
      expect(serialized).not.toContain("reason");
      expect(serialized).not.toContain("TypeError");
      expect(serialized).not.toContain("Game.CityOperations");
      expect(serialized).not.toContain("CMD");
    }
  });

  test("keeps unconfirmed production postconditions no-repeat guarded", async () => {
    const fake = fakeContext(
      productionChoiceResult("production-state-changed-blocker-still-live", {
        verified: true,
      }),
    );

    const result = await call(
      Civ7ControlOrpcRouter.city.production.choice.request,
      { cityId, args },
      { context: fake.context },
    );

    expect(result).toMatchObject({
      sent: true,
      status: "sent-unverified",
      postcondition: {
        classification: "production-state-changed-blocker-still-live",
        outcome: "still-blocked",
        confidence: "unverified",
        confirmed: false,
        noRepeatAfterUnverified: true,
        productionStateChanged: true,
        blockerStillLive: true,
      },
      nextSteps: [{
        kind: "do-not-repeat",
        source: "city.production.choice.request",
      }],
    });
  });

  test("projects validator-blocked production choices as not-sent", async () => {
    const fake = fakeContext(productionChoiceResult("not-sent", {
      beforeValid: false,
      afterValid: false,
      sent: false,
      verified: false,
    }));

    const result = await call(
      Civ7ControlOrpcRouter.city.production.choice.request,
      { cityId, args },
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
        noRepeatAfterUnverified: true,
      },
      nextSteps: [{
        kind: "inspect-production",
        source: "city.production.choice.request",
      }],
    });
  });

  test("keeps approval, endpoint, session, state, and raw command fields out of procedure input", async () => {
    const invalidInputs = [
      { cityId, args, approvalReason: "test approved production choice" },
      { cityId, args, disposableSession: true },
      { cityId, args, host: "127.0.0.1" },
      { cityId, args, port: 4318 },
      { cityId, args, state: { role: "app-ui" } },
      { cityId, args, session: { state: "App UI" } },
      { cityId, args, command: "Game.CityOperations.sendRequest(...)" },
      { cityId, args, rawCommand: "Game.CityOperations.sendRequest(...)" },
      { cityId, args: { UnitType: 102, ConstructibleType: 713_967_338 } },
    ];

    for (const input of invalidInputs) {
      const fake = fakeContext(productionChoiceResult("production-choice-cleared"));

      await expect(
        call(Civ7ControlOrpcRouter.city.production.choice.request, input as never, {
          context: fake.context,
        }),
      ).rejects.toMatchObject({ code: "BAD_REQUEST" });
      expect(fake.calls).toEqual([]);
    }
  });

  test("maps production choice facade failures to a tagged error without raw details", async () => {
    const fake = fakeContext(new Error(
      "Timed out waiting for Civ7 tuner response to CMD:65535:Game.CityOperations.sendRequest(...)",
    ));

    await expect(
      call(Civ7ControlOrpcRouter.city.production.choice.request, {
        cityId,
        args,
      }, { context: fake.context }),
    ).rejects.toMatchObject({
      code: "PRODUCTION_CHOICE_UNAVAILABLE",
      status: 503,
      data: {
        procedureKey: "city.production.choice.request",
        source: "direct-control-facade",
      },
    });

    try {
      await call(Civ7ControlOrpcRouter.city.production.choice.request, {
        cityId,
        args,
      }, { context: fake.context });
    } catch (err) {
      const serialized = JSON.stringify(err);
      expect(serialized).not.toContain("CMD");
      expect(serialized).not.toContain("Game.CityOperations");
      expect(serialized).not.toContain("rawCommand");
      expect(serialized).not.toContain("command-failed");
    }
  });

  test("publishes a contract-first city.production.choice.request leaf", () => {
    expect(
      Civ7ControlOrpcContract.city.production.choice.request["~orpc"],
    ).toMatchObject({
      meta: {
        family: "city",
        procedureKey: "city.production.choice.request",
        proofBoundary: "local-package-test",
        risk: "mutation",
      },
    });
    expect(
      Civ7ControlOrpcContract.city.production.choice.request["~orpc"].errorMap,
    ).toHaveProperty("MUTATION_APPROVAL_REQUIRED");
    expect(
      Civ7ControlOrpcContract.city.production.choice.request["~orpc"].errorMap,
    ).toHaveProperty("PRODUCTION_CHOICE_UNAVAILABLE");
    expect(Civ7MutationApprovalRequiredError.code).toBe(
      "MUTATION_APPROVAL_REQUIRED",
    );
    expect(Civ7ProductionChoiceUnavailableError.code).toBe(
      "PRODUCTION_CHOICE_UNAVAILABLE",
    );
  });
});

function fakeContext(
  resultOrError: Civ7ControlOrpcProductionChoiceResult | Error,
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
            reason: "test approved production choice",
            disposableSession: true,
          }
        : options.approval,
      directControl: {
        requestCiv7ProductionChoice: async (input, endpointDefaults, approval) => {
          calls.push({ input, options: endpointDefaults, approval });
          if (resultOrError instanceof Error) throw resultOrError;
          return resultOrError;
        },
      } as Civ7ControlOrpcContext["directControl"],
    },
    calls,
  };
}

function productionChoiceResult(
  classification: NonNullable<
    Civ7ControlOrpcProductionChoiceResult["productionPostcondition"]
  >["classification"],
  options: {
    beforeValid?: boolean;
    afterValid?: boolean;
    sent?: boolean;
    verified?: boolean;
  } = {},
): Civ7ControlOrpcProductionChoiceResult {
  const sent = options.sent ?? classification !== "not-sent";
  const productionStateChanged =
    classification === "production-state-changed"
    || classification === "production-state-changed-blocker-still-live";
  const blockerStillLive =
    classification === "production-state-changed-blocker-still-live"
    || classification === "validation-changed"
    || classification === "no-state-change";

  return {
    before: validationResult(options.beforeValid ?? true),
    after: validationResult(options.afterValid ?? true),
    sent,
    verified: options.verified ?? (
      classification === "production-choice-cleared"
      || classification === "production-state-changed"
    ),
    productionPostcondition: {
      family: "city-operation",
      operationType: "BUILD",
      classification,
      before: productionSnapshot("before"),
      after: productionSnapshot("after"),
      productionStateChanged,
      blockerStillLive,
      reason: `test ${classification}`,
    },
    payload: {
      cityId,
      args,
      beforeValidation: { raw: "before-validation" },
      afterValidation: { raw: "after-validation" },
      sent,
      sendResult: {
        ok: true,
        value: {
          rawCommand: "Game.CityOperations.sendRequest(...)",
        },
      },
      beforeProductionPostcondition: productionSnapshot("before"),
      afterProductionPostcondition: productionSnapshot("after"),
      notes: ["fixture"],
    },
    command: {
      host: "127.0.0.1",
      port: 4318,
      state: { id: "65535", name: "App UI" },
      output: ["{}"],
    },
  } as Civ7ControlOrpcProductionChoiceResult;
}

function validationResult(valid: boolean) {
  return {
    host: "127.0.0.1",
    port: 4318,
    state: { id: "65535", name: "App UI" },
    family: "city-operation" as const,
    operationType: "BUILD" as const,
    enumValue: 713_967_338,
    target: { cityId },
    args,
    valid,
    result: {
      raw: "validation-result",
      command: "Game.CityOperations.canStart(...)",
    },
  };
}

function productionSnapshot(label: "before" | "after") {
  return {
    cityId,
    city: { ok: true, value: { label } },
    buildQueue: { ok: true, value: { label } },
    selectedCityId: { ok: true, value: cityId },
    blocker: { ok: true, value: -2_026_570_723 },
    canEndTurn: { ok: true, value: false },
    blockingProductionNotification: {
      ok: true,
      value: {
        matchesCity: label === "before",
      },
    },
  };
}

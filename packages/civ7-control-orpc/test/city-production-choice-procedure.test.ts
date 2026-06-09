import { call } from "@orpc/server";
import { Value } from "typebox/value";
import { describe, expect, test } from "vitest";

import {
  Civ7ControlOrpcContract,
  Civ7ControlOrpcRouter,
  Civ7CorrelationIdInvalidError,
  Civ7MutationReadinessRequiredError,
  Civ7MutationReadinessUnavailableError,
  Civ7ProductionChoiceUnavailableError,
  createCiv7ControlOrpcServerClient,
  type Civ7ControlOrpcContext,
  type Civ7ControlOrpcProductionChoiceResult,
} from "../src/index";
import { typeboxInputSchemaFromContractProcedure } from "../src/typebox-standard-schema";

const cityId = { owner: 0, id: 65_536, type: 1 };
const args = { ConstructibleType: 713_967_338, X: 22, Y: 31 };
const Civ7CityProductionChoiceInputSchema =
  typeboxInputSchemaFromContractProcedure(
    Civ7ControlOrpcContract.city.production.choice.request,
  );

describe("city.production.choice.request control-oRPC procedure", () => {
  test("owns the caller-facing production choice contract without raw fields", () => {
    expect(Value.Check(Civ7CityProductionChoiceInputSchema, {
      cityId,
      args,
    })).toBe(true);
    expect(Value.Check(Civ7CityProductionChoiceInputSchema, {
      cityId,
      args,
      rawCommand: "Game.CityOperations.sendRequest(...)",
    })).toBe(false);
    expect(Value.Check(Civ7CityProductionChoiceInputSchema, {
      cityId,
      args,
      session: { state: "App UI" },
    })).toBe(false);
    expect(Value.Check(Civ7CityProductionChoiceInputSchema, {
      cityId,
      args: { UnitType: 102, ConstructibleType: 713_967_338 },
    })).toBe(false);
  });

  test("calls the production choice mutation through native Effect/oRPC ", async () => {
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

  test("requires playable readiness before the direct-control mutation port runs", async () => {
    const fake = fakeContext(productionChoiceResult("production-choice-cleared"), {
      playableStatus: {
        playable: false,
        readiness: "shell",
      },
    });

    await expect(
      call(Civ7ControlOrpcRouter.city.production.choice.request, {
        cityId,
        args,
      }, { context: fake.context }),
    ).rejects.toMatchObject({
      code: "MUTATION_READINESS_REQUIRED",
      status: 409,
      data: {
        procedureKey: "city.production.choice.request",
        source: "readiness.current",
        risk: "mutation",
        playable: false,
        readiness: "shell",
      },
    });
    expect(fake.calls).toEqual([]);
  });

  test("maps readiness read failures before mutation without raw details", async () => {
    const fake = fakeContext(productionChoiceResult("production-choice-cleared"), {
      playableStatusError: new Error(
        "Timed out waiting for Civ7 tuner response to CMD:1:Game.turn",
      ),
    });

    await expect(
      call(Civ7ControlOrpcRouter.city.production.choice.request, {
        cityId,
        args,
      }, { context: fake.context }),
    ).rejects.toMatchObject({
      code: "MUTATION_READINESS_UNAVAILABLE",
      status: 503,
      data: {
        procedureKey: "city.production.choice.request",
        source: "direct-control-facade",
        risk: "mutation",
      },
    });
    expect(fake.calls).toEqual([]);

    try {
      await call(Civ7ControlOrpcRouter.city.production.choice.request, {
        cityId,
        args,
      }, { context: fake.context });
    } catch (err) {
      const serialized = JSON.stringify(err);
      expect(serialized).not.toContain("CMD");
      expect(serialized).not.toContain("Game.turn");
      expect(serialized).not.toContain("rawCommand");
    }
  });

  test("rejects invalid context correlation before the direct-control mutation port runs", async () => {
    const fake = fakeContext(productionChoiceResult("production-choice-cleared"), {
      correlationId: "CMD:Game.CityOperations sendRequest",
    });

    await expect(
      call(Civ7ControlOrpcRouter.city.production.choice.request, {
        cityId,
        args,
      }, { context: fake.context }),
    ).rejects.toMatchObject({
      code: "CORRELATION_ID_INVALID",
      status: 400,
      data: {
        source: "context.correlation",
        reason: "correlation-id-invalid",
      },
    });
    expect(fake.calls).toEqual([]);

    try {
      await call(Civ7ControlOrpcRouter.city.production.choice.request, {
        cityId,
        args,
      }, { context: fake.context });
    } catch (err) {
      const serialized = JSON.stringify(err);
      expect(serialized).not.toContain("Game.CityOperations");
      expect(serialized).not.toContain("CMD");
      expect(serialized).not.toContain("sendRequest");
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

  test("keeps endpoint, session, state, and raw command fields out of procedure input", async () => {
    const invalidInputs = [
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
    const fake = fakeContext(
      new Error(
        "Timed out waiting for Civ7 tuner response to CMD:65535:Game.CityOperations.sendRequest(...)",
      ),
      { correlationId: "support-turn-42" },
    );

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
        correlationId: "support-turn-42",
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
    });    expect(
      Civ7ControlOrpcContract.city.production.choice.request["~orpc"].errorMap,
    ).toHaveProperty("CORRELATION_ID_INVALID");
    expect(
      Civ7ControlOrpcContract.city.production.choice.request["~orpc"].errorMap,
    ).toHaveProperty("MUTATION_READINESS_REQUIRED");
    expect(
      Civ7ControlOrpcContract.city.production.choice.request["~orpc"].errorMap,
    ).toHaveProperty("MUTATION_READINESS_UNAVAILABLE");
    expect(
      Civ7ControlOrpcContract.city.production.choice.request["~orpc"].errorMap,
    ).toHaveProperty("PRODUCTION_CHOICE_UNAVAILABLE");
    expect(Civ7CorrelationIdInvalidError.code).toBe("CORRELATION_ID_INVALID");
    expect(Civ7MutationReadinessRequiredError.code).toBe(
      "MUTATION_READINESS_REQUIRED",
    );
    expect(Civ7MutationReadinessUnavailableError.code).toBe(
      "MUTATION_READINESS_UNAVAILABLE",
    );
    expect(Civ7ProductionChoiceUnavailableError.code).toBe(
      "PRODUCTION_CHOICE_UNAVAILABLE",
    );
  });
});

function fakeContext(
  resultOrError: Civ7ControlOrpcProductionChoiceResult | Error,
  options: {
    correlationId?: string;
    playableStatus?: Readonly<{
      playable: boolean;
      readiness: string;
    }>;
    playableStatusError?: Error;
  } = {},
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
        getCiv7PlayableStatus: async () => {
          if (options.playableStatusError != null) {
            throw options.playableStatusError;
          }
          return options.playableStatus ?? {
            playable: true,
            readiness: "tuner-ready",
          };
        },
        requestCiv7ProductionChoice: async (input, endpointDefaults) => {
          calls.push({ input, options: endpointDefaults });
          if (resultOrError instanceof Error) throw resultOrError;
          return resultOrError;
        },
      } as Civ7ControlOrpcContext["directControl"],
      correlation: options.correlationId == null
        ? undefined
        : { correlationId: options.correlationId },
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

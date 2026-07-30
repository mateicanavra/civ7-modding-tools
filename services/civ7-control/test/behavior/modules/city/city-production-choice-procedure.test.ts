import { call } from "@orpc/server";
import { Effect, Fiber, TestClock, TestContext } from "effect";
import { describe, expect, test } from "vitest";

import {
  type Civ7ControlOrpcContext,
  Civ7ControlOrpcContract,
  Civ7ControlOrpcRouter,
  createCiv7ControlOrpcServerClient,
} from "../../../../src/index";
import type {
  Civ7ControlOrpcCommandDispatchStatus,
  Civ7ControlOrpcProductionChoiceCheckResult,
  Civ7ControlOrpcProductionChoiceSendResult,
  Civ7ControlOrpcProductionChoiceSnapshot,
  Civ7ControlOrpcProductionChoiceValidationResult,
  Civ7ControlOrpcRuntimeProbe,
} from "../../../../src/service/model/ports/direct-control";
import { pollProductionChoicePostcondition } from "../../../../src/service/modules/city/model/policy/production-choice-polling";
import { civ7ProductionChoicePostcondition } from "../../../../src/service/modules/city/model/policy/production-choice-postcondition";
import { directControlFacadeFixture } from "../../../support/direct-control-facade";
import { playableStatusResult } from "../../../support/playable-status";
import { standardSchemaAccepts } from "../../../support/standard-schema";

const cityId = { owner: 0, id: 65_536, type: 1 };
const unitArgs = { UnitType: 1_769_488 };
const placementArgs = { ConstructibleType: 713_967_338, X: 22, Y: 31 };
const endpointDefaults = {
  host: "127.0.0.1",
  port: 4318,
  timeoutMs: 1_000,
};

describe("city production choice control-oRPC procedures", () => {
  test("publishes exact check and request contracts", () => {
    const check = Civ7ControlOrpcContract.city.production.choice.check["~orpc"];
    const request = Civ7ControlOrpcContract.city.production.choice.request["~orpc"];

    expect(check.meta).toMatchObject({
      procedureKey: "city.production.choice.check",
      risk: "read-only",
    });
    expect(request.meta).toMatchObject({
      procedureKey: "city.production.choice.request",
      risk: "mutation",
    });

    for (const args of [
      unitArgs,
      { ProjectType: 901 },
      { ConstructibleType: 902 },
      placementArgs,
    ]) {
      expect(standardSchemaAccepts(check.inputSchema, { cityId, args })).toBe(true);
      expect(standardSchemaAccepts(request.inputSchema, { cityId, args })).toBe(true);
    }
    expect(
      standardSchemaAccepts(check.inputSchema, {
        cityId,
        operationType: "BUILD",
        args: unitArgs,
      })
    ).toBe(false);
    expect(
      standardSchemaAccepts(request.inputSchema, {
        cityId,
        args: { ConstructibleType: 902, X: 22 },
      })
    ).toBe(false);
    expect(
      standardSchemaAccepts(request.inputSchema, {
        cityId,
        args: { UnitType: 1, ProjectType: 2 },
      })
    ).toBe(false);

    const confirmed = {
      cityId,
      args: unitArgs,
      status: "sent-confirmed",
      postcondition: {
        classification: "production-choice-cleared",
        reason: "The matching production blocker cleared.",
        outcome: "cleared",
        confidence: "confirmed",
        confirmed: true,
        noRepeatAfterUnverified: false,
      },
      nextSteps: [
        {
          kind: "refresh-attention",
          source: "city.production.choice.request",
          label: "Refresh current attention.",
        },
      ],
    };
    expect(standardSchemaAccepts(request.outputSchema, confirmed)).toBe(true);
    expect(
      standardSchemaAccepts(request.outputSchema, {
        ...confirmed,
        postcondition: {
          ...confirmed.postcondition,
          confidence: "unverified",
          confirmed: false,
          noRepeatAfterUnverified: true,
        },
      })
    ).toBe(false);
    expect(
      standardSchemaAccepts(request.outputSchema, {
        ...confirmed,
        status: "dispatch-unknown",
      })
    ).toBe(false);
    expect(
      standardSchemaAccepts(request.outputSchema, {
        ...confirmed,
        postcondition: {
          ...confirmed.postcondition,
          confirmed: false,
        },
      })
    ).toBe(false);
    expect(
      standardSchemaAccepts(request.outputSchema, {
        ...confirmed,
        postcondition: {
          ...confirmed.postcondition,
          noRepeatAfterUnverified: true,
        },
      })
    ).toBe(false);
    expect(
      standardSchemaAccepts(request.outputSchema, {
        ...confirmed,
        nextSteps: [
          {
            kind: "do-not-repeat",
            source: "city.production.choice.request",
            label: "Do not repeat.",
          },
        ],
      })
    ).toBe(false);
    expect(
      standardSchemaAccepts(request.outputSchema, {
        ...confirmed,
        nextSteps: [...confirmed.nextSteps, ...confirmed.nextSteps],
      })
    ).toBe(false);

    const validationChanged = {
      ...confirmed,
      status: "sent-unverified",
      postcondition: {
        classification: "validation-changed",
        reason: "The runtime validator changed.",
        outcome: "validation-changed",
        confidence: "unverified",
        confirmed: false,
        noRepeatAfterUnverified: true,
      },
      nextSteps: [
        {
          kind: "do-not-repeat",
          source: "city.production.choice.request",
          label: "Do not repeat.",
        },
      ],
    };
    expect(standardSchemaAccepts(request.outputSchema, validationChanged)).toBe(true);
    expect(
      standardSchemaAccepts(request.outputSchema, {
        ...validationChanged,
        postcondition: {
          ...validationChanged.postcondition,
          outcome: "still-blocked",
        },
      })
    ).toBe(false);
  });

  test("checks semantic availability without mutation admission or raw validator output", async () => {
    const fake = fakeContext({
      checks: [
        checkResult({
          result: {
            Success: true,
            rawCommand: "Game.CityOperations.canStart(...)",
          },
        }),
      ],
    });

    const result = await call(
      Civ7ControlOrpcRouter.city.production.choice.check,
      { cityId, args: unitArgs },
      { context: fake.context }
    );

    expect(result).toEqual({
      cityId,
      args: unitArgs,
      available: true,
    });
    expect(fake.events).toEqual([
      {
        kind: "check",
        input: { cityId, args: unitArgs },
        options: endpointDefaults,
      },
    ]);
    expectSemanticProductionResultOmitsRuntimeOperands(result);
  });

  test("supports the in-process client for exact resolved placement checks", async () => {
    const fake = fakeContext({
      checks: [checkResult({ valid: false, result: { Success: false } })],
    });
    const client = createCiv7ControlOrpcServerClient(fake.context);

    const result = await client.city.production.choice.check({
      cityId,
      args: placementArgs,
    });

    expect(result).toEqual({
      cityId,
      args: placementArgs,
      available: false,
    });
    expect(fake.events[0]).toEqual({
      kind: "check",
      input: { cityId, args: placementArgs },
      options: endpointDefaults,
    });
  });

  test("maps check and request precheck exceptions to their exact tagged procedure errors", async () => {
    const checkFailure = fakeContext({
      checks: [new Error("CMD:1:Game.CityOperations.canStart(...) check internals")],
    });
    const requestFailure = fakeContext({
      checks: [new Error("CMD:2:Game.CityOperations.canStart(...) precheck internals")],
    });

    const caughtCheck = await captureFailure(() =>
      call(
        Civ7ControlOrpcRouter.city.production.choice.check,
        { cityId, args: unitArgs },
        { context: checkFailure.context }
      )
    );
    const caughtRequest = await captureFailure(() =>
      call(
        Civ7ControlOrpcRouter.city.production.choice.request,
        { cityId, args: unitArgs },
        { context: requestFailure.context }
      )
    );

    expect(caughtCheck).toMatchObject({
      code: "PRODUCTION_CHOICE_UNAVAILABLE",
      status: 503,
      data: {
        procedureKey: "city.production.choice.check",
        source: "direct-control-facade",
      },
    });
    expect(caughtRequest).toMatchObject({
      code: "PRODUCTION_CHOICE_UNAVAILABLE",
      status: 503,
      data: {
        procedureKey: "city.production.choice.request",
        source: "direct-control-facade",
      },
    });
    expect(JSON.stringify(caughtCheck)).not.toContain("CMD");
    expect(JSON.stringify(caughtCheck)).not.toContain("Game.CityOperations");
    expect(JSON.stringify(caughtRequest)).not.toContain("CMD");
    expect(JSON.stringify(caughtRequest)).not.toContain("Game.CityOperations");
    expect(requestFailure.events.map((event) => event.kind)).toEqual(["readiness", "check"]);
  });

  test("does not send when the explicit precheck rejects the production choice", async () => {
    const fake = fakeContext({
      checks: [checkResult({ valid: false, result: { Success: false } })],
    });

    const result = await call(
      Civ7ControlOrpcRouter.city.production.choice.request,
      { cityId, args: unitArgs },
      { context: fake.context }
    );

    expect(result).toMatchObject({
      cityId,
      args: unitArgs,
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
          kind: "inspect-production",
          source: "city.production.choice.request",
        },
      ],
    });
    expect(fake.events.map((event) => event.kind)).toEqual(["readiness", "check"]);
    expect(Object.keys(result).sort()).toEqual([
      "args",
      "cityId",
      "nextSteps",
      "postcondition",
      "status",
    ]);
  });

  test("sends one exact resolved placement and confirms matching blocker clearance", async () => {
    const before = snapshot({
      blockingProductionNotification: probe(matchingProductionBlocker()),
    });
    const after = snapshot({
      blocker: probe(0),
      blockingProductionNotification: probe(null),
    });
    const fake = fakeContext({
      checks: [checkResult({ snapshot: before })],
      sends: [sendResult({ before, after })],
    });

    const result = await call(
      Civ7ControlOrpcRouter.city.production.choice.request,
      { cityId, args: placementArgs },
      { context: fake.context }
    );

    expect(result).toMatchObject({
      cityId,
      args: placementArgs,
      status: "sent-confirmed",
      postcondition: {
        classification: "production-choice-cleared",
        outcome: "cleared",
        confidence: "confirmed",
        confirmed: true,
        noRepeatAfterUnverified: false,
      },
      nextSteps: [
        {
          kind: "refresh-attention",
          source: "city.production.choice.request",
        },
      ],
    });
    expect(fake.events).toEqual([
      { kind: "readiness", options: endpointDefaults },
      {
        kind: "check",
        input: { cityId, args: placementArgs },
        options: endpointDefaults,
      },
      {
        kind: "send",
        input: { cityId, args: placementArgs },
        options: endpointDefaults,
      },
    ]);
    expect(Object.keys(result).sort()).toEqual([
      "args",
      "cityId",
      "nextSteps",
      "postcondition",
      "status",
    ]);
    expectSemanticProductionResultOmitsRuntimeOperands(result);
  });

  test("polls past transient unverified evidence until production is confirmed", async () => {
    const before = snapshot();
    const transient = snapshot({
      buildQueue: probe(buildQueueSummary({ currentProductionTypeHash: 99 })),
    });
    const confirmed = snapshot({
      buildQueue: probe(buildQueueSummary({ currentProductionTypeHash: 99 })),
      blocker: probe(0),
      blockingProductionNotification: probe(null),
    });
    const fake = fakeContext({
      checks: [
        checkResult({ snapshot: before }),
        checkResult({ snapshot: transient }),
        checkResult({ snapshot: confirmed }),
      ],
      sends: [sendResult({ before, after: before })],
    });
    const startedAt = Date.now();

    const result = await call(
      Civ7ControlOrpcRouter.city.production.choice.request,
      { cityId, args: unitArgs },
      { context: fake.context }
    );

    expect(result).toMatchObject({
      status: "sent-confirmed",
      postcondition: {
        classification: "production-choice-cleared",
        outcome: "cleared",
        confidence: "confirmed",
        noRepeatAfterUnverified: false,
      },
      nextSteps: [
        {
          kind: "refresh-attention",
          source: "city.production.choice.request",
        },
      ],
    });
    expect(Date.now() - startedAt).toBeGreaterThanOrEqual(200);
    expect(fake.events.map((event) => event.kind)).toEqual([
      "readiness",
      "check",
      "send",
      "check",
      "check",
    ]);
  });

  test("classifies definitive pre-dispatch failure as not sent", async () => {
    const fake = fakeContext({
      checks: [checkResult()],
      sends: [
        dispatchError(
          "not-dispatched",
          "Civ7 tuner state selection failed before command dispatch"
        ),
      ],
    });

    const result = await call(
      Civ7ControlOrpcRouter.city.production.choice.request,
      { cityId, args: unitArgs },
      { context: fake.context }
    );

    expect(result).toMatchObject({
      status: "not-sent",
      postcondition: {
        classification: "not-sent",
        outcome: "not-sent",
      },
      nextSteps: [{ kind: "inspect-production" }],
    });
    expect(fake.events.map((event) => event.kind)).toEqual(["readiness", "check", "send"]);
  });

  for (const dispatchStatus of ["dispatched", "indeterminate"] as const) {
    test(`keeps a ${dispatchStatus} send exception explicitly dispatch-unknown`, async () => {
      const fake = fakeContext({
        checks: [checkResult()],
        sends: [
          dispatchError(
            dispatchStatus,
            "Timed out after Game.CityOperations.sendRequest(...) may have run"
          ),
        ],
      });

      const result = await call(
        Civ7ControlOrpcRouter.city.production.choice.request,
        { cityId, args: unitArgs },
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
            source: "city.production.choice.request",
          },
        ],
      });
      expect(result.postcondition.reason).toContain("must not be repeated");
      expect(fake.events.map((event) => event.kind)).toEqual(["readiness", "check", "send"]);
      expectSemanticProductionResultOmitsRuntimeOperands(result);
    });
  }

  test("treats an unclassified send exception as dispatch-unknown", async () => {
    const fake = fakeContext({
      checks: [checkResult()],
      sends: [new Error("transport response was lost")],
    });

    const result = await call(
      Civ7ControlOrpcRouter.city.production.choice.request,
      { cityId, args: unitArgs },
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
      },
      nextSteps: [{ kind: "do-not-repeat" }],
    });
    expect(fake.events.map((event) => event.kind)).toEqual(["readiness", "check", "send"]);
  });

  test("does not trust dispatchStatus on a foreign thrown object", async () => {
    const fake = fakeContext({
      checks: [checkResult()],
      sends: [Object.assign(new Error("foreign failure"), { dispatchStatus: "not-dispatched" })],
    });

    const result = await call(
      Civ7ControlOrpcRouter.city.production.choice.request,
      { cityId, args: unitArgs },
      { context: fake.context }
    );

    expect(result).toMatchObject({
      status: "dispatch-unknown",
      postcondition: { classification: "missing-postcondition" },
      nextSteps: [{ kind: "do-not-repeat" }],
    });
  });

  test("keeps a sent production choice unverified when its required postcheck is unavailable", async () => {
    const stable = snapshot();
    const fake = fakeContext({
      checks: [
        checkResult({ snapshot: stable }),
        new Error("postcheck failed after Game.CityOperations.sendRequest(...)"),
      ],
      sends: [sendResult({ before: stable, after: stable })],
    });

    const result = await call(
      Civ7ControlOrpcRouter.city.production.choice.request,
      { cityId, args: unitArgs },
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
        reason: expect.stringContaining("required post-send production read failed"),
      },
      nextSteps: [{ kind: "do-not-repeat" }],
    });
    expect(fake.events.slice(0, 3).map((event) => event.kind)).toEqual([
      "readiness",
      "check",
      "send",
    ]);
    expect(fake.events.filter((event) => event.kind === "check").length).toBeGreaterThan(1);
  });

  test("treats null city and build-queue evidence as missing postcondition proof", () => {
    const nullCity = civ7ProductionChoicePostcondition({
      kind: "observed",
      cityId,
      beforeValidation: validation(),
      afterValidation: validation(),
      before: snapshot({ city: probe(null) }),
      after: snapshot(),
    });
    const nullQueue = civ7ProductionChoicePostcondition({
      kind: "observed",
      cityId,
      beforeValidation: validation(),
      afterValidation: validation(),
      before: snapshot(),
      after: snapshot({ buildQueue: probe(null) }),
    });

    expect(nullCity.classification).toBe("missing-postcondition");
    expect(nullQueue.classification).toBe("missing-postcondition");
  });

  test("requires the observed city identity to match the requested city", () => {
    const result = civ7ProductionChoicePostcondition({
      kind: "observed",
      cityId,
      beforeValidation: validation(),
      afterValidation: validation(),
      before: snapshot({
        city: probe({ id: cityId, observedCityId: otherCityId }),
      }),
      after: snapshot(),
    });

    expect(result.classification).toBe("missing-postcondition");
  });

  test("requires a matching blocker before readable absence can prove clearance", () => {
    const noBlocker = snapshot({
      blocker: probe(0),
      blockingProductionNotification: probe(null),
    });
    const nonmatching = snapshot({
      blockingProductionNotification: probe(matchingProductionBlocker(otherCityId)),
    });

    const absentResult = civ7ProductionChoicePostcondition({
      kind: "observed",
      cityId,
      beforeValidation: validation(),
      afterValidation: validation(),
      before: noBlocker,
      after: noBlocker,
    });
    const nonmatchingResult = civ7ProductionChoicePostcondition({
      kind: "observed",
      cityId,
      beforeValidation: validation(),
      afterValidation: validation(),
      before: noBlocker,
      after: nonmatching,
    });

    expect(absentResult.classification).toBe("no-state-change");
    expect(nonmatchingResult.classification).toBe("no-state-change");
  });

  test("qualifies unrelated blockers as clear and confirms a matching blocker was replaced", () => {
    const before = snapshot();
    const after = snapshot({
      blocker: probe("NOTIFICATION_COMMAND_UNITS"),
      blockingProductionNotification: probe({
        id: { owner: 0, id: 7, type: 20 },
        type: 42,
        typeName: "NOTIFICATION_COMMAND_UNITS",
        target: null,
      }),
    });

    const result = civ7ProductionChoicePostcondition({
      kind: "observed",
      cityId,
      beforeValidation: validation(),
      afterValidation: validation(),
      before,
      after,
    });

    expect(result.classification).toBe("production-choice-cleared");
    expect(result.confidence).toBe("confirmed");
  });

  test("keeps unreadable blocker type and production target evidence unknown", () => {
    const unreadableType = civ7ProductionChoicePostcondition({
      kind: "observed",
      cityId,
      beforeValidation: validation(),
      afterValidation: validation(),
      before: snapshot({
        blockingProductionNotification: probe({
          ...matchingProductionBlocker(),
          type: 1_090_224_621,
          typeName: null,
        }),
      }),
      after: snapshot({
        blockingProductionNotification: probe({
          ...matchingProductionBlocker(),
          type: 1_090_224_621,
          typeName: null,
        }),
      }),
    });
    const unreadableTarget = civ7ProductionChoicePostcondition({
      kind: "observed",
      cityId,
      beforeValidation: validation(),
      afterValidation: validation(),
      before: snapshot({
        blockingProductionNotification: probe({
          ...matchingProductionBlocker(),
          target: null,
        }),
      }),
      after: snapshot({
        blockingProductionNotification: probe({
          ...matchingProductionBlocker(),
          target: null,
        }),
      }),
    });

    expect(unreadableType.classification).toBe("missing-postcondition");
    expect(unreadableTarget.classification).toBe("missing-postcondition");
  });

  test.each([
    ["null", probe(null)],
    ["unrecognized", probe("")],
    ["failed", failedProbe("top-level blocker read failed")],
  ] as const)("keeps matching-before then null-notification/%s-top-level-blocker evidence unknown", (_label, blocker) => {
    const result = civ7ProductionChoicePostcondition({
      kind: "observed",
      cityId,
      beforeValidation: validation(),
      afterValidation: validation(),
      before: snapshot(),
      after: snapshot({
        blocker,
        blockingProductionNotification: probe(null),
      }),
    });

    expect(result).toMatchObject({
      classification: "missing-postcondition",
      outcome: "unknown",
      confidence: "unverified",
      confirmed: false,
      noRepeatAfterUnverified: true,
    });
  });

  test.each([
    ["different owner", { owner: 1, id: cityId.id, type: cityId.type }, "cleared"],
    ["different id", { owner: cityId.owner, id: cityId.id + 1, type: cityId.type }, "cleared"],
    ["equal complete types", { ...cityId }, "no-state-change"],
    ["different complete types", { ...cityId, type: cityId.type + 1 }, "cleared"],
    ["target type missing", { owner: cityId.owner, id: cityId.id }, "unknown"],
  ] as const)("classifies a production target with %s using three-valued identity", (_label, target, expectedOutcome) => {
    const result = productionTargetPostcondition(cityId, target);

    expect(result.outcome).toBe(expectedOutcome);
  });

  test("keeps exactly one requested target type missing unknown", () => {
    const typeMissingCityId = { owner: cityId.owner, id: cityId.id };
    const result = productionTargetPostcondition(typeMissingCityId, cityId);

    expect(result).toMatchObject({
      classification: "missing-postcondition",
      outcome: "unknown",
      confidence: "unverified",
    });
  });

  test("matches production targets when both ComponentIDs omit type", () => {
    const typeMissingCityId = { owner: cityId.owner, id: cityId.id };
    const result = productionTargetPostcondition(typeMissingCityId, {
      ...typeMissingCityId,
    });

    expect(result).toMatchObject({
      classification: "no-state-change",
      outcome: "no-state-change",
      confidence: "unverified",
    });
  });

  test("owns production-state and validation-change classifications", () => {
    const noBlocker = snapshot({
      blocker: probe(0),
      blockingProductionNotification: probe(null),
    });
    const changedProduction = snapshot({
      buildQueue: probe(buildQueueSummary({ currentProductionTypeHash: 99 })),
      blocker: probe(0),
      blockingProductionNotification: probe(null),
    });

    const stateResult = civ7ProductionChoicePostcondition({
      kind: "observed",
      cityId,
      beforeValidation: validation(),
      afterValidation: validation(),
      before: noBlocker,
      after: changedProduction,
    });
    const validationResult = civ7ProductionChoicePostcondition({
      kind: "observed",
      cityId,
      beforeValidation: validation(),
      afterValidation: validation(false),
      before: snapshot(),
      after: snapshot(),
    });

    expect(stateResult).toMatchObject({
      classification: "production-state-changed",
      outcome: "state-changed",
      confidence: "confirmed",
      confirmed: true,
      noRepeatAfterUnverified: false,
    });
    expect(validationResult).toMatchObject({
      classification: "validation-changed",
      outcome: "validation-changed",
      confidence: "unverified",
      confirmed: false,
      noRepeatAfterUnverified: true,
    });
  });

  test("failed required blocker probes dominate apparent production changes", () => {
    const before = snapshot();
    const after = snapshot({
      buildQueue: probe(buildQueueSummary({ currentProductionTypeHash: 99 })),
      blockingProductionNotification: failedProbe("blocking notification read failed"),
    });

    const result = civ7ProductionChoicePostcondition({
      kind: "observed",
      cityId,
      beforeValidation: validation(),
      afterValidation: validation(false),
      before,
      after,
    });

    expect(result).toMatchObject({
      classification: "missing-postcondition",
      outcome: "unknown",
      confidence: "unverified",
      confirmed: false,
      noRepeatAfterUnverified: true,
      reason: expect.stringContaining("required production or blocker probes failed"),
    });
  });

  test("failed production queue probes remain unknown even when unrelated city evidence changes", () => {
    const result = civ7ProductionChoicePostcondition({
      kind: "observed",
      cityId,
      beforeValidation: validation(),
      afterValidation: validation(),
      before: snapshot({ buildQueue: failedProbe("queue unavailable"), city: probe(null) }),
      after: snapshot({
        buildQueue: failedProbe("queue unavailable"),
        city: probe({ id: cityId, observedCityId: cityId }),
      }),
    });

    expect(result.classification).toBe("missing-postcondition");
    expect(result.confidence).toBe("unverified");
  });

  test("bounds an unfinished postcheck by the remaining deadline and reports it unavailable", async () => {
    const timeoutMs: number[] = [];
    const never = new Promise<Civ7ControlOrpcProductionChoiceCheckResult>(() => undefined);
    const effect = pollProductionChoicePostcondition({
      input: { cityId, args: unitArgs },
      send: sendResult(),
      check: (remainingMs) => {
        timeoutMs.push(remainingMs);
        return never;
      },
      waitMs: 1_000,
    });
    const program = Effect.gen(function* () {
      const fiber = yield* Effect.fork(effect);
      yield* Effect.yieldNow();
      yield* TestClock.adjust(1_000);
      return yield* Fiber.join(fiber);
    }).pipe(Effect.provide(TestContext.TestContext));

    const evidence = await Effect.runPromise(program);

    expect(evidence).toEqual({ kind: "postcheck-unavailable" });
    expect(timeoutMs).toEqual([1_000]);
  });

  test("retains the latest completed evidence when a later postcheck never completes", async () => {
    const transient = snapshot({
      buildQueue: probe(buildQueueSummary({ currentProductionTypeHash: 99 })),
    });
    const never = new Promise<Civ7ControlOrpcProductionChoiceCheckResult>(() => undefined);
    let checks = 0;
    const effect = pollProductionChoicePostcondition({
      input: { cityId, args: unitArgs },
      send: sendResult(),
      check: () => {
        checks += 1;
        return checks === 1 ? Promise.resolve(checkResult({ snapshot: transient })) : never;
      },
      waitMs: 1_000,
    });
    const program = Effect.gen(function* () {
      const fiber = yield* Effect.fork(effect);
      yield* Effect.yieldNow();
      yield* TestClock.adjust(1_000);
      return yield* Fiber.join(fiber);
    }).pipe(Effect.provide(TestContext.TestContext));

    const evidence = await Effect.runPromise(program);

    expect(civ7ProductionChoicePostcondition(evidence).classification).toBe(
      "production-state-changed-blocker-still-live"
    );
    expect(checks).toBe(2);
  });

  test("continues polling after a quick postcheck error and accepts later confirmation", async () => {
    const confirmed = snapshot({
      blocker: probe(0),
      blockingProductionNotification: probe(null),
    });
    let checks = 0;
    const effect = pollProductionChoicePostcondition({
      input: { cityId, args: unitArgs },
      send: sendResult(),
      check: () => {
        checks += 1;
        return checks === 1
          ? Promise.reject(new Error("transient postcheck failure"))
          : Promise.resolve(checkResult({ snapshot: confirmed }));
      },
      waitMs: 1_000,
    });
    const program = Effect.gen(function* () {
      const fiber = yield* Effect.fork(effect);
      yield* Effect.yieldNow();
      yield* TestClock.adjust(250);
      return yield* Fiber.join(fiber);
    }).pipe(Effect.provide(TestContext.TestContext));

    const evidence = await Effect.runPromise(program);

    expect(civ7ProductionChoicePostcondition(evidence).classification).toBe(
      "production-choice-cleared"
    );
    expect(checks).toBe(2);
  });
});

type Scripted<T> = T | Error;

type FakeContextOptions = Readonly<{
  checks?: ReadonlyArray<Scripted<Civ7ControlOrpcProductionChoiceCheckResult>>;
  sends?: ReadonlyArray<Scripted<Civ7ControlOrpcProductionChoiceSendResult>>;
}>;

type FixtureEvent = Readonly<{
  kind: "readiness" | "check" | "send";
  input?: unknown;
  options: unknown;
}>;

function fakeContext(options: FakeContextOptions): {
  context: Civ7ControlOrpcContext;
  events: Array<FixtureEvent>;
} {
  const events: Array<FixtureEvent> = [];
  const checks = [...(options.checks ?? [])];
  const sends = [...(options.sends ?? [])];

  return {
    context: {
      endpointDefaults,
      directControl: directControlFacadeFixture({
        getCiv7PlayableStatus: async (callOptions) => {
          events.push({ kind: "readiness", options: callOptions });
          return playableStatusResult();
        },
        checkCiv7ProductionChoice: async (input, callOptions) => {
          events.push({ kind: "check", input, options: callOptions });
          return scriptedResult(checks, "production choice check");
        },
        sendCiv7ProductionChoice: async (input, callOptions) => {
          events.push({ kind: "send", input, options: callOptions });
          return scriptedResult(sends, "production choice send");
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
  valid = true,
  result: Civ7ControlOrpcProductionChoiceValidationResult["result"] = { Success: valid }
): Civ7ControlOrpcProductionChoiceValidationResult {
  return { valid, result };
}

function checkResult(
  overrides: Partial<Civ7ControlOrpcProductionChoiceCheckResult> = {}
): Civ7ControlOrpcProductionChoiceCheckResult {
  return {
    ...validation(),
    snapshot: snapshot(),
    ...overrides,
  };
}

function sendResult(
  overrides: Partial<
    Pick<Extract<Civ7ControlOrpcProductionChoiceSendResult, { sent: true }>, "before" | "after">
  > = {}
): Extract<Civ7ControlOrpcProductionChoiceSendResult, { sent: true }> {
  return {
    sent: true,
    validation: {
      valid: true,
      result: { Success: true },
    },
    before: snapshot(),
    after: snapshot(),
    ...overrides,
  };
}

function snapshot(
  overrides: Partial<Civ7ControlOrpcProductionChoiceSnapshot> = {}
): Civ7ControlOrpcProductionChoiceSnapshot {
  return {
    cityId,
    city: probe({
      id: cityId,
      observedCityId: cityId,
    }),
    buildQueue: probe(buildQueueSummary()),
    blocker: probe(1_090_224_621),
    blockingProductionNotification: probe(matchingProductionBlocker()),
    ...overrides,
  };
}

const otherCityId = { owner: 0, id: 65_537, type: 1 };

function matchingProductionBlocker(
  target: Civ7ControlOrpcProductionChoiceSnapshot["cityId"] = cityId
) {
  return {
    id: { owner: 0, id: 6, type: 20 },
    type: 1_090_224_621,
    typeName: "NOTIFICATION_CHOOSE_CITY_PRODUCTION",
    target,
  };
}

function productionTargetPostcondition(
  requestedCityId: Civ7ControlOrpcProductionChoiceSnapshot["cityId"],
  afterTarget: Civ7ControlOrpcProductionChoiceSnapshot["cityId"]
) {
  return civ7ProductionChoicePostcondition({
    kind: "observed",
    cityId: requestedCityId,
    beforeValidation: validation(),
    afterValidation: validation(),
    before: snapshotForCity(requestedCityId, {
      blockingProductionNotification: probe(matchingProductionBlocker(requestedCityId)),
    }),
    after: snapshotForCity(requestedCityId, {
      blockingProductionNotification: probe(matchingProductionBlocker(afterTarget)),
    }),
  });
}

function snapshotForCity(
  requestedCityId: Civ7ControlOrpcProductionChoiceSnapshot["cityId"],
  overrides: Partial<Civ7ControlOrpcProductionChoiceSnapshot> = {}
): Civ7ControlOrpcProductionChoiceSnapshot {
  return snapshot({
    cityId: requestedCityId,
    city: probe({
      id: requestedCityId,
      observedCityId: requestedCityId,
    }),
    ...overrides,
  });
}

function buildQueueSummary(
  overrides: Partial<
    Extract<Civ7ControlOrpcProductionChoiceSnapshot["buildQueue"], { ok: true }>["value"]
  > = {}
) {
  return {
    currentProductionTypeHash: 7,
    previousProductionTypeHash: null,
    productionProgress: 0,
    turnsLeftForRequestedItem: 3,
    queueLength: 1,
    ...overrides,
  };
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

async function captureFailure(run: () => Promise<unknown>): Promise<unknown> {
  try {
    await run();
  } catch (error) {
    return error;
  }
  throw new Error("Expected procedure call to fail");
}

function expectSemanticProductionResultOmitsRuntimeOperands(result: unknown) {
  const serialized = JSON.stringify(result);
  expect(serialized).not.toContain("CMD");
  expect(serialized).not.toContain("Game.CityOperations");
  expect(serialized).not.toContain('"host"');
  expect(serialized).not.toContain('"port"');
  expect(serialized).not.toContain('"rawCommand"');
  expect(serialized).not.toContain('"command"');
  expect(serialized).not.toContain('"operationType"');
  expect(serialized).not.toContain('"result"');
  expect(serialized).not.toContain('"before"');
  expect(serialized).not.toContain('"after"');
  expect(serialized).not.toContain('"sent"');
  expect(serialized).not.toContain('"validation"');
}

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
  Civ7ControlOrpcTownFocusChangeCheckResult,
  Civ7ControlOrpcTownFocusChangeSendResult,
  Civ7ControlOrpcTownFocusReviewCheckResult,
  Civ7ControlOrpcTownFocusReviewSendResult,
  Civ7ControlOrpcTownFocusSnapshot,
} from "../../../../src/service/model/ports/direct-control";
import { directControlFacadeFixture } from "../../../support/direct-control-facade";
import { playableStatusResult } from "../../../support/playable-status";
import { standardSchemaAccepts } from "../../../support/standard-schema";

const cityId = { owner: 0, id: 131_073, type: 1 };
const growthType = -284_569_333;
const projectType = -548_685_232;
const endpointDefaults = {
  host: "127.0.0.1",
  port: 4318,
  timeoutMs: 1_000,
};

describe("city town-focus control-oRPC procedures", () => {
  test("publishes exact read and mutation contracts", () => {
    const changeCheck = Civ7ControlOrpcContract.city.townFocus.change.check["~orpc"];
    const changeRequest = Civ7ControlOrpcContract.city.townFocus.change.request["~orpc"];
    const reviewCheck = Civ7ControlOrpcContract.city.townFocus.review.check["~orpc"];
    const reviewRequest = Civ7ControlOrpcContract.city.townFocus.review.request["~orpc"];

    expect(changeCheck.meta).toMatchObject({
      procedureKey: "city.townFocus.change.check",
      risk: "read-only",
    });
    expect(changeRequest.meta).toMatchObject({
      procedureKey: "city.townFocus.change.request",
      risk: "mutation",
    });
    expect(reviewCheck.meta).toMatchObject({
      procedureKey: "city.townFocus.review.check",
      risk: "read-only",
    });
    expect(reviewRequest.meta).toMatchObject({
      procedureKey: "city.townFocus.review.request",
      risk: "mutation",
    });

    const changeInput = { cityId, growthType, projectType };
    expect(standardSchemaAccepts(changeCheck.inputSchema, changeInput)).toBe(true);
    expect(standardSchemaAccepts(changeRequest.inputSchema, changeInput)).toBe(true);
    expect(standardSchemaAccepts(changeRequest.inputSchema, { ...changeInput, city: 99 })).toBe(
      false
    );
    expect(
      standardSchemaAccepts(changeRequest.inputSchema, {
        ...changeInput,
        operationType: "CHANGE_GROWTH_MODE",
      })
    ).toBe(false);
    expect(standardSchemaAccepts(reviewCheck.inputSchema, { cityId })).toBe(true);
    expect(standardSchemaAccepts(reviewRequest.inputSchema, { cityId })).toBe(true);
    expect(
      standardSchemaAccepts(reviewRequest.inputSchema, {
        cityId,
        operationType: "CONSIDER_TOWN_PROJECT",
      })
    ).toBe(false);
  });

  test("projects semantic checks without raw runtime evidence", async () => {
    const fake = fakeContext({
      changeChecks: [changeCheckResult()],
      reviewChecks: [reviewCheckResult()],
    });
    const client = createCiv7ControlOrpcServerClient(fake.context);

    const change = await client.city.townFocus.change.check({
      cityId,
      growthType,
      projectType,
    });
    const review = await client.city.townFocus.review.check({ cityId });

    expect(change).toEqual({
      cityId,
      growthType,
      projectType,
      status: "available",
    });
    expect(review).toEqual({
      cityId,
      status: "available",
    });
    expect(fake.events.map((event) => event.kind)).toEqual(["change-check", "review-check"]);
    expectSemanticTownFocusOmitsRuntimeDetails({ change, review });
  });

  test("does not repeat a focus that is already selected", async () => {
    const selected = townFocusSnapshot({ growthType, projectType });
    const fake = fakeContext({
      changeChecks: [changeCheckResult({ snapshot: selected })],
    });

    const result = await call(
      Civ7ControlOrpcRouter.city.townFocus.change.request,
      { cityId, growthType, projectType },
      { context: fake.context }
    );

    expect(result).toMatchObject({
      cityId,
      status: "already-selected",
      postcondition: {
        classification: "town-focus-selected",
        outcome: "selected",
        confidence: "confirmed",
        confirmed: true,
      },
      nextSteps: [{ kind: "refresh-attention" }],
    });
    expect(fake.events.map((event) => event.kind)).toEqual(["readiness", "change-check"]);
  });

  test("confirms a sent focus from observed town state", async () => {
    const before = townFocusSnapshot();
    const after = townFocusSnapshot({ growthType, projectType });
    const fake = fakeContext({
      changeChecks: [changeCheckResult({ snapshot: before })],
      changeSends: [changeSendResult({ before, after })],
    });

    const result = await call(
      Civ7ControlOrpcRouter.city.townFocus.change.request,
      { cityId, growthType, projectType },
      { context: fake.context }
    );

    expect(result).toMatchObject({
      cityId,
      growthType,
      projectType,
      status: "sent-confirmed",
      postcondition: {
        classification: "town-focus-selected",
        confidence: "confirmed",
        confirmed: true,
      },
    });
    expect(fake.events.map((event) => event.kind)).toEqual([
      "readiness",
      "change-check",
      "change-send",
    ]);
  });

  test("does not repeat an already completed town project review", async () => {
    const fake = fakeContext({
      reviewChecks: [
        reviewCheckResult({
          snapshot: townFocusSnapshot({ notification: null }),
        }),
      ],
    });

    const result = await call(
      Civ7ControlOrpcRouter.city.townFocus.review.request,
      { cityId },
      { context: fake.context }
    );

    expect(result).toMatchObject({
      cityId,
      status: "already-complete",
      postcondition: {
        classification: "town-focus-review-cleared",
        outcome: "review-cleared",
        confidence: "confirmed",
      },
    });
    expect(fake.events.map((event) => event.kind)).toEqual(["readiness", "review-check"]);
  });

  test.each([
    ["null", null],
    ["empty string", ""],
    ["fractional number", 1.5],
  ] as const)("does not infer review completion from a %s blocker", async (_label, blocker) => {
    const fake = fakeContext({
      reviewChecks: [
        reviewCheckResult({
          snapshot: townFocusSnapshot({ blocker, notification: null }),
        }),
      ],
    });
    const client = createCiv7ControlOrpcServerClient(fake.context);

    await expect(client.city.townFocus.review.check({ cityId })).resolves.toEqual({
      cityId,
      status: "unavailable",
    });
  });

  test("confirms a sent review only when its matching blocker clears", async () => {
    const before = townFocusSnapshot();
    const after = townFocusSnapshot({ notification: null });
    const fake = fakeContext({
      reviewChecks: [reviewCheckResult({ snapshot: before })],
      reviewSends: [reviewSendResult({ before, after })],
    });

    const result = await call(
      Civ7ControlOrpcRouter.city.townFocus.review.request,
      { cityId },
      { context: fake.context }
    );

    expect(result).toMatchObject({
      cityId,
      status: "sent-confirmed",
      postcondition: {
        classification: "town-focus-review-cleared",
        confidence: "confirmed",
        confirmed: true,
      },
    });
    expect(fake.events.map((event) => event.kind)).toEqual([
      "readiness",
      "review-check",
      "review-send",
    ]);
  });

  test("classifies a definitive pre-dispatch failure as not sent", async () => {
    const fake = fakeContext({
      changeChecks: [changeCheckResult()],
      changeSends: [
        dispatchError(
          "not-dispatched",
          "Civ7 tuner state selection failed before command dispatch"
        ),
      ],
    });

    const result = await call(
      Civ7ControlOrpcRouter.city.townFocus.change.request,
      { cityId, growthType, projectType },
      { context: fake.context }
    );

    expect(result).toMatchObject({
      status: "not-sent",
      postcondition: {
        classification: "not-sent",
        outcome: "not-sent",
        confidence: "unverified",
        confirmed: false,
      },
      nextSteps: [
        {
          kind: "inspect-town-focus",
          source: "city.townFocus.change.request",
        },
      ],
    });
    expect(fake.events.map((event) => event.kind)).toEqual([
      "readiness",
      "change-check",
      "change-send",
    ]);
  });

  test.each([
    ["dispatched", dispatchError("dispatched", "socket closed after gameplay dispatch")],
    [
      "indeterminate",
      dispatchError("indeterminate", "transport failed while dispatch was indeterminate"),
    ],
    ["unclassified", new Error("transport response was lost")],
    [
      "foreign not-dispatched claim",
      Object.assign(new Error("foreign failure"), { dispatchStatus: "not-dispatched" }),
    ],
  ] as const)("keeps a %s send failure dispatch-unknown and no-repeat guarded", async (_label, error) => {
    const fake = fakeContext({
      changeChecks: [changeCheckResult()],
      changeSends: [error],
    });

    const result = await call(
      Civ7ControlOrpcRouter.city.townFocus.change.request,
      { cityId, growthType, projectType },
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
      nextSteps: [
        {
          kind: "do-not-repeat",
          source: "city.townFocus.change.request",
        },
      ],
    });
    expect(fake.events.map((event) => event.kind)).toEqual([
      "readiness",
      "change-check",
      "change-send",
    ]);
  });

  test("continues after transient failed postchecks and accepts later focus confirmation", async () => {
    const before = townFocusSnapshot();
    const selected = townFocusSnapshot({ growthType, projectType });
    const fake = fakeContext({
      changeChecks: [
        changeCheckResult({ snapshot: before }),
        new Error("first transient postcheck failure"),
        new Error("second transient postcheck failure"),
        changeCheckResult({ snapshot: selected }),
      ],
      changeSends: [changeSendResult({ before, after: before })],
    });

    const result = await call(
      Civ7ControlOrpcRouter.city.townFocus.change.request,
      { cityId, growthType, projectType },
      { context: fake.context }
    );

    expect(result).toMatchObject({
      status: "sent-confirmed",
      postcondition: {
        classification: "town-focus-selected",
        outcome: "selected",
        confidence: "confirmed",
        confirmed: true,
        noRepeatAfterUnverified: false,
      },
      nextSteps: [{ kind: "refresh-attention" }],
    });
    expect(fake.events.map((event) => event.kind)).toEqual([
      "readiness",
      "change-check",
      "change-send",
      "change-check",
      "change-check",
      "change-check",
    ]);
  });

  test("confirms a town project review from a later polling observation", async () => {
    const matching = townFocusSnapshot();
    const cleared = townFocusSnapshot({ notification: null });
    const fake = fakeContext({
      reviewChecks: [
        reviewCheckResult({ snapshot: matching }),
        reviewCheckResult({ snapshot: matching }),
        reviewCheckResult({ snapshot: cleared }),
      ],
      reviewSends: [reviewSendResult({ before: matching, after: matching })],
    });

    const result = await call(
      Civ7ControlOrpcRouter.city.townFocus.review.request,
      { cityId },
      { context: fake.context }
    );

    expect(result).toMatchObject({
      status: "sent-confirmed",
      postcondition: {
        classification: "town-focus-review-cleared",
        outcome: "review-cleared",
        confidence: "confirmed",
        confirmed: true,
        noRepeatAfterUnverified: false,
      },
      nextSteps: [{ kind: "refresh-attention" }],
    });
    expect(fake.events.map((event) => event.kind)).toEqual([
      "readiness",
      "review-check",
      "review-send",
      "review-check",
      "review-check",
    ]);
  });

  test("bounds a never-resolving postcheck and leaves the sent review no-repeat guarded", async () => {
    const matching = townFocusSnapshot();
    const never = new Promise<Civ7ControlOrpcTownFocusReviewCheckResult>(() => undefined);
    const fake = fakeContext({
      reviewChecks: [reviewCheckResult({ snapshot: matching }), never],
      reviewSends: [reviewSendResult({ before: matching, after: matching })],
    });
    const startedAt = Date.now();

    const result = await call(
      Civ7ControlOrpcRouter.city.townFocus.review.request,
      { cityId },
      { context: fake.context }
    );

    expect(Date.now() - startedAt).toBeLessThan(2_500);
    expect(result).toMatchObject({
      status: "sent-unverified",
      postcondition: {
        classification: "missing-postcondition",
        outcome: "unknown",
        confidence: "unverified",
        confirmed: false,
        noRepeatAfterUnverified: true,
      },
      nextSteps: [
        {
          kind: "do-not-repeat",
          source: "city.townFocus.review.request",
        },
      ],
    });
    expect(fake.events.map((event) => event.kind)).toEqual([
      "readiness",
      "review-check",
      "review-send",
      "review-check",
    ]);
  });

  test("retains the latest completed evidence when a later postcheck never resolves", async () => {
    const before = townFocusSnapshot();
    const incomplete = {
      ...townFocusSnapshot(),
      city: failedProbe("post-send city read was unavailable"),
    };
    const latest = townFocusSnapshot();
    const never = new Promise<Civ7ControlOrpcTownFocusChangeCheckResult>(() => undefined);
    const fake = fakeContext({
      changeChecks: [
        changeCheckResult({ snapshot: before }),
        changeCheckResult({ snapshot: latest }),
        never,
      ],
      changeSends: [changeSendResult({ before, after: incomplete })],
    });

    const result = await call(
      Civ7ControlOrpcRouter.city.townFocus.change.request,
      { cityId, growthType, projectType },
      { context: fake.context }
    );

    expect(result).toMatchObject({
      status: "sent-unverified",
      postcondition: {
        classification: "no-state-change",
        outcome: "no-state-change",
        confidence: "unverified",
        confirmed: false,
        noRepeatAfterUnverified: true,
      },
      nextSteps: [
        {
          kind: "do-not-repeat",
          source: "city.townFocus.change.request",
        },
      ],
    });
    expect(fake.events.map((event) => event.kind)).toEqual([
      "readiness",
      "change-check",
      "change-send",
      "change-check",
      "change-check",
    ]);
  });
});

type Scripted<T> = T | Error | Promise<T>;

type FakeContextOptions = Readonly<{
  changeChecks?: ReadonlyArray<Scripted<Civ7ControlOrpcTownFocusChangeCheckResult>>;
  changeSends?: ReadonlyArray<Scripted<Civ7ControlOrpcTownFocusChangeSendResult>>;
  reviewChecks?: ReadonlyArray<Scripted<Civ7ControlOrpcTownFocusReviewCheckResult>>;
  reviewSends?: ReadonlyArray<Scripted<Civ7ControlOrpcTownFocusReviewSendResult>>;
}>;

type FixtureEvent = Readonly<{
  kind: "readiness" | "change-check" | "change-send" | "review-check" | "review-send";
  input?: unknown;
}>;

function fakeContext(options: FakeContextOptions): {
  context: Civ7ControlOrpcContext;
  events: Array<FixtureEvent>;
} {
  const events: Array<FixtureEvent> = [];
  const changeChecks = [...(options.changeChecks ?? [])];
  const changeSends = [...(options.changeSends ?? [])];
  const reviewChecks = [...(options.reviewChecks ?? [])];
  const reviewSends = [...(options.reviewSends ?? [])];

  return {
    context: {
      endpointDefaults,
      directControl: directControlFacadeFixture({
        getCiv7PlayableStatus: async () => {
          events.push({ kind: "readiness" });
          return playableStatusResult();
        },
        checkCiv7TownFocusChange: async (input) => {
          events.push({ kind: "change-check", input });
          return scriptedResult(changeChecks, "town focus change check");
        },
        sendCiv7TownFocusChange: async (input) => {
          events.push({ kind: "change-send", input });
          return scriptedResult(changeSends, "town focus change send");
        },
        checkCiv7TownFocusReview: async (input) => {
          events.push({ kind: "review-check", input });
          return scriptedResult(reviewChecks, "town focus review check");
        },
        sendCiv7TownFocusReview: async (input) => {
          events.push({ kind: "review-send", input });
          return scriptedResult(reviewSends, "town focus review send");
        },
      }),
    },
    events,
  };
}

function scriptedResult<T>(script: Array<Scripted<T>>, label: string): T | Promise<T> {
  const result = script.shift();
  if (result === undefined) throw new Error(`Missing scripted ${label} result`);
  if (result instanceof Error) throw result;
  return result;
}

function changeCheckResult(
  overrides: Partial<Civ7ControlOrpcTownFocusChangeCheckResult> = {}
): Civ7ControlOrpcTownFocusChangeCheckResult {
  return {
    valid: true,
    result: { Success: true },
    snapshot: townFocusSnapshot(),
    ...overrides,
  };
}

function reviewCheckResult(
  overrides: Partial<Civ7ControlOrpcTownFocusReviewCheckResult> = {}
): Civ7ControlOrpcTownFocusReviewCheckResult {
  return {
    snapshot: townFocusSnapshot(),
    ...overrides,
  };
}

function changeSendResult(
  overrides: Partial<Extract<Civ7ControlOrpcTownFocusChangeSendResult, { sent: true }>> = {}
): Extract<Civ7ControlOrpcTownFocusChangeSendResult, { sent: true }> {
  return {
    sent: true,
    validation: { valid: true, result: { Success: true } },
    before: townFocusSnapshot(),
    after: townFocusSnapshot({ growthType, projectType }),
    ...overrides,
  };
}

function reviewSendResult(
  overrides: Partial<Civ7ControlOrpcTownFocusReviewSendResult> = {}
): Civ7ControlOrpcTownFocusReviewSendResult {
  return {
    sent: true,
    before: townFocusSnapshot(),
    after: townFocusSnapshot({ notification: null }),
    ...overrides,
  };
}

function townFocusSnapshot(
  options: Readonly<{
    growthType?: number;
    projectType?: number;
    blocker?: number | string | null;
    notification?: ReturnType<typeof matchingTownFocusNotification> | null;
  }> = {}
): Civ7ControlOrpcTownFocusSnapshot {
  return {
    cityId,
    city: probe({
      observedCityId: cityId,
      owner: cityId.owner,
      isTown: true,
      growthType: options.growthType ?? 10,
      projectType: options.projectType ?? 20,
    }),
    blocker: probe(options.blocker === undefined ? 1_234 : options.blocker),
    blockingTownFocusNotification: probe(
      options.notification === undefined ? matchingTownFocusNotification() : options.notification
    ),
  };
}

function matchingTownFocusNotification() {
  return {
    id: { owner: 0, id: 42, type: 20 },
    type: 1_234,
    typeName: "NOTIFICATION_CHOOSE_TOWN_PROJECT",
    target: cityId,
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

function expectSemanticTownFocusOmitsRuntimeDetails(result: unknown) {
  const serialized = JSON.stringify(result);
  expect(serialized).not.toContain("Game.CityCommands");
  expect(serialized).not.toContain("Game.CityOperations");
  expect(serialized).not.toContain("CHANGE_GROWTH_MODE");
  expect(serialized).not.toContain("CONSIDER_TOWN_PROJECT");
  expect(serialized).not.toContain("blockingTownFocusNotification");
  expect(serialized).not.toContain('"snapshot"');
}

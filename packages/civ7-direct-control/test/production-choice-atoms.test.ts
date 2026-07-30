import { once } from "node:events";
import { type AddressInfo, createServer } from "node:net";
import { runInNewContext } from "node:vm";
import { Value } from "typebox/value";
import { describe, expect, test } from "vitest";

import * as directControl from "../src/index";
import { checkCiv7ProductionChoice, sendCiv7ProductionChoice } from "../src/index";
import { liveCiv7DirectControl } from "../src/live-control";

type ProductionCall = Readonly<{
  kind: "canStart" | "sendRequest";
  cityId: unknown;
  operationType: unknown;
  args: unknown;
  queue?: unknown;
}>;

type FakeProductionTunerServer = Readonly<{
  calls: ProductionCall[];
  commandExecutions: string[];
  commandStateIds: string[];
  events: string[];
  runtimeErrors: unknown[];
  address(): AddressInfo;
  close(): Promise<void>;
}>;

type ProductionTunerOptions = Readonly<{
  canStartResult?: unknown;
  canStartError?: Error;
  commandResponseParts?: ReadonlyArray<string>;
  exclusiveInsertMode?: number | null;
  isTown?: boolean;
  missingNotificationApis?: boolean;
  notificationTarget?: unknown;
  notificationType?: unknown;
  notificationTypeName?: unknown;
  prototypeNotificationFields?: boolean;
  sendError?: Error;
  sendResult?: unknown;
  unknownCityKind?: boolean;
}>;

const cityId = { owner: 0, id: 65_536, type: 1 };
const constructibleType = 713_967_338;
const projectType = -548_685_232;
const productionBlocker = 1_090_224_621;

describe("exact city production-choice wire atoms", () => {
  test("publishes only the exact check/send atoms and their raw schemas", () => {
    expect(directControl).toMatchObject({
      checkCiv7ProductionChoice: expect.any(Function),
      sendCiv7ProductionChoice: expect.any(Function),
      Civ7ProductionChoiceInputSchema: expect.any(Object),
      Civ7ProductionChoiceValidationResultSchema: expect.any(Object),
      Civ7ProductionChoiceCheckResultSchema: expect.any(Object),
      Civ7ProductionChoiceSnapshotSchema: expect.any(Object),
      Civ7ProductionChoiceSendResultSchema: expect.any(Object),
    });
    expect(liveCiv7DirectControl).toMatchObject({
      checkCiv7ProductionChoice,
      sendCiv7ProductionChoice,
    });
    expect("requestCiv7ProductionChoice" in directControl).toBe(false);
    expect("requestCiv7ProductionChoice" in liveCiv7DirectControl).toBe(false);
    expect("Civ7ProductionChoiceResultSchema" in directControl).toBe(false);
    expect("productionChoicePostconditionConfirmed" in directControl).toBe(false);
    expect(
      Value.Check(directControl.Civ7ProductionChoiceInputSchema, {
        cityId,
        args: { ConstructibleType: constructibleType, X: 22, Y: 31 },
      })
    ).toBe(true);
    expect(Value.Check(directControl.Civ7ProductionChoiceCheckResultSchema, {})).toBe(false);
    expect(Value.Check(directControl.Civ7ProductionChoiceSendResultSchema, {})).toBe(false);
    const snapshot = expectedSnapshot({
      currentProductionTypeHash: constructibleType,
      blocker: productionBlocker,
    });
    expect(Value.Check(directControl.Civ7ProductionChoiceSnapshotSchema, snapshot)).toBe(true);
    expect(
      Value.Check(directControl.Civ7ProductionChoiceSnapshotSchema, {
        ...snapshot,
        selectedCityId: { ok: true, value: cityId },
      })
    ).toBe(false);
    expect(
      Value.Check(directControl.Civ7ProductionChoiceSnapshotSchema, {
        ...snapshot,
        canEndTurn: { ok: true, value: false },
      })
    ).toBe(false);
  });

  test("checks strict BUILD admission with one App UI execution and a faithful raw snapshot", async () => {
    const server = await startProductionTunerServer();
    try {
      const result = await checkCiv7ProductionChoice(
        { cityId, args: { ConstructibleType: constructibleType, X: 22, Y: 31 } },
        tunerOptions(server)
      );

      expect(result).toEqual({
        valid: true,
        result: { Success: true },
        snapshot: expectedSnapshot({
          currentProductionTypeHash: constructibleType,
          blocker: productionBlocker,
        }),
      });
      expect(result).not.toHaveProperty("host");
      expect(result).not.toHaveProperty("family");
      expect(result).not.toHaveProperty("verified");
      expect(server.commandExecutions).toHaveLength(1);
      expect(server.commandStateIds).toEqual(["65535"]);
      expect(server.calls).toEqual([
        {
          kind: "canStart",
          cityId,
          operationType: "BUILD",
          args: { ConstructibleType: constructibleType, X: 22, Y: 31 },
          queue: false,
        },
      ]);
      expect(server.events).not.toContain("sendRequest");
      expectNoProductionUiChoreographyOrDiscardedReads(server.events);
    } finally {
      await server.close();
    }
  });

  test("freshly validates, sends at most once without UI choreography, and snapshots in one execution", async () => {
    const server = await startProductionTunerServer();
    try {
      const result = await sendCiv7ProductionChoice(
        { cityId, args: { ConstructibleType: constructibleType, X: 22, Y: 31 } },
        tunerOptions(server)
      );

      expect(result).toEqual({
        sent: true,
        validation: {
          valid: true,
          result: { Success: true },
        },
        before: expectedSnapshot({
          currentProductionTypeHash: constructibleType,
          blocker: productionBlocker,
        }),
        after: expectedSnapshot({
          currentProductionTypeHash: 1_558_890_441,
          blocker: 0,
        }),
      });
      expect(result).not.toHaveProperty("postcondition");
      expect(result).not.toHaveProperty("verified");
      expect(server.commandExecutions).toHaveLength(1);
      expect(server.commandStateIds).toEqual(["65535"]);
      expect(server.calls).toEqual([
        {
          kind: "canStart",
          cityId,
          operationType: "BUILD",
          args: { ConstructibleType: constructibleType, X: 22, Y: 31 },
          queue: false,
        },
        {
          kind: "sendRequest",
          cityId,
          operationType: "BUILD",
          args: { ConstructibleType: constructibleType, X: 22, Y: 31 },
        },
      ]);
      expect(
        server.events.filter((event) => event === "canStart" || event === "sendRequest")
      ).toEqual(["canStart", "sendRequest"]);
      expectNoProductionUiChoreographyOrDiscardedReads(server.events);
    } finally {
      await server.close();
    }
  });

  test("adapts only the first legal InProgress constructible plot before the single send", async () => {
    const server = await startProductionTunerServer({
      canStartResult: { Success: true, InProgress: true, Plots: [1_458, 1_459] },
    });
    try {
      const result = await sendCiv7ProductionChoice(
        { cityId, args: { ConstructibleType: constructibleType } },
        tunerOptions(server)
      );

      expect(result.sent).toBe(true);
      expect(result.validation.result).toEqual({
        Success: true,
        InProgress: true,
        Plots: [1_458, 1_459],
      });
      expect(server.calls).toEqual([
        {
          kind: "canStart",
          cityId,
          operationType: "BUILD",
          args: { ConstructibleType: constructibleType },
          queue: false,
        },
        {
          kind: "sendRequest",
          cityId,
          operationType: "BUILD",
          args: { ConstructibleType: constructibleType, X: 22, Y: 31 },
        },
      ]);
      expect(server.events.filter((event) => event === "getLocationFromIndex:1458")).toHaveLength(
        1
      );
      expect(server.events).not.toContain("getLocationFromIndex:1459");
    } finally {
      await server.close();
    }
  });

  test("retains prototype-backed placement evidence while snapshotting only JSON boundary data", async () => {
    const inherited = Object.create({
      InProgress: true,
      Plots: [1_458],
    }) as Record<string, unknown>;
    Object.defineProperty(inherited, "Success", {
      enumerable: false,
      value: true,
    });
    const server = await startProductionTunerServer({ canStartResult: inherited });
    try {
      const result = await sendCiv7ProductionChoice(
        { cityId, args: { ConstructibleType: constructibleType } },
        tunerOptions(server)
      );

      expect(result).toMatchObject({
        sent: true,
        validation: { valid: true, result: {} },
      });
      expect(server.calls.at(-1)).toEqual({
        kind: "sendRequest",
        cityId,
        operationType: "BUILD",
        args: { ConstructibleType: constructibleType, X: 22, Y: 31 },
      });
    } finally {
      await server.close();
    }
  });

  test("reports coordinate-free auto-plot availability without selecting or sending", async () => {
    const availableServer = await startProductionTunerServer({
      canStartResult: { Success: true, InProgress: true, Plots: [1_458] },
    });
    const unavailableServer = await startProductionTunerServer({
      canStartResult: { Success: true, InProgress: true, Plots: [] },
    });
    try {
      const available = await checkCiv7ProductionChoice(
        { cityId, args: { ConstructibleType: constructibleType } },
        tunerOptions(availableServer)
      );
      const unavailable = await checkCiv7ProductionChoice(
        { cityId, args: { ConstructibleType: constructibleType } },
        tunerOptions(unavailableServer)
      );

      expect(available.valid).toBe(true);
      expect(unavailable.valid).toBe(false);
      expect(availableServer.events).not.toContain("sendRequest");
      expect(unavailableServer.events).not.toContain("sendRequest");
      expectNoProductionUiChoreographyOrDiscardedReads(availableServer.events);
      expectNoProductionUiChoreographyOrDiscardedReads(unavailableServer.events);
    } finally {
      await availableServer.close();
      await unavailableServer.close();
    }
  });

  test("adds Exclusive InsertMode only for town ProjectType production", async () => {
    const server = await startProductionTunerServer({ isTown: true });
    try {
      await sendCiv7ProductionChoice(
        { cityId, args: { ProjectType: projectType } },
        tunerOptions(server)
      );

      expect(server.calls.at(-1)).toEqual({
        kind: "sendRequest",
        cityId,
        operationType: "BUILD",
        args: { ProjectType: projectType, InsertMode: 2 },
      });
    } finally {
      await server.close();
    }
  });

  test("never adds placement coordinates to non-constructible choices", async () => {
    const server = await startProductionTunerServer({
      canStartResult: { Success: true, InProgress: true, Plots: [1_458] },
    });
    try {
      await sendCiv7ProductionChoice(
        { cityId, args: { UnitType: 1_558_890_441 } },
        tunerOptions(server)
      );

      expect(server.calls.at(-1)).toEqual({
        kind: "sendRequest",
        cityId,
        operationType: "BUILD",
        args: { UnitType: 1_558_890_441 },
      });
      expect(server.events).not.toContain("getLocationFromIndex:1458");
    } finally {
      await server.close();
    }
  });

  test("returns unchanged evidence without sending or mutating UI when validation rejects", async () => {
    const server = await startProductionTunerServer({
      canStartResult: { Success: false, FailureReasons: ["blocked"] },
    });
    try {
      const result = await sendCiv7ProductionChoice(
        { cityId, args: { ConstructibleType: constructibleType } },
        tunerOptions(server)
      );

      expect(result).toMatchObject({
        sent: false,
        validation: {
          valid: false,
          result: { Success: false, FailureReasons: ["blocked"] },
        },
      });
      expect(result.after).toEqual(result.before);
      expect(server.calls).toHaveLength(1);
      expect(server.events).not.toContain("sendRequest");
      expectNoProductionUiChoreographyOrDiscardedReads(server.events);
      expect(server.commandExecutions).toHaveLength(1);
    } finally {
      await server.close();
    }
  });

  test("reports sent when sendRequest returns false because the engine call completed", async () => {
    const server = await startProductionTunerServer({ sendResult: false });
    try {
      const result = await sendCiv7ProductionChoice(
        { cityId, args: { ConstructibleType: constructibleType, X: 22, Y: 31 } },
        tunerOptions(server)
      );

      expect(result.sent).toBe(true);
      expect(result.after).toEqual(result.before);
      expect(server.calls.filter((call) => call.kind === "sendRequest")).toHaveLength(1);
      expectNoProductionUiChoreographyOrDiscardedReads(server.events);
    } finally {
      await server.close();
    }
  });

  test.each([
    ["an empty object", {}],
    ["an array", []],
    ["a string", "true"],
    ["a number", 1],
    ["null", null],
    ["undefined", undefined],
    ["a drift object", { accepted: true }],
    ["a non-boolean Success field", { Success: 1 }],
    ["a non-boolean success field", { success: "true" }],
    ["a non-boolean canStart field", { canStart: null }],
  ])("throws on %s canStart evidence and never sends", async (_label, canStartResult) => {
    for (const atom of ["check", "send"] as const) {
      const server = await startProductionTunerServer({ canStartResult });
      try {
        const failure = await captureFailure(() =>
          atom === "check"
            ? checkCiv7ProductionChoice(
                { cityId, args: { ConstructibleType: constructibleType } },
                tunerOptions(server)
              )
            : sendCiv7ProductionChoice(
                { cityId, args: { ConstructibleType: constructibleType } },
                tunerOptions(server)
              )
        );
        expect(failure, atom).toMatchObject({
          name: "Civ7DirectControlError",
          code: "command-failed",
          dispatchStatus: atom === "check" ? "dispatched" : "not-dispatched",
        });
        expect(server.runtimeErrors, atom).toHaveLength(atom === "check" ? 1 : 0);
        expect((failure as Error).message, atom).toMatch(
          /canStart returned (?:an unrecognized result|a non-boolean \w+ field)/
        );
        expect(
          server.calls.filter((call) => call.kind === "sendRequest"),
          atom
        ).toEqual([]);
      } finally {
        await server.close();
      }
    }
  });

  test("propagates validator exceptions and performs zero sends", async () => {
    const server = await startProductionTunerServer({
      canStartError: new Error("validator failed"),
    });
    try {
      const failure = await captureFailure(() =>
        sendCiv7ProductionChoice(
          { cityId, args: { ConstructibleType: constructibleType, X: 22, Y: 31 } },
          tunerOptions(server)
        )
      );

      expect(failure).toMatchObject({
        name: "Civ7DirectControlError",
        code: "command-failed",
        dispatchStatus: "not-dispatched",
      });
      expect(server.runtimeErrors).toHaveLength(0);
      expect((failure as Error).message).toContain("validator failed");
      expect(server.calls.filter((call) => call.kind === "sendRequest")).toEqual([]);
    } finally {
      await server.close();
    }
  });

  test("propagates send exceptions as dispatched and never closes or repeats", async () => {
    const server = await startProductionTunerServer({
      sendError: new Error("send failed"),
    });
    try {
      const failure = await captureFailure(() =>
        sendCiv7ProductionChoice(
          { cityId, args: { ConstructibleType: constructibleType, X: 22, Y: 31 } },
          tunerOptions(server)
        )
      );

      expect(failure).toMatchObject({
        name: "Civ7DirectControlError",
        code: "command-failed",
        dispatchStatus: "dispatched",
      });
      expect(server.runtimeErrors).toHaveLength(0);
      expect((failure as Error).message).toContain("send failed");
      expect(server.calls.filter((call) => call.kind === "sendRequest")).toHaveLength(1);
      expectNoProductionUiChoreographyOrDiscardedReads(server.events);
    } finally {
      await server.close();
    }
  });

  test("returns unrelated blocker identity, type, and target without preclassification", async () => {
    const otherCityId = { owner: 0, id: 65_537, type: 1 };
    const server = await startProductionTunerServer({
      notificationTarget: otherCityId,
      notificationType: 77,
      notificationTypeName: "NOTIFICATION_UNRELATED_BLOCKER",
      prototypeNotificationFields: true,
    });
    try {
      const result = await checkCiv7ProductionChoice(
        { cityId, args: { ConstructibleType: constructibleType, X: 22, Y: 31 } },
        tunerOptions(server)
      );

      expect(result.snapshot.blockingProductionNotification).toEqual({
        ok: true,
        value: {
          id: { owner: 0, id: 6, type: 20 },
          type: 77,
          typeName: "NOTIFICATION_UNRELATED_BLOCKER",
          target: otherCityId,
        },
      });
    } finally {
      await server.close();
    }
  });

  test("keeps missing blocker type and target as raw unknown fields", async () => {
    const server = await startProductionTunerServer({
      notificationTarget: null,
      notificationType: null,
      notificationTypeName: null,
    });
    try {
      const result = await checkCiv7ProductionChoice(
        { cityId, args: { ConstructibleType: constructibleType, X: 22, Y: 31 } },
        tunerOptions(server)
      );

      expect(result.snapshot.blockingProductionNotification).toEqual({
        ok: true,
        value: {
          id: { owner: 0, id: 6, type: 20 },
          type: null,
          typeName: null,
          target: null,
        },
      });
    } finally {
      await server.close();
    }
  });

  test("keeps unavailable blocker APIs as failed probes rather than false clearance", async () => {
    const server = await startProductionTunerServer({ missingNotificationApis: true });
    try {
      const result = await checkCiv7ProductionChoice(
        { cityId, args: { ConstructibleType: constructibleType, X: 22, Y: 31 } },
        tunerOptions(server)
      );

      expect(result.snapshot.blocker).toMatchObject({ ok: false });
      expect(result.snapshot.blockingProductionNotification).toMatchObject({ ok: false });
    } finally {
      await server.close();
    }
  });

  test.each([
    ["missing validation plot", { Success: true, InProgress: true, Plots: [] }],
    ["unmapped validation plot", { Success: true, InProgress: true, Plots: [9_999] }],
  ])("fails before send when a constructible without explicit X/Y has $label", async (_label, canStartResult) => {
    const server = await startProductionTunerServer({ canStartResult });
    try {
      const failure = await captureFailure(() =>
        sendCiv7ProductionChoice(
          { cityId, args: { ConstructibleType: constructibleType } },
          tunerOptions(server)
        )
      );

      expect(failure).toMatchObject({
        name: "Civ7DirectControlError",
        code: "command-failed",
        dispatchStatus: "not-dispatched",
      });
      expect(server.calls.filter((call) => call.kind === "sendRequest")).toEqual([]);
    } finally {
      await server.close();
    }
  });

  test("fails before town project send when Exclusive insert mode is unavailable", async () => {
    const server = await startProductionTunerServer({
      exclusiveInsertMode: null,
      isTown: true,
    });
    try {
      await expect(
        sendCiv7ProductionChoice(
          { cityId, args: { ProjectType: projectType } },
          tunerOptions(server)
        )
      ).rejects.toMatchObject({
        name: "Civ7DirectControlError",
        dispatchStatus: "not-dispatched",
      });
      expect(server.calls.filter((call) => call.kind === "sendRequest")).toEqual([]);
    } finally {
      await server.close();
    }
  });

  test("fails before project send when city versus town state is unknown", async () => {
    const server = await startProductionTunerServer({ unknownCityKind: true });
    try {
      await expect(
        sendCiv7ProductionChoice(
          { cityId, args: { ProjectType: projectType } },
          tunerOptions(server)
        )
      ).rejects.toMatchObject({
        name: "Civ7DirectControlError",
        dispatchStatus: "not-dispatched",
      });
      expect(server.calls.filter((call) => call.kind === "sendRequest")).toEqual([]);
    } finally {
      await server.close();
    }
  });

  test.each([
    {
      label: "malformed JSON",
      commandResponseParts: ["{not-json"],
      expectedMessage: /returned invalid JSON/,
    },
    {
      label: "an empty payload",
      commandResponseParts: [],
      expectedMessage: /returned an invalid payload/,
    },
  ])("rejects $label from both atom bodies as dispatched", async ({
    commandResponseParts,
    expectedMessage,
  }) => {
    for (const atom of ["check", "send"] as const) {
      const server = await startProductionTunerServer({ commandResponseParts });
      try {
        const failure = await captureFailure(() =>
          atom === "check"
            ? checkCiv7ProductionChoice(
                { cityId, args: { ConstructibleType: constructibleType } },
                tunerOptions(server)
              )
            : sendCiv7ProductionChoice(
                { cityId, args: { ConstructibleType: constructibleType } },
                tunerOptions(server)
              )
        );
        expect(failure, atom).toMatchObject({
          name: "Civ7DirectControlError",
          code: "command-failed",
          dispatchStatus: "dispatched",
        });
        expect((failure as Error).message, atom).toMatch(expectedMessage);
        expect(server.commandExecutions, atom).toHaveLength(1);
        expect(server.calls, atom).toEqual([]);
      } finally {
        await server.close();
      }
    }
  });

  test.each([
    {
      label: "malformed city identity",
      input: {
        cityId: { owner: 0 },
        args: { ConstructibleType: constructibleType },
      },
    },
    {
      label: "multiple production items",
      input: {
        cityId,
        args: { UnitType: 42, ConstructibleType: constructibleType },
      },
    },
    {
      label: "a mixed noninteger production item",
      input: {
        cityId,
        args: { UnitType: 42, ConstructibleType: 7.5 },
      },
    },
    {
      label: "a lone noninteger production item",
      input: {
        cityId,
        args: { ProjectType: 7.5 },
      },
    },
    {
      label: "partial placement coordinates",
      input: {
        cityId,
        args: { ConstructibleType: constructibleType, X: 22 },
      },
    },
    {
      label: "present undefined placement coordinates",
      input: {
        cityId,
        args: { ConstructibleType: constructibleType, X: undefined, Y: undefined },
      },
    },
    {
      label: "coordinates on unit production",
      input: {
        cityId,
        args: { UnitType: 42, X: 22, Y: 31 },
      },
    },
    {
      label: "unsupported argument",
      input: {
        cityId,
        args: { UnitType: 42, InsertMode: 2 },
      },
    },
  ])("classifies $label as not dispatched", async ({ input }) => {
    const failure = await captureFailure(() =>
      sendCiv7ProductionChoice(input as Parameters<typeof sendCiv7ProductionChoice>[0], {
        host: "127.0.0.1",
        port: 1,
        timeoutMs: 10,
      })
    );
    expect(failure).toMatchObject({
      name: "Civ7DirectControlError",
      code: "command-failed",
      dispatchStatus: "not-dispatched",
    });
  });
});

async function startProductionTunerServer(
  options: ProductionTunerOptions = {}
): Promise<FakeProductionTunerServer> {
  const calls: ProductionCall[] = [];
  const commandExecutions: string[] = [];
  const commandStateIds: string[] = [];
  const events: string[] = [];
  const runtimeErrors: unknown[] = [];
  const runtime = {
    currentProductionTypeHash: constructibleType,
    blocker: productionBlocker,
  };
  const city = {
    id: cityId,
    population: 3,
    isTown: options.unknownCityKind ? undefined : options.isTown === true,
    location: { x: 26, y: 36 },
    BuildQueue: {
      getCurrentProductionTypeHash: () => runtime.currentProductionTypeHash,
      getPreviousProductionTypeHash: () => 0,
      getProductionProgress: () =>
        runtime.currentProductionTypeHash === constructibleType ? 12 : 0,
      getTurnsLeft: () => (runtime.currentProductionTypeHash === constructibleType ? -1 : 4),
      getQueue: () => [runtime.currentProductionTypeHash],
    },
  };
  const notificationId = { owner: 0, id: 6, type: 20 };
  const notificationTarget = Object.prototype.hasOwnProperty.call(options, "notificationTarget")
    ? options.notificationTarget
    : cityId;
  const notification = Object.assign(
    options.prototypeNotificationFields
      ? Object.create({ Target: notificationTarget })
      : { Target: notificationTarget },
    {
      CanUserDismiss: false,
      Expired: false,
      Dismissed: false,
    }
  );
  const globals = {
    CityOperationTypes: {
      BUILD: "BUILD",
    },
    CityOperationsParametersValues:
      options.exclusiveInsertMode === null
        ? {}
        : {
            Exclusive: options.exclusiveInsertMode ?? 2,
          },
    Cities: {
      get: (requestedCityId: unknown) => {
        return componentIdEqual(requestedCityId, cityId) ? city : null;
      },
    },
    GameContext: {
      localPlayerID: 0,
    },
    GameplayMap: {
      getLocationFromIndex: (index: number) => {
        events.push(`getLocationFromIndex:${index}`);
        return index === 1_458 ? { x: 22, y: 31 } : null;
      },
    },
    InterfaceMode: {
      switchToDefault: () => {
        events.push("switchToDefault");
      },
    },
    PlotCursor: new Proxy(
      {},
      {
        set: (_target, property, value) => {
          if (property === "plotCursorCoords" && value != null) events.push("plotCursor");
          return true;
        },
      }
    ),
    UI: {
      Player: {
        lookAtID: () => {
          events.push("lookAtID");
        },
        selectCity: () => {
          events.push("selectCity");
        },
        deselectAllCities: () => {
          events.push("deselectAllCities");
        },
      },
    },
    Game: {
      Notifications: {
        getEndTurnBlockingType: options.missingNotificationApis ? undefined : () => runtime.blocker,
        findEndTurnBlocking: options.missingNotificationApis
          ? undefined
          : () => (runtime.blocker === 0 ? null : notificationId),
        find: () => notification,
        getType: () =>
          Object.prototype.hasOwnProperty.call(options, "notificationType")
            ? options.notificationType
            : productionBlocker,
        getTypeName: () =>
          Object.prototype.hasOwnProperty.call(options, "notificationTypeName")
            ? options.notificationTypeName
            : "NOTIFICATION_CHOOSE_CITY_PRODUCTION",
      },
      CityOperations: {
        canStart: (
          requestedCityId: unknown,
          operationType: unknown,
          args: unknown,
          queue: unknown
        ) => {
          events.push("canStart");
          calls.push({
            kind: "canStart",
            cityId: jsonClone(requestedCityId),
            operationType,
            args: jsonClone(args),
            queue,
          });
          if (options.canStartError) throw options.canStartError;
          return Object.prototype.hasOwnProperty.call(options, "canStartResult")
            ? options.canStartResult
            : { Success: true };
        },
        sendRequest: (requestedCityId: unknown, operationType: unknown, args: unknown) => {
          events.push("sendRequest");
          calls.push({
            kind: "sendRequest",
            cityId: jsonClone(requestedCityId),
            operationType,
            args: jsonClone(args),
          });
          if (options.sendError) throw options.sendError;
          if (options.sendResult === false) return false;
          runtime.currentProductionTypeHash = 1_558_890_441;
          runtime.blocker = 0;
          return options.sendResult ?? true;
        },
      },
    },
  };
  const server = createServer((socket) => {
    let buffer = Buffer.alloc(0);
    socket.on("data", (chunk) => {
      buffer = Buffer.concat([buffer, chunk]);
      for (;;) {
        const frame = parseRequest(buffer);
        if (!frame) return;
        buffer = buffer.subarray(frame.bytesRead);
        if (frame.message === "LSQ:") {
          socket.write(encodeResponse(frame.listenerId, ["65535", "App UI", "1", "Tuner"]));
          continue;
        }
        const commandMatch = frame.message.match(/^CMD:([^:]+):(.*)$/s);
        if (!commandMatch) continue;
        commandStateIds.push(commandMatch[1] ?? "");
        const command = commandMatch[2] ?? "";
        commandExecutions.push(command);
        if (options.commandResponseParts !== undefined) {
          socket.write(encodeResponse(frame.listenerId, options.commandResponseParts));
          continue;
        }
        try {
          const output = runInNewContext(command, globals);
          events.push("afterSnapshot");
          socket.write(encodeResponse(frame.listenerId, [String(output)]));
        } catch (error) {
          runtimeErrors.push(error);
          socket.write(encodeResponse(frame.listenerId, [String(error)]));
        }
      }
    });
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  return {
    calls,
    commandExecutions,
    commandStateIds,
    events,
    runtimeErrors,
    address: () => server.address() as AddressInfo,
    close: async () => {
      server.close();
      await once(server, "close");
    },
  };
}

function expectedSnapshot(input: { currentProductionTypeHash: number; blocker: number }) {
  return {
    cityId,
    city: {
      ok: true,
      value: {
        id: cityId,
        observedCityId: cityId,
      },
    },
    buildQueue: {
      ok: true,
      value: {
        currentProductionTypeHash: input.currentProductionTypeHash,
        previousProductionTypeHash: 0,
        productionProgress: input.currentProductionTypeHash === constructibleType ? 12 : 0,
        turnsLeftForRequestedItem: input.currentProductionTypeHash === constructibleType ? -1 : 4,
        queueLength: 1,
      },
    },
    blocker: { ok: true, value: input.blocker },
    blockingProductionNotification: {
      ok: true,
      value:
        input.blocker === 0
          ? null
          : {
              id: { owner: 0, id: 6, type: 20 },
              type: productionBlocker,
              typeName: "NOTIFICATION_CHOOSE_CITY_PRODUCTION",
              target: cityId,
            },
    },
  };
}

function expectNoProductionUiChoreographyOrDiscardedReads(events: ReadonlyArray<string>): void {
  const forbidden = new Set([
    "lookAtID",
    "selectCity",
    "plotCursor",
    "deselectAllCities",
    "switchToDefault",
  ]);
  expect(events.filter((event) => forbidden.has(event))).toEqual([]);
}

function tunerOptions(server: FakeProductionTunerServer) {
  return {
    host: "127.0.0.1",
    port: server.address().port,
    timeoutMs: 1_000,
  };
}

async function captureFailure(run: () => Promise<unknown>): Promise<unknown> {
  try {
    await run();
  } catch (error) {
    return error;
  }
  throw new Error("Expected exact production-choice atom to fail");
}

function componentIdEqual(left: unknown, right: typeof cityId): boolean {
  if (left == null || typeof left !== "object") return false;
  const value = left as Partial<typeof cityId>;
  return value.owner === right.owner && value.id === right.id && value.type === right.type;
}

function jsonClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function parseRequest(buffer: Buffer): {
  listenerId: number;
  message: string;
  bytesRead: number;
} | null {
  if (buffer.length < 8) return null;
  const messageLength = buffer.readUInt32LE(0);
  const bytesRead = 8 + messageLength;
  if (buffer.length < bytesRead) return null;
  return {
    listenerId: buffer.readUInt32LE(4),
    message: buffer.subarray(8, bytesRead).toString("utf8").replace(/\0$/, ""),
    bytesRead,
  };
}

function encodeResponse(listenerId: number, parts: ReadonlyArray<string>): Buffer {
  const messageBytes = Buffer.from(`${parts.join("\0")}\0`, "utf8");
  const frame = Buffer.alloc(8 + messageBytes.length);
  frame.writeUInt32LE(messageBytes.length, 0);
  frame.writeUInt32LE(listenerId, 4);
  messageBytes.copy(frame, 8);
  return frame;
}

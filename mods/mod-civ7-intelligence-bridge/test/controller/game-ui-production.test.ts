import { describe, expect, test } from "vitest";

import {
  type Civ7GameUiRuntimeTarget,
  createCiv7GameUiControllerContextFactory,
} from "../../src/controller/game-ui";
import {
  type Civ7GameUiProductionTarget,
  checkCiv7GameUiProductionChoice,
  civ7GameUiProductionChoiceCheckAvailable,
  civ7GameUiProductionChoiceSendAvailable,
  sendCiv7GameUiProductionChoice,
} from "../../src/controller/game-ui/production";

const cityId = { owner: 0, id: 65_536, type: 1 };
const otherCityId = { owner: 0, id: 65_537, type: 1 };
const constructibleType = 713_967_338;
const projectType = -548_685_232;

describe("game UI production-choice atoms", () => {
  test("advertises check and send availability independently", () => {
    const target = productionTarget();
    const sendRequest = target.Game?.CityOperations?.sendRequest;
    if (target.Game?.CityOperations != null) {
      target.Game.CityOperations.sendRequest = undefined;
    }

    expect(civ7GameUiProductionChoiceCheckAvailable(target)).toBe(true);
    expect(civ7GameUiProductionChoiceSendAvailable(target)).toBe(false);

    if (target.Game?.CityOperations != null) {
      target.Game.CityOperations.sendRequest = sendRequest;
    }
    expect(civ7GameUiProductionChoiceSendAvailable(target)).toBe(true);
  });

  test("advertises the check procedure without send support or mutation proof", async () => {
    const production = productionTarget();
    if (production.Game?.CityOperations != null) {
      production.Game.CityOperations.sendRequest = undefined;
    }
    const target: Civ7GameUiRuntimeTarget = {
      CityOperationTypes: production.CityOperationTypes,
      CityOperationsParametersValues: production.CityOperationsParametersValues,
      Cities: production.Cities,
      Game: production.Game,
      GameContext: production.GameContext,
      GameplayMap: production.GameplayMap,
    };

    const context = await createCiv7GameUiControllerContextFactory({ target })();
    expect(context.controller.supportedReadProcedures).toContain("city.production.choice.check");
    expect(context.controller.supportedMutationProcedures).not.toContain(
      "city.production.choice.request"
    );
  });

  test("snapshots immutable production primitives and returns unrelated raw blocker evidence", async () => {
    const discardedUiAccesses: string[] = [];
    const target = productionTarget({
      notificationTarget: otherCityId,
      notificationType: 77,
      notificationTypeName: "NOTIFICATION_UNRELATED_BLOCKER",
      discardedUiAccesses,
    });

    const result = await sendCiv7GameUiProductionChoice(
      { cityId, args: { ConstructibleType: constructibleType, X: 22, Y: 31 } },
      target
    );

    expect(result.before.city).toEqual({
      ok: true,
      value: { id: cityId, observedCityId: cityId },
    });
    expect(result.before.buildQueue).toMatchObject({
      ok: true,
      value: { currentProductionTypeHash: 1 },
    });
    expect(result.after.buildQueue).toMatchObject({
      ok: true,
      value: { currentProductionTypeHash: 99 },
    });
    expect(result.before.blockingProductionNotification).toEqual({
      ok: true,
      value: {
        id: { owner: 0, id: 6, type: 20 },
        type: 77,
        typeName: "NOTIFICATION_UNRELATED_BLOCKER",
        target: otherCityId,
      },
    });
    expect(JSON.stringify(result.before)).not.toContain("location");
    expect(JSON.stringify(result.before)).not.toContain("isTown");
    expect(discardedUiAccesses).toEqual([]);
  });

  test("keeps missing notification type and target as unknown raw fields", async () => {
    const target = productionTarget({
      notificationTarget: null,
      notificationType: null,
      notificationTypeName: null,
    });

    const result = await checkCiv7GameUiProductionChoice(
      { cityId, args: { ConstructibleType: constructibleType, X: 22, Y: 31 } },
      target
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
  });

  test("keeps unavailable blocker APIs as failed probes rather than false clearance", async () => {
    const target = productionTarget();
    if (target.Game?.Notifications != null) {
      target.Game.Notifications.getEndTurnBlockingType = undefined;
      target.Game.Notifications.findEndTurnBlocking = undefined;
    }

    const result = await checkCiv7GameUiProductionChoice(
      { cityId, args: { ConstructibleType: constructibleType, X: 22, Y: 31 } },
      target
    );

    expect(result.snapshot.blocker).toMatchObject({ ok: false });
    expect(result.snapshot.blockingProductionNotification).toMatchObject({ ok: false });
  });

  test("retains prototype-backed placement evidence while exposing a JSON snapshot", async () => {
    const sentArgs: unknown[] = [];
    const inherited = Object.create({
      InProgress: true,
      Plots: [1_458],
    }) as Record<string, unknown>;
    Object.defineProperty(inherited, "Success", {
      enumerable: false,
      value: true,
    });
    const target = productionTarget({
      validation: inherited,
      onSend: (args) => sentArgs.push(args),
    });

    const result = await sendCiv7GameUiProductionChoice(
      { cityId, args: { ConstructibleType: constructibleType } },
      target
    );

    expect(result).toMatchObject({
      sent: true,
      validation: { valid: true, result: {} },
    });
    expect(sentArgs).toEqual([{ ConstructibleType: constructibleType, X: 22, Y: 31 }]);
  });

  test("reports sent after sendRequest returns false and performs no UI choreography", async () => {
    const discardedUiAccesses: string[] = [];
    let sends = 0;
    const target = productionTarget({
      sendResult: false,
      onSend: () => sends++,
      discardedUiAccesses,
    });

    const result = await sendCiv7GameUiProductionChoice(
      { cityId, args: { ConstructibleType: constructibleType, X: 22, Y: 31 } },
      target
    );

    expect(result.sent).toBe(true);
    expect(sends).toBe(1);
    expect(discardedUiAccesses).toEqual([]);
  });

  test("reports safe auto-plot and project adaptation availability without mutating", async () => {
    const sends: unknown[] = [];
    const autoPlot = productionTarget({
      validation: { Success: true, InProgress: true, Plots: [1_458] },
      onSend: (args) => sends.push(args),
    });
    const noPlot = productionTarget({
      validation: { Success: true, InProgress: true, Plots: [] },
      onSend: (args) => sends.push(args),
    });
    const townWithoutExclusive = productionTarget({
      isTown: true,
      onSend: (args) => sends.push(args),
    });
    townWithoutExclusive.CityOperationsParametersValues = undefined;

    const available = await checkCiv7GameUiProductionChoice(
      { cityId, args: { ConstructibleType: constructibleType } },
      autoPlot
    );
    const unavailable = await checkCiv7GameUiProductionChoice(
      { cityId, args: { ConstructibleType: constructibleType } },
      noPlot
    );
    const projectUnavailable = await checkCiv7GameUiProductionChoice(
      { cityId, args: { ProjectType: projectType } },
      townWithoutExclusive
    );

    expect(available.valid).toBe(true);
    expect(unavailable.valid).toBe(false);
    expect(projectUnavailable.valid).toBe(false);
    expect(sends).toEqual([]);
  });

  test.each([
    ["missing validation plot", { Success: true, InProgress: true, Plots: [] }],
    ["missing map lookup", { Success: true, InProgress: true, Plots: [1_458] }],
  ])("constructible without explicit X/Y fails before send for %s", async (label, validation) => {
    let sends = 0;
    const target = productionTarget({ validation, onSend: () => sends++ });
    if (label === "missing map lookup") {
      target.GameplayMap = undefined;
    }

    await expect(
      sendCiv7GameUiProductionChoice(
        { cityId, args: { ConstructibleType: constructibleType } },
        target
      )
    ).rejects.toMatchObject({ dispatchStatus: "not-dispatched" });
    expect(sends).toBe(0);
  });

  test("town project adaptation fails before send without Exclusive insert mode", async () => {
    let sends = 0;
    const target = productionTarget({ isTown: true, onSend: () => sends++ });
    target.CityOperationsParametersValues = undefined;

    await expect(
      sendCiv7GameUiProductionChoice({ cityId, args: { ProjectType: projectType } }, target)
    ).rejects.toMatchObject({
      message: expect.stringMatching(/Exclusive/),
      dispatchStatus: "not-dispatched",
    });
    expect(sends).toBe(0);
  });

  test("project adaptation fails before send when city versus town state is unknown", async () => {
    let sends = 0;
    const target = productionTarget({ isTown: null, onSend: () => sends++ });

    await expect(
      sendCiv7GameUiProductionChoice({ cityId, args: { ProjectType: projectType } }, target)
    ).rejects.toMatchObject({
      message: expect.stringMatching(/known city or town state/),
      dispatchStatus: "not-dispatched",
    });
    expect(sends).toBe(0);
  });

  test("propagates validator exceptions and performs zero sends", async () => {
    let sends = 0;
    const target = productionTarget({
      validationError: new Error("validator failed"),
      onSend: () => sends++,
    });

    await expect(
      sendCiv7GameUiProductionChoice(
        { cityId, args: { ConstructibleType: constructibleType, X: 22, Y: 31 } },
        target
      )
    ).rejects.toMatchObject({
      message: "validator failed",
      dispatchStatus: "not-dispatched",
    });
    expect(sends).toBe(0);
  });

  test("propagates send exceptions after exactly one send attempt", async () => {
    let sends = 0;
    const target = productionTarget({
      sendError: new Error("send failed"),
      onSend: () => sends++,
    });

    await expect(
      sendCiv7GameUiProductionChoice(
        { cityId, args: { ConstructibleType: constructibleType, X: 22, Y: 31 } },
        target
      )
    ).rejects.toMatchObject({
      message: "send failed",
      dispatchStatus: "dispatched",
    });
    expect(sends).toBe(1);
  });

  test.each([
    { UnitType: 42, ConstructibleType: 7.5 },
    { ProjectType: 7.5 },
    { UnitType: 42, X: 2, Y: 3 },
    { ConstructibleType: constructibleType, X: undefined, Y: undefined },
  ])("rejects non-schema production args before validator or send: %o", async (args) => {
    let validations = 0;
    let sends = 0;
    const target = productionTarget({
      onValidate: () => validations++,
      onSend: () => sends++,
    });

    await expect(
      sendCiv7GameUiProductionChoice(
        { cityId, args } as Parameters<typeof sendCiv7GameUiProductionChoice>[0],
        target
      )
    ).rejects.toMatchObject({ dispatchStatus: "not-dispatched" });
    expect(validations).toBe(0);
    expect(sends).toBe(0);
  });
});

function productionTarget(
  options: Readonly<{
    isTown?: boolean | null;
    notificationTarget?: unknown;
    notificationType?: unknown;
    notificationTypeName?: string | null;
    validation?: unknown;
    validationError?: Error;
    sendError?: Error;
    sendResult?: unknown;
    onValidate?: () => void;
    onSend?: (args: Readonly<Record<string, number>>) => void;
    discardedUiAccesses?: string[];
  }> = {}
): Civ7GameUiProductionTarget & {
  GameplayMap?: Civ7GameUiProductionTarget["GameplayMap"];
  CityOperationsParametersValues?: Civ7GameUiProductionTarget["CityOperationsParametersValues"];
  UI: {
    Player: {
      lookAtID: () => void;
      selectCity: () => void;
      deselectAllCities: () => void;
    };
  };
  InterfaceMode: {
    switchToDefault: () => void;
  };
  PlotCursor: Record<string, unknown>;
} {
  const queue = {
    currentProductionTypeHash: 1,
    previousProductionTypeHash: 0,
    productionProgress: 12,
    getTurnsLeft: () => 4,
    getQueue: () => [1],
  };
  const city = {
    id: cityId,
    isTown: options.isTown === null ? undefined : (options.isTown ?? false),
    location: { x: 26, y: 36 },
    BuildQueue: queue,
  };
  const notificationId = { owner: 0, id: 6, type: 20 };
  const notification = {
    Target: Object.prototype.hasOwnProperty.call(options, "notificationTarget")
      ? options.notificationTarget
      : cityId,
  };
  return {
    CityOperationTypes: { BUILD: "BUILD" },
    CityOperationsParametersValues: { Exclusive: 2 },
    Cities: { get: () => city },
    GameContext: { localPlayerID: 0 },
    GameplayMap: { getLocationFromIndex: () => ({ x: 22, y: 31 }) },
    UI: {
      Player: {
        lookAtID: () => {
          options.discardedUiAccesses?.push("lookAtID");
        },
        selectCity: () => {
          options.discardedUiAccesses?.push("selectCity");
        },
        deselectAllCities: () => {
          options.discardedUiAccesses?.push("deselectAllCities");
        },
      },
    },
    InterfaceMode: {
      switchToDefault: () => {
        options.discardedUiAccesses?.push("switchToDefault");
      },
    },
    PlotCursor: new Proxy(
      {},
      {
        set: () => {
          options.discardedUiAccesses?.push("plotCursor");
          return true;
        },
      }
    ),
    Game: {
      CityOperations: {
        canStart: () => {
          options.onValidate?.();
          if (options.validationError) throw options.validationError;
          return options.validation ?? { Success: true };
        },
        sendRequest: (_cityId, _operationType, args) => {
          options.onSend?.(args);
          if (options.sendError) throw options.sendError;
          queue.currentProductionTypeHash = 99;
          return Object.prototype.hasOwnProperty.call(options, "sendResult")
            ? options.sendResult
            : true;
        },
      },
      Notifications: {
        getEndTurnBlockingType: () => 20,
        findEndTurnBlocking: () => notificationId,
        find: () => notification,
        getType: () =>
          Object.prototype.hasOwnProperty.call(options, "notificationType")
            ? options.notificationType
            : 20,
        getTypeName: () =>
          Object.prototype.hasOwnProperty.call(options, "notificationTypeName")
            ? (options.notificationTypeName ?? null)
            : "NOTIFICATION_CHOOSE_CITY_PRODUCTION",
      },
    },
  };
}

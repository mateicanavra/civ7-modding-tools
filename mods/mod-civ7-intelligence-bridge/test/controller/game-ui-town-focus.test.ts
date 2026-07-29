import { describe, expect, test } from "vitest";

import {
  type Civ7GameUiRuntimeTarget,
  createCiv7GameUiControllerContextFactory,
} from "../../src/controller/game-ui";
import {
  type Civ7GameUiTownFocusTarget,
  checkCiv7GameUiTownFocusChange,
  checkCiv7GameUiTownFocusReview,
  civ7GameUiTownFocusChangeCheckAvailable,
  civ7GameUiTownFocusChangeSendAvailable,
  civ7GameUiTownFocusReviewCheckAvailable,
  civ7GameUiTownFocusReviewSendAvailable,
  sendCiv7GameUiTownFocusChange,
  sendCiv7GameUiTownFocusReview,
} from "../../src/controller/game-ui/town-focus";

const cityId = { owner: 0, id: 65_536, type: 1 };
const otherCityId = { owner: 0, id: 65_537, type: 1 };
const notificationId = { owner: 0, id: 6, type: 20 };
const growthType = -284_569_333;
const projectType = -548_685_232;

describe("game UI town-focus atoms", () => {
  test("advertises each check and send capability independently", () => {
    const target = townFocusTarget();

    expect(civ7GameUiTownFocusChangeCheckAvailable(target)).toBe(true);
    expect(civ7GameUiTownFocusChangeSendAvailable(target)).toBe(true);
    expect(civ7GameUiTownFocusReviewCheckAvailable(target)).toBe(true);
    expect(civ7GameUiTownFocusReviewSendAvailable(target)).toBe(true);

    if (target.Game?.CityCommands != null) {
      target.Game.CityCommands.sendRequest = undefined;
    }
    expect(civ7GameUiTownFocusChangeCheckAvailable(target)).toBe(true);
    expect(civ7GameUiTownFocusChangeSendAvailable(target)).toBe(false);
    expect(civ7GameUiTownFocusReviewSendAvailable(target)).toBe(true);

    if (target.Game?.CityOperations != null) {
      target.Game.CityOperations.sendRequest = undefined;
    }
    expect(civ7GameUiTownFocusReviewCheckAvailable(target)).toBe(true);
    expect(civ7GameUiTownFocusReviewSendAvailable(target)).toBe(false);
  });

  test("does not require a CityOperations validator for review availability", () => {
    const target = townFocusTarget();

    expect(target.Game?.CityOperations).not.toHaveProperty("canStart");
    expect(civ7GameUiTownFocusReviewCheckAvailable(target)).toBe(true);
    expect(civ7GameUiTownFocusReviewSendAvailable(target)).toBe(true);
  });

  test("snapshots town identity, growth, blocker, and raw notification primitives", async () => {
    const result = await checkCiv7GameUiTownFocusChange(
      { cityId, growthType, projectType },
      townFocusTarget()
    );

    expect(result).toEqual({
      valid: true,
      result: { Success: true },
      snapshot: {
        cityId,
        city: {
          ok: true,
          value: {
            observedCityId: cityId,
            owner: cityId.owner,
            isTown: true,
            growthType: 101,
            projectType: 202,
          },
        },
        blocker: { ok: true, value: notificationId.type },
        blockingTownFocusNotification: {
          ok: true,
          value: {
            id: notificationId,
            type: notificationId.type,
            typeName: "NOTIFICATION_CHOOSE_TOWN_PROJECT",
            target: cityId,
          },
        },
      },
    });
  });

  test("retains unrelated current blocker evidence for service-owned semantic matching", async () => {
    const result = await checkCiv7GameUiTownFocusReview(
      { cityId },
      townFocusTarget({
        notificationTarget: otherCityId,
        notificationTypeName: "NOTIFICATION_UNRELATED_BLOCKER",
      })
    );

    expect(result.snapshot.blockingTownFocusNotification).toEqual({
      ok: true,
      value: {
        id: notificationId,
        type: notificationId.type,
        typeName: "NOTIFICATION_UNRELATED_BLOCKER",
        target: otherCityId,
      },
    });
  });

  test("keeps unknown native city and notification fields explicitly nullable", async () => {
    const result = await checkCiv7GameUiTownFocusReview(
      { cityId },
      townFocusTarget({
        city: {
          id: cityId,
          Growth: {},
        },
        notificationTarget: null,
        notificationType: null,
        notificationTypeName: null,
      })
    );

    expect(result.snapshot.city).toEqual({
      ok: true,
      value: {
        observedCityId: cityId,
        owner: cityId.owner,
        isTown: null,
        growthType: null,
        projectType: null,
      },
    });
    expect(result.snapshot.blockingTownFocusNotification).toEqual({
      ok: true,
      value: {
        id: notificationId,
        type: null,
        typeName: null,
        target: null,
      },
    });
  });

  test("captures missing runtime readers as failed probes instead of false clearance", async () => {
    const complete = townFocusTarget();
    const target: Civ7GameUiTownFocusTarget = {
      ...complete,
      Cities: undefined,
      Game: {
        ...complete.Game,
        Notifications: {
          ...complete.Game?.Notifications,
          getEndTurnBlockingType: undefined,
          findEndTurnBlocking: undefined,
          find: undefined,
        },
      },
    };

    const result = await checkCiv7GameUiTownFocusReview({ cityId }, target);

    expect(result.snapshot.city).toMatchObject({ ok: false });
    expect(result.snapshot.blocker).toMatchObject({ ok: false });
    expect(result.snapshot.blockingTownFocusNotification).toMatchObject({ ok: false });
    expect(civ7GameUiTownFocusReviewCheckAvailable(target)).toBe(false);
  });

  test("does not advertise review support without the notification target reader", async () => {
    const complete = townFocusTarget();
    const target: Civ7GameUiTownFocusTarget = {
      ...complete,
      Game: {
        ...complete.Game,
        Notifications: {
          ...complete.Game?.Notifications,
          find: undefined,
        },
      },
    };

    expect(civ7GameUiTownFocusReviewCheckAvailable(target)).toBe(false);
    expect(civ7GameUiTownFocusReviewSendAvailable(target)).toBe(false);
  });

  test("calls native change admission with exact official args and performs no mutation", async () => {
    const validations: unknown[] = [];
    const sends: unknown[] = [];
    const target = townFocusTarget({
      onValidate: (call) => validations.push(call),
      onChangeSend: (call) => sends.push(call),
    });

    const result = await checkCiv7GameUiTownFocusChange(
      { cityId, growthType, projectType },
      target
    );

    expect(result.valid).toBe(true);
    expect(validations).toEqual([
      {
        cityId,
        commandType: "CHANGE_GROWTH_MODE",
        args: { Type: growthType, ProjectType: projectType, City: cityId.id },
        queue: false,
      },
    ]);
    expect(sends).toEqual([]);
  });

  test("reports sent after a non-throwing change send returns false", async () => {
    const sends: unknown[] = [];
    const result = await sendCiv7GameUiTownFocusChange(
      { cityId, growthType, projectType },
      townFocusTarget({
        changeSendResult: false,
        changeGrowthOnSend: true,
        onChangeSend: (call) => sends.push(call),
      })
    );

    expect(result.sent).toBe(true);
    expect(result.before.city).toMatchObject({
      ok: true,
      value: { growthType: 101, projectType: 202 },
    });
    expect(result.after.city).toMatchObject({
      ok: true,
      value: { growthType, projectType },
    });
    expect(sends).toEqual([
      {
        cityId,
        commandType: "CHANGE_GROWTH_MODE",
        args: { Type: growthType, ProjectType: projectType, City: cityId.id },
      },
    ]);
  });

  test("does not send a town-focus change rejected by native admission", async () => {
    const sends: unknown[] = [];
    const result = await sendCiv7GameUiTownFocusChange(
      { cityId, growthType, projectType },
      townFocusTarget({
        validation: { Success: false },
        onChangeSend: (call) => sends.push(call),
      })
    );

    expect(result).toMatchObject({
      sent: false,
      validation: { valid: false, result: { Success: false } },
    });
    expect(sends).toEqual([]);
  });

  test("preserves inherited admission while exposing a JSON-safe validation result", async () => {
    const inherited = Object.create({ Success: true });
    const result = await sendCiv7GameUiTownFocusChange(
      { cityId, growthType, projectType },
      townFocusTarget({ validation: inherited })
    );

    expect(result).toMatchObject({
      sent: true,
      validation: { valid: true, result: {} },
    });
  });

  test("surfaces change validator exceptions before any send", async () => {
    const sends: unknown[] = [];
    await expect(
      sendCiv7GameUiTownFocusChange(
        { cityId, growthType, projectType },
        townFocusTarget({
          validationError: new Error("validator failed"),
          onChangeSend: (call) => sends.push(call),
        })
      )
    ).rejects.toMatchObject({
      message: "validator failed",
      dispatchStatus: "not-dispatched",
    });
    expect(sends).toEqual([]);
  });

  test("surfaces change send exceptions after exactly one dispatch attempt", async () => {
    const sends: unknown[] = [];
    await expect(
      sendCiv7GameUiTownFocusChange(
        { cityId, growthType, projectType },
        townFocusTarget({
          changeSendError: new Error("change send failed"),
          onChangeSend: (call) => sends.push(call),
        })
      )
    ).rejects.toMatchObject({
      message: "change send failed",
      dispatchStatus: "dispatched",
    });
    expect(sends).toHaveLength(1);
  });

  test("reads review state without invoking either native validator or sender", async () => {
    const validations: unknown[] = [];
    const sends: unknown[] = [];
    const target = townFocusTarget({
      onValidate: (call) => validations.push(call),
      onReviewSend: (call) => sends.push(call),
    });

    await expect(checkCiv7GameUiTownFocusReview({ cityId }, target)).resolves.toMatchObject({
      snapshot: { cityId },
    });
    expect(validations).toEqual([]);
    expect(sends).toEqual([]);
  });

  test("sends review exactly once with empty native args regardless of return value", async () => {
    const sends: unknown[] = [];
    const result = await sendCiv7GameUiTownFocusReview(
      { cityId },
      townFocusTarget({
        reviewSendResult: false,
        onReviewSend: (call) => sends.push(call),
      })
    );

    expect(result.sent).toBe(true);
    expect(sends).toEqual([
      {
        cityId,
        operationType: "CONSIDER_TOWN_PROJECT",
        args: {},
      },
    ]);
  });

  test("surfaces review send exceptions after exactly one dispatch attempt", async () => {
    const sends: unknown[] = [];
    await expect(
      sendCiv7GameUiTownFocusReview(
        { cityId },
        townFocusTarget({
          reviewSendError: new Error("review send failed"),
          onReviewSend: (call) => sends.push(call),
        })
      )
    ).rejects.toMatchObject({
      message: "review send failed",
      dispatchStatus: "dispatched",
    });
    expect(sends).toHaveLength(1);
  });

  test("advertises read procedures without send support and mutation procedures independently", async () => {
    const readOnlyTownFocus = townFocusTarget();
    if (readOnlyTownFocus.Game?.CityCommands != null) {
      readOnlyTownFocus.Game.CityCommands.sendRequest = undefined;
    }
    if (readOnlyTownFocus.Game?.CityOperations != null) {
      readOnlyTownFocus.Game.CityOperations.sendRequest = undefined;
    }

    const readOnlyContext = await createCiv7GameUiControllerContextFactory({
      target: controllerTarget(readOnlyTownFocus),
    })();
    expect(readOnlyContext.controller).toEqual({
      supportedReadProcedures: ["city.townFocus.change.check", "city.townFocus.review.check"],
      supportedMutationProcedures: [],
    });

    const reviewOnlyTownFocus = townFocusTarget();
    if (reviewOnlyTownFocus.Game?.CityCommands != null) {
      reviewOnlyTownFocus.Game.CityCommands.sendRequest = undefined;
    }
    const reviewContext = await createCiv7GameUiControllerContextFactory({
      target: controllerTarget(reviewOnlyTownFocus),
    })();
    expect(reviewContext.controller.supportedMutationProcedures).toEqual([
      "city.townFocus.review.request",
    ]);
  });
});

function townFocusTarget(
  options: Readonly<{
    validation?: unknown;
    validationError?: Error;
    changeSendResult?: unknown;
    changeSendError?: Error;
    reviewSendResult?: unknown;
    reviewSendError?: Error;
    changeGrowthOnSend?: boolean;
    city?: unknown;
    notificationTarget?: unknown;
    notificationType?: unknown;
    notificationTypeName?: string | null;
    onValidate?: (call: unknown) => void;
    onChangeSend?: (call: unknown) => void;
    onReviewSend?: (call: unknown) => void;
  }> = {}
): Civ7GameUiTownFocusTarget {
  let currentGrowthType = 101;
  let currentProjectType = 202;
  const currentNotificationType =
    options.notificationType === undefined ? notificationId.type : options.notificationType;

  return {
    CityCommandTypes: {
      CHANGE_GROWTH_MODE: "CHANGE_GROWTH_MODE",
    },
    CityOperationTypes: {
      CONSIDER_TOWN_PROJECT: "CONSIDER_TOWN_PROJECT",
    },
    Cities: {
      get: () =>
        options.city ?? {
          id: cityId,
          owner: cityId.owner,
          isTown: true,
          Growth: {
            growthType: currentGrowthType,
            projectType: currentProjectType,
          },
        },
    },
    GameContext: {
      localPlayerID: cityId.owner,
    },
    Game: {
      CityCommands: {
        canStart: (requestedCityId, commandType, args, queue) => {
          options.onValidate?.({
            cityId: requestedCityId,
            commandType,
            args,
            queue,
          });
          if (options.validationError != null) throw options.validationError;
          return options.validation ?? { Success: true };
        },
        sendRequest: (requestedCityId, commandType, args) => {
          options.onChangeSend?.({
            cityId: requestedCityId,
            commandType,
            args,
          });
          if (options.changeGrowthOnSend === true) {
            currentGrowthType = args.Type ?? currentGrowthType;
            currentProjectType = args.ProjectType ?? currentProjectType;
          }
          if (options.changeSendError != null) throw options.changeSendError;
          return options.changeSendResult;
        },
      },
      CityOperations: {
        sendRequest: (requestedCityId, operationType, args) => {
          options.onReviewSend?.({
            cityId: requestedCityId,
            operationType,
            args,
          });
          if (options.reviewSendError != null) throw options.reviewSendError;
          return options.reviewSendResult;
        },
      },
      Notifications: {
        getEndTurnBlockingType: () => currentNotificationType,
        findEndTurnBlocking: () => notificationId,
        find: () => ({
          Type: currentNotificationType,
          TypeName:
            options.notificationTypeName === undefined
              ? "NOTIFICATION_CHOOSE_TOWN_PROJECT"
              : options.notificationTypeName,
          Target: options.notificationTarget === undefined ? cityId : options.notificationTarget,
        }),
        getType: () => currentNotificationType,
        getTypeName: () =>
          options.notificationTypeName === undefined
            ? "NOTIFICATION_CHOOSE_TOWN_PROJECT"
            : options.notificationTypeName,
      },
    },
  };
}

function controllerTarget(townFocus: Civ7GameUiTownFocusTarget): Civ7GameUiRuntimeTarget {
  return {
    ...townFocus,
    UI: {
      isInGame: () => true,
    },
    Players: {
      getAliveHumanIds: () => [cityId.owner],
      getNumAliveHumans: () => 1,
    },
  };
}

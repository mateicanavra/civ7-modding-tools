import { describe, expect, test } from "vitest";

import {
  type Civ7GameUiRuntimeTarget,
  createCiv7GameUiControllerContextFactory,
} from "../../src/controller/game-ui";
import {
  type Civ7GameUiGovernmentTarget,
  checkCiv7GameUiCelebrationChoice,
  checkCiv7GameUiGovernmentChoice,
  civ7GameUiCelebrationChoiceCheckAvailable,
  civ7GameUiCelebrationChoiceSendAvailable,
  civ7GameUiGovernmentChoiceCheckAvailable,
  civ7GameUiGovernmentChoiceSendAvailable,
  sendCiv7GameUiCelebrationChoice,
  sendCiv7GameUiGovernmentChoice,
} from "../../src/controller/game-ui/government";

const governmentType = 7;
const governmentTypeName = "GOVERNMENT_CLASSICAL_REPUBLIC";
const activateAction = -1_326_475_004;
const sourceChoice = 101;
const goldenAgeType = -340_825_966;
const goldenAgeTypeName = "GOLDEN_AGE_CLASSICAL_REPUBLIC_1";
const notificationId = { owner: 0, id: 40, type: 20 };

describe("game UI government-domain choice atoms", () => {
  test("advertises check and send capabilities independently for both exact choices", () => {
    const target = governmentTarget();
    const sendRequest = target.Game?.PlayerOperations?.sendRequest;
    if (target.Game?.PlayerOperations != null) {
      target.Game.PlayerOperations.sendRequest = undefined;
    }

    expect(civ7GameUiGovernmentChoiceCheckAvailable(target)).toBe(true);
    expect(civ7GameUiGovernmentChoiceSendAvailable(target)).toBe(false);
    expect(civ7GameUiCelebrationChoiceCheckAvailable(target)).toBe(true);
    expect(civ7GameUiCelebrationChoiceSendAvailable(target)).toBe(false);

    if (target.Game?.PlayerOperations != null) {
      target.Game.PlayerOperations.sendRequest = sendRequest;
    }
    expect(civ7GameUiGovernmentChoiceSendAvailable(target)).toBe(true);
    expect(civ7GameUiCelebrationChoiceSendAvailable(target)).toBe(true);
  });

  test("does not advertise reads without required player or blocker observations", () => {
    const missingCulture = governmentTarget();
    if (missingCulture.Players != null) {
      missingCulture.Players.get = () => ({
        Culture: {
          getGoldenAgeChoices: () => [sourceChoice],
        },
        Happiness: {
          isInGoldenAge: () => false,
          getCurrentGoldenAge: () => null,
          getGoldenAgeTurnsLeft: () => null,
        },
      });
    }
    expect(civ7GameUiGovernmentChoiceCheckAvailable(missingCulture)).toBe(false);
    expect(civ7GameUiCelebrationChoiceCheckAvailable(missingCulture)).toBe(false);

    const missingHappiness = governmentTarget();
    if (missingHappiness.Players != null) {
      missingHappiness.Players.get = () => ({
        Culture: {
          getGovernmentType: () => null,
          getGoldenAgeChoices: () => [sourceChoice],
        },
      });
    }
    expect(civ7GameUiGovernmentChoiceCheckAvailable(missingHappiness)).toBe(true);
    expect(civ7GameUiCelebrationChoiceCheckAvailable(missingHappiness)).toBe(false);

    const missingBlockerRead = governmentTarget();
    if (missingBlockerRead.Game?.Notifications != null) {
      missingBlockerRead.Game.Notifications.findEndTurnBlocking = undefined;
    }
    expect(civ7GameUiGovernmentChoiceCheckAvailable(missingBlockerRead)).toBe(false);
    expect(civ7GameUiCelebrationChoiceCheckAvailable(missingBlockerRead)).toBe(false);

    const missingBlockerTypeName = governmentTarget();
    if (missingBlockerTypeName.Game?.Notifications != null) {
      missingBlockerTypeName.Game.Notifications.getTypeName = undefined;
    }
    expect(civ7GameUiGovernmentChoiceCheckAvailable(missingBlockerTypeName)).toBe(false);
    expect(civ7GameUiCelebrationChoiceCheckAvailable(missingBlockerTypeName)).toBe(false);
  });

  test("projects the four exact atoms through canonical controller procedures", async () => {
    const government = governmentTarget();
    const target = {
      ...government,
      UI: {
        isInGame: () => true,
      },
      Players: {
        ...government.Players,
        getAliveHumanIds: () => [0],
      },
    } as Civ7GameUiRuntimeTarget;
    const context = await createCiv7GameUiControllerContextFactory({ target })();

    expect(context.controller).toMatchObject({
      supportedReadProcedures: ["government.choice.check", "government.celebration.choice.check"],
      supportedMutationProcedures: [
        "government.choice.request",
        "government.celebration.choice.request",
      ],
    });
    await expect(
      context.directControl.checkCiv7GovernmentChoice({ governmentType }, {})
    ).resolves.toMatchObject({
      valid: true,
      snapshot: { localPlayerId: 0, activateAction },
    });
    await expect(
      context.directControl.checkCiv7CelebrationChoice({ goldenAgeType }, {})
    ).resolves.toMatchObject({
      valid: true,
      snapshot: { localPlayerId: 0 },
    });
  });

  test("checks government choice with ambient identity, Activate, and raw snapshots", async () => {
    const calls: NativeCall[] = [];
    const target = governmentTarget({ calls });

    const result = await checkCiv7GameUiGovernmentChoice({ governmentType }, target);

    expect(result).toEqual({
      valid: true,
      result: { Success: true, Reasons: [] },
      snapshot: governmentSnapshot(null),
    });
    expect(calls).toEqual([
      {
        kind: "check",
        playerId: 0,
        operationType: "CHANGE_GOVERNMENT",
        args: { GovernmentType: governmentType, Action: activateAction },
        queue: false,
      },
    ]);
    expectSemanticPolicyAbsent(result);
  });

  test("uses exact canStart as validation authority while retaining picker observations", async () => {
    const calls: NativeCall[] = [];
    const target = governmentTarget({ calls });

    const result = await sendCiv7GameUiGovernmentChoice(
      {
        governmentType: 99,
        expected: governmentSnapshot(null),
      },
      target
    );

    expect(result.sent).toBe(true);
    expect(result.validation).toEqual({
      valid: true,
      result: { Success: true, Reasons: [] },
    });
    expect(result.before.availableGovernments).toEqual([{ governmentType, governmentTypeName }]);
    expect(calls.filter((call) => call.kind === "send")).toEqual([
      {
        kind: "send",
        playerId: 0,
        operationType: "CHANGE_GOVERNMENT",
        args: { GovernmentType: 99, Action: activateAction },
      },
    ]);
  });

  test("refuses dispatch when raw government admission evidence changed", async () => {
    const calls: NativeCall[] = [];
    const target = governmentTarget({ calls });

    await expect(
      sendCiv7GameUiGovernmentChoice(
        {
          governmentType,
          expected: governmentSnapshot(99),
        },
        target
      )
    ).rejects.toMatchObject({
      name: "Civ7DirectControlError",
      code: "command-failed",
      dispatchStatus: "not-dispatched",
      message: "Government choice admission evidence changed before dispatch.",
    });
    expect(calls).toEqual([]);
  });

  test("refuses dispatch when raw celebration admission evidence changed", async () => {
    const calls: NativeCall[] = [];
    const target = governmentTarget({ calls });

    await expect(
      sendCiv7GameUiCelebrationChoice(
        {
          goldenAgeType,
          expected: celebrationSnapshot(true, goldenAgeType, 10),
        },
        target
      )
    ).rejects.toMatchObject({
      name: "Civ7DirectControlError",
      code: "command-failed",
      dispatchStatus: "not-dispatched",
      message: "Celebration choice admission evidence changed before dispatch.",
    });
    expect(calls).toEqual([]);
  });

  test("sends government choice once and snapshots the native state transition", async () => {
    const calls: NativeCall[] = [];
    const target = governmentTarget({ calls });

    const result = await sendCiv7GameUiGovernmentChoice(
      {
        governmentType,
        expected: governmentSnapshot(null),
      },
      target
    );

    expect(result).toEqual({
      sent: true,
      validation: {
        valid: true,
        result: { Success: true, Reasons: [] },
      },
      before: governmentSnapshot(null),
      after: governmentSnapshot(governmentType),
    });
    expect(calls.filter((call) => call.kind === "send")).toEqual([
      {
        kind: "send",
        playerId: 0,
        operationType: "CHANGE_GOVERNMENT",
        args: { GovernmentType: governmentType, Action: activateAction },
      },
    ]);
    expectSemanticPolicyAbsent(result);
  });

  test("checks and sends a hashed celebration choice with raw happiness evidence", async () => {
    const calls: NativeCall[] = [];
    const target = governmentTarget({ calls });

    const checked = await checkCiv7GameUiCelebrationChoice({ goldenAgeType }, target);
    expect(checked).toEqual({
      valid: true,
      result: { Success: true, Reasons: [] },
      snapshot: celebrationSnapshot(false, null, null),
    });

    const sent = await sendCiv7GameUiCelebrationChoice(
      {
        goldenAgeType,
        expected: celebrationSnapshot(false, null, null),
      },
      target
    );
    expect(sent).toEqual({
      sent: true,
      validation: {
        valid: true,
        result: { Success: true, Reasons: [] },
      },
      before: celebrationSnapshot(false, null, null),
      after: celebrationSnapshot(true, goldenAgeType, 10),
    });
    expect(calls.filter((call) => call.kind === "send")).toEqual([
      {
        kind: "send",
        playerId: 0,
        operationType: "CHOOSE_GOLDEN_AGE",
        args: { GoldenAgeType: goldenAgeType },
      },
    ]);
    expectSemanticPolicyAbsent(sent);
  });

  test("uses raw native notification identity for lookups and serializes only the snapshot copy", async () => {
    const target = governmentTarget();
    const rawNotificationId = Object.assign(Object.create(null), notificationId);
    const lookupIds: unknown[] = [];
    if (target.Game?.Notifications != null) {
      target.Game.Notifications.findEndTurnBlocking = () => rawNotificationId;
      target.Game.Notifications.find = (id) => {
        lookupIds.push(id);
        return {
          Type: 111,
          TypeName: "NOTIFICATION_CHOOSE_GOVERNMENT",
          Target: { owner: -1, id: -1, type: 0 },
        };
      };
      target.Game.Notifications.getType = (id) => {
        lookupIds.push(id);
        return 111;
      };
    }

    const result = await checkCiv7GameUiGovernmentChoice({ governmentType }, target);

    expect(lookupIds).toEqual([rawNotificationId, rawNotificationId]);
    expect(lookupIds.every((id) => id === rawNotificationId)).toBe(true);
    expect(result.snapshot.blockingNotification).toMatchObject({
      ok: true,
      value: { id: notificationId },
    });
    if (result.snapshot.blockingNotification.ok) {
      expect(result.snapshot.blockingNotification.value?.id).not.toBe(rawNotificationId);
    }
  });

  test("captures one blocker identity for the paired notification observation", async () => {
    const target = governmentTarget();
    let blockerReads = 0;
    let observedBlockerType: unknown;
    if (target.Game?.Notifications != null) {
      target.Game.Notifications.getEndTurnBlockingType = () => {
        blockerReads += 1;
        return blockerReads === 1 ? 111 : 222;
      };
      target.Game.Notifications.findEndTurnBlocking = (_playerId, blockerType) => {
        observedBlockerType = blockerType;
        return notificationId;
      };
    }

    const result = await checkCiv7GameUiGovernmentChoice({ governmentType }, target);

    expect(blockerReads).toBe(1);
    expect(observedBlockerType).toBe(111);
    expect(result.snapshot.blocker).toEqual({ ok: true, value: 111 });
  });

  test("labels failures after sendRequest invocation as dispatched", async () => {
    const target = governmentTarget({ failSnapshotAfterSend: true });

    await expect(
      sendCiv7GameUiGovernmentChoice(
        {
          governmentType,
          expected: governmentSnapshot(null),
        },
        target
      )
    ).rejects.toMatchObject({
      name: "Civ7DirectControlError",
      code: "command-failed",
      dispatchStatus: "dispatched",
    });
  });
});

type NativeCall = Readonly<{
  kind: "check" | "send";
  playerId: number;
  operationType: unknown;
  args: Readonly<Record<string, number>>;
  queue?: boolean;
}>;

function governmentTarget(
  options: Readonly<{
    calls?: NativeCall[];
    failSnapshotAfterSend?: boolean;
  }> = {}
): Civ7GameUiGovernmentTarget {
  let currentGovernmentType: number | null = null;
  let inGoldenAge = false;
  let currentGoldenAgeSource: number | null = null;
  let goldenAgeTurnsLeft: number | null = null;
  let sent = false;

  const culture = {
    getGovernmentType: () => {
      if (sent && options.failSnapshotAfterSend === true) {
        throw new Error("post-send government snapshot failed");
      }
      return currentGovernmentType;
    },
    getGoldenAgeChoices: () => [sourceChoice],
  };
  const happiness = {
    isInGoldenAge: () => inGoldenAge,
    getCurrentGoldenAge: () => currentGoldenAgeSource,
    getGoldenAgeTurnsLeft: () => goldenAgeTurnsLeft,
  };

  return {
    Database: {
      makeHash: (value) => (value === goldenAgeTypeName ? goldenAgeType : 0),
    },
    Game: {
      Notifications: {
        getEndTurnBlockingType: () => 111,
        findEndTurnBlocking: () => notificationId,
        find: () => ({
          Type: 111,
          TypeName: "NOTIFICATION_CHOOSE_GOVERNMENT",
          Target: { owner: -1, id: -1, type: 0 },
        }),
        getType: () => 111,
        getTypeName: () => "NOTIFICATION_CHOOSE_GOVERNMENT",
      },
      PlayerOperations: {
        canStart: (playerId, operationType, args, queue) => {
          options.calls?.push({
            kind: "check",
            playerId,
            operationType,
            args,
            queue,
          });
          return { Success: true, Reasons: [] };
        },
        sendRequest: (playerId, operationType, args) => {
          options.calls?.push({
            kind: "send",
            playerId,
            operationType,
            args,
          });
          sent = true;
          if (operationType === "CHANGE_GOVERNMENT") {
            currentGovernmentType = args.GovernmentType ?? null;
          } else {
            inGoldenAge = true;
            currentGoldenAgeSource = sourceChoice;
            goldenAgeTurnsLeft = 10;
          }
          return false;
        },
      },
    },
    GameContext: {
      localPlayerID: 0,
    },
    GameInfo: {
      StartingGovernments: [{ GovernmentType: governmentTypeName }],
      Governments: {
        lookup: () => ({
          $index: governmentType,
          GovernmentType: governmentTypeName,
        }),
      },
      GoldenAges: {
        lookup: () => ({
          GoldenAgeType: goldenAgeTypeName,
        }),
      },
    },
    PlayerOperationParameters: {
      Activate: activateAction,
    },
    PlayerOperationTypes: {
      CHANGE_GOVERNMENT: "CHANGE_GOVERNMENT",
      CHOOSE_GOLDEN_AGE: "CHOOSE_GOLDEN_AGE",
    },
    Players: {
      get: () => ({
        Culture: culture,
        Happiness: happiness,
      }),
    },
  };
}

function governmentSnapshot(currentGovernmentType: number | null) {
  return {
    localPlayerId: 0,
    currentGovernmentType,
    availableGovernments: [{ governmentType, governmentTypeName }],
    activateAction,
    ...blockerSnapshot(),
  };
}

function celebrationSnapshot(
  isInGoldenAge: boolean,
  currentGoldenAgeType: number | null,
  goldenAgeTurnsLeft: number | null
) {
  return {
    localPlayerId: 0,
    currentGovernmentType: null,
    availableGoldenAges: [{ sourceChoice, goldenAgeType, goldenAgeTypeName }],
    isInGoldenAge,
    currentGoldenAgeType,
    goldenAgeTurnsLeft,
    ...blockerSnapshot(),
  };
}

function blockerSnapshot() {
  return {
    blocker: { ok: true as const, value: 111 },
    blockingNotification: {
      ok: true as const,
      value: {
        id: notificationId,
        type: 111,
        typeName: "NOTIFICATION_CHOOSE_GOVERNMENT",
        target: { owner: -1, id: -1, type: 0 },
      },
    },
  };
}

function expectSemanticPolicyAbsent(result: unknown) {
  const serialized = JSON.stringify(result);
  expect(serialized).not.toContain("postcondition");
  expect(serialized).not.toContain("classification");
  expect(serialized).not.toContain("confirmed");
  expect(serialized).not.toContain("nextSteps");
  expect(serialized).not.toContain("noRepeat");
  expect(serialized).not.toContain("poll");
}

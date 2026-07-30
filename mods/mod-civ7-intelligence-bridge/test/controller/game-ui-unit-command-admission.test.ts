import { describe, expect, test } from "vitest";

import {
  type Civ7GameUiUnitCommandTarget,
  checkCiv7GameUiUnitUpgrade,
  sendCiv7GameUiUnitUpgrade,
} from "../../src/controller/game-ui/unit-command";

const unitId = { owner: 0, id: 65_536, type: 26 };

describe("game UI unit command low-level admission", () => {
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
  ])("rejects %s from check and send without dispatching", async (_label, canStartResult) => {
    const sends: unknown[] = [];
    const target = unitCommandTarget(canStartResult, sends);

    await expect(checkCiv7GameUiUnitUpgrade({ unitId }, target)).rejects.toThrow(
      /canStart returned (?:an unrecognized result|a non-boolean \w+ field)/
    );
    await expect(sendCiv7GameUiUnitUpgrade({ unitId }, target)).rejects.toThrow(
      /canStart returned (?:an unrecognized result|a non-boolean \w+ field)/
    );
    expect(sends).toEqual([]);
  });

  test.each([
    [true, true],
    [false, false],
    [{ Success: true }, true],
    [{ Success: false }, false],
    [{ success: true }, true],
    [{ success: false }, false],
    [{ canStart: true }, true],
    [{ canStart: false }, false],
  ])("recognizes only explicit boolean admission result %#", async (canStartResult, expected) => {
    await expect(
      checkCiv7GameUiUnitUpgrade({ unitId }, unitCommandTarget(canStartResult, []))
    ).resolves.toMatchObject({
      valid: expected,
      result: canStartResult,
    });
  });

  test("preserves validator exceptions and never dispatches", async () => {
    const sends: unknown[] = [];
    const target = unitCommandTarget(true, sends);
    const validationFailure = new Error("validator failed");
    if (target.Game?.UnitCommands != null) {
      target.Game.UnitCommands.canStart = () => {
        throw validationFailure;
      };
    }

    await expect(sendCiv7GameUiUnitUpgrade({ unitId }, target)).rejects.toBe(validationFailure);
    expect(sends).toEqual([]);
  });
});

function unitCommandTarget(canStartResult: unknown, sends: unknown[]): Civ7GameUiUnitCommandTarget {
  return {
    Game: {
      Notifications: {
        getEndTurnBlockingType: () => null,
      },
      UnitCommands: {
        canStart: () => canStartResult,
        sendRequest: (...args: unknown[]) => sends.push(args),
      },
    },
    GameContext: {
      localPlayerID: 0,
    },
    UI: {
      Player: {
        getFirstReadyUnit: () => unitId,
        getHeadSelectedUnit: () => unitId,
      },
    },
    UnitCommandTypes: {
      UNITCOMMAND_UPGRADE: "UNITCOMMAND_UPGRADE",
      UNITCOMMAND_RESETTLE: "UNITCOMMAND_RESETTLE",
    },
    Units: {
      get: () => null,
    },
  };
}

import { runInNewContext } from "node:vm";
import { describe, expect, test } from "vitest";

import { unitCommandWireSource } from "../src/play/unit/commands";

const unitId = { owner: 0, id: 65_536, type: 26 };
const input = {
  unitId,
  operationType: "UNITCOMMAND_UPGRADE",
  args: {},
};

describe("unit command low-level admission", () => {
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
  ])("rejects %s from check and send without dispatching", (_label, canStartResult) => {
    for (const atom of ["checkUnitCommand", "sendUnitCommand"] as const) {
      const sends: unknown[] = [];
      expect(() => runUnitCommandAtom(atom, canStartResult, sends)).toThrow(
        /canStart returned (?:an unrecognized result|a non-boolean \w+ field)/
      );
      expect(sends, atom).toEqual([]);
    }
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
  ])("recognizes only explicit boolean admission result %#", (canStartResult, expected) => {
    expect(runUnitCommandAtom("checkUnitCommand", canStartResult, [])).toMatchObject({
      valid: expected,
      result: canStartResult,
    });
  });

  test("preserves validator exceptions and never dispatches", () => {
    const sends: unknown[] = [];
    const validationFailure = new Error("validator failed");

    expect(() => runUnitCommandAtom("sendUnitCommand", validationFailure, sends, true)).toThrow(
      "validator failed"
    );
    expect(sends).toEqual([]);
  });
});

function runUnitCommandAtom(
  atom: "checkUnitCommand" | "sendUnitCommand",
  canStartResult: unknown,
  sends: unknown[],
  throwValidation = false
): unknown {
  return runInNewContext(
    `(() => {
      ${unitCommandWireSource()}
      return ${atom}(${JSON.stringify(input)});
    })()`,
    {
      Array,
      Game: {
        UnitCommands: {
          canStart: () => {
            if (throwValidation) throw canStartResult;
            return canStartResult;
          },
          sendRequest: (...args: unknown[]) => sends.push(args),
        },
      },
      GameContext: { localPlayerID: 0 },
      UnitCommandTypes: {
        UNITCOMMAND_UPGRADE: "UNITCOMMAND_UPGRADE",
      },
      Units: { get: () => null },
      UI: {
        Player: {
          getHeadSelectedUnit: () => null,
          getFirstReadyUnit: () => null,
        },
      },
    }
  );
}

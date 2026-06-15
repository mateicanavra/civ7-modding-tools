import { describe, expect, test } from "vitest";

import type { Civ7ComponentId } from "../src/civ7-component-id";
import { requestCiv7TownFocus } from "../src/play/city/town-focus-request";
import type { Civ7OperationRequestResult } from "../src/play/operations/validate-request";
import { townFocusProofPostcondition } from "../src/proof/town-focus-proof-policy";

const cityId: Civ7ComponentId = { owner: 0, id: 131_073, type: 1 };

describe("town focus direct-control request", () => {
  test("maps town focus changes to CHANGE_GROWTH_MODE city commands", async () => {
    const calls: unknown[] = [];
    const result = await requestCiv7TownFocus(
      {
        kind: "town-focus-change",
        cityId,
        growthType: -284_569_333,
        projectType: -548_685_232,
      },
      {},
      {
        requestCityCommand: async (input) => {
          calls.push(input);
          return operationResult("CHANGE_GROWTH_MODE", input.args, true);
        },
        requestCityOperation: async () => {
          throw new Error("city operation should not run");
        },
        invalidIntegerError: (field) => {
          throw new Error(`${field} invalid`);
        },
      }
    );

    expect(calls).toEqual([
      {
        cityId,
        operationType: "CHANGE_GROWTH_MODE",
        args: {
          Type: -284_569_333,
          ProjectType: -548_685_232,
          City: 131_073,
        },
      },
    ]);
    expect(result).toMatchObject({
      kind: "town-focus-change",
      cityId,
      growthType: -284_569_333,
      projectType: -548_685_232,
      city: 131_073,
      sent: true,
      verified: false,
      postcondition: {
        classification: "pending-runtime-proof",
      },
    });
    expect(townFocusProofPostcondition(result)).toMatchObject({
      classification: "pending-runtime-proof",
      outcome: "unknown",
      confidence: "pending-runtime-proof",
      noRepeatAfterUnverified: true,
    });
  });

  test("maps town project review closeout to CONSIDER_TOWN_PROJECT city operations", async () => {
    const calls: unknown[] = [];
    const result = await requestCiv7TownFocus(
      {
        kind: "town-focus-review",
        cityId,
      },
      {},
      {
        requestCityCommand: async () => {
          throw new Error("city command should not run");
        },
        requestCityOperation: async (input) => {
          calls.push(input);
          return operationResult("CONSIDER_TOWN_PROJECT", input.args, true);
        },
        invalidIntegerError: (field) => {
          throw new Error(`${field} invalid`);
        },
      }
    );

    expect(calls).toEqual([
      {
        cityId,
        operationType: "CONSIDER_TOWN_PROJECT",
        args: {},
      },
    ]);
    expect(result).toMatchObject({
      kind: "town-focus-review",
      cityId,
      sent: true,
      verified: false,
      postcondition: {
        classification: "pending-runtime-proof",
      },
    });
  });

  test("keeps validator-blocked requests not-sent and no-repeat guarded", async () => {
    const result = await requestCiv7TownFocus(
      {
        kind: "town-focus-change",
        cityId,
        growthType: -284_569_333,
        projectType: -548_685_232,
      },
      {},
      {
        requestCityCommand: async (input) =>
          operationResult("CHANGE_GROWTH_MODE", input.args, false),
        requestCityOperation: async () => {
          throw new Error("city operation should not run");
        },
        invalidIntegerError: (field) => {
          throw new Error(`${field} invalid`);
        },
      }
    );

    expect(result.sent).toBe(false);
    expect(result.verified).toBe(false);
    expect(townFocusProofPostcondition(result)).toMatchObject({
      classification: "not-sent",
      outcome: "not-sent",
      confidence: "unverified",
      noRepeatAfterUnverified: true,
    });
  });

  test("rejects non-integer town focus arguments before operation construction", async () => {
    await expect(
      requestCiv7TownFocus(
        {
          kind: "town-focus-change",
          cityId,
          growthType: 1.5,
          projectType: -548_685_232,
        },
        {},
        {
          requestCityCommand: async () => {
            throw new Error("city command should not run");
          },
          requestCityOperation: async () => {
            throw new Error("city operation should not run");
          },
          invalidIntegerError: (field) => {
            throw new Error(`${field} invalid`);
          },
        }
      )
    ).rejects.toThrow("growthType invalid");
  });
});

function operationResult(
  operationType: string,
  args: Readonly<Record<string, number>>,
  valid: boolean
): Civ7OperationRequestResult {
  return {
    before: validationResult(operationType, args, valid),
    after: validationResult(operationType, args, valid),
    sent: valid,
    verified: valid,
  };
}

function validationResult(
  operationType: string,
  args: Readonly<Record<string, number>>,
  valid: boolean
): Civ7OperationRequestResult["before"] {
  return {
    host: "127.0.0.1",
    port: 4318,
    state: { id: "65535", name: "Tuner", role: "tuner" },
    family: operationType === "CHANGE_GROWTH_MODE" ? "city-command" : "city-operation",
    operationType,
    enumValue: operationType,
    target: { cityId },
    args,
    valid,
    result: { Success: valid },
  };
}

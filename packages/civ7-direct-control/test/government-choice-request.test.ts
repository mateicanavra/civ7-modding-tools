import { describe, expect, test } from "vitest";

import {
  CIV7_GOVERNMENT_ACTIVATE_ACTION,
  governmentChoiceProofPostcondition,
  requestCiv7GovernmentDomainChoice,
} from "../src/index";
import type { Civ7OperationRequestResult } from "../src/play/operations/validate-request";

describe("government-domain choice requests", () => {
  test("maps government choices to CHANGE_GOVERNMENT with the default activate action", async () => {
    const result = await requestCiv7GovernmentDomainChoice(
      { kind: "government", playerId: 0, governmentType: 2 },
      { timeoutMs: 1_000 },
      {
        validatePlayerId: (playerId) => {
          if (!Number.isInteger(playerId)) throw new Error("invalid player");
        },
        requestPlayerOperation: async (input, options) => {
          expect(options).toEqual({ timeoutMs: 1_000 });
          expect(input).toEqual({
            playerId: 0,
            operationType: "CHANGE_GOVERNMENT",
            args: {
              GovernmentType: 2,
              Action: CIV7_GOVERNMENT_ACTIVATE_ACTION,
            },
          });
          return operationResult({
            sent: true,
            operationType: "CHANGE_GOVERNMENT",
            playerId: 0,
            args: {
              GovernmentType: 2,
              Action: CIV7_GOVERNMENT_ACTIVATE_ACTION,
            },
          });
        },
        invalidIntegerError: (field) => {
          throw new Error(`${field} invalid`);
        },
      }
    );

    expect(result).toMatchObject({
      kind: "government",
      playerId: 0,
      governmentType: 2,
      action: CIV7_GOVERNMENT_ACTIVATE_ACTION,
      sent: true,
      verified: false,
      postcondition: {
        classification: "pending-runtime-proof",
      },
    });
    expect(governmentChoiceProofPostcondition(result)).toMatchObject({
      classification: "pending-runtime-proof",
      outcome: "unknown",
      confidence: "pending-runtime-proof",
      noRepeatAfterUnverified: true,
    });
  });

  test("preserves explicit government action overrides", async () => {
    const result = await requestCiv7GovernmentDomainChoice(
      { kind: "government", playerId: 0, governmentType: 2, action: 42 },
      {},
      {
        validatePlayerId: () => {},
        requestPlayerOperation: async (input) => {
          expect(input).toEqual({
            playerId: 0,
            operationType: "CHANGE_GOVERNMENT",
            args: {
              GovernmentType: 2,
              Action: 42,
            },
          });
          return operationResult({
            sent: true,
            operationType: "CHANGE_GOVERNMENT",
            playerId: 0,
            args: {
              GovernmentType: 2,
              Action: 42,
            },
          });
        },
        invalidIntegerError: (field) => {
          throw new Error(`${field} invalid`);
        },
      }
    );

    expect(result).toMatchObject({
      kind: "government",
      governmentType: 2,
      action: 42,
      sent: true,
    });
  });

  test("maps celebration choices to CHOOSE_GOLDEN_AGE", async () => {
    const result = await requestCiv7GovernmentDomainChoice(
      { kind: "celebration", playerId: 0, goldenAgeType: -340_825_966 },
      {},
      {
        validatePlayerId: () => {},
        requestPlayerOperation: async (input) => {
          expect(input).toEqual({
            playerId: 0,
            operationType: "CHOOSE_GOLDEN_AGE",
            args: { GoldenAgeType: -340_825_966 },
          });
          return operationResult({
            sent: true,
            operationType: "CHOOSE_GOLDEN_AGE",
            playerId: 0,
            args: { GoldenAgeType: -340_825_966 },
          });
        },
        invalidIntegerError: (field) => {
          throw new Error(`${field} invalid`);
        },
      }
    );

    expect(result).toMatchObject({
      kind: "celebration",
      goldenAgeType: -340_825_966,
      sent: true,
      verified: false,
      postcondition: {
        classification: "pending-runtime-proof",
      },
    });
  });

  test("projects validator-blocked government-domain choices as not-sent", async () => {
    const result = await requestCiv7GovernmentDomainChoice(
      { kind: "celebration", playerId: 0, goldenAgeType: -340_825_966 },
      {},
      {
        validatePlayerId: () => {},
        requestPlayerOperation: async () =>
          operationResult({
            sent: false,
            valid: false,
            operationType: "CHOOSE_GOLDEN_AGE",
            playerId: 0,
            args: { GoldenAgeType: -340_825_966 },
          }),
        invalidIntegerError: (field) => {
          throw new Error(`${field} invalid`);
        },
      }
    );

    expect(result).toMatchObject({
      sent: false,
      verified: false,
      beforeValidation: { valid: false },
      afterValidation: { valid: false },
      postcondition: {
        classification: "not-sent",
      },
    });
    expect(governmentChoiceProofPostcondition(result)).toMatchObject({
      classification: "not-sent",
      outcome: "not-sent",
      confidence: "unverified",
      noRepeatAfterUnverified: true,
    });
  });

  test("rejects non-integer government-domain inputs before command construction", async () => {
    await expect(
      requestCiv7GovernmentDomainChoice(
        { kind: "government", playerId: 0, governmentType: 1.5 },
        {},
        {
          validatePlayerId: () => {},
          requestPlayerOperation: async () => {
            throw new Error("should not send");
          },
          invalidIntegerError: (field) => {
            throw new Error(`${field} invalid`);
          },
        }
      )
    ).rejects.toThrow("governmentType invalid");

    await expect(
      requestCiv7GovernmentDomainChoice(
        { kind: "government", playerId: 0, governmentType: 1, action: 1.5 },
        {},
        {
          validatePlayerId: () => {},
          requestPlayerOperation: async () => {
            throw new Error("should not send");
          },
          invalidIntegerError: (field) => {
            throw new Error(`${field} invalid`);
          },
        }
      )
    ).rejects.toThrow("action invalid");

    await expect(
      requestCiv7GovernmentDomainChoice(
        { kind: "celebration", playerId: 0, goldenAgeType: 1.5 },
        {},
        {
          validatePlayerId: () => {},
          requestPlayerOperation: async () => {
            throw new Error("should not send");
          },
          invalidIntegerError: (field) => {
            throw new Error(`${field} invalid`);
          },
        }
      )
    ).rejects.toThrow("goldenAgeType invalid");
  });
});

function operationResult(
  options: Readonly<{
    sent: boolean;
    valid?: boolean;
    operationType: string;
    playerId: number;
    args: Readonly<Record<string, number>>;
  }>
): Civ7OperationRequestResult {
  const valid = options.valid ?? true;
  return {
    before: validationResult(options, valid),
    after: validationResult(options, valid),
    sent: options.sent,
    verified: options.sent && valid,
  };
}

function validationResult(
  options: Readonly<{
    operationType: string;
    playerId: number;
    args: Readonly<Record<string, number>>;
  }>,
  valid: boolean
): Civ7OperationRequestResult["before"] {
  return {
    host: "127.0.0.1",
    port: 4318,
    state: { id: "1", name: "Tuner", role: "tuner" },
    family: "player-operation",
    operationType: options.operationType,
    enumValue: options.operationType,
    target: { playerId: options.playerId },
    args: options.args,
    valid,
    result: { Success: valid },
  };
}

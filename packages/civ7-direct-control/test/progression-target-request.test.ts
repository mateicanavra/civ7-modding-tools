import { describe, expect, test } from "vitest";

import {
  progressionTargetProofPostcondition,
  requestCiv7ProgressionTarget,
} from "../src/index";
import type { Civ7OperationRequestResult } from "../src/play/operations/validate-request";

describe("progression target requests", () => {
  test("maps technology targets to the source-owned player operation and keeps proof pending", async () => {
    const result = await requestCiv7ProgressionTarget(
      { kind: "technology", playerId: 0, node: 18_001 },
      { timeoutMs: 1_000 },
      {
        validatePlayerId: (playerId) => {
          if (!Number.isInteger(playerId)) throw new Error("invalid player");
        },
        requestPlayerOperation: async (input, options) => {
          expect(options).toEqual({ timeoutMs: 1_000 });
          expect(input).toEqual({
            playerId: 0,
            operationType: "SET_TECH_TREE_TARGET_NODE",
            args: { ProgressionTreeNodeType: 18_001 },
          });
          return operationResult({
            sent: true,
            operationType: "SET_TECH_TREE_TARGET_NODE",
            playerId: 0,
            node: 18_001,
          });
        },
        invalidNodeError: () => {
          throw new Error("invalid node");
        },
      },
    );

    expect(result).toMatchObject({
      kind: "technology",
      playerId: 0,
      node: 18_001,
      sent: true,
      verified: false,
      postcondition: {
        classification: "pending-runtime-proof",
      },
    });
    expect(progressionTargetProofPostcondition(result)).toMatchObject({
      classification: "pending-runtime-proof",
      outcome: "unknown",
      confidence: "pending-runtime-proof",
      noRepeatAfterUnverified: true,
    });
  });

  test("maps culture targets to the source-owned player operation", async () => {
    const result = await requestCiv7ProgressionTarget(
      { kind: "culture", playerId: 0, node: 27_001 },
      {},
      {
        validatePlayerId: () => {},
        requestPlayerOperation: async (input) => {
          expect(input).toEqual({
            playerId: 0,
            operationType: "SET_CULTURE_TREE_TARGET_NODE",
            args: { ProgressionTreeNodeType: 27_001 },
          });
          return operationResult({
            sent: true,
            operationType: "SET_CULTURE_TREE_TARGET_NODE",
            playerId: 0,
            node: 27_001,
          });
        },
        invalidNodeError: () => {
          throw new Error("invalid node");
        },
      },
    );

    expect(result.postcondition).toMatchObject({
      classification: "pending-runtime-proof",
    });
  });

  test("projects validator-blocked progression target requests as not-sent", async () => {
    const result = await requestCiv7ProgressionTarget(
      { kind: "technology", playerId: 0, node: 18_001 },
      {},
      {
        validatePlayerId: () => {},
        requestPlayerOperation: async () =>
          operationResult({
            sent: false,
            valid: false,
            operationType: "SET_TECH_TREE_TARGET_NODE",
            playerId: 0,
            node: 18_001,
          }),
        invalidNodeError: () => {
          throw new Error("invalid node");
        },
      },
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
    expect(progressionTargetProofPostcondition(result)).toMatchObject({
      classification: "not-sent",
      outcome: "not-sent",
      confidence: "unverified",
      noRepeatAfterUnverified: true,
    });
  });

  test("rejects non-integer target nodes before command construction", async () => {
    await expect(
      requestCiv7ProgressionTarget(
        { kind: "technology", playerId: 0, node: 1.5 },
        {},
        {
          validatePlayerId: () => {},
          requestPlayerOperation: async () => {
            throw new Error("should not send");
          },
          invalidNodeError: () => {
            throw new Error("invalid node");
          },
        },
      ),
    ).rejects.toThrow("invalid node");
  });
});

function operationResult(
  options: Readonly<{
    sent: boolean;
    valid?: boolean;
    operationType: string;
    playerId: number;
    node: number;
  }>,
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
    node: number;
  }>,
  valid: boolean,
): Civ7OperationRequestResult["before"] {
  return {
    host: "127.0.0.1",
    port: 4318,
    state: { id: "1", name: "Tuner", role: "tuner" },
    family: "player-operation",
    operationType: options.operationType,
    enumValue: options.operationType,
    target: { playerId: options.playerId },
    args: { ProgressionTreeNodeType: options.node },
    valid,
    result: { Success: valid },
  };
}

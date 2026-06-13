import { describe, expect, test } from "vitest";

import {
  progressionPlayerChoiceProofPostcondition,
  requestCiv7ProgressionPlayerChoice,
} from "../src/index";
import type { Civ7OperationRequestResult } from "../src/play/operations/validate-request";

describe("progression player-choice requests", () => {
  test("maps attribute purchases to BUY_ATTRIBUTE_TREE_NODE", async () => {
    const result = await requestCiv7ProgressionPlayerChoice(
      { kind: "attribute-purchase", playerId: 0, node: 20 },
      { timeoutMs: 1_000 },
      dependencies((input, options) => {
        expect(options).toEqual({ timeoutMs: 1_000 });
        expect(input).toEqual({
          playerId: 0,
          operationType: "BUY_ATTRIBUTE_TREE_NODE",
          args: { ProgressionTreeNodeType: 20 },
        });
        return operationResult({
          sent: true,
          operationType: "BUY_ATTRIBUTE_TREE_NODE",
          playerId: 0,
          args: { ProgressionTreeNodeType: 20 },
        });
      })
    );

    expect(result).toMatchObject({
      kind: "attribute-purchase",
      playerId: 0,
      node: 20,
      sent: true,
      verified: false,
      postcondition: {
        classification: "pending-runtime-proof",
      },
    });
    expect(progressionPlayerChoiceProofPostcondition(result)).toMatchObject({
      classification: "pending-runtime-proof",
      outcome: "unknown",
      confidence: "pending-runtime-proof",
      noRepeatAfterUnverified: true,
    });
  });

  test("maps attribute review closeout to CONSIDER_ASSIGN_ATTRIBUTE", async () => {
    const result = await requestCiv7ProgressionPlayerChoice(
      { kind: "attribute-review", playerId: 0 },
      {},
      dependencies((input) => {
        expect(input).toEqual({
          playerId: 0,
          operationType: "CONSIDER_ASSIGN_ATTRIBUTE",
          args: {},
        });
        return operationResult({
          sent: true,
          operationType: "CONSIDER_ASSIGN_ATTRIBUTE",
          playerId: 0,
          args: {},
        });
      })
    );

    expect(result).toMatchObject({
      kind: "attribute-review",
      playerId: 0,
      sent: true,
      verified: false,
    });
  });

  test("maps tradition changes and review closeout operations", async () => {
    const sentInputs: unknown[] = [];
    const deps = dependencies((input) => {
      sentInputs.push(input);
      return operationResult({
        sent: true,
        operationType: input.operationType,
        playerId: input.playerId,
        args: input.args,
      });
    });

    const change = await requestCiv7ProgressionPlayerChoice(
      {
        kind: "tradition-change",
        playerId: 0,
        traditionType: -331_546_976,
        action: -1_326_475_004,
      },
      {},
      deps
    );
    const review = await requestCiv7ProgressionPlayerChoice(
      { kind: "tradition-review", playerId: 0 },
      {},
      deps
    );

    expect(sentInputs).toEqual([
      {
        playerId: 0,
        operationType: "CHANGE_TRADITION",
        args: {
          TraditionType: -331_546_976,
          Action: -1_326_475_004,
        },
      },
      {
        playerId: 0,
        operationType: "CONSIDER_ASSIGN_TRADITIONS",
        args: {},
      },
    ]);
    expect(change).toMatchObject({
      kind: "tradition-change",
      traditionType: -331_546_976,
      action: -1_326_475_004,
      sent: true,
    });
    expect(review).toMatchObject({
      kind: "tradition-review",
      sent: true,
    });
  });

  test("projects validator-blocked progression choices as not-sent", async () => {
    const result = await requestCiv7ProgressionPlayerChoice(
      { kind: "attribute-review", playerId: 0 },
      {},
      dependencies(() =>
        operationResult({
          sent: false,
          valid: false,
          operationType: "CONSIDER_ASSIGN_ATTRIBUTE",
          playerId: 0,
          args: {},
        })
      )
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
    expect(progressionPlayerChoiceProofPostcondition(result)).toMatchObject({
      classification: "not-sent",
      outcome: "not-sent",
      confidence: "unverified",
      noRepeatAfterUnverified: true,
    });
  });

  test("rejects non-integer progression choice inputs before command construction", async () => {
    await expect(
      requestCiv7ProgressionPlayerChoice(
        { kind: "attribute-purchase", playerId: 0, node: 1.5 },
        {},
        shouldNotSendDependencies()
      )
    ).rejects.toThrow("node invalid");

    await expect(
      requestCiv7ProgressionPlayerChoice(
        {
          kind: "tradition-change",
          playerId: 0,
          traditionType: 1.5,
          action: 1,
        },
        {},
        shouldNotSendDependencies()
      )
    ).rejects.toThrow("traditionType invalid");

    await expect(
      requestCiv7ProgressionPlayerChoice(
        {
          kind: "tradition-change",
          playerId: 0,
          traditionType: 1,
          action: 1.5,
        },
        {},
        shouldNotSendDependencies()
      )
    ).rejects.toThrow("action invalid");
  });
});

function dependencies(
  requestPlayerOperation: (
    input: Readonly<{
      playerId: number;
      operationType: string;
      args: Readonly<Record<string, number>>;
    }>,
    options: Readonly<Record<string, unknown>>
  ) => Civ7OperationRequestResult
) {
  return {
    validatePlayerId: (playerId: number) => {
      if (!Number.isInteger(playerId)) throw new Error("invalid player");
    },
    requestPlayerOperation: async (input, options) => requestPlayerOperation(input, options),
    invalidIntegerError: (field: string) => {
      throw new Error(`${field} invalid`);
    },
  };
}

function shouldNotSendDependencies() {
  return dependencies(() => {
    throw new Error("should not send");
  });
}

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

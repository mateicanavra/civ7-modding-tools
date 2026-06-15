import { describe, expect, test } from "vitest";

import {
  advisorWarningProofPostcondition,
  type Civ7ComponentId,
  requestCiv7AdvisorWarningViewed,
} from "../src/index";
import type { Civ7OperationRequestResult } from "../src/play/operations/validate-request";

const target: Civ7ComponentId = { owner: 0, id: 12345, type: 99 };

describe("advisor warning viewed request", () => {
  test("maps advisor warning acknowledgement to VIEWED_ADVISOR_WARNING", async () => {
    const result = await requestCiv7AdvisorWarningViewed(
      { playerId: 0, target },
      { timeoutMs: 1_000 },
      dependencies((input, options) => {
        expect(options).toEqual({ timeoutMs: 1_000 });
        expect(input).toEqual({
          playerId: 0,
          operationType: "VIEWED_ADVISOR_WARNING",
          args: { Target: target },
        });
        return operationResult({
          sent: true,
          playerId: 0,
          args: { Target: target },
        });
      })
    );

    expect(result).toMatchObject({
      playerId: 0,
      target,
      sent: true,
      verified: false,
      postcondition: {
        classification: "pending-runtime-proof",
      },
    });
    expect(advisorWarningProofPostcondition(result)).toMatchObject({
      classification: "pending-runtime-proof",
      outcome: "unknown",
      confidence: "pending-runtime-proof",
      noRepeatAfterUnverified: true,
    });
  });

  test("projects validator-blocked advisor warnings as not-sent", async () => {
    const result = await requestCiv7AdvisorWarningViewed(
      { playerId: 0, target },
      {},
      dependencies((input) =>
        operationResult({
          sent: false,
          valid: false,
          playerId: input.playerId,
          args: input.args,
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
    expect(advisorWarningProofPostcondition(result)).toMatchObject({
      classification: "not-sent",
      outcome: "not-sent",
      confidence: "unverified",
      noRepeatAfterUnverified: true,
    });
  });

  test("validates player and target before command construction", async () => {
    await expect(
      requestCiv7AdvisorWarningViewed({ playerId: 1.5, target }, {}, shouldNotSendDependencies())
    ).rejects.toThrow("invalid player");

    await expect(
      requestCiv7AdvisorWarningViewed(
        { playerId: 0, target: { owner: 0, id: 12345 } as never },
        {},
        shouldNotSendDependencies()
      )
    ).rejects.toThrow("invalid target");
  });
});

function dependencies(
  requestPlayerOperation: (
    input: Readonly<{
      playerId: number;
      operationType: "VIEWED_ADVISOR_WARNING";
      args: Readonly<{ Target: Civ7ComponentId }>;
    }>,
    options: Readonly<Record<string, unknown>>
  ) => Civ7OperationRequestResult
) {
  return {
    validatePlayerId: (playerId: number) => {
      if (!Number.isInteger(playerId)) throw new Error("invalid player");
    },
    assertComponentId: (value: Civ7ComponentId, label: string) => {
      if (
        !Number.isInteger(value.owner) ||
        !Number.isInteger(value.id) ||
        !Number.isInteger(value.type)
      ) {
        throw new Error(`invalid ${label}`);
      }
    },
    requestPlayerOperation: async (input, options) => requestPlayerOperation(input, options),
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
    playerId: number;
    args: Readonly<{ Target: Civ7ComponentId }>;
  }>
): Civ7OperationRequestResult {
  const valid = options.valid ?? true;
  return {
    before: validationResult(options, valid),
    after: validationResult(options, valid),
    sent: options.sent,
    verified: false,
  };
}

function validationResult(
  options: Readonly<{
    playerId: number;
    args: Readonly<{ Target: Civ7ComponentId }>;
  }>,
  valid: boolean
): Civ7OperationRequestResult["before"] {
  return {
    host: "127.0.0.1",
    port: 4318,
    state: { id: "1", name: "Tuner", role: "tuner" },
    family: "player-operation",
    operationType: "VIEWED_ADVISOR_WARNING",
    enumValue: "VIEWED_ADVISOR_WARNING",
    target: { playerId: options.playerId },
    args: options.args,
    valid,
    result: { Success: valid },
  };
}

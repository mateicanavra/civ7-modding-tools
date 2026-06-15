import { describe, expect, test } from "vitest";
import type { Civ7TurnCompletionActionResult, Civ7TurnCompletionStatusResult } from "../src/index";
import {
  type Civ7TurnCompletionPostconditionClassification,
  turnCompletionPostconditionConfirmed,
  turnCompletionProofOutcome,
  turnCompletionProofPostcondition,
} from "../src/index";
import type { Civ7OperationTelemetryPostconditionOutcome } from "../src/proof/operation-telemetry";

type TurnCompletionProofCase = Readonly<{
  classification: Civ7TurnCompletionPostconditionClassification;
  result: Civ7TurnCompletionActionResult;
  outcome: Civ7OperationTelemetryPostconditionOutcome;
  confidence: "confirmed" | "unverified";
  noRepeatAfterUnverified: boolean;
}>;

const turnCompletionProofCases: readonly TurnCompletionProofCase[] = [
  {
    classification: "turn-advanced",
    result: turnCompletionActionResult({
      before: turnCompletionStatus({ turn: 12, hasSentTurnComplete: false }),
      after: turnCompletionStatus({ turn: 13, hasSentTurnComplete: false }),
    }),
    outcome: "cleared",
    confidence: "confirmed",
    noRepeatAfterUnverified: false,
  },
  {
    classification: "turn-complete-sent",
    result: turnCompletionActionResult({
      before: turnCompletionStatus({ turn: 12, hasSentTurnComplete: false }),
      after: turnCompletionStatus({ turn: 12, hasSentTurnComplete: true }),
    }),
    outcome: "state-changed",
    confidence: "confirmed",
    noRepeatAfterUnverified: true,
  },
  {
    classification: "already-complete",
    result: turnCompletionActionResult({
      before: turnCompletionStatus({ turn: 12, hasSentTurnComplete: true }),
      after: turnCompletionStatus({ turn: 12, hasSentTurnComplete: true }),
    }),
    outcome: "state-changed",
    confidence: "confirmed",
    noRepeatAfterUnverified: true,
  },
  {
    classification: "no-state-change",
    result: turnCompletionActionResult({
      before: turnCompletionStatus({ turn: 12, hasSentTurnComplete: false }),
      after: turnCompletionStatus({ turn: 12, hasSentTurnComplete: false }),
    }),
    outcome: "no-state-change",
    confidence: "unverified",
    noRepeatAfterUnverified: true,
  },
  {
    classification: "missing-postcondition",
    result: turnCompletionActionResult({
      before: turnCompletionStatus({ turn: 12, hasSentTurnComplete: false }),
      after: turnCompletionStatus({
        turn: 12,
        hasSentTurnComplete: false,
        hasSentTurnCompleteOk: false,
      }),
    }),
    outcome: "unknown",
    confidence: "unverified",
    noRepeatAfterUnverified: true,
  },
];

describe("turn completion proof policy", () => {
  for (const {
    classification,
    result,
    outcome,
    confidence,
    noRepeatAfterUnverified,
  } of turnCompletionProofCases) {
    test(`maps ${classification} into proof confidence and no-repeat policy`, () => {
      const postcondition = turnCompletionProofPostcondition(result, undefined);

      expect(turnCompletionProofOutcome(classification)).toBe(outcome);
      expect(turnCompletionPostconditionConfirmed(classification)).toBe(confidence === "confirmed");
      expect(postcondition).toMatchObject({
        classification,
        outcome,
        confidence,
        noRepeatAfterUnverified,
      });
    });
  }

  test("keeps pending runtime proof no-repeat guarded", () => {
    expect(
      turnCompletionProofPostcondition(
        turnCompletionActionResult({
          before: turnCompletionStatus({ turn: 12, hasSentTurnComplete: false }),
          after: turnCompletionStatus({ turn: 13, hasSentTurnComplete: false }),
        }),
        "pending-runtime-proof"
      )
    ).toMatchObject({
      classification: "turn-advanced",
      outcome: "unknown",
      confidence: "pending-runtime-proof",
      noRepeatAfterUnverified: true,
    });
  });
});

function turnCompletionActionResult(
  overrides: Partial<Civ7TurnCompletionActionResult>
): Civ7TurnCompletionActionResult {
  return {
    before: turnCompletionStatus({ turn: 12, hasSentTurnComplete: false }),
    after: turnCompletionStatus({ turn: 12, hasSentTurnComplete: true }),
    command: {
      host: "127.0.0.1",
      port: 4318,
      state: { id: "65535", name: "App UI" },
      output: ["null"],
    },
    verified: true,
    ...overrides,
  } as Civ7TurnCompletionActionResult;
}

function turnCompletionStatus(
  options: Readonly<{
    turn: number;
    hasSentTurnComplete: boolean;
    turnOk?: boolean;
    hasSentTurnCompleteOk?: boolean;
  }>
): Civ7TurnCompletionStatusResult {
  return {
    host: "127.0.0.1",
    port: 4318,
    state: { id: "65535", name: "App UI" },
    localPlayerId: 0,
    turn:
      options.turnOk === false
        ? { ok: false, reason: "missing turn" }
        : { ok: true, value: options.turn },
    turnDate: { ok: true, value: "3990 BCE" },
    hasSentTurnComplete:
      options.hasSentTurnCompleteOk === false
        ? { ok: false, reason: "missing sent state" }
        : { ok: true, value: options.hasSentTurnComplete },
    canEndTurn: { ok: true, value: true },
    blocker: { ok: true, value: 0 },
    firstReadyUnitId: { ok: true, value: null },
  };
}

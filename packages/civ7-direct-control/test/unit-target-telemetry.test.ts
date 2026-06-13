import { describe, expect, test } from "vitest";

import {
  createCiv7UnitTargetActionTelemetryRecord,
  type Civ7UnitTargetActionTelemetryAdapterInput,
} from "../src/proof/unit-target-telemetry";
import { summarizeCiv7OperationProofTelemetry } from "../src/proof/operation-telemetry";

import type { Civ7UnitTargetActionResult } from "../src/play/operations/unit-target-action";

describe("unit-target telemetry adapter", () => {
  test("adapts a verified unit-target result into separated operation telemetry", () => {
    const record = createCiv7UnitTargetActionTelemetryRecord(
      unitTargetTelemetryInput({
        result: unitTargetResult({
          sent: true,
          verified: true,
          afterUnit: { ok: true, value: { location: { x: 22, y: 33 } } },
          afterTargetUnits: { ok: true, value: [] },
          verification: {
            status: "verified",
            classification: "unit-state-changed",
            unitChanged: true,
            targetUnitsChanged: false,
            destinationReached: false,
            requestedLocation: { x: 23, y: 33 },
            landedLocation: { x: 22, y: 33 },
            reason: "unit state changed after send",
          },
        }),
      })
    );

    expect(record.candidateAction).toMatchObject({
      id: "unit-target:0:65536:23:33",
      risk: "mutation",
    });
    expect(record.operationFamily).toBe("unit-operation");
    expect(record.validation_pre?.value).toMatchObject({
      valid: true,
      selected: { family: "unit-operation", operationType: "MOVE_TO" },
    });
    expect(record.send_receipt).toMatchObject({
      status: "sent",
      requestFamily: "unit-operation",
    });
    expect(record.post_read?.value).toMatchObject({
      afterUnit: { ok: true, value: { location: { x: 22, y: 33 } } },
    });
    expect(record.validation_post?.value).toEqual({
      verificationStatus: "verified",
      verificationClassification: "unit-state-changed",
    });
    expect(record.postcondition).toEqual({
      classification: "unit-state-changed",
      reason: "unit state changed after send",
      outcome: "state-changed",
      noRepeatAfterUnverified: false,
      confidence: "confirmed",
    });
    expect(record.postcondition).not.toHaveProperty("verified");
    expect(record.outcome_delta?.value).toEqual({
      classification: "unit-state-changed",
      unitChanged: true,
      targetUnitsChanged: false,
      destinationReached: false,
    });

    expect(summarizeCiv7OperationProofTelemetry(record)).toMatchObject({
      operationFamily: "unit-operation",
      actionId: "unit-target:0:65536:23:33",
      status: "sent-confirmed",
      postconditionClassification: "unit-state-changed",
      noRepeatAfterUnverified: false,
      proofBoundary: "local-test-proof",
    });
  });

  test("does not treat a legacy verified boolean as confirmed postcondition proof", () => {
    const record = createCiv7UnitTargetActionTelemetryRecord(
      unitTargetTelemetryInput({
        result: unitTargetResult({
          sent: true,
          verified: true,
          verification: undefined,
        }),
      })
    );

    expect(record.validation_post?.value).toEqual({
      verificationStatus: "missing-postcondition",
      verificationClassification: undefined,
    });
    expect(record.postcondition).toMatchObject({
      classification: "missing-postcondition",
      outcome: "unknown",
      noRepeatAfterUnverified: true,
      confidence: "unverified",
    });
    expect(summarizeCiv7OperationProofTelemetry(record)).toMatchObject({
      status: "sent-unverified",
      postconditionClassification: "missing-postcondition",
      noRepeatAfterUnverified: true,
    });
  });

  test("keeps unverified no-state-change sends no-repeat guarded", () => {
    const record = createCiv7UnitTargetActionTelemetryRecord(
      unitTargetTelemetryInput({
        result: unitTargetResult({
          sent: true,
          verified: false,
          verification: {
            status: "no-state-change",
            classification: "no-state-change",
            unitChanged: false,
            targetUnitsChanged: false,
            destinationReached: false,
            requestedLocation: { x: 23, y: 33 },
            landedLocation: { x: 22, y: 33 },
            reason:
              "send returned but unit and target-plot probes did not change; re-read before repeating",
          },
        }),
      })
    );

    expect(record.postcondition).toMatchObject({
      classification: "no-state-change",
      outcome: "no-state-change",
      noRepeatAfterUnverified: true,
      confidence: "unverified",
    });
    expect(summarizeCiv7OperationProofTelemetry(record)).toMatchObject({
      status: "sent-unverified",
      postconditionClassification: "no-state-change",
      noRepeatAfterUnverified: true,
    });
  });

  test("keeps pending runtime proof sends no-repeat guarded", () => {
    const record = createCiv7UnitTargetActionTelemetryRecord(
      unitTargetTelemetryInput({
        proofBoundary: "pending-runtime-proof",
        result: unitTargetResult({
          sent: true,
          verified: true,
          verification: {
            status: "verified",
            classification: "target-reached",
            unitChanged: true,
            targetUnitsChanged: false,
            destinationReached: true,
            requestedLocation: { x: 23, y: 33 },
            landedLocation: { x: 23, y: 33 },
            reason: "local fixture cannot prove this live target was reached",
          },
        }),
      })
    );

    expect(record.postcondition).toMatchObject({
      classification: "target-reached",
      outcome: "unknown",
      noRepeatAfterUnverified: true,
      confidence: "pending-runtime-proof",
    });
    expect(summarizeCiv7OperationProofTelemetry(record)).toMatchObject({
      status: "pending-runtime-proof",
      postconditionClassification: "target-reached",
      noRepeatAfterUnverified: true,
      proofBoundary: "pending-runtime-proof",
    });
  });
});

function unitTargetTelemetryInput(
  overrides: Partial<Civ7UnitTargetActionTelemetryAdapterInput> = {}
): Civ7UnitTargetActionTelemetryAdapterInput {
  return {
    input: {
      unitId: { owner: 0, id: 65536, type: 26 },
      x: 23,
      y: 33,
    },
    result: unitTargetResult(),
    source: "unit-target-telemetry.test.ts",
    ...overrides,
  };
}

function unitTargetResult(
  overrides: Partial<Civ7UnitTargetActionResult> = {}
): Civ7UnitTargetActionResult {
  const input = {
    unitId: { owner: 0, id: 65536, type: 26 },
    x: 23,
    y: 33,
  };
  return {
    host: "127.0.0.1",
    port: 4318,
    state: { id: "1", name: "Tuner" },
    unitId: input.unitId,
    target: { x: input.x, y: input.y, index: { ok: true, value: 1457 } },
    beforeUnit: { ok: true, value: { location: { x: 21, y: 33 } } },
    beforeTargetUnits: { ok: true, value: [] },
    candidates: [
      {
        family: "unit-operation",
        operationType: "MOVE_TO",
        args: { X: input.x, Y: input.y, Modifiers: 3 },
        valid: true,
        result: { Success: true },
        targetInReturnedPlots: true,
      },
    ],
    selected: {
      family: "unit-operation",
      operationType: "MOVE_TO",
      args: { X: input.x, Y: input.y, Modifiers: 3 },
      valid: true,
      result: { Success: true },
      targetInReturnedPlots: true,
    },
    sent: false,
    verification: {
      status: "not-sent",
      classification: "not-sent",
      unitChanged: false,
      targetUnitsChanged: false,
      destinationReached: null,
      requestedLocation: { x: input.x, y: input.y },
      reason: "read-only target resolution",
    },
    notes: [],
    ...overrides,
  };
}

import { describe, expect, test } from "vitest";

import {
  CIV7_OPERATION_PROOF_TELEMETRY_RAW_DEBUG_SLOTS,
  CIV7_OPERATION_PROOF_TELEMETRY_RECORD_VERSION,
  CIV7_OPERATION_PROOF_TELEMETRY_SLOTS,
  createCiv7OperationProofTelemetryRecord,
  summarizeCiv7OperationProofTelemetry,
  type Civ7OperationProofTelemetryRecordInput,
} from "../src/proof/operation-telemetry";

describe("Civ7 operation proof telemetry owner", () => {
  test("constructs the planned telemetry slots without claiming runtime proof", () => {
    const record = createCiv7OperationProofTelemetryRecord(baseTelemetryInput({
      postcondition: {
        classification: "no-state-change",
        reason: "The post-read did not observe a state change; do not repeat blindly.",
        outcome: "no-state-change",
        noRepeatAfterUnverified: true,
        confidence: "unverified",
      },
    }));

    expect(record.recordVersion).toBe(CIV7_OPERATION_PROOF_TELEMETRY_RECORD_VERSION);
    expect(Object.keys(record)).toEqual(CIV7_OPERATION_PROOF_TELEMETRY_SLOTS);
    expect(record.evidencePolicy).toMatchObject({
      proofBoundary: "local-test-proof",
      allowedProofClasses: ["local-package-test"],
      pendingProofClasses: ["pending-runtime-proof"],
    });
    expect(record.postcondition).not.toHaveProperty("verified");

    const summary = summarizeCiv7OperationProofTelemetry(record);
    expect(summary).toEqual({
      operationFamily: "unit-operation",
      actionId: "move-scout",
      status: "sent-unverified",
      postconditionClassification: "no-state-change",
      noRepeatAfterUnverified: true,
      proofBoundary: "local-test-proof",
      evidenceClasses: ["local-package-test", "pending-runtime-proof"],
    });
    for (const slot of CIV7_OPERATION_PROOF_TELEMETRY_RAW_DEBUG_SLOTS) {
      expect(summary).not.toHaveProperty(slot);
    }
  });

  test("keeps approval, validation, send, post-read, and outcome evidence separate", () => {
    const record = createCiv7OperationProofTelemetryRecord(baseTelemetryInput({
      validation_pre: {
        evidenceClass: "local-package-test",
        source: "unit-operation.test.ts",
        freshness: "read-before-send",
        value: { valid: false, result: { FailureReasons: ["blocked by validator"] } },
      },
      send_receipt: {
        status: "not-attempted",
        requestFamily: "unit-operation",
        reason: "validator failed before send",
      },
      postcondition: undefined,
      outcome_delta: {
        evidenceClass: "local-package-test",
        source: "unit-operation.test.ts",
        freshness: "read-after-send",
        value: { outcome: "not-sent" },
      },
      blocker_delta: {
        evidenceClass: "local-package-test",
        source: "unit-operation.test.ts",
        freshness: "read-after-send",
        value: { blocker: "unchanged" },
      },
    }));

    expect(record.approval.status).toBe("approved");
    expect(record.validation_pre?.value).toMatchObject({ valid: false });
    expect(record.send_receipt).toMatchObject({ status: "not-attempted" });
    expect(record.outcome_delta?.value).toEqual({ outcome: "not-sent" });
    expect(record.blocker_delta?.value).toEqual({ blocker: "unchanged" });

    const summary = summarizeCiv7OperationProofTelemetry(record);
    expect(summary.status).toBe("validation-blocked");
    expect(summary.postconditionClassification).toBeUndefined();
  });

  test("does not carry legacy verified booleans into the telemetry postcondition contract", () => {
    const record = createCiv7OperationProofTelemetryRecord(baseTelemetryInput({
      postcondition: {
        classification: "turn-unblocked",
        reason: "The response and UI closeout left the turn unblocked.",
        outcome: "cleared",
        noRepeatAfterUnverified: false,
        confidence: "confirmed",
        verified: true,
      } as any,
    }));

    expect(record.postcondition).toEqual({
      classification: "turn-unblocked",
      reason: "The response and UI closeout left the turn unblocked.",
      outcome: "cleared",
      noRepeatAfterUnverified: false,
      confidence: "confirmed",
    });
    expect(record.postcondition).not.toHaveProperty("verified");
    expect(summarizeCiv7OperationProofTelemetry(record)).toMatchObject({
      status: "sent-confirmed",
      postconditionClassification: "turn-unblocked",
      noRepeatAfterUnverified: false,
    });
  });

  test("keeps sent records no-repeat guarded until postcondition proof is confirmed", () => {
    const missingPostcondition = createCiv7OperationProofTelemetryRecord(baseTelemetryInput({
      postcondition: undefined,
    }));
    expect(summarizeCiv7OperationProofTelemetry(missingPostcondition)).toMatchObject({
      status: "sent-unverified",
      postconditionClassification: undefined,
      noRepeatAfterUnverified: true,
    });

    const pendingRuntimeProof = createCiv7OperationProofTelemetryRecord(baseTelemetryInput({
      evidencePolicy: {
        proofBoundary: "pending-runtime-proof",
        allowedProofClasses: ["local-package-test"],
        pendingProofClasses: ["pending-runtime-proof"],
        nonProofClaims: ["runtime/live-game proof"],
      },
      postcondition: {
        classification: "pending-runtime-proof",
        reason: "Local proof cannot close this runtime postcondition.",
        outcome: "unknown",
        noRepeatAfterUnverified: false,
        confidence: "pending-runtime-proof",
      },
    }));
    expect(summarizeCiv7OperationProofTelemetry(pendingRuntimeProof)).toMatchObject({
      status: "pending-runtime-proof",
      postconditionClassification: "pending-runtime-proof",
      noRepeatAfterUnverified: true,
    });

    const unverifiedConfidence = createCiv7OperationProofTelemetryRecord(baseTelemetryInput({
      postcondition: {
        classification: "suspect-verification",
        reason: "The post-read did not confirm the requested change.",
        outcome: "unknown",
        noRepeatAfterUnverified: false,
        confidence: "unverified",
      },
    }));
    expect(summarizeCiv7OperationProofTelemetry(unverifiedConfidence)).toMatchObject({
      status: "sent-unverified",
      postconditionClassification: "suspect-verification",
      noRepeatAfterUnverified: true,
    });

    const staleOutcome = createCiv7OperationProofTelemetryRecord(baseTelemetryInput({
      postcondition: {
        classification: "stale-postcondition",
        reason: "The post-read observed stale state after the send.",
        outcome: "stale",
        noRepeatAfterUnverified: false,
        confidence: "confirmed",
      },
    }));
    expect(summarizeCiv7OperationProofTelemetry(staleOutcome)).toMatchObject({
      status: "sent-unverified",
      postconditionClassification: "stale-postcondition",
      noRepeatAfterUnverified: true,
    });
  });
});

function baseTelemetryInput(
  overrides: Partial<Civ7OperationProofTelemetryRecordInput> = {}
): Civ7OperationProofTelemetryRecordInput {
  return {
    correlationId: "local-test-correlation",
    playerScope: "local-player",
    strategyIntent: {
      evidenceClass: "local-package-test",
      source: "operation-telemetry.test.ts",
      freshness: "fixture",
      value: { intent: "move scout safely" },
    },
    candidateAction: {
      id: "move-scout",
      label: "Move scout",
      source: "operation-telemetry.test.ts",
      risk: "mutation",
    },
    operationFamily: "unit-operation",
    target: {
      evidenceClass: "local-package-test",
      source: "unit-operation.test.ts",
      freshness: "fixture",
      value: { unitId: { owner: 0, id: 131072, type: 26 } },
    },
    args: {
      evidenceClass: "local-package-test",
      source: "unit-operation.test.ts",
      freshness: "fixture",
      value: { x: 48, y: 32 },
    },
    approval: {
      required: true,
      status: "approved",
      reason: "test approved action",
      source: "operation-telemetry.test.ts",
    },
    validation_pre: {
      evidenceClass: "local-package-test",
      source: "unit-operation.test.ts",
      freshness: "read-before-send",
      value: { valid: true },
    },
    send_receipt: {
      status: "sent",
      requestFamily: "unit-operation",
      receipt: {
        evidenceClass: "local-package-test",
        source: "unit-operation.test.ts",
        freshness: "fixture",
        value: { sent: true },
      },
    },
    post_read: {
      evidenceClass: "local-package-test",
      source: "unit-operation.test.ts",
      freshness: "read-after-send",
      value: { read: "after-send" },
    },
    validation_post: {
      evidenceClass: "local-package-test",
      source: "unit-operation.test.ts",
      freshness: "read-after-send",
      value: { valid: true },
    },
    postcondition: {
      classification: "target-reached",
      reason: "The unit reached the requested target.",
      outcome: "cleared",
      noRepeatAfterUnverified: false,
      confidence: "confirmed",
    },
    outcome_delta: {
      evidenceClass: "local-package-test",
      source: "unit-operation.test.ts",
      freshness: "read-after-send",
      value: { unitChanged: true },
    },
    blocker_delta: {
      evidenceClass: "local-package-test",
      source: "unit-operation.test.ts",
      freshness: "read-after-send",
      value: { blockerCleared: true },
    },
    evidencePolicy: {
      proofBoundary: "local-test-proof",
      allowedProofClasses: ["local-package-test"],
      pendingProofClasses: ["pending-runtime-proof"],
      nonProofClaims: ["runtime/live-game proof"],
    },
    runtimeObservationLinks: [],
    ...overrides,
  };
}

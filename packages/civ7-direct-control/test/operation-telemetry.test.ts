import { describe, expect, test } from "vitest";

import {
  CIV7_OPERATION_PROOF_TELEMETRY_RAW_DEBUG_SLOTS,
  CIV7_OPERATION_PROOF_TELEMETRY_RECORD_VERSION,
  CIV7_OPERATION_PROOF_TELEMETRY_SLOTS,
  type Civ7OperationProofTelemetryRecordInput,
  createCiv7OperationProofTelemetryRecord,
  projectCiv7OperationProofTelemetry,
  summarizeCiv7OperationProofTelemetry,
} from "../src/proof/operation-telemetry";

describe("Civ7 operation proof telemetry owner", () => {
  test("constructs the planned telemetry slots without claiming runtime proof", () => {
    const record = createCiv7OperationProofTelemetryRecord(
      baseTelemetryInput({
        postcondition: {
          classification: "no-state-change",
          reason: "The post-read did not observe a state change; do not repeat blindly.",
          outcome: "no-state-change",
          noRepeatAfterUnverified: true,
          confidence: "unverified",
        },
      })
    );

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

  test("keeps validation, send, post-read, and outcome evidence separate", () => {
    const record = createCiv7OperationProofTelemetryRecord(
      baseTelemetryInput({
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
      })
    );
    expect(record.validation_pre?.value).toMatchObject({ valid: false });
    expect(record.send_receipt).toMatchObject({ status: "not-attempted" });
    expect(record.outcome_delta?.value).toEqual({ outcome: "not-sent" });
    expect(record.blocker_delta?.value).toEqual({ blocker: "unchanged" });

    const summary = summarizeCiv7OperationProofTelemetry(record);
    expect(summary.status).toBe("validation-blocked");
    expect(summary.postconditionClassification).toBeUndefined();
  });

  test("projects only semantic summary fields to the normal player-agent surface", () => {
    const record = createCiv7OperationProofTelemetryRecord(
      baseTelemetryInput({
        validation_post: {
          evidenceClass: "local-package-test",
          source: "operation-telemetry.test.ts",
          freshness: "read-after-send",
          value: {
            verified: true,
            rawCommand: "UnitManager.RequestOperation(...)",
            session: { stateName: "Tuner" },
          },
        },
        outcome_delta: {
          evidenceClass: "local-package-test",
          source: "operation-telemetry.test.ts",
          freshness: "read-after-send",
          value: {
            after: { unitLocation: { x: 48, y: 32 } },
            rawDebugTrace: ["hidden from normal output"],
          },
        },
      })
    );

    const projection = projectCiv7OperationProofTelemetry(record, "normal-cli-player-agent");

    expect(projection).toMatchObject({
      consumer: "normal-cli-player-agent",
      surface: "normal-summary",
      allowed: true,
    });
    expect(projection.payload).toEqual({
      operationFamily: "unit-operation",
      actionId: "move-scout",
      status: "sent-confirmed",
      postconditionClassification: "target-reached",
      noRepeatAfterUnverified: false,
      proofBoundary: "local-test-proof",
      evidenceClasses: ["local-package-test", "pending-runtime-proof"],
    });
    for (const slot of CIV7_OPERATION_PROOF_TELEMETRY_RAW_DEBUG_SLOTS) {
      expect(projection.payload).not.toHaveProperty(slot);
    }
    expect(JSON.stringify(projection.payload)).not.toContain("rawCommand");
    expect(JSON.stringify(projection.payload)).not.toContain("session");
    expect(JSON.stringify(projection.payload)).not.toContain("rawDebugTrace");
  });

  test("keeps raw proof telemetry on debug/internal or raw telemetry surfaces only", () => {
    const record = createCiv7OperationProofTelemetryRecord(baseTelemetryInput());
    const debugProjection = projectCiv7OperationProofTelemetry(record, "debug-internal-service");
    const rawProjection = projectCiv7OperationProofTelemetry(record, "raw-operation-telemetry");

    expect(debugProjection).toMatchObject({
      consumer: "debug-internal-service",
      surface: "raw-debug-record",
      allowed: true,
    });
    expect(rawProjection).toMatchObject({
      consumer: "raw-operation-telemetry",
      surface: "raw-telemetry-record",
      allowed: true,
    });
    expect(debugProjection.payload).toBe(record);
    expect(rawProjection.payload).toBe(record);
    for (const slot of CIV7_OPERATION_PROOF_TELEMETRY_RAW_DEBUG_SLOTS) {
      expect(debugProjection.payload).toHaveProperty(slot);
      expect(rawProjection.payload).toHaveProperty(slot);
    }
  });

  test("blocks AI ingestion and procedure middleware until their contracts own projection", () => {
    const record = createCiv7OperationProofTelemetryRecord(baseTelemetryInput());
    const aiProjection = projectCiv7OperationProofTelemetry(record, "ai-ingestion-contract");
    const procedureProjection = projectCiv7OperationProofTelemetry(
      record,
      "procedure-core-middleware"
    );

    expect(aiProjection).toMatchObject({
      consumer: "ai-ingestion-contract",
      surface: "blocked-until-ai-ingestion-contract",
      allowed: false,
    });
    expect(procedureProjection).toMatchObject({
      consumer: "procedure-core-middleware",
      surface: "blocked-until-procedure-middleware",
      allowed: false,
    });
    expect(aiProjection).not.toHaveProperty("payload");
    expect(procedureProjection).not.toHaveProperty("payload");
    expect(aiProjection.reason).toMatch(/accepted machine contract/);
    expect(procedureProjection.reason).toMatch(/procedure middleware contract/);
  });

  test("does not carry legacy verified booleans into the telemetry postcondition contract", () => {
    const record = createCiv7OperationProofTelemetryRecord(
      baseTelemetryInput({
        postcondition: {
          classification: "turn-unblocked",
          reason: "The response and UI closeout left the turn unblocked.",
          outcome: "cleared",
          noRepeatAfterUnverified: false,
          confidence: "confirmed",
          verified: true,
        } as any,
      })
    );

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
    const missingPostcondition = createCiv7OperationProofTelemetryRecord(
      baseTelemetryInput({
        postcondition: undefined,
      })
    );
    expect(summarizeCiv7OperationProofTelemetry(missingPostcondition)).toMatchObject({
      status: "sent-unverified",
      postconditionClassification: undefined,
      noRepeatAfterUnverified: true,
    });

    const pendingRuntimeProof = createCiv7OperationProofTelemetryRecord(
      baseTelemetryInput({
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
      })
    );
    expect(summarizeCiv7OperationProofTelemetry(pendingRuntimeProof)).toMatchObject({
      status: "pending-runtime-proof",
      postconditionClassification: "pending-runtime-proof",
      noRepeatAfterUnverified: true,
    });

    const unverifiedConfidence = createCiv7OperationProofTelemetryRecord(
      baseTelemetryInput({
        postcondition: {
          classification: "suspect-verification",
          reason: "The post-read did not confirm the requested change.",
          outcome: "unknown",
          noRepeatAfterUnverified: false,
          confidence: "unverified",
        },
      })
    );
    expect(summarizeCiv7OperationProofTelemetry(unverifiedConfidence)).toMatchObject({
      status: "sent-unverified",
      postconditionClassification: "suspect-verification",
      noRepeatAfterUnverified: true,
    });

    const staleOutcome = createCiv7OperationProofTelemetryRecord(
      baseTelemetryInput({
        postcondition: {
          classification: "stale-postcondition",
          reason: "The post-read observed stale state after the send.",
          outcome: "stale",
          noRepeatAfterUnverified: false,
          confidence: "confirmed",
        },
      })
    );
    expect(summarizeCiv7OperationProofTelemetry(staleOutcome)).toMatchObject({
      status: "sent-unverified",
      postconditionClassification: "stale-postcondition",
      noRepeatAfterUnverified: true,
    });
  });

  test("rejects live proof labels under local and planning proof boundaries", () => {
    expect(() =>
      createCiv7OperationProofTelemetryRecord(
        baseTelemetryInput({
          evidencePolicy: {
            proofBoundary: "local-test-proof",
            allowedProofClasses: ["local-package-test", "live-runtime-proof"],
            pendingProofClasses: ["pending-runtime-proof"],
            nonProofClaims: ["runtime/live-game proof"],
          },
        })
      )
    ).toThrow(/local-test-proof.*live-runtime-proof/);

    expect(() =>
      createCiv7OperationProofTelemetryRecord(
        baseTelemetryInput({
          evidencePolicy: {
            proofBoundary: "planning-evidence-only",
            allowedProofClasses: ["repo-doc"],
            pendingProofClasses: ["pending-runtime-proof"],
            nonProofClaims: ["runtime/live-game proof"],
          },
          runtimeObservationLinks: [
            {
              label: "thread note is not live proof",
              evidenceClass: "in-game-observation",
              ref: "thread://local-planning-note",
            },
          ],
        })
      )
    ).toThrow(/planning-evidence-only.*in-game-observation/);
  });

  test("keeps pending runtime proof distinct from live runtime proof labels", () => {
    const pendingRuntimeProof = createCiv7OperationProofTelemetryRecord(
      baseTelemetryInput({
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
          noRepeatAfterUnverified: true,
          confidence: "pending-runtime-proof",
        },
      })
    );

    expect(summarizeCiv7OperationProofTelemetry(pendingRuntimeProof)).toMatchObject({
      status: "pending-runtime-proof",
      proofBoundary: "pending-runtime-proof",
      evidenceClasses: ["local-package-test", "pending-runtime-proof"],
    });

    expect(() =>
      createCiv7OperationProofTelemetryRecord(
        baseTelemetryInput({
          evidencePolicy: {
            proofBoundary: "pending-runtime-proof",
            allowedProofClasses: ["local-package-test"],
            pendingProofClasses: ["pending-runtime-proof"],
            nonProofClaims: ["runtime/live-game proof"],
          },
          validation_post: {
            evidenceClass: "live-runtime-proof",
            source: "operation-telemetry.test.ts",
            freshness: "runtime-observation",
            value: { valid: true },
          },
        })
      )
    ).toThrow(/pending-runtime-proof.*live-runtime-proof/);
  });

  test("allows live proof labels only under a live runtime proof boundary", () => {
    const record = createCiv7OperationProofTelemetryRecord(
      baseTelemetryInput({
        evidencePolicy: {
          proofBoundary: "live-runtime-proof",
          allowedProofClasses: ["live-runtime-proof"],
          pendingProofClasses: [],
        },
        validation_post: {
          evidenceClass: "live-runtime-proof",
          source: "bounded-live-proof",
          freshness: "runtime-observation",
          value: { valid: true },
        },
        runtimeObservationLinks: [
          {
            label: "bounded runtime proof",
            evidenceClass: "live-runtime-proof",
            ref: "runtime://bounded-proof",
          },
        ],
      })
    );

    expect(summarizeCiv7OperationProofTelemetry(record)).toMatchObject({
      proofBoundary: "live-runtime-proof",
      evidenceClasses: ["live-runtime-proof"],
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

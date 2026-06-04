import { describe, expect, test } from "vitest";

import {
  createCiv7ProductionChoiceTelemetryRecord,
  type Civ7ProductionChoiceTelemetryAdapterInput,
} from "../src/proof/production-choice-telemetry";
import { summarizeCiv7OperationProofTelemetry } from "../src/proof/operation-telemetry";

import type { Civ7ProductionChoiceResult } from "../src/play/operations/production-choice";
import type {
  Civ7ProductionPostcondition,
  Civ7ProductionPostconditionClassification,
  Civ7ProductionPostconditionSnapshot,
} from "../src/play/operations/production-postconditions";
import type { Civ7OperationValidationResult } from "../src/play/operations/types";

describe("production-choice telemetry adapter", () => {
  test("adapts a cleared production choice into separated telemetry slots", () => {
    const record = createCiv7ProductionChoiceTelemetryRecord(productionTelemetryInput({
      result: productionChoiceResult({
        sent: true,
        verified: true,
        productionPostcondition: productionPostcondition("production-choice-cleared", {
          productionStateChanged: false,
          blockerStillLive: false,
        }),
      }),
    }));

    expect(record.candidateAction).toMatchObject({
      id: "production-choice:0:65536:ConstructibleType:713967338",
      risk: "mutation",
    });
    expect(record.operationFamily).toBe("city-operation");
    expect(record.approval.status).toBe("approved");
    expect(record.validation_pre?.value).toMatchObject({
      valid: true,
      operationType: "BUILD",
    });
    expect(record.send_receipt).toMatchObject({
      status: "sent",
      requestFamily: "city-operation",
    });
    expect(record.post_read?.value).toMatchObject({
      beforeProductionPostcondition: productionSnapshot("before"),
      afterProductionPostcondition: productionSnapshot("after-cleared"),
    });
    expect(record.validation_post?.value).toMatchObject({
      valid: true,
      operationType: "BUILD",
      postconditionClassification: "production-choice-cleared",
    });
    expect(record.postcondition).toEqual({
      classification: "production-choice-cleared",
      reason: "The sent BUILD request no longer has a matching end-turn-blocking production-choice notification for the city.",
      outcome: "cleared",
      noRepeatAfterUnverified: false,
      confidence: "confirmed",
    });
    expect(record.postcondition).not.toHaveProperty("verified");
    expect(record.outcome_delta?.value).toEqual({
      classification: "production-choice-cleared",
      productionStateChanged: false,
      blockerStillLive: false,
    });
    expect(record.blocker_delta?.value).toEqual({
      classification: "production-choice-cleared",
      blockerStillLive: false,
    });

    expect(summarizeCiv7OperationProofTelemetry(record)).toMatchObject({
      operationFamily: "city-operation",
      actionId: "production-choice:0:65536:ConstructibleType:713967338",
      status: "sent-confirmed",
      postconditionClassification: "production-choice-cleared",
      noRepeatAfterUnverified: false,
      proofBoundary: "local-test-proof",
    });
  });

  test("does not treat a legacy verified boolean as confirmed postcondition proof", () => {
    const record = createCiv7ProductionChoiceTelemetryRecord(productionTelemetryInput({
      result: productionChoiceResult({
        sent: true,
        verified: true,
        productionPostcondition: undefined,
      }),
    }));

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

  test("keeps validator-blocked no-send production choices no-repeat guarded", () => {
    const record = createCiv7ProductionChoiceTelemetryRecord(productionTelemetryInput({
      result: productionChoiceResult({
        before: validationResult({ valid: false, result: { FailureReasons: ["blocked"] } }),
        after: validationResult({ valid: false, result: { FailureReasons: ["blocked"] } }),
        sent: false,
        verified: false,
        productionPostcondition: productionPostcondition("not-sent", {
          productionStateChanged: false,
          blockerStillLive: true,
        }),
      }),
    }));

    expect(record.send_receipt).toMatchObject({
      status: "not-attempted",
      requestFamily: "city-operation",
    });
    expect(record.postcondition).toMatchObject({
      classification: "not-sent",
      outcome: "not-sent",
      noRepeatAfterUnverified: true,
      confidence: "unverified",
    });
    expect(summarizeCiv7OperationProofTelemetry(record)).toMatchObject({
      status: "validation-blocked",
      postconditionClassification: "not-sent",
      noRepeatAfterUnverified: true,
    });
  });

  test("keeps no-state-change sends no-repeat guarded", () => {
    const record = createCiv7ProductionChoiceTelemetryRecord(productionTelemetryInput({
      result: productionChoiceResult({
        sent: true,
        verified: false,
        productionPostcondition: productionPostcondition("no-state-change", {
          productionStateChanged: false,
          blockerStillLive: true,
        }),
      }),
    }));

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

  test("keeps blocker-still-live production state changes no-repeat guarded", () => {
    const record = createCiv7ProductionChoiceTelemetryRecord(productionTelemetryInput({
      result: productionChoiceResult({
        sent: true,
        verified: true,
        productionPostcondition: productionPostcondition("production-state-changed-blocker-still-live", {
          productionStateChanged: true,
          blockerStillLive: true,
        }),
      }),
    }));

    expect(record.postcondition).toMatchObject({
      classification: "production-state-changed-blocker-still-live",
      outcome: "still-blocked",
      noRepeatAfterUnverified: true,
      confidence: "unverified",
    });
    expect(summarizeCiv7OperationProofTelemetry(record)).toMatchObject({
      status: "sent-unverified",
      postconditionClassification: "production-state-changed-blocker-still-live",
      noRepeatAfterUnverified: true,
    });
  });

  test("keeps validation-changed sends no-repeat guarded while the blocker is still live", () => {
    const record = createCiv7ProductionChoiceTelemetryRecord(productionTelemetryInput({
      result: productionChoiceResult({
        sent: true,
        verified: true,
        productionPostcondition: productionPostcondition("validation-changed", {
          productionStateChanged: false,
          blockerStillLive: true,
        }),
      }),
    }));

    expect(record.postcondition).toMatchObject({
      classification: "validation-changed",
      outcome: "still-blocked",
      noRepeatAfterUnverified: true,
      confidence: "unverified",
    });
    expect(summarizeCiv7OperationProofTelemetry(record)).toMatchObject({
      status: "sent-unverified",
      postconditionClassification: "validation-changed",
      noRepeatAfterUnverified: true,
    });
  });

  test("keeps pending runtime proof sends no-repeat guarded", () => {
    const record = createCiv7ProductionChoiceTelemetryRecord(productionTelemetryInput({
      proofBoundary: "pending-runtime-proof",
      result: productionChoiceResult({
        sent: true,
        verified: true,
        productionPostcondition: productionPostcondition("production-choice-cleared", {
          productionStateChanged: false,
          blockerStillLive: false,
        }),
      }),
    }));

    expect(record.postcondition).toMatchObject({
      classification: "production-choice-cleared",
      outcome: "unknown",
      noRepeatAfterUnverified: true,
      confidence: "pending-runtime-proof",
    });
    expect(summarizeCiv7OperationProofTelemetry(record)).toMatchObject({
      status: "pending-runtime-proof",
      postconditionClassification: "production-choice-cleared",
      noRepeatAfterUnverified: true,
      proofBoundary: "pending-runtime-proof",
    });
  });
});

function productionTelemetryInput(
  overrides: Partial<Civ7ProductionChoiceTelemetryAdapterInput> = {}
): Civ7ProductionChoiceTelemetryAdapterInput {
  return {
    input: {
      cityId: { owner: 0, id: 65536, type: 1 },
      args: { ConstructibleType: 713967338, X: 22, Y: 31 },
    },
    result: productionChoiceResult(),
    approval: {
      required: true,
      status: "approved",
      reason: "test production telemetry adapter",
      source: "production-choice-telemetry.test.ts",
    },
    source: "production-choice-telemetry.test.ts",
    ...overrides,
  };
}

function productionChoiceResult(
  overrides: Partial<Civ7ProductionChoiceResult> = {}
): Civ7ProductionChoiceResult {
  const before = validationResult();
  const after = validationResult();
  const productionPostconditionValue = productionPostcondition("production-choice-cleared", {
    productionStateChanged: false,
    blockerStillLive: false,
  });
  return {
    before,
    command: {
      host: "127.0.0.1",
      port: 4318,
      state: { id: "65535", name: "App UI" },
      command: "production choice test command",
      output: ["{}"],
    },
    after,
    sent: true,
    verified: true,
    productionPostcondition: productionPostconditionValue,
    payload: {
      cityId: { owner: 0, id: 65536, type: 1 },
      args: { ConstructibleType: 713967338, X: 22, Y: 31 },
      beforeValidation: before.result,
      afterValidation: after.result,
      sent: true,
      sendResult: { ok: true, value: true },
      beforeProductionPostcondition: productionSnapshot("before"),
      afterProductionPostcondition: productionSnapshot("after-cleared"),
      ui: {
        cityActivation: { ok: true, value: { selectedCityId: { owner: 0, id: 65536, type: 1 } } },
        interfaceClose: { ok: true, value: { selectedCityId: null } },
      },
      notes: [],
    },
    ...overrides,
  };
}

function validationResult(
  overrides: Partial<Civ7OperationValidationResult> = {}
): Civ7OperationValidationResult {
  return {
    host: "127.0.0.1",
    port: 4318,
    state: { id: "65535", name: "App UI" },
    family: "city-operation",
    operationType: "BUILD",
    enumValue: "BUILD",
    target: { cityId: { owner: 0, id: 65536, type: 1 } },
    args: { ConstructibleType: 713967338, X: 22, Y: 31 },
    valid: true,
    result: { Success: true },
    ...overrides,
  };
}

function productionPostcondition(
  classification: Civ7ProductionPostconditionClassification,
  overrides: Pick<Civ7ProductionPostcondition, "productionStateChanged" | "blockerStillLive">
): Civ7ProductionPostcondition {
  return {
    family: "city-operation",
    operationType: "BUILD",
    classification,
    before: productionSnapshot("before"),
    after: overrides.blockerStillLive ? productionSnapshot("after-blocked") : productionSnapshot("after-cleared"),
    productionStateChanged: overrides.productionStateChanged,
    blockerStillLive: overrides.blockerStillLive,
    reason: productionReason(classification),
  };
}

function productionSnapshot(
  phase: "before" | "after-cleared" | "after-blocked"
): Civ7ProductionPostconditionSnapshot {
  const cityId = { owner: 0, id: 65536, type: 1 };
  const blocker = {
    id: { owner: 0, id: 6, type: 20 },
    typeName: "NOTIFICATION_CHOOSE_CITY_PRODUCTION",
    target: cityId,
    matchesCity: true,
  };
  return {
    cityId,
    city: { ok: true, value: { id: cityId, population: 3 } },
    buildQueue: {
      ok: true,
      value: {
        currentProductionTypeHash: phase === "before" ? 713967338 : 1558890441,
        queueLength: 1,
      },
    },
    selectedCityId: { ok: true, value: phase === "before" ? cityId : null },
    blocker: { ok: true, value: phase === "after-cleared" ? 0 : 1090224621 },
    canEndTurn: { ok: true, value: phase === "after-cleared" },
    blockingProductionNotification: {
      ok: true,
      value: phase === "after-cleared" ? null : blocker,
    },
  };
}

function productionReason(classification: Civ7ProductionPostconditionClassification): string {
  switch (classification) {
    case "not-sent":
      return "The production request was not sent, so no production postcondition can be verified.";
    case "production-choice-cleared":
      return "The sent BUILD request no longer has a matching end-turn-blocking production-choice notification for the city.";
    case "production-state-changed":
      return "The sent BUILD request changed observed city production state.";
    case "production-state-changed-blocker-still-live":
      return "The sent BUILD request changed observed production state, but the matching production-choice notification still blocks turn flow; use notification/chooser closeout diagnostics rather than repeating BUILD blindly.";
    case "validation-changed":
      return "The sent BUILD request changed the subsequent BUILD validation result.";
    case "no-state-change":
      return "The sent BUILD request returned, but observed city production state and the production-choice blocker did not change.";
  }
}

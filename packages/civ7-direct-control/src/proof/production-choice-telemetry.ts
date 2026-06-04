import {
  createCiv7OperationProofTelemetryRecord,
  type Civ7OperationProofBoundary,
  type Civ7OperationProofClass,
  type Civ7OperationProofTelemetryRecord,
  type Civ7OperationTelemetryApproval,
  type Civ7OperationTelemetryEvidence,
  type Civ7OperationTelemetryEvidencePolicy,
  type Civ7OperationTelemetryObservationLink,
  type Civ7OperationTelemetryPlayerScope,
  type Civ7OperationTelemetryPostcondition,
  type Civ7OperationTelemetryPostconditionOutcome,
} from "./operation-telemetry";

import type {
  Civ7ProductionChoiceInput,
  Civ7ProductionChoiceResult,
} from "../play/operations/production-choice";
import type { Civ7ProductionPostconditionClassification } from "../play/operations/production-postconditions";

export type Civ7ProductionChoiceTelemetryAdapterInput = Readonly<{
  input: Civ7ProductionChoiceInput;
  result: Civ7ProductionChoiceResult;
  approval: Civ7OperationTelemetryApproval;
  source: string;
  correlationId?: string;
  playerScope?: Civ7OperationTelemetryPlayerScope;
  strategyIntent?: Civ7OperationTelemetryEvidence;
  proofBoundary?: Civ7OperationProofBoundary;
  allowedProofClasses?: readonly Civ7OperationProofClass[];
  pendingProofClasses?: readonly Civ7OperationProofClass[];
  nonProofClaims?: readonly string[];
  runtimeObservationLinks?: readonly Civ7OperationTelemetryObservationLink[];
}>;

export function createCiv7ProductionChoiceTelemetryRecord(
  input: Civ7ProductionChoiceTelemetryAdapterInput
): Civ7OperationProofTelemetryRecord {
  const evidenceClass = input.allowedProofClasses?.[0] ?? "local-package-test";
  const evidence = <T>(
    value: T,
    freshness: Civ7OperationTelemetryEvidence<T>["freshness"],
  ): Civ7OperationTelemetryEvidence<T> => ({
    evidenceClass,
    source: input.source,
    freshness,
    value,
  });

  return createCiv7OperationProofTelemetryRecord({
    correlationId: input.correlationId,
    playerScope: input.playerScope ?? "local-player",
    strategyIntent: input.strategyIntent,
    candidateAction: {
      id: productionChoiceTelemetryId(input.input),
      label: `Production choice for city ${input.input.cityId.owner}:${input.input.cityId.id}`,
      source: input.source,
      risk: input.result.sent ? "mutation" : "read",
    },
    operationFamily: "city-operation",
    target: evidence(
      {
        cityId: input.input.cityId,
      },
      "fixture"
    ),
    args: evidence(
      {
        operationType: "BUILD",
        args: input.input.args,
      },
      "fixture"
    ),
    approval: input.approval,
    validation_pre: evidence(
      {
        valid: input.result.before.valid === true,
        operationType: input.result.before.operationType,
        result: input.result.before.result,
      },
      "read-before-send"
    ),
    send_receipt: input.result.sent
      ? {
          status: "sent",
          requestFamily: "city-operation",
          receipt: evidence(
            {
              sent: true,
              sendResult: input.result.payload?.sendResult,
            },
            "fixture"
          ),
        }
      : input.result.before.valid === false
        ? {
            status: "not-attempted",
            requestFamily: "city-operation",
            reason: "Production choice validation failed before send.",
          }
        : {
            status: "not-sent",
            requestFamily: "city-operation",
            reason: input.result.productionPostcondition?.reason ?? "Production choice was not sent.",
          },
    post_read: input.result.sent || input.result.payload
      ? evidence(
          {
            beforeProductionPostcondition: input.result.payload?.beforeProductionPostcondition,
            afterProductionPostcondition: input.result.payload?.afterProductionPostcondition,
            ui: input.result.payload?.ui,
          },
          input.result.sent ? "read-after-send" : "read-before-send"
        )
      : undefined,
    validation_post: input.result.sent
      ? evidence(
          {
            valid: input.result.after.valid === true,
            operationType: input.result.after.operationType,
            result: input.result.after.result,
            postconditionClassification: input.result.productionPostcondition?.classification,
          },
          "read-after-send"
        )
      : undefined,
    postcondition: productionChoicePostcondition(input.result, input.proofBoundary),
    outcome_delta: input.result.sent
      ? evidence(
          {
            classification: input.result.productionPostcondition?.classification ?? "missing-postcondition",
            productionStateChanged: input.result.productionPostcondition?.productionStateChanged ?? null,
            blockerStillLive: input.result.productionPostcondition?.blockerStillLive ?? null,
          },
          "read-after-send"
        )
      : undefined,
    blocker_delta: input.result.productionPostcondition
      ? evidence(
          {
            classification: input.result.productionPostcondition.classification,
            blockerStillLive: input.result.productionPostcondition.blockerStillLive,
          },
          input.result.sent ? "read-after-send" : "read-before-send"
        )
      : undefined,
    evidencePolicy: productionChoiceEvidencePolicy(input),
    runtimeObservationLinks: input.runtimeObservationLinks ?? [],
  });
}

function productionChoiceTelemetryId(input: Civ7ProductionChoiceInput): string {
  const itemKey = ["UnitType", "ConstructibleType", "ProjectType"].find((key) => Number.isInteger(input.args[key]));
  const itemValue = itemKey ? input.args[itemKey] : "unknown";
  return `production-choice:${input.cityId.owner}:${input.cityId.id}:${itemKey ?? "unknown"}:${itemValue}`;
}

function productionChoiceEvidencePolicy(
  input: Civ7ProductionChoiceTelemetryAdapterInput
): Civ7OperationTelemetryEvidencePolicy {
  return {
    proofBoundary: input.proofBoundary ?? "local-test-proof",
    allowedProofClasses: input.allowedProofClasses ?? ["local-package-test"],
    pendingProofClasses: input.pendingProofClasses ?? ["pending-runtime-proof"],
    nonProofClaims: input.nonProofClaims ?? ["runtime/live-game proof"],
  };
}

function productionChoicePostcondition(
  result: Civ7ProductionChoiceResult,
  proofBoundary: Civ7OperationProofBoundary | undefined,
): Civ7OperationTelemetryPostcondition | undefined {
  if (!result.sent && !result.productionPostcondition) return undefined;
  if (proofBoundary === "pending-runtime-proof") {
    return {
      classification: result.productionPostcondition?.classification ?? "pending-runtime-proof",
      reason: result.productionPostcondition?.reason ?? "Runtime postcondition proof is pending.",
      outcome: "unknown",
      noRepeatAfterUnverified: true,
      confidence: "pending-runtime-proof",
    };
  }
  if (!result.productionPostcondition) {
    return {
      classification: "missing-postcondition",
      reason: "The production choice result did not include explicit postcondition evidence.",
      outcome: "unknown",
      noRepeatAfterUnverified: true,
      confidence: "unverified",
    };
  }
  if (!productionChoicePostconditionConfirmed(result.productionPostcondition.classification)) {
    return {
      classification: result.productionPostcondition.classification,
      reason: result.productionPostcondition.reason,
      outcome: productionChoiceOutcome(result.productionPostcondition.classification),
      noRepeatAfterUnverified: true,
      confidence: "unverified",
    };
  }
  return {
    classification: result.productionPostcondition.classification,
    reason: result.productionPostcondition.reason,
    outcome: productionChoiceOutcome(result.productionPostcondition.classification),
    noRepeatAfterUnverified: false,
    confidence: "confirmed",
  };
}

function productionChoicePostconditionConfirmed(
  classification: Civ7ProductionPostconditionClassification,
): boolean {
  switch (classification) {
    case "production-choice-cleared":
    case "production-state-changed":
      return true;
    case "not-sent":
    case "production-state-changed-blocker-still-live":
    case "validation-changed":
    case "no-state-change":
      return false;
  }
}

function productionChoiceOutcome(
  classification: Civ7ProductionPostconditionClassification,
): Civ7OperationTelemetryPostconditionOutcome {
  switch (classification) {
    case "not-sent":
      return "not-sent";
    case "production-choice-cleared":
      return "cleared";
    case "production-state-changed":
      return "state-changed";
    case "production-state-changed-blocker-still-live":
    case "validation-changed":
      return "still-blocked";
    case "no-state-change":
      return "no-state-change";
  }
}

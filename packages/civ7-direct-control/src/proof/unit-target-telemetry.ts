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
  Civ7UnitTargetActionInput,
  Civ7UnitTargetActionResult,
} from "../play/operations/unit-target-action";

export type Civ7UnitTargetActionTelemetryAdapterInput = Readonly<{
  input: Civ7UnitTargetActionInput;
  result: Civ7UnitTargetActionResult;
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

export function createCiv7UnitTargetActionTelemetryRecord(
  input: Civ7UnitTargetActionTelemetryAdapterInput
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
      id: unitTargetActionTelemetryId(input.input),
      label: `Unit target action to (${input.input.x}, ${input.input.y})`,
      source: input.source,
      risk: input.result.sent ? "mutation" : "read",
    },
    operationFamily: input.result.selected?.family ?? "unit-target-action",
    target: evidence(
      {
        unitId: input.input.unitId,
        location: { x: input.input.x, y: input.input.y },
        index: input.result.target.index,
      },
      "fixture"
    ),
    args: evidence(
      {
        selected: input.result.selected
          ? {
              family: input.result.selected.family,
              operationType: input.result.selected.operationType,
              args: input.result.selected.args,
            }
          : null,
      },
      "fixture"
    ),
    approval: input.approval,
    validation_pre: evidence(
      {
        valid: input.result.selected?.valid === true,
        selected: input.result.selected
          ? {
              family: input.result.selected.family,
              operationType: input.result.selected.operationType,
              result: input.result.selected.result,
            }
          : null,
        candidates: input.result.candidates.map((candidate) => ({
          family: candidate.family,
          operationType: candidate.operationType,
          valid: candidate.valid,
          targetInReturnedPlots: candidate.targetInReturnedPlots,
          rejectedReason: candidate.rejectedReason,
        })),
      },
      "read-before-send"
    ),
    send_receipt: input.result.sent
      ? {
          status: "sent",
          requestFamily: input.result.selected?.family,
          receipt: evidence(
            {
              sent: true,
              sendResult: input.result.sendResult,
            },
            "fixture"
          ),
        }
      : {
          status: "not-attempted",
          requestFamily: input.result.selected?.family,
          reason: "Unit target action was read without sending.",
        },
    post_read: input.result.sent
      ? evidence(
          {
            beforeUnit: input.result.beforeUnit,
            beforeTargetUnits: input.result.beforeTargetUnits,
            afterUnit: input.result.afterUnit,
            afterTargetUnits: input.result.afterTargetUnits,
          },
          "read-after-send"
        )
      : undefined,
    validation_post: input.result.sent
      ? evidence(
          {
            verificationStatus: input.result.verification?.status ?? "missing-postcondition",
            verificationClassification: input.result.verification?.classification,
          },
          "read-after-send"
        )
      : undefined,
    postcondition: unitTargetPostcondition(input.result, input.proofBoundary),
    outcome_delta: input.result.sent
      ? evidence(
          {
            classification: input.result.verification?.classification ?? "missing-postcondition",
            unitChanged: input.result.verification?.unitChanged ?? null,
            targetUnitsChanged: input.result.verification?.targetUnitsChanged ?? null,
            destinationReached: input.result.verification?.destinationReached ?? null,
          },
          "read-after-send"
        )
      : undefined,
    evidencePolicy: unitTargetEvidencePolicy(input),
    runtimeObservationLinks: input.runtimeObservationLinks ?? [],
  });
}

function unitTargetActionTelemetryId(input: Civ7UnitTargetActionInput): string {
  return `unit-target:${input.unitId.owner}:${input.unitId.id}:${input.x}:${input.y}`;
}

function unitTargetEvidencePolicy(
  input: Civ7UnitTargetActionTelemetryAdapterInput
): Civ7OperationTelemetryEvidencePolicy {
  return {
    proofBoundary: input.proofBoundary ?? "local-test-proof",
    allowedProofClasses: input.allowedProofClasses ?? ["local-package-test"],
    pendingProofClasses: input.pendingProofClasses ?? ["pending-runtime-proof"],
    nonProofClaims: input.nonProofClaims ?? ["runtime/live-game proof"],
  };
}

function unitTargetPostcondition(
  result: Civ7UnitTargetActionResult,
  proofBoundary: Civ7OperationProofBoundary | undefined,
): Civ7OperationTelemetryPostcondition | undefined {
  if (!result.sent) return undefined;
  if (proofBoundary === "pending-runtime-proof") {
    return {
      classification: result.verification?.classification ?? "pending-runtime-proof",
      reason: result.verification?.reason ?? "Runtime postcondition proof is pending.",
      outcome: "unknown",
      noRepeatAfterUnverified: true,
      confidence: "pending-runtime-proof",
    };
  }
  if (!result.verification) {
    return {
      classification: "missing-postcondition",
      reason: "The sent unit target action did not include explicit postcondition evidence.",
      outcome: "unknown",
      noRepeatAfterUnverified: true,
      confidence: "unverified",
    };
  }
  if (result.verification.status !== "verified") {
    return {
      classification: result.verification.classification,
      reason: result.verification.reason,
      outcome: unitTargetOutcome(result.verification.classification),
      noRepeatAfterUnverified: true,
      confidence: "unverified",
    };
  }
  return {
    classification: result.verification.classification,
    reason: result.verification.reason,
    outcome: unitTargetOutcome(result.verification.classification),
    noRepeatAfterUnverified: result.verification.classification === "path-shortfall",
    confidence: "confirmed",
  };
}

function unitTargetOutcome(
  classification: NonNullable<Civ7UnitTargetActionResult["verification"]>["classification"],
): Civ7OperationTelemetryPostconditionOutcome {
  switch (classification) {
    case "not-sent":
      return "not-sent";
    case "no-state-change":
      return "no-state-change";
    case "target-reached":
      return "cleared";
    case "path-shortfall":
    case "unit-state-changed":
    case "target-state-changed":
      return "state-changed";
  }
}

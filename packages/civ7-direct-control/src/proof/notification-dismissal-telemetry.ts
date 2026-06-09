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
  Civ7NotificationDismissInput,
  Civ7NotificationDismissalResult,
} from "../play/notifications/dismissal-request";
import type { Civ7NotificationDismissalPostconditionClassification } from "../play/notifications/postconditions";

export type Civ7NotificationDismissalTelemetryAdapterInput = Readonly<{
  input: Civ7NotificationDismissInput;
  result: Civ7NotificationDismissalResult;
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

export function createCiv7NotificationDismissalTelemetryRecord(
  input: Civ7NotificationDismissalTelemetryAdapterInput
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
      id: notificationDismissalTelemetryId(input.input),
      label: `Notification dismissal ${input.input.notificationId.owner}:${input.input.notificationId.id}`,
      source: input.source,
      risk: input.result.sent ? "mutation" : "read",
    },
    operationFamily: "app-ui-action",
    target: evidence(
      {
        notificationId: input.input.notificationId,
        requestedNotificationId: input.result.notificationId,
      },
      "fixture"
    ),
    args: evidence(
      {
        action: "dismiss-notification",
        notificationId: input.input.notificationId,
      },
      "fixture"
    ),
    approval: input.approval,
    validation_pre: evidence(
      {
        valid: input.result.canDismiss === true,
        canDismiss: input.result.canDismiss,
        beforeExists: input.result.before.exists,
        beforeIsEndTurnBlocking: input.result.before.isEndTurnBlocking,
        beforeIsEngineQueueFront: input.result.before.isEngineQueueFront,
        beforeIsNotificationTrainFront: input.result.before.isNotificationTrainFront,
      },
      "read-before-send"
    ),
    send_receipt: input.result.sent
      ? {
          status: "sent",
          requestFamily: "app-ui-action",
          receipt: evidence(
            {
              sent: true,
              closeoutPath: input.result.closeoutPath ?? null,
              result: input.result.result,
            },
            "fixture"
          ),
        }
      : input.result.canDismiss === false
        ? {
            status: "not-attempted",
            requestFamily: "app-ui-action",
            reason: "Notification dismissal precondition blocked before send.",
          }
        : {
            status: "not-sent",
            requestFamily: "app-ui-action",
            reason: notificationDismissalPostconditionOf(input.result)?.reason ?? "Notification dismissal was not sent.",
          },
    post_read: input.result.sent || input.result.after
      ? evidence(
          {
            before: notificationDismissalTelemetrySummary(input.result.before),
            after: input.result.after ? notificationDismissalTelemetrySummary(input.result.after) : null,
            verificationAttempts: input.result.verificationAttempts?.map(notificationDismissalTelemetrySummary) ?? [],
          },
          input.result.sent ? "read-after-send" : "read-before-send"
        )
      : undefined,
    validation_post: input.result.sent
      ? evidence(
          {
            postconditionClassification: notificationDismissalPostconditionOf(input.result)?.classification ?? "missing-postcondition",
            verified: input.result.verified,
          },
          "read-after-send"
        )
      : undefined,
    postcondition: notificationDismissalTelemetryPostcondition(input.result, input.proofBoundary),
    outcome_delta: input.result.sent
      ? evidence(
          {
            classification: notificationDismissalPostconditionOf(input.result)?.classification ?? "missing-postcondition",
            before: notificationDismissalTelemetrySummary(input.result.before),
            after: input.result.after ? notificationDismissalTelemetrySummary(input.result.after) : null,
          },
          "read-after-send"
        )
      : undefined,
    blocker_delta: notificationDismissalPostconditionOf(input.result)
      ? evidence(
          {
            classification: notificationDismissalPostconditionOf(input.result)?.classification,
            beforeIsEndTurnBlocking: input.result.before.isEndTurnBlocking,
            afterIsEndTurnBlocking: input.result.after?.isEndTurnBlocking ?? null,
            beforeIsEngineQueueFront: input.result.before.isEngineQueueFront,
            afterIsEngineQueueFront: input.result.after?.isEngineQueueFront ?? null,
          },
          input.result.sent ? "read-after-send" : "read-before-send"
        )
      : undefined,
    evidencePolicy: notificationDismissalEvidencePolicy(input),
    runtimeObservationLinks: input.runtimeObservationLinks ?? [],
  });
}

function notificationDismissalTelemetryId(input: Civ7NotificationDismissInput): string {
  return `notification-dismissal:${input.notificationId.owner}:${input.notificationId.id}:${input.notificationId.type ?? "unknown"}`;
}

function notificationDismissalEvidencePolicy(
  input: Civ7NotificationDismissalTelemetryAdapterInput
): Civ7OperationTelemetryEvidencePolicy {
  return {
    proofBoundary: input.proofBoundary ?? "local-test-proof",
    allowedProofClasses: input.allowedProofClasses ?? ["local-package-test"],
    pendingProofClasses: input.pendingProofClasses ?? ["pending-runtime-proof"],
    nonProofClaims: input.nonProofClaims ?? ["runtime/live-game proof"],
  };
}

function notificationDismissalTelemetryPostcondition(
  result: Civ7NotificationDismissalResult,
  proofBoundary: Civ7OperationProofBoundary | undefined,
): Civ7OperationTelemetryPostcondition | undefined {
  const postcondition = notificationDismissalPostconditionOf(result);
  if (!result.sent && !postcondition) return undefined;
  if (proofBoundary === "pending-runtime-proof") {
    return {
      classification: postcondition?.classification ?? "pending-runtime-proof",
      reason: postcondition?.reason ?? "Runtime postcondition proof is pending.",
      outcome: "unknown",
      noRepeatAfterUnverified: true,
      confidence: "pending-runtime-proof",
    };
  }
  if (!postcondition) {
    return {
      classification: "missing-postcondition",
      reason: "The notification dismissal result did not include explicit postcondition evidence.",
      outcome: "unknown",
      noRepeatAfterUnverified: true,
      confidence: "unverified",
    };
  }
  if (!notificationDismissalPostconditionConfirmed(postcondition.classification)) {
    return {
      classification: postcondition.classification,
      reason: postcondition.reason,
      outcome: notificationDismissalTelemetryOutcome(postcondition.classification),
      noRepeatAfterUnverified: true,
      confidence: "unverified",
    };
  }
  return {
    classification: postcondition.classification,
    reason: postcondition.reason,
    outcome: notificationDismissalTelemetryOutcome(postcondition.classification),
    noRepeatAfterUnverified: false,
    confidence: "confirmed",
  };
}

function notificationDismissalPostconditionOf(
  result: Civ7NotificationDismissalResult,
): Civ7NotificationDismissalResult["postcondition"] | undefined {
  return (result as { postcondition?: Civ7NotificationDismissalResult["postcondition"] }).postcondition;
}

function notificationDismissalPostconditionConfirmed(
  classification: Civ7NotificationDismissalPostconditionClassification,
): boolean {
  switch (classification) {
    case "notification-disappeared":
    case "notification-dismissed":
    case "engine-queue-cleared":
    case "notification-train-cleared":
    case "engine-front-moved":
    case "notification-train-front-moved":
      return true;
    case "not-sent":
    case "missing-after":
    case "engine-front-still-live":
    case "no-state-change":
      return false;
  }
}

function notificationDismissalTelemetryOutcome(
  classification: Civ7NotificationDismissalPostconditionClassification,
): Civ7OperationTelemetryPostconditionOutcome {
  switch (classification) {
    case "not-sent":
      return "not-sent";
    case "notification-disappeared":
    case "engine-queue-cleared":
    case "notification-train-cleared":
      return "cleared";
    case "notification-dismissed":
    case "engine-front-moved":
    case "notification-train-front-moved":
      return "state-changed";
    case "engine-front-still-live":
      return "stale";
    case "missing-after":
      return "unknown";
    case "no-state-change":
      return "no-state-change";
  }
}

function notificationDismissalTelemetrySummary(
  summary: Civ7NotificationDismissalResult["before"],
) {
  return {
    id: summary.id,
    exists: summary.exists,
    typeName: summary.typeName,
    canUserDismiss: summary.canUserDismiss,
    expired: summary.expired,
    dismissed: summary.dismissed,
    isEndTurnBlocking: summary.isEndTurnBlocking,
    engineQueueContains: summary.engineQueueContains,
    isEngineQueueFront: summary.isEngineQueueFront,
    notificationTrainContains: summary.notificationTrainContains,
    isNotificationTrainFront: summary.isNotificationTrainFront,
  };
}

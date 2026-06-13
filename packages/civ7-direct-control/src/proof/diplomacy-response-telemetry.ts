import type {
  Civ7DiplomacyResponseInput,
  Civ7DiplomacyResponseResult,
} from "../play/operations/diplomacy-request.js";
import { diplomacyResponseProofPostcondition } from "./diplomacy-response-proof-policy.js";
import {
  type Civ7OperationProofBoundary,
  type Civ7OperationProofClass,
  type Civ7OperationProofTelemetryRecord,
  type Civ7OperationTelemetryEvidence,
  type Civ7OperationTelemetryEvidencePolicy,
  type Civ7OperationTelemetryObservationLink,
  type Civ7OperationTelemetryPlayerScope,
  createCiv7OperationProofTelemetryRecord,
} from "./operation-telemetry.js";

export type Civ7DiplomacyResponseTelemetryAdapterInput = Readonly<{
  input: Civ7DiplomacyResponseInput;
  result: Civ7DiplomacyResponseResult;
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

export function createCiv7DiplomacyResponseTelemetryRecord(
  input: Civ7DiplomacyResponseTelemetryAdapterInput
): Civ7OperationProofTelemetryRecord {
  const evidenceClass = input.allowedProofClasses?.[0] ?? "local-package-test";
  const evidence = <T>(
    value: T,
    freshness: Civ7OperationTelemetryEvidence<T>["freshness"]
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
      id: diplomacyResponseTelemetryId(input.input),
      label: `Diplomacy response ${input.input.actionId}:${input.input.responseType}`,
      source: input.source,
      risk: input.result.sent ? "mutation" : "read",
    },
    operationFamily: "player-operation",
    target: evidence(
      {
        playerId: input.input.playerId,
        actionId: input.input.actionId,
        notificationId: input.input.notificationId ?? null,
      },
      "fixture"
    ),
    args: evidence(
      {
        operationType: "RESPOND_DIPLOMATIC_ACTION",
        args: { ID: input.input.actionId, Type: input.input.responseType },
        activateNotification: input.input.activateNotification ?? true,
        uiCloseout: input.input.uiCloseout ?? true,
      },
      "fixture"
    ),
    validation_pre: evidence(
      {
        valid: input.result.beforeValidation.valid === true,
        operationType: input.result.beforeValidation.operationType,
        result: input.result.beforeValidation.result,
      },
      "read-before-send"
    ),
    send_receipt: input.result.sent
      ? {
          status: "sent",
          requestFamily: "player-operation",
          receipt: evidence(
            {
              sent: true,
              sendResult: input.result.payload?.sendResult,
              activated: input.result.payload?.activated ?? null,
              uiCloseout: input.result.payload?.uiCloseout ?? null,
            },
            "fixture"
          ),
        }
      : input.result.beforeValidation.valid === false
        ? {
            status: "not-attempted",
            requestFamily: "player-operation",
            reason: "Diplomacy response validation failed before send.",
          }
        : {
            status: "not-sent",
            requestFamily: "player-operation",
            reason: input.result.postcondition?.reason ?? "Diplomacy response was not sent.",
          },
    post_read: input.result.sent
      ? evidence(
          {
            beforeBlockingNotificationId: input.result.before.blockingNotificationId,
            afterBlockingNotificationId: input.result.after.blockingNotificationId,
            beforeCanEndTurn: input.result.before.canEndTurn,
            afterCanEndTurn: input.result.after.canEndTurn,
            beforeNotifications: input.result.before.notifications,
            afterNotifications: input.result.after.notifications,
          },
          "read-after-send"
        )
      : undefined,
    validation_post: input.result.sent
      ? evidence(
          {
            valid: input.result.afterValidation.valid === true,
            operationType: input.result.afterValidation.operationType,
            result: input.result.afterValidation.result,
            postconditionClassification: input.result.postcondition?.classification,
          },
          "read-after-send"
        )
      : undefined,
    postcondition: diplomacyResponseProofPostcondition(input.result, input.proofBoundary),
    outcome_delta: input.result.sent
      ? evidence(
          {
            classification: input.result.postcondition?.classification ?? "missing-postcondition",
            beforeCanEndTurn: input.result.before.canEndTurn,
            afterCanEndTurn: input.result.after.canEndTurn,
            beforeBlockingNotificationId: input.result.before.blockingNotificationId,
            afterBlockingNotificationId: input.result.after.blockingNotificationId,
          },
          "read-after-send"
        )
      : undefined,
    blocker_delta: input.result.postcondition
      ? evidence(
          {
            classification: input.result.postcondition.classification,
            beforeBlockingNotificationId: input.result.before.blockingNotificationId,
            afterBlockingNotificationId: input.result.after.blockingNotificationId,
          },
          input.result.sent ? "read-after-send" : "read-before-send"
        )
      : undefined,
    evidencePolicy: diplomacyResponseEvidencePolicy(input),
    runtimeObservationLinks: input.runtimeObservationLinks ?? [],
  });
}

function diplomacyResponseTelemetryId(input: Civ7DiplomacyResponseInput): string {
  return `diplomacy-response:${input.playerId}:${input.actionId}:${input.responseType}`;
}

function diplomacyResponseEvidencePolicy(
  input: Civ7DiplomacyResponseTelemetryAdapterInput
): Civ7OperationTelemetryEvidencePolicy {
  return {
    proofBoundary: input.proofBoundary ?? "local-test-proof",
    allowedProofClasses: input.allowedProofClasses ?? ["local-package-test"],
    pendingProofClasses: input.pendingProofClasses ?? ["pending-runtime-proof"],
    nonProofClaims: input.nonProofClaims ?? ["runtime/live-game proof"],
  };
}

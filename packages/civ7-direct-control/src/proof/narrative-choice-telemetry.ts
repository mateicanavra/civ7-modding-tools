import type {
  Civ7NarrativeChoiceInput,
  Civ7NarrativeChoiceResult,
} from "../play/operations/narrative-request.js";
import { narrativeChoiceProofPostcondition } from "./narrative-choice-proof-policy.js";
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

export type Civ7NarrativeChoiceTelemetryAdapterInput = Readonly<{
  input: Civ7NarrativeChoiceInput;
  result: Civ7NarrativeChoiceResult;
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

export function createCiv7NarrativeChoiceTelemetryRecord(
  input: Civ7NarrativeChoiceTelemetryAdapterInput
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
      id: narrativeChoiceTelemetryId(input.input),
      label: `Narrative choice ${input.input.targetType}:${input.input.action}`,
      source: input.source,
      risk: input.result.sent ? "mutation" : "read",
    },
    operationFamily: "player-operation",
    target: evidence(
      {
        playerId: input.input.playerId,
        targetType: input.input.targetType,
        target: input.input.target,
      },
      "fixture"
    ),
    args: evidence(
      {
        operationType: "CHOOSE_NARRATIVE_STORY_DIRECTION",
        args: {
          TargetType: input.input.targetType,
          Target: input.input.target,
          Action: input.input.action,
        },
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
              popupClose: input.result.payload?.ui.popupClose ?? null,
              panelClose: input.result.payload?.ui.panelClose ?? null,
            },
            "fixture"
          ),
        }
      : input.result.beforeValidation.valid === false
        ? {
            status: "not-attempted",
            requestFamily: "player-operation",
            reason: "Narrative choice validation failed before send.",
          }
        : {
            status: "not-sent",
            requestFamily: "player-operation",
            reason: input.result.postcondition?.reason ?? "Narrative choice was not sent.",
          },
    post_read:
      input.result.sent || input.result.payload
        ? evidence(
            {
              beforeBlockingNotificationId: input.result.before.blockingNotificationId,
              afterBlockingNotificationId: input.result.after.blockingNotificationId,
              beforeCanEndTurn: input.result.before.canEndTurn,
              afterCanEndTurn: input.result.after.canEndTurn,
              beforeNotifications: input.result.before.notifications,
              afterNotifications: input.result.after.notifications,
              ui: input.result.payload?.ui,
            },
            input.result.sent ? "read-after-send" : "read-before-send"
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
    postcondition: narrativeChoiceProofPostcondition(input.result, input.proofBoundary),
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
    evidencePolicy: narrativeChoiceEvidencePolicy(input),
    runtimeObservationLinks: input.runtimeObservationLinks ?? [],
  });
}

function narrativeChoiceTelemetryId(input: Civ7NarrativeChoiceInput): string {
  return `narrative-choice:${input.playerId}:${input.target.owner}:${input.target.id}:${input.target.type ?? "unknown"}:${input.targetType}:${input.action}`;
}

function narrativeChoiceEvidencePolicy(
  input: Civ7NarrativeChoiceTelemetryAdapterInput
): Civ7OperationTelemetryEvidencePolicy {
  return {
    proofBoundary: input.proofBoundary ?? "local-test-proof",
    allowedProofClasses: input.allowedProofClasses ?? ["local-package-test"],
    pendingProofClasses: input.pendingProofClasses ?? ["pending-runtime-proof"],
    nonProofClaims: input.nonProofClaims ?? ["runtime/live-game proof"],
  };
}

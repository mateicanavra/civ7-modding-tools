export const CIV7_OPERATION_PROOF_TELEMETRY_RECORD_VERSION = "civ7-operation-proof-telemetry/v0";

export const CIV7_OPERATION_PROOF_TELEMETRY_SLOTS = [
  "recordVersion",
  "correlationId",
  "playerScope",
  "strategyIntent",
  "candidateAction",
  "operationFamily",
  "target",
  "args",
  "approval",
  "validation_pre",
  "send_receipt",
  "post_read",
  "validation_post",
  "postcondition",
  "outcome_delta",
  "blocker_delta",
  "evidencePolicy",
  "runtimeObservationLinks",
] as const;

export const CIV7_OPERATION_PROOF_TELEMETRY_RAW_DEBUG_SLOTS = [
  "correlationId",
  "strategyIntent",
  "target",
  "args",
  "approval",
  "validation_pre",
  "send_receipt",
  "post_read",
  "validation_post",
  "outcome_delta",
  "blocker_delta",
  "runtimeObservationLinks",
] as const;

const CIV7_OPERATION_LIVE_PROOF_CLASSES = new Set<Civ7OperationProofClass>([
  "live-runtime-proof",
  "in-game-observation",
]);

export type Civ7OperationProofTelemetrySlot = typeof CIV7_OPERATION_PROOF_TELEMETRY_SLOTS[number];

export type Civ7OperationProofClass =
  | "local-package-test"
  | "local-cli-test"
  | "target-thread-evidence"
  | "peer-report"
  | "repo-doc"
  | "official-resource"
  | "log-or-database-artifact"
  | "tuner-app-ui-read"
  | "live-runtime-proof"
  | "in-game-observation"
  | "pending-runtime-proof";

export type Civ7OperationProofBoundary =
  | "planning-evidence-only"
  | "local-test-proof"
  | "pending-runtime-proof"
  | "live-runtime-proof";

export type Civ7OperationTelemetryPlayerScope =
  | "unknown"
  | "local-player"
  | "player"
  | "agent-slot"
  | "human-turn-visible"
  | "observer-debug";

export type Civ7OperationTelemetryEvidence<T = unknown> = Readonly<{
  evidenceClass: Civ7OperationProofClass;
  source: string;
  freshness?: "fixture" | "read-before-send" | "read-after-send" | "runtime-observation" | "unknown";
  value: T;
}>;

export type Civ7OperationTelemetryCandidateAction = Readonly<{
  id: string;
  label?: string;
  source: string;
  risk: "read" | "mutation" | "setup" | "debug";
}>;

export type Civ7OperationTelemetryApproval = Readonly<{
  required: boolean;
  status: "not-required" | "approved" | "refused" | "pending";
  reason?: string;
  source?: string;
}>;

export type Civ7OperationTelemetrySendReceipt = Readonly<{
  status: "not-attempted" | "sent" | "not-sent" | "send-failed";
  requestFamily?: string;
  receipt?: Civ7OperationTelemetryEvidence;
  reason?: string;
}>;

export type Civ7OperationTelemetryPostconditionOutcome =
  | "cleared"
  | "state-changed"
  | "still-blocked"
  | "no-state-change"
  | "not-sent"
  | "stale"
  | "unknown";

export type Civ7OperationTelemetryPostcondition = Readonly<{
  classification: string;
  reason: string;
  outcome: Civ7OperationTelemetryPostconditionOutcome;
  noRepeatAfterUnverified: boolean;
  confidence: "confirmed" | "unverified" | "pending-runtime-proof";
}>;

export type Civ7OperationTelemetryEvidencePolicy = Readonly<{
  proofBoundary: Civ7OperationProofBoundary;
  allowedProofClasses: readonly Civ7OperationProofClass[];
  pendingProofClasses?: readonly Civ7OperationProofClass[];
  nonProofClaims?: readonly string[];
}>;

export type Civ7OperationTelemetryObservationLink = Readonly<{
  label: string;
  evidenceClass: Civ7OperationProofClass;
  ref: string;
}>;

export type Civ7OperationProofTelemetryRecord = Readonly<{
  recordVersion: typeof CIV7_OPERATION_PROOF_TELEMETRY_RECORD_VERSION;
  correlationId?: string;
  playerScope: Civ7OperationTelemetryPlayerScope;
  strategyIntent?: Civ7OperationTelemetryEvidence;
  candidateAction: Civ7OperationTelemetryCandidateAction;
  operationFamily: string;
  target?: Civ7OperationTelemetryEvidence;
  args?: Civ7OperationTelemetryEvidence;
  approval: Civ7OperationTelemetryApproval;
  validation_pre?: Civ7OperationTelemetryEvidence;
  send_receipt: Civ7OperationTelemetrySendReceipt;
  post_read?: Civ7OperationTelemetryEvidence;
  validation_post?: Civ7OperationTelemetryEvidence;
  postcondition?: Civ7OperationTelemetryPostcondition;
  outcome_delta?: Civ7OperationTelemetryEvidence;
  blocker_delta?: Civ7OperationTelemetryEvidence;
  evidencePolicy: Civ7OperationTelemetryEvidencePolicy;
  runtimeObservationLinks: readonly Civ7OperationTelemetryObservationLink[];
}>;

export type Civ7OperationProofTelemetryRecordInput = Omit<
  Civ7OperationProofTelemetryRecord,
  "recordVersion"
>;

export type Civ7OperationProofTelemetrySummary = Readonly<{
  operationFamily: string;
  actionId: string;
  status:
    | "approval-refused"
    | "validation-blocked"
    | "not-sent"
    | "sent-confirmed"
    | "sent-unverified"
    | "pending-runtime-proof";
  postconditionClassification?: string;
  noRepeatAfterUnverified: boolean;
  proofBoundary: Civ7OperationProofBoundary;
  evidenceClasses: readonly Civ7OperationProofClass[];
}>;

export type Civ7OperationTelemetryProjectionConsumer =
  | "normal-cli-player-agent"
  | "debug-internal-service"
  | "ai-ingestion-contract"
  | "procedure-core-middleware"
  | "raw-operation-telemetry";

export type Civ7OperationTelemetryProjection =
  | Readonly<{
      consumer: "normal-cli-player-agent";
      surface: "normal-summary";
      allowed: true;
      payload: Civ7OperationProofTelemetrySummary;
    }>
  | Readonly<{
      consumer: "debug-internal-service";
      surface: "raw-debug-record";
      allowed: true;
      payload: Civ7OperationProofTelemetryRecord;
    }>
  | Readonly<{
      consumer: "raw-operation-telemetry";
      surface: "raw-telemetry-record";
      allowed: true;
      payload: Civ7OperationProofTelemetryRecord;
    }>
  | Readonly<{
      consumer: "ai-ingestion-contract";
      surface: "blocked-until-ai-ingestion-contract";
      allowed: false;
      reason: string;
    }>
  | Readonly<{
      consumer: "procedure-core-middleware";
      surface: "blocked-until-procedure-middleware";
      allowed: false;
      reason: string;
    }>;

export function createCiv7OperationProofTelemetryRecord(
  input: Civ7OperationProofTelemetryRecordInput
): Civ7OperationProofTelemetryRecord {
  validateEvidencePolicy(input);
  return {
    recordVersion: CIV7_OPERATION_PROOF_TELEMETRY_RECORD_VERSION,
    correlationId: input.correlationId,
    playerScope: input.playerScope,
    strategyIntent: input.strategyIntent,
    candidateAction: input.candidateAction,
    operationFamily: input.operationFamily,
    target: input.target,
    args: input.args,
    approval: input.approval,
    validation_pre: input.validation_pre,
    send_receipt: input.send_receipt,
    post_read: input.post_read,
    validation_post: input.validation_post,
    postcondition: normalizePostcondition(input.postcondition),
    outcome_delta: input.outcome_delta,
    blocker_delta: input.blocker_delta,
    evidencePolicy: input.evidencePolicy,
    runtimeObservationLinks: input.runtimeObservationLinks,
  };
}

export function projectCiv7OperationProofTelemetry(
  record: Civ7OperationProofTelemetryRecord,
  consumer: Civ7OperationTelemetryProjectionConsumer,
): Civ7OperationTelemetryProjection {
  switch (consumer) {
    case "normal-cli-player-agent":
      return {
        consumer,
        surface: "normal-summary",
        allowed: true,
        payload: summarizeCiv7OperationProofTelemetry(record),
      };
    case "debug-internal-service":
      return {
        consumer,
        surface: "raw-debug-record",
        allowed: true,
        payload: record,
      };
    case "raw-operation-telemetry":
      return {
        consumer,
        surface: "raw-telemetry-record",
        allowed: true,
        payload: record,
      };
    case "ai-ingestion-contract":
      return {
        consumer,
        surface: "blocked-until-ai-ingestion-contract",
        allowed: false,
        reason: "AI ingestion must use its accepted machine contract, not normal CLI or raw debug telemetry output.",
      };
    case "procedure-core-middleware":
      return {
        consumer,
        surface: "blocked-until-procedure-middleware",
        allowed: false,
        reason: "Procedure cores may attach telemetry only after the procedure middleware contract owns schema, context, and projection policy.",
      };
  }
}

export function summarizeCiv7OperationProofTelemetry(
  record: Civ7OperationProofTelemetryRecord
): Civ7OperationProofTelemetrySummary {
  const status = summarizeStatus(record);
  return {
    operationFamily: record.operationFamily,
    actionId: record.candidateAction.id,
    status,
    postconditionClassification: record.postcondition?.classification,
    noRepeatAfterUnverified: summarizeNoRepeatAfterUnverified(record, status),
    proofBoundary: record.evidencePolicy.proofBoundary,
    evidenceClasses: uniqueProofClasses([
      ...record.evidencePolicy.allowedProofClasses,
      ...(record.evidencePolicy.pendingProofClasses ?? []),
    ]),
  };
}

function summarizeStatus(record: Civ7OperationProofTelemetryRecord): Civ7OperationProofTelemetrySummary["status"] {
  if (record.approval.status === "refused") return "approval-refused";
  if (hasValidationBlocked(record.validation_pre)) return "validation-blocked";
  if (record.send_receipt.status !== "sent") return "not-sent";
  if (record.evidencePolicy.proofBoundary === "pending-runtime-proof") return "pending-runtime-proof";
  if (!record.postcondition) return "sent-unverified";
  if (record.postcondition.confidence !== "confirmed") return "sent-unverified";
  if (record.postcondition.outcome === "cleared" || record.postcondition.outcome === "state-changed") {
    return "sent-confirmed";
  }
  return "sent-unverified";
}

function summarizeNoRepeatAfterUnverified(
  record: Civ7OperationProofTelemetryRecord,
  status: Civ7OperationProofTelemetrySummary["status"]
): boolean {
  if (status !== "sent-confirmed") return true;
  return record.postcondition?.noRepeatAfterUnverified ?? true;
}

function hasValidationBlocked(evidence: Civ7OperationTelemetryEvidence | undefined): boolean {
  if (!evidence || typeof evidence.value !== "object" || evidence.value === null) return false;
  return (evidence.value as { valid?: unknown }).valid === false;
}

function normalizePostcondition(
  postcondition: Civ7OperationTelemetryPostcondition | undefined
): Civ7OperationTelemetryPostcondition | undefined {
  if (!postcondition) return undefined;
  const { classification, reason, outcome, noRepeatAfterUnverified, confidence } = postcondition;
  return { classification, reason, outcome, noRepeatAfterUnverified, confidence };
}

function uniqueProofClasses(values: readonly Civ7OperationProofClass[]): readonly Civ7OperationProofClass[] {
  return Array.from(new Set(values));
}

function validateEvidencePolicy(input: Civ7OperationProofTelemetryRecordInput): void {
  const policy = input.evidencePolicy;
  if (policy.proofBoundary === "live-runtime-proof") {
    return;
  }
  const liveLabels = collectLiveProofLabels(input);
  if (liveLabels.length === 0) return;
  throw new Error(
    `Civ7 operation telemetry proof boundary ${policy.proofBoundary} cannot label evidence as live runtime proof: ${uniqueProofClasses(liveLabels).join(", ")}`
  );
}

function collectLiveProofLabels(
  input: Civ7OperationProofTelemetryRecordInput
): Civ7OperationProofClass[] {
  const labels: Civ7OperationProofClass[] = [];
  collectProofClass(labels, input.strategyIntent?.evidenceClass);
  collectProofClass(labels, input.target?.evidenceClass);
  collectProofClass(labels, input.args?.evidenceClass);
  collectProofClass(labels, input.validation_pre?.evidenceClass);
  collectProofClass(labels, input.send_receipt.receipt?.evidenceClass);
  collectProofClass(labels, input.post_read?.evidenceClass);
  collectProofClass(labels, input.validation_post?.evidenceClass);
  collectProofClass(labels, input.outcome_delta?.evidenceClass);
  collectProofClass(labels, input.blocker_delta?.evidenceClass);
  for (const proofClass of input.evidencePolicy.allowedProofClasses) {
    collectProofClass(labels, proofClass);
  }
  for (const proofClass of input.evidencePolicy.pendingProofClasses ?? []) {
    collectProofClass(labels, proofClass);
  }
  for (const link of input.runtimeObservationLinks) {
    collectProofClass(labels, link.evidenceClass);
  }
  return labels;
}

function collectProofClass(
  labels: Civ7OperationProofClass[],
  proofClass: Civ7OperationProofClass | undefined,
): void {
  if (proofClass && CIV7_OPERATION_LIVE_PROOF_CLASSES.has(proofClass)) {
    labels.push(proofClass);
  }
}

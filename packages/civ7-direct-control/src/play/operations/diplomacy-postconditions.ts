import type {
  Civ7ComponentId,
  Civ7DiplomacyResponseInput,
  Civ7DiplomacyResponsePostcondition,
  Civ7DiplomacyResponsePostconditionClassification,
  Civ7DirectControlOptions,
  Civ7OperationValidationResult,
  Civ7RuntimeProbe,
} from "../../index.js";
import type {
  Civ7PlayNotificationSummary,
  Civ7PlayNotificationViewResult,
} from "../notifications/view.js";

export async function waitForCiv7DiplomacyResponseAfter(
  input: Civ7DiplomacyResponseInput,
  options: Civ7DirectControlOptions,
  before: Civ7PlayNotificationViewResult,
  beforeValidation: Civ7OperationValidationResult,
  readPlayNotifications: (options: Civ7DirectControlOptions) => Promise<Civ7PlayNotificationViewResult>,
): Promise<Civ7PlayNotificationViewResult> {
  const waitTimeoutMs = Math.min(Math.max(options.timeoutMs ?? 3_000, 1_000), 6_000);
  const pollIntervalMs = 250;
  const startedAt = Date.now();
  let last = await readPlayNotifications(options);
  while (Date.now() - startedAt <= waitTimeoutMs) {
    const candidate = diplomacyResponsePostcondition(input, true, before, last, beforeValidation, beforeValidation);
    if (candidate.classification !== "no-state-change") return last;
    await sleep(pollIntervalMs);
    last = await readPlayNotifications(options);
  }
  return last;
}

export function diplomacyResponsePostcondition(
  input: Civ7DiplomacyResponseInput,
  sent: boolean,
  before: Civ7PlayNotificationViewResult,
  after: Civ7PlayNotificationViewResult,
  beforeValidation: Civ7OperationValidationResult,
  afterValidation: Civ7OperationValidationResult,
): Civ7DiplomacyResponsePostcondition {
  const classification = classifyDiplomacyResponsePostcondition(input, sent, before, after, beforeValidation, afterValidation);
  return {
    classification,
    reason: diplomacyResponsePostconditionReason(classification),
  };
}

function classifyDiplomacyResponsePostcondition(
  input: Civ7DiplomacyResponseInput,
  sent: boolean,
  before: Civ7PlayNotificationViewResult,
  after: Civ7PlayNotificationViewResult,
  beforeValidation: Civ7OperationValidationResult,
  afterValidation: Civ7OperationValidationResult,
): Civ7DiplomacyResponsePostconditionClassification {
  if (!sent) return "not-sent";
  if (probeValue(after.canEndTurn) === true) return "turn-unblocked";
  const beforeMatch = findDiplomacyResponseNotification(before, input);
  const afterMatch = findDiplomacyResponseNotification(after, input);
  if (beforeMatch && !afterMatch) return "diplomacy-blocker-cleared";
  const beforeBlocking = probeValue(before.blockingNotificationId);
  const afterBlocking = probeValue(after.blockingNotificationId);
  if (!sameComponentId(beforeBlocking, afterBlocking)) return "blocking-notification-changed";
  if (beforeValidation.valid !== afterValidation.valid || stableJson(beforeValidation.result) !== stableJson(afterValidation.result)) {
    return "validation-changed";
  }
  return "no-state-change";
}

function diplomacyResponsePostconditionReason(classification: Civ7DiplomacyResponsePostconditionClassification): string {
  switch (classification) {
    case "not-sent":
      return "The diplomatic response was not sent, so no postcondition can be verified.";
    case "turn-unblocked":
      return "The response and UI closeout left the turn unblocked.";
    case "diplomacy-blocker-cleared":
      return "The matching diplomatic-response notification is no longer present as a blocking decision.";
    case "blocking-notification-changed":
      return "The end-turn blocking notification changed after the response closeout.";
    case "validation-changed":
      return "The response validator changed after the send, but the notification/turn state did not clearly clear.";
    case "no-state-change":
      return "The response was sent, but notification, turn-blocking, and validator state did not change; use stale-blocker diagnostics instead of repeating blindly.";
  }
}

function findDiplomacyResponseNotification(
  view: Civ7PlayNotificationViewResult,
  input: Civ7DiplomacyResponseInput,
): Civ7PlayNotificationSummary | undefined {
  return view.notifications.find((notification) => {
    const typeName = String(notification.typeName ?? "").toUpperCase();
    if (typeName !== "NOTIFICATION_DIPLOMATIC_RESPONSE_REQUIRED") return false;
    return notificationActionId(notification) === input.actionId;
  });
}

function notificationActionId(notification: Civ7PlayNotificationSummary): number | undefined {
  if (!isRecord(notification.target)) return undefined;
  return typeof notification.target.id === "number" ? notification.target.id : undefined;
}

function sameComponentId(left: Civ7ComponentId | null | undefined, right: Civ7ComponentId | null | undefined): boolean {
  if (left == null || right == null) return left == null && right == null;
  return left.owner === right.owner && left.id === right.id && left.type === right.type;
}

function probeValue<T>(probe: Civ7RuntimeProbe<T>): T | undefined {
  return probe.ok ? probe.value : undefined;
}

function stableJson(value: unknown): string {
  return JSON.stringify(value, Object.keys(flattenKeys(value)).sort()) ?? String(value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function flattenKeys(value: unknown, keys: Record<string, true> = {}): Record<string, true> {
  if (Array.isArray(value)) {
    for (const item of value) flattenKeys(item, keys);
  } else if (isRecord(value)) {
    for (const [key, child] of Object.entries(value)) {
      keys[key] = true;
      flattenKeys(child, keys);
    }
  }
  return keys;
}

async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

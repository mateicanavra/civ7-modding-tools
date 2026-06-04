import { probeValue } from "./probe-values.js";
import { isRecord, stableJson } from "./stable-json.js";
import type { Civ7OperationValidationResult } from "./types.js";
import type {
  Civ7NarrativeChoiceCommandPayload,
  Civ7NarrativeChoiceInput,
} from "./narrative-request.js";
import type { Civ7ComponentId } from "../../civ7-component-id.js";
import type { Civ7RuntimeProbe } from "../../runtime/probe.js";
import type { Civ7DirectControlOptions } from "../../session/types.js";
import type {
  Civ7PlayNotificationSummary,
  Civ7PlayNotificationViewResult,
} from "../notifications/view.js";

export type Civ7NarrativeChoicePostconditionClassification =
  | "not-sent"
  | "turn-unblocked"
  | "narrative-blocker-cleared"
  | "narrative-panel-cleared"
  | "validation-changed"
  | "no-state-change";

export type Civ7NarrativeChoicePostcondition = Readonly<{
  classification: Civ7NarrativeChoicePostconditionClassification;
  reason: string;
}>;

export async function waitForCiv7NarrativeChoiceAfter(
  input: Civ7NarrativeChoiceInput,
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
    const candidate = narrativeChoicePostcondition(input, true, before, last, beforeValidation, beforeValidation, undefined);
    if (candidate.classification !== "no-state-change") return last;
    await sleep(pollIntervalMs);
    last = await readPlayNotifications(options);
  }
  return last;
}

export function narrativeChoicePostcondition(
  input: Civ7NarrativeChoiceInput,
  sent: boolean,
  before: Civ7PlayNotificationViewResult,
  after: Civ7PlayNotificationViewResult,
  beforeValidation: Civ7OperationValidationResult,
  afterValidation: Civ7OperationValidationResult,
  payload: Civ7NarrativeChoiceCommandPayload | undefined,
): Civ7NarrativeChoicePostcondition {
  const classification = classifyNarrativeChoicePostcondition(input, sent, before, after, beforeValidation, afterValidation, payload);
  return {
    classification,
    reason: narrativeChoicePostconditionReason(classification),
  };
}

function classifyNarrativeChoicePostcondition(
  input: Civ7NarrativeChoiceInput,
  sent: boolean,
  before: Civ7PlayNotificationViewResult,
  after: Civ7PlayNotificationViewResult,
  beforeValidation: Civ7OperationValidationResult,
  afterValidation: Civ7OperationValidationResult,
  payload: Civ7NarrativeChoiceCommandPayload | undefined,
): Civ7NarrativeChoicePostconditionClassification {
  if (!sent) return "not-sent";
  if (probeValue(after.canEndTurn) === true) return "turn-unblocked";
  const beforeMatch = findNarrativeChoiceNotification(before);
  const afterMatch = findNarrativeChoiceNotification(after);
  if (sameNarrativeChoiceNotification(beforeMatch, afterMatch)) return "no-state-change";
  if (beforeMatch && !afterMatch) return "narrative-blocker-cleared";
  if (payload && narrativePanelCleared(payload)) return "narrative-panel-cleared";
  if (beforeValidation.valid !== afterValidation.valid || stableJson(beforeValidation.result) !== stableJson(afterValidation.result)) {
    return "validation-changed";
  }
  return "no-state-change";
}

function narrativeChoicePostconditionReason(classification: Civ7NarrativeChoicePostconditionClassification): string {
  switch (classification) {
    case "not-sent":
      return "The narrative choice was not sent, either because validation failed before send or the App UI closeout reported no send.";
    case "turn-unblocked":
      return "The narrative choice and UI handling left the turn unblocked.";
    case "narrative-blocker-cleared":
      return "The narrative/discovery choice notification is no longer present as a blocking decision.";
    case "narrative-panel-cleared":
      return "The visible narrative panel for the selected story target was closed after the choice.";
    case "validation-changed":
      return "The narrative choice validator changed after the send, but notification/turn state did not clearly clear.";
    case "no-state-change":
      return "The narrative choice was sent, but the same narrative blocker remained live without a turn-unblock or blocker transition.";
  }
}

function findNarrativeChoiceNotification(view: Civ7PlayNotificationViewResult): Civ7PlayNotificationSummary | undefined {
  return view.notifications.find((notification) => {
    const typeName = String(notification.typeName ?? "").toUpperCase();
    return notification.isEndTurnBlocking === true
      && typeName.includes("CHOOSE")
      && (typeName.includes("NARRATIVE_STORY_DIRECTION")
        || typeName.includes("DISCOVERY_STORY_DIRECTION")
        || typeName.includes("AUTO_NARRATIVE_STORY_DIRECTION"));
  });
}

function narrativePanelCleared(payload: Civ7NarrativeChoiceCommandPayload): boolean {
  const beforeCount = numericField(payload.ui.before, "matchingPanelCount");
  const afterCount = numericField(payload.ui.after, "matchingPanelCount");
  return beforeCount !== undefined && beforeCount > 0 && afterCount === 0;
}

function sameNarrativeChoiceNotification(
  before: Civ7PlayNotificationSummary | undefined,
  after: Civ7PlayNotificationSummary | undefined,
): boolean {
  if (!before || !after) return false;
  return sameComponentId(before.id, after.id);
}

function numericField(value: unknown, field: string): number | undefined {
  if (!isRecord(value)) return undefined;
  const candidate = value[field];
  return typeof candidate === "number" ? candidate : undefined;
}

function sameComponentId(left: Civ7ComponentId | null | undefined, right: Civ7ComponentId | null | undefined): boolean {
  if (left == null || right == null) return left == null && right == null;
  return left.owner === right.owner && left.id === right.id && left.type === right.type;
}

async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

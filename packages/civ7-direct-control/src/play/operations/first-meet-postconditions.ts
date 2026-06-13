import type { Civ7ComponentId } from "../../civ7-component-id";
import type { Civ7DirectControlOptions } from "../../session/types";
import type {
  Civ7PlayNotificationSummary,
  Civ7PlayNotificationViewResult,
} from "../notifications/view";
import { sameComponentId } from "./component-id";
import { probeValue } from "./probe-values";

export type Civ7FirstMeetResponsePostconditionClassification =
  | "not-sent"
  | "turn-unblocked"
  | "first-meet-cleared"
  | "first-meet-blocker-transitioned"
  | "first-meet-sticky-blocker"
  | "first-meet-blocker-unmatched";

export type Civ7FirstMeetResponsePostcondition = Readonly<{
  classification: Civ7FirstMeetResponsePostconditionClassification;
  reason: string;
}>;

export async function waitForCiv7FirstMeetResponseAfter(
  metPlayerId: number,
  options: Civ7DirectControlOptions,
  before: Civ7PlayNotificationViewResult,
  readPlayNotifications: (
    options: Civ7DirectControlOptions
  ) => Promise<Civ7PlayNotificationViewResult>
): Promise<Civ7PlayNotificationViewResult> {
  const waitTimeoutMs = Math.min(Math.max(options.timeoutMs ?? 3_000, 1_000), 6_000);
  const pollIntervalMs = 250;
  const startedAt = Date.now();
  let last = await readPlayNotifications(options);
  while (Date.now() - startedAt <= waitTimeoutMs) {
    const candidate = firstMeetResponsePostcondition(true, before, last, metPlayerId);
    if (candidate.classification !== "first-meet-sticky-blocker") return last;
    await sleep(pollIntervalMs);
    last = await readPlayNotifications(options);
  }
  return last;
}

export function firstMeetResponsePostcondition(
  sent: boolean,
  before: Civ7PlayNotificationViewResult,
  after: Civ7PlayNotificationViewResult,
  metPlayerId: number
): Civ7FirstMeetResponsePostcondition {
  const classification = classifyFirstMeetResponsePostcondition(sent, before, after, metPlayerId);
  return {
    classification,
    reason: firstMeetResponsePostconditionReason(classification),
  };
}

function classifyFirstMeetResponsePostcondition(
  sent: boolean,
  before: Civ7PlayNotificationViewResult,
  after: Civ7PlayNotificationViewResult,
  metPlayerId: number
): Civ7FirstMeetResponsePostconditionClassification {
  if (!sent) return "not-sent";
  if (probeValue(after.canEndTurn) === true) return "turn-unblocked";
  const beforeBlocker = findFirstMeetNotification(before, metPlayerId);
  if (!beforeBlocker) return "first-meet-blocker-unmatched";
  const afterBlocker = findFirstMeetNotification(after, metPlayerId);
  if (!afterBlocker) return "first-meet-cleared";
  if (
    !sameComponentId(firstMeetNotificationId(beforeBlocker), firstMeetNotificationId(afterBlocker))
  ) {
    return "first-meet-blocker-transitioned";
  }
  return "first-meet-sticky-blocker";
}

function firstMeetResponsePostconditionReason(
  classification: Civ7FirstMeetResponsePostconditionClassification
): string {
  switch (classification) {
    case "not-sent":
      return "The first-meet response was not sent, so no postcondition can be verified.";
    case "turn-unblocked":
      return "The first-meet response left the turn unblocked.";
    case "first-meet-cleared":
      return "The matching first-meet notification is no longer end-turn-blocking.";
    case "first-meet-blocker-transitioned":
      return "A matching first-meet blocker changed identity after the response but still blocks turn flow.";
    case "first-meet-sticky-blocker":
      return "The first-meet operation returned, but the same first-meet notification still blocks turn flow.";
    case "first-meet-blocker-unmatched":
      return "No matching end-turn-blocking first-meet notification was captured before the send.";
  }
}

function findFirstMeetNotification(
  view: Civ7PlayNotificationViewResult,
  metPlayerId: number
): Civ7PlayNotificationSummary | undefined {
  return view.notifications.find((notification) => {
    const typeName = String(notification.typeName ?? "").toUpperCase();
    if (notification.isEndTurnBlocking !== true || !typeName.includes("PLAYER_MET")) return false;
    const player = notificationPlayerId(notification);
    return player == null || player === metPlayerId;
  });
}

function firstMeetNotificationId(
  notification: Civ7PlayNotificationSummary
): Civ7ComponentId | undefined {
  const id = notification.id;
  if (id && typeof id.owner === "number" && typeof id.id === "number") return id;
  return undefined;
}

function notificationPlayerId(value: unknown): number | null {
  if (!isRecord(value)) return null;
  if (typeof value.player === "number") return value.player;
  const details = value.details;
  if (isRecord(details) && typeof details.player2 === "number") return details.player2;
  const decision = value.decision;
  if (isRecord(decision) && typeof decision.player === "number") return decision.player;
  return null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

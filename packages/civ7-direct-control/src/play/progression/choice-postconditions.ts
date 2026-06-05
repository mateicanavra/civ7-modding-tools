export type Civ7ProgressionChoiceNotification = Readonly<{
  id?: unknown;
  typeName?: unknown;
  isEndTurnBlocking?: unknown;
  details?: unknown;
}>;

export type Civ7ProgressionChoiceNotificationView = Readonly<{
  canEndTurn?: unknown;
  notifications: readonly Civ7ProgressionChoiceNotification[];
}>;

export type Civ7TechnologyChoicePostconditionClassification =
  | "turn-unblocked"
  | "technology-choice-cleared"
  | "technology-choice-transitioned"
  | "technology-state-changed-blocker-still-live"
  | "technology-choice-sticky-blocker";

export type Civ7CultureChoicePostconditionClassification =
  | "turn-unblocked"
  | "culture-choice-cleared"
  | "culture-choice-transitioned"
  | "culture-state-changed-blocker-still-live"
  | "culture-choice-sticky-blocker";

export type Civ7ProgressionChoicePostcondition<
  Classification extends string,
> = Readonly<{
  classification: Classification;
  verified: boolean;
  reason: string;
}>;

type ProgressionChoicePolicy<Classification extends string> = Readonly<{
  typeToken: string;
  cleared: Classification;
  transitioned: Classification;
  stateChangedBlockerStillLive: Classification;
  stickyBlocker: Classification;
  unblockedReason: string;
  clearedReason: string;
  transitionedReason: string;
  stateChangedBlockerStillLiveReason: string;
  stickyBlockerReason: string;
}>;

export function technologyChoicePostcondition(
  before: Civ7ProgressionChoiceNotificationView,
  after: Civ7ProgressionChoiceNotificationView,
): Civ7ProgressionChoicePostcondition<
  Civ7TechnologyChoicePostconditionClassification
> {
  return progressionChoicePostcondition(before, after, {
    typeToken: "CHOOSE_TECH",
    cleared: "technology-choice-cleared",
    transitioned: "technology-choice-transitioned",
    stateChangedBlockerStillLive:
      "technology-state-changed-blocker-still-live",
    stickyBlocker: "technology-choice-sticky-blocker",
    unblockedReason: "The technology choice workflow left the turn unblocked.",
    clearedReason:
      "The end-turn-blocking technology choice notification is no longer present.",
    transitionedReason:
      "The end-turn-blocking technology choice notification changed after the selection.",
    stateChangedBlockerStillLiveReason:
      "The technology state changed, but the same technology choice notification still blocks turn flow.",
    stickyBlockerReason:
      "The technology choice workflow returned, but the same technology choice notification still blocks turn flow.",
  });
}

export function cultureChoicePostcondition(
  before: Civ7ProgressionChoiceNotificationView,
  after: Civ7ProgressionChoiceNotificationView,
): Civ7ProgressionChoicePostcondition<
  Civ7CultureChoicePostconditionClassification
> {
  return progressionChoicePostcondition(before, after, {
    typeToken: "CHOOSE_CULTURE",
    cleared: "culture-choice-cleared",
    transitioned: "culture-choice-transitioned",
    stateChangedBlockerStillLive: "culture-state-changed-blocker-still-live",
    stickyBlocker: "culture-choice-sticky-blocker",
    unblockedReason: "The culture choice workflow left the turn unblocked.",
    clearedReason:
      "The end-turn-blocking culture choice notification is no longer present.",
    transitionedReason:
      "The end-turn-blocking culture choice notification changed after the selection.",
    stateChangedBlockerStillLiveReason:
      "The culture state changed, but the same culture choice notification still blocks turn flow.",
    stickyBlockerReason:
      "The culture choice workflow returned, but the same culture choice notification still blocks turn flow.",
  });
}

export function findTechnologyChoiceNotification(
  view: Civ7ProgressionChoiceNotificationView,
): Civ7ProgressionChoiceNotification | null {
  return findProgressionChoiceNotification(view, "CHOOSE_TECH");
}

export function findCultureChoiceNotification(
  view: Civ7ProgressionChoiceNotificationView,
): Civ7ProgressionChoiceNotification | null {
  return findProgressionChoiceNotification(view, "CHOOSE_CULTURE");
}

function progressionChoicePostcondition<Classification extends string>(
  before: Civ7ProgressionChoiceNotificationView,
  after: Civ7ProgressionChoiceNotificationView,
  policy: ProgressionChoicePolicy<Classification>,
): Civ7ProgressionChoicePostcondition<Classification | "turn-unblocked"> {
  if (probeValue(after.canEndTurn) === true) {
    return {
      classification: "turn-unblocked",
      verified: true,
      reason: policy.unblockedReason,
    };
  }

  const beforeBlocker = findProgressionChoiceNotification(
    before,
    policy.typeToken,
  );
  const afterBlocker = findProgressionChoiceNotification(after, policy.typeToken);
  if (beforeBlocker && !afterBlocker) {
    return {
      classification: policy.cleared,
      verified: true,
      reason: policy.clearedReason,
    };
  }

  if (
    beforeBlocker && afterBlocker
    && !sameNotificationId(beforeBlocker.id, afterBlocker.id)
  ) {
    return {
      classification: policy.transitioned,
      verified: true,
      reason: policy.transitionedReason,
    };
  }

  if (
    beforeBlocker && afterBlocker
    && progressionChoiceDetailsChanged(beforeBlocker.details, afterBlocker.details)
  ) {
    return {
      classification: policy.stateChangedBlockerStillLive,
      verified: false,
      reason: policy.stateChangedBlockerStillLiveReason,
    };
  }

  return {
    classification: policy.stickyBlocker,
    verified: false,
    reason: policy.stickyBlockerReason,
  };
}

function findProgressionChoiceNotification(
  view: Civ7ProgressionChoiceNotificationView,
  typeToken: string,
): Civ7ProgressionChoiceNotification | null {
  return view.notifications.find((notification) => {
    const typeName = String(notification.typeName ?? "").toUpperCase();
    return notification.isEndTurnBlocking === true && typeName.includes(typeToken);
  }) ?? null;
}

function sameNotificationId(left: unknown, right: unknown): boolean {
  if (!isRecord(left) || !isRecord(right)) return left == null && right == null;
  return left.owner === right.owner && left.id === right.id
    && left.type === right.type;
}

function progressionChoiceDetailsChanged(left: unknown, right: unknown): boolean {
  if (!isRecord(left) || !isRecord(right)) return false;
  return stableJson(probeValue(left.currentResearching))
      !== stableJson(probeValue(right.currentResearching))
    || stableJson(probeValue(left.targetNode))
      !== stableJson(probeValue(right.targetNode));
}

function probeValue(value: unknown): unknown {
  if (value && typeof value === "object" && "ok" in value) {
    const probe = value as { ok?: unknown; value?: unknown };
    return probe.ok === true ? probe.value ?? null : null;
  }
  return value ?? null;
}

function stableJson(value: unknown): string {
  return JSON.stringify(value, Object.keys(flattenKeys(value)).sort())
    ?? String(value);
}

function flattenKeys(
  value: unknown,
  keys: Record<string, true> = {},
): Record<string, true> {
  if (Array.isArray(value)) {
    for (const item of value) flattenKeys(item, keys);
    return keys;
  }
  if (!isRecord(value)) return keys;
  for (const [key, child] of Object.entries(value)) {
    keys[key] = true;
    flattenKeys(child, keys);
  }
  return keys;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

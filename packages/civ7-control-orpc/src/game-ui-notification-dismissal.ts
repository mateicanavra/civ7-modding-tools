import {
  notificationDismissalPostcondition,
  notificationDismissalPostconditionConfirmed,
} from "@civ7/direct-control/play/notifications/postconditions";
import type {
  Civ7NotificationDismissalResult,
  Civ7NotificationDismissalSummary,
  Civ7NotificationDismissInput,
} from "@civ7/direct-control";

import type { Civ7ControlOrpcComponentId } from "./model/primitives";

type Civ7ComponentId = Civ7ControlOrpcComponentId;
type Civ7RuntimeProbe<T> = Readonly<
  | { ok: true; value: T }
  | { ok: false; error: string }
>;

type DismissRouteResult = Readonly<{
  ok: boolean;
  attempted: boolean;
  available: boolean;
  path?: string;
  value?: unknown;
  error?: string;
  reason?: string;
}>;

export type Civ7GameUiNotificationDismissalTarget = Readonly<{
  GameContext?: {
    localPlayerID?: number;
  };
  EndTurnBlockingTypes?: Record<string, number>;
  Game?: {
    Notifications?: {
      find?: (id: Civ7ComponentId) => unknown;
      getType?: (id: Civ7ComponentId | null) => unknown;
      getTypeName?: (type: unknown) => string | null;
      getSummary?: (id: Civ7ComponentId | null) => string | null;
      getMessage?: (id: Civ7ComponentId | null) => string | null;
      getBlocksTurnAdvancement?: (id: Civ7ComponentId | null) => unknown;
      getEndTurnBlockingType?: (playerId: number) => unknown;
      findEndTurnBlocking?: (
        playerId: number,
        blockerType: unknown,
      ) => Civ7ComponentId | null;
      getIdsForPlayer?: (playerId: number) => unknown;
      dismiss?: (id: Civ7ComponentId) => unknown;
    };
  };
  NotificationModel?: {
    QueryBy?: Record<string, number>;
    manager?: {
      dismiss?: (id: Civ7ComponentId) => unknown;
      onDismiss?: (id: Civ7ComponentId) => unknown;
      findPlayer?: (playerId: number) => unknown;
    };
  };
}>;

export async function requestCiv7GameUiNotificationDismissal(
  input: Civ7NotificationDismissInput,
  target: Civ7GameUiNotificationDismissalTarget = globalThis as Civ7GameUiNotificationDismissalTarget,
): Promise<Civ7NotificationDismissalResult> {
  assertGameUiComponentId(input.notificationId, "notificationId");
  return notificationDismissalResult(
    input.notificationId,
    { send: true },
    target,
  );
}

function notificationDismissalResult(
  notificationId: Civ7ComponentId,
  options: Readonly<{ send: boolean }>,
  target: Civ7GameUiNotificationDismissalTarget,
): Civ7NotificationDismissalResult {
  const before = summarizeNotification(notificationId, target);
  const noneBlocker = target.EndTurnBlockingTypes?.NONE ?? 0;
  const blockerType = before.endTurnBlockingType.ok
    ? before.endTurnBlockingType.value
    : null;
  const canUseExpiredPanelCloseControl =
    before.exists === true
    && before.expired === true
    && blockerType === noneBlocker;
  const canDismiss = before.exists === true
    && (before.canUserDismiss === true || canUseExpiredPanelCloseControl);
  const notes = [
    "This is an App UI notification action, not a gameplay operation family.",
    "Use it only for reviewed notifications whose official handler does not require a specialized operation.",
    "Game UI controller mode executes in process and does not use tuner command serialization.",
    "Verification is identity-based: disappeared, dismissed, removed from the engine queue or notification train, or moved off a front position it occupied before send.",
  ];

  if (options.send !== true || !canDismiss) {
    return withPostcondition({
      host: "game-ui",
      port: 0,
      state: { id: "game-ui", name: "Game UI" },
      notificationId,
      before,
      after: options.send ? before : null,
      canDismiss,
      sent: false,
      result: null,
      closeoutPath: null,
      verificationAttempts: options.send ? [before] : [],
      verified: false,
      notes: canDismiss
        ? notes
        : notes.concat([
          "Notification was not dismissed because canUserDismiss was not true.",
        ]),
    });
  }

  const managerResult = notificationTrainManagerDismiss(notificationId, target);
  const panelCloseControlResult = panelCloseControlDismiss(
    notificationId,
    before,
    target,
  );
  const after = summarizeNotification(notificationId, target);
  const closeoutPath = [managerResult, panelCloseControlResult]
    .filter((value) => value.attempted && value.path)
    .map((value) => value.path!)
    .join("+") || null;
  const result = {
    notificationTrainManager: managerResult,
    panelCloseControl: panelCloseControlResult,
  };
  const postcondition = notificationDismissalPostcondition({
    sent: true,
    before,
    after,
  });

  return {
    host: "game-ui",
    port: 0,
    state: { id: "game-ui", name: "Game UI" },
    notificationId,
    before,
    after,
    canDismiss,
    sent: true,
    result,
    closeoutPath,
    verificationAttempts: [after],
    verified: notificationDismissalPostconditionConfirmed(
      postcondition.classification,
    ),
    postcondition,
    notes,
  };
}

function withPostcondition(
  result: Omit<Civ7NotificationDismissalResult, "postcondition">,
): Civ7NotificationDismissalResult {
  return {
    ...result,
    postcondition: notificationDismissalPostcondition(result),
  };
}

function summarizeNotification(
  id: Civ7ComponentId,
  target: Civ7GameUiNotificationDismissalTarget,
): Civ7NotificationDismissalSummary {
  const normalizedId = toComponentId(id);
  const notifications = target.Game?.Notifications;
  const notification = normalizedId && notifications?.find
    ? safeValue(() => notifications.find?.(normalizedId) ?? null, null)
    : null;
  const type = safeValue(
    () =>
      typeof notifications?.getType === "function"
        ? notifications.getType(normalizedId)
        : notificationValue(notification, "Type"),
    null,
  );
  const localPlayerId = target.GameContext?.localPlayerID ?? -1;
  const endTurnBlockingType = probe(() =>
    notifications?.getEndTurnBlockingType?.(localPlayerId) ?? null
  );
  const engineIds = engineQueueIds(target, localPlayerId);
  const trainIds = notificationTrainQueueIds(target, localPlayerId);
  const engineQueueFirstId = probe(() => engineIds[0] ?? null);
  const notificationTrainFirstId = probe(() => trainIds[0] ?? null);

  return {
    id: normalizedId,
    exists: notification != null,
    type,
    typeName: safeValue(
      () =>
        typeof notifications?.getTypeName === "function"
          ? notifications.getTypeName(type)
          : null,
      null,
    ),
    summary: safeStringValue(
      () =>
        typeof notifications?.getSummary === "function"
          ? notifications.getSummary(normalizedId)
          : notificationValue(notification, "Summary"),
    ),
    message: safeStringValue(
      () =>
        typeof notifications?.getMessage === "function"
          ? notifications.getMessage(normalizedId)
          : notificationValue(notification, "Message"),
    ),
    target: notificationValue(notification, "Target"),
    location: notificationValue(notification, "Location"),
    canUserDismiss: notificationValue(notification, "CanUserDismiss"),
    expired: notificationValue(notification, "Expired"),
    dismissed: notificationValue(notification, "Dismissed"),
    blocksTurnAdvancement: probe(() =>
      typeof notifications?.getBlocksTurnAdvancement === "function"
        ? notifications.getBlocksTurnAdvancement(normalizedId)
        : notificationValue(notification, "BlocksTurnAdvancement")
    ),
    endTurnBlockingType,
    isEndTurnBlocking: probe(() => {
      const blockerType = endTurnBlockingType.ok
        ? endTurnBlockingType.value
        : notifications?.getEndTurnBlockingType?.(localPlayerId);
      const blockerId = notifications?.findEndTurnBlocking?.(
        localPlayerId,
        blockerType,
      );
      return componentKey(blockerId) === componentKey(normalizedId);
    }),
    engineQueueCount: probe(() => engineIds.length),
    engineQueueContains: probe(() =>
      engineIds.some((value) => componentKey(value) === componentKey(normalizedId))
    ),
    engineQueueFirstId,
    isEngineQueueFront: probe(() =>
      componentKey(engineQueueFirstId.ok ? engineQueueFirstId.value : null)
        === componentKey(normalizedId)
    ),
    notificationTrainCount: probe(() => trainIds.length),
    notificationTrainContains: probe(() =>
      trainIds.some((value) => componentKey(value) === componentKey(normalizedId))
    ),
    notificationTrainFirstId,
    isNotificationTrainFront: probe(() =>
      componentKey(
        notificationTrainFirstId.ok ? notificationTrainFirstId.value : null,
      ) === componentKey(normalizedId)
    ),
  };
}

function notificationTrainManagerDismiss(
  notificationId: Civ7ComponentId,
  target: Civ7GameUiNotificationDismissalTarget,
): DismissRouteResult {
  const manager = target.NotificationModel?.manager;
  if (!manager) {
    return {
      ok: false,
      attempted: false,
      available: false,
      reason: "NotificationModel.manager unavailable in this App UI scope",
    };
  }
  if (typeof manager.dismiss === "function") {
    return callDismiss("NotificationModel.manager.dismiss", () =>
      manager.dismiss?.(notificationId)
    );
  }
  if (typeof manager.onDismiss === "function") {
    return callDismiss("NotificationModel.manager.onDismiss", () =>
      manager.onDismiss?.(notificationId)
    );
  }
  return {
    ok: false,
    attempted: false,
    available: false,
    reason: "NotificationModel.manager exposes no dismiss/onDismiss function",
  };
}

function panelCloseControlDismiss(
  notificationId: Civ7ComponentId,
  before: Civ7NotificationDismissalSummary,
  target: Civ7GameUiNotificationDismissalTarget,
): DismissRouteResult {
  const dismiss = target.Game?.Notifications?.dismiss;
  if (typeof dismiss !== "function") {
    return {
      ok: false,
      attempted: false,
      available: false,
      reason: "Game.Notifications.dismiss unavailable in this App UI scope",
    };
  }
  const noneBlocker = target.EndTurnBlockingTypes?.NONE ?? 0;
  const blockingType = before.endTurnBlockingType.ok
    ? before.endTurnBlockingType.value
    : null;
  if (
    blockingType != null
    && blockingType !== noneBlocker
    && before.isEndTurnBlocking.ok
    && before.isEndTurnBlocking.value === true
  ) {
    return {
      ok: false,
      attempted: false,
      available: false,
      path: "Game.Notifications.dismiss",
      reason:
        "official panel close control does not dismiss the active end-turn blocker",
    };
  }
  return callDismiss("Game.Notifications.dismiss", () => dismiss(notificationId));
}

function callDismiss(path: string, fn: () => unknown): DismissRouteResult {
  try {
    return {
      ok: true,
      attempted: true,
      available: true,
      path,
      value: fn(),
    };
  } catch (err) {
    return {
      ok: false,
      attempted: true,
      available: true,
      path,
      error: String(err),
    };
  }
}

function engineQueueIds(
  target: Civ7GameUiNotificationDismissalTarget,
  playerId: number,
): Civ7ComponentId[] {
  const ids = safeValue(
    () => target.Game?.Notifications?.getIdsForPlayer?.(playerId),
    [],
  );
  return Array.isArray(ids) ? ids.map(toComponentId).filter(isPresent) : [];
}

function notificationTrainQueueIds(
  target: Civ7GameUiNotificationDismissalTarget,
  playerId: number,
): Civ7ComponentId[] {
  const manager = target.NotificationModel?.manager;
  const playerEntry = manager?.findPlayer?.(playerId) as
    | { getTypesBy?: (queryBy: number, includeExpired: boolean) => unknown }
    | null
    | undefined;
  if (typeof playerEntry?.getTypesBy !== "function") return [];
  const queryBy = target.NotificationModel?.QueryBy?.Priority ?? 2;
  const entries = safeValue(() => playerEntry.getTypesBy?.(queryBy, true), []);
  if (!Array.isArray(entries)) return [];
  const ids: Civ7ComponentId[] = [];
  for (const entry of entries) {
    const notifications = (entry as { notifications?: unknown }).notifications;
    if (!Array.isArray(notifications)) continue;
    for (const value of notifications) {
      const id = toComponentId(value);
      if (id) ids.push(id);
    }
  }
  return ids;
}

function toComponentId(value: unknown): Civ7ComponentId | null {
  if (value == null || typeof value !== "object") return null;
  const candidate = value as Partial<Civ7ComponentId>;
  if (typeof candidate.owner !== "number" || typeof candidate.id !== "number") {
    return null;
  }
  return typeof candidate.type === "number"
    ? { owner: candidate.owner, id: candidate.id, type: candidate.type }
    : { owner: candidate.owner, id: candidate.id };
}

function assertGameUiComponentId(
  value: unknown,
  label = "ComponentID",
): asserts value is Civ7ComponentId {
  if (toComponentId(value)) return;
  throw new Error(
    `${label} must be a Civ7 ComponentID object with numeric owner, id, and optional type`,
  );
}

function componentKey(value: unknown): string {
  const id = toComponentId(value);
  return id ? [id.owner, id.id, id.type ?? ""].join(":") : "";
}

function notificationValue(notification: unknown, key: string): unknown {
  if (notification == null || typeof notification !== "object") return null;
  return safeValue(() => {
    const value = (notification as Record<string, unknown>)[key];
    return typeof value === "function"
      ? (value as () => unknown).call(notification)
      : value ?? null;
  }, null);
}

function probe<T>(fn: () => T): Civ7RuntimeProbe<T> {
  try {
    return { ok: true, value: fn() };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

function safeValue<T>(fn: () => T, fallback: T): T {
  try {
    return fn();
  } catch {
    return fallback;
  }
}

function safeStringValue(fn: () => unknown): string | null {
  const value = safeValue(fn, null);
  return typeof value === "string" ? value : null;
}

function isPresent<T>(value: T | null | undefined): value is T {
  return value != null;
}

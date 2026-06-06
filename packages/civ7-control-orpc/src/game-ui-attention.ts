import type {
  Civ7ControlOrpcPlayNotificationViewResult,
  Civ7ControlOrpcReadyCityViewResult,
  Civ7ControlOrpcReadyUnitViewResult,
  Civ7ControlOrpcTurnCompletionRequestResult,
  Civ7ControlOrpcTurnCompletionStatusResult,
} from "./dependencies/direct-control";
import type { Civ7ControlOrpcComponentId } from "./model/primitives";

type RuntimeProbe<T> = Readonly<
  | { ok: true; value: T }
  | { ok: false; error: string }
>;

type PlayNotificationSummary =
  Civ7ControlOrpcPlayNotificationViewResult["notifications"][number];
type PlayDecisionHint = PlayNotificationSummary["decision"];

export type Civ7GameUiAttentionTarget = Readonly<{
  GameContext?: {
    localPlayerID?: number;
    hasSentTurnComplete?: () => boolean;
    sendTurnComplete?: () => unknown;
  };
  Game?: {
    turn?: number;
    getTurnDate?: () => string;
    Notifications?: {
      find?: (id: Civ7ControlOrpcComponentId) => unknown;
      getIdsForPlayer?: (playerId: number) => unknown;
      getType?: (id: Civ7ControlOrpcComponentId | null) => unknown;
      getTypeName?: (type: unknown) => string | null;
      getSummary?: (id: Civ7ControlOrpcComponentId | null) => string | null;
      getMessage?: (id: Civ7ControlOrpcComponentId | null) => string | null;
      getBlocksTurnAdvancement?: (
        id: Civ7ControlOrpcComponentId | null,
      ) => unknown;
      getEndTurnBlockingType?: (playerId: number) => unknown;
      findEndTurnBlocking?: (
        playerId: number,
        blockerType: unknown,
      ) => Civ7ControlOrpcComponentId | null;
    };
  };
  Players?: {
    Cities?: {
      get?: (playerId: number) => unknown;
    };
  };
  UI?: {
    Player?: {
      getHeadSelectedUnit?: () => unknown;
      getFirstReadyUnit?: () => unknown;
      getHeadSelectedCity?: () => unknown;
      deselectAllUnits?: () => unknown;
    };
  };
  Units?: {
    get?: (id: Civ7ControlOrpcComponentId) => unknown;
  };
  Cities?: {
    get?: (id: Civ7ControlOrpcComponentId) => unknown;
  };
  canEndTurn?: () => boolean;
}>;

export type Civ7GameUiAttentionOptions = Readonly<{
  maxNotifications?: number;
}>;

export type Civ7GameUiReadyUnitOptions = Readonly<{
  unitId?: Civ7ControlOrpcComponentId;
}>;

export type Civ7GameUiReadyCityOptions = Readonly<{
  cityId?: Civ7ControlOrpcComponentId;
}>;

export async function getCiv7GameUiPlayNotificationView(
  options: Civ7GameUiAttentionOptions = {},
  target: Civ7GameUiAttentionTarget = globalThis as Civ7GameUiAttentionTarget,
): Promise<Civ7ControlOrpcPlayNotificationViewResult> {
  const localPlayerId = target.GameContext?.localPlayerID ?? -1;
  const maxNotifications = clampMaxNotifications(options.maxNotifications);
  const notificationRead = gameUiNotificationSummaries(
    target,
    localPlayerId,
    maxNotifications,
  );
  const blocker = gameUiEndTurnBlocker(target, localPlayerId);

  return {
    host: "game-ui",
    port: 0,
    state: { id: "game-ui", name: "Game UI" },
    localPlayerId,
    turn: probe(() => target.Game?.turn ?? -1),
    turnDate: probe(() => target.Game?.getTurnDate?.() ?? ""),
    hasSentTurnComplete: probe(() =>
      target.GameContext?.hasSentTurnComplete?.() ?? false
    ),
    canEndTurn: probe(() => target.canEndTurn?.() ?? false),
    blocker,
    blockingNotificationId: probe(() =>
      target.Game?.Notifications?.findEndTurnBlocking?.(
        localPlayerId,
        blocker.ok ? blocker.value : null,
      ) ?? null
    ),
    selectedUnitId: ok(null),
    selectedCityId: ok(null),
    firstReadyUnitId: probe(() =>
      toComponentId(target.UI?.Player?.getFirstReadyUnit?.())
    ),
    notifications: notificationRead.notifications,
    decisions: notificationRead.notifications.map((notification) =>
      notification.decision
    ),
    hud: {
      nextDecision: notificationDecisionQueueItem(
        notificationRead.notifications[0] ?? null,
      ),
      decisionQueue: notificationRead.notifications
        .map(notificationDecisionQueueItem)
        .filter(isPresent),
    },
    limits: {
      maxNotifications,
      truncated: notificationRead.truncated,
    },
  };
}

export async function getCiv7GameUiTurnCompletionStatus(
  target: Civ7GameUiAttentionTarget = globalThis as Civ7GameUiAttentionTarget,
): Promise<Civ7ControlOrpcTurnCompletionStatusResult> {
  const localPlayerId = target.GameContext?.localPlayerID ?? -1;
  return {
    host: "game-ui",
    port: 0,
    state: { id: "game-ui", name: "Game UI" },
    localPlayerId,
    turn: probe(() => target.Game?.turn ?? -1),
    turnDate: probe(() => target.Game?.getTurnDate?.() ?? ""),
    hasSentTurnComplete: probe(() =>
      target.GameContext?.hasSentTurnComplete?.() ?? false
    ),
    canEndTurn: probe(() => target.canEndTurn?.() ?? false),
    blocker: gameUiEndTurnBlocker(target, localPlayerId),
    firstReadyUnitId: probe(() =>
      toComponentId(target.UI?.Player?.getFirstReadyUnit?.())
    ),
  };
}

export async function getCiv7GameUiReadyUnitView(
  input: Civ7GameUiReadyUnitOptions = {},
  target: Civ7GameUiAttentionTarget = globalThis as Civ7GameUiAttentionTarget,
): Promise<Civ7ControlOrpcReadyUnitViewResult> {
  const selectedUnitId = probe(() =>
    toComponentId(target.UI?.Player?.getHeadSelectedUnit?.())
  );
  const firstReadyUnitId = probe(() => {
    const readFirstReadyUnit = target.UI?.Player?.getFirstReadyUnit;
    if (typeof readFirstReadyUnit !== "function") {
      throw new Error("UI.Player.getFirstReadyUnit is unavailable");
    }
    return toComponentId(readFirstReadyUnit());
  });
  const requestedUnitId = toComponentId(input.unitId);
  const unitId = firstReadyUnitId.ok ? firstReadyUnitId.value : null;

  return {
    host: "game-ui",
    port: 0,
    state: { id: "game-ui", name: "Game UI" },
    localPlayerId: target.GameContext?.localPlayerID ?? -1,
    requestedUnitId,
    selectedUnitId,
    firstReadyUnitId,
    unitId,
    unit: probe(() => unitId == null ? null : target.Units?.get?.(unitId) ?? null),
    legalOperations: [],
    promotionReadiness: ok(null),
    nearby: ok([]),
    notes: [
      "Game UI controller attention adapter treats UI.Player.getFirstReadyUnit as ready-unit evidence.",
      "Requested and selected unit ids are carried only as hints; they are not ready-unit proof.",
      "Operation lists remain empty in game UI scope; use validator-backed mutation procedures before any send.",
    ],
  };
}

export async function getCiv7GameUiReadyCityView(
  input: Civ7GameUiReadyCityOptions = {},
  target: Civ7GameUiAttentionTarget = globalThis as Civ7GameUiAttentionTarget,
): Promise<Civ7ControlOrpcReadyCityViewResult> {
  const localPlayerId = target.GameContext?.localPlayerID ?? -1;
  const selectedCityId = probe(() =>
    toComponentId(target.UI?.Player?.getHeadSelectedCity?.())
  );
  const requestedCityId = toComponentId(input.cityId);
  const blockingCityId = gameUiReadyCityId(target, localPlayerId);
  const cityId = blockingCityId.ok ? blockingCityId.value : null;

  return {
    host: "game-ui",
    port: 0,
    state: { id: "game-ui", name: "Game UI" },
    localPlayerId,
    requestedCityId,
    selectedCityId,
    blockingCityId,
    cityId,
    city: probe(() => cityId == null ? null : target.Cities?.get?.(cityId) ?? null),
    legalOperations: [],
    productionCandidates: ok([]),
    townFocusOptions: ok([]),
    populationPlacement: ok(null),
    notes: [
      "Game UI controller attention adapter treats end-turn-blocking notification target or population-ready city evidence as ready-city evidence.",
      "Requested, selected, and unrelated notification-target city ids are hints only; they are not ready-city proof.",
      "Production and city-operation candidates remain empty in game UI scope; use validator-backed mutation procedures before any send.",
    ],
  };
}

export async function requestCiv7GameUiTurnComplete(
  target: Civ7GameUiAttentionTarget = globalThis as Civ7GameUiAttentionTarget,
): Promise<Civ7ControlOrpcTurnCompletionRequestResult> {
  const before = await getCiv7GameUiTurnCompletionStatus(target);
  if (!gameUiTurnCompletionAllowed(before)) {
    return {
      sent: false,
      before,
      fallbackPreflight: await getCiv7GameUiPlayNotificationView({}, target),
      reason: "turn-completion-blocked",
    };
  }

  const sendTurnComplete = target.GameContext?.sendTurnComplete;
  if (typeof sendTurnComplete !== "function") {
    return {
      sent: false,
      before,
      fallbackPreflight: await getCiv7GameUiPlayNotificationView({}, target),
      reason: "turn-completion-blocked",
    };
  }

  target.UI?.Player?.deselectAllUnits?.();
  sendTurnComplete();

  const after = await getCiv7GameUiTurnCompletionStatus(target);
  return {
    sent: true,
    before,
    after,
    command: {
      host: "game-ui",
      port: 0,
      state: { id: "game-ui", name: "Game UI" },
      output: ["game-ui-turn-completion-requested"],
    },
    verified: probeValue(after.hasSentTurnComplete) === true
      || probeValue(after.turn) !== probeValue(before.turn),
  };
}

function gameUiNotificationSummaries(
  target: Civ7GameUiAttentionTarget,
  playerId: number,
  maxNotifications: number,
): Readonly<{
  notifications: PlayNotificationSummary[];
  truncated: boolean;
}> {
  const notifications = target.Game?.Notifications;
  const ids = safeValue(() => notifications?.getIdsForPlayer?.(playerId), []);
  if (!Array.isArray(ids)) {
    return { notifications: [], truncated: false };
  }
  const normalized = ids
    .map(toComponentId)
    .filter(isPresent)
    .slice(0, maxNotifications + 1);
  return {
    notifications: normalized
      .slice(0, maxNotifications)
      .map((id) => gameUiNotificationSummary(id, target)),
    truncated: normalized.length > maxNotifications,
  };
}

function gameUiNotificationSummary(
  id: Civ7ControlOrpcComponentId,
  target: Civ7GameUiAttentionTarget,
): PlayNotificationSummary {
  const notifications = target.Game?.Notifications;
  const notification = safeValue(() => notifications?.find?.(id), null);
  const type = safeValue(
    () => typeof notifications?.getType === "function"
      ? notifications.getType(id)
      : notificationValue(notification, "Type"),
    null,
  );
  const typeName = safeValue(
    () => typeof notifications?.getTypeName === "function"
      ? notifications.getTypeName(type)
      : null,
    null,
  );
  const summary = safeStringValue(
    () => typeof notifications?.getSummary === "function"
      ? notifications.getSummary(id)
      : notificationValue(notification, "Summary"),
  );
  const message = safeStringValue(
    () => typeof notifications?.getMessage === "function"
      ? notifications.getMessage(id)
      : notificationValue(notification, "Message"),
  );
  const isEndTurnBlocking = Boolean(safeValue(
    () => notifications?.getBlocksTurnAdvancement?.(id),
    false,
  ));
  const category = notificationCategory(typeName, isEndTurnBlocking);

  return {
    id,
    type,
    typeName,
    groupType: null,
    player: target.GameContext?.localPlayerID ?? null,
    summary,
    message,
    target: notificationValue(notification, "Target"),
    location: notificationValue(notification, "Location"),
    canUserDismiss: notificationValue(notification, "CanUserDismiss"),
    expired: notificationValue(notification, "Expired"),
    dismissed: notificationValue(notification, "Dismissed"),
    isEndTurnBlocking,
    decision: notificationDecisionHint({
      category,
      typeName,
      summary,
      isEndTurnBlocking,
    }),
  };
}

function notificationDecisionHint(input: Readonly<{
  category: string;
  typeName: string | null;
  summary: string | null;
  isEndTurnBlocking: boolean;
}>): PlayDecisionHint {
  return {
    category: input.category,
    requiredInputs: [],
    commonActions: [],
    confidence: "official-ui",
    notes: [
      input.isEndTurnBlocking
        ? "Game UI notification evidence marks this as end-turn blocking."
        : "Game UI notification evidence is informational.",
      input.typeName == null
        ? "Notification type name was unavailable in the game UI scope."
        : `Notification type: ${input.typeName}.`,
    ],
  };
}

function notificationDecisionQueueItem(
  notification: PlayNotificationSummary | null,
): Civ7ControlOrpcPlayNotificationViewResult["hud"]["decisionQueue"][number] | null {
  if (notification == null) return null;
  return {
    notificationId: notification.id,
    isEndTurnBlocking: notification.isEndTurnBlocking,
    typeName: notification.typeName,
    summary: notification.summary,
    message: notification.message,
    target: notification.target,
    location: notification.location,
    player: notification.player,
    category: notification.decision.category,
    requiredInputs: notification.decision.requiredInputs,
    commonActions: notification.decision.commonActions,
    notes: notification.decision.notes,
  };
}

function notificationCategory(
  typeName: string | null,
  isEndTurnBlocking: boolean,
): string {
  const normalized = String(typeName ?? "").toUpperCase();
  if (normalized.includes("CHOOSE_PRODUCTION")) return "production-choice";
  if (normalized.includes("CHOOSE_TECH")) return "technology-choice";
  if (normalized.includes("CHOOSE_CULTURE")) return "culture-choice";
  if (normalized.includes("COMMAND_UNITS")) return "unit-command";
  if (normalized.includes("DIPLOMATIC")) return "diplomacy";
  return isEndTurnBlocking
    ? "blocking-notification"
    : "informational-notification";
}

function gameUiEndTurnBlocker(
  target: Civ7GameUiAttentionTarget,
  playerId: number,
): RuntimeProbe<unknown> {
  return probe(() =>
    target.Game?.Notifications?.getEndTurnBlockingType?.(playerId) ?? null
  );
}

function gameUiReadyCityId(
  target: Civ7GameUiAttentionTarget,
  playerId: number,
): RuntimeProbe<Civ7ControlOrpcComponentId | null> {
  return probe(() => {
    const blockerCityId = gameUiBlockingNotificationCityId(target, playerId);
    if (blockerCityId != null) return blockerCityId;
    return gameUiPopulationReadyCityId(target, playerId);
  });
}

function gameUiBlockingNotificationCityId(
  target: Civ7GameUiAttentionTarget,
  playerId: number,
): Civ7ControlOrpcComponentId | null {
  const notifications = target.Game?.Notifications;
  const blockerType = notifications?.getEndTurnBlockingType?.(playerId);
  const blockerId = notifications?.findEndTurnBlocking?.(playerId, blockerType);
  const blocker = blockerId == null ? null : notifications?.find?.(blockerId);
  const targetId = toComponentId(notificationValue(blocker, "Target"));
  if (targetId == null) return null;
  return target.Cities?.get?.(targetId) == null ? null : targetId;
}

function gameUiPopulationReadyCityId(
  target: Civ7GameUiAttentionTarget,
  playerId: number,
): Civ7ControlOrpcComponentId | null {
  const cities = target.Players?.Cities?.get?.(playerId);
  const cityIds = readCityIds(cities);
  for (const cityId of cityIds) {
    const city = target.Cities?.get?.(cityId);
    if (city == null || typeof city !== "object") continue;
    const growth = (city as { Growth?: { isReadyToPlacePopulation?: unknown } })
      .Growth;
    if (growth?.isReadyToPlacePopulation === true) return cityId;
  }
  return null;
}

function readCityIds(value: unknown): Civ7ControlOrpcComponentId[] {
  if (value == null || typeof value !== "object") return [];
  const candidate = value as { getCityIds?: () => unknown };
  const ids = safeValue(() => candidate.getCityIds?.(), []);
  if (!Array.isArray(ids)) return [];
  return ids.map(toComponentId).filter(isPresent);
}

function clampMaxNotifications(value: number | undefined): number {
  if (value == null) return 25;
  if (!Number.isInteger(value)) return 25;
  return Math.min(Math.max(value, 1), 100);
}

function toComponentId(value: unknown): Civ7ControlOrpcComponentId | null {
  if (value == null || typeof value !== "object") return null;
  const candidate = value as Partial<Civ7ControlOrpcComponentId>;
  if (typeof candidate.owner !== "number" || typeof candidate.id !== "number") {
    return null;
  }
  return typeof candidate.type === "number"
    ? { owner: candidate.owner, id: candidate.id, type: candidate.type }
    : { owner: candidate.owner, id: candidate.id };
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

function safeStringValue(fn: () => unknown): string | null {
  const value = safeValue(fn, null);
  return value == null ? null : String(value);
}

function safeValue<T>(fn: () => T | undefined, fallback: T): T {
  try {
    return fn() ?? fallback;
  } catch {
    return fallback;
  }
}

function probe<T>(fn: () => T): RuntimeProbe<T> {
  try {
    return { ok: true, value: fn() };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

function ok<T>(value: T): RuntimeProbe<T> {
  return { ok: true, value };
}

function gameUiTurnCompletionAllowed(
  status: Civ7ControlOrpcTurnCompletionStatusResult,
): boolean {
  return probeValue(status.canEndTurn) === true
    && probeValue(status.hasSentTurnComplete) !== true;
}

function probeValue<T>(probe: RuntimeProbe<T>): T | undefined {
  return probe.ok ? probe.value : undefined;
}

function isPresent<T>(value: T | null | undefined): value is T {
  return value != null;
}

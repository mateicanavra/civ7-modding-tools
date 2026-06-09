import type {
  Civ7ControlOrpcNarrativeChoiceResult,
  Civ7ControlOrpcPlayNotificationViewResult,
} from "./dependencies/direct-control";
import {
  getCiv7GameUiPlayNotificationView,
  type Civ7GameUiAttentionTarget,
} from "./game-ui-attention";
import type { Civ7ControlOrpcComponentId } from "./model/primitives";

type RuntimeProbe<T> = Readonly<
  | { ok: true; value: T }
  | { ok: false; error: string }
>;
type NarrativeValidation =
  Civ7ControlOrpcNarrativeChoiceResult["beforeValidation"];
type NarrativePayload = NonNullable<
  Civ7ControlOrpcNarrativeChoiceResult["payload"]
>;
type NarrativeUiState = NarrativePayload["ui"]["before"];

export type Civ7GameUiNarrativeTarget = Civ7GameUiAttentionTarget & Readonly<{
  Game?: Civ7GameUiAttentionTarget["Game"] & {
    Notifications?: NonNullable<Civ7GameUiAttentionTarget["Game"]>["Notifications"] & {
      activate?: (id: Civ7ControlOrpcComponentId) => unknown;
    };
    PlayerOperations?: {
      canStart?: (
        playerId: number,
        operationType: unknown,
        args: unknown,
        queue?: boolean,
      ) => unknown;
      sendRequest?: (
        playerId: number,
        operationType: unknown,
        args: unknown,
      ) => unknown;
    };
  };
  NarrativePopupManager?: {
    isShowing?: () => unknown;
    currentNarrativeData?: unknown;
    closePopup?: () => unknown;
  };
  PlayerOperationTypes?: {
    CHOOSE_NARRATIVE_STORY_DIRECTION?: unknown;
  };
  document?: {
    querySelectorAll?: (selector: string) => Iterable<unknown> | ArrayLike<unknown>;
  };
}>;

export function civ7GameUiNarrativeChoiceAvailable(
  target: Civ7GameUiNarrativeTarget,
): boolean {
  return typeof target.Game?.PlayerOperations?.canStart === "function"
    && typeof target.Game.PlayerOperations.sendRequest === "function"
    && target.PlayerOperationTypes?.CHOOSE_NARRATIVE_STORY_DIRECTION !== undefined
    && typeof target.Game?.Notifications?.activate === "function"
    && typeof target.Game.Notifications.getIdsForPlayer === "function"
    && typeof target.Game.Notifications.getType === "function"
    && typeof target.Game.Notifications.getTypeName === "function"
    && typeof target.Game.Notifications.find === "function";
}

export async function requestCiv7GameUiNarrativeChoice(
  input: Readonly<{
    playerId: number;
    targetType: string;
    target: Civ7ControlOrpcComponentId;
    action: number;
  }>,
  target: Civ7GameUiNarrativeTarget = globalThis as Civ7GameUiNarrativeTarget,
): Promise<Civ7ControlOrpcNarrativeChoiceResult> {
  const playerId = typeof target.GameContext?.localPlayerID === "number"
    ? target.GameContext.localPlayerID
    : input.playerId;
  const args = {
    TargetType: input.targetType,
    Target: input.target,
    Action: input.action,
  };
  const before = await getCiv7GameUiPlayNotificationView({}, target);
  const beforeUi = readNarrativeUiState(input.target, target);
  const beforeValidation = typeof target.GameContext?.localPlayerID === "number"
    ? gameUiNarrativeValidation(playerId, args, target)
    : gameUiNarrativeValidationBlocked(
      playerId,
      args,
      "GameContext.localPlayerID is unavailable.",
    );

  if (!beforeValidation.valid) {
    return narrativeChoiceResult({
      input,
      playerId,
      before,
      beforeValidation,
      after: before,
      afterValidation: beforeValidation,
      sent: false,
      payload: undefined,
    });
  }

  const notificationId = currentNarrativeNotification(playerId, target);
  const activationResult = probe(() =>
    notificationId == null
      ? null
      : target.Game?.Notifications?.activate?.(notificationId)
  );
  const sendResult = probe(() =>
    target.Game?.PlayerOperations?.sendRequest?.(
      playerId,
      target.PlayerOperationTypes?.CHOOSE_NARRATIVE_STORY_DIRECTION,
      args,
    )
  );
  const sent = sendResult.ok && sendResult.value !== false;
  const popupClose = sent ? closeNarrativePopup(target) : skippedProbe("operation was not sent");
  const panelClose = sent
    ? closeVisibleNarrativePanels(input.target, target)
    : skippedProbe("operation was not sent");
  const after = await getCiv7GameUiPlayNotificationView({}, target);
  const afterValidation = gameUiNarrativeValidation(playerId, args, target);
  const afterUi = readNarrativeUiState(input.target, target);

  return narrativeChoiceResult({
    input,
    playerId,
    before,
    beforeValidation,
    after,
    afterValidation,
    sent,
    payload: {
      localPlayerId: target.GameContext?.localPlayerID ?? playerId,
      playerId,
      args,
      canStart: beforeValidation.result,
      sent,
      sendResult,
      ui: {
        before: beforeUi,
        after: afterUi,
        panelClose,
        popupClose,
      },
      notes: [
        "Game UI narrative choice uses ambient PlayerOperations validation/send evidence inside the controller context.",
        "Caller playerId is validation input only; sends use GameContext.localPlayerID.",
        `Notification activation evidence: ${JSON.stringify(activationResult)}`,
      ],
    },
  });
}

function narrativeChoiceResult(input: Readonly<{
  input: Readonly<{
    playerId: number;
    targetType: string;
    target: Civ7ControlOrpcComponentId;
    action: number;
  }>;
  playerId: number;
  before: Civ7ControlOrpcPlayNotificationViewResult;
  beforeValidation: NarrativeValidation;
  after: Civ7ControlOrpcPlayNotificationViewResult;
  afterValidation: NarrativeValidation;
  sent: boolean;
  payload: NarrativePayload | undefined;
}>): Civ7ControlOrpcNarrativeChoiceResult {
  const postcondition = narrativePostcondition(
    input.input,
    input.sent,
    input.before,
    input.after,
    input.beforeValidation,
    input.afterValidation,
    input.payload,
  );
  return {
    playerId: input.playerId,
    before: input.before,
    beforeValidation: input.beforeValidation,
    command: input.sent
      ? {
          host: "game-ui",
          port: 0,
          state: { id: "game-ui", name: "Game UI" },
          output: ["game-ui-narrative-choice-requested"],
        }
      : undefined,
    payload: input.payload,
    after: input.after,
    afterValidation: input.afterValidation,
    sent: input.sent,
    verified: postcondition.classification !== "not-sent"
      && postcondition.classification !== "no-state-change",
    postcondition,
  };
}

function gameUiNarrativeValidation(
  playerId: number,
  args: Readonly<{
    TargetType: string;
    Target: Civ7ControlOrpcComponentId;
    Action: number;
  }>,
  target: Civ7GameUiNarrativeTarget,
): NarrativeValidation {
  const result = probe(() =>
    target.Game?.PlayerOperations?.canStart?.(
      playerId,
      target.PlayerOperationTypes?.CHOOSE_NARRATIVE_STORY_DIRECTION,
      args,
      false,
    )
  );
  return {
    host: "game-ui",
    port: 0,
    state: { id: "game-ui", name: "Game UI" },
    family: "player-operation",
    operationType: "CHOOSE_NARRATIVE_STORY_DIRECTION",
    enumValue: target.PlayerOperationTypes?.CHOOSE_NARRATIVE_STORY_DIRECTION,
    target: { playerId },
    args,
    valid: result.ok && successFromCanStart(result.value),
    result,
  };
}

function gameUiNarrativeValidationBlocked(
  playerId: number,
  args: Readonly<{
    TargetType: string;
    Target: Civ7ControlOrpcComponentId;
    Action: number;
  }>,
  reason: string,
): NarrativeValidation {
  return {
    host: "game-ui",
    port: 0,
    state: { id: "game-ui", name: "Game UI" },
    family: "player-operation",
    operationType: "CHOOSE_NARRATIVE_STORY_DIRECTION",
    enumValue: "CHOOSE_NARRATIVE_STORY_DIRECTION",
    target: { playerId },
    args,
    valid: false,
    result: {
      ok: false,
      reason,
      playerId,
    },
  };
}

function narrativePostcondition(
  input: Readonly<{
    target: Civ7ControlOrpcComponentId;
  }>,
  sent: boolean,
  before: Civ7ControlOrpcPlayNotificationViewResult,
  after: Civ7ControlOrpcPlayNotificationViewResult,
  beforeValidation: NarrativeValidation,
  afterValidation: NarrativeValidation,
  payload: NarrativePayload | undefined,
): Civ7ControlOrpcNarrativeChoiceResult["postcondition"] {
  const classification = classifyNarrativePostcondition(
    input,
    sent,
    before,
    after,
    beforeValidation,
    afterValidation,
    payload,
  );
  return {
    classification,
    reason: narrativePostconditionReason(classification),
  };
}

function classifyNarrativePostcondition(
  _input: Readonly<{
    target: Civ7ControlOrpcComponentId;
  }>,
  sent: boolean,
  before: Civ7ControlOrpcPlayNotificationViewResult,
  after: Civ7ControlOrpcPlayNotificationViewResult,
  beforeValidation: NarrativeValidation,
  afterValidation: NarrativeValidation,
  payload: NarrativePayload | undefined,
): Civ7ControlOrpcNarrativeChoiceResult["postcondition"]["classification"] {
  if (!sent) return "not-sent";
  if (probeValue(after.canEndTurn) === true) return "turn-unblocked";
  const beforeMatch = findNarrativeChoiceNotification(before);
  const afterMatch = findNarrativeChoiceNotification(after);
  if (sameNarrativeChoiceNotification(beforeMatch, afterMatch)) {
    return "no-state-change";
  }
  if (beforeMatch && !afterMatch) return "narrative-blocker-cleared";
  if (payload != null && narrativePanelCleared(payload)) {
    return "narrative-panel-cleared";
  }
  if (
    beforeValidation.valid !== afterValidation.valid
    || stableJson(beforeValidation.result) !== stableJson(afterValidation.result)
  ) {
    return "validation-changed";
  }
  return "no-state-change";
}

function narrativePostconditionReason(
  classification: Civ7ControlOrpcNarrativeChoiceResult["postcondition"]["classification"],
): string {
  switch (classification) {
    case "not-sent":
      return "The narrative choice was not sent because game UI validation or send evidence did not allow a request.";
    case "turn-unblocked":
      return "The narrative choice left the turn unblocked according to game UI attention evidence.";
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

function findNarrativeChoiceNotification(
  view: Civ7ControlOrpcPlayNotificationViewResult,
): Civ7ControlOrpcPlayNotificationViewResult["notifications"][number] | undefined {
  return view.notifications.find((notification) => {
    const typeName = String(notification.typeName ?? "").toUpperCase();
    return notification.isEndTurnBlocking === true
      && typeName.includes("CHOOSE")
      && (typeName.includes("NARRATIVE_STORY_DIRECTION")
        || typeName.includes("DISCOVERY_STORY_DIRECTION")
        || typeName.includes("AUTO_NARRATIVE_STORY_DIRECTION"));
  });
}

function currentNarrativeNotification(
  playerId: number,
  target: Civ7GameUiNarrativeTarget,
): Civ7ControlOrpcComponentId | null {
  const ids = safeValue(() =>
    target.Game?.Notifications?.getIdsForPlayer?.(playerId),
    [],
  );
  if (!Array.isArray(ids)) return null;
  for (const rawId of ids) {
    const id = toComponentId(rawId);
    if (id == null) continue;
    const type = safeValue(() => target.Game?.Notifications?.getType?.(id), null);
    const typeName = safeValue(
      () => target.Game?.Notifications?.getTypeName?.(type),
      null,
    );
    const normalized = String(typeName ?? "").toUpperCase();
    if (
      normalized.includes("CHOOSE")
      && (normalized.includes("NARRATIVE_STORY_DIRECTION")
        || normalized.includes("DISCOVERY_STORY_DIRECTION")
        || normalized.includes("AUTO_NARRATIVE_STORY_DIRECTION"))
    ) {
      return id;
    }
  }
  return null;
}

function narrativePanelCleared(payload: NarrativePayload): boolean {
  const beforeCount = numericField(payload.ui.before, "matchingPanelCount");
  const afterCount = numericField(payload.ui.after, "matchingPanelCount");
  return beforeCount !== undefined && beforeCount > 0 && afterCount === 0;
}

function sameNarrativeChoiceNotification(
  before: Civ7ControlOrpcPlayNotificationViewResult["notifications"][number] | undefined,
  after: Civ7ControlOrpcPlayNotificationViewResult["notifications"][number] | undefined,
): boolean {
  if (!before || !after) return false;
  return componentIdEqual(before.id, after.id);
}

function readNarrativeUiState(
  targetStoryId: Civ7ControlOrpcComponentId,
  target: Civ7GameUiNarrativeTarget,
): NarrativeUiState {
  const panels = narrativePanels(target)
    .map((panel) => summarizePanel(panel, targetStoryId));
  const matchingPanels = panels.filter((panel) => panel.matchesTarget === true);
  return {
    panelCount: panels.length,
    panels,
    matchingPanelCount: matchingPanels.length,
    matchingPanels,
    popupShowing: probe(() => target.NarrativePopupManager?.isShowing?.() ?? null),
    currentNarrativeData: probe(() =>
      target.NarrativePopupManager?.currentNarrativeData ?? null
    ),
  };
}

function summarizePanel(
  panel: unknown,
  targetStoryId: Civ7ControlOrpcComponentId,
): Readonly<{
  panelType: string | null;
  componentType: string | null;
  targetStoryId: Civ7ControlOrpcComponentId | null;
  storyType: unknown;
  choiceKeys: string[];
  matchesTarget: boolean;
}> {
  const record = panelRecord(panel);
  const component = panelRecord(record?._component);
  const panelTarget = toComponentId(component?.targetStoryId);
  return {
    panelType: typeof record?.tagName === "string" ? record.tagName : null,
    componentType: typeof component?.constructor?.name === "string"
      ? component.constructor.name
      : null,
    targetStoryId: panelTarget,
    storyType: component?.storyType,
    choiceKeys: choiceKeys(record),
    matchesTarget: componentIdEqual(panelTarget, targetStoryId),
  };
}

function closeVisibleNarrativePanels(
  targetStoryId: Civ7ControlOrpcComponentId,
  target: Civ7GameUiNarrativeTarget,
): RuntimeProbe<Readonly<{
  attempted: number;
  results: unknown[];
}>> {
  return probe(() => {
    const panels = narrativePanels(target).filter((panel) => {
      const component = panelRecord(panelRecord(panel)?._component);
      return componentIdEqual(toComponentId(component?.targetStoryId), targetStoryId);
    });
    const results = panels.map((panel) => {
      const record = panelRecord(panel);
      const component = panelRecord(record?._component);
      if (typeof component?.close !== "function") {
        return {
          panelType: typeof record?.tagName === "string" ? record.tagName : null,
          closed: false,
          reason: "panel component has no close function",
        };
      }
      component.close(undefined);
      return {
        panelType: typeof record?.tagName === "string" ? record.tagName : null,
        closed: true,
      };
    });
    return { attempted: panels.length, results };
  });
}

function closeNarrativePopup(
  target: Civ7GameUiNarrativeTarget,
): RuntimeProbe<Readonly<{ available: boolean }>> {
  return probe(() => {
    const closePopup = target.NarrativePopupManager?.closePopup;
    if (typeof closePopup !== "function") return { available: false };
    closePopup();
    return { available: true };
  });
}

function narrativePanels(target: Civ7GameUiNarrativeTarget): unknown[] {
  const query = target.document?.querySelectorAll;
  if (typeof query !== "function") return [];
  const selectors = [
    "small-narrative-event",
    "graphic-narrative-event",
    "screen-narrative-event",
    "screen-narrative-trial",
  ];
  return safeValue(
    () =>
      selectors.flatMap((selector) =>
        Array.from(query.call(target.document, selector) as Iterable<unknown>)
      ),
    [],
  );
}

function choiceKeys(panel: Record<string, unknown> | null): string[] {
  const query = panel?.querySelectorAll;
  if (typeof query !== "function") return [];
  return safeValue(
    () =>
      Array.from(
        (query as (selector: string) => Iterable<unknown>).call(
          panel,
          "fxs-reward-button[small-narrative-choice-key]",
        ),
      ).map((button) => {
        const getAttribute = panelRecord(button)?.getAttribute;
        return typeof getAttribute === "function"
          ? getAttribute.call(button, "small-narrative-choice-key")
          : null;
      }).filter((value): value is string =>
        typeof value === "string" && value.length > 0
      ),
    [],
  );
}

function successFromCanStart(result: unknown): boolean {
  if (result === true) return true;
  if (result === false || result == null) return false;
  if (typeof result === "object") {
    const record = result as Record<string, unknown>;
    if (record.Success !== undefined) return record.Success === true;
    if (record.success !== undefined) return record.success === true;
    if (record.canStart !== undefined) return record.canStart === true;
  }
  return Boolean(result);
}

function stableJson(value: unknown): string {
  return JSON.stringify(value, (_key, candidate) => {
    if (candidate == null || typeof candidate !== "object" || Array.isArray(candidate)) {
      return candidate;
    }
    return Object.fromEntries(
      Object.entries(candidate as Record<string, unknown>).sort(([left], [right]) =>
        left.localeCompare(right)
      ),
    );
  });
}

function numericField(value: unknown, field: string): number | undefined {
  if (value == null || typeof value !== "object") return undefined;
  const candidate = (value as Record<string, unknown>)[field];
  return typeof candidate === "number" ? candidate : undefined;
}

function toComponentId(value: unknown): Civ7ControlOrpcComponentId | null {
  if (value == null || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  if (typeof record.owner !== "number" || typeof record.id !== "number") {
    return null;
  }
  return typeof record.type === "number"
    ? { owner: record.owner, id: record.id, type: record.type }
    : { owner: record.owner, id: record.id };
}

function componentIdEqual(
  left: Civ7ControlOrpcComponentId | null | undefined,
  right: Civ7ControlOrpcComponentId | null | undefined,
): boolean {
  return left?.owner === right?.owner
    && left?.id === right?.id
    && (left?.type ?? null) === (right?.type ?? null);
}

function panelRecord(value: unknown): Record<string, any> | null {
  return value != null && typeof value === "object"
    ? value as Record<string, any>
    : null;
}

function skippedProbe(reason: string): RuntimeProbe<Readonly<{
  skipped: true;
  reason: string;
}>> {
  return { ok: false, error: reason };
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

function probeValue<T>(input: RuntimeProbe<T>): T | undefined {
  return input.ok ? input.value : undefined;
}

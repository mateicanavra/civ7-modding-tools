import type {
  Civ7ControlOrpcCultureChoiceCloseoutResult,
  Civ7ControlOrpcTechnologyChoiceCloseoutResult,
} from "./dependencies/direct-control";
import type { Civ7ControlOrpcComponentId } from "./model/primitives";

type ProgressionKind = "technology" | "culture";
type ProgressionResult =
  | Civ7ControlOrpcTechnologyChoiceCloseoutResult
  | Civ7ControlOrpcCultureChoiceCloseoutResult;
type RuntimeProbe<T> = Readonly<
  | { ok: true; value: T }
  | { ok: false; error: string }
>;

export type Civ7GameUiProgressionTarget = Readonly<{
  Game?: {
    Notifications?: {
      activate?: (id: Civ7ControlOrpcComponentId) => unknown;
      find?: (id: Civ7ControlOrpcComponentId) => unknown;
      getIdsForPlayer?: (playerId: number) => unknown;
      getType?: (id: Civ7ControlOrpcComponentId) => unknown;
      getTypeName?: (type: unknown) => unknown;
    };
    PlayerOperations?: {
      canStart?: (
        playerId: number,
        operationType: unknown,
        args: Readonly<Record<string, number>>,
        queue?: boolean,
      ) => unknown;
      sendRequest?: (
        playerId: number,
        operationType: unknown,
        args: Readonly<Record<string, number>>,
      ) => unknown;
    };
    ProgressionTrees?: {
      getTree?: (playerId: number, treeId: unknown) => unknown;
    };
  };
  GameContext?: {
    localPlayerID?: number;
  };
  PlayerOperationTypes?: {
    SET_TECH_TREE_NODE?: unknown;
    SET_TECH_TREE_TARGET_NODE?: unknown;
    SET_CULTURE_TREE_NODE?: unknown;
    SET_CULTURE_TREE_TARGET_NODE?: unknown;
  };
  Players?: {
    get?: (playerId: number) => unknown;
  };
  ProgressionTreeNodeTypes?: {
    NO_NODE?: number;
  };
}>;

export function civ7GameUiProgressionChoiceAvailable(
  target: Civ7GameUiProgressionTarget,
): boolean {
  return typeof target.Game?.PlayerOperations?.canStart === "function"
    && typeof target.Game.PlayerOperations.sendRequest === "function"
    && target.PlayerOperationTypes?.SET_TECH_TREE_NODE !== undefined
    && target.PlayerOperationTypes.SET_TECH_TREE_TARGET_NODE !== undefined
    && target.PlayerOperationTypes.SET_CULTURE_TREE_NODE !== undefined
    && target.PlayerOperationTypes.SET_CULTURE_TREE_TARGET_NODE !== undefined
    && typeof target.ProgressionTreeNodeTypes?.NO_NODE === "number"
    && typeof target.Game?.Notifications?.activate === "function"
    && typeof target.Game.Notifications.getIdsForPlayer === "function"
    && typeof target.Game.Notifications.getType === "function"
    && typeof target.Game.Notifications.getTypeName === "function"
    && typeof target.Game.Notifications.find === "function"
    && typeof target.Players?.get === "function";
}

export async function requestCiv7GameUiTechnologyChoiceCloseout(
  input: Readonly<{
    playerId: number;
    node: number;
    notificationId?: Civ7ControlOrpcComponentId;
  }>,
  target: Civ7GameUiProgressionTarget = globalThis as Civ7GameUiProgressionTarget,
): Promise<Civ7ControlOrpcTechnologyChoiceCloseoutResult> {
  return gameUiProgressionChoiceCloseout(
    "technology",
    input,
    target,
  ) as Civ7ControlOrpcTechnologyChoiceCloseoutResult;
}

export async function requestCiv7GameUiCultureChoiceCloseout(
  input: Readonly<{
    playerId: number;
    node: number;
    notificationId?: Civ7ControlOrpcComponentId;
  }>,
  target: Civ7GameUiProgressionTarget = globalThis as Civ7GameUiProgressionTarget,
): Promise<Civ7ControlOrpcCultureChoiceCloseoutResult> {
  return gameUiProgressionChoiceCloseout(
    "culture",
    input,
    target,
  ) as Civ7ControlOrpcCultureChoiceCloseoutResult;
}

function gameUiProgressionChoiceCloseout(
  kind: ProgressionKind,
  input: Readonly<{
    playerId: number;
    node: number;
    notificationId?: Civ7ControlOrpcComponentId;
  }>,
  target: Civ7GameUiProgressionTarget,
): ProgressionResult {
  if (!Number.isInteger(input.node)) {
    throw new Error("Progression choice node must be an integer.");
  }

  const policy = progressionPolicy(kind, target);
  const localPlayerId = target.GameContext?.localPlayerID;
  const playerId = typeof localPlayerId === "number" ? localPlayerId : input.playerId;
  const selectedNotification = toComponentId(input.notificationId)
    ?? currentProgressionNotification(kind, playerId, target);
  const beforeProgression = readProgressionState(kind, playerId, target);
  const activationResult = probe(() =>
    selectedNotification == null
      ? null
      : target.Game?.Notifications?.activate?.(selectedNotification)
  );
  const chooseArgs = { ProgressionTreeNodeType: input.node };
  const clearArgs = { ProgressionTreeNodeType: target.ProgressionTreeNodeTypes?.NO_NODE ?? -1 };
  const canChoose = probe(() =>
    target.Game?.PlayerOperations?.canStart?.(
      playerId,
      policy.chooseOperation,
      chooseArgs,
      false,
    )
  );
  const chooseResult = canChoose.ok && successFromCanStart(canChoose.value)
    ? probe(() =>
      target.Game?.PlayerOperations?.sendRequest?.(
        playerId,
        policy.chooseOperation,
        chooseArgs,
      )
    )
    : skippedProbe(`${policy.chooseLabel} did not validate`);
  const chooseSent = chooseResult.ok === true && chooseResult.value !== false;
  const canClearTarget = chooseSent
    ? probe(() =>
      target.Game?.PlayerOperations?.canStart?.(
        playerId,
        policy.clearOperation,
        clearArgs,
        false,
      )
    )
    : skippedProbe(`${policy.clearLabel} skipped because ${policy.chooseLabel} did not send`);
  const clearTargetResult = chooseSent
      && canClearTarget.ok
      && successFromCanStart(canClearTarget.value)
    ? probe(() =>
      target.Game?.PlayerOperations?.sendRequest?.(
        playerId,
        policy.clearOperation,
        clearArgs,
      )
    )
    : skippedProbe(`${policy.clearLabel} did not validate`);
  const sent = chooseResult.ok === true && clearTargetResult.ok === true
    && chooseResult.value !== false
    && clearTargetResult.value !== false;

  return {
    host: "game-ui",
    port: 0,
    state: { id: "game-ui", name: "Game UI" },
    command: {
      host: "game-ui",
      port: 0,
      state: { id: "game-ui", name: "Game UI" },
      output: [],
    },
    payload: {
      localPlayerId,
      playerId,
      node: input.node,
      notificationId: selectedNotification,
      beforeProgression,
      activationResult,
      canChoose,
      chooseResult,
      canClearTarget,
      clearTargetResult,
      afterProgression: readProgressionState(kind, playerId, target),
      sent,
      notes: [
        "Game UI progression choice closeout used ambient PlayerOperations validation/send evidence inside the controller context.",
        "The service procedure must re-read attention state before treating a sent closeout as confirmed.",
      ],
    },
    sent,
  };
}

function progressionPolicy(
  kind: ProgressionKind,
  target: Civ7GameUiProgressionTarget,
): Readonly<{
  token: string;
  chooseOperation: unknown;
  clearOperation: unknown;
  chooseLabel: string;
  clearLabel: string;
}> {
  if (kind === "technology") {
    return {
      token: "CHOOSE_TECH",
      chooseOperation: target.PlayerOperationTypes?.SET_TECH_TREE_NODE,
      clearOperation: target.PlayerOperationTypes?.SET_TECH_TREE_TARGET_NODE,
      chooseLabel: "SET_TECH_TREE_NODE",
      clearLabel: "SET_TECH_TREE_TARGET_NODE",
    };
  }
  return {
    token: "CHOOSE_CULTURE",
    chooseOperation: target.PlayerOperationTypes?.SET_CULTURE_TREE_NODE,
    clearOperation: target.PlayerOperationTypes?.SET_CULTURE_TREE_TARGET_NODE,
    chooseLabel: "SET_CULTURE_TREE_NODE",
    clearLabel: "SET_CULTURE_TREE_TARGET_NODE",
  };
}

function currentProgressionNotification(
  kind: ProgressionKind,
  playerId: number,
  target: Civ7GameUiProgressionTarget,
): Civ7ControlOrpcComponentId | null {
  const token = progressionPolicy(kind, target).token;
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
    if (String(typeName ?? "").toUpperCase().includes(token)) return id;
  }
  return null;
}

function readProgressionState(
  kind: ProgressionKind,
  playerId: number,
  target: Civ7GameUiProgressionTarget,
): unknown {
  return kind === "technology"
    ? {
        currentResearching: probe(() =>
          playerRecord(playerId, target)?.Techs?.getResearching?.() ?? null
        ),
        targetNode: probe(() =>
          playerRecord(playerId, target)?.Techs?.getTargetNode?.() ?? null
        ),
      }
    : {
        currentResearching: probe(() => {
          const culture = playerRecord(playerId, target)?.Culture;
          const activeTree = culture?.getActiveTree?.();
          if (activeTree == null) return null;
          const tree = target.Game?.ProgressionTrees?.getTree?.(playerId, activeTree);
          const activeNodeIndex = (tree as { activeNodeIndex?: unknown } | null)
            ?.activeNodeIndex;
          if (typeof activeNodeIndex !== "number" || activeNodeIndex < 0) {
            return null;
          }
          const nodes = (tree as { nodes?: unknown[] } | null)?.nodes;
          return Array.isArray(nodes)
            ? (nodes[activeNodeIndex] as { nodeType?: unknown } | undefined)
              ?.nodeType ?? null
            : null;
        }),
        targetNode: probe(() =>
          playerRecord(playerId, target)?.Culture?.getTargetNode?.() ?? null
        ),
        availableNodeTypes: probe(() =>
          playerRecord(playerId, target)?.Culture?.getAllAvailableNodeTypes?.() ?? []
        ),
      };
}

function playerRecord(
  playerId: number,
  target: Civ7GameUiProgressionTarget,
): Record<string, any> | null {
  const player = safeValue(() => target.Players?.get?.(playerId), null);
  return player != null && typeof player === "object"
    ? player as Record<string, any>
    : null;
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

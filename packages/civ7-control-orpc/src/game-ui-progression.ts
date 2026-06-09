import type {
  Civ7ControlOrpcCultureChoiceCloseoutResult,
  Civ7ControlOrpcProgressionPlayerChoiceResult,
  Civ7ControlOrpcProgressionTargetResult,
  Civ7ControlOrpcTechnologyChoiceCloseoutResult,
} from "./dependencies/direct-control";
import type { Civ7ControlOrpcComponentId } from "./model/primitives";

type ProgressionKind = "technology" | "culture";
type ProgressionTargetKind = "technology" | "culture";
type ProgressionPlayerChoiceKind =
  | "attribute-purchase"
  | "attribute-review"
  | "tradition-change"
  | "tradition-review";
type ProgressionResult =
  | Civ7ControlOrpcTechnologyChoiceCloseoutResult
  | Civ7ControlOrpcCultureChoiceCloseoutResult;
type ProgressionValidation =
  Civ7ControlOrpcProgressionTargetResult["beforeValidation"];
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
    BUY_ATTRIBUTE_TREE_NODE?: unknown;
    CONSIDER_ASSIGN_ATTRIBUTE?: unknown;
    CHANGE_TRADITION?: unknown;
    CONSIDER_ASSIGN_TRADITIONS?: unknown;
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

export function civ7GameUiProgressionRequestAvailable(
  target: Civ7GameUiProgressionTarget,
): boolean {
  return typeof target.Game?.PlayerOperations?.canStart === "function"
    && typeof target.Game.PlayerOperations.sendRequest === "function"
    && target.PlayerOperationTypes?.SET_TECH_TREE_TARGET_NODE !== undefined
    && target.PlayerOperationTypes.SET_CULTURE_TREE_TARGET_NODE !== undefined
    && target.PlayerOperationTypes.BUY_ATTRIBUTE_TREE_NODE !== undefined
    && target.PlayerOperationTypes.CONSIDER_ASSIGN_ATTRIBUTE !== undefined
    && target.PlayerOperationTypes.CHANGE_TRADITION !== undefined
    && target.PlayerOperationTypes.CONSIDER_ASSIGN_TRADITIONS !== undefined
    && typeof target.Game?.Notifications?.getIdsForPlayer === "function"
    && typeof target.Game.Notifications.find === "function"
    && typeof target.Game.Notifications.getType === "function"
    && typeof target.Game.Notifications.getTypeName === "function"
    && typeof target.GameContext?.localPlayerID === "number";
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

export async function requestCiv7GameUiTechnologyTarget(
  input: Readonly<{
    playerId: number;
    node: number;
  }>,
  target: Civ7GameUiProgressionTarget = globalThis as Civ7GameUiProgressionTarget,
): Promise<Civ7ControlOrpcProgressionTargetResult> {
  return gameUiProgressionTarget("technology", input, target);
}

export async function requestCiv7GameUiCultureTarget(
  input: Readonly<{
    playerId: number;
    node: number;
  }>,
  target: Civ7GameUiProgressionTarget = globalThis as Civ7GameUiProgressionTarget,
): Promise<Civ7ControlOrpcProgressionTargetResult> {
  return gameUiProgressionTarget("culture", input, target);
}

export async function requestCiv7GameUiAttributePurchase(
  input: Readonly<{
    playerId: number;
    node: number;
  }>,
  target: Civ7GameUiProgressionTarget = globalThis as Civ7GameUiProgressionTarget,
): Promise<Civ7ControlOrpcProgressionPlayerChoiceResult> {
  return gameUiProgressionPlayerChoice("attribute-purchase", input, target);
}

export async function requestCiv7GameUiAttributeReviewCloseout(
  input: Readonly<{
    playerId: number;
  }>,
  target: Civ7GameUiProgressionTarget = globalThis as Civ7GameUiProgressionTarget,
): Promise<Civ7ControlOrpcProgressionPlayerChoiceResult> {
  return gameUiProgressionPlayerChoice("attribute-review", input, target);
}

export async function requestCiv7GameUiTraditionChange(
  input: Readonly<{
    playerId: number;
    traditionType: number;
    action: number;
  }>,
  target: Civ7GameUiProgressionTarget = globalThis as Civ7GameUiProgressionTarget,
): Promise<Civ7ControlOrpcProgressionPlayerChoiceResult> {
  return gameUiProgressionPlayerChoice("tradition-change", input, target);
}

export async function requestCiv7GameUiTraditionReviewCloseout(
  input: Readonly<{
    playerId: number;
  }>,
  target: Civ7GameUiProgressionTarget = globalThis as Civ7GameUiProgressionTarget,
): Promise<Civ7ControlOrpcProgressionPlayerChoiceResult> {
  return gameUiProgressionPlayerChoice("tradition-review", input, target);
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

function gameUiProgressionTarget(
  kind: ProgressionTargetKind,
  input: Readonly<{
    playerId: number;
    node: number;
  }>,
  target: Civ7GameUiProgressionTarget,
): Civ7ControlOrpcProgressionTargetResult {
  if (!Number.isInteger(input.node)) {
    throw new Error("Progression target node must be an integer.");
  }
  const request = progressionRuntimeRequest({
    playerId: input.playerId,
    operationType: kind === "technology"
      ? "SET_TECH_TREE_TARGET_NODE"
      : "SET_CULTURE_TREE_TARGET_NODE",
    operationValue: kind === "technology"
      ? target.PlayerOperationTypes?.SET_TECH_TREE_TARGET_NODE
      : target.PlayerOperationTypes?.SET_CULTURE_TREE_TARGET_NODE,
    args: { ProgressionTreeNodeType: input.node },
    target,
  });

  return {
    kind,
    playerId: input.playerId,
    node: input.node,
    operation: request.operation,
    beforeValidation: request.before,
    afterValidation: request.after,
    sent: request.sent,
    verified: false,
    postcondition: progressionRuntimePostcondition(request.sent, `${kind} target`),
  };
}

function gameUiProgressionPlayerChoice(
  kind: ProgressionPlayerChoiceKind,
  input: Readonly<{
    playerId: number;
    node?: number;
    traditionType?: number;
    action?: number;
  }>,
  target: Civ7GameUiProgressionTarget,
): Civ7ControlOrpcProgressionPlayerChoiceResult {
  const policy = progressionPlayerChoicePolicy(kind, input, target);
  const request = progressionRuntimeRequest({
    playerId: input.playerId,
    operationType: policy.operationType,
    operationValue: policy.operationValue,
    args: policy.args,
    target,
  });
  const common = {
    playerId: input.playerId,
    operation: request.operation,
    beforeValidation: request.before,
    afterValidation: request.after,
    sent: request.sent,
    verified: false,
    postcondition: progressionRuntimePostcondition(request.sent, kind),
  };

  if (kind === "attribute-purchase") {
    return {
      ...common,
      kind,
      node: policy.node as number,
    };
  }
  if (kind === "tradition-change") {
    return {
      ...common,
      kind,
      traditionType: policy.traditionType as number,
      action: policy.action as number,
    };
  }
  return {
    ...common,
    kind,
  };
}

function progressionPlayerChoicePolicy(
  kind: ProgressionPlayerChoiceKind,
  input: Readonly<{
    node?: number;
    traditionType?: number;
    action?: number;
  }>,
  target: Civ7GameUiProgressionTarget,
): Readonly<{
  operationType:
    | "BUY_ATTRIBUTE_TREE_NODE"
    | "CONSIDER_ASSIGN_ATTRIBUTE"
    | "CHANGE_TRADITION"
    | "CONSIDER_ASSIGN_TRADITIONS";
  operationValue: unknown;
  args: Readonly<Record<string, number>>;
  node?: number;
  traditionType?: number;
  action?: number;
}> {
  if (kind === "attribute-purchase") {
    if (typeof input.node !== "number" || !Number.isInteger(input.node)) {
      throw new Error("Progression attribute node must be an integer.");
    }
    const node = input.node;
    return {
      operationType: "BUY_ATTRIBUTE_TREE_NODE",
      operationValue: target.PlayerOperationTypes?.BUY_ATTRIBUTE_TREE_NODE,
      args: { ProgressionTreeNodeType: node },
      node,
    };
  }
  if (kind === "attribute-review") {
    return {
      operationType: "CONSIDER_ASSIGN_ATTRIBUTE",
      operationValue: target.PlayerOperationTypes?.CONSIDER_ASSIGN_ATTRIBUTE,
      args: {},
    };
  }
  if (kind === "tradition-change") {
    if (
      typeof input.traditionType !== "number"
      || !Number.isInteger(input.traditionType)
    ) {
      throw new Error("Progression traditionType must be an integer.");
    }
    if (typeof input.action !== "number" || !Number.isInteger(input.action)) {
      throw new Error("Progression tradition action must be an integer.");
    }
    const traditionType = input.traditionType;
    const action = input.action;
    return {
      operationType: "CHANGE_TRADITION",
      operationValue: target.PlayerOperationTypes?.CHANGE_TRADITION,
      args: {
        TraditionType: traditionType,
        Action: action,
      },
      traditionType,
      action,
    };
  }
  return {
    operationType: "CONSIDER_ASSIGN_TRADITIONS",
    operationValue: target.PlayerOperationTypes?.CONSIDER_ASSIGN_TRADITIONS,
    args: {},
  };
}

function progressionRuntimeRequest(
  input: Readonly<{
    playerId: number;
    operationType: string;
    operationValue: unknown;
    args: Readonly<Record<string, number>>;
    target: Civ7GameUiProgressionTarget;
  }>,
): Readonly<{
  before: ProgressionValidation;
  after: ProgressionValidation;
  operation: Civ7ControlOrpcProgressionTargetResult["operation"];
  sent: boolean;
}> {
  const localPlayerId = input.target.GameContext?.localPlayerID;
  const before = localPlayerId === input.playerId
    ? gameUiProgressionValidation(input)
    : gameUiProgressionLocalPlayerMismatch(input, localPlayerId);
  if (!before.valid) {
    return {
      before,
      after: before,
      operation: {
        before,
        after: before,
        sent: false,
        verified: false,
      },
      sent: false,
    };
  }

  const sendRequest = input.target.Game?.PlayerOperations?.sendRequest;
  const sendResult = typeof sendRequest === "function"
    ? probe(() =>
      sendRequest(
        input.playerId,
        input.operationValue,
        input.args,
      )
    )
    : { ok: false as const, error: "PlayerOperations.sendRequest is unavailable" };
  const sent = sendResult.ok === true && sendResult.value !== false;
  const after = gameUiProgressionValidation(input);
  return {
    before,
    after,
    operation: {
      before,
      after,
      sent,
      verified: false,
    },
    sent,
  };
}

function gameUiProgressionValidation(
  input: Readonly<{
    playerId: number;
    operationType: string;
    operationValue: unknown;
    args: Readonly<Record<string, number>>;
    target: Civ7GameUiProgressionTarget;
  }>,
): ProgressionValidation {
  const result = probe(() =>
    input.target.Game?.PlayerOperations?.canStart?.(
      input.playerId,
      input.operationValue,
      input.args,
      false,
    )
  );
  return {
    host: "game-ui",
    port: 0,
    state: { id: "game-ui", name: "Game UI" },
    family: "player-operation",
    operationType: input.operationType,
    enumValue: input.operationValue,
    target: { playerId: input.playerId },
    args: input.args,
    valid: result.ok === true && successFromCanStart(result.value),
    result,
  };
}

function gameUiProgressionLocalPlayerMismatch(
  input: Readonly<{
    playerId: number;
    operationType: string;
    operationValue: unknown;
    args: Readonly<Record<string, number>>;
  }>,
  localPlayerId: number | undefined,
): ProgressionValidation {
  return {
    host: "game-ui",
    port: 0,
    state: { id: "game-ui", name: "Game UI" },
    family: "player-operation",
    operationType: input.operationType,
    enumValue: input.operationValue,
    target: { playerId: input.playerId },
    args: input.args,
    valid: false,
    result: {
      ok: false,
      reason: "local-player-mismatch",
      inputPlayerId: input.playerId,
      localPlayerId: localPlayerId ?? null,
    },
  };
}

function progressionRuntimePostcondition(
  sent: boolean,
  label: string,
): Readonly<{
  classification: "not-sent" | "pending-runtime-proof";
  reason: string;
}> {
  if (!sent) {
    return {
      classification: "not-sent",
      reason: `The ${label} request did not validate, so no progression operation was sent.`,
    };
  }
  return {
    classification: "pending-runtime-proof",
    reason: `The ${label} request was sent through the game UI controller, but local package tests do not prove live progression state changed; read fresh attention/progression evidence before another request.`,
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

import type { Civ7ComponentId } from "../../civ7-component-id.js";
import type {
  Civ7CommandResult,
  Civ7DirectControlOptions,
  Civ7TunerState,
} from "../../session/types.js";
import type { Civ7ActionApproval } from "../operations/types.js";

export type Civ7CultureChoiceCloseoutInput = Readonly<{
  playerId: number;
  node: number;
  notificationId?: Civ7ComponentId;
  activateNotification?: boolean;
}>;

export type Civ7CultureChoiceCloseoutResult = Readonly<{
  host: string;
  port: number;
  state: Civ7TunerState;
  command: Civ7CommandResult;
  payload: unknown;
  sent: boolean;
}>;

type CultureChoiceCloseoutCommandDependencies = Readonly<{
  jsLiteral: (value: unknown) => string;
}>;

type CultureChoiceCloseoutRequestDependencies = CultureChoiceCloseoutCommandDependencies & Readonly<{
  assertApproved: (approval: Civ7ActionApproval, action: string) => void;
  executeAppUiCommand: (options: Civ7DirectControlOptions & Readonly<{ command: string }>) => Promise<Civ7CommandResult>;
  invalidNodeError: () => never;
  parseCultureChoiceCloseout: (
    result: Civ7CommandResult,
    label: string,
  ) => { sent?: boolean; chooseResult?: { ok?: boolean }; clearTargetResult?: { ok?: boolean } };
  validatePlayerId: (playerId: number) => void;
}>;

function probeHelperSource(): string {
  return `const probe = (fn) => {
      try {
        return { ok: true, value: fn() };
      } catch (err) {
        return { ok: false, error: String(err) };
      }
    };`;
}

export function buildCultureChoiceCloseoutCommand(
  input: Civ7CultureChoiceCloseoutInput,
  dependencies: CultureChoiceCloseoutCommandDependencies,
): string {
  return `(() => {
    ${cultureChoiceCloseoutSource()}
    return JSON.stringify(sendCultureChoiceCloseout(${dependencies.jsLiteral(input)}));
  })()`;
}

export function cultureChoiceCloseoutSource(): string {
  return `${probeHelperSource()}
    const toComponentId = (value) => {
      if (!value || typeof value !== "object") return null;
      if (typeof value.owner !== "number" || typeof value.id !== "number") return null;
      const out = { owner: value.owner, id: value.id };
      if (typeof value.type === "number") out.type = value.type;
      return out;
    };
    const safeCall = (label, fn) => {
      try {
        return { ok: true, value: fn() };
      } catch (err) {
        return { ok: false, error: label + ": " + String(err) };
      }
    };
    const successFromCanStart = (value) => value?.Success === true || value?.canStart === true;
    const readCultureState = (playerId) => ({
      currentResearching: probe(() => {
        const culture = Players.get(playerId)?.Culture;
        const activeTree = culture?.getActiveTree?.();
        if (activeTree == null) return null;
        const tree = Game.ProgressionTrees.getTree(playerId, activeTree);
        const activeNodeIndex = tree?.activeNodeIndex;
        return Number.isFinite(Number(activeNodeIndex)) && activeNodeIndex >= 0
          ? tree?.nodes?.[activeNodeIndex]?.nodeType ?? null
          : null;
      }),
      targetNode: probe(() => Players.get(playerId)?.Culture?.getTargetNode?.() ?? null),
      availableNodeTypes: probe(() => Players.get(playerId)?.Culture?.getAllAvailableNodeTypes?.() ?? []),
    });
    const currentCultureNotification = () => safeCall("find current culture-choice notification", () => {
      const ids = typeof Game.Notifications.getIdsForPlayer === "function"
        ? Game.Notifications.getIdsForPlayer(GameContext.localPlayerID)
        : [];
      const rows = Array.isArray(ids) ? ids : [];
      for (const id of rows) {
        const type = typeof Game.Notifications.getType === "function"
          ? Game.Notifications.getType(id)
          : Game.Notifications.find(id)?.Type;
        const typeName = typeof Game.Notifications.getTypeName === "function" ? Game.Notifications.getTypeName(type) : null;
        if (String(typeName ?? "").toUpperCase().includes("CHOOSE_CULTURE")) return toComponentId(id);
      }
      return null;
    });
    const sendCultureChoiceCloseout = (input) => {
      const localPlayerId = GameContext.localPlayerID;
      const playerId = Number.isInteger(input.playerId) ? input.playerId : localPlayerId;
      const node = Number(input.node);
      const selectedNotification = toComponentId(input.notificationId) ?? currentCultureNotification().value ?? null;
      const beforeCulture = readCultureState(playerId);
      const activationResult = input.activateNotification === false
        ? { ok: false, skipped: true, reason: "activation disabled" }
        : safeCall("Game.Notifications.activate", () => selectedNotification ? Game.Notifications.activate(selectedNotification) : null);
      const chooseArgs = { ProgressionTreeNodeType: node };
      const noNode = typeof ProgressionTreeNodeTypes !== "undefined" && typeof ProgressionTreeNodeTypes.NO_NODE === "number"
        ? ProgressionTreeNodeTypes.NO_NODE
        : -1;
      const clearArgs = { ProgressionTreeNodeType: noNode };
      const canChoose = safeCall("Game.PlayerOperations.canStart SET_CULTURE_TREE_NODE", () => Game.PlayerOperations.canStart(
        playerId,
        PlayerOperationTypes.SET_CULTURE_TREE_NODE,
        chooseArgs,
        false,
      ));
      const chooseResult = canChoose.ok && successFromCanStart(canChoose.value)
        ? safeCall("Game.PlayerOperations.sendRequest SET_CULTURE_TREE_NODE", () => Game.PlayerOperations.sendRequest(
          playerId,
          PlayerOperationTypes.SET_CULTURE_TREE_NODE,
          chooseArgs,
        ))
        : { ok: false, skipped: true, reason: "SET_CULTURE_TREE_NODE did not validate" };
      const canClearTarget = safeCall("Game.PlayerOperations.canStart SET_CULTURE_TREE_TARGET_NODE", () => Game.PlayerOperations.canStart(
        playerId,
        PlayerOperationTypes.SET_CULTURE_TREE_TARGET_NODE,
        clearArgs,
        false,
      ));
      const clearTargetResult = canClearTarget.ok && successFromCanStart(canClearTarget.value)
        ? safeCall("Game.PlayerOperations.sendRequest SET_CULTURE_TREE_TARGET_NODE", () => Game.PlayerOperations.sendRequest(
          playerId,
          PlayerOperationTypes.SET_CULTURE_TREE_TARGET_NODE,
          clearArgs,
        ))
        : { ok: false, skipped: true, reason: "SET_CULTURE_TREE_TARGET_NODE did not validate" };
      return {
        localPlayerId,
        playerId,
        node,
        notificationId: selectedNotification,
        beforeCulture,
        activationResult,
        canChoose,
        chooseResult,
        canClearTarget,
        clearTargetResult,
        afterCulture: readCultureState(playerId),
        sent: chooseResult.ok === true && clearTargetResult.ok === true,
        notes: [
          "This uses the App UI owner for culture chooser closeout: optional Game.Notifications.activate, SET_CULTURE_TREE_NODE, then SET_CULTURE_TREE_TARGET_NODE with NO_NODE.",
          "The caller must still re-read notification state; successful App UI sends are not proof that the culture-choice blocker cleared."
        ],
      };
    };`;
}

export async function requestCiv7CultureChoiceCloseout(
  input: Civ7CultureChoiceCloseoutInput,
  options: Civ7DirectControlOptions = {},
  approval: Civ7ActionApproval,
  dependencies: CultureChoiceCloseoutRequestDependencies,
): Promise<Civ7CultureChoiceCloseoutResult> {
  dependencies.assertApproved(approval, "choosing Civ7 culture node through App UI closeout");
  dependencies.validatePlayerId(input.playerId);
  if (!Number.isInteger(input.node)) dependencies.invalidNodeError();
  const command = await dependencies.executeAppUiCommand({
    ...options,
    command: buildCultureChoiceCloseoutCommand(input, dependencies),
  });
  const payload = dependencies.parseCultureChoiceCloseout(command, "Civ7 culture choice closeout");
  const sent = payload.sent === true;
  return {
    host: command.host,
    port: command.port,
    state: command.state,
    command,
    payload,
    sent,
  };
}

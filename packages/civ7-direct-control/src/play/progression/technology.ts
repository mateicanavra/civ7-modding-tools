import { assertApproved } from "../../action-approval.js";
import { Civ7DirectControlError } from "../../direct-control-error.js";
import { jsLiteral } from "../../runtime/command-serialization.js";
import { probeHelperSource } from "../../runtime/probe.js";
import { jsonPayloadFromCommandResult } from "../../session/command-result.js";
import { executeCiv7AppUiCommand } from "../../session/execute.js";
import { validatePlayerId } from "../../validation.js";
import type { Civ7ComponentId } from "../../civ7-component-id.js";
import type {
  Civ7CommandResult,
  Civ7DirectControlOptions,
  Civ7TunerState,
} from "../../session/types.js";
import type { Civ7ActionApproval } from "../operations/types.js";

export type Civ7TechnologyChoiceCloseoutInput = Readonly<{
  playerId: number;
  node: number;
  notificationId?: Civ7ComponentId;
  activateNotification?: boolean;
}>;

export type Civ7TechnologyChoiceCloseoutResult = Readonly<{
  host: string;
  port: number;
  state: Civ7TunerState;
  command: Civ7CommandResult;
  payload: unknown;
  sent: boolean;
}>;

type TechnologyChoiceCloseoutCommandDependencies = Readonly<{
  jsLiteral: (value: unknown) => string;
}>;

type TechnologyChoiceCloseoutRequestDependencies = TechnologyChoiceCloseoutCommandDependencies & Readonly<{
  assertApproved: (approval: Civ7ActionApproval, action: string) => void;
  executeAppUiCommand: (options: Civ7DirectControlOptions & Readonly<{ command: string }>) => Promise<Civ7CommandResult>;
  invalidNodeError: () => never;
  parseTechnologyChoiceCloseout: (
    result: Civ7CommandResult,
    label: string,
  ) => { sent?: boolean; chooseResult?: { ok?: boolean }; clearTargetResult?: { ok?: boolean } };
  validatePlayerId: (playerId: number) => void;
}>;

export function buildTechnologyChoiceCloseoutCommand(
  input: Civ7TechnologyChoiceCloseoutInput,
  dependencies: TechnologyChoiceCloseoutCommandDependencies,
): string {
  return `(() => {
    ${technologyChoiceCloseoutSource()}
    return JSON.stringify(sendTechnologyChoiceCloseout(${dependencies.jsLiteral(input)}));
  })()`;
}

export function technologyChoiceCloseoutSource(): string {
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
    const readTechnologyState = (playerId) => ({
      currentResearching: probe(() => Players.get(playerId)?.Techs?.getResearching?.() ?? null),
      targetNode: probe(() => Players.get(playerId)?.Techs?.getTargetNode?.() ?? null),
    });
    const currentTechnologyNotification = () => safeCall("find current technology-choice notification", () => {
      const ids = typeof Game.Notifications.getIdsForPlayer === "function"
        ? Game.Notifications.getIdsForPlayer(GameContext.localPlayerID)
        : [];
      const rows = Array.isArray(ids) ? ids : [];
      for (const id of rows) {
        const type = typeof Game.Notifications.getType === "function"
          ? Game.Notifications.getType(id)
          : Game.Notifications.find(id)?.Type;
        const typeName = typeof Game.Notifications.getTypeName === "function" ? Game.Notifications.getTypeName(type) : null;
        if (String(typeName ?? "").toUpperCase().includes("CHOOSE_TECH")) return toComponentId(id);
      }
      return null;
    });
    const sendTechnologyChoiceCloseout = (input) => {
      const localPlayerId = GameContext.localPlayerID;
      const playerId = Number.isInteger(input.playerId) ? input.playerId : localPlayerId;
      const node = Number(input.node);
      const selectedNotification = toComponentId(input.notificationId) ?? currentTechnologyNotification().value ?? null;
      const beforeTechnology = readTechnologyState(playerId);
      const activationResult = input.activateNotification === false
        ? { ok: false, skipped: true, reason: "activation disabled" }
        : safeCall("Game.Notifications.activate", () => selectedNotification ? Game.Notifications.activate(selectedNotification) : null);
      const chooseArgs = { ProgressionTreeNodeType: node };
      const noNode = typeof ProgressionTreeNodeTypes !== "undefined" && typeof ProgressionTreeNodeTypes.NO_NODE === "number"
        ? ProgressionTreeNodeTypes.NO_NODE
        : -1;
      const clearArgs = { ProgressionTreeNodeType: noNode };
      const canChoose = safeCall("Game.PlayerOperations.canStart SET_TECH_TREE_NODE", () => Game.PlayerOperations.canStart(
        playerId,
        PlayerOperationTypes.SET_TECH_TREE_NODE,
        chooseArgs,
        false,
      ));
      const chooseResult = canChoose.ok && successFromCanStart(canChoose.value)
        ? safeCall("Game.PlayerOperations.sendRequest SET_TECH_TREE_NODE", () => Game.PlayerOperations.sendRequest(
          playerId,
          PlayerOperationTypes.SET_TECH_TREE_NODE,
          chooseArgs,
        ))
        : { ok: false, skipped: true, reason: "SET_TECH_TREE_NODE did not validate" };
      const canClearTarget = safeCall("Game.PlayerOperations.canStart SET_TECH_TREE_TARGET_NODE", () => Game.PlayerOperations.canStart(
        playerId,
        PlayerOperationTypes.SET_TECH_TREE_TARGET_NODE,
        clearArgs,
        false,
      ));
      const clearTargetResult = canClearTarget.ok && successFromCanStart(canClearTarget.value)
        ? safeCall("Game.PlayerOperations.sendRequest SET_TECH_TREE_TARGET_NODE", () => Game.PlayerOperations.sendRequest(
          playerId,
          PlayerOperationTypes.SET_TECH_TREE_TARGET_NODE,
          clearArgs,
        ))
        : { ok: false, skipped: true, reason: "SET_TECH_TREE_TARGET_NODE did not validate" };
      return {
        localPlayerId,
        playerId,
        node,
        notificationId: selectedNotification,
        beforeTechnology,
        activationResult,
        canChoose,
        chooseResult,
        canClearTarget,
        clearTargetResult,
        afterTechnology: readTechnologyState(playerId),
        sent: chooseResult.ok === true && clearTargetResult.ok === true,
        notes: [
          "This uses the App UI owner for technology chooser closeout: optional Game.Notifications.activate, SET_TECH_TREE_NODE, then SET_TECH_TREE_TARGET_NODE with NO_NODE.",
          "The caller must still re-read notification state; successful App UI sends are not proof that the technology-choice blocker cleared."
        ],
      };
    };`;
}

export async function requestCiv7TechnologyChoiceCloseout(
  input: Civ7TechnologyChoiceCloseoutInput,
  options: Civ7DirectControlOptions = {},
  approval: Civ7ActionApproval,
  dependencies: TechnologyChoiceCloseoutRequestDependencies = defaultTechnologyChoiceCloseoutDependencies,
): Promise<Civ7TechnologyChoiceCloseoutResult> {
  dependencies.assertApproved(approval, "choosing Civ7 technology node through App UI closeout");
  dependencies.validatePlayerId(input.playerId);
  if (!Number.isInteger(input.node)) dependencies.invalidNodeError();
  const command = await dependencies.executeAppUiCommand({
    ...options,
    command: buildTechnologyChoiceCloseoutCommand(input, dependencies),
  });
  const payload = dependencies.parseTechnologyChoiceCloseout(command, "Civ7 technology choice closeout");
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

const defaultTechnologyChoiceCloseoutDependencies: TechnologyChoiceCloseoutRequestDependencies = {
  assertApproved,
  executeAppUiCommand: executeCiv7AppUiCommand,
  invalidNodeError: () => {
    throw new Civ7DirectControlError("command-failed", "node must be an integer");
  },
  jsLiteral,
  parseTechnologyChoiceCloseout: (result, label) =>
    jsonPayloadFromCommandResult<{
      sent?: boolean;
      chooseResult?: { ok?: boolean };
      clearTargetResult?: { ok?: boolean };
    }>(result, label),
  validatePlayerId,
};

import type {
  Civ7ProgressionTreeCheckResult,
  Civ7ProgressionTreeClearTargetInput,
  Civ7ProgressionTreeClearTargetResult,
  Civ7ProgressionTreeKind,
  Civ7ProgressionTreeNodeInput,
  Civ7ProgressionTreeNodeSendInput,
  Civ7ProgressionTreeSendResult,
  Civ7ProgressionTreeSnapshot,
} from "@civ7/direct-control";

import {
  type Civ7GameUiProgressionTarget,
  jsonValuesMatch,
  localPlayerAvailable,
  type PlayerRecord,
  progressionDispatchError,
  readBlockingNotificationEvidence,
  recordOrNull,
  requireInteger,
  requireIntegerOrNull,
  requireLocalPlayer,
  requireOperationType,
  requirePlayerOperations,
  strictPlayerOperationValidation,
} from "./shared";

export function civ7GameUiProgressionTreeCheckAvailable(
  target: Civ7GameUiProgressionTarget
): boolean {
  return (
    progressionTreeObservationAvailable(target) &&
    typeof target.Game?.PlayerOperations?.canStart === "function" &&
    treeOperationTypesAvailable(target)
  );
}

export function civ7GameUiProgressionTreeSendAvailable(
  target: Civ7GameUiProgressionTarget
): boolean {
  return (
    civ7GameUiProgressionTreeCheckAvailable(target) &&
    typeof target.Game?.PlayerOperations?.sendRequest === "function"
  );
}

export async function checkCiv7GameUiProgressionTreeChoice(
  input: Civ7ProgressionTreeNodeInput,
  target: Civ7GameUiProgressionTarget = globalThis as Civ7GameUiProgressionTarget
): Promise<Civ7ProgressionTreeCheckResult> {
  return checkProgressionTreeNode(input, false, target);
}

export async function sendCiv7GameUiProgressionTreeChoice(
  input: Civ7ProgressionTreeNodeSendInput,
  target: Civ7GameUiProgressionTarget = globalThis as Civ7GameUiProgressionTarget
): Promise<Civ7ProgressionTreeSendResult> {
  return sendProgressionTreeNode(input, false, target);
}

export async function checkCiv7GameUiProgressionTreeTarget(
  input: Civ7ProgressionTreeNodeInput,
  target: Civ7GameUiProgressionTarget = globalThis as Civ7GameUiProgressionTarget
): Promise<Civ7ProgressionTreeCheckResult> {
  return checkProgressionTreeNode(input, true, target);
}

export async function sendCiv7GameUiProgressionTreeTarget(
  input: Civ7ProgressionTreeNodeSendInput,
  target: Civ7GameUiProgressionTarget = globalThis as Civ7GameUiProgressionTarget
): Promise<Civ7ProgressionTreeSendResult> {
  return sendProgressionTreeNode(input, true, target);
}

export async function clearCiv7GameUiProgressionTreeTarget(
  input: Civ7ProgressionTreeClearTargetInput,
  target: Civ7GameUiProgressionTarget = globalThis as Civ7GameUiProgressionTarget
): Promise<Civ7ProgressionTreeClearTargetResult> {
  let sendInvoked = false;
  try {
    const kind = requireTreeKind(input.kind);
    const before = readProgressionTreeSnapshot(kind, target);
    if (!jsonValuesMatch(input.expected, before)) {
      throw new Error("Progression tree target-clear admission evidence changed before dispatch.");
    }
    const operations = requirePlayerOperations(target);
    const operationType = requireTreeOperationType(kind, true, target);
    sendInvoked = true;
    operations.sendRequest(before.localPlayerId, operationType, {
      ProgressionTreeNodeType: before.noNode,
    });
    return {
      sent: true,
      before,
      after: readProgressionTreeSnapshot(kind, target),
    };
  } catch (cause) {
    throw progressionDispatchError(cause, sendInvoked ? "dispatched" : "not-dispatched");
  }
}

function checkProgressionTreeNode(
  input: Civ7ProgressionTreeNodeInput,
  targetOperation: boolean,
  target: Civ7GameUiProgressionTarget
): Civ7ProgressionTreeCheckResult {
  const kind = requireTreeKind(input.kind);
  const node = requireInteger(input.node, "node");
  const snapshot = readProgressionTreeSnapshot(kind, target);
  const validation = strictPlayerOperationValidation(
    snapshot.localPlayerId,
    requireTreeOperationType(kind, targetOperation, target),
    { ProgressionTreeNodeType: node },
    target
  );
  return {
    valid: validation.valid,
    result: validation.result,
    snapshot,
  };
}

function sendProgressionTreeNode(
  input: Civ7ProgressionTreeNodeSendInput,
  targetOperation: boolean,
  target: Civ7GameUiProgressionTarget
): Civ7ProgressionTreeSendResult {
  let sendInvoked = false;
  try {
    const kind = requireTreeKind(input.kind);
    const node = requireInteger(input.node, "node");
    const before = readProgressionTreeSnapshot(kind, target);
    if (!jsonValuesMatch(input.expected, before)) {
      throw new Error("Progression tree admission evidence changed before dispatch.");
    }
    const operationType = requireTreeOperationType(kind, targetOperation, target);
    const args = { ProgressionTreeNodeType: node };
    const validation = strictPlayerOperationValidation(
      before.localPlayerId,
      operationType,
      args,
      target
    );
    if (!validation.valid) {
      return {
        sent: false,
        validation,
        before,
        after: readProgressionTreeSnapshot(kind, target),
      };
    }
    const operations = requirePlayerOperations(target);
    sendInvoked = true;
    operations.sendRequest(before.localPlayerId, operationType, args);
    return {
      sent: true,
      validation,
      before,
      after: readProgressionTreeSnapshot(kind, target),
    };
  } catch (cause) {
    throw progressionDispatchError(cause, sendInvoked ? "dispatched" : "not-dispatched");
  }
}

function readProgressionTreeSnapshot(
  kind: Civ7ProgressionTreeKind,
  target: Civ7GameUiProgressionTarget
): Civ7ProgressionTreeSnapshot {
  const { localPlayerId, player } = requireLocalPlayer(target);
  const noNode = requireInteger(target.ProgressionTreeNodeTypes?.NO_NODE, "NO_NODE");
  const progression = recordOrNull(kind === "technology" ? player.Techs : player.Culture);
  const getTargetNode = progression?.getTargetNode;
  if (progression == null || typeof getTargetNode !== "function") {
    throw new Error(`The local player ${kind} target observation is unavailable.`);
  }
  return {
    localPlayerId,
    kind,
    currentNode: readCurrentTreeNode(localPlayerId, progression, kind, target),
    targetNode: requireIntegerOrNull(getTargetNode.call(progression), `${kind} getTargetNode`),
    noNode,
    ...readBlockingNotificationEvidence(localPlayerId, target),
  };
}

function readCurrentTreeNode(
  localPlayerId: number,
  progression: PlayerRecord,
  kind: Civ7ProgressionTreeKind,
  target: Civ7GameUiProgressionTarget
): number | null {
  const getResearching = progression.getResearching;
  if (kind === "technology" && typeof getResearching === "function") {
    return requireIntegerOrNull(getResearching.call(progression), "Techs.getResearching");
  }
  const readTreeType = kind === "technology" ? progression.getTreeType : progression.getActiveTree;
  const treeType = typeof readTreeType === "function" ? readTreeType.call(progression) : null;
  if (treeType == null) return null;
  const trees = target.Game?.ProgressionTrees;
  const getTree = trees?.getTree;
  if (typeof getTree !== "function") {
    throw new Error("Game.ProgressionTrees.getTree is unavailable.");
  }
  const tree = recordOrNull(getTree.call(trees, localPlayerId, treeType));
  const activeNodeIndex = tree?.activeNodeIndex;
  if (
    typeof activeNodeIndex !== "number" ||
    !Number.isInteger(activeNodeIndex) ||
    activeNodeIndex < 0
  ) {
    return null;
  }
  const nodes = tree?.nodes;
  const activeNode = Array.isArray(nodes) ? recordOrNull(nodes[activeNodeIndex]) : null;
  return requireIntegerOrNull(activeNode?.nodeType, "Game.ProgressionTrees.getTree active node");
}

function requireTreeOperationType(
  kind: Civ7ProgressionTreeKind,
  targetOperation: boolean,
  target: Civ7GameUiProgressionTarget
): unknown {
  const name =
    kind === "technology"
      ? targetOperation
        ? "SET_TECH_TREE_TARGET_NODE"
        : "SET_TECH_TREE_NODE"
      : targetOperation
        ? "SET_CULTURE_TREE_TARGET_NODE"
        : "SET_CULTURE_TREE_NODE";
  return requireOperationType(name, target);
}

function requireTreeKind(value: unknown): Civ7ProgressionTreeKind {
  if (value !== "technology" && value !== "culture") {
    throw new Error("kind must be technology or culture.");
  }
  return value;
}

function treeOperationTypesAvailable(target: Civ7GameUiProgressionTarget): boolean {
  return (
    target.PlayerOperationTypes?.SET_TECH_TREE_NODE !== undefined &&
    target.PlayerOperationTypes.SET_TECH_TREE_TARGET_NODE !== undefined &&
    target.PlayerOperationTypes.SET_CULTURE_TREE_NODE !== undefined &&
    target.PlayerOperationTypes.SET_CULTURE_TREE_TARGET_NODE !== undefined
  );
}

function progressionTreeObservationAvailable(target: Civ7GameUiProgressionTarget): boolean {
  return (
    localPlayerAvailable(target) &&
    Number.isInteger(target.ProgressionTreeNodeTypes?.NO_NODE) &&
    typeof target.Game?.ProgressionTrees?.getTree === "function"
  );
}

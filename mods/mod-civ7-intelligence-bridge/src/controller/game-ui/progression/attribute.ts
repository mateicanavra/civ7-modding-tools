import type {
  Civ7AttributeNodeSnapshot,
  Civ7AttributePurchaseAtomInput,
  Civ7AttributePurchaseAtomSendInput,
  Civ7AttributePurchaseCheckResult,
  Civ7AttributePurchaseSendResult,
  Civ7AttributeReviewAtomInput,
  Civ7AttributeReviewCheckResult,
  Civ7AttributeReviewSendInput,
  Civ7AttributeReviewSendResult,
} from "@civ7/direct-control";

import {
  type Civ7GameUiProgressionTarget,
  isIterable,
  jsonValuesMatch,
  localPlayerAvailable,
  type PlayerRecord,
  progressionDispatchError,
  readBlockingNotificationEvidence,
  recordOrNull,
  requireInteger,
  requireIntegerOrNull,
  requireLocalPlayer,
  requireNumberOrNull,
  requireOperationType,
  requirePlayerOperations,
  strictPlayerOperationValidation,
} from "./shared";

export function civ7GameUiAttributePurchaseCheckAvailable(
  target: Civ7GameUiProgressionTarget
): boolean {
  return (
    attributeObservationAvailable(target) &&
    typeof target.Game?.PlayerOperations?.canStart === "function" &&
    target.PlayerOperationTypes?.BUY_ATTRIBUTE_TREE_NODE !== undefined
  );
}

export function civ7GameUiAttributePurchaseSendAvailable(
  target: Civ7GameUiProgressionTarget
): boolean {
  return (
    civ7GameUiAttributePurchaseCheckAvailable(target) &&
    typeof target.Game?.PlayerOperations?.sendRequest === "function"
  );
}

export function civ7GameUiAttributeReviewCheckAvailable(
  target: Civ7GameUiProgressionTarget
): boolean {
  return (
    localPlayerAvailable(target) &&
    typeof target.Game?.PlayerOperations?.canStart === "function" &&
    target.PlayerOperationTypes?.CONSIDER_ASSIGN_ATTRIBUTE !== undefined
  );
}

export function civ7GameUiAttributeReviewSendAvailable(
  target: Civ7GameUiProgressionTarget
): boolean {
  return (
    civ7GameUiAttributeReviewCheckAvailable(target) &&
    typeof target.Game?.PlayerOperations?.sendRequest === "function"
  );
}

export async function observeCiv7GameUiAttributeNode(
  input: Civ7AttributePurchaseAtomInput,
  target: Civ7GameUiProgressionTarget = globalThis as Civ7GameUiProgressionTarget
): Promise<Civ7AttributeNodeSnapshot> {
  return readAttributeNodeSnapshot(requireInteger(input.node, "node"), target);
}

export async function checkCiv7GameUiAttributePurchase(
  input: Civ7AttributePurchaseAtomInput,
  target: Civ7GameUiProgressionTarget = globalThis as Civ7GameUiProgressionTarget
): Promise<Civ7AttributePurchaseCheckResult> {
  const node = requireInteger(input.node, "node");
  const snapshot = readAttributeNodeSnapshot(node, target);
  const validation = strictPlayerOperationValidation(
    snapshot.localPlayerId,
    requireOperationType("BUY_ATTRIBUTE_TREE_NODE", target),
    { ProgressionTreeNodeType: node },
    target
  );
  return {
    valid: validation.valid,
    result: validation.result,
    snapshot,
  };
}

export async function sendCiv7GameUiAttributePurchase(
  input: Civ7AttributePurchaseAtomSendInput,
  target: Civ7GameUiProgressionTarget = globalThis as Civ7GameUiProgressionTarget
): Promise<Civ7AttributePurchaseSendResult> {
  let sendInvoked = false;
  try {
    const node = requireInteger(input.node, "node");
    const before = readAttributeNodeSnapshot(node, target);
    if (!jsonValuesMatch(input.expected, before)) {
      throw new Error("Attribute node admission evidence changed before dispatch.");
    }
    const operationType = requireOperationType("BUY_ATTRIBUTE_TREE_NODE", target);
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
        after: readAttributeNodeSnapshot(node, target),
      };
    }
    const operations = requirePlayerOperations(target);
    sendInvoked = true;
    operations.sendRequest(before.localPlayerId, operationType, args);
    return {
      sent: true,
      validation,
      before,
      after: readAttributeNodeSnapshot(node, target),
    };
  } catch (cause) {
    throw progressionDispatchError(cause, sendInvoked ? "dispatched" : "not-dispatched");
  }
}

export async function checkCiv7GameUiAttributeReview(
  _input: Civ7AttributeReviewAtomInput,
  target: Civ7GameUiProgressionTarget = globalThis as Civ7GameUiProgressionTarget
): Promise<Civ7AttributeReviewCheckResult> {
  const snapshot = readAttributeReviewSnapshot(target);
  const validation = strictPlayerOperationValidation(
    snapshot.localPlayerId,
    requireOperationType("CONSIDER_ASSIGN_ATTRIBUTE", target),
    {},
    target
  );
  return {
    valid: validation.valid,
    result: validation.result,
    snapshot,
  };
}

export async function sendCiv7GameUiAttributeReview(
  input: Civ7AttributeReviewSendInput,
  target: Civ7GameUiProgressionTarget = globalThis as Civ7GameUiProgressionTarget
): Promise<Civ7AttributeReviewSendResult> {
  let sendInvoked = false;
  try {
    const before = readAttributeReviewSnapshot(target);
    if (!jsonValuesMatch(input.expected, before)) {
      throw new Error("Attribute review admission evidence changed before dispatch.");
    }
    const operationType = requireOperationType("CONSIDER_ASSIGN_ATTRIBUTE", target);
    const validation = strictPlayerOperationValidation(
      before.localPlayerId,
      operationType,
      {},
      target
    );
    if (!validation.valid) return { sent: false, validation, before };
    const operations = requirePlayerOperations(target);
    sendInvoked = true;
    operations.sendRequest(before.localPlayerId, operationType, {});
    return { sent: true, validation, before };
  } catch (cause) {
    throw progressionDispatchError(cause, sendInvoked ? "dispatched" : "not-dispatched");
  }
}

function readAttributeNodeSnapshot(
  node: number,
  target: Civ7GameUiProgressionTarget
): Civ7AttributeNodeSnapshot {
  const { localPlayerId, player } = requireLocalPlayer(target);
  const trees = target.Game?.ProgressionTrees;
  if (typeof trees?.getNodeState !== "function") {
    throw new Error("Game.ProgressionTrees.getNodeState is unavailable.");
  }
  if (typeof trees.getNode !== "function") {
    throw new Error("Game.ProgressionTrees.getNode is unavailable.");
  }
  const nodeState = requireIntegerOrNull(
    trees.getNodeState(localPlayerId, node),
    "Game.ProgressionTrees.getNodeState"
  );
  const nodeData = recordOrNull(trees.getNode(localPlayerId, node));
  const attribute = readAttributeInformation(player, nodeData, target);
  return {
    localPlayerId,
    node,
    nodeState,
    depthUnlocked: requireIntegerOrNull(
      nodeData?.depthUnlocked,
      "Game.ProgressionTrees.getNode depthUnlocked"
    ),
    repeatedDepth: requireIntegerOrNull(
      nodeData?.repeatedDepth,
      "Game.ProgressionTrees.getNode repeatedDepth"
    ),
    attributeType: attribute?.attributeType ?? null,
    availablePoints: requireNumberOrNull(attribute?.availablePoints, "available attribute points"),
    wildcardPoints: requireNumberOrNull(attribute?.wildcardPoints, "wildcard attribute points"),
  };
}

function readAttributeInformation(
  player: PlayerRecord,
  node: PlayerRecord | null,
  target: Civ7GameUiProgressionTarget
): Readonly<{
  attributeType: number | string | null;
  availablePoints: unknown;
  wildcardPoints: unknown;
}> | null {
  const nodeType = node?.nodeType ?? node?.ProgressionTreeNodeType ?? null;
  const nodeDefinition =
    typeof target.GameInfo?.ProgressionTreeNodes?.lookup === "function"
      ? recordOrNull(target.GameInfo.ProgressionTreeNodes.lookup(nodeType))
      : null;
  const progressionTreeType = nodeDefinition?.ProgressionTree ?? node?.progressionTree ?? null;
  const attributes = target.GameInfo?.Attributes;
  if (!isIterable(attributes)) return null;
  for (const rawDefinition of attributes) {
    const definition = recordOrNull(rawDefinition);
    if (definition == null || definition.ProgressionTreeType !== progressionTreeType) continue;
    const attributeType = requireAttributeType(definition.AttributeType);
    const identity = recordOrNull(player.Identity);
    return {
      attributeType,
      availablePoints:
        typeof identity?.getAvailableAttributePoints === "function"
          ? identity.getAvailableAttributePoints(attributeType)
          : null,
      wildcardPoints:
        typeof identity?.getWildcardPoints === "function" ? identity.getWildcardPoints() : null,
    };
  }
  return null;
}

function readAttributeReviewSnapshot(
  target: Civ7GameUiProgressionTarget
): Civ7AttributeReviewCheckResult["snapshot"] {
  const { localPlayerId } = requireLocalPlayer(target);
  return {
    localPlayerId,
    ...readBlockingNotificationEvidence(localPlayerId, target),
  };
}

function requireAttributeType(value: unknown): number | string | null {
  if (value == null) return null;
  if (typeof value === "string") return value;
  if (typeof value === "number" && Number.isInteger(value)) return value;
  throw new Error("GameInfo.Attributes AttributeType returned an unsupported value.");
}

function attributeObservationAvailable(target: Civ7GameUiProgressionTarget): boolean {
  return (
    localPlayerAvailable(target) &&
    typeof target.Game?.ProgressionTrees?.getNode === "function" &&
    typeof target.Game.ProgressionTrees.getNodeState === "function"
  );
}

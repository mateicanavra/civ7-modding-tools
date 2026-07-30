import type {
  Civ7TraditionAssignmentsSnapshot,
  Civ7TraditionChangeAtomInput,
  Civ7TraditionChangeAtomSendInput,
  Civ7TraditionChangeCheckResult,
  Civ7TraditionChangeSendResult,
  Civ7TraditionReviewAtomInput,
  Civ7TraditionReviewCheckResult,
  Civ7TraditionReviewSendInput,
  Civ7TraditionReviewSendResult,
} from "@civ7/direct-control";

import {
  type Civ7GameUiProgressionTarget,
  isIterable,
  jsonValuesMatch,
  localPlayerAvailable,
  progressionDispatchError,
  readBlockingNotificationEvidence,
  recordOrNull,
  requireInteger,
  requireLocalPlayer,
  requireOperationType,
  requirePlayerOperations,
  strictPlayerOperationValidation,
} from "./shared";

export function civ7GameUiTraditionChangeCheckAvailable(
  target: Civ7GameUiProgressionTarget
): boolean {
  return (
    traditionObservationAvailable(target) &&
    typeof target.Game?.PlayerOperations?.canStart === "function" &&
    target.PlayerOperationTypes?.CHANGE_TRADITION !== undefined &&
    Number.isInteger(target.PlayerOperationParameters?.Activate) &&
    Number.isInteger(target.PlayerOperationParameters?.Deactivate)
  );
}

export function civ7GameUiTraditionChangeSendAvailable(
  target: Civ7GameUiProgressionTarget
): boolean {
  return (
    civ7GameUiTraditionChangeCheckAvailable(target) &&
    typeof target.Game?.PlayerOperations?.sendRequest === "function"
  );
}

export function civ7GameUiTraditionReviewCheckAvailable(
  target: Civ7GameUiProgressionTarget
): boolean {
  return (
    traditionObservationAvailable(target) &&
    typeof target.Game?.PlayerOperations?.canStart === "function" &&
    target.PlayerOperationTypes?.CONSIDER_ASSIGN_TRADITIONS !== undefined
  );
}

export function civ7GameUiTraditionReviewSendAvailable(
  target: Civ7GameUiProgressionTarget
): boolean {
  return (
    civ7GameUiTraditionReviewCheckAvailable(target) &&
    typeof target.Game?.PlayerOperations?.sendRequest === "function"
  );
}

export async function observeCiv7GameUiTraditionAssignments(
  target: Civ7GameUiProgressionTarget = globalThis as Civ7GameUiProgressionTarget
): Promise<Civ7TraditionAssignmentsSnapshot> {
  return readTraditionAssignmentsSnapshot(target);
}

export async function checkCiv7GameUiTraditionChange(
  input: Civ7TraditionChangeAtomInput,
  target: Civ7GameUiProgressionTarget = globalThis as Civ7GameUiProgressionTarget
): Promise<Civ7TraditionChangeCheckResult> {
  const traditionType = requireInteger(input.traditionType, "traditionType");
  const snapshot = readTraditionAssignmentsSnapshot(target);
  const validation = strictPlayerOperationValidation(
    snapshot.localPlayerId,
    requireOperationType("CHANGE_TRADITION", target),
    {
      TraditionType: traditionType,
      Action: requireTraditionAction(input.action, target),
    },
    target
  );
  return {
    valid: validation.valid,
    result: validation.result,
    snapshot,
  };
}

export async function sendCiv7GameUiTraditionChange(
  input: Civ7TraditionChangeAtomSendInput,
  target: Civ7GameUiProgressionTarget = globalThis as Civ7GameUiProgressionTarget
): Promise<Civ7TraditionChangeSendResult> {
  let sendInvoked = false;
  try {
    const traditionType = requireInteger(input.traditionType, "traditionType");
    const before = readTraditionAssignmentsSnapshot(target);
    if (!jsonValuesMatch(input.expected, before)) {
      throw new Error("Tradition assignment admission evidence changed before dispatch.");
    }
    const operationType = requireOperationType("CHANGE_TRADITION", target);
    const args = {
      TraditionType: traditionType,
      Action: requireTraditionAction(input.action, target),
    };
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
        after: readTraditionAssignmentsSnapshot(target),
      };
    }
    const operations = requirePlayerOperations(target);
    sendInvoked = true;
    operations.sendRequest(before.localPlayerId, operationType, args);
    return {
      sent: true,
      validation,
      before,
      after: readTraditionAssignmentsSnapshot(target),
    };
  } catch (cause) {
    throw progressionDispatchError(cause, sendInvoked ? "dispatched" : "not-dispatched");
  }
}

export async function checkCiv7GameUiTraditionReview(
  _input: Civ7TraditionReviewAtomInput,
  target: Civ7GameUiProgressionTarget = globalThis as Civ7GameUiProgressionTarget
): Promise<Civ7TraditionReviewCheckResult> {
  const snapshot = readTraditionReviewSnapshot(target);
  const validation = strictPlayerOperationValidation(
    snapshot.localPlayerId,
    requireOperationType("CONSIDER_ASSIGN_TRADITIONS", target),
    {},
    target
  );
  return {
    valid: validation.valid,
    result: validation.result,
    snapshot,
  };
}

export async function sendCiv7GameUiTraditionReview(
  input: Civ7TraditionReviewSendInput,
  target: Civ7GameUiProgressionTarget = globalThis as Civ7GameUiProgressionTarget
): Promise<Civ7TraditionReviewSendResult> {
  let sendInvoked = false;
  try {
    const before = readTraditionReviewSnapshot(target);
    if (!jsonValuesMatch(input.expected, before)) {
      throw new Error("Tradition review admission evidence changed before dispatch.");
    }
    const operationType = requireOperationType("CONSIDER_ASSIGN_TRADITIONS", target);
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

function readTraditionAssignmentsSnapshot(
  target: Civ7GameUiProgressionTarget
): Civ7TraditionAssignmentsSnapshot {
  const { localPlayerId, player } = requireLocalPlayer(target);
  const culture = recordOrNull(player.Culture);
  if (typeof culture?.getActiveTraditions !== "function") {
    throw new Error("The local player Culture.getActiveTraditions is unavailable.");
  }
  const activeTraditions = new Set<number>();
  for (const slotType of requireCultureSlotTypes(target)) {
    const rawTraditions = culture.getActiveTraditions(slotType);
    if (!isIterable(rawTraditions)) {
      throw new Error("Culture.getActiveTraditions returned a non-iterable value.");
    }
    for (const tradition of rawTraditions) {
      activeTraditions.add(requireInteger(tradition, "Culture.getActiveTraditions value"));
    }
  }
  return {
    localPlayerId,
    activeTraditions: Array.from(activeTraditions).sort((left, right) => left - right),
  };
}

function requireCultureSlotTypes(target: Civ7GameUiProgressionTarget): readonly unknown[] {
  const slots = target.CultureSlotTypes;
  const values = [
    slots?.POLICY_CULTURE_SLOT,
    slots?.TRADITION_CULTURE_SLOT,
    slots?.CRISIS_CULTURE_SLOT,
  ];
  if (values.some((value) => value == null)) {
    throw new Error("The Civ7 policy, tradition, and crisis culture-slot types are unavailable.");
  }
  return values;
}

function readTraditionReviewSnapshot(
  target: Civ7GameUiProgressionTarget
): Civ7TraditionReviewCheckResult["snapshot"] {
  const { localPlayerId, player } = requireLocalPlayer(target);
  if (typeof recordOrNull(player.Culture)?.getActiveTraditions !== "function") {
    throw new Error("The local player Culture.getActiveTraditions is unavailable.");
  }
  return {
    localPlayerId,
    ...readBlockingNotificationEvidence(localPlayerId, target),
  };
}

function requireTraditionAction(
  action: Civ7TraditionChangeAtomInput["action"],
  target: Civ7GameUiProgressionTarget
): number {
  const value =
    action === "activate"
      ? target.PlayerOperationParameters?.Activate
      : target.PlayerOperationParameters?.Deactivate;
  return requireInteger(value, `PlayerOperationParameters.${action}`);
}

function traditionObservationAvailable(target: Civ7GameUiProgressionTarget): boolean {
  if (!localPlayerAvailable(target)) return false;
  try {
    const { player } = requireLocalPlayer(target);
    return (
      typeof recordOrNull(player.Culture)?.getActiveTraditions === "function" &&
      requireCultureSlotTypes(target).length === 3
    );
  } catch {
    return false;
  }
}

import { type Static, Type } from "typebox";
import { Value } from "typebox/value";

import { Civ7ComponentIdSchema } from "../../civ7-component-id.js";
import {
  Civ7DirectControlError,
  directControlErrorWithDispatchStatus,
} from "../../direct-control-error.js";
import { jsLiteral } from "../../runtime/command-serialization.js";
import { Civ7RuntimeProbeSchema, probeHelperSource } from "../../runtime/probe.js";
import { schemaBodyFromCommandResult } from "../../session/command-result.js";
import { executeCiv7AppUiCommand } from "../../session/execute.js";
import type { Civ7DirectControlOptions } from "../../session/types.js";
import { actionPanelTurnAuthoritySource } from "../action-panel-turn.js";

const Civ7DiplomacyResponseJsonValueSchema = Type.Cyclic(
  {
    Civ7DiplomacyResponseJsonValue: Type.Union([
      Type.Null(),
      Type.Boolean(),
      Type.Number(),
      Type.String(),
      Type.Array(Type.Ref("Civ7DiplomacyResponseJsonValue")),
      Type.Record(Type.String(), Type.Ref("Civ7DiplomacyResponseJsonValue")),
    ]),
  },
  "Civ7DiplomacyResponseJsonValue"
);

const nullableStringSchema = Type.Union([Type.String(), Type.Null()]);
const nullableIntegerSchema = Type.Union([Type.Integer(), Type.Null()]);
const blockerIdentitySchema = Type.Union([Type.Integer(), Type.String()]);

const Civ7DiplomacyResponseDataSchema = Type.Object(
  {
    actionId: nullableIntegerSchema,
    offeredResponseTypes: Type.Array(Type.Integer()),
  },
  { additionalProperties: false }
);

const Civ7DiplomacyBlockingNotificationSchema = Type.Union([
  Type.Null(),
  Type.Object(
    {
      id: Civ7ComponentIdSchema,
      type: blockerIdentitySchema,
      typeName: nullableStringSchema,
      actionId: nullableIntegerSchema,
    },
    { additionalProperties: false }
  ),
]);

/** Native identifiers for one ordinary diplomacy response intent. */
export const Civ7DiplomacyResponseInputSchema = Type.Object(
  {
    actionId: Type.Integer(),
    responseType: Type.Integer(),
  },
  { additionalProperties: false }
);
export type Civ7DiplomacyResponseInput = Readonly<Static<typeof Civ7DiplomacyResponseInputSchema>>;

/** Immutable native admission, response-list, and blocker evidence. */
export const Civ7DiplomacyResponseSnapshotSchema = Type.Object(
  {
    localPlayerId: Type.Integer(),
    actionId: Type.Integer(),
    responseType: Type.Integer(),
    denounceMilitaryPresenceActionType: Type.Integer(),
    rejectionResponseType: Type.Integer(),
    noneBlockerType: blockerIdentitySchema,
    responseData: Civ7RuntimeProbeSchema(Civ7DiplomacyResponseDataSchema),
    eventActionType: Civ7RuntimeProbeSchema(Type.Integer()),
    canEndTurn: Civ7RuntimeProbeSchema(Type.Boolean()),
    blocker: Civ7RuntimeProbeSchema(blockerIdentitySchema),
    blockingNotification: Civ7RuntimeProbeSchema(Civ7DiplomacyBlockingNotificationSchema),
  },
  { additionalProperties: false }
);
export type Civ7DiplomacyResponseSnapshot = Readonly<
  Static<typeof Civ7DiplomacyResponseSnapshotSchema>
>;

/** Guarded send input carrying the exact snapshot admitted by the preceding check. */
export const Civ7DiplomacyResponseSendInputSchema = Type.Object(
  {
    actionId: Type.Integer(),
    responseType: Type.Integer(),
    expected: Civ7DiplomacyResponseSnapshotSchema,
  },
  { additionalProperties: false }
);
export type Civ7DiplomacyResponseSendInput = Readonly<
  Static<typeof Civ7DiplomacyResponseSendInputSchema>
>;

/** Native `canStart` evidence for the exact ordinary diplomacy operation. */
export const Civ7DiplomacyResponseValidationResultSchema = Type.Object(
  {
    valid: Type.Boolean(),
    result: Civ7DiplomacyResponseJsonValueSchema,
  },
  { additionalProperties: false }
);
export type Civ7DiplomacyResponseValidationResult = Readonly<
  Static<typeof Civ7DiplomacyResponseValidationResultSchema>
>;

/** Exact native validation paired with the immutable evidence used to obtain it. */
export const Civ7DiplomacyResponseCheckResultSchema = Type.Object(
  {
    valid: Type.Boolean(),
    result: Civ7DiplomacyResponseJsonValueSchema,
    snapshot: Civ7DiplomacyResponseSnapshotSchema,
  },
  { additionalProperties: false }
);
export type Civ7DiplomacyResponseCheckResult = Readonly<
  Static<typeof Civ7DiplomacyResponseCheckResultSchema>
>;

const Civ7DiplomacyResponseValidValidationResultSchema = Type.Object(
  {
    valid: Type.Literal(true),
    result: Civ7DiplomacyResponseJsonValueSchema,
  },
  { additionalProperties: false }
);

const Civ7DiplomacyResponseInvalidValidationResultSchema = Type.Object(
  {
    valid: Type.Literal(false),
    result: Civ7DiplomacyResponseJsonValueSchema,
  },
  { additionalProperties: false }
);

/** Native dispatch result with before-and-after observations, not an acceptance receipt. */
export const Civ7DiplomacyResponseSendResultSchema = Type.Union([
  Type.Object(
    {
      sent: Type.Literal(true),
      validation: Civ7DiplomacyResponseValidValidationResultSchema,
      before: Civ7DiplomacyResponseSnapshotSchema,
      after: Civ7DiplomacyResponseSnapshotSchema,
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      sent: Type.Literal(false),
      validation: Civ7DiplomacyResponseInvalidValidationResultSchema,
      before: Civ7DiplomacyResponseSnapshotSchema,
      after: Civ7DiplomacyResponseSnapshotSchema,
    },
    { additionalProperties: false }
  ),
]);
export type Civ7DiplomacyResponseSendResult = Readonly<
  Static<typeof Civ7DiplomacyResponseSendResultSchema>
>;

const Civ7DiplomacyResponseSendEnvelopeSchema = Type.Union([
  Type.Object(
    {
      ok: Type.Literal(true),
      value: Civ7DiplomacyResponseSendResultSchema,
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      ok: Type.Literal(false),
      gameplayDispatchStatus: Type.Union([
        Type.Literal("not-dispatched"),
        Type.Literal("dispatched"),
      ]),
      error: Type.String({ maxLength: 512 }),
    },
    { additionalProperties: false }
  ),
]);

/** Reads exact native admission and focused evidence for one diplomacy response. */
export async function checkCiv7DiplomacyResponse(
  input: Civ7DiplomacyResponseInput,
  options: Civ7DirectControlOptions = {}
): Promise<Civ7DiplomacyResponseCheckResult> {
  const command = await executeCiv7AppUiCommand({
    ...options,
    command: buildDiplomacyResponseWireCommand("checkDiplomacyResponse", input),
  });
  return schemaBodyFromCommandResult(
    command,
    "Civ7 diplomacy response check",
    Civ7DiplomacyResponseCheckResultSchema
  );
}

/** Invokes the exact native response once after its complete snapshot still matches. */
export async function sendCiv7DiplomacyResponse(
  input: Civ7DiplomacyResponseSendInput,
  options: Civ7DirectControlOptions = {}
): Promise<Civ7DiplomacyResponseSendResult> {
  const wireCommand = buildDiplomacyResponseWireCommand("sendDiplomacyResponse", input);
  let envelope: Static<typeof Civ7DiplomacyResponseSendEnvelopeSchema>;
  let command: Awaited<ReturnType<typeof executeCiv7AppUiCommand>>;
  try {
    command = await executeCiv7AppUiCommand({
      ...options,
      command: wireCommand,
    });
    envelope = schemaBodyFromCommandResult(
      command,
      "Civ7 diplomacy response send",
      Civ7DiplomacyResponseSendEnvelopeSchema
    );
  } catch (cause) {
    throw directControlErrorWithDispatchStatus(cause, "indeterminate");
  }
  if (envelope.ok) return envelope.value;
  throw new Civ7DirectControlError("command-failed", envelope.error, {
    details: command,
    dispatchStatus: envelope.gameplayDispatchStatus,
  });
}

type DiplomacyResponseAtom = "checkDiplomacyResponse" | "sendDiplomacyResponse";

function buildDiplomacyResponseWireCommand(
  atom: "checkDiplomacyResponse",
  input: Civ7DiplomacyResponseInput
): string;
function buildDiplomacyResponseWireCommand(
  atom: "sendDiplomacyResponse",
  input: Civ7DiplomacyResponseSendInput
): string;
function buildDiplomacyResponseWireCommand(
  atom: DiplomacyResponseAtom,
  input: Civ7DiplomacyResponseInput | Civ7DiplomacyResponseSendInput
): string {
  try {
    if (atom === "checkDiplomacyResponse") {
      if (!Value.Check(Civ7DiplomacyResponseInputSchema, input)) {
        throw new TypeError(
          "Diplomacy response check input must contain integer action and response identifiers."
        );
      }
      return `(() => {
    ${diplomacyResponseWireSource()}
    return JSON.stringify(checkDiplomacyResponse(${jsLiteral(input)}));
  })()`;
    }
    if (!Value.Check(Civ7DiplomacyResponseSendInputSchema, input)) {
      throw new TypeError(
        "Diplomacy response send input must contain integer identifiers and the expected snapshot."
      );
    }
    return `(() => {
    ${diplomacyResponseWireSource()}
    return JSON.stringify(sendDiplomacyResponseEnvelope(${jsLiteral(input)}));
  })()`;
  } catch (cause) {
    throw directControlErrorWithDispatchStatus(cause, "not-dispatched");
  }
}

function diplomacyResponseWireSource(): string {
  return `${probeHelperSource()}
    ${actionPanelTurnAuthoritySource()}
    const immutableJson = (value, label) => {
      const serialized = JSON.stringify(value);
      if (serialized === undefined) throw new Error(label + " returned non-JSON evidence.");
      return JSON.parse(serialized);
    };
    const requireInteger = (value, label) => {
      if (!Number.isInteger(value)) throw new Error(label + " is unavailable.");
      return value;
    };
    const requireBlockerType = (value) => {
      if (Number.isInteger(value)) return value;
      if (typeof value === "string" && value.trim().length > 0) return value;
      throw new Error(
        "Game.Notifications.getEndTurnBlockingType returned an unsupported blocker identity."
      );
    };
    const toComponentId = (value) => {
      if (!value || (typeof value !== "object" && typeof value !== "function")) return null;
      if (!Number.isInteger(value.owner) || !Number.isInteger(value.id)) return null;
      const out = { owner: value.owner, id: value.id };
      if (Number.isInteger(value.type)) out.type = value.type;
      return out;
    };
    const diplomacyRuntimeConstants = () => {
      const actionTypes =
        typeof DiplomacyActionTypes !== "undefined"
          ? DiplomacyActionTypes
          : globalThis.DiplomacyActionTypes;
      const responseTypes =
        typeof DiplomaticResponseTypes !== "undefined"
          ? DiplomaticResponseTypes
          : globalThis.DiplomaticResponseTypes;
      const blockerTypes =
        typeof EndTurnBlockingTypes !== "undefined"
          ? EndTurnBlockingTypes
          : globalThis.EndTurnBlockingTypes;
      return {
        denounceMilitaryPresenceActionType: requireInteger(
          actionTypes?.DIPLOMACY_ACTION_DENOUNCE_MILITARY_PRESENCE,
          "DiplomacyActionTypes.DIPLOMACY_ACTION_DENOUNCE_MILITARY_PRESENCE"
        ),
        rejectionResponseType: requireInteger(
          responseTypes?.DIPLOMACY_RESPONSE_REJECT,
          "DiplomaticResponseTypes.DIPLOMACY_RESPONSE_REJECT"
        ),
        noneBlockerType: requireBlockerType(blockerTypes?.NONE),
      };
    };
    const readResponseData = (actionId) => probe(() => {
      const read = globalThis.Game?.Diplomacy?.getResponseDataForUI;
      if (typeof read !== "function") {
        throw new Error("Game.Diplomacy.getResponseDataForUI is unavailable.");
      }
      const data = read.call(globalThis.Game.Diplomacy, actionId);
      if (!data || typeof data !== "object") {
        throw new Error("Game.Diplomacy.getResponseDataForUI returned no response data.");
      }
      if (!Array.isArray(data.responseList)) {
        throw new Error("Diplomacy responseList is unavailable.");
      }
      return {
        actionId: Number.isInteger(data.actionID) ? data.actionID : null,
        offeredResponseTypes: data.responseList.map((response, index) =>
          requireInteger(response?.responseType, "Diplomacy responseList[" + index + "]")
        ),
      };
    });
    const readEventActionType = (actionId) => probe(() => {
      const read = globalThis.Game?.Diplomacy?.getDiplomaticEventData;
      if (typeof read !== "function") {
        throw new Error("Game.Diplomacy.getDiplomaticEventData is unavailable.");
      }
      const data = read.call(globalThis.Game.Diplomacy, actionId);
      return requireInteger(data?.actionType, "Diplomatic event actionType");
    });
    const readBlockingEvidence = (localPlayerId, noneBlockerType) => {
      const blocker = probe(() => {
        const notifications = globalThis.Game?.Notifications;
        const read = notifications?.getEndTurnBlockingType;
        if (typeof read !== "function") {
          throw new Error("Game.Notifications.getEndTurnBlockingType is unavailable.");
        }
        return requireBlockerType(read.call(notifications, localPlayerId));
      });
      if (!blocker.ok) {
        return {
          blocker,
          blockingNotification: {
            ok: false,
            error: "Blocking notification is unavailable because the blocker read failed.",
          },
        };
      }
      if (Object.is(blocker.value, noneBlockerType)) {
        return { blocker, blockingNotification: { ok: true, value: null } };
      }
      return {
        blocker,
        blockingNotification: probe(() => {
          const notifications = globalThis.Game?.Notifications;
          const findBlocking = notifications?.findEndTurnBlocking;
          if (typeof findBlocking !== "function") {
            throw new Error("Game.Notifications.findEndTurnBlocking is unavailable.");
          }
          const rawId = findBlocking.call(notifications, localPlayerId, blocker.value);
          if (rawId == null) return null;
          const id = toComponentId(rawId);
          if (!id) {
            throw new Error(
              "Game.Notifications.findEndTurnBlocking returned an invalid ComponentID."
            );
          }
          const find = notifications.find;
          if (typeof find !== "function") {
            throw new Error("Game.Notifications.find is unavailable.");
          }
          const notification = find.call(notifications, rawId);
          if (!notification || typeof notification !== "object") {
            throw new Error("Game.Notifications.find returned no blocking notification.");
          }
          const type = requireBlockerType(notification.Type);
          const getTypeName = notifications.getTypeName;
          if (typeof getTypeName !== "function") {
            throw new Error("Game.Notifications.getTypeName is unavailable.");
          }
          const typeNameValue = getTypeName.call(notifications, type);
          const target = notification.Target;
          return {
            id,
            type,
            typeName: typeof typeNameValue === "string" ? typeNameValue : null,
            actionId:
              target && typeof target === "object" && Number.isInteger(target.id)
                ? target.id
                : null,
          };
        }),
      };
    };
    const readDiplomacyResponseSnapshot = (input) => {
      const localPlayerId = requireInteger(
        globalThis.GameContext?.localPlayerID,
        "GameContext.localPlayerID"
      );
      const constants = diplomacyRuntimeConstants();
      return immutableJson(
        {
          localPlayerId,
          actionId: requireInteger(input.actionId, "actionId"),
          responseType: requireInteger(input.responseType, "responseType"),
          ...constants,
          responseData: readResponseData(input.actionId),
          eventActionType: readEventActionType(input.actionId),
          canEndTurn: readActionPanelCanEndTurn(),
          ...readBlockingEvidence(localPlayerId, constants.noneBlockerType),
        },
        "Civ7 diplomacy response snapshot"
      );
    };
    const successFromCanStart = (result) => {
      if (result !== null && typeof result === "object" && !Array.isArray(result)) {
        if ("Success" in result) {
          if (typeof result.Success === "boolean") return result.Success;
          throw new Error(
            "Game.PlayerOperations.canStart returned a non-boolean Success field."
          );
        }
      }
      throw new Error("Game.PlayerOperations.canStart returned an unrecognized result.");
    };
    const requireDiplomacyOperation = () => {
      const operations = globalThis.Game?.PlayerOperations;
      const canStart = operations?.canStart;
      if (typeof canStart !== "function") {
        throw new Error("Game.PlayerOperations.canStart is unavailable.");
      }
      const operationType = globalThis.PlayerOperationTypes?.RESPOND_DIPLOMATIC_ACTION;
      if (operationType === undefined) {
        throw new Error(
          "PlayerOperationTypes.RESPOND_DIPLOMATIC_ACTION is unavailable."
        );
      }
      return { operations, canStart, operationType };
    };
    const diplomacyResponseArgs = (snapshot) => ({
      ID: snapshot.actionId,
      Type: snapshot.responseType,
    });
    const checkDiplomacyResponseValidation = (snapshot, operation) => {
      const rawResult = operation.canStart.call(
        operation.operations,
        snapshot.localPlayerId,
        operation.operationType,
        diplomacyResponseArgs(snapshot),
        false
      );
      return {
        valid: successFromCanStart(rawResult),
        result: immutableJson(rawResult, "Game.PlayerOperations.canStart"),
      };
    };
    const checkDiplomacyResponse = (input) => {
      const snapshot = readDiplomacyResponseSnapshot(input);
      return {
        ...checkDiplomacyResponseValidation(snapshot, requireDiplomacyOperation()),
        snapshot,
      };
    };
    const componentIdsMatch = (left, right) =>
      left != null &&
      right != null &&
      left.owner === right.owner &&
      left.id === right.id &&
      (left.type ?? null) === (right.type ?? null);
    const blockingNotificationsMatch = (left, right) => {
      if (left == null || right == null) return left == null && right == null;
      return (
        componentIdsMatch(left.id, right.id) &&
        left.type === right.type &&
        left.typeName === right.typeName &&
        left.actionId === right.actionId
      );
    };
    const jsonValuesMatch = (left, right) =>
      JSON.stringify(left) === JSON.stringify(right);
    const probesMatch = (left, right, valuesMatch) => {
      if (!left || !right || left.ok !== right.ok) return false;
      if (left.ok === false) return left.error === right.error;
      return valuesMatch(left.value, right.value);
    };
    const diplomacyResponseGuardMatches = (expected, observed) =>
      expected &&
      expected.localPlayerId === observed.localPlayerId &&
      expected.actionId === observed.actionId &&
      expected.responseType === observed.responseType &&
      expected.denounceMilitaryPresenceActionType ===
        observed.denounceMilitaryPresenceActionType &&
      expected.rejectionResponseType === observed.rejectionResponseType &&
      Object.is(expected.noneBlockerType, observed.noneBlockerType) &&
      probesMatch(expected.responseData, observed.responseData, jsonValuesMatch) &&
      probesMatch(expected.eventActionType, observed.eventActionType, Object.is) &&
      probesMatch(expected.canEndTurn, observed.canEndTurn, Object.is) &&
      probesMatch(expected.blocker, observed.blocker, Object.is) &&
      probesMatch(
        expected.blockingNotification,
        observed.blockingNotification,
        blockingNotificationsMatch
      );
    const sendDiplomacyResponse = (input, markSendInvoked) => {
      const before = readDiplomacyResponseSnapshot(input);
      if (!diplomacyResponseGuardMatches(input.expected, before)) {
        throw new Error("Diplomacy response admission evidence changed before dispatch.");
      }
      const operation = requireDiplomacyOperation();
      const validation = checkDiplomacyResponseValidation(before, operation);
      if (!validation.valid) {
        return {
          sent: false,
          validation,
          before,
          after: before,
        };
      }
      const sendRequest = operation.operations.sendRequest;
      if (typeof sendRequest !== "function") {
        throw new Error("Game.PlayerOperations.sendRequest is unavailable.");
      }
      markSendInvoked();
      sendRequest.call(
        operation.operations,
        before.localPlayerId,
        operation.operationType,
        diplomacyResponseArgs(before)
      );
      return {
        sent: true,
        validation,
        before,
        after: readDiplomacyResponseSnapshot(input),
      };
    };
    const boundedDiplomacyResponseError = (error) => {
      let message;
      try {
        message = typeof error?.message === "string" ? error.message : String(error);
      } catch {
        message = "Civ7 diplomacy response send failed.";
      }
      return message.slice(0, 512);
    };
    const sendDiplomacyResponseEnvelope = (input) => {
      let sendInvoked = false;
      try {
        return {
          ok: true,
          value: sendDiplomacyResponse(input, () => {
            sendInvoked = true;
          }),
        };
      } catch (error) {
        return {
          ok: false,
          gameplayDispatchStatus: sendInvoked ? "dispatched" : "not-dispatched",
          error: boundedDiplomacyResponseError(error),
        };
      }
    };`;
}

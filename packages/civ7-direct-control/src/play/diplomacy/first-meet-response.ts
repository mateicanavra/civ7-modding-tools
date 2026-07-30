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

const Civ7FirstMeetResponseJsonValueSchema = Type.Cyclic(
  {
    Civ7FirstMeetResponseJsonValue: Type.Union([
      Type.Null(),
      Type.Boolean(),
      Type.Number(),
      Type.String(),
      Type.Array(Type.Ref("Civ7FirstMeetResponseJsonValue")),
      Type.Record(Type.String(), Type.Ref("Civ7FirstMeetResponseJsonValue")),
    ]),
  },
  "Civ7FirstMeetResponseJsonValue"
);

const firstMeetResponseSchema = Type.Union([
  Type.Literal("friendly"),
  Type.Literal("neutral"),
  Type.Literal("unfriendly"),
]);
const nullableStringSchema = Type.Union([Type.String(), Type.Null()]);
const nullableIntegerSchema = Type.Union([Type.Integer(), Type.Null()]);
const blockerIdentitySchema = Type.Union([Type.Integer(), Type.String()]);

const Civ7FirstMeetBlockingNotificationSchema = Type.Union([
  Type.Null(),
  Type.Object(
    {
      id: Civ7ComponentIdSchema,
      type: blockerIdentitySchema,
      typeName: nullableStringSchema,
      metPlayerId: nullableIntegerSchema,
    },
    { additionalProperties: false }
  ),
]);

/** Semantic first-meet intent resolved against Civ7's native response enum at execution. */
export const Civ7FirstMeetResponseInputSchema = Type.Object(
  {
    metPlayerId: Type.Integer({ minimum: 0 }),
    response: firstMeetResponseSchema,
  },
  { additionalProperties: false }
);
export type Civ7FirstMeetResponseInput = Readonly<Static<typeof Civ7FirstMeetResponseInputSchema>>;

/** Immutable native admission and blocker evidence for one first-meet response. */
export const Civ7FirstMeetResponseSnapshotSchema = Type.Object(
  {
    localPlayerId: Type.Integer(),
    metPlayerId: Type.Integer({ minimum: 0 }),
    response: firstMeetResponseSchema,
    responseType: Type.Integer(),
    noneBlockerType: blockerIdentitySchema,
    canEndTurn: Civ7RuntimeProbeSchema(Type.Boolean()),
    blocker: Civ7RuntimeProbeSchema(blockerIdentitySchema),
    blockingNotification: Civ7RuntimeProbeSchema(Civ7FirstMeetBlockingNotificationSchema),
  },
  { additionalProperties: false }
);
export type Civ7FirstMeetResponseSnapshot = Readonly<
  Static<typeof Civ7FirstMeetResponseSnapshotSchema>
>;

/** Guarded send input carrying the exact snapshot admitted by the preceding check. */
export const Civ7FirstMeetResponseSendInputSchema = Type.Object(
  {
    metPlayerId: Type.Integer({ minimum: 0 }),
    response: firstMeetResponseSchema,
    expected: Civ7FirstMeetResponseSnapshotSchema,
  },
  { additionalProperties: false }
);
export type Civ7FirstMeetResponseSendInput = Readonly<
  Static<typeof Civ7FirstMeetResponseSendInputSchema>
>;

/** Native `canStart` evidence for the exact first-meet operation and arguments. */
export const Civ7FirstMeetResponseValidationResultSchema = Type.Object(
  {
    valid: Type.Boolean(),
    result: Civ7FirstMeetResponseJsonValueSchema,
  },
  { additionalProperties: false }
);
export type Civ7FirstMeetResponseValidationResult = Readonly<
  Static<typeof Civ7FirstMeetResponseValidationResultSchema>
>;

/** Exact native validation paired with the immutable evidence used to obtain it. */
export const Civ7FirstMeetResponseCheckResultSchema = Type.Object(
  {
    valid: Type.Boolean(),
    result: Civ7FirstMeetResponseJsonValueSchema,
    snapshot: Civ7FirstMeetResponseSnapshotSchema,
  },
  { additionalProperties: false }
);
export type Civ7FirstMeetResponseCheckResult = Readonly<
  Static<typeof Civ7FirstMeetResponseCheckResultSchema>
>;

const Civ7FirstMeetResponseValidValidationResultSchema = Type.Object(
  {
    valid: Type.Literal(true),
    result: Civ7FirstMeetResponseJsonValueSchema,
  },
  { additionalProperties: false }
);

const Civ7FirstMeetResponseInvalidValidationResultSchema = Type.Object(
  {
    valid: Type.Literal(false),
    result: Civ7FirstMeetResponseJsonValueSchema,
  },
  { additionalProperties: false }
);

/** Native dispatch result with before-and-after observations, not an acceptance receipt. */
export const Civ7FirstMeetResponseSendResultSchema = Type.Union([
  Type.Object(
    {
      sent: Type.Literal(true),
      validation: Civ7FirstMeetResponseValidValidationResultSchema,
      before: Civ7FirstMeetResponseSnapshotSchema,
      after: Civ7FirstMeetResponseSnapshotSchema,
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      sent: Type.Literal(false),
      validation: Civ7FirstMeetResponseInvalidValidationResultSchema,
      before: Civ7FirstMeetResponseSnapshotSchema,
      after: Civ7FirstMeetResponseSnapshotSchema,
    },
    { additionalProperties: false }
  ),
]);
export type Civ7FirstMeetResponseSendResult = Readonly<
  Static<typeof Civ7FirstMeetResponseSendResultSchema>
>;

const Civ7FirstMeetResponseSendEnvelopeSchema = Type.Union([
  Type.Object(
    {
      ok: Type.Literal(true),
      value: Civ7FirstMeetResponseSendResultSchema,
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

/** Reads the exact native first-meet response admission and paired blocker evidence. */
export async function checkCiv7FirstMeetResponse(
  input: Civ7FirstMeetResponseInput,
  options: Civ7DirectControlOptions = {}
): Promise<Civ7FirstMeetResponseCheckResult> {
  const command = await executeCiv7AppUiCommand({
    ...options,
    command: buildFirstMeetResponseWireCommand("checkFirstMeetResponse", input),
  });
  return schemaBodyFromCommandResult(
    command,
    "Civ7 first-meet response check",
    Civ7FirstMeetResponseCheckResultSchema
  );
}

/** Invokes the exact native first-meet response once after admitted evidence still matches. */
export async function sendCiv7FirstMeetResponse(
  input: Civ7FirstMeetResponseSendInput,
  options: Civ7DirectControlOptions = {}
): Promise<Civ7FirstMeetResponseSendResult> {
  const command = await executeCiv7AppUiCommand({
    ...options,
    command: buildFirstMeetResponseWireCommand("sendFirstMeetResponse", input),
  });
  let envelope: Static<typeof Civ7FirstMeetResponseSendEnvelopeSchema>;
  try {
    envelope = schemaBodyFromCommandResult(
      command,
      "Civ7 first-meet response send",
      Civ7FirstMeetResponseSendEnvelopeSchema
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

type FirstMeetResponseAtom = "checkFirstMeetResponse" | "sendFirstMeetResponse";

function buildFirstMeetResponseWireCommand(
  atom: "checkFirstMeetResponse",
  input: Civ7FirstMeetResponseInput
): string;
function buildFirstMeetResponseWireCommand(
  atom: "sendFirstMeetResponse",
  input: Civ7FirstMeetResponseSendInput
): string;
function buildFirstMeetResponseWireCommand(
  atom: FirstMeetResponseAtom,
  input: Civ7FirstMeetResponseInput | Civ7FirstMeetResponseSendInput
): string {
  try {
    if (atom === "checkFirstMeetResponse") {
      if (!Value.Check(Civ7FirstMeetResponseInputSchema, input)) {
        throw new TypeError(
          "First-meet response check input must contain one met player and named response."
        );
      }
      return `(() => {
    ${firstMeetResponseWireSource()}
    return JSON.stringify(checkFirstMeetResponse(${jsLiteral(input)}));
  })()`;
    }
    if (!Value.Check(Civ7FirstMeetResponseSendInputSchema, input)) {
      throw new TypeError(
        "First-meet response send input must contain one met player, named response, and expected snapshot."
      );
    }
    return `(() => {
    ${firstMeetResponseWireSource()}
    return JSON.stringify(sendFirstMeetResponseEnvelope(${jsLiteral(input)}));
  })()`;
  } catch (cause) {
    throw directControlErrorWithDispatchStatus(cause, "not-dispatched");
  }
}

function firstMeetResponseWireSource(): string {
  return `${probeHelperSource()}
    ${actionPanelTurnAuthoritySource()}
    const immutableJson = (value, label) => {
      const serialized = JSON.stringify(value);
      if (serialized === undefined) throw new Error(label + " returned non-JSON evidence.");
      return JSON.parse(serialized);
    };
    const firstMeetResponseKey = (response) => {
      if (response === "friendly") {
        return "PLAYER_REALATIONSHIP_FIRSTMEET_FRIENDLY";
      }
      if (response === "neutral") {
        return "PLAYER_REALATIONSHIP_FIRSTMEET_NEUTRAL";
      }
      if (response === "unfriendly") {
        return "PLAYER_REALATIONSHIP_FIRSTMEET_UNFRIENDLY";
      }
      throw new Error("Unsupported first-meet response.");
    };
    const resolveFirstMeetResponseType = (response) => {
      const key = firstMeetResponseKey(response);
      const responseTypes =
        typeof DiplomacyPlayerFirstMeets !== "undefined"
          ? DiplomacyPlayerFirstMeets
          : globalThis.DiplomacyPlayerFirstMeets;
      const responseType = responseTypes?.[key];
      if (!Number.isInteger(responseType)) {
        throw new Error("DiplomacyPlayerFirstMeets." + key + " is unavailable.");
      }
      return responseType;
    };
    const requireFirstMeetObservation = (input) => {
      const localPlayerId = globalThis.GameContext?.localPlayerID;
      if (!Number.isInteger(localPlayerId)) {
        throw new Error("GameContext.localPlayerID is unavailable.");
      }
      if (!Number.isInteger(input.metPlayerId)) {
        throw new Error("First-meet metPlayerId is unavailable.");
      }
      return {
        localPlayerId,
        metPlayerId: input.metPlayerId,
        response: input.response,
        responseType: resolveFirstMeetResponseType(input.response),
      };
    };
    const toComponentId = (value) => {
      if (!value || typeof value !== "object") return null;
      if (!Number.isFinite(value.owner) || !Number.isFinite(value.id)) return null;
      const owner = value.owner;
      const id = value.id;
      const out = { owner, id };
      if (Number.isFinite(value.type)) out.type = value.type;
      return out;
    };
    const endTurnBlockerType = (value) => {
      if (Number.isInteger(value)) return value;
      if (typeof value === "string" && value.trim().length > 0) {
        return value;
      }
      throw new Error(
        "Game.Notifications.getEndTurnBlockingType returned an unsupported blocker identity."
      );
    };
    const resolveNoneBlockerType = () => {
      const blockerTypes =
        typeof EndTurnBlockingTypes !== "undefined"
          ? EndTurnBlockingTypes
          : globalThis.EndTurnBlockingTypes;
      return endTurnBlockerType(blockerTypes?.NONE);
    };
    const observableMetPlayerId = (notification) => {
      if (
        !notification ||
        (typeof notification !== "object" && typeof notification !== "function")
      ) {
        return null;
      }
      const value = notification.Player;
      if (value == null) return null;
      if (!Number.isInteger(value)) {
        throw new Error(
          "The blocking notification returned a non-integer met-player identity."
        );
      }
      return value;
    };
    const readFirstMeetBlockingEvidence = (localPlayerId, noneBlockerType) => {
      const blocker = probe(() => {
        const notifications = globalThis.Game?.Notifications;
        const getEndTurnBlockingType = notifications?.getEndTurnBlockingType;
        if (typeof getEndTurnBlockingType !== "function") {
          throw new Error("Game.Notifications.getEndTurnBlockingType is unavailable.");
        }
        return endTurnBlockerType(
          getEndTurnBlockingType.call(notifications, localPlayerId)
        );
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
        return {
          blocker,
          blockingNotification: { ok: true, value: null },
        };
      }
      return {
        blocker,
        blockingNotification: probe(() => {
          const notifications = globalThis.Game?.Notifications;
          const findEndTurnBlocking = notifications?.findEndTurnBlocking;
          if (typeof findEndTurnBlocking !== "function") {
            throw new Error("Game.Notifications.findEndTurnBlocking is unavailable.");
          }
          const blockerId = findEndTurnBlocking.call(
            notifications,
            localPlayerId,
            blocker.value
          );
          if (blockerId == null) return null;
          const id = toComponentId(blockerId);
          if (!id) {
            throw new Error(
              "Game.Notifications.findEndTurnBlocking returned an invalid ComponentID."
            );
          }
          const find = notifications.find;
          if (typeof find !== "function") {
            throw new Error("Game.Notifications.find is unavailable.");
          }
          const notification = find.call(notifications, blockerId);
          if (!notification || typeof notification !== "object") {
            throw new Error("Game.Notifications.find returned no blocking notification.");
          }
          const type = endTurnBlockerType(notification.Type);
          const getTypeName = notifications.getTypeName;
          if (typeof getTypeName !== "function") {
            throw new Error("Game.Notifications.getTypeName is unavailable.");
          }
          const typeNameValue = getTypeName.call(notifications, type);
          const typeName = typeof typeNameValue === "string" ? typeNameValue : null;
          return {
            id,
            type,
            typeName,
            metPlayerId: observableMetPlayerId(notification),
          };
        }),
      };
    };
    const readFirstMeetResponseSnapshot = (input) => {
      const identity = requireFirstMeetObservation(input);
      const noneBlockerType = resolveNoneBlockerType();
      return immutableJson(
        {
          ...identity,
          noneBlockerType,
          canEndTurn: readActionPanelCanEndTurn(),
          ...readFirstMeetBlockingEvidence(identity.localPlayerId, noneBlockerType),
        },
        "Civ7 first-meet response snapshot"
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
    const requireFirstMeetOperation = () => {
      const operations = globalThis.Game?.PlayerOperations;
      const canStart = operations?.canStart;
      if (typeof canStart !== "function") {
        throw new Error("Game.PlayerOperations.canStart is unavailable.");
      }
      const operationType =
        globalThis.PlayerOperationTypes?.RESPOND_DIPLOMATIC_FIRST_MEET;
      if (operationType === undefined) {
        throw new Error(
          "PlayerOperationTypes.RESPOND_DIPLOMATIC_FIRST_MEET is unavailable."
        );
      }
      return { operations, canStart, operationType };
    };
    const firstMeetResponseArgs = (snapshot) => ({
      Player1: snapshot.localPlayerId,
      Player2: snapshot.metPlayerId,
      Type: snapshot.responseType,
    });
    const checkFirstMeetResponseValidation = (snapshot, operation) => {
      const rawResult = operation.canStart.call(
        operation.operations,
        snapshot.localPlayerId,
        operation.operationType,
        firstMeetResponseArgs(snapshot),
        false
      );
      return {
        valid: successFromCanStart(rawResult),
        result: immutableJson(rawResult, "Game.PlayerOperations.canStart"),
      };
    };
    const checkFirstMeetResponse = (input) => {
      const snapshot = readFirstMeetResponseSnapshot(input);
      const validation = checkFirstMeetResponseValidation(
        snapshot,
        requireFirstMeetOperation()
      );
      return { ...validation, snapshot };
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
        left.metPlayerId === right.metPlayerId
      );
    };
    const probesMatch = (left, right, valuesMatch) => {
      if (!left || !right || left.ok !== right.ok) return false;
      if (left.ok === false) return left.error === right.error;
      return valuesMatch(left.value, right.value);
    };
    const firstMeetResponseGuardMatches = (expected, observed) =>
      expected &&
      expected.localPlayerId === observed.localPlayerId &&
      expected.metPlayerId === observed.metPlayerId &&
      expected.response === observed.response &&
      expected.responseType === observed.responseType &&
      Object.is(expected.noneBlockerType, observed.noneBlockerType) &&
      probesMatch(expected.canEndTurn, observed.canEndTurn, Object.is) &&
      probesMatch(expected.blocker, observed.blocker, Object.is) &&
      probesMatch(
        expected.blockingNotification,
        observed.blockingNotification,
        blockingNotificationsMatch
      );
    const sendFirstMeetResponse = (input, markSendInvoked) => {
      const before = readFirstMeetResponseSnapshot(input);
      if (!firstMeetResponseGuardMatches(input.expected, before)) {
        throw new Error("First-meet response admission evidence changed before dispatch.");
      }
      const operation = requireFirstMeetOperation();
      const validation = checkFirstMeetResponseValidation(before, operation);
      if (!validation.valid) {
        return {
          sent: false,
          validation,
          before,
          after: readFirstMeetResponseSnapshot(input),
        };
      }
      const sendRequest = operation.operations.sendRequest;
      if (typeof sendRequest !== "function") {
        throw new Error("Game.PlayerOperations.sendRequest is unavailable.");
      }
      const args = firstMeetResponseArgs(before);
      markSendInvoked();
      sendRequest.call(
        operation.operations,
        before.localPlayerId,
        operation.operationType,
        args
      );
      return {
        sent: true,
        validation,
        before,
        after: readFirstMeetResponseSnapshot(input),
      };
    };
    const boundedFirstMeetResponseError = (error) => {
      let message;
      try {
        message = typeof error?.message === "string" ? error.message : String(error);
      } catch {
        message = "Civ7 first-meet response send failed.";
      }
      return message.slice(0, 512);
    };
    const sendFirstMeetResponseEnvelope = (input) => {
      let sendInvoked = false;
      try {
        return {
          ok: true,
          value: sendFirstMeetResponse(input, () => {
            sendInvoked = true;
          }),
        };
      } catch (error) {
        return {
          ok: false,
          gameplayDispatchStatus: sendInvoked ? "dispatched" : "not-dispatched",
          error: boundedFirstMeetResponseError(error),
        };
      }
    };`;
}

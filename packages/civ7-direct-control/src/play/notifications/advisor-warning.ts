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

const Civ7AdvisorWarningJsonValueSchema = Type.Cyclic(
  {
    Civ7AdvisorWarningJsonValue: Type.Union([
      Type.Null(),
      Type.Boolean(),
      Type.Number(),
      Type.String(),
      Type.Array(Type.Ref("Civ7AdvisorWarningJsonValue")),
      Type.Record(Type.String(), Type.Ref("Civ7AdvisorWarningJsonValue")),
    ]),
  },
  "Civ7AdvisorWarningJsonValue"
);

/** Exact advisor-warning notification selected for native acknowledgement. */
export const Civ7AdvisorWarningViewedInputSchema = Type.Object(
  {
    target: Civ7ComponentIdSchema,
  },
  { additionalProperties: false }
);
export type Civ7AdvisorWarningViewedInput = Readonly<
  Static<typeof Civ7AdvisorWarningViewedInputSchema>
>;

/** Raw target-specific notification evidence captured around advisor acknowledgement. */
export const Civ7AdvisorWarningViewedSnapshotSchema = Type.Object(
  {
    target: Civ7ComponentIdSchema,
    localPlayerId: Type.Integer(),
    exists: Type.Boolean(),
    typeName: Type.Union([Type.String(), Type.Null()]),
    activeQueue: Civ7RuntimeProbeSchema(Type.Boolean()),
  },
  { additionalProperties: false }
);
export type Civ7AdvisorWarningViewedSnapshot = Readonly<
  Static<typeof Civ7AdvisorWarningViewedSnapshotSchema>
>;

/** Exact native `canStart` result for one advisor-warning acknowledgement. */
export const Civ7AdvisorWarningViewedValidationResultSchema = Type.Object(
  {
    valid: Type.Boolean(),
    result: Civ7AdvisorWarningJsonValueSchema,
  },
  { additionalProperties: false }
);
export type Civ7AdvisorWarningViewedValidationResult = Readonly<
  Static<typeof Civ7AdvisorWarningViewedValidationResultSchema>
>;

export const Civ7AdvisorWarningViewedCheckResultSchema = Type.Object(
  {
    valid: Type.Boolean(),
    result: Civ7AdvisorWarningJsonValueSchema,
    snapshot: Civ7AdvisorWarningViewedSnapshotSchema,
  },
  { additionalProperties: false }
);
export type Civ7AdvisorWarningViewedCheckResult = Readonly<
  Static<typeof Civ7AdvisorWarningViewedCheckResultSchema>
>;

/** Advisor target plus the service-admitted snapshot that must still match before dispatch. */
export const Civ7AdvisorWarningViewedSendInputSchema = Type.Object(
  {
    target: Civ7ComponentIdSchema,
    expected: Civ7AdvisorWarningViewedSnapshotSchema,
  },
  { additionalProperties: false }
);
export type Civ7AdvisorWarningViewedSendInput = Readonly<
  Static<typeof Civ7AdvisorWarningViewedSendInputSchema>
>;

const Civ7AdvisorWarningViewedValidValidationResultSchema = Type.Object(
  {
    valid: Type.Literal(true),
    result: Civ7AdvisorWarningJsonValueSchema,
  },
  { additionalProperties: false }
);

const Civ7AdvisorWarningViewedInvalidValidationResultSchema = Type.Object(
  {
    valid: Type.Literal(false),
    result: Civ7AdvisorWarningJsonValueSchema,
  },
  { additionalProperties: false }
);

export const Civ7AdvisorWarningViewedSendResultSchema = Type.Union([
  Type.Object(
    {
      sent: Type.Literal(true),
      validation: Civ7AdvisorWarningViewedValidValidationResultSchema,
      before: Civ7AdvisorWarningViewedSnapshotSchema,
      after: Civ7AdvisorWarningViewedSnapshotSchema,
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      sent: Type.Literal(false),
      validation: Civ7AdvisorWarningViewedInvalidValidationResultSchema,
      before: Civ7AdvisorWarningViewedSnapshotSchema,
      after: Civ7AdvisorWarningViewedSnapshotSchema,
    },
    { additionalProperties: false }
  ),
]);
export type Civ7AdvisorWarningViewedSendResult = Readonly<
  Static<typeof Civ7AdvisorWarningViewedSendResultSchema>
>;

const Civ7AdvisorWarningViewedSendEnvelopeSchema = Type.Union([
  Type.Object(
    {
      ok: Type.Literal(true),
      value: Civ7AdvisorWarningViewedSendResultSchema,
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

/** Reads exact native advisor-warning admission and target evidence without dispatching. */
export async function checkCiv7AdvisorWarningViewed(
  input: Civ7AdvisorWarningViewedInput,
  options: Civ7DirectControlOptions = {}
): Promise<Civ7AdvisorWarningViewedCheckResult> {
  const command = await executeCiv7AppUiCommand({
    ...options,
    command: buildAdvisorWarningViewedWireCommand("checkAdvisorWarningViewed", input),
  });
  return schemaBodyFromCommandResult(
    command,
    "Civ7 advisor-warning viewed check",
    Civ7AdvisorWarningViewedCheckResultSchema
  );
}

/** Invokes the exact native advisor-warning acknowledgement once after admitted evidence matches. */
export async function sendCiv7AdvisorWarningViewed(
  input: Civ7AdvisorWarningViewedSendInput,
  options: Civ7DirectControlOptions = {}
): Promise<Civ7AdvisorWarningViewedSendResult> {
  const command = await executeCiv7AppUiCommand({
    ...options,
    command: buildAdvisorWarningViewedWireCommand("sendAdvisorWarningViewed", input),
  });
  let envelope: Static<typeof Civ7AdvisorWarningViewedSendEnvelopeSchema>;
  try {
    envelope = schemaBodyFromCommandResult(
      command,
      "Civ7 advisor-warning viewed send",
      Civ7AdvisorWarningViewedSendEnvelopeSchema
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

type AdvisorWarningViewedAtom = "checkAdvisorWarningViewed" | "sendAdvisorWarningViewed";

function buildAdvisorWarningViewedWireCommand(
  atom: "checkAdvisorWarningViewed",
  input: Civ7AdvisorWarningViewedInput
): string;
function buildAdvisorWarningViewedWireCommand(
  atom: "sendAdvisorWarningViewed",
  input: Civ7AdvisorWarningViewedSendInput
): string;
function buildAdvisorWarningViewedWireCommand(
  atom: AdvisorWarningViewedAtom,
  input: Civ7AdvisorWarningViewedInput | Civ7AdvisorWarningViewedSendInput
): string {
  try {
    if (atom === "checkAdvisorWarningViewed") {
      if (!Value.Check(Civ7AdvisorWarningViewedInputSchema, input)) {
        throw new TypeError("Advisor-warning check input must contain one valid target.");
      }
      return `(() => {
    ${advisorWarningViewedWireSource()}
    return JSON.stringify(checkAdvisorWarningViewed(${jsLiteral(input)}));
  })()`;
    }
    if (!Value.Check(Civ7AdvisorWarningViewedSendInputSchema, input)) {
      throw new TypeError(
        "Advisor-warning send input must contain one valid target and expected snapshot."
      );
    }
    return `(() => {
    ${advisorWarningViewedWireSource()}
    return JSON.stringify(sendAdvisorWarningViewedEnvelope(${jsLiteral(input)}));
  })()`;
  } catch (cause) {
    throw directControlErrorWithDispatchStatus(cause, "not-dispatched");
  }
}

function advisorWarningViewedWireSource(): string {
  return `${probeHelperSource()}
    const immutableJson = (value, label) => {
      const serialized = JSON.stringify(value);
      if (serialized === undefined) throw new Error(label + " returned non-JSON evidence.");
      return JSON.parse(serialized);
    };
    const requireAdvisorWarningObservation = () => {
      const localPlayerId = globalThis.GameContext?.localPlayerID;
      if (!Number.isInteger(localPlayerId)) {
        throw new Error("GameContext.localPlayerID is unavailable.");
      }
      const notifications = globalThis.Game?.Notifications;
      if (!notifications || typeof notifications.find !== "function") {
        throw new Error("Game.Notifications.find is unavailable.");
      }
      return { localPlayerId, notifications };
    };
    const requireAdvisorWarningOperation = () => {
      const operations = globalThis.Game?.PlayerOperations;
      if (typeof operations?.canStart !== "function") {
        throw new Error("Game.PlayerOperations.canStart is unavailable.");
      }
      const operationType = globalThis.PlayerOperationTypes?.VIEWED_ADVISOR_WARNING;
      if (operationType === undefined) {
        throw new Error("PlayerOperationTypes.VIEWED_ADVISOR_WARNING is unavailable.");
      }
      return { operations, operationType };
    };
    const componentIdsMatch = (left, right) =>
      left != null &&
      right != null &&
      left.owner === right.owner &&
      left.id === right.id &&
      (left.type ?? null) === (right.type ?? null);
    const readAdvisorWarningTypeName = (notifications, target, exists) => {
      if (!exists) return null;
      if (typeof notifications.getType !== "function") {
        throw new Error("Game.Notifications.getType is unavailable.");
      }
      if (typeof notifications.getTypeName !== "function") {
        throw new Error("Game.Notifications.getTypeName is unavailable.");
      }
      const type = notifications.getType.call(notifications, target);
      const typeName = notifications.getTypeName.call(notifications, type);
      if (typeName == null) return null;
      if (typeof typeName !== "string") {
        throw new Error("Game.Notifications.getTypeName returned a non-string value.");
      }
      return typeName;
    };
    const readAdvisorWarningActiveQueue = (notifications, localPlayerId, target) =>
      probe(() => {
        if (typeof notifications.getIdsForPlayer !== "function") {
          throw new Error("Game.Notifications.getIdsForPlayer is unavailable.");
        }
        const ids = notifications.getIdsForPlayer.call(notifications, localPlayerId);
        if (!Array.isArray(ids)) {
          throw new Error("Game.Notifications.getIdsForPlayer returned a non-array value.");
        }
        return ids.some((id) => componentIdsMatch(id, target));
      });
    const readAdvisorWarningSnapshot = (target) => {
      const runtime = requireAdvisorWarningObservation();
      const notification = runtime.notifications.find.call(runtime.notifications, target);
      const exists = notification != null;
      return {
        target,
        localPlayerId: runtime.localPlayerId,
        exists,
        typeName: readAdvisorWarningTypeName(runtime.notifications, target, exists),
        activeQueue: readAdvisorWarningActiveQueue(
          runtime.notifications,
          runtime.localPlayerId,
          target
        ),
      };
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
    const checkAdvisorWarningValidation = (target, snapshot) => {
      const runtime = requireAdvisorWarningOperation();
      const rawResult = runtime.operations.canStart(
        snapshot.localPlayerId,
        runtime.operationType,
        { Target: target },
        false
      );
      return {
        valid: successFromCanStart(rawResult),
        result: immutableJson(rawResult, "Game.PlayerOperations.canStart"),
      };
    };
    const checkAdvisorWarningViewed = (input) => {
      const snapshot = readAdvisorWarningSnapshot(input.target);
      const validation = checkAdvisorWarningValidation(input.target, snapshot);
      return { ...validation, snapshot };
    };
    const matchingReadableProbe = (expected, observed) =>
      expected?.ok === true &&
      observed?.ok === true &&
      Object.is(expected.value, observed.value);
    const advisorWarningGuardMatches = (target, expected, observed) =>
      expected &&
      componentIdsMatch(target, expected.target) &&
      componentIdsMatch(expected.target, observed.target) &&
      expected.localPlayerId === observed.localPlayerId &&
      expected.exists === observed.exists &&
      expected.typeName === observed.typeName &&
      matchingReadableProbe(expected.activeQueue, observed.activeQueue);
    const sendAdvisorWarningViewed = (input, markSendInvoked) => {
      const before = readAdvisorWarningSnapshot(input.target);
      if (!advisorWarningGuardMatches(input.target, input.expected, before)) {
        throw new Error("Advisor-warning admission evidence changed before dispatch.");
      }
      const validation = checkAdvisorWarningValidation(input.target, before);
      if (!validation.valid) {
        return {
          sent: false,
          validation,
          before,
          after: readAdvisorWarningSnapshot(input.target),
        };
      }
      const runtime = requireAdvisorWarningOperation();
      const sendRequest = runtime.operations.sendRequest;
      if (typeof sendRequest !== "function") {
        throw new Error("Game.PlayerOperations.sendRequest is unavailable.");
      }
      const localPlayerId = before.localPlayerId;
      const operationType = runtime.operationType;
      const args = { Target: input.target };
      markSendInvoked();
      sendRequest.call(runtime.operations, localPlayerId, operationType, args);
      return {
        sent: true,
        validation,
        before,
        after: readAdvisorWarningSnapshot(input.target),
      };
    };
    const boundedAdvisorWarningError = (error) => {
      let message;
      try {
        message = typeof error?.message === "string" ? error.message : String(error);
      } catch {
        message = "Civ7 advisor-warning viewed send failed.";
      }
      return message.slice(0, 512);
    };
    const sendAdvisorWarningViewedEnvelope = (input) => {
      let sendInvoked = false;
      try {
        return {
          ok: true,
          value: sendAdvisorWarningViewed(input, () => {
            sendInvoked = true;
          }),
        };
      } catch (error) {
        return {
          ok: false,
          gameplayDispatchStatus: sendInvoked ? "dispatched" : "not-dispatched",
          error: boundedAdvisorWarningError(error),
        };
      }
    };`;
}

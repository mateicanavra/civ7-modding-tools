import { type Static, Type } from "typebox";

import { assertCiv7ComponentId, Civ7ComponentIdSchema } from "../../civ7-component-id.js";
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
import { blockingNotificationObservationSource } from "../notifications/blocking-observation.js";

const Civ7NarrativeJsonValueSchema = Type.Cyclic(
  {
    Civ7NarrativeJsonValue: Type.Union([
      Type.Null(),
      Type.Boolean(),
      Type.Number(),
      Type.String(),
      Type.Array(Type.Ref("Civ7NarrativeJsonValue")),
      Type.Record(Type.String(), Type.Ref("Civ7NarrativeJsonValue")),
    ]),
  },
  "Civ7NarrativeJsonValue"
);

const nullableStringSchema = Type.Union([Type.String(), Type.Null()]);
const nullableComponentIdSchema = Type.Union([Civ7ComponentIdSchema, Type.Null()]);
const blockerIdentitySchema = Type.Union([Type.Integer(), Type.String()]);
const notificationTypeSchema = Type.Union([Type.Integer(), Type.String(), Type.Null()]);

const Civ7NarrativeBlockingNotificationSchema = Type.Union([
  Type.Null(),
  Type.Object(
    {
      id: Civ7ComponentIdSchema,
      type: notificationTypeSchema,
      typeName: nullableStringSchema,
      target: nullableComponentIdSchema,
    },
    { additionalProperties: false }
  ),
]);

export const Civ7NarrativeChoiceInputSchema = Type.Object(
  {
    targetType: Type.String({ minLength: 1 }),
    target: Civ7ComponentIdSchema,
  },
  { additionalProperties: false }
);
export type Civ7NarrativeChoiceInput = Readonly<Static<typeof Civ7NarrativeChoiceInputSchema>>;

export const Civ7NarrativeChoiceSnapshotSchema = Type.Object(
  {
    localPlayerId: Type.Integer(),
    activateAction: Type.Integer(),
    canEndTurn: Civ7RuntimeProbeSchema(Type.Boolean()),
    blocker: Civ7RuntimeProbeSchema(blockerIdentitySchema),
    blockingNotification: Civ7RuntimeProbeSchema(Civ7NarrativeBlockingNotificationSchema),
  },
  { additionalProperties: false }
);
export type Civ7NarrativeChoiceSnapshot = Readonly<
  Static<typeof Civ7NarrativeChoiceSnapshotSchema>
>;

/** Narrative target plus the service-admitted snapshot that must still match before dispatch. */
export const Civ7NarrativeChoiceSendInputSchema = Type.Object(
  {
    targetType: Type.String({ minLength: 1 }),
    target: Civ7ComponentIdSchema,
    expected: Civ7NarrativeChoiceSnapshotSchema,
  },
  { additionalProperties: false }
);
export type Civ7NarrativeChoiceSendInput = Readonly<
  Static<typeof Civ7NarrativeChoiceSendInputSchema>
>;

export const Civ7NarrativeChoiceValidationResultSchema = Type.Object(
  {
    valid: Type.Boolean(),
    result: Civ7NarrativeJsonValueSchema,
  },
  { additionalProperties: false }
);
export type Civ7NarrativeChoiceValidationResult = Readonly<
  Static<typeof Civ7NarrativeChoiceValidationResultSchema>
>;

export const Civ7NarrativeChoiceCheckResultSchema = Type.Object(
  {
    valid: Type.Boolean(),
    result: Civ7NarrativeJsonValueSchema,
    snapshot: Civ7NarrativeChoiceSnapshotSchema,
  },
  { additionalProperties: false }
);
export type Civ7NarrativeChoiceCheckResult = Readonly<
  Static<typeof Civ7NarrativeChoiceCheckResultSchema>
>;

const Civ7NarrativeChoiceValidValidationResultSchema = Type.Object(
  {
    valid: Type.Literal(true),
    result: Civ7NarrativeJsonValueSchema,
  },
  { additionalProperties: false }
);

const Civ7NarrativeChoiceInvalidValidationResultSchema = Type.Object(
  {
    valid: Type.Literal(false),
    result: Civ7NarrativeJsonValueSchema,
  },
  { additionalProperties: false }
);

export const Civ7NarrativeChoiceSendResultSchema = Type.Union([
  Type.Object(
    {
      sent: Type.Literal(true),
      validation: Civ7NarrativeChoiceValidValidationResultSchema,
      before: Civ7NarrativeChoiceSnapshotSchema,
      after: Civ7NarrativeChoiceSnapshotSchema,
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      sent: Type.Literal(false),
      validation: Civ7NarrativeChoiceInvalidValidationResultSchema,
      before: Civ7NarrativeChoiceSnapshotSchema,
      after: Civ7NarrativeChoiceSnapshotSchema,
    },
    { additionalProperties: false }
  ),
]);
export type Civ7NarrativeChoiceSendResult = Readonly<
  Static<typeof Civ7NarrativeChoiceSendResultSchema>
>;

const Civ7NarrativeChoiceSendEnvelopeSchema = Type.Union([
  Type.Object(
    {
      ok: Type.Literal(true),
      value: Civ7NarrativeChoiceSendResultSchema,
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

export async function checkCiv7NarrativeChoice(
  input: Civ7NarrativeChoiceInput,
  options: Civ7DirectControlOptions = {}
): Promise<Civ7NarrativeChoiceCheckResult> {
  const command = await executeCiv7AppUiCommand({
    ...options,
    command: buildNarrativeChoiceWireCommand("checkNarrativeChoice", input),
  });
  return schemaBodyFromCommandResult(
    command,
    "Civ7 narrative choice check",
    Civ7NarrativeChoiceCheckResultSchema
  );
}

export async function sendCiv7NarrativeChoice(
  input: Civ7NarrativeChoiceSendInput,
  options: Civ7DirectControlOptions = {}
): Promise<Civ7NarrativeChoiceSendResult> {
  const command = await executeCiv7AppUiCommand({
    ...options,
    command: buildNarrativeChoiceWireCommand("sendNarrativeChoice", input),
  });
  const envelope = schemaBodyFromCommandResult(
    command,
    "Civ7 narrative choice send",
    Civ7NarrativeChoiceSendEnvelopeSchema
  );
  if (envelope.ok) return envelope.value;
  throw new Civ7DirectControlError("command-failed", envelope.error, {
    details: command,
    dispatchStatus: envelope.gameplayDispatchStatus,
  });
}

type NarrativeChoiceAtom = "checkNarrativeChoice" | "sendNarrativeChoice";

function buildNarrativeChoiceWireCommand(
  atom: NarrativeChoiceAtom,
  input: Civ7NarrativeChoiceInput | Civ7NarrativeChoiceSendInput
): string {
  try {
    const wireInput = narrativeChoiceWireInput(atom, input);
    const invocation =
      atom === "sendNarrativeChoice"
        ? `sendNarrativeChoiceEnvelope(${jsLiteral(wireInput)})`
        : `checkNarrativeChoice(${jsLiteral(wireInput)})`;
    return `(() => {
    ${narrativeChoiceWireSource()}
    return JSON.stringify(${invocation});
  })()`;
  } catch (cause) {
    throw directControlErrorWithDispatchStatus(cause, "not-dispatched");
  }
}

function narrativeChoiceWireInput(
  atom: NarrativeChoiceAtom,
  input: Civ7NarrativeChoiceInput | Civ7NarrativeChoiceSendInput
): Civ7NarrativeChoiceInput | Civ7NarrativeChoiceSendInput {
  if (typeof input.targetType !== "string" || input.targetType.length === 0) {
    throw new TypeError("targetType must be a non-empty string");
  }
  const target = assertCiv7ComponentId(input.target, "target");
  return atom === "sendNarrativeChoice"
    ? {
        targetType: input.targetType,
        target,
        expected: (input as Civ7NarrativeChoiceSendInput).expected,
      }
    : {
        targetType: input.targetType,
        target,
      };
}

function narrativeChoiceWireSource(): string {
  return `${probeHelperSource()}
    ${actionPanelTurnAuthoritySource()}
    ${blockingNotificationObservationSource()}
    const immutableJson = (value, label) => {
      const serialized = JSON.stringify(value);
      if (serialized === undefined) throw new Error(label + " returned non-JSON evidence.");
      return JSON.parse(serialized);
    };
    const requireNarrativeRuntime = () => {
      const localPlayerId = globalThis.GameContext?.localPlayerID;
      if (!Number.isInteger(localPlayerId)) {
        throw new Error("GameContext.localPlayerID is unavailable.");
      }
      const activateAction = globalThis.PlayerOperationParameters?.Activate;
      if (!Number.isInteger(activateAction)) {
        throw new Error("PlayerOperationParameters.Activate is unavailable.");
      }
      const operations = globalThis.Game?.PlayerOperations;
      if (typeof operations?.canStart !== "function") {
        throw new Error("Game.PlayerOperations.canStart is unavailable.");
      }
      const operationType =
        globalThis.PlayerOperationTypes?.CHOOSE_NARRATIVE_STORY_DIRECTION;
      if (operationType === undefined) {
        throw new Error(
          "PlayerOperationTypes.CHOOSE_NARRATIVE_STORY_DIRECTION is unavailable."
        );
      }
      return { localPlayerId, activateAction, operations, operationType };
    };
    const readNarrativeChoiceSnapshot = () => {
      const runtime = requireNarrativeRuntime();
      return {
        localPlayerId: runtime.localPlayerId,
        activateAction: runtime.activateAction,
        canEndTurn: readActionPanelCanEndTurn(),
        ...readBlockingNotificationEvidence(runtime.localPlayerId),
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
    const narrativeChoiceArgs = (input, snapshot) => ({
      TargetType: input.targetType,
      Target: input.target,
      Action: snapshot.activateAction,
    });
    const checkNarrativeChoiceValidation = (input, snapshot) => {
      const runtime = requireNarrativeRuntime();
      const rawResult = runtime.operations.canStart(
        snapshot.localPlayerId,
        runtime.operationType,
        narrativeChoiceArgs(input, snapshot),
        false
      );
      return {
        valid: successFromCanStart(rawResult),
        result: immutableJson(rawResult, "Game.PlayerOperations.canStart"),
      };
    };
    const checkNarrativeChoice = (input) => {
      const snapshot = readNarrativeChoiceSnapshot();
      const validation = checkNarrativeChoiceValidation(input, snapshot);
      return { ...validation, snapshot };
    };
    const sameProbe = (left, right) => JSON.stringify(left) === JSON.stringify(right);
    const narrativeChoiceGuardMatches = (expected, observed) =>
      expected &&
      expected.localPlayerId === observed.localPlayerId &&
      expected.activateAction === observed.activateAction &&
      sameProbe(expected.blocker, observed.blocker) &&
      sameProbe(expected.blockingNotification, observed.blockingNotification);
    const sendNarrativeChoice = (input, markSendInvoked) => {
      const before = readNarrativeChoiceSnapshot();
      if (!narrativeChoiceGuardMatches(input.expected, before)) {
        throw new Error("Narrative choice admission evidence changed before dispatch.");
      }
      const validation = checkNarrativeChoiceValidation(input, before);
      if (!validation.valid) {
        return {
          sent: false,
          validation,
          before,
          after: readNarrativeChoiceSnapshot(),
        };
      }
      const runtime = requireNarrativeRuntime();
      if (typeof runtime.operations.sendRequest !== "function") {
        throw new Error("Game.PlayerOperations.sendRequest is unavailable.");
      }
      markSendInvoked();
      runtime.operations.sendRequest(
        before.localPlayerId,
        runtime.operationType,
        narrativeChoiceArgs(input, before)
      );
      return {
        sent: true,
        validation,
        before,
        after: readNarrativeChoiceSnapshot(),
      };
    };
    const boundedWireError = (error) => {
      let message;
      try {
        message = typeof error?.message === "string" ? error.message : String(error);
      } catch {
        message = "Civ7 narrative choice send failed.";
      }
      return message.slice(0, 512);
    };
    const sendNarrativeChoiceEnvelope = (input) => {
      let sendInvoked = false;
      try {
        return {
          ok: true,
          value: sendNarrativeChoice(input, () => {
            sendInvoked = true;
          }),
        };
      } catch (error) {
        return {
          ok: false,
          gameplayDispatchStatus: sendInvoked ? "dispatched" : "not-dispatched",
          error: boundedWireError(error),
        };
      }
    };`;
}

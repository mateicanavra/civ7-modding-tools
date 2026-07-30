import { type Static, Type } from "typebox";
import { Value } from "typebox/value";

import {
  Civ7DirectControlError,
  directControlErrorWithDispatchStatus,
} from "../direct-control-error.js";
import { jsLiteral } from "../runtime/command-serialization.js";
import { Civ7RuntimeProbeSchema, probeHelperSource } from "../runtime/probe.js";
import { schemaBodyFromCommandResult } from "../session/command-result.js";
import { executeCiv7AppUiCommand } from "../session/execute.js";
import type { Civ7DirectControlOptions } from "../session/types.js";
import { actionPanelTurnAuthoritySource } from "./action-panel-turn.js";

export const Civ7TurnCompletionInputSchema = Type.Object({}, { additionalProperties: false });
export type Civ7TurnCompletionInput = Readonly<Static<typeof Civ7TurnCompletionInputSchema>>;

export const Civ7TurnCompletionSnapshotSchema = Type.Object(
  {
    localPlayerId: Type.Integer(),
    turn: Civ7RuntimeProbeSchema(Type.Number()),
    hasSentTurnComplete: Civ7RuntimeProbeSchema(Type.Boolean()),
    canEndTurn: Civ7RuntimeProbeSchema(Type.Boolean()),
  },
  { additionalProperties: false }
);
export type Civ7TurnCompletionSnapshot = Readonly<Static<typeof Civ7TurnCompletionSnapshotSchema>>;

export const Civ7TurnCompletionCheckResultSchema = Type.Object(
  {
    snapshot: Civ7TurnCompletionSnapshotSchema,
  },
  { additionalProperties: false }
);
export type Civ7TurnCompletionCheckResult = Readonly<
  Static<typeof Civ7TurnCompletionCheckResultSchema>
>;

export const Civ7TurnCompletionSendInputSchema = Type.Object(
  {
    expected: Civ7TurnCompletionSnapshotSchema,
  },
  { additionalProperties: false }
);
export type Civ7TurnCompletionSendInput = Readonly<
  Static<typeof Civ7TurnCompletionSendInputSchema>
>;

export const Civ7TurnCompletionSendResultSchema = Type.Object(
  {
    sent: Type.Literal(true),
    before: Civ7TurnCompletionSnapshotSchema,
    after: Civ7TurnCompletionSnapshotSchema,
  },
  { additionalProperties: false }
);
export type Civ7TurnCompletionSendResult = Readonly<
  Static<typeof Civ7TurnCompletionSendResultSchema>
>;

const Civ7TurnCompletionSendEnvelopeSchema = Type.Union([
  Type.Object(
    {
      ok: Type.Literal(true),
      value: Civ7TurnCompletionSendResultSchema,
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

/** Reads the exact native action-panel turn-completion evidence. */
export async function checkCiv7TurnCompletion(
  input: Civ7TurnCompletionInput,
  options: Civ7DirectControlOptions = {}
): Promise<Civ7TurnCompletionCheckResult> {
  const command = await executeCiv7AppUiCommand({
    ...options,
    command: buildTurnCompletionWireCommand("checkTurnCompletion", input),
  });
  return schemaBodyFromCommandResult(
    command,
    "Civ7 turn completion check",
    Civ7TurnCompletionCheckResultSchema
  );
}

/** Invokes the native action-panel send once after exact admitted evidence still matches. */
export async function sendCiv7TurnCompletion(
  input: Civ7TurnCompletionSendInput,
  options: Civ7DirectControlOptions = {}
): Promise<Civ7TurnCompletionSendResult> {
  const command = await executeCiv7AppUiCommand({
    ...options,
    command: buildTurnCompletionWireCommand("sendTurnCompletion", input),
  });
  const envelope = schemaBodyFromCommandResult(
    command,
    "Civ7 turn completion send",
    Civ7TurnCompletionSendEnvelopeSchema
  );
  if (envelope.ok) return envelope.value;
  throw new Civ7DirectControlError("command-failed", envelope.error, {
    details: command,
    dispatchStatus: envelope.gameplayDispatchStatus,
  });
}

type TurnCompletionAtom = "checkTurnCompletion" | "sendTurnCompletion";

function buildTurnCompletionWireCommand(
  atom: "checkTurnCompletion",
  input: Civ7TurnCompletionInput
): string;
function buildTurnCompletionWireCommand(
  atom: "sendTurnCompletion",
  input: Civ7TurnCompletionSendInput
): string;
function buildTurnCompletionWireCommand(
  atom: TurnCompletionAtom,
  input: Civ7TurnCompletionInput | Civ7TurnCompletionSendInput
): string {
  try {
    if (atom === "checkTurnCompletion") {
      if (!Value.Check(Civ7TurnCompletionInputSchema, input)) {
        throw new TypeError("Turn completion check input must be an empty object.");
      }
      return `(() => {
    ${turnCompletionWireSource()}
    return JSON.stringify(checkTurnCompletion());
  })()`;
    }
    if (!Value.Check(Civ7TurnCompletionSendInputSchema, input)) {
      throw new TypeError("Turn completion send input must contain one valid expected snapshot.");
    }
    return `(() => {
    ${turnCompletionWireSource()}
    return JSON.stringify(sendTurnCompletionEnvelope(${jsLiteral(input)}));
  })()`;
  } catch (cause) {
    throw directControlErrorWithDispatchStatus(cause, "not-dispatched");
  }
}

function turnCompletionWireSource(): string {
  return `${probeHelperSource()}
    ${actionPanelTurnAuthoritySource()}
    const requireLocalPlayerId = () => {
      const localPlayerId = globalThis.GameContext?.localPlayerID;
      if (!Number.isInteger(localPlayerId)) {
        throw new Error("GameContext.localPlayerID is unavailable.");
      }
      return localPlayerId;
    };
    const readTurn = () => probe(() => {
      const turn = globalThis.Game?.turn;
      if (typeof turn !== "number" || !Number.isFinite(turn)) {
        throw new Error("Game.turn is unavailable.");
      }
      return turn;
    });
    const readHasSentTurnComplete = () => probe(() => {
      const hasSentTurnComplete = globalThis.GameContext?.hasSentTurnComplete;
      if (typeof hasSentTurnComplete !== "function") {
        throw new Error("GameContext.hasSentTurnComplete is unavailable.");
      }
      const value = hasSentTurnComplete.call(globalThis.GameContext);
      if (typeof value !== "boolean") {
        throw new Error("GameContext.hasSentTurnComplete returned a non-boolean value.");
      }
      return value;
    });
    const readTurnCompletionSnapshot = () => ({
      localPlayerId: requireLocalPlayerId(),
      turn: readTurn(),
      hasSentTurnComplete: readHasSentTurnComplete(),
      canEndTurn: readActionPanelCanEndTurn(),
    });
    const checkTurnCompletion = () => ({
      snapshot: readTurnCompletionSnapshot(),
    });
    const matchingReadableProbe = (expected, observed) =>
      expected?.ok === true &&
      observed?.ok === true &&
      Object.is(expected.value, observed.value);
    const turnCompletionGuardMatches = (expected, observed) =>
      expected &&
      expected.localPlayerId === observed.localPlayerId &&
      matchingReadableProbe(expected.turn, observed.turn) &&
      matchingReadableProbe(expected.hasSentTurnComplete, observed.hasSentTurnComplete) &&
      matchingReadableProbe(expected.canEndTurn, observed.canEndTurn);
    const nativeTurnCompletionAdmissionHolds = (snapshot) =>
      snapshot.hasSentTurnComplete.ok === true &&
      snapshot.hasSentTurnComplete.value === false &&
      snapshot.canEndTurn.ok === true &&
      snapshot.canEndTurn.value === true;
    const sendTurnCompletion = (input, markSendInvoked) => {
      const before = readTurnCompletionSnapshot();
      if (!turnCompletionGuardMatches(input.expected, before)) {
        throw new Error("Turn completion admission evidence changed or is unavailable.");
      }
      if (!nativeTurnCompletionAdmissionHolds(before)) {
        throw new Error("Native turn completion admission is not currently satisfied.");
      }
      const component = requireActionPanelComponent();
      const sendEndTurn = component.sendEndTurn;
      if (typeof sendEndTurn !== "function") {
        throw new Error("The .action-panel component sendEndTurn method is unavailable.");
      }
      markSendInvoked();
      sendEndTurn.call(component);
      return {
        sent: true,
        before,
        after: readTurnCompletionSnapshot(),
      };
    };
    const boundedTurnCompletionError = (error) => {
      let message;
      try {
        message = typeof error?.message === "string" ? error.message : String(error);
      } catch {
        message = "Civ7 turn completion send failed.";
      }
      return message.slice(0, 512);
    };
    const sendTurnCompletionEnvelope = (input) => {
      let sendInvoked = false;
      try {
        return {
          ok: true,
          value: sendTurnCompletion(input, () => {
            sendInvoked = true;
          }),
        };
      } catch (error) {
        return {
          ok: false,
          gameplayDispatchStatus: sendInvoked ? "dispatched" : "not-dispatched",
          error: boundedTurnCompletionError(error),
        };
      }
    };`;
}

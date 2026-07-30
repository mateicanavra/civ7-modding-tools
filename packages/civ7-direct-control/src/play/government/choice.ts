import { type Static, Type } from "typebox";

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
import { blockingNotificationObservationSource } from "../notifications/blocking-observation.js";

const Civ7GovernmentJsonValueSchema = Type.Cyclic(
  {
    Civ7GovernmentJsonValue: Type.Union([
      Type.Null(),
      Type.Boolean(),
      Type.Number(),
      Type.String(),
      Type.Array(Type.Ref("Civ7GovernmentJsonValue")),
      Type.Record(Type.String(), Type.Ref("Civ7GovernmentJsonValue")),
    ]),
  },
  "Civ7GovernmentJsonValue"
);

const nullableIntegerSchema = Type.Union([Type.Integer(), Type.Null()]);
const nullableNumberSchema = Type.Union([Type.Number(), Type.Null()]);
const nullableStringSchema = Type.Union([Type.String(), Type.Null()]);
const nullableComponentIdSchema = Type.Union([Civ7ComponentIdSchema, Type.Null()]);
const notificationTypeSchema = Type.Union([Type.Integer(), Type.String(), Type.Null()]);

const Civ7GovernmentBlockingNotificationSchema = Type.Union([
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

export const Civ7GovernmentChoiceInputSchema = Type.Object(
  {
    governmentType: Type.Integer(),
  },
  { additionalProperties: false }
);
export type Civ7GovernmentChoiceInput = Readonly<Static<typeof Civ7GovernmentChoiceInputSchema>>;

export const Civ7GovernmentChoiceOptionSchema = Type.Object(
  {
    governmentType: Type.Integer(),
    governmentTypeName: Type.String(),
  },
  { additionalProperties: false }
);
export type Civ7GovernmentChoiceOption = Readonly<Static<typeof Civ7GovernmentChoiceOptionSchema>>;

export const Civ7GovernmentChoiceSnapshotSchema = Type.Object(
  {
    localPlayerId: Type.Integer(),
    currentGovernmentType: nullableIntegerSchema,
    availableGovernments: Type.Array(Civ7GovernmentChoiceOptionSchema),
    activateAction: Type.Integer(),
    blocker: Civ7RuntimeProbeSchema(notificationTypeSchema),
    blockingNotification: Civ7RuntimeProbeSchema(Civ7GovernmentBlockingNotificationSchema),
  },
  { additionalProperties: false }
);
export type Civ7GovernmentChoiceSnapshot = Readonly<
  Static<typeof Civ7GovernmentChoiceSnapshotSchema>
>;

/** Government target plus the service-admitted snapshot that must still match before dispatch. */
export const Civ7GovernmentChoiceSendInputSchema = Type.Object(
  {
    governmentType: Type.Integer(),
    expected: Civ7GovernmentChoiceSnapshotSchema,
  },
  { additionalProperties: false }
);
export type Civ7GovernmentChoiceSendInput = Readonly<
  Static<typeof Civ7GovernmentChoiceSendInputSchema>
>;

export const Civ7GovernmentChoiceValidationResultSchema = Type.Object(
  {
    valid: Type.Boolean(),
    result: Civ7GovernmentJsonValueSchema,
  },
  { additionalProperties: false }
);
export type Civ7GovernmentChoiceValidationResult = Readonly<
  Static<typeof Civ7GovernmentChoiceValidationResultSchema>
>;

export const Civ7GovernmentChoiceCheckResultSchema = Type.Object(
  {
    valid: Type.Boolean(),
    result: Civ7GovernmentJsonValueSchema,
    snapshot: Civ7GovernmentChoiceSnapshotSchema,
  },
  { additionalProperties: false }
);
export type Civ7GovernmentChoiceCheckResult = Readonly<
  Static<typeof Civ7GovernmentChoiceCheckResultSchema>
>;

const Civ7GovernmentChoiceValidValidationResultSchema = Type.Object(
  {
    valid: Type.Literal(true),
    result: Civ7GovernmentJsonValueSchema,
  },
  { additionalProperties: false }
);

const Civ7GovernmentChoiceInvalidValidationResultSchema = Type.Object(
  {
    valid: Type.Literal(false),
    result: Civ7GovernmentJsonValueSchema,
  },
  { additionalProperties: false }
);

export const Civ7GovernmentChoiceSendResultSchema = Type.Union([
  Type.Object(
    {
      sent: Type.Literal(true),
      validation: Civ7GovernmentChoiceValidValidationResultSchema,
      before: Civ7GovernmentChoiceSnapshotSchema,
      after: Civ7GovernmentChoiceSnapshotSchema,
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      sent: Type.Literal(false),
      validation: Civ7GovernmentChoiceInvalidValidationResultSchema,
      before: Civ7GovernmentChoiceSnapshotSchema,
      after: Civ7GovernmentChoiceSnapshotSchema,
    },
    { additionalProperties: false }
  ),
]);
export type Civ7GovernmentChoiceSendResult = Readonly<
  Static<typeof Civ7GovernmentChoiceSendResultSchema>
>;

export const Civ7CelebrationChoiceInputSchema = Type.Object(
  {
    goldenAgeType: Type.Integer(),
  },
  { additionalProperties: false }
);
export type Civ7CelebrationChoiceInput = Readonly<Static<typeof Civ7CelebrationChoiceInputSchema>>;

export const Civ7CelebrationChoiceOptionSchema = Type.Object(
  {
    sourceChoice: Type.Integer(),
    goldenAgeType: Type.Integer(),
    goldenAgeTypeName: Type.String(),
  },
  { additionalProperties: false }
);
export type Civ7CelebrationChoiceOption = Readonly<
  Static<typeof Civ7CelebrationChoiceOptionSchema>
>;

export const Civ7CelebrationChoiceSnapshotSchema = Type.Object(
  {
    localPlayerId: Type.Integer(),
    currentGovernmentType: nullableIntegerSchema,
    availableGoldenAges: Type.Array(Civ7CelebrationChoiceOptionSchema),
    isInGoldenAge: Type.Boolean(),
    currentGoldenAgeType: nullableIntegerSchema,
    goldenAgeTurnsLeft: nullableNumberSchema,
    blocker: Civ7RuntimeProbeSchema(notificationTypeSchema),
    blockingNotification: Civ7RuntimeProbeSchema(Civ7GovernmentBlockingNotificationSchema),
  },
  { additionalProperties: false }
);
export type Civ7CelebrationChoiceSnapshot = Readonly<
  Static<typeof Civ7CelebrationChoiceSnapshotSchema>
>;

/** Celebration target plus the service-admitted snapshot that must still match before dispatch. */
export const Civ7CelebrationChoiceSendInputSchema = Type.Object(
  {
    goldenAgeType: Type.Integer(),
    expected: Civ7CelebrationChoiceSnapshotSchema,
  },
  { additionalProperties: false }
);
export type Civ7CelebrationChoiceSendInput = Readonly<
  Static<typeof Civ7CelebrationChoiceSendInputSchema>
>;

export const Civ7CelebrationChoiceValidationResultSchema = Type.Object(
  {
    valid: Type.Boolean(),
    result: Civ7GovernmentJsonValueSchema,
  },
  { additionalProperties: false }
);
export type Civ7CelebrationChoiceValidationResult = Readonly<
  Static<typeof Civ7CelebrationChoiceValidationResultSchema>
>;

export const Civ7CelebrationChoiceCheckResultSchema = Type.Object(
  {
    valid: Type.Boolean(),
    result: Civ7GovernmentJsonValueSchema,
    snapshot: Civ7CelebrationChoiceSnapshotSchema,
  },
  { additionalProperties: false }
);
export type Civ7CelebrationChoiceCheckResult = Readonly<
  Static<typeof Civ7CelebrationChoiceCheckResultSchema>
>;

const Civ7CelebrationChoiceValidValidationResultSchema = Type.Object(
  {
    valid: Type.Literal(true),
    result: Civ7GovernmentJsonValueSchema,
  },
  { additionalProperties: false }
);

const Civ7CelebrationChoiceInvalidValidationResultSchema = Type.Object(
  {
    valid: Type.Literal(false),
    result: Civ7GovernmentJsonValueSchema,
  },
  { additionalProperties: false }
);

export const Civ7CelebrationChoiceSendResultSchema = Type.Union([
  Type.Object(
    {
      sent: Type.Literal(true),
      validation: Civ7CelebrationChoiceValidValidationResultSchema,
      before: Civ7CelebrationChoiceSnapshotSchema,
      after: Civ7CelebrationChoiceSnapshotSchema,
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      sent: Type.Literal(false),
      validation: Civ7CelebrationChoiceInvalidValidationResultSchema,
      before: Civ7CelebrationChoiceSnapshotSchema,
      after: Civ7CelebrationChoiceSnapshotSchema,
    },
    { additionalProperties: false }
  ),
]);
export type Civ7CelebrationChoiceSendResult = Readonly<
  Static<typeof Civ7CelebrationChoiceSendResultSchema>
>;

const Civ7GovernmentChoiceSendEnvelopeSchema = sendEnvelopeSchema(
  Civ7GovernmentChoiceSendResultSchema
);
const Civ7CelebrationChoiceSendEnvelopeSchema = sendEnvelopeSchema(
  Civ7CelebrationChoiceSendResultSchema
);

export async function checkCiv7GovernmentChoice(
  input: Civ7GovernmentChoiceInput,
  options: Civ7DirectControlOptions = {}
): Promise<Civ7GovernmentChoiceCheckResult> {
  const command = await executeCiv7AppUiCommand({
    ...options,
    command: buildGovernmentChoiceWireCommand("checkGovernmentChoice", input),
  });
  return schemaBodyFromCommandResult(
    command,
    "Civ7 government choice check",
    Civ7GovernmentChoiceCheckResultSchema
  );
}

export async function sendCiv7GovernmentChoice(
  input: Civ7GovernmentChoiceSendInput,
  options: Civ7DirectControlOptions = {}
): Promise<Civ7GovernmentChoiceSendResult> {
  const command = await executeCiv7AppUiCommand({
    ...options,
    command: buildGovernmentChoiceWireCommand("sendGovernmentChoice", input),
  });
  const envelope = schemaBodyFromCommandResult(
    command,
    "Civ7 government choice send",
    Civ7GovernmentChoiceSendEnvelopeSchema
  );
  if (envelope.ok) return envelope.value;
  throw new Civ7DirectControlError("command-failed", envelope.error, {
    details: command,
    dispatchStatus: envelope.gameplayDispatchStatus,
  });
}

export async function checkCiv7CelebrationChoice(
  input: Civ7CelebrationChoiceInput,
  options: Civ7DirectControlOptions = {}
): Promise<Civ7CelebrationChoiceCheckResult> {
  const command = await executeCiv7AppUiCommand({
    ...options,
    command: buildGovernmentChoiceWireCommand("checkCelebrationChoice", input),
  });
  return schemaBodyFromCommandResult(
    command,
    "Civ7 celebration choice check",
    Civ7CelebrationChoiceCheckResultSchema
  );
}

export async function sendCiv7CelebrationChoice(
  input: Civ7CelebrationChoiceSendInput,
  options: Civ7DirectControlOptions = {}
): Promise<Civ7CelebrationChoiceSendResult> {
  const command = await executeCiv7AppUiCommand({
    ...options,
    command: buildGovernmentChoiceWireCommand("sendCelebrationChoice", input),
  });
  const envelope = schemaBodyFromCommandResult(
    command,
    "Civ7 celebration choice send",
    Civ7CelebrationChoiceSendEnvelopeSchema
  );
  if (envelope.ok) return envelope.value;
  throw new Civ7DirectControlError("command-failed", envelope.error, {
    details: command,
    dispatchStatus: envelope.gameplayDispatchStatus,
  });
}

function sendEnvelopeSchema<T extends ReturnType<typeof Type.Union>>(value: T) {
  return Type.Union([
    Type.Object(
      {
        ok: Type.Literal(true),
        value,
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
}

type GovernmentChoiceAtom =
  | "checkGovernmentChoice"
  | "sendGovernmentChoice"
  | "checkCelebrationChoice"
  | "sendCelebrationChoice";

function buildGovernmentChoiceWireCommand(
  atom: GovernmentChoiceAtom,
  input:
    | Civ7GovernmentChoiceInput
    | Civ7GovernmentChoiceSendInput
    | Civ7CelebrationChoiceInput
    | Civ7CelebrationChoiceSendInput
): string {
  try {
    const wireInput = governmentChoiceWireInput(atom, input);
    const invocation = atom.startsWith("send")
      ? `${atom}Envelope(${jsLiteral(wireInput)})`
      : `${atom}(${jsLiteral(wireInput)})`;
    return `(() => {
    ${governmentChoiceWireSource()}
    return JSON.stringify(${invocation});
  })()`;
  } catch (cause) {
    throw directControlErrorWithDispatchStatus(cause, "not-dispatched");
  }
}

function governmentChoiceWireInput(
  atom: GovernmentChoiceAtom,
  input:
    | Civ7GovernmentChoiceInput
    | Civ7GovernmentChoiceSendInput
    | Civ7CelebrationChoiceInput
    | Civ7CelebrationChoiceSendInput
):
  | Civ7GovernmentChoiceInput
  | Civ7GovernmentChoiceSendInput
  | Civ7CelebrationChoiceInput
  | Civ7CelebrationChoiceSendInput {
  if (atom === "checkGovernmentChoice" || atom === "sendGovernmentChoice") {
    const governmentType = (input as Civ7GovernmentChoiceInput).governmentType;
    if (!Number.isInteger(governmentType)) {
      throw new TypeError("governmentType must be an integer");
    }
    return atom === "sendGovernmentChoice"
      ? {
          governmentType,
          expected: (input as Civ7GovernmentChoiceSendInput).expected,
        }
      : { governmentType };
  }
  const goldenAgeType = (input as Civ7CelebrationChoiceInput).goldenAgeType;
  if (!Number.isInteger(goldenAgeType)) {
    throw new TypeError("goldenAgeType must be an integer");
  }
  return atom === "sendCelebrationChoice"
    ? {
        goldenAgeType,
        expected: (input as Civ7CelebrationChoiceSendInput).expected,
      }
    : { goldenAgeType };
}

function governmentChoiceWireSource(): string {
  return `${probeHelperSource()}
    ${blockingNotificationObservationSource()}
    const immutableJson = (value, label) => {
      const serialized = JSON.stringify(value);
      if (serialized === undefined) throw new Error(label + " returned non-JSON evidence.");
      return JSON.parse(serialized);
    };
    const requireLocalPlayer = () => {
      const localPlayerId = globalThis.GameContext?.localPlayerID;
      if (!Number.isInteger(localPlayerId)) {
        throw new Error("GameContext.localPlayerID is unavailable.");
      }
      if (typeof globalThis.Players?.get !== "function") {
        throw new Error("Players.get is unavailable.");
      }
      const player = globalThis.Players.get(localPlayerId);
      if (!player || typeof player !== "object") {
        throw new Error("The ambient local player is unavailable.");
      }
      if (!player.Culture || typeof player.Culture.getGovernmentType !== "function") {
        throw new Error("The local player's Culture.getGovernmentType is unavailable.");
      }
      return { localPlayerId, player };
    };
    const availableGovernments = () => {
      const rows = globalThis.GameInfo?.StartingGovernments;
      if (!rows || typeof rows[Symbol.iterator] !== "function") {
        throw new Error("GameInfo.StartingGovernments is unavailable.");
      }
      if (typeof globalThis.GameInfo?.Governments?.lookup !== "function") {
        throw new Error("GameInfo.Governments.lookup is unavailable.");
      }
      const available = [];
      for (const row of rows) {
        const government = globalThis.GameInfo.Governments.lookup(row?.GovernmentType);
        if (!Number.isInteger(government?.$index) || typeof government?.GovernmentType !== "string") {
          throw new Error("A starting government definition is unavailable.");
        }
        available.push({
          governmentType: government.$index,
          governmentTypeName: government.GovernmentType,
        });
      }
      return available;
    };
    const readGovernmentChoiceSnapshot = () => {
      const { localPlayerId, player } = requireLocalPlayer();
      const activateAction = globalThis.PlayerOperationParameters?.Activate;
      if (!Number.isInteger(activateAction)) {
        throw new Error("PlayerOperationParameters.Activate is unavailable.");
      }
      const currentGovernmentType = player.Culture.getGovernmentType();
      if (currentGovernmentType != null && !Number.isInteger(currentGovernmentType)) {
        throw new Error("Culture.getGovernmentType returned a non-integer value.");
      }
      return {
        localPlayerId,
        currentGovernmentType: currentGovernmentType ?? null,
        availableGovernments: availableGovernments(),
        activateAction,
        ...readBlockingNotificationEvidence(localPlayerId),
      };
    };
    const availableGoldenAges = (player) => {
      if (typeof player.Culture.getGoldenAgeChoices !== "function") {
        throw new Error("The local player's Culture.getGoldenAgeChoices is unavailable.");
      }
      const choices = player.Culture.getGoldenAgeChoices();
      if (!choices || typeof choices[Symbol.iterator] !== "function") {
        throw new Error("Culture.getGoldenAgeChoices returned a non-iterable value.");
      }
      if (typeof globalThis.GameInfo?.GoldenAges?.lookup !== "function") {
        throw new Error("GameInfo.GoldenAges.lookup is unavailable.");
      }
      if (typeof globalThis.Database?.makeHash !== "function") {
        throw new Error("Database.makeHash is unavailable.");
      }
      const available = [];
      for (const sourceChoice of choices) {
        if (!Number.isInteger(sourceChoice)) {
          throw new Error("Culture.getGoldenAgeChoices returned a non-integer choice.");
        }
        const goldenAge = globalThis.GameInfo.GoldenAges.lookup(sourceChoice);
        if (typeof goldenAge?.GoldenAgeType !== "string") {
          throw new Error("A golden-age definition is unavailable.");
        }
        const goldenAgeType = globalThis.Database.makeHash(goldenAge.GoldenAgeType);
        if (!Number.isInteger(goldenAgeType)) {
          throw new Error("Database.makeHash returned a non-integer GoldenAgeType.");
        }
        available.push({
          sourceChoice,
          goldenAgeType,
          goldenAgeTypeName: goldenAge.GoldenAgeType,
        });
      }
      return available;
    };
    const readCelebrationChoiceSnapshot = () => {
      const { localPlayerId, player } = requireLocalPlayer();
      const happiness = player.Happiness;
      if (
        !happiness ||
        typeof happiness.isInGoldenAge !== "function" ||
        typeof happiness.getCurrentGoldenAge !== "function" ||
        typeof happiness.getGoldenAgeTurnsLeft !== "function"
      ) {
        throw new Error("The local player's golden-age observations are unavailable.");
      }
      const currentGovernmentType = player.Culture.getGovernmentType();
      if (currentGovernmentType != null && !Number.isInteger(currentGovernmentType)) {
        throw new Error("Culture.getGovernmentType returned a non-integer value.");
      }
      const isInGoldenAge = happiness.isInGoldenAge();
      if (typeof isInGoldenAge !== "boolean") {
        throw new Error("Happiness.isInGoldenAge returned a non-boolean value.");
      }
      const currentGoldenAgeSource = happiness.getCurrentGoldenAge();
      if (currentGoldenAgeSource != null && !Number.isInteger(currentGoldenAgeSource)) {
        throw new Error("Happiness.getCurrentGoldenAge returned a non-integer value.");
      }
      let currentGoldenAgeType = null;
      if (currentGoldenAgeSource != null) {
        if (typeof globalThis.GameInfo?.GoldenAges?.lookup !== "function") {
          throw new Error("GameInfo.GoldenAges.lookup is unavailable.");
        }
        if (typeof globalThis.Database?.makeHash !== "function") {
          throw new Error("Database.makeHash is unavailable.");
        }
        const currentGoldenAge = globalThis.GameInfo.GoldenAges.lookup(currentGoldenAgeSource);
        if (typeof currentGoldenAge?.GoldenAgeType !== "string") {
          throw new Error("The current golden-age definition is unavailable.");
        }
        currentGoldenAgeType = globalThis.Database.makeHash(currentGoldenAge.GoldenAgeType);
        if (!Number.isInteger(currentGoldenAgeType)) {
          throw new Error("Database.makeHash returned a non-integer current GoldenAgeType.");
        }
      }
      const goldenAgeTurnsLeft = happiness.getGoldenAgeTurnsLeft();
      if (
        goldenAgeTurnsLeft != null &&
        (typeof goldenAgeTurnsLeft !== "number" || !Number.isFinite(goldenAgeTurnsLeft))
      ) {
        throw new Error("Happiness.getGoldenAgeTurnsLeft returned a non-number value.");
      }
      return {
        localPlayerId,
        currentGovernmentType: currentGovernmentType ?? null,
        availableGoldenAges: availableGoldenAges(player),
        isInGoldenAge,
        currentGoldenAgeType,
        goldenAgeTurnsLeft: goldenAgeTurnsLeft ?? null,
        ...readBlockingNotificationEvidence(localPlayerId),
      };
    };
    const successFromCanStart = (result) => {
      if (result !== null && typeof result === "object" && !Array.isArray(result)) {
        if ("Success" in result) {
          if (typeof result.Success === "boolean") return result.Success;
          throw new Error("Game.PlayerOperations.canStart returned a non-boolean Success field.");
        }
      }
      throw new Error("Game.PlayerOperations.canStart returned an unrecognized result.");
    };
    const requirePlayerOperations = (operationName) => {
      if (typeof globalThis.Game?.PlayerOperations?.canStart !== "function") {
        throw new Error("Game.PlayerOperations.canStart is unavailable.");
      }
      if (globalThis.PlayerOperationTypes?.[operationName] === undefined) {
        throw new Error("PlayerOperationTypes." + operationName + " is unavailable.");
      }
    };
    const checkGovernmentChoiceValidation = (input, snapshot) => {
      requirePlayerOperations("CHANGE_GOVERNMENT");
      const args = {
        GovernmentType: input.governmentType,
        Action: snapshot.activateAction,
      };
      const rawResult = globalThis.Game.PlayerOperations.canStart(
        snapshot.localPlayerId,
        globalThis.PlayerOperationTypes.CHANGE_GOVERNMENT,
        args,
        false
      );
      return {
        valid: successFromCanStart(rawResult),
        result: immutableJson(rawResult, "Game.PlayerOperations.canStart"),
      };
    };
    const checkCelebrationChoiceValidation = (input, snapshot) => {
      requirePlayerOperations("CHOOSE_GOLDEN_AGE");
      const args = { GoldenAgeType: input.goldenAgeType };
      const rawResult = globalThis.Game.PlayerOperations.canStart(
        snapshot.localPlayerId,
        globalThis.PlayerOperationTypes.CHOOSE_GOLDEN_AGE,
        args,
        false
      );
      return {
        valid: successFromCanStart(rawResult),
        result: immutableJson(rawResult, "Game.PlayerOperations.canStart"),
      };
    };
    const checkGovernmentChoice = (input) => {
      const snapshot = readGovernmentChoiceSnapshot();
      const validation = checkGovernmentChoiceValidation(input, snapshot);
      return { ...validation, snapshot };
    };
    const checkCelebrationChoice = (input) => {
      const snapshot = readCelebrationChoiceSnapshot();
      const validation = checkCelebrationChoiceValidation(input, snapshot);
      return { ...validation, snapshot };
    };
    const sameProbe = (left, right) => JSON.stringify(left) === JSON.stringify(right);
    const governmentChoiceGuardMatches = (expected, observed) =>
      expected &&
      expected.localPlayerId === observed.localPlayerId &&
      expected.currentGovernmentType === observed.currentGovernmentType &&
      expected.activateAction === observed.activateAction &&
      sameProbe(expected.blocker, observed.blocker) &&
      sameProbe(expected.blockingNotification, observed.blockingNotification);
    const celebrationChoiceGuardMatches = (expected, observed) =>
      expected &&
      expected.localPlayerId === observed.localPlayerId &&
      expected.isInGoldenAge === observed.isInGoldenAge &&
      expected.currentGoldenAgeType === observed.currentGoldenAgeType &&
      sameProbe(expected.blocker, observed.blocker) &&
      sameProbe(expected.blockingNotification, observed.blockingNotification);
    const sendGovernmentChoice = (input, markSendInvoked) => {
      const before = readGovernmentChoiceSnapshot();
      if (!governmentChoiceGuardMatches(input.expected, before)) {
        throw new Error("Government choice admission evidence changed before dispatch.");
      }
      const validation = checkGovernmentChoiceValidation(input, before);
      if (!validation.valid) {
        return {
          sent: false,
          validation,
          before,
          after: readGovernmentChoiceSnapshot(),
        };
      }
      if (typeof globalThis.Game.PlayerOperations.sendRequest !== "function") {
        throw new Error("Game.PlayerOperations.sendRequest is unavailable.");
      }
      markSendInvoked();
      globalThis.Game.PlayerOperations.sendRequest(
        before.localPlayerId,
        globalThis.PlayerOperationTypes.CHANGE_GOVERNMENT,
        {
          GovernmentType: input.governmentType,
          Action: before.activateAction,
        }
      );
      return {
        sent: true,
        validation,
        before,
        after: readGovernmentChoiceSnapshot(),
      };
    };
    const sendCelebrationChoice = (input, markSendInvoked) => {
      const before = readCelebrationChoiceSnapshot();
      if (!celebrationChoiceGuardMatches(input.expected, before)) {
        throw new Error("Celebration choice admission evidence changed before dispatch.");
      }
      const validation = checkCelebrationChoiceValidation(input, before);
      if (!validation.valid) {
        return {
          sent: false,
          validation,
          before,
          after: readCelebrationChoiceSnapshot(),
        };
      }
      if (typeof globalThis.Game.PlayerOperations.sendRequest !== "function") {
        throw new Error("Game.PlayerOperations.sendRequest is unavailable.");
      }
      markSendInvoked();
      globalThis.Game.PlayerOperations.sendRequest(
        before.localPlayerId,
        globalThis.PlayerOperationTypes.CHOOSE_GOLDEN_AGE,
        { GoldenAgeType: input.goldenAgeType }
      );
      return {
        sent: true,
        validation,
        before,
        after: readCelebrationChoiceSnapshot(),
      };
    };
    const boundedWireError = (error) => {
      let message;
      try {
        message = typeof error?.message === "string" ? error.message : String(error);
      } catch {
        message = "Civ7 government-domain choice send failed.";
      }
      return message.slice(0, 512);
    };
    const sendEnvelope = (send, input) => {
      let sendInvoked = false;
      try {
        return {
          ok: true,
          value: send(input, () => {
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
    };
    const sendGovernmentChoiceEnvelope = (input) =>
      sendEnvelope(sendGovernmentChoice, input);
    const sendCelebrationChoiceEnvelope = (input) =>
      sendEnvelope(sendCelebrationChoice, input);`;
}

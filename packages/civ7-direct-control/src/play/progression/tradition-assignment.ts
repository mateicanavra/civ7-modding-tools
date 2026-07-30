import { type Static, type TSchema, Type } from "typebox";

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

const Civ7TraditionJsonValueSchema = Type.Cyclic(
  {
    Civ7TraditionJsonValue: Type.Union([
      Type.Null(),
      Type.Boolean(),
      Type.Number(),
      Type.String(),
      Type.Array(Type.Ref("Civ7TraditionJsonValue")),
      Type.Record(Type.String(), Type.Ref("Civ7TraditionJsonValue")),
    ]),
  },
  "Civ7TraditionJsonValue"
);

/** Semantic tradition action resolved to the runtime native parameter on the wire. */
export const Civ7TraditionChangeActionSchema = Type.Union([
  Type.Literal("activate"),
  Type.Literal("deactivate"),
]);
export type Civ7TraditionChangeAction = Static<typeof Civ7TraditionChangeActionSchema>;

/** Focused ambient-player tradition active-set observation. */
export const Civ7TraditionAssignmentsSnapshotSchema = Type.Object(
  {
    localPlayerId: Type.Integer(),
    activeTraditions: Type.Array(Type.Integer()),
  },
  { additionalProperties: false }
);
export type Civ7TraditionAssignmentsSnapshot = Readonly<
  Static<typeof Civ7TraditionAssignmentsSnapshotSchema>
>;

/** One semantic tradition change selected for native validation. */
export const Civ7TraditionChangeAtomInputSchema = Type.Object(
  {
    traditionType: Type.Integer(),
    action: Civ7TraditionChangeActionSchema,
  },
  { additionalProperties: false }
);
export type Civ7TraditionChangeAtomInput = Readonly<
  Static<typeof Civ7TraditionChangeAtomInputSchema>
>;

/** Guarded tradition change carrying the admitted active set. */
export const Civ7TraditionChangeAtomSendInputSchema = Type.Object(
  {
    traditionType: Type.Integer(),
    action: Civ7TraditionChangeActionSchema,
    expected: Civ7TraditionAssignmentsSnapshotSchema,
  },
  { additionalProperties: false }
);
export type Civ7TraditionChangeAtomSendInput = Readonly<
  Static<typeof Civ7TraditionChangeAtomSendInputSchema>
>;

const nullableStringSchema = Type.Union([Type.String(), Type.Null()]);
const nullableComponentIdSchema = Type.Union([Civ7ComponentIdSchema, Type.Null()]);
const notificationTypeSchema = Type.Union([Type.Integer(), Type.String(), Type.Null()]);
const blockingNotificationSchema = Type.Union([
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

/** Raw blocker evidence surrounding the tradition review operation. */
export const Civ7TraditionReviewSnapshotSchema = Type.Object(
  {
    localPlayerId: Type.Integer(),
    blocker: Civ7RuntimeProbeSchema(notificationTypeSchema),
    blockingNotification: Civ7RuntimeProbeSchema(blockingNotificationSchema),
  },
  { additionalProperties: false }
);
export type Civ7TraditionReviewSnapshot = Readonly<
  Static<typeof Civ7TraditionReviewSnapshotSchema>
>;

/** Closed empty input for a tradition review check. */
export const Civ7TraditionReviewAtomInputSchema = Type.Object({}, { additionalProperties: false });
export type Civ7TraditionReviewAtomInput = Readonly<
  Static<typeof Civ7TraditionReviewAtomInputSchema>
>;

/** Guarded tradition review send input. */
export const Civ7TraditionReviewSendInputSchema = Type.Object(
  { expected: Civ7TraditionReviewSnapshotSchema },
  { additionalProperties: false }
);
export type Civ7TraditionReviewSendInput = Readonly<
  Static<typeof Civ7TraditionReviewSendInputSchema>
>;

/** Strict native `canStart` evidence for a tradition operation. */
export const Civ7TraditionValidationResultSchema = Type.Object(
  {
    valid: Type.Boolean(),
    result: Civ7TraditionJsonValueSchema,
  },
  { additionalProperties: false }
);
export type Civ7TraditionValidationResult = Readonly<
  Static<typeof Civ7TraditionValidationResultSchema>
>;

/** Tradition change validation paired with the active set used to obtain it. */
export const Civ7TraditionChangeCheckResultSchema = Type.Object(
  {
    valid: Type.Boolean(),
    result: Civ7TraditionJsonValueSchema,
    snapshot: Civ7TraditionAssignmentsSnapshotSchema,
  },
  { additionalProperties: false }
);
export type Civ7TraditionChangeCheckResult = Readonly<
  Static<typeof Civ7TraditionChangeCheckResultSchema>
>;

const validValidationSchema = Type.Object(
  { valid: Type.Literal(true), result: Civ7TraditionJsonValueSchema },
  { additionalProperties: false }
);
const invalidValidationSchema = Type.Object(
  { valid: Type.Literal(false), result: Civ7TraditionJsonValueSchema },
  { additionalProperties: false }
);

/** Tradition change dispatch evidence with fresh active-set observations. */
export const Civ7TraditionChangeSendResultSchema = Type.Union([
  Type.Object(
    {
      sent: Type.Literal(true),
      validation: validValidationSchema,
      before: Civ7TraditionAssignmentsSnapshotSchema,
      after: Civ7TraditionAssignmentsSnapshotSchema,
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      sent: Type.Literal(false),
      validation: invalidValidationSchema,
      before: Civ7TraditionAssignmentsSnapshotSchema,
      after: Civ7TraditionAssignmentsSnapshotSchema,
    },
    { additionalProperties: false }
  ),
]);
export type Civ7TraditionChangeSendResult = Readonly<
  Static<typeof Civ7TraditionChangeSendResultSchema>
>;

/** Tradition review validation paired with raw blocker evidence. */
export const Civ7TraditionReviewCheckResultSchema = Type.Object(
  {
    valid: Type.Boolean(),
    result: Civ7TraditionJsonValueSchema,
    snapshot: Civ7TraditionReviewSnapshotSchema,
  },
  { additionalProperties: false }
);
export type Civ7TraditionReviewCheckResult = Readonly<
  Static<typeof Civ7TraditionReviewCheckResultSchema>
>;

/** Tradition review dispatch evidence without manufactured clearance proof. */
export const Civ7TraditionReviewSendResultSchema = Type.Union([
  Type.Object(
    {
      sent: Type.Literal(true),
      validation: validValidationSchema,
      before: Civ7TraditionReviewSnapshotSchema,
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      sent: Type.Literal(false),
      validation: invalidValidationSchema,
      before: Civ7TraditionReviewSnapshotSchema,
    },
    { additionalProperties: false }
  ),
]);
export type Civ7TraditionReviewSendResult = Readonly<
  Static<typeof Civ7TraditionReviewSendResultSchema>
>;

const Civ7TraditionChangeSendEnvelopeSchema = Type.Union([
  Type.Object(
    {
      ok: Type.Literal(true),
      value: Civ7TraditionChangeSendResultSchema,
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

const Civ7TraditionReviewSendEnvelopeSchema = Type.Union([
  Type.Object(
    {
      ok: Type.Literal(true),
      value: Civ7TraditionReviewSendResultSchema,
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

/** Observes the ambient player's active tradition set. */
export async function observeCiv7TraditionAssignments(
  options: Civ7DirectControlOptions = {}
): Promise<Civ7TraditionAssignmentsSnapshot> {
  return await runCheck(
    "observeTraditionAssignment",
    "Civ7 tradition assignment observation",
    {},
    Civ7TraditionAssignmentsSnapshotSchema,
    options
  );
}

/** Checks one semantic tradition change against the exact native operation. */
export async function checkCiv7TraditionChange(
  input: Civ7TraditionChangeAtomInput,
  options: Civ7DirectControlOptions = {}
): Promise<Civ7TraditionChangeCheckResult> {
  return await runCheck(
    "checkTraditionAssignmentChange",
    "Civ7 tradition assignment change check",
    input,
    Civ7TraditionChangeCheckResultSchema,
    options
  );
}

/** Resolves and sends an admitted semantic tradition change. */
export async function sendCiv7TraditionChange(
  input: Civ7TraditionChangeAtomSendInput,
  options: Civ7DirectControlOptions = {}
): Promise<Civ7TraditionChangeSendResult> {
  const command = await executeCiv7AppUiCommand({
    ...options,
    command: buildTraditionWireCommand("sendTraditionAssignmentChange", input),
  });
  const envelope = schemaBodyFromCommandResult(
    command,
    "Civ7 tradition assignment change send",
    Civ7TraditionChangeSendEnvelopeSchema
  );
  if (envelope.ok) return envelope.value;
  throw new Civ7DirectControlError("command-failed", envelope.error, {
    details: command,
    dispatchStatus: envelope.gameplayDispatchStatus,
  });
}

/** Checks the exact native tradition review operation and blocker state. */
export async function checkCiv7TraditionReview(
  input: Civ7TraditionReviewAtomInput,
  options: Civ7DirectControlOptions = {}
): Promise<Civ7TraditionReviewCheckResult> {
  return await runCheck(
    "checkTraditionAssignmentReview",
    "Civ7 tradition assignment review check",
    input,
    Civ7TraditionReviewCheckResultSchema,
    options
  );
}

/** Sends an admitted tradition review without claiming review clearance. */
export async function sendCiv7TraditionReview(
  input: Civ7TraditionReviewSendInput,
  options: Civ7DirectControlOptions = {}
): Promise<Civ7TraditionReviewSendResult> {
  const command = await executeCiv7AppUiCommand({
    ...options,
    command: buildTraditionWireCommand("sendTraditionAssignmentReview", input),
  });
  const envelope = schemaBodyFromCommandResult(
    command,
    "Civ7 tradition assignment review send",
    Civ7TraditionReviewSendEnvelopeSchema
  );
  if (envelope.ok) return envelope.value;
  throw new Civ7DirectControlError("command-failed", envelope.error, {
    details: command,
    dispatchStatus: envelope.gameplayDispatchStatus,
  });
}

type TraditionAtom =
  | "observeTraditionAssignment"
  | "checkTraditionAssignmentChange"
  | "sendTraditionAssignmentChange"
  | "checkTraditionAssignmentReview"
  | "sendTraditionAssignmentReview";

async function runCheck<Schema extends TSchema>(
  atom: TraditionAtom,
  label: string,
  input: object,
  schema: Schema,
  options: Civ7DirectControlOptions
): Promise<Static<Schema>> {
  const command = await executeCiv7AppUiCommand({
    ...options,
    command: buildTraditionWireCommand(atom, input),
  });
  return schemaBodyFromCommandResult(command, label, schema);
}

function buildTraditionWireCommand(atom: TraditionAtom, input: object): string {
  try {
    if ("traditionType" in input && !Number.isInteger(input.traditionType)) {
      throw new TypeError("traditionType must be an integer");
    }
    if ("action" in input && input.action !== "activate" && input.action !== "deactivate") {
      throw new TypeError("action must be activate or deactivate");
    }
    const invocation = atom.startsWith("send")
      ? `${atom}Envelope(${jsLiteral(input)})`
      : `${atom}(${jsLiteral(input)})`;
    return `(() => {
    ${traditionWireSource()}
    return JSON.stringify(${invocation});
  })()`;
  } catch (cause) {
    throw directControlErrorWithDispatchStatus(cause, "not-dispatched");
  }
}

function traditionWireSource(): string {
  return `${probeHelperSource()}
    ${blockingNotificationObservationSource()}
    const immutableJson = (value, label) => {
      const serialized = JSON.stringify(value);
      if (serialized === undefined) throw new Error(label + " returned non-JSON evidence.");
      return JSON.parse(serialized);
    };
    const requireCulture = () => {
      const localPlayerId = globalThis.GameContext?.localPlayerID;
      if (!Number.isInteger(localPlayerId)) {
        throw new Error("GameContext.localPlayerID is unavailable.");
      }
      if (typeof globalThis.Players?.get !== "function") {
        throw new Error("Players.get is unavailable.");
      }
      const culture = globalThis.Players.get(localPlayerId)?.Culture;
      if (!culture || typeof culture.getActiveTraditions !== "function") {
        throw new Error("The local player Culture.getActiveTraditions is unavailable.");
      }
      return { localPlayerId, culture };
    };
    const readTraditionAssignmentSnapshot = () => {
      const { localPlayerId, culture } = requireCulture();
      const slotTypes = globalThis.CultureSlotTypes;
      const slots = [
        slotTypes?.POLICY_CULTURE_SLOT,
        slotTypes?.TRADITION_CULTURE_SLOT,
        slotTypes?.CRISIS_CULTURE_SLOT,
      ];
      if (slots.some((slot) => slot === undefined)) {
        throw new Error(
          "The Civ7 policy, tradition, and crisis culture-slot types are unavailable."
        );
      }
      const activeTraditions = new Set();
      for (const slot of slots) {
        const raw = culture.getActiveTraditions(slot);
        if (!raw || typeof raw[Symbol.iterator] !== "function") {
          throw new Error("Culture.getActiveTraditions returned a non-iterable value.");
        }
        for (const tradition of raw) {
          if (!Number.isInteger(tradition)) {
            throw new Error("Culture.getActiveTraditions returned a non-integer value.");
          }
          activeTraditions.add(tradition);
        }
      }
      return {
        localPlayerId,
        activeTraditions: Array.from(activeTraditions).sort((left, right) => left - right),
      };
    };
    const operationType = (name) => {
      const value = globalThis.PlayerOperationTypes?.[name];
      if (value === undefined) {
        throw new Error("PlayerOperationTypes." + name + " is unavailable.");
      }
      return value;
    };
    const resolveAction = (action) => {
      const name = action === "activate" ? "Activate" : "Deactivate";
      const value = globalThis.PlayerOperationParameters?.[name];
      if (!Number.isInteger(value)) {
        throw new Error("PlayerOperationParameters." + name + " is unavailable.");
      }
      return value;
    };
    const strictValidation = (localPlayerId, operation, args) => {
      const operations = globalThis.Game?.PlayerOperations;
      if (typeof operations?.canStart !== "function") {
        throw new Error("Game.PlayerOperations.canStart is unavailable.");
      }
      const rawResult = operations.canStart(localPlayerId, operation, args, false);
      if (
        rawResult === null ||
        typeof rawResult !== "object" ||
        Array.isArray(rawResult) ||
        typeof rawResult.Success !== "boolean"
      ) {
        throw new Error("Game.PlayerOperations.canStart returned an invalid Success result.");
      }
      return {
        valid: rawResult.Success === true,
        result: immutableJson(rawResult, "Game.PlayerOperations.canStart"),
      };
    };
    const observeTraditionAssignment = () => readTraditionAssignmentSnapshot();
    const checkTraditionAssignmentChange = (input) => {
      const snapshot = readTraditionAssignmentSnapshot();
      const args = {
        TraditionType: input.traditionType,
        Action: resolveAction(input.action),
      };
      const validation = strictValidation(
        snapshot.localPlayerId,
        operationType("CHANGE_TRADITION"),
        args
      );
      return { ...validation, snapshot };
    };
    const sameSnapshot = (left, right) =>
      left &&
      left.localPlayerId === right.localPlayerId &&
      JSON.stringify(left.activeTraditions) === JSON.stringify(right.activeTraditions);
    const sendTraditionAssignmentChange = (input, markSendInvoked) => {
      const before = readTraditionAssignmentSnapshot();
      if (!sameSnapshot(input.expected, before)) {
        throw new Error("Tradition assignment admission evidence changed before dispatch.");
      }
      const operation = operationType("CHANGE_TRADITION");
      const args = {
        TraditionType: input.traditionType,
        Action: resolveAction(input.action),
      };
      const validation = strictValidation(before.localPlayerId, operation, args);
      if (!validation.valid) {
        return {
          sent: false,
          validation,
          before,
          after: readTraditionAssignmentSnapshot(),
        };
      }
      const operations = globalThis.Game?.PlayerOperations;
      if (typeof operations?.sendRequest !== "function") {
        throw new Error("Game.PlayerOperations.sendRequest is unavailable.");
      }
      markSendInvoked();
      operations.sendRequest(before.localPlayerId, operation, args);
      return {
        sent: true,
        validation,
        before,
        after: readTraditionAssignmentSnapshot(),
      };
    };
    const readTraditionAssignmentReviewSnapshot = () => {
      const { localPlayerId } = requireCulture();
      return {
        localPlayerId,
        ...readBlockingNotificationEvidence(localPlayerId),
      };
    };
    const checkTraditionAssignmentReview = () => {
      const snapshot = readTraditionAssignmentReviewSnapshot();
      const validation = strictValidation(
        snapshot.localPlayerId,
        operationType("CONSIDER_ASSIGN_TRADITIONS"),
        {}
      );
      return { ...validation, snapshot };
    };
    const sendTraditionAssignmentReview = (input, markSendInvoked) => {
      const before = readTraditionAssignmentReviewSnapshot();
      if (
        !input.expected ||
        JSON.stringify(input.expected) !== JSON.stringify(before)
      ) {
        throw new Error("Tradition review admission evidence changed before dispatch.");
      }
      const operation = operationType("CONSIDER_ASSIGN_TRADITIONS");
      const validation = strictValidation(
        before.localPlayerId,
        operation,
        {}
      );
      if (!validation.valid) return { sent: false, validation, before };
      const operations = globalThis.Game?.PlayerOperations;
      if (typeof operations?.sendRequest !== "function") {
        throw new Error("Game.PlayerOperations.sendRequest is unavailable.");
      }
      markSendInvoked();
      operations.sendRequest(before.localPlayerId, operation, {});
      return { sent: true, validation, before };
    };
    const boundedWireError = (error) => {
      let message;
      try {
        message = typeof error?.message === "string" ? error.message : String(error);
      } catch {
        message = "Civ7 tradition assignment send failed.";
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
    const sendTraditionAssignmentChangeEnvelope = (input) =>
      sendEnvelope(sendTraditionAssignmentChange, input);
    const sendTraditionAssignmentReviewEnvelope = (input) =>
      sendEnvelope(sendTraditionAssignmentReview, input);`;
}

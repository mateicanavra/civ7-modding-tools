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

const Civ7AttributeJsonValueSchema = Type.Cyclic(
  {
    Civ7AttributeJsonValue: Type.Union([
      Type.Null(),
      Type.Boolean(),
      Type.Number(),
      Type.String(),
      Type.Array(Type.Ref("Civ7AttributeJsonValue")),
      Type.Record(Type.String(), Type.Ref("Civ7AttributeJsonValue")),
    ]),
  },
  "Civ7AttributeJsonValue"
);

/** Native attribute node selected for observation or purchase validation. */
export const Civ7AttributePurchaseAtomInputSchema = Type.Object(
  { node: Type.Integer() },
  { additionalProperties: false }
);
export type Civ7AttributePurchaseAtomInput = Readonly<
  Static<typeof Civ7AttributePurchaseAtomInputSchema>
>;

const nullableIntegerSchema = Type.Union([Type.Integer(), Type.Null()]);
const nullableNumberSchema = Type.Union([Type.Number(), Type.Null()]);
const attributeTypeSchema = Type.Union([Type.Integer(), Type.String(), Type.Null()]);

/** Focused ambient-player state for one attribute progression node. */
export const Civ7AttributeNodeSnapshotSchema = Type.Object(
  {
    localPlayerId: Type.Integer(),
    node: Type.Integer(),
    nodeState: nullableIntegerSchema,
    depthUnlocked: nullableIntegerSchema,
    repeatedDepth: nullableIntegerSchema,
    attributeType: attributeTypeSchema,
    availablePoints: nullableNumberSchema,
    wildcardPoints: nullableNumberSchema,
  },
  { additionalProperties: false }
);
export type Civ7AttributeNodeSnapshot = Readonly<Static<typeof Civ7AttributeNodeSnapshotSchema>>;

/** Guarded attribute purchase carrying the snapshot admitted by a preceding check. */
export const Civ7AttributePurchaseAtomSendInputSchema = Type.Object(
  {
    node: Type.Integer(),
    expected: Civ7AttributeNodeSnapshotSchema,
  },
  { additionalProperties: false }
);
export type Civ7AttributePurchaseAtomSendInput = Readonly<
  Static<typeof Civ7AttributePurchaseAtomSendInputSchema>
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

/** Raw blocker evidence surrounding the attribute review operation. */
export const Civ7AttributeReviewSnapshotSchema = Type.Object(
  {
    localPlayerId: Type.Integer(),
    blocker: Civ7RuntimeProbeSchema(notificationTypeSchema),
    blockingNotification: Civ7RuntimeProbeSchema(blockingNotificationSchema),
  },
  { additionalProperties: false }
);
export type Civ7AttributeReviewSnapshot = Readonly<
  Static<typeof Civ7AttributeReviewSnapshotSchema>
>;

/** Closed empty input for an attribute review check. */
export const Civ7AttributeReviewAtomInputSchema = Type.Object({}, { additionalProperties: false });
export type Civ7AttributeReviewAtomInput = Readonly<
  Static<typeof Civ7AttributeReviewAtomInputSchema>
>;

/** Guarded attribute review send input. */
export const Civ7AttributeReviewSendInputSchema = Type.Object(
  { expected: Civ7AttributeReviewSnapshotSchema },
  { additionalProperties: false }
);
export type Civ7AttributeReviewSendInput = Readonly<
  Static<typeof Civ7AttributeReviewSendInputSchema>
>;

/** Strict native `canStart` evidence for an attribute operation. */
export const Civ7AttributeValidationResultSchema = Type.Object(
  {
    valid: Type.Boolean(),
    result: Civ7AttributeJsonValueSchema,
  },
  { additionalProperties: false }
);
export type Civ7AttributeValidationResult = Readonly<
  Static<typeof Civ7AttributeValidationResultSchema>
>;

/** Attribute purchase validation paired with focused node state. */
export const Civ7AttributePurchaseCheckResultSchema = Type.Object(
  {
    valid: Type.Boolean(),
    result: Civ7AttributeJsonValueSchema,
    snapshot: Civ7AttributeNodeSnapshotSchema,
  },
  { additionalProperties: false }
);
export type Civ7AttributePurchaseCheckResult = Readonly<
  Static<typeof Civ7AttributePurchaseCheckResultSchema>
>;

const validValidationSchema = Type.Object(
  { valid: Type.Literal(true), result: Civ7AttributeJsonValueSchema },
  { additionalProperties: false }
);
const invalidValidationSchema = Type.Object(
  { valid: Type.Literal(false), result: Civ7AttributeJsonValueSchema },
  { additionalProperties: false }
);

/** Attribute purchase dispatch evidence with fresh node observations. */
export const Civ7AttributePurchaseSendResultSchema = Type.Union([
  Type.Object(
    {
      sent: Type.Literal(true),
      validation: validValidationSchema,
      before: Civ7AttributeNodeSnapshotSchema,
      after: Civ7AttributeNodeSnapshotSchema,
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      sent: Type.Literal(false),
      validation: invalidValidationSchema,
      before: Civ7AttributeNodeSnapshotSchema,
      after: Civ7AttributeNodeSnapshotSchema,
    },
    { additionalProperties: false }
  ),
]);
export type Civ7AttributePurchaseSendResult = Readonly<
  Static<typeof Civ7AttributePurchaseSendResultSchema>
>;

/** Attribute review validation paired with raw blocker evidence. */
export const Civ7AttributeReviewCheckResultSchema = Type.Object(
  {
    valid: Type.Boolean(),
    result: Civ7AttributeJsonValueSchema,
    snapshot: Civ7AttributeReviewSnapshotSchema,
  },
  { additionalProperties: false }
);
export type Civ7AttributeReviewCheckResult = Readonly<
  Static<typeof Civ7AttributeReviewCheckResultSchema>
>;

/** Attribute review dispatch evidence without manufactured clearance proof. */
export const Civ7AttributeReviewSendResultSchema = Type.Union([
  Type.Object(
    {
      sent: Type.Literal(true),
      validation: validValidationSchema,
      before: Civ7AttributeReviewSnapshotSchema,
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      sent: Type.Literal(false),
      validation: invalidValidationSchema,
      before: Civ7AttributeReviewSnapshotSchema,
    },
    { additionalProperties: false }
  ),
]);
export type Civ7AttributeReviewSendResult = Readonly<
  Static<typeof Civ7AttributeReviewSendResultSchema>
>;

const Civ7AttributePurchaseSendEnvelopeSchema = Type.Union([
  Type.Object(
    {
      ok: Type.Literal(true),
      value: Civ7AttributePurchaseSendResultSchema,
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

const Civ7AttributeReviewSendEnvelopeSchema = Type.Union([
  Type.Object(
    {
      ok: Type.Literal(true),
      value: Civ7AttributeReviewSendResultSchema,
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

/** Observes exact native state for one ambient-player attribute node. */
export async function observeCiv7AttributeNode(
  input: Civ7AttributePurchaseAtomInput,
  options: Civ7DirectControlOptions = {}
): Promise<Civ7AttributeNodeSnapshot> {
  return await runCheck(
    "observeAttributeNode",
    "Civ7 attribute node observation",
    input,
    Civ7AttributeNodeSnapshotSchema,
    options
  );
}

/** Checks the exact native attribute purchase operation. */
export async function checkCiv7AttributePurchase(
  input: Civ7AttributePurchaseAtomInput,
  options: Civ7DirectControlOptions = {}
): Promise<Civ7AttributePurchaseCheckResult> {
  return await runCheck(
    "checkAttributeNodePurchase",
    "Civ7 attribute node purchase check",
    input,
    Civ7AttributePurchaseCheckResultSchema,
    options
  );
}

/** Sends an admitted attribute purchase after a fresh strict check. */
export async function sendCiv7AttributePurchase(
  input: Civ7AttributePurchaseAtomSendInput,
  options: Civ7DirectControlOptions = {}
): Promise<Civ7AttributePurchaseSendResult> {
  const command = await executeCiv7AppUiCommand({
    ...options,
    command: buildAttributeWireCommand("sendAttributeNodePurchase", input),
  });
  const envelope = schemaBodyFromCommandResult(
    command,
    "Civ7 attribute node purchase send",
    Civ7AttributePurchaseSendEnvelopeSchema
  );
  if (envelope.ok) return envelope.value;
  throw new Civ7DirectControlError("command-failed", envelope.error, {
    details: command,
    dispatchStatus: envelope.gameplayDispatchStatus,
  });
}

/** Checks the exact native attribute review operation and blocker state. */
export async function checkCiv7AttributeReview(
  input: Civ7AttributeReviewAtomInput,
  options: Civ7DirectControlOptions = {}
): Promise<Civ7AttributeReviewCheckResult> {
  return await runCheck(
    "checkAttributeReview",
    "Civ7 attribute review check",
    input,
    Civ7AttributeReviewCheckResultSchema,
    options
  );
}

/** Sends an admitted attribute review without claiming review clearance. */
export async function sendCiv7AttributeReview(
  input: Civ7AttributeReviewSendInput,
  options: Civ7DirectControlOptions = {}
): Promise<Civ7AttributeReviewSendResult> {
  const command = await executeCiv7AppUiCommand({
    ...options,
    command: buildAttributeWireCommand("sendAttributeReview", input),
  });
  const envelope = schemaBodyFromCommandResult(
    command,
    "Civ7 attribute review send",
    Civ7AttributeReviewSendEnvelopeSchema
  );
  if (envelope.ok) return envelope.value;
  throw new Civ7DirectControlError("command-failed", envelope.error, {
    details: command,
    dispatchStatus: envelope.gameplayDispatchStatus,
  });
}

type AttributeAtom =
  | "observeAttributeNode"
  | "checkAttributeNodePurchase"
  | "sendAttributeNodePurchase"
  | "checkAttributeReview"
  | "sendAttributeReview";

async function runCheck<Schema extends TSchema>(
  atom: AttributeAtom,
  label: string,
  input: object,
  schema: Schema,
  options: Civ7DirectControlOptions
): Promise<Static<Schema>> {
  const command = await executeCiv7AppUiCommand({
    ...options,
    command: buildAttributeWireCommand(atom, input),
  });
  return schemaBodyFromCommandResult(command, label, schema);
}

function buildAttributeWireCommand(atom: AttributeAtom, input: object): string {
  try {
    if ("node" in input && !Number.isInteger(input.node)) {
      throw new TypeError("node must be an integer");
    }
    const invocation = atom.startsWith("send")
      ? `${atom}Envelope(${jsLiteral(input)})`
      : `${atom}(${jsLiteral(input)})`;
    return `(() => {
    ${attributeWireSource()}
    return JSON.stringify(${invocation});
  })()`;
  } catch (cause) {
    throw directControlErrorWithDispatchStatus(cause, "not-dispatched");
  }
}

function attributeWireSource(): string {
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
      return { localPlayerId, player };
    };
    const attributeInfo = (player, nodeData) => {
      const nodeType = nodeData?.nodeType ?? nodeData?.ProgressionTreeNodeType ?? null;
      const nodeDefinition = typeof globalThis.GameInfo?.ProgressionTreeNodes?.lookup === "function"
        ? globalThis.GameInfo.ProgressionTreeNodes.lookup(nodeType)
        : null;
      const progressionTreeType =
        nodeDefinition?.ProgressionTree ?? nodeData?.progressionTree ?? null;
      const attributes = globalThis.GameInfo?.Attributes;
      if (!attributes || typeof attributes[Symbol.iterator] !== "function") return null;
      for (const definition of attributes) {
        if (definition?.ProgressionTreeType !== progressionTreeType) continue;
        const attributeType = definition.AttributeType ?? null;
        const identity = player.Identity;
        return {
          attributeType,
          availablePoints:
            typeof identity?.getAvailableAttributePoints === "function"
              ? identity.getAvailableAttributePoints(attributeType)
              : null,
          wildcardPoints:
            typeof identity?.getWildcardPoints === "function"
              ? identity.getWildcardPoints()
              : null,
        };
      }
      return null;
    };
    const readAttributeNodeSnapshot = (input) => {
      const { localPlayerId, player } = requireLocalPlayer();
      const trees = globalThis.Game?.ProgressionTrees;
      if (typeof trees?.getNodeState !== "function") {
        throw new Error("Game.ProgressionTrees.getNodeState is unavailable.");
      }
      if (typeof trees.getNode !== "function") {
        throw new Error("Game.ProgressionTrees.getNode is unavailable.");
      }
      const nodeState = trees.getNodeState(localPlayerId, input.node);
      const nodeData = trees.getNode(localPlayerId, input.node);
      if (nodeState != null && !Number.isInteger(nodeState)) {
        throw new Error("Game.ProgressionTrees.getNodeState returned a non-integer value.");
      }
      const attribute = attributeInfo(player, nodeData);
      const integerOrNull = (value, label) => {
        if (value == null) return null;
        if (!Number.isInteger(value)) throw new Error(label + " returned a non-integer value.");
        return value;
      };
      const numberOrNull = (value, label) => {
        if (value == null) return null;
        if (typeof value !== "number" || !Number.isFinite(value)) {
          throw new Error(label + " returned a non-number value.");
        }
        return value;
      };
      return {
        localPlayerId,
        node: input.node,
        nodeState: nodeState ?? null,
        depthUnlocked: integerOrNull(
          nodeData?.depthUnlocked,
          "Game.ProgressionTrees.getNode depthUnlocked"
        ),
        repeatedDepth: integerOrNull(
          nodeData?.repeatedDepth,
          "Game.ProgressionTrees.getNode repeatedDepth"
        ),
        attributeType: attribute?.attributeType ?? null,
        availablePoints: numberOrNull(attribute?.availablePoints, "available attribute points"),
        wildcardPoints: numberOrNull(attribute?.wildcardPoints, "wildcard attribute points"),
      };
    };
    const operationType = (name) => {
      const value = globalThis.PlayerOperationTypes?.[name];
      if (value === undefined) {
        throw new Error("PlayerOperationTypes." + name + " is unavailable.");
      }
      return value;
    };
    const strictValidation = (operation, args) => {
      const { localPlayerId } = requireLocalPlayer();
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
    const observeAttributeNode = (input) => readAttributeNodeSnapshot(input);
    const checkAttributeNodePurchase = (input) => {
      const snapshot = readAttributeNodeSnapshot(input);
      const validation = strictValidation(
        operationType("BUY_ATTRIBUTE_TREE_NODE"),
        { ProgressionTreeNodeType: input.node }
      );
      return { ...validation, snapshot };
    };
    const sameSnapshot = (left, right) =>
      left && JSON.stringify(left) === JSON.stringify(right);
    const sendAttributeNodePurchase = (input, markSendInvoked) => {
      const before = readAttributeNodeSnapshot(input);
      if (!sameSnapshot(input.expected, before)) {
        throw new Error("Attribute node admission evidence changed before dispatch.");
      }
      const operation = operationType("BUY_ATTRIBUTE_TREE_NODE");
      const args = { ProgressionTreeNodeType: input.node };
      const validation = strictValidation(operation, args);
      if (!validation.valid) {
        return {
          sent: false,
          validation,
          before,
          after: readAttributeNodeSnapshot(input),
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
        after: readAttributeNodeSnapshot(input),
      };
    };
    const readAttributeReviewSnapshot = () => {
      const { localPlayerId } = requireLocalPlayer();
      return {
        localPlayerId,
        ...readBlockingNotificationEvidence(localPlayerId),
      };
    };
    const checkAttributeReview = () => {
      const snapshot = readAttributeReviewSnapshot();
      const validation = strictValidation(operationType("CONSIDER_ASSIGN_ATTRIBUTE"), {});
      return { ...validation, snapshot };
    };
    const sendAttributeReview = (input, markSendInvoked) => {
      const before = readAttributeReviewSnapshot();
      if (!sameSnapshot(input.expected, before)) {
        throw new Error("Attribute review admission evidence changed before dispatch.");
      }
      const operation = operationType("CONSIDER_ASSIGN_ATTRIBUTE");
      const validation = strictValidation(operation, {});
      if (!validation.valid) return { sent: false, validation, before };
      const { localPlayerId } = requireLocalPlayer();
      const operations = globalThis.Game?.PlayerOperations;
      if (typeof operations?.sendRequest !== "function") {
        throw new Error("Game.PlayerOperations.sendRequest is unavailable.");
      }
      markSendInvoked();
      operations.sendRequest(localPlayerId, operation, {});
      return { sent: true, validation, before };
    };
    const boundedWireError = (error) => {
      let message;
      try {
        message = typeof error?.message === "string" ? error.message : String(error);
      } catch {
        message = "Civ7 attribute send failed.";
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
    const sendAttributeNodePurchaseEnvelope = (input) =>
      sendEnvelope(sendAttributeNodePurchase, input);
    const sendAttributeReviewEnvelope = (input) =>
      sendEnvelope(sendAttributeReview, input);`;
}

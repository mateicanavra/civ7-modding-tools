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

const Civ7ProgressionTreeJsonValueSchema = Type.Cyclic(
  {
    Civ7ProgressionTreeJsonValue: Type.Union([
      Type.Null(),
      Type.Boolean(),
      Type.Number(),
      Type.String(),
      Type.Array(Type.Ref("Civ7ProgressionTreeJsonValue")),
      Type.Record(Type.String(), Type.Ref("Civ7ProgressionTreeJsonValue")),
    ]),
  },
  "Civ7ProgressionTreeJsonValue"
);

/** Closed progression domain understood by the native tree operations. */
export const Civ7ProgressionTreeKindSchema = Type.Union([
  Type.Literal("technology"),
  Type.Literal("culture"),
]);
export type Civ7ProgressionTreeKind = Static<typeof Civ7ProgressionTreeKindSchema>;

const nullableIntegerSchema = Type.Union([Type.Integer(), Type.Null()]);
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

/** Fresh ambient-player tree state used for admission and later polling. */
export const Civ7ProgressionTreeSnapshotSchema = Type.Object(
  {
    localPlayerId: Type.Integer(),
    kind: Civ7ProgressionTreeKindSchema,
    currentNode: nullableIntegerSchema,
    targetNode: nullableIntegerSchema,
    noNode: Type.Integer(),
    blocker: Civ7RuntimeProbeSchema(notificationTypeSchema),
    blockingNotification: Civ7RuntimeProbeSchema(blockingNotificationSchema),
  },
  { additionalProperties: false }
);
export type Civ7ProgressionTreeSnapshot = Readonly<
  Static<typeof Civ7ProgressionTreeSnapshotSchema>
>;

/** One technology or culture node selected for native validation. */
export const Civ7ProgressionTreeNodeInputSchema = Type.Object(
  {
    kind: Civ7ProgressionTreeKindSchema,
    node: Type.Integer(),
  },
  { additionalProperties: false }
);
export type Civ7ProgressionTreeNodeInput = Readonly<
  Static<typeof Civ7ProgressionTreeNodeInputSchema>
>;

/** Guarded node mutation carrying the snapshot admitted by a preceding check. */
export const Civ7ProgressionTreeNodeSendInputSchema = Type.Object(
  {
    kind: Civ7ProgressionTreeKindSchema,
    node: Type.Integer(),
    expected: Civ7ProgressionTreeSnapshotSchema,
  },
  { additionalProperties: false }
);
export type Civ7ProgressionTreeNodeSendInput = Readonly<
  Static<typeof Civ7ProgressionTreeNodeSendInputSchema>
>;

/** Guarded target clear; the native chooser supplies the runtime `NO_NODE`. */
export const Civ7ProgressionTreeClearTargetInputSchema = Type.Object(
  {
    kind: Civ7ProgressionTreeKindSchema,
    expected: Civ7ProgressionTreeSnapshotSchema,
  },
  { additionalProperties: false }
);
export type Civ7ProgressionTreeClearTargetInput = Readonly<
  Static<typeof Civ7ProgressionTreeClearTargetInputSchema>
>;

/** Strict native `canStart` evidence for one tree operation. */
export const Civ7ProgressionTreeValidationResultSchema = Type.Object(
  {
    valid: Type.Boolean(),
    result: Civ7ProgressionTreeJsonValueSchema,
  },
  { additionalProperties: false }
);
export type Civ7ProgressionTreeValidationResult = Readonly<
  Static<typeof Civ7ProgressionTreeValidationResultSchema>
>;

/** Tree operation validation paired with the snapshot used to obtain it. */
export const Civ7ProgressionTreeCheckResultSchema = Type.Object(
  {
    valid: Type.Boolean(),
    result: Civ7ProgressionTreeJsonValueSchema,
    snapshot: Civ7ProgressionTreeSnapshotSchema,
  },
  { additionalProperties: false }
);
export type Civ7ProgressionTreeCheckResult = Readonly<
  Static<typeof Civ7ProgressionTreeCheckResultSchema>
>;

const validValidationSchema = Type.Object(
  {
    valid: Type.Literal(true),
    result: Civ7ProgressionTreeJsonValueSchema,
  },
  { additionalProperties: false }
);
const invalidValidationSchema = Type.Object(
  {
    valid: Type.Literal(false),
    result: Civ7ProgressionTreeJsonValueSchema,
  },
  { additionalProperties: false }
);

/** Dispatch evidence with fresh before-and-after tree observations. */
export const Civ7ProgressionTreeSendResultSchema = Type.Union([
  Type.Object(
    {
      sent: Type.Literal(true),
      validation: validValidationSchema,
      before: Civ7ProgressionTreeSnapshotSchema,
      after: Civ7ProgressionTreeSnapshotSchema,
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      sent: Type.Literal(false),
      validation: invalidValidationSchema,
      before: Civ7ProgressionTreeSnapshotSchema,
      after: Civ7ProgressionTreeSnapshotSchema,
    },
    { additionalProperties: false }
  ),
]);
export type Civ7ProgressionTreeSendResult = Readonly<
  Static<typeof Civ7ProgressionTreeSendResultSchema>
>;

/** Native chooser target-clear dispatch with surrounding tree observations. */
export const Civ7ProgressionTreeClearTargetResultSchema = Type.Object(
  {
    sent: Type.Literal(true),
    before: Civ7ProgressionTreeSnapshotSchema,
    after: Civ7ProgressionTreeSnapshotSchema,
  },
  { additionalProperties: false }
);
export type Civ7ProgressionTreeClearTargetResult = Readonly<
  Static<typeof Civ7ProgressionTreeClearTargetResultSchema>
>;

const sendEnvelopeSchema = Type.Union([
  Type.Object(
    {
      ok: Type.Literal(true),
      value: Civ7ProgressionTreeSendResultSchema,
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

const clearEnvelopeSchema = Type.Union([
  Type.Object(
    {
      ok: Type.Literal(true),
      value: Civ7ProgressionTreeClearTargetResultSchema,
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

/** Checks an ambient player's exact technology or culture choice operation. */
export async function checkCiv7ProgressionTreeChoice(
  input: Civ7ProgressionTreeNodeInput,
  options: Civ7DirectControlOptions = {}
): Promise<Civ7ProgressionTreeCheckResult> {
  return await runTreeCheck(
    "checkTreeChoice",
    "Civ7 progression tree choice check",
    input,
    options
  );
}

/** Sends an admitted technology or culture choice after a fresh strict check. */
export async function sendCiv7ProgressionTreeChoice(
  input: Civ7ProgressionTreeNodeSendInput,
  options: Civ7DirectControlOptions = {}
): Promise<Civ7ProgressionTreeSendResult> {
  return await runTreeSend("sendTreeChoice", "Civ7 progression tree choice send", input, options);
}

/** Checks an ambient player's exact technology or culture target operation. */
export async function checkCiv7ProgressionTreeTarget(
  input: Civ7ProgressionTreeNodeInput,
  options: Civ7DirectControlOptions = {}
): Promise<Civ7ProgressionTreeCheckResult> {
  return await runTreeCheck(
    "checkTreeTarget",
    "Civ7 progression tree target check",
    input,
    options
  );
}

/** Sends an admitted technology or culture target after a fresh strict check. */
export async function sendCiv7ProgressionTreeTarget(
  input: Civ7ProgressionTreeNodeSendInput,
  options: Civ7DirectControlOptions = {}
): Promise<Civ7ProgressionTreeSendResult> {
  return await runTreeSend("sendTreeTarget", "Civ7 progression tree target send", input, options);
}

/** Clears a guarded chooser target with the native runtime `NO_NODE` sequence. */
export async function clearCiv7ProgressionTreeTarget(
  input: Civ7ProgressionTreeClearTargetInput,
  options: Civ7DirectControlOptions = {}
): Promise<Civ7ProgressionTreeClearTargetResult> {
  const command = await executeCiv7AppUiCommand({
    ...options,
    command: buildTreeWireCommand("clearTreeTarget", input),
  });
  const envelope = schemaBodyFromCommandResult(
    command,
    "Civ7 progression tree target clear",
    clearEnvelopeSchema
  );
  if (envelope.ok) return envelope.value;
  throw new Civ7DirectControlError("command-failed", envelope.error, {
    details: command,
    dispatchStatus: envelope.gameplayDispatchStatus,
  });
}

type TreeCheckAtom = "checkTreeChoice" | "checkTreeTarget";
type TreeSendAtom = "sendTreeChoice" | "sendTreeTarget";
type TreeAtom = TreeCheckAtom | TreeSendAtom | "clearTreeTarget";

async function runTreeCheck(
  atom: TreeCheckAtom,
  label: string,
  input: Civ7ProgressionTreeNodeInput,
  options: Civ7DirectControlOptions
): Promise<Civ7ProgressionTreeCheckResult> {
  const command = await executeCiv7AppUiCommand({
    ...options,
    command: buildTreeWireCommand(atom, input),
  });
  return schemaBodyFromCommandResult(command, label, Civ7ProgressionTreeCheckResultSchema);
}

async function runTreeSend(
  atom: TreeSendAtom,
  label: string,
  input: Civ7ProgressionTreeNodeSendInput,
  options: Civ7DirectControlOptions
): Promise<Civ7ProgressionTreeSendResult> {
  const command = await executeCiv7AppUiCommand({
    ...options,
    command: buildTreeWireCommand(atom, input),
  });
  const envelope = schemaBodyFromCommandResult(command, label, sendEnvelopeSchema);
  if (envelope.ok) return envelope.value;
  throw new Civ7DirectControlError("command-failed", envelope.error, {
    details: command,
    dispatchStatus: envelope.gameplayDispatchStatus,
  });
}

function buildTreeWireCommand(
  atom: TreeAtom,
  input:
    | Civ7ProgressionTreeNodeInput
    | Civ7ProgressionTreeNodeSendInput
    | Civ7ProgressionTreeClearTargetInput
): string {
  try {
    if (input.kind !== "technology" && input.kind !== "culture") {
      throw new TypeError("kind must be technology or culture");
    }
    if (atom !== "clearTreeTarget" && !Number.isInteger((input as { node?: unknown }).node)) {
      throw new TypeError("node must be an integer");
    }
    const invocation =
      atom.startsWith("send") || atom === "clearTreeTarget"
        ? `${atom}Envelope(${jsLiteral(input)})`
        : `${atom}(${jsLiteral(input)})`;
    return `(() => {
    ${treeWireSource()}
    return JSON.stringify(${invocation});
  })()`;
  } catch (cause) {
    throw directControlErrorWithDispatchStatus(cause, "not-dispatched");
  }
}

function treeWireSource(): string {
  return `${probeHelperSource()}
    ${blockingNotificationObservationSource()}
    const immutableJson = (value, label) => {
      const serialized = JSON.stringify(value);
      if (serialized === undefined) throw new Error(label + " returned non-JSON evidence.");
      return JSON.parse(serialized);
    };
    const requireIntegerOrNull = (value, label) => {
      if (value == null) return null;
      if (!Number.isInteger(value)) throw new Error(label + " returned a non-integer value.");
      return value;
    };
    const requireTreeRuntime = (kind) => {
      const localPlayerId = globalThis.GameContext?.localPlayerID;
      if (!Number.isInteger(localPlayerId)) {
        throw new Error("GameContext.localPlayerID is unavailable.");
      }
      const noNode = globalThis.ProgressionTreeNodeTypes?.NO_NODE;
      if (!Number.isInteger(noNode)) {
        throw new Error("ProgressionTreeNodeTypes.NO_NODE is unavailable.");
      }
      if (typeof globalThis.Players?.get !== "function") {
        throw new Error("Players.get is unavailable.");
      }
      const player = globalThis.Players.get(localPlayerId);
      if (!player || typeof player !== "object") {
        throw new Error("The ambient local player is unavailable.");
      }
      const progression = kind === "technology" ? player.Techs : player.Culture;
      if (!progression || typeof progression.getTargetNode !== "function") {
        throw new Error("The local player progression target observation is unavailable.");
      }
      return { localPlayerId, noNode, player, progression };
    };
    const readActiveTreeNode = (localPlayerId, progression, kind) => {
      if (kind === "technology" && typeof progression.getResearching === "function") {
        return requireIntegerOrNull(
          progression.getResearching(),
          "Techs.getResearching"
        );
      }
      const treeType = kind === "technology"
        ? progression.getTreeType?.()
        : progression.getActiveTree?.();
      if (treeType == null) return null;
      if (typeof globalThis.Game?.ProgressionTrees?.getTree !== "function") {
        throw new Error("Game.ProgressionTrees.getTree is unavailable.");
      }
      const tree = globalThis.Game.ProgressionTrees.getTree(localPlayerId, treeType);
      const activeNodeIndex = tree?.activeNodeIndex;
      if (!Number.isInteger(activeNodeIndex) || activeNodeIndex < 0) return null;
      return requireIntegerOrNull(
        tree?.nodes?.[activeNodeIndex]?.nodeType,
        "Game.ProgressionTrees.getTree active node"
      );
    };
    const readTreeSnapshot = (kind) => {
      const runtime = requireTreeRuntime(kind);
      return {
        localPlayerId: runtime.localPlayerId,
        kind,
        currentNode: readActiveTreeNode(
          runtime.localPlayerId,
          runtime.progression,
          kind
        ),
        targetNode: requireIntegerOrNull(
          runtime.progression.getTargetNode(),
          kind + " getTargetNode"
        ),
        noNode: runtime.noNode,
        ...readBlockingNotificationEvidence(runtime.localPlayerId),
      };
    };
    const operationName = (kind, target) => {
      if (kind === "technology") {
        return target ? "SET_TECH_TREE_TARGET_NODE" : "SET_TECH_TREE_NODE";
      }
      return target ? "SET_CULTURE_TREE_TARGET_NODE" : "SET_CULTURE_TREE_NODE";
    };
    const requireOperation = (kind, target) => {
      const name = operationName(kind, target);
      const operationType = globalThis.PlayerOperationTypes?.[name];
      if (operationType === undefined) {
        throw new Error("PlayerOperationTypes." + name + " is unavailable.");
      }
      return operationType;
    };
    const strictValidation = (localPlayerId, operationType, node) => {
      const operations = globalThis.Game?.PlayerOperations;
      if (typeof operations?.canStart !== "function") {
        throw new Error("Game.PlayerOperations.canStart is unavailable.");
      }
      const args = { ProgressionTreeNodeType: node };
      const rawResult = operations.canStart(localPlayerId, operationType, args, false);
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
    const checkTreeOperation = (input, target) => {
      const snapshot = readTreeSnapshot(input.kind);
      const validation = strictValidation(
        snapshot.localPlayerId,
        requireOperation(input.kind, target),
        input.node
      );
      return { ...validation, snapshot };
    };
    const checkTreeChoice = (input) => checkTreeOperation(input, false);
    const checkTreeTarget = (input) => checkTreeOperation(input, true);
    const sameSnapshot = (left, right) =>
      left &&
      left.localPlayerId === right.localPlayerId &&
      left.kind === right.kind &&
      left.currentNode === right.currentNode &&
      left.targetNode === right.targetNode &&
      left.noNode === right.noNode &&
      JSON.stringify(left.blocker) === JSON.stringify(right.blocker) &&
      JSON.stringify(left.blockingNotification) ===
        JSON.stringify(right.blockingNotification);
    const sendTreeOperation = (input, target, markSendInvoked) => {
      const before = readTreeSnapshot(input.kind);
      if (!sameSnapshot(input.expected, before)) {
        throw new Error("Progression tree admission evidence changed before dispatch.");
      }
      const operationType = requireOperation(input.kind, target);
      const validation = strictValidation(before.localPlayerId, operationType, input.node);
      if (!validation.valid) {
        return {
          sent: false,
          validation,
          before,
          after: readTreeSnapshot(input.kind),
        };
      }
      const operations = globalThis.Game?.PlayerOperations;
      if (typeof operations?.sendRequest !== "function") {
        throw new Error("Game.PlayerOperations.sendRequest is unavailable.");
      }
      markSendInvoked();
      operations.sendRequest(
        before.localPlayerId,
        operationType,
        { ProgressionTreeNodeType: input.node }
      );
      return {
        sent: true,
        validation,
        before,
        after: readTreeSnapshot(input.kind),
      };
    };
    const sendTreeChoice = (input, markSendInvoked) =>
      sendTreeOperation(input, false, markSendInvoked);
    const sendTreeTarget = (input, markSendInvoked) =>
      sendTreeOperation(input, true, markSendInvoked);
    const clearTreeTarget = (input, markSendInvoked) => {
      const before = readTreeSnapshot(input.kind);
      if (!sameSnapshot(input.expected, before)) {
        throw new Error("Progression tree target-clear admission evidence changed before dispatch.");
      }
      const operationType = requireOperation(input.kind, true);
      const operations = globalThis.Game?.PlayerOperations;
      if (typeof operations?.sendRequest !== "function") {
        throw new Error("Game.PlayerOperations.sendRequest is unavailable.");
      }
      markSendInvoked();
      operations.sendRequest(
        before.localPlayerId,
        operationType,
        { ProgressionTreeNodeType: before.noNode }
      );
      return {
        sent: true,
        before,
        after: readTreeSnapshot(input.kind),
      };
    };
    const boundedWireError = (error) => {
      let message;
      try {
        message = typeof error?.message === "string" ? error.message : String(error);
      } catch {
        message = "Civ7 progression tree send failed.";
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
    const sendTreeChoiceEnvelope = (input) => sendEnvelope(sendTreeChoice, input);
    const sendTreeTargetEnvelope = (input) => sendEnvelope(sendTreeTarget, input);
    const clearTreeTargetEnvelope = (input) => sendEnvelope(clearTreeTarget, input);`;
}

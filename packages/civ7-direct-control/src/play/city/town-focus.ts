import { type Static, Type } from "typebox";

import {
  assertCiv7ComponentId,
  type Civ7ComponentId,
  Civ7ComponentIdSchema,
} from "../../civ7-component-id.js";
import {
  Civ7DirectControlError,
  directControlErrorWithDispatchStatus,
} from "../../direct-control-error.js";
import { jsLiteral } from "../../runtime/command-serialization.js";
import { Civ7RuntimeProbeSchema, probeHelperSource } from "../../runtime/probe.js";
import { schemaBodyFromCommandResult } from "../../session/command-result.js";
import { executeCiv7AppUiCommand } from "../../session/execute.js";
import type { Civ7DirectControlOptions } from "../../session/types.js";

const Civ7TownFocusJsonValueSchema = Type.Cyclic(
  {
    Civ7TownFocusJsonValue: Type.Union([
      Type.Null(),
      Type.Boolean(),
      Type.Number(),
      Type.String(),
      Type.Array(Type.Ref("Civ7TownFocusJsonValue")),
      Type.Record(Type.String(), Type.Ref("Civ7TownFocusJsonValue")),
    ]),
  },
  "Civ7TownFocusJsonValue"
);

export const Civ7TownFocusChangeInputSchema = Type.Object(
  {
    cityId: Civ7ComponentIdSchema,
    growthType: Type.Integer(),
    projectType: Type.Integer(),
  },
  { additionalProperties: false }
);
export type Civ7TownFocusChangeInput = Readonly<Static<typeof Civ7TownFocusChangeInputSchema>>;

export const Civ7TownFocusReviewInputSchema = Type.Object(
  {
    cityId: Civ7ComponentIdSchema,
  },
  { additionalProperties: false }
);
export type Civ7TownFocusReviewInput = Readonly<Static<typeof Civ7TownFocusReviewInputSchema>>;

const nullableComponentIdSchema = Type.Union([Civ7ComponentIdSchema, Type.Null()]);
const nullableNumberSchema = Type.Union([Type.Number(), Type.Null()]);
const nullableBooleanSchema = Type.Union([Type.Boolean(), Type.Null()]);
const nullableStringSchema = Type.Union([Type.String(), Type.Null()]);
const notificationTypeSchema = Type.Union([Type.Integer(), Type.String(), Type.Null()]);

const Civ7TownFocusCitySummarySchema = Type.Union([
  Type.Null(),
  Type.Object(
    {
      observedCityId: nullableComponentIdSchema,
      owner: nullableNumberSchema,
      isTown: nullableBooleanSchema,
      growthType: nullableNumberSchema,
      projectType: nullableNumberSchema,
    },
    { additionalProperties: false }
  ),
]);

const Civ7TownFocusBlockingNotificationSchema = Type.Union([
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

export const Civ7TownFocusSnapshotSchema = Type.Object(
  {
    cityId: Civ7ComponentIdSchema,
    city: Civ7RuntimeProbeSchema(Civ7TownFocusCitySummarySchema),
    blocker: Civ7RuntimeProbeSchema(notificationTypeSchema),
    blockingTownFocusNotification: Civ7RuntimeProbeSchema(Civ7TownFocusBlockingNotificationSchema),
  },
  { additionalProperties: false }
);
export type Civ7TownFocusSnapshot = Readonly<Static<typeof Civ7TownFocusSnapshotSchema>>;

export const Civ7TownFocusChangeValidationResultSchema = Type.Object(
  {
    valid: Type.Boolean(),
    result: Civ7TownFocusJsonValueSchema,
  },
  { additionalProperties: false }
);
export type Civ7TownFocusChangeValidationResult = Readonly<
  Static<typeof Civ7TownFocusChangeValidationResultSchema>
>;

export const Civ7TownFocusChangeCheckResultSchema = Type.Object(
  {
    valid: Type.Boolean(),
    result: Civ7TownFocusJsonValueSchema,
    snapshot: Civ7TownFocusSnapshotSchema,
  },
  { additionalProperties: false }
);
export type Civ7TownFocusChangeCheckResult = Readonly<
  Static<typeof Civ7TownFocusChangeCheckResultSchema>
>;

const Civ7TownFocusChangeValidValidationResultSchema = Type.Object(
  {
    valid: Type.Literal(true),
    result: Civ7TownFocusJsonValueSchema,
  },
  { additionalProperties: false }
);

const Civ7TownFocusChangeInvalidValidationResultSchema = Type.Object(
  {
    valid: Type.Literal(false),
    result: Civ7TownFocusJsonValueSchema,
  },
  { additionalProperties: false }
);

export const Civ7TownFocusChangeSendResultSchema = Type.Union([
  Type.Object(
    {
      sent: Type.Literal(true),
      validation: Civ7TownFocusChangeValidValidationResultSchema,
      before: Civ7TownFocusSnapshotSchema,
      after: Civ7TownFocusSnapshotSchema,
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      sent: Type.Literal(false),
      validation: Civ7TownFocusChangeInvalidValidationResultSchema,
      before: Civ7TownFocusSnapshotSchema,
      after: Civ7TownFocusSnapshotSchema,
    },
    { additionalProperties: false }
  ),
]);
export type Civ7TownFocusChangeSendResult = Readonly<
  Static<typeof Civ7TownFocusChangeSendResultSchema>
>;

export const Civ7TownFocusReviewCheckResultSchema = Type.Object(
  {
    snapshot: Civ7TownFocusSnapshotSchema,
  },
  { additionalProperties: false }
);
export type Civ7TownFocusReviewCheckResult = Readonly<
  Static<typeof Civ7TownFocusReviewCheckResultSchema>
>;

export const Civ7TownFocusReviewSendResultSchema = Type.Object(
  {
    sent: Type.Literal(true),
    before: Civ7TownFocusSnapshotSchema,
    after: Civ7TownFocusSnapshotSchema,
  },
  { additionalProperties: false }
);
export type Civ7TownFocusReviewSendResult = Readonly<
  Static<typeof Civ7TownFocusReviewSendResultSchema>
>;

const Civ7TownFocusChangeSendEnvelopeSchema = Type.Union([
  Type.Object(
    {
      ok: Type.Literal(true),
      value: Civ7TownFocusChangeSendResultSchema,
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

const Civ7TownFocusReviewSendEnvelopeSchema = Type.Union([
  Type.Object(
    {
      ok: Type.Literal(true),
      value: Civ7TownFocusReviewSendResultSchema,
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

export async function checkCiv7TownFocusChange(
  input: Civ7TownFocusChangeInput,
  options: Civ7DirectControlOptions = {}
): Promise<Civ7TownFocusChangeCheckResult> {
  const command = await executeCiv7AppUiCommand({
    ...options,
    command: buildTownFocusChangeWireCommand("checkTownFocusChange", input),
  });
  return schemaBodyFromCommandResult(
    command,
    "Civ7 town focus change check",
    Civ7TownFocusChangeCheckResultSchema
  );
}

export async function sendCiv7TownFocusChange(
  input: Civ7TownFocusChangeInput,
  options: Civ7DirectControlOptions = {}
): Promise<Civ7TownFocusChangeSendResult> {
  const command = await executeCiv7AppUiCommand({
    ...options,
    command: buildTownFocusChangeWireCommand("sendTownFocusChange", input),
  });
  const envelope = schemaBodyFromCommandResult(
    command,
    "Civ7 town focus change send",
    Civ7TownFocusChangeSendEnvelopeSchema
  );
  if (envelope.ok) return envelope.value;
  throw new Civ7DirectControlError("command-failed", envelope.error, {
    details: command,
    dispatchStatus: envelope.gameplayDispatchStatus,
  });
}

export async function checkCiv7TownFocusReview(
  input: Civ7TownFocusReviewInput,
  options: Civ7DirectControlOptions = {}
): Promise<Civ7TownFocusReviewCheckResult> {
  const command = await executeCiv7AppUiCommand({
    ...options,
    command: buildTownFocusReviewWireCommand("checkTownFocusReview", input),
  });
  return schemaBodyFromCommandResult(
    command,
    "Civ7 town focus review check",
    Civ7TownFocusReviewCheckResultSchema
  );
}

export async function sendCiv7TownFocusReview(
  input: Civ7TownFocusReviewInput,
  options: Civ7DirectControlOptions = {}
): Promise<Civ7TownFocusReviewSendResult> {
  const command = await executeCiv7AppUiCommand({
    ...options,
    command: buildTownFocusReviewWireCommand("sendTownFocusReview", input),
  });
  const envelope = schemaBodyFromCommandResult(
    command,
    "Civ7 town focus review send",
    Civ7TownFocusReviewSendEnvelopeSchema
  );
  if (envelope.ok) return envelope.value;
  throw new Civ7DirectControlError("command-failed", envelope.error, {
    details: command,
    dispatchStatus: envelope.gameplayDispatchStatus,
  });
}

type TownFocusChangeWireInput = Readonly<{
  cityId: Civ7ComponentId;
  args: Readonly<{
    Type: number;
    ProjectType: number;
    City: number;
  }>;
}>;

function buildTownFocusChangeWireCommand(
  atom: "checkTownFocusChange" | "sendTownFocusChange",
  input: Civ7TownFocusChangeInput
): string {
  try {
    const wireInput = townFocusChangeWireInput(input);
    const invocation =
      atom === "sendTownFocusChange"
        ? `sendTownFocusChangeEnvelope(${jsLiteral(wireInput)})`
        : `checkTownFocusChange(${jsLiteral(wireInput)})`;
    return `(() => {
    ${townFocusWireSource()}
    return JSON.stringify(${invocation});
  })()`;
  } catch (cause) {
    throw directControlErrorWithDispatchStatus(cause, "not-dispatched");
  }
}

function buildTownFocusReviewWireCommand(
  atom: "checkTownFocusReview" | "sendTownFocusReview",
  input: Civ7TownFocusReviewInput
): string {
  try {
    const wireInput = {
      cityId: assertCiv7ComponentId(input.cityId, "cityId"),
    };
    const invocation =
      atom === "sendTownFocusReview"
        ? `sendTownFocusReviewEnvelope(${jsLiteral(wireInput)})`
        : `checkTownFocusReview(${jsLiteral(wireInput)})`;
    return `(() => {
    ${townFocusWireSource()}
    return JSON.stringify(${invocation});
  })()`;
  } catch (cause) {
    throw directControlErrorWithDispatchStatus(cause, "not-dispatched");
  }
}

function townFocusChangeWireInput(input: Civ7TownFocusChangeInput): TownFocusChangeWireInput {
  const cityId = assertCiv7ComponentId(input.cityId, "cityId");
  if (!Number.isInteger(input.growthType)) {
    throw new TypeError("growthType must be an integer");
  }
  if (!Number.isInteger(input.projectType)) {
    throw new TypeError("projectType must be an integer");
  }
  return {
    cityId,
    args: {
      Type: input.growthType,
      ProjectType: input.projectType,
      City: cityId.id,
    },
  };
}

function townFocusWireSource(): string {
  return `${probeHelperSource()}
    const readNumericField = (value, lowerKey, upperKey) => {
      if (!value || typeof value !== "object") return null;
      if (typeof value[lowerKey] === "number" && Number.isFinite(value[lowerKey])) {
        return value[lowerKey];
      }
      if (typeof value[upperKey] === "number" && Number.isFinite(value[upperKey])) {
        return value[upperKey];
      }
      return null;
    };
    const toComponentId = (value) => {
      if (!value || typeof value !== "object") return null;
      const owner = readNumericField(value, "owner", "Owner");
      const id = readNumericField(value, "id", "ID");
      if (owner == null || id == null) return null;
      const out = { owner, id };
      const type = readNumericField(value, "type", "Type");
      if (type != null) out.type = type;
      return out;
    };
    const primitiveNumber = (value) =>
      typeof value === "number" && Number.isFinite(value) ? value : null;
    const nullableBoolean = (value) => typeof value === "boolean" ? value : null;
    const nullableString = (value) => typeof value === "string" ? value : null;
    const notificationType = (value) =>
      typeof value === "string" || Number.isInteger(value) ? value : null;
    const notificationValue = (notification, names) => {
      for (const name of names) {
        try {
          if (
            notification &&
            (typeof notification === "object" || typeof notification === "function") &&
            name in notification
          ) {
            const value = notification[name];
            return typeof value === "function" ? value.call(notification) : value;
          }
          const getter = "get" + name;
          if (typeof notification?.[getter] === "function") return notification[getter]();
        } catch {}
      }
      return null;
    };
    const summarizeCity = (cityId) => {
      const city = globalThis.Cities?.get?.(cityId);
      if (!city) return null;
      const observedCityId = toComponentId(city.id ?? city.ID);
      const growth = city.Growth ?? city.growth ?? null;
      return {
        observedCityId,
        owner: primitiveNumber(city.owner ?? city.Owner ?? observedCityId?.owner),
        isTown: nullableBoolean(city.isTown ?? city.IsTown),
        growthType: primitiveNumber(growth?.growthType ?? growth?.GrowthType),
        projectType: primitiveNumber(growth?.projectType ?? growth?.ProjectType),
      };
    };
    const readBlockingTownFocusNotification = () => {
      const notifications = globalThis.Game?.Notifications;
      const localPlayerId = globalThis.GameContext?.localPlayerID;
      if (localPlayerId == null) throw new Error("GameContext.localPlayerID is unavailable.");
      if (typeof notifications?.getEndTurnBlockingType !== "function") {
        throw new Error("Game.Notifications.getEndTurnBlockingType is unavailable.");
      }
      if (typeof notifications.findEndTurnBlocking !== "function") {
        throw new Error("Game.Notifications.findEndTurnBlocking is unavailable.");
      }
      const blockerType = notifications.getEndTurnBlockingType(localPlayerId);
      const blockerId = notifications.findEndTurnBlocking(localPlayerId, blockerType);
      if (blockerId == null) return null;
      const id = toComponentId(blockerId);
      if (!id) {
        throw new Error("Game.Notifications.findEndTurnBlocking returned an invalid ComponentID.");
      }
      const notification = typeof notifications.find === "function"
        ? notifications.find(id)
        : null;
      const type = notificationType(typeof notifications.getType === "function"
        ? notifications.getType(id)
        : notificationValue(notification, ["Type", "type"]));
      const typeName = nullableString(typeof notifications.getTypeName === "function"
        ? notifications.getTypeName(type)
        : notificationValue(notification, ["TypeName", "typeName"]));
      const target = toComponentId(notificationValue(notification, ["Target", "target"]));
      return {
        id,
        type,
        typeName,
        target,
      };
    };
    const readTownFocusSnapshot = (input) => {
      const cityId = toComponentId(input.cityId);
      return {
        cityId,
        city: probe(() => summarizeCity(cityId)),
        blocker: probe(() => {
          const notifications = globalThis.Game?.Notifications;
          const localPlayerId = globalThis.GameContext?.localPlayerID;
          if (localPlayerId == null) throw new Error("GameContext.localPlayerID is unavailable.");
          if (typeof notifications?.getEndTurnBlockingType !== "function") {
            throw new Error("Game.Notifications.getEndTurnBlockingType is unavailable.");
          }
          return notificationType(notifications.getEndTurnBlockingType(localPlayerId));
        }),
        blockingTownFocusNotification: probe(readBlockingTownFocusNotification),
      };
    };
    const successFromCanStart = (result) => {
      if (typeof result === "boolean") return result;
      if (result !== null && typeof result === "object" && !Array.isArray(result)) {
        for (const key of ["Success", "success", "canStart"]) {
          if (key in result) {
            if (typeof result[key] === "boolean") return result[key];
            throw new Error("Game.CityCommands.canStart returned a non-boolean " + key + " field.");
          }
        }
      }
      throw new Error("Game.CityCommands.canStart returned an unrecognized result.");
    };
    const snapshotJsonEvidence = (result) => {
      const serialized = JSON.stringify(result);
      if (serialized === undefined) {
        throw new Error("Game.CityCommands.canStart returned non-JSON evidence.");
      }
      return JSON.parse(serialized);
    };
    const townFocusChangeCommandType = () => {
      const commandType = globalThis.CityCommandTypes?.CHANGE_GROWTH_MODE;
      if (commandType === undefined) {
        throw new Error("CityCommandTypes.CHANGE_GROWTH_MODE is unavailable.");
      }
      return commandType;
    };
    const townFocusReviewOperationType = () => {
      const operationType = globalThis.CityOperationTypes?.CONSIDER_TOWN_PROJECT;
      if (operationType === undefined) {
        throw new Error("CityOperationTypes.CONSIDER_TOWN_PROJECT is unavailable.");
      }
      return operationType;
    };
    const checkTownFocusChangeValidation = (input) => {
      const commandType = townFocusChangeCommandType();
      const rawResult = globalThis.Game.CityCommands.canStart(
        input.cityId,
        commandType,
        input.args,
        false
      );
      return {
        valid: successFromCanStart(rawResult),
        result: snapshotJsonEvidence(rawResult),
      };
    };
    const checkTownFocusChange = (input) => {
      const validation = checkTownFocusChangeValidation(input);
      return {
        valid: validation.valid,
        result: validation.result,
        snapshot: readTownFocusSnapshot(input),
      };
    };
    const sendTownFocusChange = (input, markSendInvoked) => {
      const before = readTownFocusSnapshot(input);
      const validation = checkTownFocusChangeValidation(input);
      if (!validation.valid) {
        return {
          sent: false,
          validation,
          before,
          after: readTownFocusSnapshot(input),
        };
      }
      const commands = globalThis.Game?.CityCommands;
      if (typeof commands?.sendRequest !== "function") {
        throw new Error("Game.CityCommands.sendRequest is unavailable.");
      }
      const commandType = townFocusChangeCommandType();
      markSendInvoked();
      commands.sendRequest(input.cityId, commandType, input.args);
      return {
        sent: true,
        validation,
        before,
        after: readTownFocusSnapshot(input),
      };
    };
    const checkTownFocusReview = (input) => ({
      snapshot: readTownFocusSnapshot(input),
    });
    const sendTownFocusReview = (input, markSendInvoked) => {
      const before = readTownFocusSnapshot(input);
      const operations = globalThis.Game?.CityOperations;
      if (typeof operations?.sendRequest !== "function") {
        throw new Error("Game.CityOperations.sendRequest is unavailable.");
      }
      const operationType = townFocusReviewOperationType();
      markSendInvoked();
      operations.sendRequest(input.cityId, operationType, {});
      return {
        sent: true,
        before,
        after: readTownFocusSnapshot(input),
      };
    };
    const boundedWireError = (error) => {
      let message;
      try {
        message = typeof error?.message === "string" ? error.message : String(error);
      } catch {
        message = "Civ7 town focus send failed.";
      }
      return message.slice(0, 512);
    };
    const sendTownFocusChangeEnvelope = (input) => {
      let sendInvoked = false;
      try {
        return {
          ok: true,
          value: sendTownFocusChange(input, () => {
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
    const sendTownFocusReviewEnvelope = (input) => {
      let sendInvoked = false;
      try {
        return {
          ok: true,
          value: sendTownFocusReview(input, () => {
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

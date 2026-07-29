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

const Civ7ProductionChoiceArgsSchema = Type.Union([
  Type.Object(
    {
      UnitType: Type.Integer(),
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      ProjectType: Type.Integer(),
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      ConstructibleType: Type.Integer(),
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      ConstructibleType: Type.Integer(),
      X: Type.Integer(),
      Y: Type.Integer(),
    },
    { additionalProperties: false }
  ),
]);

const Civ7ProductionJsonValueSchema = Type.Cyclic(
  {
    Civ7ProductionJsonValue: Type.Union([
      Type.Null(),
      Type.Boolean(),
      Type.Number(),
      Type.String(),
      Type.Array(Type.Ref("Civ7ProductionJsonValue")),
      Type.Record(Type.String(), Type.Ref("Civ7ProductionJsonValue")),
    ]),
  },
  "Civ7ProductionJsonValue"
);

export const Civ7ProductionChoiceInputSchema = Type.Object(
  {
    cityId: Civ7ComponentIdSchema,
    args: Civ7ProductionChoiceArgsSchema,
  },
  { additionalProperties: false }
);
export type Civ7ProductionChoiceInput = Readonly<Static<typeof Civ7ProductionChoiceInputSchema>>;

export const Civ7ProductionChoiceValidationResultSchema = Type.Object(
  {
    valid: Type.Boolean(),
    result: Civ7ProductionJsonValueSchema,
  },
  { additionalProperties: false }
);
export type Civ7ProductionChoiceValidationResult = Readonly<
  Static<typeof Civ7ProductionChoiceValidationResultSchema>
>;

const nullableComponentIdSchema = Type.Union([Civ7ComponentIdSchema, Type.Null()]);
const nullableNumberSchema = Type.Union([Type.Number(), Type.Null()]);
const nullableIntegerSchema = Type.Union([Type.Integer(), Type.Null()]);
const nullableStringSchema = Type.Union([Type.String(), Type.Null()]);
const notificationTypeSchema = Type.Union([Type.Integer(), Type.String(), Type.Null()]);

const Civ7ProductionCitySummarySchema = Type.Union([
  Type.Null(),
  Type.Object(
    {
      id: Civ7ComponentIdSchema,
      observedCityId: nullableComponentIdSchema,
    },
    { additionalProperties: false }
  ),
]);

const Civ7ProductionBuildQueueSummarySchema = Type.Union([
  Type.Null(),
  Type.Object(
    {
      currentProductionTypeHash: nullableNumberSchema,
      previousProductionTypeHash: nullableNumberSchema,
      productionProgress: nullableNumberSchema,
      turnsLeftForRequestedItem: nullableNumberSchema,
      queueLength: nullableIntegerSchema,
    },
    { additionalProperties: false }
  ),
]);

const Civ7ProductionBlockingNotificationSchema = Type.Union([
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

export const Civ7ProductionChoiceSnapshotSchema = Type.Object(
  {
    cityId: Civ7ComponentIdSchema,
    city: Civ7RuntimeProbeSchema(Civ7ProductionCitySummarySchema),
    buildQueue: Civ7RuntimeProbeSchema(Civ7ProductionBuildQueueSummarySchema),
    blocker: Civ7RuntimeProbeSchema(notificationTypeSchema),
    blockingProductionNotification: Civ7RuntimeProbeSchema(
      Civ7ProductionBlockingNotificationSchema
    ),
  },
  { additionalProperties: false }
);
export type Civ7ProductionChoiceSnapshot = Readonly<
  Static<typeof Civ7ProductionChoiceSnapshotSchema>
>;

export const Civ7ProductionChoiceCheckResultSchema = Type.Object(
  {
    valid: Type.Boolean(),
    result: Civ7ProductionJsonValueSchema,
    snapshot: Civ7ProductionChoiceSnapshotSchema,
  },
  { additionalProperties: false }
);
export type Civ7ProductionChoiceCheckResult = Readonly<
  Static<typeof Civ7ProductionChoiceCheckResultSchema>
>;

const Civ7ProductionChoiceValidValidationResultSchema = Type.Object(
  {
    valid: Type.Literal(true),
    result: Civ7ProductionJsonValueSchema,
  },
  { additionalProperties: false }
);

const Civ7ProductionChoiceInvalidValidationResultSchema = Type.Object(
  {
    valid: Type.Literal(false),
    result: Civ7ProductionJsonValueSchema,
  },
  { additionalProperties: false }
);

export const Civ7ProductionChoiceSendResultSchema = Type.Union([
  Type.Object(
    {
      sent: Type.Literal(true),
      validation: Civ7ProductionChoiceValidValidationResultSchema,
      before: Civ7ProductionChoiceSnapshotSchema,
      after: Civ7ProductionChoiceSnapshotSchema,
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      sent: Type.Literal(false),
      validation: Civ7ProductionChoiceInvalidValidationResultSchema,
      before: Civ7ProductionChoiceSnapshotSchema,
      after: Civ7ProductionChoiceSnapshotSchema,
    },
    { additionalProperties: false }
  ),
]);
export type Civ7ProductionChoiceSendResult = Readonly<
  Static<typeof Civ7ProductionChoiceSendResultSchema>
>;

const Civ7ProductionChoiceSendEnvelopeSchema = Type.Union([
  Type.Object(
    {
      ok: Type.Literal(true),
      value: Civ7ProductionChoiceSendResultSchema,
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

export async function checkCiv7ProductionChoice(
  input: Civ7ProductionChoiceInput,
  options: Civ7DirectControlOptions = {}
): Promise<Civ7ProductionChoiceCheckResult> {
  const command = await executeCiv7AppUiCommand({
    ...options,
    command: buildProductionChoiceWireCommandWithEvidence("checkProductionChoice", input),
  });
  return schemaBodyFromCommandResult(
    command,
    "Civ7 production choice check",
    Civ7ProductionChoiceCheckResultSchema
  );
}

export async function sendCiv7ProductionChoice(
  input: Civ7ProductionChoiceInput,
  options: Civ7DirectControlOptions = {}
): Promise<Civ7ProductionChoiceSendResult> {
  const command = await executeCiv7AppUiCommand({
    ...options,
    command: buildProductionChoiceWireCommandWithEvidence("sendProductionChoice", input),
  });
  const envelope = schemaBodyFromCommandResult(
    command,
    "Civ7 production choice send",
    Civ7ProductionChoiceSendEnvelopeSchema
  );
  if (envelope.ok) return envelope.value;
  throw new Civ7DirectControlError("command-failed", envelope.error, {
    details: command,
    dispatchStatus: envelope.gameplayDispatchStatus,
  });
}

function buildProductionChoiceWireCommandWithEvidence(
  atom: "checkProductionChoice" | "sendProductionChoice",
  input: Civ7ProductionChoiceInput
): string {
  try {
    const wireInput = productionChoiceWireInput(input);
    const invocation =
      atom === "sendProductionChoice"
        ? `sendProductionChoiceEnvelope(${jsLiteral(wireInput)})`
        : `checkProductionChoice(${jsLiteral(wireInput)})`;
    return `(() => {
    ${productionChoiceWireSource()}
    return JSON.stringify(${invocation});
  })()`;
  } catch (cause) {
    throw directControlErrorWithDispatchStatus(cause, "not-dispatched");
  }
}

function productionChoiceWireInput(input: Civ7ProductionChoiceInput): Civ7ProductionChoiceInput {
  const cityId = assertCiv7ComponentId(input.cityId, "cityId");
  validateProductionChoiceArgs(input.args);
  return {
    cityId,
    args: input.args,
  };
}

function validateProductionChoiceArgs(input: unknown): void {
  if (input == null || typeof input !== "object" || Array.isArray(input)) {
    throw new TypeError("production choice args must be an object");
  }
  const args = input as Readonly<Record<string, unknown>>;
  const itemKeys = ["UnitType", "ConstructibleType", "ProjectType"] as const;
  const presentItems = itemKeys.filter((key) => Object.prototype.hasOwnProperty.call(args, key));
  if (presentItems.length !== 1 || !Number.isInteger(args[presentItems[0]!])) {
    throw new TypeError(
      "production choice requires exactly one UnitType, ConstructibleType, or ProjectType"
    );
  }
  const allowedKeys = new Set<string>([...itemKeys, "X", "Y"]);
  if (Object.keys(args).some((key) => !allowedKeys.has(key))) {
    throw new TypeError("production choice args contain an unsupported field");
  }
  const hasX = Object.prototype.hasOwnProperty.call(args, "X");
  const hasY = Object.prototype.hasOwnProperty.call(args, "Y");
  if (hasX !== hasY || (hasX && (!Number.isInteger(args.X) || !Number.isInteger(args.Y)))) {
    throw new TypeError("production placement coordinates require integer X and Y");
  }
  if (hasX && presentItems[0] !== "ConstructibleType") {
    throw new TypeError(
      "production placement coordinates are only valid for ConstructibleType choices"
    );
  }
}

function productionChoiceWireSource(): string {
  return `${probeHelperSource()}
    const readNumericField = (value, lowerKey, upperKey) => {
      if (!value || typeof value !== "object") return null;
      if (typeof value[lowerKey] === "number") return value[lowerKey];
      if (typeof value[upperKey] === "number") return value[upperKey];
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
    const notificationType = (value) =>
      typeof value === "string" || Number.isInteger(value) ? value : null;
    const nullableString = (value) => typeof value === "string" ? value : null;
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
      return {
        id: cityId,
        observedCityId: toComponentId(city.id ?? city.ID),
      };
    };
    const summarizeBuildQueue = (cityId, args) => {
      const city = globalThis.Cities?.get?.(cityId);
      const buildQueue = city?.BuildQueue ?? city?.buildQueue ?? city?.buildQueueManager ?? null;
      if (!buildQueue) return null;
      return {
        currentProductionTypeHash: (() => {
          try {
            return primitiveNumber(typeof buildQueue.getCurrentProductionTypeHash === "function"
              ? buildQueue.getCurrentProductionTypeHash()
              : buildQueue.currentProductionTypeHash ?? buildQueue.currentProductionType ?? null);
          } catch {
            return primitiveNumber(buildQueue.currentProductionTypeHash ?? buildQueue.currentProductionType ?? null);
          }
        })(),
        previousProductionTypeHash: (() => {
          try {
            return primitiveNumber(typeof buildQueue.getPreviousProductionTypeHash === "function"
              ? buildQueue.getPreviousProductionTypeHash()
              : buildQueue.previousProductionTypeHash ?? buildQueue.previousProductionType ?? null);
          } catch {
            return primitiveNumber(buildQueue.previousProductionTypeHash ?? buildQueue.previousProductionType ?? null);
          }
        })(),
        productionProgress: (() => {
          try {
            return primitiveNumber(typeof buildQueue.getProductionProgress === "function"
              ? buildQueue.getProductionProgress()
              : buildQueue.productionProgress ?? buildQueue.progress ?? null);
          } catch {
            return primitiveNumber(buildQueue.productionProgress ?? buildQueue.progress ?? null);
          }
        })(),
        turnsLeftForRequestedItem: (() => {
          try {
            const requestedType = args?.UnitType ?? args?.ConstructibleType ?? args?.ProjectType ?? null;
            return primitiveNumber(requestedType == null || typeof buildQueue.getTurnsLeft !== "function"
              ? null
              : buildQueue.getTurnsLeft(requestedType));
          } catch {
            return null;
          }
        })(),
        queueLength: (() => {
          try {
            const length = typeof buildQueue.getQueue === "function"
              ? buildQueue.getQueue()?.length ?? null
              : null;
            return Number.isInteger(length) ? length : null;
          } catch {
            return null;
          }
        })(),
      };
    };
    const readProductionChoiceSnapshot = (input) => {
      const cityId = toComponentId(input.cityId);
      return {
        cityId,
        city: probe(() => summarizeCity(cityId)),
        buildQueue: probe(() => summarizeBuildQueue(cityId, input.args)),
        blocker: probe(() => {
          const notifications = globalThis.Game?.Notifications;
          const localPlayerId = globalThis.GameContext?.localPlayerID;
          if (localPlayerId == null) throw new Error("GameContext.localPlayerID is unavailable.");
          if (typeof notifications?.getEndTurnBlockingType !== "function") {
            throw new Error("Game.Notifications.getEndTurnBlockingType is unavailable.");
          }
          return notificationType(notifications.getEndTurnBlockingType(localPlayerId));
        }),
        blockingProductionNotification: probe(() => {
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
        }),
      };
    };
    const validateProductionChoiceArgs = (args) => {
      if (!args || typeof args !== "object" || Array.isArray(args)) {
        throw new Error("Production choice args must be an object.");
      }
      const itemKeys = ["UnitType", "ConstructibleType", "ProjectType"];
      const presentItems = itemKeys.filter((key) =>
        Object.prototype.hasOwnProperty.call(args, key)
      );
      if (presentItems.length !== 1 || !Number.isInteger(args[presentItems[0]])) {
        throw new Error("Production choice requires exactly one UnitType, ConstructibleType, or ProjectType.");
      }
      const allowedKeys = new Set([...itemKeys, "X", "Y"]);
      if (Object.keys(args).some((key) => !allowedKeys.has(key))) {
        throw new Error("Production choice args contain an unsupported field.");
      }
      const hasX = Object.prototype.hasOwnProperty.call(args, "X");
      const hasY = Object.prototype.hasOwnProperty.call(args, "Y");
      if (hasX !== hasY || (hasX && (!Number.isInteger(args.X) || !Number.isInteger(args.Y)))) {
        throw new Error("Production placement coordinates require integer X and Y.");
      }
      if (hasX && presentItems[0] !== "ConstructibleType") {
        throw new Error("Production placement coordinates are only valid for ConstructibleType choices.");
      }
    };
    const successFromCanStart = (result) => {
      if (typeof result === "boolean") return result;
      if (result !== null && typeof result === "object" && !Array.isArray(result)) {
        for (const key of ["Success", "success", "canStart"]) {
          if (key in result) {
            if (typeof result[key] === "boolean") return result[key];
            throw new Error("Game.CityOperations.canStart returned a non-boolean " + key + " field.");
          }
        }
      }
      throw new Error("Game.CityOperations.canStart returned an unrecognized result.");
    };
    const snapshotJsonEvidence = (result) => {
      const serialized = JSON.stringify(result);
      if (serialized === undefined) {
        throw new Error("Game.CityOperations.canStart returned non-JSON evidence.");
      }
      return JSON.parse(serialized);
    };
    const checkProductionChoiceValidation = (input) => {
      const rawResult = globalThis.Game.CityOperations.canStart(
        input.cityId,
        globalThis.CityOperationTypes.BUILD,
        input.args,
        false
      );
      return {
        valid: successFromCanStart(rawResult),
        rawResult,
        result: snapshotJsonEvidence(rawResult),
      };
    };
    const productionSendArgs = (input, canStartResult) => {
      const args = { ...input.args };
      if (
        Number.isInteger(args.ConstructibleType) &&
        args.X === undefined &&
        args.Y === undefined
      ) {
        if (
          canStartResult === null ||
          typeof canStartResult !== "object" ||
          canStartResult.InProgress !== true ||
          !Array.isArray(canStartResult.Plots) ||
          canStartResult.Plots.length === 0
        ) {
          throw new Error("Constructible production requires an InProgress validation plot.");
        }
        const plotIndex = canStartResult.Plots[0];
        if (!Number.isInteger(plotIndex)) {
          throw new Error("Constructible production requires an integer validation plot.");
        }
        if (typeof globalThis.GameplayMap?.getLocationFromIndex !== "function") {
          throw new Error("GameplayMap.getLocationFromIndex is unavailable.");
        }
        const location = globalThis.GameplayMap.getLocationFromIndex(plotIndex);
        if (!Number.isInteger(location?.x) || !Number.isInteger(location?.y)) {
          throw new Error("Constructible production validation plot has no integer coordinates.");
        }
        args.X = location.x;
        args.Y = location.y;
      }
      if (Number.isInteger(args.ProjectType)) {
        if (typeof globalThis.Cities?.get !== "function") {
          throw new Error("Cities.get is unavailable for ProjectType production.");
        }
        const city = globalThis.Cities.get(input.cityId);
        if (!city || typeof city !== "object" || typeof city.isTown !== "boolean") {
          throw new Error("ProjectType production requires a known city or town state.");
        }
        if (city.isTown !== true) return args;
        if (!Number.isInteger(globalThis.CityOperationsParametersValues?.Exclusive)) {
          throw new Error("Town ProjectType production requires Exclusive insert mode.");
        }
        args.InsertMode = globalThis.CityOperationsParametersValues.Exclusive;
      }
      return args;
    };
    const checkProductionChoice = (input) => {
      validateProductionChoiceArgs(input.args);
      const validation = checkProductionChoiceValidation(input);
      let adaptationAvailable = true;
      if (validation.valid) {
        try {
          productionSendArgs(input, validation.rawResult);
        } catch {
          adaptationAvailable = false;
        }
      }
      return {
        valid: validation.valid && adaptationAvailable,
        result: validation.result,
        snapshot: readProductionChoiceSnapshot(input),
      };
    };
    const sendProductionChoice = (input, markSendInvoked) => {
      validateProductionChoiceArgs(input.args);
      const before = readProductionChoiceSnapshot(input);
      const validation = checkProductionChoiceValidation(input);
      if (!validation.valid) {
        return {
          sent: false,
          validation: {
            valid: validation.valid,
            result: validation.result,
          },
          before,
          after: readProductionChoiceSnapshot(input),
        };
      }
      const args = productionSendArgs(input, validation.rawResult);
      if (typeof globalThis.Game?.CityOperations?.sendRequest !== "function") {
        throw new Error("Game.CityOperations.sendRequest is unavailable.");
      }
      markSendInvoked();
      globalThis.Game.CityOperations.sendRequest(
        input.cityId,
        globalThis.CityOperationTypes.BUILD,
        args
      );
      return {
        sent: true,
        validation: {
          valid: validation.valid,
          result: validation.result,
        },
        before,
        after: readProductionChoiceSnapshot({ ...input, args }),
      };
    };
    const boundedWireError = (error) => {
      let message;
      try {
        message = typeof error?.message === "string" ? error.message : String(error);
      } catch {
        message = "Civ7 production choice send failed.";
      }
      return message.slice(0, 512);
    };
    const sendProductionChoiceEnvelope = (input) => {
      let sendInvoked = false;
      try {
        return {
          ok: true,
          value: sendProductionChoice(input, () => {
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

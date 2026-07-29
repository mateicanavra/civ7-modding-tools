import { type Static, Type } from "typebox";

import { assertCiv7ComponentId, Civ7ComponentIdSchema } from "../../civ7-component-id.js";
import {
  Civ7DirectControlError,
  directControlErrorWithDispatchStatus,
} from "../../direct-control-error.js";
import { jsLiteral } from "../../runtime/command-serialization.js";
import { schemaBodyFromCommandResult } from "../../session/command-result.js";
import { executeCiv7AppUiCommand } from "../../session/execute.js";
import type { Civ7DirectControlOptions } from "../../session/types.js";
import { boundedInteger } from "../../validation.js";
import { Civ7MapLocationSchema } from "../map/types.js";
import { validateMapLocation } from "../map/validation.js";

const Civ7PopulationJsonValueSchema = Type.Cyclic(
  {
    Civ7PopulationJsonValue: Type.Union([
      Type.Null(),
      Type.Boolean(),
      Type.Number(),
      Type.String(),
      Type.Array(Type.Ref("Civ7PopulationJsonValue")),
      Type.Record(Type.String(), Type.Ref("Civ7PopulationJsonValue")),
    ]),
  },
  "Civ7PopulationJsonValue"
);

const nullableComponentIdSchema = Type.Union([Civ7ComponentIdSchema, Type.Null()]);
const nullableBooleanSchema = Type.Union([Type.Boolean(), Type.Null()]);
const nullableIntegerSchema = Type.Union([Type.Integer(), Type.Null()]);

export const Civ7WorkerAssignmentInputSchema = Type.Object(
  {
    location: Type.Integer({ minimum: 0, maximum: 1_000_000 }),
  },
  { additionalProperties: false }
);
export type Civ7WorkerAssignmentInput = Readonly<Static<typeof Civ7WorkerAssignmentInputSchema>>;

export const Civ7WorkerAssignmentSnapshotSchema = Type.Object(
  {
    localPlayerId: Type.Integer(),
    location: Type.Integer(),
    readyCityIds: Type.Array(Civ7ComponentIdSchema),
    candidateCityId: nullableComponentIdSchema,
    isReadyToPlacePopulation: nullableBooleanSchema,
    placementInfo: Type.Union([Civ7PopulationJsonValueSchema, Type.Null()]),
    numWorkers: nullableIntegerSchema,
  },
  { additionalProperties: false }
);
export type Civ7WorkerAssignmentSnapshot = Readonly<
  Static<typeof Civ7WorkerAssignmentSnapshotSchema>
>;

export const Civ7WorkerAssignmentValidationResultSchema = Type.Object(
  {
    valid: Type.Boolean(),
    result: Civ7PopulationJsonValueSchema,
  },
  { additionalProperties: false }
);
export type Civ7WorkerAssignmentValidationResult = Readonly<
  Static<typeof Civ7WorkerAssignmentValidationResultSchema>
>;

export const Civ7WorkerAssignmentCheckResultSchema = Type.Object(
  {
    valid: Type.Boolean(),
    result: Civ7PopulationJsonValueSchema,
    snapshot: Civ7WorkerAssignmentSnapshotSchema,
  },
  { additionalProperties: false }
);
export type Civ7WorkerAssignmentCheckResult = Readonly<
  Static<typeof Civ7WorkerAssignmentCheckResultSchema>
>;

const Civ7WorkerAssignmentValidValidationResultSchema = Type.Object(
  {
    valid: Type.Literal(true),
    result: Civ7PopulationJsonValueSchema,
  },
  { additionalProperties: false }
);

const Civ7WorkerAssignmentInvalidValidationResultSchema = Type.Object(
  {
    valid: Type.Literal(false),
    result: Civ7PopulationJsonValueSchema,
  },
  { additionalProperties: false }
);

export const Civ7WorkerAssignmentSendResultSchema = Type.Union([
  Type.Object(
    {
      sent: Type.Literal(true),
      validation: Civ7WorkerAssignmentValidValidationResultSchema,
      before: Civ7WorkerAssignmentSnapshotSchema,
      after: Civ7WorkerAssignmentSnapshotSchema,
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      sent: Type.Literal(false),
      validation: Civ7WorkerAssignmentInvalidValidationResultSchema,
      before: Civ7WorkerAssignmentSnapshotSchema,
      after: Civ7WorkerAssignmentSnapshotSchema,
    },
    { additionalProperties: false }
  ),
]);
export type Civ7WorkerAssignmentSendResult = Readonly<
  Static<typeof Civ7WorkerAssignmentSendResultSchema>
>;

export const Civ7CityExpansionInputSchema = Type.Object(
  {
    cityId: Civ7ComponentIdSchema,
    destination: Civ7MapLocationSchema,
  },
  { additionalProperties: false }
);
export type Civ7CityExpansionInput = Readonly<Static<typeof Civ7CityExpansionInputSchema>>;

export const Civ7CityExpansionCandidateSchema = Type.Object(
  {
    plotIndex: Type.Integer(),
    constructibleType: Civ7PopulationJsonValueSchema,
  },
  { additionalProperties: false }
);
export type Civ7CityExpansionCandidate = Readonly<Static<typeof Civ7CityExpansionCandidateSchema>>;

export const Civ7CityExpansionOwnershipSchema = Type.Union([
  Type.Object(
    {
      status: Type.Literal("unowned"),
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      status: Type.Literal("owned"),
      cityId: Civ7ComponentIdSchema,
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      status: Type.Literal("unavailable"),
    },
    { additionalProperties: false }
  ),
]);
export type Civ7CityExpansionOwnership = Readonly<Static<typeof Civ7CityExpansionOwnershipSchema>>;

export const Civ7CityExpansionSnapshotSchema = Type.Object(
  {
    localPlayerId: Type.Integer(),
    cityId: Civ7ComponentIdSchema,
    destination: Civ7MapLocationSchema,
    plotIndex: Type.Integer(),
    isReadyToPlacePopulation: nullableBooleanSchema,
    candidate: Type.Union([Civ7CityExpansionCandidateSchema, Type.Null()]),
    ownership: Civ7CityExpansionOwnershipSchema,
  },
  { additionalProperties: false }
);
export type Civ7CityExpansionSnapshot = Readonly<Static<typeof Civ7CityExpansionSnapshotSchema>>;

export const Civ7CityExpansionValidationResultSchema = Type.Object(
  {
    valid: Type.Boolean(),
    result: Civ7PopulationJsonValueSchema,
  },
  { additionalProperties: false }
);
export type Civ7CityExpansionValidationResult = Readonly<
  Static<typeof Civ7CityExpansionValidationResultSchema>
>;

export const Civ7CityExpansionCheckResultSchema = Type.Object(
  {
    valid: Type.Boolean(),
    result: Civ7PopulationJsonValueSchema,
    snapshot: Civ7CityExpansionSnapshotSchema,
  },
  { additionalProperties: false }
);
export type Civ7CityExpansionCheckResult = Readonly<
  Static<typeof Civ7CityExpansionCheckResultSchema>
>;

const Civ7CityExpansionValidValidationResultSchema = Type.Object(
  {
    valid: Type.Literal(true),
    result: Civ7PopulationJsonValueSchema,
  },
  { additionalProperties: false }
);

const Civ7CityExpansionInvalidValidationResultSchema = Type.Object(
  {
    valid: Type.Literal(false),
    result: Civ7PopulationJsonValueSchema,
  },
  { additionalProperties: false }
);

export const Civ7CityExpansionSendResultSchema = Type.Union([
  Type.Object(
    {
      sent: Type.Literal(true),
      validation: Civ7CityExpansionValidValidationResultSchema,
      before: Civ7CityExpansionSnapshotSchema,
      after: Civ7CityExpansionSnapshotSchema,
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      sent: Type.Literal(false),
      validation: Civ7CityExpansionInvalidValidationResultSchema,
      before: Civ7CityExpansionSnapshotSchema,
      after: Civ7CityExpansionSnapshotSchema,
    },
    { additionalProperties: false }
  ),
]);
export type Civ7CityExpansionSendResult = Readonly<
  Static<typeof Civ7CityExpansionSendResultSchema>
>;

const Civ7WorkerAssignmentSendEnvelopeSchema = sendEnvelopeSchema(
  Civ7WorkerAssignmentSendResultSchema
);
const Civ7CityExpansionSendEnvelopeSchema = sendEnvelopeSchema(Civ7CityExpansionSendResultSchema);

export async function checkCiv7WorkerAssignment(
  input: Civ7WorkerAssignmentInput,
  options: Civ7DirectControlOptions = {}
): Promise<Civ7WorkerAssignmentCheckResult> {
  const command = await executeCiv7AppUiCommand({
    ...options,
    command: buildPopulationPlacementWireCommand("checkWorkerAssignment", input),
  });
  return schemaBodyFromCommandResult(
    command,
    "Civ7 worker assignment check",
    Civ7WorkerAssignmentCheckResultSchema
  );
}

export async function sendCiv7WorkerAssignment(
  input: Civ7WorkerAssignmentInput,
  options: Civ7DirectControlOptions = {}
): Promise<Civ7WorkerAssignmentSendResult> {
  const command = await executeCiv7AppUiCommand({
    ...options,
    command: buildPopulationPlacementWireCommand("sendWorkerAssignment", input),
  });
  const envelope = schemaBodyFromCommandResult(
    command,
    "Civ7 worker assignment send",
    Civ7WorkerAssignmentSendEnvelopeSchema
  );
  if (envelope.ok) return envelope.value;
  throw new Civ7DirectControlError("command-failed", envelope.error, {
    details: command,
    dispatchStatus: envelope.gameplayDispatchStatus,
  });
}

export async function checkCiv7CityExpansion(
  input: Civ7CityExpansionInput,
  options: Civ7DirectControlOptions = {}
): Promise<Civ7CityExpansionCheckResult> {
  const command = await executeCiv7AppUiCommand({
    ...options,
    command: buildPopulationPlacementWireCommand("checkCityExpansion", input),
  });
  return schemaBodyFromCommandResult(
    command,
    "Civ7 city expansion check",
    Civ7CityExpansionCheckResultSchema
  );
}

export async function sendCiv7CityExpansion(
  input: Civ7CityExpansionInput,
  options: Civ7DirectControlOptions = {}
): Promise<Civ7CityExpansionSendResult> {
  const command = await executeCiv7AppUiCommand({
    ...options,
    command: buildPopulationPlacementWireCommand("sendCityExpansion", input),
  });
  const envelope = schemaBodyFromCommandResult(
    command,
    "Civ7 city expansion send",
    Civ7CityExpansionSendEnvelopeSchema
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

type PopulationPlacementAtom =
  | "checkWorkerAssignment"
  | "sendWorkerAssignment"
  | "checkCityExpansion"
  | "sendCityExpansion";

function buildPopulationPlacementWireCommand(
  atom: PopulationPlacementAtom,
  input: Civ7WorkerAssignmentInput | Civ7CityExpansionInput
): string {
  try {
    const wireInput =
      atom === "checkWorkerAssignment" || atom === "sendWorkerAssignment"
        ? workerAssignmentWireInput(input as Civ7WorkerAssignmentInput)
        : cityExpansionWireInput(input as Civ7CityExpansionInput);
    const invocation = atom.startsWith("send")
      ? `${atom}Envelope(${jsLiteral(wireInput)})`
      : `${atom}(${jsLiteral(wireInput)})`;
    return `(() => {
    ${populationPlacementWireSource()}
    return JSON.stringify(${invocation});
  })()`;
  } catch (cause) {
    throw directControlErrorWithDispatchStatus(cause, "not-dispatched");
  }
}

function workerAssignmentWireInput(input: Civ7WorkerAssignmentInput): Civ7WorkerAssignmentInput {
  boundedInteger(input.location, 0, 1_000_000, "location");
  return { location: input.location };
}

function cityExpansionWireInput(input: Civ7CityExpansionInput): Civ7CityExpansionInput {
  const cityId = assertCiv7ComponentId(input.cityId, "cityId");
  validateMapLocation(input.destination);
  return {
    cityId,
    destination: {
      x: input.destination.x,
      y: input.destination.y,
    },
  };
}

function populationPlacementWireSource(): string {
  return `
    const immutableJson = (value, label) => {
      const serialized = JSON.stringify(value);
      if (serialized === undefined) throw new Error(label + " returned non-JSON evidence.");
      return JSON.parse(serialized);
    };
    const readNumericField = (value, lowerKey, upperKey) => {
      if (!value || typeof value !== "object") return null;
      const lower = value[lowerKey];
      if (typeof lower === "number" && Number.isFinite(lower)) return lower;
      const upper = value[upperKey];
      return typeof upper === "number" && Number.isFinite(upper) ? upper : null;
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
    const requireLocalPlayerId = () => {
      const localPlayerId = globalThis.GameContext?.localPlayerID;
      if (!Number.isInteger(localPlayerId)) {
        throw new Error("GameContext.localPlayerID is unavailable.");
      }
      return localPlayerId;
    };
    const readWorkerAssignmentSnapshot = (input) => {
      const localPlayerId = requireLocalPlayerId();
      const player = globalThis.Players?.get?.(localPlayerId);
      if (typeof player?.Cities?.getCityIds !== "function") {
        throw new Error("The local player's city list is unavailable.");
      }
      const cityIds = player.Cities.getCityIds();
      if (!Array.isArray(cityIds)) {
        throw new Error("The local player's city list is not an array.");
      }
      const readyCityIds = [];
      let candidateCityId = null;
      let isReadyToPlacePopulation = null;
      let placementInfo = null;
      let numWorkers = null;
      for (const rawCityId of cityIds) {
        const cityId = toComponentId(rawCityId);
        if (!cityId) throw new Error("The local player's city list contains an invalid ComponentID.");
        const city = globalThis.Cities?.get?.(rawCityId);
        const isReady = city?.Growth?.isReadyToPlacePopulation === true;
        if (isReady) readyCityIds.push(cityId);
        if (typeof city?.Workers?.GetAllPlacementInfo !== "function") {
          if (isReady) {
            throw new Error("A ready city's worker placement candidates are unavailable.");
          }
          continue;
        }
        const candidates = city.Workers.GetAllPlacementInfo();
        if (!Array.isArray(candidates)) {
          if (isReady) {
            throw new Error("A ready city's worker placement candidates are not an array.");
          }
          continue;
        }
        const candidate = candidates.find(
          (entry) => entry?.PlotIndex === input.location && entry?.IsBlocked !== true
        );
        if (candidate === undefined) continue;
        if (candidateCityId !== null) {
          throw new Error("The worker target belongs to more than one local city.");
        }
        candidateCityId = cityId;
        isReadyToPlacePopulation =
          typeof city?.Growth?.isReadyToPlacePopulation === "boolean"
            ? city.Growth.isReadyToPlacePopulation
            : null;
        placementInfo = immutableJson(candidate, "Worker placement candidate");
        numWorkers = Number.isInteger(candidate?.NumWorkers) ? candidate.NumWorkers : null;
      }
      return {
        localPlayerId,
        location: input.location,
        readyCityIds,
        candidateCityId,
        isReadyToPlacePopulation,
        placementInfo,
        numWorkers,
      };
    };
    const checkWorkerAssignmentValidation = (input, snapshot) => {
      if (typeof globalThis.Game?.PlayerOperations?.canStart !== "function") {
        throw new Error("Game.PlayerOperations.canStart is unavailable.");
      }
      if (globalThis.PlayerOperationTypes?.ASSIGN_WORKER === undefined) {
        throw new Error("PlayerOperationTypes.ASSIGN_WORKER is unavailable.");
      }
      const args = { Location: input.location, Amount: 1 };
      const rawResult = globalThis.Game.PlayerOperations.canStart(
        snapshot.localPlayerId,
        globalThis.PlayerOperationTypes.ASSIGN_WORKER,
        args,
        false
      );
      return {
        valid:
          rawResult !== null &&
          typeof rawResult === "object" &&
          rawResult.Success === true &&
          snapshot.candidateCityId !== null &&
          snapshot.isReadyToPlacePopulation === true,
        result: immutableJson(rawResult, "Game.PlayerOperations.canStart"),
      };
    };
    const checkWorkerAssignment = (input) => {
      const snapshot = readWorkerAssignmentSnapshot(input);
      const validation = checkWorkerAssignmentValidation(input, snapshot);
      return { ...validation, snapshot };
    };
    const sendWorkerAssignment = (input, markSendInvoked) => {
      const before = readWorkerAssignmentSnapshot(input);
      const validation = checkWorkerAssignmentValidation(input, before);
      if (!validation.valid) {
        return {
          sent: false,
          validation,
          before,
          after: readWorkerAssignmentSnapshot(input),
        };
      }
      if (typeof globalThis.Game?.PlayerOperations?.sendRequest !== "function") {
        throw new Error("Game.PlayerOperations.sendRequest is unavailable.");
      }
      const args = { Location: input.location, Amount: 1 };
      markSendInvoked();
      globalThis.Game.PlayerOperations.sendRequest(
        before.localPlayerId,
        globalThis.PlayerOperationTypes.ASSIGN_WORKER,
        args
      );
      return {
        sent: true,
        validation,
        before,
        after: readWorkerAssignmentSnapshot(input),
      };
    };
    const readExpansionCandidate = (result, plotIndex) => {
      if (!result || typeof result !== "object") return null;
      if (!Array.isArray(result.Plots) || !Array.isArray(result.ConstructibleTypes)) return null;
      const index = result.Plots.findIndex((candidatePlotIndex) => candidatePlotIndex === plotIndex);
      if (index < 0 || index >= result.ConstructibleTypes.length) return null;
      const constructibleType = result.ConstructibleTypes[index];
      if (constructibleType === undefined) return null;
      return {
        plotIndex,
        constructibleType: immutableJson(constructibleType, "EXPAND ConstructibleTypes entry"),
      };
    };
    const readCityExpansionOwnership = (value) => {
      if (value === null) return { status: "unowned" };
      const cityId = toComponentId(value);
      return cityId === null
        ? { status: "unavailable" }
        : { status: "owned", cityId };
    };
    const readCityExpansionState = (input, localPlayerId, plotIndex, rawResult) => {
      const city = globalThis.Cities?.get?.(input.cityId);
      if (typeof globalThis.GameplayMap?.getOwningCityFromXY !== "function") {
        throw new Error("GameplayMap.getOwningCityFromXY is unavailable.");
      }
      return {
        localPlayerId,
        cityId: input.cityId,
        destination: input.destination,
        plotIndex,
        isReadyToPlacePopulation:
          typeof city?.Growth?.isReadyToPlacePopulation === "boolean"
            ? city.Growth.isReadyToPlacePopulation
            : null,
        candidate: readExpansionCandidate(rawResult, plotIndex),
        ownership: readCityExpansionOwnership(
          globalThis.GameplayMap.getOwningCityFromXY(input.destination.x, input.destination.y)
        ),
      };
    };
    const checkCityExpansionValidation = (input) => {
      const localPlayerId = requireLocalPlayerId();
      if (typeof globalThis.GameplayMap?.getIndexFromLocation !== "function") {
        throw new Error("GameplayMap.getIndexFromLocation is unavailable.");
      }
      const plotIndex = globalThis.GameplayMap.getIndexFromLocation(input.destination);
      if (!Number.isInteger(plotIndex)) {
        throw new Error("GameplayMap.getIndexFromLocation returned an invalid plot index.");
      }
      if (typeof globalThis.Game?.CityCommands?.canStart !== "function") {
        throw new Error("Game.CityCommands.canStart is unavailable.");
      }
      if (globalThis.CityCommandTypes?.EXPAND === undefined) {
        throw new Error("CityCommandTypes.EXPAND is unavailable.");
      }
      const rawResult = globalThis.Game.CityCommands.canStart(
        input.cityId,
        globalThis.CityCommandTypes.EXPAND,
        {},
        false
      );
      const result = immutableJson(rawResult, "Game.CityCommands.canStart");
      const snapshot = readCityExpansionState(input, localPlayerId, plotIndex, rawResult);
      return {
        valid:
          input.cityId.owner === localPlayerId &&
          snapshot.isReadyToPlacePopulation === true &&
          snapshot.candidate !== null &&
          snapshot.ownership.status === "unowned",
        result,
        snapshot,
      };
    };
    const checkCityExpansion = (input) => checkCityExpansionValidation(input);
    const sendCityExpansion = (input, markSendInvoked) => {
      const checked = checkCityExpansionValidation(input);
      const validation = { valid: checked.valid, result: checked.result };
      if (!validation.valid) {
        return {
          sent: false,
          validation,
          before: checked.snapshot,
          after: checked.snapshot,
        };
      }
      if (typeof globalThis.Game?.CityCommands?.sendRequest !== "function") {
        throw new Error("Game.CityCommands.sendRequest is unavailable.");
      }
      markSendInvoked();
      globalThis.Game.CityCommands.sendRequest(
        input.cityId,
        globalThis.CityCommandTypes.EXPAND,
        { X: input.destination.x, Y: input.destination.y }
      );
      const afterValidation = checkCityExpansionValidation(input);
      return {
        sent: true,
        validation,
        before: checked.snapshot,
        after: afterValidation.snapshot,
      };
    };
    const boundedWireError = (error) => {
      let message;
      try {
        message = typeof error?.message === "string" ? error.message : String(error);
      } catch {
        message = "Civ7 population placement send failed.";
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
    const sendWorkerAssignmentEnvelope = (input) =>
      sendEnvelope(sendWorkerAssignment, input);
    const sendCityExpansionEnvelope = (input) =>
      sendEnvelope(sendCityExpansion, input);`;
}

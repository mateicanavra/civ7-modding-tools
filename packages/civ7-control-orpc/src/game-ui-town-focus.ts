import type { Civ7ControlOrpcDirectControlFacade } from "./dependencies/direct-control";
import type { Civ7ControlOrpcComponentId } from "./model/primitives";

type TownFocusResult = Awaited<
  ReturnType<Civ7ControlOrpcDirectControlFacade["requestCiv7TownFocusChange"]>
>;
type TownFocusValidation = TownFocusResult["beforeValidation"];

export type Civ7GameUiTownFocusTarget = Readonly<{
  CityCommandTypes?: {
    CHANGE_GROWTH_MODE?: unknown;
  };
  CityOperationTypes?: {
    CONSIDER_TOWN_PROJECT?: unknown;
  };
  Game?: {
    CityCommands?: {
      canStart?: (
        cityId: Civ7ControlOrpcComponentId,
        commandType: unknown,
        args: Readonly<Record<string, number>>,
        queue?: boolean,
      ) => unknown;
      sendRequest?: (
        cityId: Civ7ControlOrpcComponentId,
        commandType: unknown,
        args: Readonly<Record<string, number>>,
      ) => unknown;
    };
    CityOperations?: {
      canStart?: (
        cityId: Civ7ControlOrpcComponentId,
        operationType: unknown,
        args: Readonly<Record<string, number>>,
        queue?: boolean,
      ) => unknown;
      sendRequest?: (
        cityId: Civ7ControlOrpcComponentId,
        operationType: unknown,
        args: Readonly<Record<string, number>>,
      ) => unknown;
    };
  };
  GameContext?: {
    localPlayerID?: number;
  };
}>;

export function civ7GameUiTownFocusAvailable(
  target: Civ7GameUiTownFocusTarget,
): boolean {
  return typeof target.Game?.CityCommands?.canStart === "function"
    && typeof target.Game.CityCommands.sendRequest === "function"
    && target.CityCommandTypes?.CHANGE_GROWTH_MODE !== undefined
    && typeof target.Game?.CityOperations?.canStart === "function"
    && typeof target.Game.CityOperations.sendRequest === "function"
    && target.CityOperationTypes?.CONSIDER_TOWN_PROJECT !== undefined;
}

export async function requestCiv7GameUiTownFocusChange(
  input: Readonly<{
    cityId: Civ7ControlOrpcComponentId;
    growthType: number;
    projectType: number;
    city?: number;
  }>,
  target: Civ7GameUiTownFocusTarget = globalThis as Civ7GameUiTownFocusTarget,
): Promise<TownFocusResult> {
  const cityId = toComponentId(input.cityId);
  if (cityId == null) {
    throw new Error("Town focus cityId must be a ComponentID.");
  }
  const city = input.city ?? cityId.id;
  const args = {
    Type: input.growthType,
    ProjectType: input.projectType,
    City: city,
  };
  const localPlayerId = target.GameContext?.localPlayerID;
  const before = cityId.owner === localPlayerId
    ? gameUiTownFocusCityCommandValidation(cityId, args, target)
    : gameUiTownFocusLocalCityMismatch(cityId, localPlayerId, args, "city-command");

  if (!before.valid) {
    return townFocusResult({
      kind: "town-focus-change",
      cityId,
      growthType: input.growthType,
      projectType: input.projectType,
      city,
      operationType: "CHANGE_GROWTH_MODE",
      before,
      after: before,
      sent: false,
    });
  }

  const sendRequest = target.Game?.CityCommands?.sendRequest;
  const sendResult = typeof sendRequest === "function"
    ? safeValue(() =>
      sendRequest(
      cityId,
      target.CityCommandTypes?.CHANGE_GROWTH_MODE,
      args,
    ), false)
    : false;
  const sent = sendResult !== false;
  const after = gameUiTownFocusCityCommandValidation(cityId, args, target);

  return townFocusResult({
    kind: "town-focus-change",
    cityId,
    growthType: input.growthType,
    projectType: input.projectType,
    city,
    operationType: "CHANGE_GROWTH_MODE",
    before,
    after,
    sent,
  });
}

export async function requestCiv7GameUiTownFocusReviewCloseout(
  input: Readonly<{
    cityId: Civ7ControlOrpcComponentId;
  }>,
  target: Civ7GameUiTownFocusTarget = globalThis as Civ7GameUiTownFocusTarget,
): Promise<TownFocusResult> {
  const cityId = toComponentId(input.cityId);
  if (cityId == null) {
    throw new Error("Town focus cityId must be a ComponentID.");
  }
  const args: Readonly<Record<string, number>> = {};
  const localPlayerId = target.GameContext?.localPlayerID;
  const before = cityId.owner === localPlayerId
    ? gameUiTownFocusCityOperationValidation(cityId, args, target)
    : gameUiTownFocusLocalCityMismatch(cityId, localPlayerId, args, "city-operation");

  if (!before.valid) {
    return townFocusResult({
      kind: "town-focus-review",
      cityId,
      operationType: "CONSIDER_TOWN_PROJECT",
      before,
      after: before,
      sent: false,
    });
  }

  const sendRequest = target.Game?.CityOperations?.sendRequest;
  const sendResult = typeof sendRequest === "function"
    ? safeValue(() =>
      sendRequest(
      cityId,
      target.CityOperationTypes?.CONSIDER_TOWN_PROJECT,
      args,
    ), false)
    : false;
  const sent = sendResult !== false;
  const after = gameUiTownFocusCityOperationValidation(cityId, args, target);

  return townFocusResult({
    kind: "town-focus-review",
    cityId,
    operationType: "CONSIDER_TOWN_PROJECT",
    before,
    after,
    sent,
  });
}

function gameUiTownFocusCityCommandValidation(
  cityId: Civ7ControlOrpcComponentId,
  args: Readonly<Record<string, number>>,
  target: Civ7GameUiTownFocusTarget,
): TownFocusValidation {
  const result = safeValue(
    () =>
      target.Game?.CityCommands?.canStart?.(
        cityId,
        target.CityCommandTypes?.CHANGE_GROWTH_MODE,
        args,
        false,
      ),
    null,
  );
  return townFocusValidation({
    family: "city-command",
    operationType: "CHANGE_GROWTH_MODE",
    enumValue: target.CityCommandTypes?.CHANGE_GROWTH_MODE,
    cityId,
    args,
    valid: successFromCanStart(result),
    result,
  });
}

function gameUiTownFocusCityOperationValidation(
  cityId: Civ7ControlOrpcComponentId,
  args: Readonly<Record<string, number>>,
  target: Civ7GameUiTownFocusTarget,
): TownFocusValidation {
  const result = safeValue(
    () =>
      target.Game?.CityOperations?.canStart?.(
        cityId,
        target.CityOperationTypes?.CONSIDER_TOWN_PROJECT,
        args,
        false,
      ),
    null,
  );
  return townFocusValidation({
    family: "city-operation",
    operationType: "CONSIDER_TOWN_PROJECT",
    enumValue: target.CityOperationTypes?.CONSIDER_TOWN_PROJECT,
    cityId,
    args,
    valid: successFromCanStart(result),
    result,
  });
}

function gameUiTownFocusLocalCityMismatch(
  cityId: Civ7ControlOrpcComponentId,
  localPlayerId: number | undefined,
  args: Readonly<Record<string, number>>,
  family: "city-command" | "city-operation",
): TownFocusValidation {
  return townFocusValidation({
    family,
    operationType: family === "city-command"
      ? "CHANGE_GROWTH_MODE"
      : "CONSIDER_TOWN_PROJECT",
    enumValue: family === "city-command"
      ? "CHANGE_GROWTH_MODE"
      : "CONSIDER_TOWN_PROJECT",
    cityId,
    args,
    valid: false,
    result: {
      ok: false,
      reason: "city-owner-mismatch",
      cityOwner: cityId.owner,
      localPlayerId: localPlayerId ?? null,
    },
  });
}

function townFocusValidation(
  input: Readonly<{
    family: "city-command" | "city-operation";
    operationType: "CHANGE_GROWTH_MODE" | "CONSIDER_TOWN_PROJECT";
    enumValue: unknown;
    cityId: Civ7ControlOrpcComponentId;
    args: Readonly<Record<string, number>>;
    valid: boolean;
    result: unknown;
  }>,
): TownFocusValidation {
  return {
    host: "game-ui",
    port: 0,
    state: { id: "game-ui", name: "Game UI" },
    family: input.family,
    operationType: input.operationType,
    enumValue: input.enumValue,
    target: { cityId: input.cityId },
    args: input.args,
    valid: input.valid,
    result: input.result,
  };
}

function townFocusResult(
  input: Readonly<
    | {
      kind: "town-focus-change";
      cityId: Civ7ControlOrpcComponentId;
      growthType: number;
      projectType: number;
      city: number;
      operationType: "CHANGE_GROWTH_MODE";
      before: TownFocusValidation;
      after: TownFocusValidation;
      sent: boolean;
    }
    | {
      kind: "town-focus-review";
      cityId: Civ7ControlOrpcComponentId;
      operationType: "CONSIDER_TOWN_PROJECT";
      before: TownFocusValidation;
      after: TownFocusValidation;
      sent: boolean;
    }
  >,
): TownFocusResult {
  const common = {
    cityId: input.cityId,
    operation: {
      before: input.before,
      after: input.after,
      sent: input.sent,
    },
    beforeValidation: input.before,
    afterValidation: input.after,
    sent: input.sent,
    verified: false,
    postcondition: townFocusPostcondition(input.sent, input.kind),
  };

  if (input.kind === "town-focus-change") {
    return {
      ...common,
      kind: "town-focus-change",
      growthType: input.growthType,
      projectType: input.projectType,
      city: input.city,
    } as TownFocusResult;
  }

  return {
    ...common,
    kind: "town-focus-review",
  } as TownFocusResult;
}

function townFocusPostcondition(
  sent: boolean,
  kind: "town-focus-change" | "town-focus-review",
): TownFocusResult["postcondition"] {
  if (!sent) {
    return {
      classification: "not-sent",
      reason: `The ${kind} request did not validate, so no town focus operation was sent.`,
    };
  }

  return {
    classification: "pending-runtime-proof",
    reason: `The ${kind} request was sent through the game UI controller, but local package tests do not prove live town focus state changed; read fresh city readiness before another request.`,
  };
}

function successFromCanStart(result: unknown): boolean {
  if (result === true) return true;
  if (result === false || result == null) return false;
  if (typeof result === "object") {
    const record = result as Record<string, unknown>;
    if (record.Success !== undefined) return record.Success === true;
    if (record.success !== undefined) return record.success === true;
    if (record.canStart !== undefined) return record.canStart === true;
  }
  return Boolean(result);
}

function toComponentId(input: unknown): Civ7ControlOrpcComponentId | null {
  if (input == null || typeof input !== "object") return null;
  const record = input as Record<string, unknown>;
  if (
    Number.isInteger(record.owner)
    && Number.isInteger(record.id)
    && Number.isInteger(record.type)
  ) {
    return {
      owner: record.owner as number,
      id: record.id as number,
      type: record.type as number,
    };
  }
  return null;
}

function safeValue<T>(fn: () => T, fallback: T): T {
  try {
    return fn();
  } catch {
    return fallback;
  }
}

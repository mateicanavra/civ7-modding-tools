import type { Civ7ControlOrpcDirectControlFacade } from "./dependencies/direct-control";

type GovernmentChoiceResult = Awaited<
  ReturnType<Civ7ControlOrpcDirectControlFacade["requestCiv7GovernmentChoice"]>
>;
type GovernmentValidation = GovernmentChoiceResult["beforeValidation"];

export const CIV7_GAME_UI_GOVERNMENT_ACTIVATE_ACTION = -1_326_475_004;

export type Civ7GameUiGovernmentTarget = Readonly<{
  Game?: {
    PlayerOperations?: {
      canStart?: (
        playerId: number,
        operationType: unknown,
        args: Readonly<Record<string, number>>,
        queue?: boolean
      ) => unknown;
      sendRequest?: (
        playerId: number,
        operationType: unknown,
        args: Readonly<Record<string, number>>
      ) => unknown;
    };
  };
  GameContext?: {
    localPlayerID?: number;
  };
  PlayerOperationTypes?: {
    CHANGE_GOVERNMENT?: unknown;
    CHOOSE_GOLDEN_AGE?: unknown;
  };
}>;

export function civ7GameUiGovernmentAvailable(target: Civ7GameUiGovernmentTarget): boolean {
  return (
    typeof target.Game?.PlayerOperations?.canStart === "function" &&
    typeof target.Game.PlayerOperations.sendRequest === "function" &&
    target.PlayerOperationTypes?.CHANGE_GOVERNMENT !== undefined &&
    target.PlayerOperationTypes.CHOOSE_GOLDEN_AGE !== undefined &&
    typeof target.GameContext?.localPlayerID === "number"
  );
}

export async function requestCiv7GameUiGovernmentChoice(
  input: Readonly<{
    playerId: number;
    governmentType: number;
    action?: number;
  }>,
  target: Civ7GameUiGovernmentTarget = globalThis as Civ7GameUiGovernmentTarget
): Promise<GovernmentChoiceResult> {
  const action = input.action ?? CIV7_GAME_UI_GOVERNMENT_ACTIVATE_ACTION;
  const args = {
    GovernmentType: input.governmentType,
    Action: action,
  };
  return gameUiGovernmentChoice(
    {
      kind: "government",
      playerId: input.playerId,
      operationType: "CHANGE_GOVERNMENT",
      enumValue: target.PlayerOperationTypes?.CHANGE_GOVERNMENT,
      args,
      governmentType: input.governmentType,
      action,
    },
    target
  );
}

export async function requestCiv7GameUiCelebrationChoice(
  input: Readonly<{
    playerId: number;
    goldenAgeType: number;
  }>,
  target: Civ7GameUiGovernmentTarget = globalThis as Civ7GameUiGovernmentTarget
): Promise<GovernmentChoiceResult> {
  const args = { GoldenAgeType: input.goldenAgeType };
  return gameUiGovernmentChoice(
    {
      kind: "celebration",
      playerId: input.playerId,
      operationType: "CHOOSE_GOLDEN_AGE",
      enumValue: target.PlayerOperationTypes?.CHOOSE_GOLDEN_AGE,
      args,
      goldenAgeType: input.goldenAgeType,
    },
    target
  );
}

function gameUiGovernmentChoice(
  input: Readonly<
    | {
        kind: "government";
        playerId: number;
        operationType: "CHANGE_GOVERNMENT";
        enumValue: unknown;
        args: Readonly<Record<string, number>>;
        governmentType: number;
        action: number;
      }
    | {
        kind: "celebration";
        playerId: number;
        operationType: "CHOOSE_GOLDEN_AGE";
        enumValue: unknown;
        args: Readonly<Record<string, number>>;
        goldenAgeType: number;
      }
  >,
  target: Civ7GameUiGovernmentTarget
): GovernmentChoiceResult {
  const localPlayerId = target.GameContext?.localPlayerID;
  const before =
    input.playerId === localPlayerId
      ? gameUiGovernmentValidation(input, target)
      : governmentValidation({
          operationType: input.operationType,
          enumValue: input.enumValue,
          playerId: input.playerId,
          args: input.args,
          valid: false,
          result: {
            ok: false,
            reason: "player-id-mismatch",
            inputPlayerId: input.playerId,
            localPlayerId: localPlayerId ?? null,
          },
        });

  if (!before.valid) {
    return governmentResult({ ...input, before, after: before, sent: false });
  }

  const sendResult = safeValue(
    () => target.Game?.PlayerOperations?.sendRequest?.(input.playerId, input.enumValue, input.args),
    false
  );
  const sent = sendResult !== false;
  const after = gameUiGovernmentValidation(input, target);
  return governmentResult({ ...input, before, after, sent });
}

function gameUiGovernmentValidation(
  input: Readonly<{
    operationType: "CHANGE_GOVERNMENT" | "CHOOSE_GOLDEN_AGE";
    enumValue: unknown;
    playerId: number;
    args: Readonly<Record<string, number>>;
  }>,
  target: Civ7GameUiGovernmentTarget
): GovernmentValidation {
  const result = safeValue(
    () =>
      target.Game?.PlayerOperations?.canStart?.(input.playerId, input.enumValue, input.args, false),
    null
  );
  return governmentValidation({
    operationType: input.operationType,
    enumValue: input.enumValue,
    playerId: input.playerId,
    args: input.args,
    valid: successFromCanStart(result),
    result,
  });
}

function governmentValidation(
  input: Readonly<{
    operationType: "CHANGE_GOVERNMENT" | "CHOOSE_GOLDEN_AGE";
    enumValue: unknown;
    playerId: number;
    args: Readonly<Record<string, number>>;
    valid: boolean;
    result: unknown;
  }>
): GovernmentValidation {
  return {
    host: "game-ui",
    port: 0,
    state: { id: "game-ui", name: "Game UI" },
    family: "player-operation",
    operationType: input.operationType,
    enumValue: input.enumValue,
    target: { playerId: input.playerId },
    args: input.args,
    valid: input.valid,
    result: input.result,
  };
}

function governmentResult(
  input: Readonly<
    | {
        kind: "government";
        playerId: number;
        operationType: "CHANGE_GOVERNMENT";
        args: Readonly<Record<string, number>>;
        governmentType: number;
        action: number;
        before: GovernmentValidation;
        after: GovernmentValidation;
        sent: boolean;
      }
    | {
        kind: "celebration";
        playerId: number;
        operationType: "CHOOSE_GOLDEN_AGE";
        args: Readonly<Record<string, number>>;
        goldenAgeType: number;
        before: GovernmentValidation;
        after: GovernmentValidation;
        sent: boolean;
      }
  >
): GovernmentChoiceResult {
  const common = {
    playerId: input.playerId,
    operation: {
      before: input.before,
      after: input.after,
      sent: input.sent,
      verified: false,
    },
    beforeValidation: input.before,
    afterValidation: input.after,
    sent: input.sent,
    verified: false,
    postcondition: governmentPostcondition(input.sent, input.kind),
  };

  if (input.kind === "government") {
    return {
      ...common,
      kind: "government",
      governmentType: input.governmentType,
      action: input.action,
    } as GovernmentChoiceResult;
  }

  return {
    ...common,
    kind: "celebration",
    goldenAgeType: input.goldenAgeType,
  } as GovernmentChoiceResult;
}

function governmentPostcondition(
  sent: boolean,
  kind: "government" | "celebration"
): GovernmentChoiceResult["postcondition"] {
  if (!sent) {
    return {
      classification: "not-sent",
      reason: `The ${kind} choice request did not validate, so no government-domain choice was sent.`,
    };
  }

  return {
    classification: "pending-runtime-proof",
    reason: `The ${kind} choice request was sent through the game UI controller, but local package tests do not prove live government-domain state changed; read fresh attention before another request.`,
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

function safeValue<T>(fn: () => T, fallback: T): T {
  try {
    return fn();
  } catch {
    return fallback;
  }
}

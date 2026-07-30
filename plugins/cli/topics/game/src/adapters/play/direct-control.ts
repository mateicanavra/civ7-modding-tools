import {
  assertCiv7ComponentId,
  type Civ7ComponentId,
  type Civ7DirectControlOptions,
  type Civ7OperationFamily,
  type Civ7OperationInput,
  canStartCiv7CityCommand,
  canStartCiv7CityOperation,
  canStartCiv7PlayerOperation,
  canStartCiv7UnitCommand,
  canStartCiv7UnitOperation,
  requestCiv7CityCommand,
  requestCiv7CityOperation,
  requestCiv7PlayerOperation,
  requestCiv7UnitCommand,
  requestCiv7UnitOperation,
} from "@civ7/direct-control";

/** CLI endpoint flags accepted by helpers that call the direct-control runtime. */
export type DirectControlFlagOptions = Readonly<{
  host?: string;
  port?: number;
  "timeout-ms": number;
}>;

/** One labeled direct-control operation in a caller-owned, strictly ordered play workflow. */
export type PlayOperationStep = Readonly<{
  label: string;
  family: Civ7OperationFamily;
  input: Civ7OperationInput;
}>;

/** Normalized integer map coordinate produced from the CLI's pair or split-axis flags. */
export type MapLocationFlag = Readonly<{ x: number; y: number }>;

/**
 * Adapts oclif's kebab-cased endpoint flags to the direct-control client contract.
 *
 * @param flags - Parsed command flags, including the required effective timeout.
 */
export function buildDirectControlOptions(
  flags: DirectControlFlagOptions
): Civ7DirectControlOptions {
  return {
    host: flags.host,
    port: flags.port,
    timeoutMs: flags["timeout-ms"],
  };
}

function parseJsonFlag<T>(value: string | undefined, flag: string): T {
  if (!value) throw new Error(`--${flag} is required`);
  try {
    return JSON.parse(value) as T;
  } catch (error) {
    throw new Error(
      `--${flag} must be valid JSON: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Resolves mutually exclusive `x,y` and split-axis flag forms to one coordinate.
 *
 * @returns A normalized coordinate, or `undefined` when the location is optional and omitted.
 * @throws When forms are mixed, one axis is missing, a pair is malformed, or a required location is absent.
 */
export function resolveCoordinateFlags(input: {
  x?: number;
  y?: number;
  pair?: string;
  xFlag: string;
  yFlag: string;
  pairFlag: string;
  required?: boolean;
}): MapLocationFlag | undefined {
  const pair = input.pair;
  const hasPair = pair !== undefined;
  const hasX = input.x !== undefined;
  const hasY = input.y !== undefined;
  if (hasPair && (hasX || hasY)) {
    throw new Error(
      `--${input.pairFlag} cannot be combined with --${input.xFlag}/--${input.yFlag}`
    );
  }
  if (pair !== undefined) return parseCoordinatePair(pair, input.pairFlag);
  if (hasX !== hasY) {
    throw new Error(`--${input.xFlag} and --${input.yFlag} must be provided together`);
  }
  if (hasX && hasY) return { x: input.x as number, y: input.y as number };
  if (input.required) {
    throw new Error(`provide --${input.pairFlag} or --${input.xFlag} and --${input.yFlag}`);
  }
  return undefined;
}

/**
 * Parses a required JSON-encoded component ID and applies direct-control's canonical ID validation.
 * Error messages retain the originating flag name so command failures remain actionable.
 */
export function parseComponentId(value: string | undefined, flag: string): Civ7ComponentId {
  return assertCiv7ComponentId(parseJsonFlag<unknown>(value, flag), `--${flag}`);
}

/**
 * Dispatches a dry-run operation to the validator for its unit, city, or player family.
 * Family-specific entity IDs are asserted before any direct-control request is made.
 *
 * @returns The validator response from direct control without reshaping it for CLI output.
 */
export async function validatePlayOperation(
  family: Civ7OperationFamily,
  input: Civ7OperationInput,
  options: Civ7DirectControlOptions
) {
  if (family === "unit-operation")
    return await canStartCiv7UnitOperation(assertUnitInput(input), options);
  if (family === "unit-command")
    return await canStartCiv7UnitCommand(assertUnitInput(input), options);
  if (family === "city-operation")
    return await canStartCiv7CityOperation(assertCityInput(input), options);
  if (family === "city-command")
    return await canStartCiv7CityCommand(assertCityInput(input), options);
  return await canStartCiv7PlayerOperation(assertPlayerInput(input), options);
}

async function sendPlayOperation(
  family: Civ7OperationFamily,
  input: Civ7OperationInput,
  options: Civ7DirectControlOptions
) {
  if (family === "unit-operation")
    return await requestCiv7UnitOperation(assertUnitInput(input), options);
  if (family === "unit-command")
    return await requestCiv7UnitCommand(assertUnitInput(input), options);
  if (family === "city-operation")
    return await requestCiv7CityOperation(assertCityInput(input), options);
  if (family === "city-command")
    return await requestCiv7CityCommand(assertCityInput(input), options);
  return await requestCiv7PlayerOperation(assertPlayerInput(input), options);
}

/**
 * Validates or sends a caller-defined play workflow one step at a time in declaration order.
 * Execution stops on the first thrown failure and does not roll back earlier sends; send-mode verification
 * is true only when every returned step explicitly reports `verified: true`.
 *
 * @returns A workflow summary containing mode, per-step results, and the aggregate verification state.
 */
export async function executePlayOperationSequence(
  steps: ReadonlyArray<PlayOperationStep>,
  options: Civ7DirectControlOptions,
  config: { send: boolean; reason?: string }
) {
  const results = [];
  for (const step of steps) {
    const result = config.send
      ? await sendPlayOperation(step.family, step.input, options)
      : await validatePlayOperation(step.family, step.input, options);
    results.push({
      label: step.label,
      family: step.family,
      operationType: step.input.operationType,
      result,
    });
  }

  return {
    mode: config.send ? "send" : "validate",
    stepCount: results.length,
    verified: config.send ? results.every((step) => resultVerified(step.result)) : null,
    steps: results,
    notes: [
      config.send
        ? "Executed as one caller-level workflow with sequential runtime operations and per-step postconditions."
        : "Dry-run sequence validation only; closeout validation may differ after the primary operation mutates state.",
    ],
  };
}

/**
 * Emits the shared game-play JSON boundary through an oclif-compatible logger.
 * Machine JSON is a compact `{ ok, result }` envelope; normal output pretty-prints the raw result.
 */
export function emitPlayResult(
  log: (message?: string) => void,
  json: boolean,
  result: unknown
): void {
  if (json) {
    log(JSON.stringify({ ok: true, result }));
    return;
  }
  log(JSON.stringify(result, null, 2));
}

function assertUnitInput(
  input: Civ7OperationInput
): Civ7OperationInput & { unitId: Civ7ComponentId } {
  if (!("unitId" in input)) throw new Error("unit operation requires --unit-id");
  return input;
}

function assertCityInput(
  input: Civ7OperationInput
): Civ7OperationInput & { cityId: Civ7ComponentId } {
  if (!("cityId" in input)) throw new Error("city operation requires --city-id");
  return input;
}

function assertPlayerInput(input: Civ7OperationInput): Civ7OperationInput & { playerId: number } {
  if (!("playerId" in input)) throw new Error("player operation requires --player-id");
  return input;
}

function resultVerified(result: unknown): boolean {
  return (
    result !== null &&
    typeof result === "object" &&
    "verified" in result &&
    (result as { verified?: unknown }).verified === true
  );
}

function parseCoordinatePair(value: string, flag: string): MapLocationFlag {
  const parts = value.split(",").map((part) => part.trim());
  if (parts.length !== 2) throw new Error(`--${flag} must be formatted as x,y`);
  const [xRaw, yRaw] = parts;
  const x = Number(xRaw);
  const y = Number(yRaw);
  if (!Number.isInteger(x) || !Number.isInteger(y)) {
    throw new Error(`--${flag} must contain integer x,y coordinates`);
  }
  return { x, y };
}

import {
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
  assertCiv7ComponentId,
  type Civ7ComponentId,
  type Civ7DirectControlOptions,
  type Civ7OperationFamily,
  type Civ7OperationInput,
} from '@civ7/direct-control';

export type PlayOperationFamilyAlias =
  | Civ7OperationFamily
  | 'unit'
  | 'city'
  | 'player';

export type DirectControlFlagOptions = Readonly<{
  host?: string;
  port?: number;
  'timeout-ms': number;
}>;

export type PlayOperationStep = Readonly<{
  label: string;
  family: Civ7OperationFamily;
  input: Civ7OperationInput;
}>;

export type MapLocationFlag = Readonly<{ x: number; y: number }>;

export function buildDirectControlOptions(flags: DirectControlFlagOptions): Civ7DirectControlOptions {
  return {
    host: flags.host,
    port: flags.port,
    timeoutMs: flags['timeout-ms'],
  };
}

export function parseJsonFlag<T>(value: string | undefined, flag: string): T {
  if (!value) throw new Error(`--${flag} is required`);
  try {
    return JSON.parse(value) as T;
  } catch (error) {
    throw new Error(`--${flag} must be valid JSON: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export function parseOptionalJsonFlag(value: string | undefined, flag: string): unknown {
  if (value === undefined) return undefined;
  return parseJsonFlag<unknown>(value, flag);
}

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
    throw new Error(`--${input.pairFlag} cannot be combined with --${input.xFlag}/--${input.yFlag}`);
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

export function parseComponentId(value: string | undefined, flag: string): Civ7ComponentId {
  return assertCiv7ComponentId(parseJsonFlag<unknown>(value, flag), `--${flag}`);
}

export function normalizeOperationFamily(family: PlayOperationFamilyAlias): Civ7OperationFamily {
  if (family === 'unit') return 'unit-operation';
  if (family === 'city') return 'city-operation';
  if (family === 'player') return 'player-operation';
  return family;
}

export async function validatePlayOperation(
  family: Civ7OperationFamily,
  input: Civ7OperationInput,
  options: Civ7DirectControlOptions,
) {
  if (family === 'unit-operation') return await canStartCiv7UnitOperation(assertUnitInput(input), options);
  if (family === 'unit-command') return await canStartCiv7UnitCommand(assertUnitInput(input), options);
  if (family === 'city-operation') return await canStartCiv7CityOperation(assertCityInput(input), options);
  if (family === 'city-command') return await canStartCiv7CityCommand(assertCityInput(input), options);
  return await canStartCiv7PlayerOperation(assertPlayerInput(input), options);
}

export async function sendPlayOperation(
  family: Civ7OperationFamily,
  input: Civ7OperationInput,
  options: Civ7DirectControlOptions,
) {
  if (family === 'unit-operation') return await requestCiv7UnitOperation(assertUnitInput(input), options);
  if (family === 'unit-command') return await requestCiv7UnitCommand(assertUnitInput(input), options);
  if (family === 'city-operation') return await requestCiv7CityOperation(assertCityInput(input), options);
  if (family === 'city-command') return await requestCiv7CityCommand(assertCityInput(input), options);
  return await requestCiv7PlayerOperation(assertPlayerInput(input), options);
}

export async function executePlayOperationSequence(
  steps: ReadonlyArray<PlayOperationStep>,
  options: Civ7DirectControlOptions,
  config: { send: boolean; reason?: string },
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
    mode: config.send ? 'send' : 'validate',
    stepCount: results.length,
    verified: config.send ? results.every((step) => resultVerified(step.result)) : null,
    steps: results,
    notes: [
      config.send
        ? 'Executed as one caller-level workflow with sequential runtime operations and per-step postconditions.'
        : 'Dry-run sequence validation only; closeout validation may differ after the primary operation mutates state.',
    ],
  };
}

export function emitPlayResult(log: (message?: string) => void, json: boolean, result: unknown): void {
  if (json) {
    log(JSON.stringify({ ok: true, result }));
    return;
  }
  log(JSON.stringify(result, null, 2));
}

export function recommendedCliFromDecisionDetails(details: unknown): string | undefined {
  if (!details || typeof details !== 'object') return undefined;
  const recommendedCli = (details as { recommendedCli?: unknown }).recommendedCli;
  if (typeof recommendedCli !== 'string') return undefined;
  const trimmed = recommendedCli.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function assertUnitInput(input: Civ7OperationInput): Civ7OperationInput & { unitId: Civ7ComponentId } {
  if (!('unitId' in input)) throw new Error('unit operation requires --unit-id');
  return input;
}

function assertCityInput(input: Civ7OperationInput): Civ7OperationInput & { cityId: Civ7ComponentId } {
  if (!('cityId' in input)) throw new Error('city operation requires --city-id');
  return input;
}

function assertPlayerInput(input: Civ7OperationInput): Civ7OperationInput & { playerId: number } {
  if (!('playerId' in input)) throw new Error('player operation requires --player-id');
  return input;
}

function resultVerified(result: unknown): boolean {
  return result !== null
    && typeof result === 'object'
    && 'verified' in result
    && (result as { verified?: unknown }).verified === true;
}

function parseCoordinatePair(value: string, flag: string): MapLocationFlag {
  const parts = value.split(',').map((part) => part.trim());
  if (parts.length !== 2) throw new Error(`--${flag} must be formatted as x,y`);
  const [xRaw, yRaw] = parts;
  const x = Number(xRaw);
  const y = Number(yRaw);
  if (!Number.isInteger(x) || !Number.isInteger(y)) {
    throw new Error(`--${flag} must contain integer x,y coordinates`);
  }
  return { x, y };
}

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
  type Civ7ActionApproval,
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

export function buildDirectControlOptions(flags: DirectControlFlagOptions): Civ7DirectControlOptions {
  return {
    host: flags.host,
    port: flags.port,
    timeoutMs: flags['timeout-ms'],
  };
}

export function requireSendReason(send: boolean, reason: string | undefined, commandName: string): string {
  if (send && !reason) {
    throw new Error(`${commandName} requires --reason when --send is set`);
  }
  return reason ?? '';
}

export function buildApproval(reason: string): Civ7ActionApproval {
  return {
    approved: true,
    reason,
    disposableSession: true,
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

export function parseComponentId(value: string | undefined, flag: string): Civ7ComponentId {
  return parseJsonFlag<Civ7ComponentId>(value, flag);
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
  approval: Civ7ActionApproval,
) {
  if (family === 'unit-operation') return await requestCiv7UnitOperation(assertUnitInput(input), options, approval);
  if (family === 'unit-command') return await requestCiv7UnitCommand(assertUnitInput(input), options, approval);
  if (family === 'city-operation') return await requestCiv7CityOperation(assertCityInput(input), options, approval);
  if (family === 'city-command') return await requestCiv7CityCommand(assertCityInput(input), options, approval);
  return await requestCiv7PlayerOperation(assertPlayerInput(input), options, approval);
}

export async function executePlayOperationSequence(
  steps: ReadonlyArray<PlayOperationStep>,
  options: Civ7DirectControlOptions,
  config: { send: boolean; reason: string },
) {
  const approval = config.send ? buildApproval(config.reason) : null;
  const results = [];
  for (const step of steps) {
    const result = approval
      ? await sendPlayOperation(step.family, step.input, options, approval)
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

import {
  assertCiv7ComponentId,
  type Civ7ComponentId,
  type Civ7DirectControlOptions,
} from "@civ7/direct-control";

/** CLI endpoint flags accepted by helpers that call the direct-control runtime. */
export type DirectControlFlagOptions = Readonly<{
  host?: string;
  port?: number;
  "timeout-ms": number;
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

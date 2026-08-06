import { Civ7TunerFailure } from "@civ7/tuner";

const DEFAULT_HOST = "127.0.0.1";
const DEFAULT_PORT = 4_318;
const DEFAULT_TIMEOUT_MS = 10_000;
const MAX_TIMEOUT_MS = 2_147_483_647;

/** Concrete configuration accepted by the local-socket Tuner provider. */
export type LocalSocketCiv7TunerOptions = Readonly<{
  host?: string;
  hosts?: readonly string[];
  port?: number;
  timeoutMs?: number;
  env?: Readonly<Record<string, string | undefined>>;
}>;

/** Validated immutable transport configuration for one provider acquisition. */
export type LocalSocketCiv7TunerConfig = Readonly<{
  hosts: readonly string[];
  port: number;
  timeoutMs: number;
}>;

/** Resolves endpoint candidates and rejects invalid transport limits before acquisition. */
export function resolveLocalSocketCiv7TunerConfig(
  options: LocalSocketCiv7TunerOptions = {}
): LocalSocketCiv7TunerConfig {
  const env = options.env ?? process.env;
  const hosts = uniqueNonEmpty([
    ...(options.hosts ?? []),
    options.host,
    ...splitList(env.CIV7_TUNER_HOSTS),
    env.CIV7_TUNER_HOST,
    DEFAULT_HOST,
  ]);

  return {
    hosts,
    port: resolvePort(options.port, env.CIV7_TUNER_PORT),
    timeoutMs: resolveTimeout(options.timeoutMs),
  };
}

function resolvePort(explicit: number | undefined, environment: string | undefined): number {
  const value = explicit ?? environment ?? DEFAULT_PORT;
  const port = Number(value);
  if (!Number.isInteger(port) || port <= 0 || port > 65_535) {
    throw new Civ7TunerFailure({
      operation: "acquire",
      reason: "invalid-configuration",
      message: `Invalid Civ7 Tuner port: ${value}`,
      details: { value },
    });
  }
  return port;
}

function resolveTimeout(explicit: number | undefined): number {
  const timeoutMs = explicit ?? DEFAULT_TIMEOUT_MS;
  if (!Number.isInteger(timeoutMs) || timeoutMs <= 0 || timeoutMs > MAX_TIMEOUT_MS) {
    throw new Civ7TunerFailure({
      operation: "acquire",
      reason: "invalid-configuration",
      message: `Invalid Civ7 Tuner timeout: ${timeoutMs}`,
      details: { value: timeoutMs },
    });
  }
  return timeoutMs;
}

function splitList(value: string | undefined): string[] {
  return (
    value
      ?.split(",")
      .map((entry) => entry.trim())
      .filter(Boolean) ?? []
  );
}

function uniqueNonEmpty(values: readonly (string | undefined)[]): string[] {
  return Array.from(
    new Set(values.map((value) => value?.trim()).filter((value): value is string => Boolean(value)))
  );
}

import { Civ7DirectControlError } from "../direct-control-error.js";
import {
  DEFAULT_CIV7_TUNER_HOST,
  DEFAULT_CIV7_TUNER_PORT,
  DEFAULT_CIV7_TUNER_TIMEOUT_MS,
} from "./constants.js";
import type { Civ7DirectControlOptions } from "./types.js";

export function resolveCiv7DirectControlConfig(options: Civ7DirectControlOptions = {}): {
  hosts: string[];
  port: number;
  timeoutMs: number;
} {
  const env = options.env ?? process.env;
  const hosts = uniqueNonEmpty([
    ...(options.hosts ?? []),
    options.host,
    ...splitEnvList(env.CIV7_TUNER_HOSTS),
    env.CIV7_TUNER_HOST,
    DEFAULT_CIV7_TUNER_HOST,
  ]);
  if (hosts.length === 0) {
    throw new Civ7DirectControlError("no-hosts", "No Civ7 tuner hosts were configured");
  }
  return {
    hosts,
    port: options.port ?? portFromEnv(env) ?? DEFAULT_CIV7_TUNER_PORT,
    timeoutMs: options.timeoutMs ?? DEFAULT_CIV7_TUNER_TIMEOUT_MS,
  };
}

function portFromEnv(env: NodeJS.ProcessEnv): number | undefined {
  if (!env.CIV7_TUNER_PORT) return undefined;
  const port = Number(env.CIV7_TUNER_PORT);
  if (!Number.isInteger(port) || port <= 0 || port > 65_535) {
    throw new Civ7DirectControlError(
      "invalid-port",
      `Invalid CIV7_TUNER_PORT: ${env.CIV7_TUNER_PORT}`
    );
  }
  return port;
}

function splitEnvList(value: string | undefined): string[] {
  return (
    value
      ?.split(",")
      .map((entry) => entry.trim())
      .filter(Boolean) ?? []
  );
}

function uniqueNonEmpty(values: ReadonlyArray<string | undefined>): string[] {
  return Array.from(
    new Set(values.map((value) => value?.trim()).filter((value): value is string => Boolean(value)))
  );
}

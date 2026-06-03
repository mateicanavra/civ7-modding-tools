import { Civ7DirectControlError } from "../direct-control-error.js";
import { resolveCiv7DirectControlConfig } from "./config.js";
import { queryCiv7TunerStates } from "./execute.js";
import type {
  Civ7DirectControlEndpoint,
  Civ7DirectControlOptions,
  Civ7TunerState,
} from "./types.js";

type EndpointDiscoveryDependencies = Readonly<{
  errorMessage: (err: unknown) => string;
  queryTunerStates: (options: Civ7DirectControlOptions & {
    host: string;
    port: number;
    timeoutMs: number;
  }) => Promise<ReadonlyArray<Civ7TunerState>>;
}>;

export async function discoverCiv7DirectControlEndpoint(
  options: Civ7DirectControlOptions = {},
): Promise<Readonly<{ endpoint: Civ7DirectControlEndpoint; states: ReadonlyArray<Civ7TunerState> }>> {
  return await discoverCiv7DirectControlEndpointWithDependencies(options, {
    errorMessage,
    queryTunerStates: queryCiv7TunerStates,
  });
}

export async function discoverCiv7DirectControlEndpointWithDependencies(
  options: Civ7DirectControlOptions = {},
  dependencies: EndpointDiscoveryDependencies,
): Promise<Readonly<{ endpoint: Civ7DirectControlEndpoint; states: ReadonlyArray<Civ7TunerState> }>> {
  const config = resolveCiv7DirectControlConfig(options);
  const errors: Array<{ host: string; error: string }> = [];
  for (const host of config.hosts) {
    try {
      const states = await dependencies.queryTunerStates({
        host,
        port: config.port,
        timeoutMs: config.timeoutMs,
      });
      return {
        endpoint: { host, port: config.port },
        states,
      };
    } catch (err) {
      errors.push({ host, error: dependencies.errorMessage(err) });
    }
  }
  throw new Civ7DirectControlError(
    "all-hosts-unavailable",
    `Unable to reach Civ7 tuner socket on ${config.hosts.join(", ")}:${config.port}`,
    { details: errors },
  );
}

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

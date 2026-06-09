import { Civ7DirectControlError, type Civ7DirectControlErrorCode } from "../direct-control-error.js";
import { DEFAULT_CIV7_TUNER_TIMEOUT_MS } from "./constants.js";
import { discoverCiv7DirectControlEndpoint } from "./discovery.js";
import { selectCiv7TunerState } from "./state.js";
import type {
  Civ7DirectControlHealth,
  Civ7DirectControlOptions,
  Civ7TunerState,
  Civ7TunerStateSelection,
} from "./types.js";

export async function checkCiv7DirectControlHealth(options: Civ7DirectControlOptions & {
  state?: Civ7TunerStateSelection;
} = {}): Promise<Civ7DirectControlHealth> {
  try {
    const discovered = await discoverCiv7DirectControlEndpoint(options);
    if (discovered.states.length === 0) {
      return {
        ok: false,
        status: "no-states",
        host: discovered.endpoint.host,
        port: discovered.endpoint.port,
        states: discovered.states,
        error: new Civ7DirectControlError("state-not-found", "Civ7 tuner returned no scripting states"),
      };
    }
    let selectedState: Civ7TunerState | undefined;
    if (options.state) {
      try {
        selectedState = selectCiv7TunerState(discovered.states, options.state);
      } catch (err) {
        return {
          ok: false,
          status: "state-missing",
          host: discovered.endpoint.host,
          port: discovered.endpoint.port,
          states: discovered.states,
          error: toDirectControlError(err, "state-not-found"),
        };
      }
    }
    return {
      ok: true,
      status: "ready",
      host: discovered.endpoint.host,
      port: discovered.endpoint.port,
      states: discovered.states,
      selectedState,
    };
  } catch (err) {
    const error = toDirectControlError(err, "connection-failed");
    return {
      ok: false,
      status: error.code === "state-not-found" ? "state-missing" : "unavailable",
      error,
    };
  }
}

export async function waitForCiv7DirectControl(options: Civ7DirectControlOptions & {
  state?: Civ7TunerStateSelection;
  waitTimeoutMs?: number;
  pollIntervalMs?: number;
} = {}): Promise<Civ7DirectControlHealth & { ok: true }> {
  const waitTimeoutMs = options.waitTimeoutMs ?? options.timeoutMs ?? DEFAULT_CIV7_TUNER_TIMEOUT_MS;
  const pollIntervalMs = options.pollIntervalMs ?? 500;
  const startedAt = Date.now();
  let lastHealth: Civ7DirectControlHealth | undefined;
  while (Date.now() - startedAt <= waitTimeoutMs) {
    const health = await checkCiv7DirectControlHealth(options);
    if (health.ok) return health;
    lastHealth = health;
    await sleep(pollIntervalMs);
  }
  throw new Civ7DirectControlError("connection-timeout", `Timed out waiting for Civ7 tuner readiness after ${waitTimeoutMs}ms`, {
    details: lastHealth,
  });
}

function toDirectControlError(err: unknown, fallbackCode: Civ7DirectControlErrorCode): Civ7DirectControlError {
  if (err instanceof Civ7DirectControlError) return err;
  return new Civ7DirectControlError(fallbackCode, errorMessage(err), { cause: err });
}

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

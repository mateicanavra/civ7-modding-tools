import type { Civ7DirectControlError } from "../direct-control-error.js";
import type { Civ7DirectControlSession } from "./session.js";

export type Civ7TunerState = Readonly<{
  id: string;
  name: string;
}>;

export type Civ7TunerStateRole = "app-ui" | "tuner";

export type Civ7TunerStateSelection =
  | string
  | Readonly<{
      id?: string;
      name?: string;
      role?: Civ7TunerStateRole;
    }>;

export type Civ7DirectControlEndpoint = Readonly<{
  host: string;
  port: number;
}>;

export type Civ7DirectControlOptions = Readonly<{
  host?: string;
  hosts?: ReadonlyArray<string>;
  port?: number;
  timeoutMs?: number;
  env?: NodeJS.ProcessEnv;
  /**
   * Caller-owned shared session. When present, procedures reuse it (the
   * connection is multiplexed by listenerId, so concurrent calls are fine)
   * and NEVER close it — lifecycle belongs to the owner (e.g. the studio
   * daemon's Effect-scoped `Civ7TunerSession`). When absent, behavior is
   * unchanged: a fresh session per call, closed in `finally`.
   */
  session?: Civ7DirectControlSession;
}>;

/** Read-only health counters observed on a session's socket (all traffic). */
export type Civ7DirectControlSessionStats = Readonly<{
  /** Response-timeouts since the last successfully resolved frame. */
  consecutiveResponseTimeouts: number;
  /** Monotonic response-timeout count for this logical session. */
  totalResponseTimeouts: number;
}>;

export type Civ7CommandResult = Readonly<{
  host: string;
  port: number;
  state: Civ7TunerState;
  output: ReadonlyArray<string>;
}>;

export type Civ7DirectControlHealth =
  | Readonly<{
      ok: true;
      status: "ready";
      host: string;
      port: number;
      states: ReadonlyArray<Civ7TunerState>;
      selectedState?: Civ7TunerState;
    }>
  | Readonly<{
      ok: false;
      status: "unavailable" | "no-states" | "state-missing" | "command-failed";
      host?: string;
      port?: number;
      states?: ReadonlyArray<Civ7TunerState>;
      error: Civ7DirectControlError;
    }>;

import type { Civ7DirectControlError } from "../direct-control-error.js";

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

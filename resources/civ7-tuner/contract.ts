import { Data, type Effect } from "effect";

/** A named JavaScript execution state advertised by the Civ7 Tuner. */
export type Civ7TunerState = Readonly<{
  id: string;
  name: string;
}>;

/** Stable semantic aliases for Civ7's two standard Tuner states. */
export type Civ7TunerStateRole = "app-ui" | "tuner";

/** Selects one advertised state without exposing transport addressing. */
export type Civ7TunerStateSelection =
  | string
  | Readonly<{
      id?: string;
      name?: string;
      role?: Civ7TunerStateRole;
    }>;

/** What the Tuner transport can prove about a failed command dispatch. */
export type Civ7TunerDispatchStatus = "not-dispatched" | "dispatched" | "indeterminate";

/** Stable failure reasons exposed by every Civ7 Tuner provider. */
export type Civ7TunerFailureReason =
  | "invalid-configuration"
  | "connection-timeout"
  | "connection-failed"
  | "unavailable"
  | "response-timeout"
  | "connection-lost"
  | "state-not-found"
  | "command-invalid";

/** Capability operation during which a Tuner failure was observed. */
export type Civ7TunerFailureOperation = "acquire" | "query-states" | "execute" | "reset";

/** Typed provider-neutral failure at the Civ7 Tuner capability boundary. */
export class Civ7TunerFailure extends Data.TaggedError("Civ7TunerFailure")<{
  readonly operation: Civ7TunerFailureOperation;
  readonly reason: Civ7TunerFailureReason;
  readonly message: string;
  readonly dispatchStatus?: Civ7TunerDispatchStatus;
  readonly details?: unknown;
  readonly cause?: unknown;
}> {}

/** Raw result returned after one command completes in a selected Tuner state. */
export type Civ7TunerCommandResult = Readonly<{
  state: Civ7TunerState;
  output: readonly string[];
}>;

/** Provider-neutral observations for one logical Tuner session. */
export type Civ7TunerStatus = Readonly<{
  connectionEpoch: number;
  connected: boolean;
  consecutiveResponseTimeouts: number;
  totalResponseTimeouts: number;
}>;

/**
 * Ready managed access to Civ7's named JavaScript execution states.
 *
 * Acquisition and release belong to the selected provider and application
 * scope. Consumers receive only this capability; they own semantic retries,
 * readiness policy, and interpretation of command output.
 */
export interface Civ7Tuner {
  inspect(): Civ7TunerStatus;
  queryStates(options?: {
    readonly timeoutMs?: number;
    // biome-ignore lint/plugin: Resource contracts explicitly own their typed Effect failure channel.
  }): Effect.Effect<readonly Civ7TunerState[], Civ7TunerFailure>;
  execute(options: {
    readonly command: string;
    readonly state?: Civ7TunerStateSelection;
    readonly timeoutMs?: number;
  }): Effect.Effect<Civ7TunerCommandResult, Civ7TunerFailure>;
  reset(): Effect.Effect<void, Civ7TunerFailure>;
}

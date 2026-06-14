/**
 * `@civ7/studio-server` — public entrypoint.
 *
 * - Contract surface (slice A1): legacy Studio success I/O schemas for the
 *   original endpoints remain Zod; error data and recipe-DAG schemas are
 *   TypeBox/Standard Schema. Do not extend Zod for new durable contract schema
 *   surfaces without an explicit schema-tech decision.
 * - Effect services (A2): `Civ7TunerClient`, `StudioConfig`; `Civ7TunerSession`
 *   (tuner-session workstream) — the scoped owner of the ONE shared FireTuner
 *   connection, with the backoff gate and the host injection/health ports.
 * - effect-orpc router (A3): `createStudioRouter` + non-uniform error mapping.
 * - Host handler (A4-lite): `createStudioRpcHandler(context)` → an `RPCHandler`
 *   the host Studio server mounts at `/rpc`, plus `tuner.*` ports and
 *   the `dispose()` shutdown obligation.
 *
 * The host supplies a {@link StudioServerContext} carrying the process singletons,
 * the catalog loader, and the three stateful engine fns (shared queue + dual-store
 * mutex live host-side) — see ./context.ts.
 */
export {
  contract,
  studioEffectContract,
  civ7,
  live,
  mapConfigs,
  runInGame,
  studio,
} from "./contract/index.js";
export type { StudioContract, StudioEffectContract, RecipeDagResult } from "./contract/index.js";
export type { RecipeDagService } from "./recipeDag/service.js";

export type {
  StudioServerContext,
  StudioInputs,
  StudioOutputs,
  SetupCatalog,
} from "./context.js";
export type {
  StudioEvent,
  StudioHelloEvent,
  StudioLiveGameEvent,
  StudioOperationEvent,
  StudioOperationsCurrent,
} from "./contract/studio.js";
export { createStudioRpcHandler, type StudioRpcHandle } from "./handler.js";
export { createStudioRouter, type StudioRouter } from "./router/index.js";
export { makeStudioRuntime, type StudioRuntime } from "./runtime.js";
export { Civ7TunerClient } from "./services/Civ7TunerClient.js";
export {
  CIV7_TUNER_GATE_COOLDOWN_MS,
  CIV7_TUNER_GATE_THRESHOLD,
  Civ7TunerBackoffError,
  Civ7TunerSession,
  Civ7TunerSessionLive,
  makeCiv7TunerSessionLayer,
  type Civ7TunerSessionApi,
  type Civ7TunerSessionHealth,
  type Civ7TunerSessionOptions,
} from "./services/Civ7TunerSession.js";
export { StudioConfig } from "./services/StudioConfig.js";
export {
  createStudioEventHub,
  StudioEventHub,
  type StudioEventHubApi,
} from "./services/StudioEventHub.js";
export {
  buildLiveGameErrorState,
  buildLiveGameState,
  hashLiveGameValue,
  liveGameStateKey,
  liveGameStateSchema,
  stableLiveGameStringify,
  type LiveGameBindingStatus,
  type LiveGameSnapshotStatus,
  type LiveGameState,
  type LiveGameStatusBody,
  type LiveGameStatusKind,
} from "./liveGame/model.js";
export {
  createLiveGameWatcher,
  createRuntimeLiveGameWatcher,
  LIVE_GAME_WATCH_INITIAL_DELAY_MS,
  LIVE_GAME_WATCH_INTERVAL_MS,
  type LiveGameWatcher,
  type LiveGameWatcherOptions,
} from "./liveGame/watcher.js";

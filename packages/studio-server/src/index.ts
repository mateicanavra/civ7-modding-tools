/**
 * `@civ7/studio-server` — public entrypoint.
 *
 * - Contract surface (D2.5): Studio public inputs, outputs, stream events, and
 *   declared error data are TypeBox-owned and exposed to oRPC through the
 *   package Standard Schema adapter. App modules derive public operation DTO
 *   types from this package rather than defining wire shapes locally.
 * - Effect services (A2): `Civ7TunerClient`, `StudioConfig`; `Civ7TunerSession`
 *   (tuner-session workstream) — the scoped owner of the ONE shared FireTuner
 *   connection, with the backoff gate and the host injection/health ports.
 * - effect-orpc router (A3): `createStudioRouter` + non-uniform error mapping.
 * - Host handler (A4-lite): `createStudioRpcHandler(context)` → an `RPCHandler`
 *   the host (the studio Bun daemon) mounts at `/rpc`, plus `tuner.*` ports and
 *   the `dispose()` shutdown obligation.
 *
 * The host supplies a {@link StudioServerContext} carrying the process singletons,
 * the catalog loader, and the three stateful engine fns (shared queue + dual-store
 * mutex live host-side) — see ./context.ts.
 */

export type {
  SetupCatalog,
  StudioInputs,
  StudioOutputs,
  StudioServerContext,
} from "./context.js";
export type { RecipeDagResult, StudioContract, StudioEffectContract } from "./contract/index.js";
export {
  civ7,
  contract,
  live,
  mapConfigs,
  runInGame,
  studio,
  studioEffectContract,
} from "./contract/index.js";
export type {
  MapConfigSaveDeployKind,
  MapConfigSaveDeployPhase,
  MapConfigSaveDeployStatus,
} from "./contract/mapConfigs.js";
export { MAP_CONFIG_SAVE_DEPLOY_PHASES } from "./contract/mapConfigs.js";
export type {
  RunInGameContentMarkerProof,
  RunInGameExactAuthorshipProof,
  RunInGameFailureDetails,
  RunInGameFileContentProof,
  RunInGameFileIdentity,
  RunInGameMaterializationStatus,
  RunInGameOperationKind,
  RunInGameOperationStatus,
  RunInGamePhase,
  RunInGameProcessRestartStatus,
  RunInGameRequestStatus,
  RunInGameSourceSnapshotProof,
} from "./contract/runInGame.js";
export { RUN_IN_GAME_PHASES } from "./contract/runInGame.js";
export type {
  StudioEvent,
  StudioHelloEvent,
  StudioLiveGameEvent,
  StudioOperationEvent,
  StudioOperationsCurrent,
} from "./contract/studio.js";
export { createStudioRpcHandler, type StudioRpcHandle } from "./handler.js";
export {
  buildLiveGameErrorState,
  buildLiveGameState,
  hashLiveGameValue,
  type LiveGameBindingStatus,
  type LiveGameSnapshotStatus,
  type LiveGameState,
  type LiveGameStatusBody,
  type LiveGameStatusKind,
  liveGameStateKey,
  liveGameStateSchema,
  stableLiveGameStringify,
} from "./liveGame/model.js";
export {
  createLiveGameWatcher,
  createRuntimeLiveGameWatcher,
  LIVE_GAME_WATCH_INITIAL_DELAY_MS,
  LIVE_GAME_WATCH_INTERVAL_MS,
  type LiveGameWatcher,
  type LiveGameWatcherOptions,
} from "./liveGame/watcher.js";
export type { RecipeDagService } from "./recipeDag/service.js";
export { createStudioRouter, type StudioRouter } from "./router/index.js";
export { makeStudioRuntime, type StudioRuntime } from "./runtime.js";
export { Civ7TunerClient } from "./services/Civ7TunerClient.js";
export {
  CIV7_TUNER_GATE_COOLDOWN_MS,
  CIV7_TUNER_GATE_THRESHOLD,
  Civ7TunerBackoffError,
  Civ7TunerSession,
  type Civ7TunerSessionApi,
  type Civ7TunerSessionHealth,
  Civ7TunerSessionLive,
  type Civ7TunerSessionOptions,
  makeCiv7TunerSessionLayer,
} from "./services/Civ7TunerSession.js";
export { StudioConfig } from "./services/StudioConfig.js";
export {
  createStudioEventHub,
  StudioEventHub,
  type StudioEventHubApi,
} from "./services/StudioEventHub.js";
export {
  toStandardSchema,
  typeboxInputSchemaFromContractProcedure,
  typeboxOutputSchemaFromContractProcedure,
  typeboxSchemaFromStandardSchema,
} from "./typeboxStandardSchema.js";

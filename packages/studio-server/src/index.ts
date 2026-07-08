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
 * The host supplies a {@link StudioServerContext} carrying leaf filesystem,
 * resource, control, recipe-DAG, and operation adapter ports. The package
 * runtime owns stateful operation and event lifecycle.
 */

// Contract re-exports below are NAMED on purpose — esbuild drops
// `export * from "<external>"` when this module is code-split into a shared
// chunk (values silently vanish from dist; see src/contract/index.ts). Any
// new contract re-export must be added by name.
export type {
  CatalogLaunchSource,
  EditorLaunchSource,
  LaunchEnvelope,
  LaunchEnvelopeDigest,
  LaunchSource,
  LaunchSourceDigest,
  MapConfigSaveDeployKind,
  MapConfigSaveDeployPhase,
  MapConfigSaveDeployStatus,
  RecipeDagResult,
  ResolvedLaunchSource,
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
  StudioEffectContract,
  StudioEvent,
  StudioHelloEvent,
  StudioLiveGameEvent,
  StudioOperationEvent,
  StudioOperationsCurrent,
} from "@civ7/studio-contract";
export {
  buildLiveGameErrorState,
  buildLiveGameState,
  civ7,
  hashLiveGameValue,
  type LiveGameBindingStatus,
  type LiveGameSnapshotStatus,
  type LiveGameState,
  type LiveGameStatusBody,
  type LiveGameStatusKind,
  live,
  liveGameStateKey,
  liveGameStateSchema,
  MAP_CONFIG_SAVE_DEPLOY_PHASES,
  mapConfigs,
  RUN_IN_GAME_PHASES,
  runInGame,
  stableLiveGameStringify,
  studio,
  studioEffectContract,
  toStandardSchema,
  typeboxInputSchemaFromContractProcedure,
  typeboxOutputSchemaFromContractProcedure,
  typeboxSchemaFromStandardSchema,
} from "@civ7/studio-contract";
export type {
  SetupCatalog,
  StudioInputs,
  StudioOutputs,
  StudioServerContext,
} from "./context.js";
export type { StudioContract } from "./contract/index.js";
export { contract } from "./contract/index.js";
export type {
  DependencyUnavailableData,
  ExpectedFailureErrorData,
  FailedErrorData,
  StatusNotFoundData,
  StatusNotFoundErrorData,
  StudioBoundedDiagnostics,
  StudioDefinedErrorProjection,
  StudioFailureData,
  StudioOperationProcedure,
  StudioRecoveryAction,
  StudioRuntimeFailure,
  UnavailableFailureErrorData,
  UnexpectedDefectData,
} from "./errors/index.js";
export {
  autoplayStartStopFailed,
  autoplayVerificationFailed,
  daemonIdentityMismatch,
  dependencyUnavailable,
  deployFailed,
  expectedFailureDataSchema,
  expectedFailureErrorDataSchema,
  failedErrorDataSchema,
  invalidRequest,
  isStudioRuntimeFailure,
  mapStudioFailureToDefinedError,
  mapUnexpectedDefectToDefinedError,
  mapUnknownToStudioDefinedError,
  materializationFailed,
  operationBlocked,
  operationExpired,
  operationNotFound,
  proofFailed,
  runtimeDisposed,
  STUDIO_FAILURE_REASON_CODES,
  STUDIO_FAILURE_TAGS,
  STUDIO_OPERATION_NAMESPACES,
  STUDIO_OPERATION_PROCEDURES,
  STUDIO_RECOVERY_ACTIONS,
  statusNotFoundErrorDataSchema,
  studioFailureDataSchema,
  studioRecoveryActionSchema,
  toStudioDefinedOrpcError,
  unavailableFailureErrorDataSchema,
  unsupportedOperationType,
} from "./errors/index.js";
export { createStudioRpcHandler, type StudioRpcHandle } from "./handler.js";
export {
  LIVE_GAME_WATCH_INITIAL_DELAY_MS,
  LIVE_GAME_WATCH_INTERVAL_MS,
  type LiveGameWatcher,
  type LiveGameWatcherOptions,
  makeStudioLiveGameWatcherLayer,
  StudioLiveGameWatcher,
} from "./liveGame/watcher.js";
export type {
  CanonicalRunInGameRequest,
  RunInGameDeployment,
  RunInGameLogEvidence,
  RunInGamePreparedRequest,
  RunInGameRuntimeObservation,
  RunInGameSetupPrepared,
  StudioOperationRuntimePorts,
} from "./operationRuntime/index.js";
export {
  buildRunInGameSourceSnapshotProof,
  hashRunInGameProofValue,
} from "./operationRuntime/index.js";
export type { RecipeDagService } from "./recipeDag/service.js";
export { createStudioRouter, type StudioRouter } from "./router/index.js";
export { makeStudioRuntime, type StudioRuntime, type StudioRuntimeOptions } from "./runtime.js";
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
  StudioEventHub,
  type StudioEventHubApi,
  StudioEventHubLive,
  type StudioEventSubscription,
  studioEventSubscriptionIterator,
} from "./services/StudioEventHub.js";

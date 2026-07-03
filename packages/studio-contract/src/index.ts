import { oc } from "@orpc/contract";
import * as civ7 from "./civ7.js";
import * as live from "./live.js";
import * as mapConfigs from "./mapConfigs.js";
import { RecipeDagGetContract } from "./recipeDag/contract.js";
import * as runInGame from "./runInGame.js";
import * as studio from "./studio.js";

/**
 * `@civ7/studio-contract` — the studio-owned oRPC contract artifact.
 *
 * Contract-first topology (oRPC monorepo shape): this package DEFINES the
 * studio surface (plain `oc` routers + TypeBox schemas + the public DTO
 * types); `@civ7/studio-server` IMPLEMENTS it
 * (`implementEffect(studioEffectContract, runtime)`) and owns the merged
 * client-facing mount (`contract` / `StudioContract` on its `./contract`
 * subpath — the `civ7.*` spread with `@civ7/control-orpc`'s contract, a
 * server composition that must not enter this foundation package); clients
 * (the studio app, the studio UI package) type against THIS artifact and
 * never reach into server code.
 *
 * Runtime discipline: plain `oc` + TypeBox + `@standard-schema/spec` only —
 * no Effect, no `@orpc/server`, no effect-orpc. The dependency list is the
 * enforcement for external packages (bun's isolated installs: an undeclared
 * import doesn't resolve); the `kind:foundation` boundary row fences
 * workspace-package imports (it does not govern external npm imports).
 */
export const studioCiv7Contract = {
  status: civ7.status,
  mapSummary: civ7.mapSummary,
  gameInfo: civ7.gameInfo,
  autoplay: civ7.autoplay,
  setupConfig: civ7.setupConfig,
  savedConfigs: civ7.savedConfigs,
  setupCatalog: civ7.setupCatalog,
  live: {
    status: live.status,
    snapshot: live.snapshot,
    entities: live.entities,
    gameInfo: live.gameInfo,
  },
} as const;

export const studioEffectContract = oc.router({
  civ7: studioCiv7Contract,
  runInGame: {
    start: runInGame.start,
    status: runInGame.status,
  },
  mapConfigs: {
    saveDeploy: mapConfigs.saveDeploy,
    status: mapConfigs.status,
  },
  studio: {
    serverInfo: studio.serverInfo,
    events: {
      watch: studio.eventsWatch,
    },
    operations: {
      current: studio.operationsCurrent,
    },
  },
  recipeDag: {
    get: RecipeDagGetContract,
  },
});

export type StudioEffectContract = typeof studioEffectContract;

export * from "./errors/errorData.js";
export * from "./errors/failure.js";
export * from "./lib/typeboxStandardSchema.js";
export * from "./liveGame/model.js";
export type {
  MapConfigSaveDeployKind,
  MapConfigSaveDeployPhase,
  MapConfigSaveDeployStatus,
} from "./mapConfigs.js";
export {
  MAP_CONFIG_SAVE_DEPLOY_PHASES,
  saveDeployStatusTypeSchema,
} from "./mapConfigs.js";
export * from "./recipeDag/contract.js";
export * from "./recipeDag/errors.js";
export * from "./recipeDag/schema.js";
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
  RunInGamePlayerSetupConfig,
  RunInGameProcessRestartStatus,
  RunInGameRequestStatus,
  RunInGameSavedSetupConfigRef,
  RunInGameSetupConfig,
  RunInGameSetupOptionValue,
  RunInGameSourceSnapshotProof,
} from "./runInGame.js";
export {
  DEFAULT_RUN_IN_GAME_SETUP_CONFIG,
  materializationStatus,
  normalizeRunInGameSetupConfig,
  operationStatusTypeSchema,
  RUN_IN_GAME_CUSTOM_DIFFICULTY_OPTION_IDS,
  RUN_IN_GAME_MAIN_GAME_OPTION_IDS,
  RUN_IN_GAME_PHASES,
  RUN_IN_GAME_PLAYER_OPTION_IDS,
  validateRunInGameSetupConfig,
} from "./runInGame.js";
export type {
  StudioEvent,
  StudioHelloEvent,
  StudioLiveGameEvent,
  StudioOperationEvent,
  StudioOperationsCurrent,
} from "./studio.js";
export { civ7, live, mapConfigs, runInGame, studio };

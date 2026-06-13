import { oc } from "@orpc/contract";
import { Civ7ControlOrpcContract } from "@civ7/control-orpc";

import { RecipeDagGetContract } from "../recipeDag/contract.js";
import * as civ7 from "./civ7.js";
import * as live from "./live.js";
import * as mapConfigs from "./mapConfigs.js";
import * as runInGame from "./runInGame.js";
import * as studio from "./studio.js";

/**
 * Root oRPC contract for `@civ7/studio-server` — the ONE surface the daemon
 * mounts at `/rpc` (runtime-one-mount slice, DP-1).
 *
 * Two layers:
 *
 * - `studioEffectContract` — the procedures THIS package implements with
 *   effect-orpc against the one `ManagedRuntime`: the studio read/engine
 *   surface (16-endpoint corpus, legacy statuses pinned per procedure) plus
 *   `recipeDag.get` (host-injected service via the `StudioConfig` layer).
 * - `contract` (public) — the unified client-facing contract:
 *   `studioEffectContract` with the canonical Civ7 control contract spread
 *   under `civ7.*`. The control procedures are implemented by
 *   `@civ7/control-orpc`'s prebuilt router and merged at the handler level;
 *   their I/O and error schemas are untouched here.
 *
 * The `civ7.*` merge is collision-proof: the studio keys
 * (status/mapSummary/gameInfo/autoplay/setupConfig/savedConfigs/setupCatalog/live)
 * and the control namespaces
 * (attention/city/diplomacy/display/government/narrative/notifications/
 * progression/readiness/strategy/turn/unit/view/world) are disjoint, and the
 * single-mount contract pin asserts that stays true.
 */
const studioCiv7Contract = {
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

export const contract = oc.router({
  ...studioEffectContract,
  civ7: {
    ...studioCiv7Contract,
    ...Civ7ControlOrpcContract,
  },
});

export type StudioContract = typeof contract;

export type { RecipeDagResult } from "../recipeDag/schema.js";
export type { StudioEvent, StudioHelloEvent, StudioLiveGameEvent, StudioOperationEvent } from "./studio.js";
export { civ7, live, mapConfigs, runInGame, studio };

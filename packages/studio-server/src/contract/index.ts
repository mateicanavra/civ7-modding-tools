import { oc } from "@orpc/contract";

import * as civ7 from "./civ7.js";
import * as live from "./live.js";
import * as mapConfigs from "./mapConfigs.js";
import * as runInGame from "./runInGame.js";
import * as studio from "./studio.js";

/**
 * Root oRPC contract for `@civ7/studio-server`.
 *
 * Contract-first (slice A1): this composes the 16-endpoint corpus into the
 * namespaced procedure tree from audit/05-server-contracts.md §"Proposed oRPC
 * router shape". NO business logic — only zod I/O contracts. The Effect services
 * (A2), effect-orpc router + non-uniform errorMap (A3), and Bun entrypoint (A4)
 * implement against this surface.
 *
 * Namespace → path mapping (legacy `/api/...` path preserved for cutover):
 *   civ7.status            GET  /api/civ7/status              (#1)
 *   civ7.mapSummary        GET  /api/civ7/map-summary         (#2)
 *   civ7.gameInfo          GET  /api/civ7/gameinfo            (#3)
 *   civ7.live.status       GET  /api/civ7/live/status         (#4)
 *   civ7.live.snapshot     GET  /api/civ7/live/snapshot       (#5)
 *   civ7.live.entities     GET  /api/civ7/live/entities       (#6)
 *   civ7.live.gameInfo     GET  /api/civ7/live/gameinfo       (#7)
 *   civ7.autoplay          POST /api/civ7/autoplay            (#8)
 *   civ7.setupConfig       GET  /api/civ7/setup-config        (#10)
 *   civ7.savedConfigs      GET  /api/civ7/saved-configs       (#11)
 *   civ7.setupCatalog      GET  /api/civ7/setup-catalog       (#12)
 *   runInGame.start        POST /api/civ7/run-in-game         (#14)
 *   runInGame.status       GET  /api/civ7/run-in-game/status  (#13)
 *   mapConfigs.saveDeploy  POST /api/map-configs              (#16)
 *   mapConfigs.status      GET  /api/map-configs/status       (#15)
 *   studio.serverInfo      GET  /api/studio/server-info       (#9)
 */
export const contract = oc.router({
  civ7: {
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
  },
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
  },
});

export type StudioContract = typeof contract;

export { civ7, live, mapConfigs, runInGame, studio };

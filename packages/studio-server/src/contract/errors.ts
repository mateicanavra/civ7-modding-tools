import { z } from "zod";

/**
 * Typed contract error maps for `@civ7/studio-server` — oRPC NATIVE defined errors.
 *
 * Each procedure attaches the error codes it can emit via `oc.errors(...)`, so the
 * non-uniform legacy HTTP statuses (architecture/10 §7 do-not-break registry) are
 * pinned on DECLARED codes instead of ad-hoc `ORPCError` construction:
 *   - reads: gameInfo/live.* → 400, setupConfig → 503, everything else → 500
 *   - engines: 409 *_BLOCKED / 400 *_INVALID / 404 *_STATUS_NOT_FOUND /
 *     503 *_UNAVAILABLE / 500 *_FAILED
 *
 * Two emission paths resolve to the SAME defined wire errors:
 *   1. Router procedures throw via the typed `errors.CODE({ message, data })`
 *      constructor param (effect-orpc forwards oRPC's native constructor map).
 *   2. The host context (apps/mapgen-studio/src/server/studio/context.ts) maps
 *      engine `RunInGameHttpError`s to raw `new ORPCError(code, { status, … })`;
 *      because code/status/data match a declared entry, oRPC validates and
 *      delivers them client-side as DEFINED errors (the "combining both
 *      approaches" rule) without importing this module.
 *
 * All `data` schemas are PERMISSIVE (optional fields, open `details` records,
 * optional top level) so engine payload evolution can never flunk validation and
 * silently downgrade a defined error to an undefined one.
 */

/** `observedAt` echo carried by the read failures that historically included it. */
const observedAtData = z
  .object({
    observedAt: z.string().optional(),
  })
  .optional();

/**
 * Engine failure payload: the `RunInGameHttpError.details` open record
 * (`code`, `activeRequestId`, `materialization`, recovery boundaries, …).
 */
const engineDetailsData = z
  .object({
    details: z.object({}).catchall(z.unknown()).optional(),
  })
  .optional();

/**
 * Run-in-game status-miss echo: the server identity the client uses for
 * restart detection (PARITY INVARIANT, audit/05 #13).
 */
const serverIdentityEchoData = z
  .object({
    serverInstanceId: z.string().optional(),
    serverStartedAt: z.string().optional(),
  })
  .optional();

// ---------------------------------------------------------------------------
// civ7.* reads — per-procedure codes (legacy statuses preserved exactly)
// ---------------------------------------------------------------------------

export const civ7StatusErrors = {
  CIV7_STATUS_UNAVAILABLE: {
    status: 500,
    message: "Civ7 status request failed",
  },
} as const;

export const civ7MapSummaryErrors = {
  CIV7_MAP_SUMMARY_UNAVAILABLE: {
    status: 500,
    message: "Civ7 map summary request failed",
  },
} as const;

export const civ7GameInfoErrors = {
  CIV7_GAMEINFO_FAILED: {
    status: 400,
    message: "Civ7 GameInfo request failed",
  },
} as const;

export const liveSnapshotErrors = {
  CIV7_LIVE_SNAPSHOT_FAILED: {
    status: 400,
    message: "Civ7 live snapshot request failed",
  },
} as const;

export const liveEntitiesErrors = {
  CIV7_LIVE_ENTITIES_FAILED: {
    status: 400,
    message: "Civ7 live entities request failed",
  },
} as const;

export const liveGameInfoErrors = {
  CIV7_LIVE_GAMEINFO_FAILED: {
    status: 400,
    message: "Civ7 live GameInfo request failed",
  },
} as const;

export const setupConfigErrors = {
  SETUP_CONFIG_UNAVAILABLE: {
    status: 503,
    message: "Civ7 setup config unavailable",
    data: observedAtData,
  },
} as const;

export const savedConfigsErrors = {
  SAVED_CONFIGS_UNAVAILABLE: {
    status: 500,
    message: "Civ7 saved configurations unavailable",
    data: observedAtData,
  },
} as const;

export const setupCatalogErrors = {
  SETUP_CATALOG_UNAVAILABLE: {
    status: 500,
    message: "Civ7 setup catalog unavailable",
    data: observedAtData,
  },
} as const;

// ---------------------------------------------------------------------------
// civ7.autoplay — host engine (409 dual-store mutex / 500 fallback)
// ---------------------------------------------------------------------------

export const autoplayErrors = {
  AUTOPLAY_BLOCKED: {
    status: 409,
    message: "Civ7 autoplay is blocked by an active operation",
    data: engineDetailsData,
  },
  AUTOPLAY_FAILED: {
    status: 500,
    message: "Civ7 autoplay request failed",
    data: engineDetailsData,
  },
} as const;

// ---------------------------------------------------------------------------
// runInGame.* — host engine (409/400/500/503; 404 with server-identity echo)
// ---------------------------------------------------------------------------

export const runInGameErrors = {
  RUN_IN_GAME_BLOCKED: {
    status: 409,
    message: "Run in Game is blocked by an active operation",
    data: engineDetailsData,
  },
  RUN_IN_GAME_INVALID: {
    status: 400,
    message: "Invalid Run in Game request",
    data: engineDetailsData,
  },
  RUN_IN_GAME_FAILED: {
    status: 500,
    message: "Run in Game failed",
    data: engineDetailsData,
  },
  RUN_IN_GAME_UNAVAILABLE: {
    status: 503,
    message: "Run in Game dependencies are unavailable",
    data: engineDetailsData,
  },
  RUN_IN_GAME_STATUS_NOT_FOUND: {
    status: 404,
    message: "Run in Game request not found",
    data: serverIdentityEchoData,
  },
} as const;

// ---------------------------------------------------------------------------
// mapConfigs.* — host engine (409 mutex / 400 validation; 404 WITHOUT echo)
// ---------------------------------------------------------------------------

export const mapConfigsErrors = {
  SAVE_DEPLOY_BLOCKED: {
    status: 409,
    message: "Save/Deploy is blocked by an active operation",
    data: engineDetailsData,
  },
  SAVE_DEPLOY_INVALID: {
    status: 400,
    message: "Invalid Save/Deploy request",
    data: engineDetailsData,
  },
  SAVE_DEPLOY_FAILED: {
    status: 500,
    message: "Save failed",
    data: engineDetailsData,
  },
  // PARITY NOTE (audit/05 #15): unlike RUN_IN_GAME_STATUS_NOT_FOUND, this 404
  // carries NO serverInstanceId/serverStartedAt echo — the documented asymmetry
  // is preserved (no echo data schema here, and the host context never adds one).
  SAVE_DEPLOY_STATUS_NOT_FOUND: {
    status: 404,
    message: "Save/Deploy request not found",
  },
} as const;

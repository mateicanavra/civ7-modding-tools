import { oc } from "@orpc/contract";
import { z } from "zod";

import { gameInfoRow, isoTimestamp, unknownRecord } from "./shared.js";

/**
 * `civ7.*` namespace — FireTuner socket reads + autoplay mutation.
 *
 * Source of truth: audit/05-server-contracts.md endpoints #1, #2, #3, #8, #10,
 * #11, #12 (and the `civ7.live.*` sub-namespace lives in ./live.ts).
 *
 * Parity note (errorMap, lands A3): error status codes are NON-UNIFORM across
 * these procedures (gameInfo→400, setupConfig→503, savedConfigs/setupCatalog→500,
 * status/mapSummary→500, autoplay→400/409/500). The success `output` schemas below
 * are the contract surface; per-procedure error semantics are documented inline.
 */

// ---------------------------------------------------------------------------
// #1 civ7.status — GET /api/civ7/status
// ---------------------------------------------------------------------------
// Request: none. Success 200: { ok: status.playable, status: PlayableStatus }.
// Error 500: { ok:false, error }. Reads FireTuner socket (getCiv7PlayableStatus).
export const status = oc
  .input(z.object({}))
  .output(
    z.object({
      ok: z.boolean(),
      // Civ7PlayableStatusResult (@civ7/direct-control). Opaque payload — see shared.ts.
      status: unknownRecord,
    }),
  );

// ---------------------------------------------------------------------------
// #2 civ7.mapSummary — GET /api/civ7/map-summary
// ---------------------------------------------------------------------------
// Request: none (server calls with { includeAreaRegionCounts: true }).
// Success 200: { ok:true, summary: MapSummary }. Error 500: { ok:false, error }.
export const mapSummary = oc
  .input(z.object({}))
  .output(
    z.object({
      ok: z.literal(true),
      // Civ7MapSummaryResult (@civ7/direct-control). Opaque payload.
      summary: unknownRecord,
    }),
  );

// ---------------------------------------------------------------------------
// #3 civ7.gameInfo — GET /api/civ7/gameinfo?table=&limit=
// ---------------------------------------------------------------------------
// Query: table (string, REQUIRED), limit (number, default 100).
// Success 200: { ok:true, rows }. Error 400 (incl. missing table): { ok:false, error }.
// NOTE: error status is 400 here, NOT 500.
export const gameInfo = oc
  .input(
    z.object({
      table: z.string().min(1),
      limit: z.number().int().default(100),
    }),
  )
  .output(
    z.object({
      ok: z.literal(true),
      rows: z.array(gameInfoRow),
    }),
  );

// ---------------------------------------------------------------------------
// #8 civ7.autoplay — POST /api/civ7/autoplay
// ---------------------------------------------------------------------------
// Body: { action: "start" | "stop" }.
// Success 200: { ok: result.verified, action, autoplay, game, gameContext, result }.
// Errors: 400 (bad action); 409 (run-in-game OR save/deploy active, with
// details.code); 500 { ok:false, error }. Mutates game state; waits on scripting
// log markers (waitTimeoutMs≈90s). Dual-store 409 mutex + approval object land A3.
export const autoplay = oc
  .input(
    z.object({
      action: z.enum(["start", "stop"]),
    }),
  )
  .output(
    z.object({
      ok: z.boolean(),
      action: z.enum(["start", "stop"]),
      // The following mirror Civ7AutoplayStatusResult fields + the action result.
      autoplay: unknownRecord,
      game: unknownRecord,
      gameContext: unknownRecord,
      // Civ7AutoplayActionResult (@civ7/direct-control). Opaque payload.
      result: unknownRecord,
    }),
  );

// ---------------------------------------------------------------------------
// #10 civ7.setupConfig — GET /api/civ7/setup-config
// ---------------------------------------------------------------------------
// Request: none. Success 200: { ok:true, observedAt, setup, state, host, port }.
// Error 503 (UNIQUE): { ok:false, error, observedAt }. Reads FireTuner socket.
export const setupConfig = oc
  .input(z.object({}))
  .output(
    z.object({
      ok: z.literal(true),
      observedAt: isoTimestamp,
      // Civ7SetupSnapshot (@civ7/direct-control). Opaque payload.
      setup: unknownRecord,
      state: unknownRecord,
      host: z.string(),
      port: z.number(),
    }),
  );

// ---------------------------------------------------------------------------
// #11 civ7.savedConfigs — GET /api/civ7/saved-configs
// ---------------------------------------------------------------------------
// Request: none. Success 200: { ok:true, observedAt, directory, configurations }
// (spread of listCiv7SavedGameConfigurations listResult). Error 500:
// { ok:false, error, observedAt }. Reads filesystem (Civ7 saved-config dir).
export const savedConfigs = oc
  .input(z.object({}))
  .output(
    z.object({
      ok: z.literal(true),
      observedAt: isoTimestamp,
      directory: z.string(),
      configurations: z.array(unknownRecord),
    }),
  );

// ---------------------------------------------------------------------------
// #12 civ7.setupCatalog — GET /api/civ7/setup-catalog
// ---------------------------------------------------------------------------
// Request: none. Success 200: { ok:true, catalog: Civ7SetupCatalog }.
// Error 500: { ok:false, error, observedAt }. Reads filesystem (repo mirror +
// macOS Steam app Resources). `catalog` reproduces the Civ7SetupCatalog type from
// apps/mapgen-studio/src/server/civ7Resources/catalog.ts faithfully.

const setupCatalogOption = z.object({
  value: z.string(),
  label: z.string(),
  source: z.enum(["official-resource-mirror", "app-resources"]),
  sourcePath: z.string(),
});

export const setupCatalogSchema = z.object({
  observedAt: isoTimestamp,
  roots: z.array(
    z.object({
      source: z.enum(["official-resource-mirror", "app-resources"]),
      path: z.string(),
      exists: z.boolean(),
    }),
  ),
  sourceFileCount: z.number(),
  leaders: z.array(setupCatalogOption),
  civilizations: z.array(setupCatalogOption),
  difficulties: z.array(setupCatalogOption),
  gameSpeeds: z.array(setupCatalogOption),
});

export const setupCatalog = oc.input(z.object({})).output(
  z.object({
    ok: z.literal(true),
    catalog: setupCatalogSchema,
  }),
);

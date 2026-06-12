import { oc } from "@orpc/contract";
import { z } from "zod";

import {
  liveEntitiesErrors,
  liveGameInfoErrors,
  liveSnapshotErrors,
} from "./errors.js";
import { isoTimestamp, unknownRecord } from "./shared.js";

/**
 * `civ7.live.*` sub-namespace — aggregated live runtime reads.
 *
 * Source of truth: audit/05-server-contracts.md endpoints #4 (status), #5
 * (snapshot), #6 (entities), #7 (gameInfo).
 */

/**
 * A field that is either the live payload or an embedded `{ error }` marker.
 *
 * PARITY INVARIANT (audit/05 #4, line 29; target-arch §1 invariants): `live.status`
 * returns **200** even on partial failure — each of the four aggregated reads runs
 * under `Promise.allSettled`, and a rejected read is surfaced in-band as
 * `{ error: String(reason) }` for that field. These are NOT transport-layer errors —
 * `live.status` therefore declares NO contract error codes (only an outer defect
 * yields a transport-level 500).
 */
const fieldOrError = z.union([unknownRecord, z.object({ error: z.string() })]);

// ---------------------------------------------------------------------------
// #4 civ7.live.status — GET /api/civ7/live/status
// ---------------------------------------------------------------------------
// Request: none. Success 200: { ok, playable, observedAt, status, appUi,
// mapSummary, autoplay } where ok = playableStatus && readiness !== "unavailable",
// and each of status/appUi/mapSummary/autoplay may be the payload OR { error }
// (Promise.allSettled). Error 500 ONLY on outer throw.
export const status = oc
  .input(z.object({}))
  .output(
    z.object({
      ok: z.boolean(),
      playable: z.boolean(),
      observedAt: isoTimestamp,
      status: fieldOrError,
      appUi: fieldOrError,
      mapSummary: fieldOrError,
      autoplay: fieldOrError,
    }),
  );

// ---------------------------------------------------------------------------
// #5 civ7.live.snapshot — GET /api/civ7/live/snapshot
// ---------------------------------------------------------------------------
// Query: x(0), y(0), width(24), height(18),
//   fields(csv, default "terrain,biome,feature,resource,visibility,owner"),
//   playerId(opt → number or omitted), maxPlots(clamp 1..512, default 512).
// Success 200: { ok:true, observedAt, grid }. Error 400: { ok:false, error }.
//
// PARITY NOTE (audit/05 #5): the exact query parsing — `maxPlots` clamp to 1..512,
// `fields` csv split/trim/filter, `playerId` null→omit — lives in the handler (A3).
// Contract input defaults below document the wire defaults; clamping is applied
// server-side. `fields` is accepted as the raw csv string to preserve parsing parity.
export const snapshot = oc
  .errors(liveSnapshotErrors)
  .input(
    z.object({
      x: z.number().int().default(0),
      y: z.number().int().default(0),
      width: z.number().int().default(24),
      height: z.number().int().default(18),
      fields: z.string().default("terrain,biome,feature,resource,visibility,owner"),
      playerId: z.number().int().optional(),
      maxPlots: z.number().int().default(512),
    }),
  )
  .output(
    z.object({
      ok: z.literal(true),
      observedAt: isoTimestamp,
      // Civ7MapGridResult (@civ7/direct-control). Opaque payload.
      grid: unknownRecord,
    }),
  );

// ---------------------------------------------------------------------------
// #6 civ7.live.entities — GET /api/civ7/live/entities
// ---------------------------------------------------------------------------
// Query: playerId(opt → number/omit), maxItems(clamp 1..128, default 128).
// Success 200: { ok:true, observedAt, players, units, cities }.
// Error 400: { ok:false, error }. Reads FireTuner (3× Promise.all — any failure
// → whole 400, NOT allSettled).
export const entities = oc
  .errors(liveEntitiesErrors)
  .input(
    z.object({
      playerId: z.number().int().optional(),
      maxItems: z.number().int().default(128),
    }),
  )
  .output(
    z.object({
      ok: z.literal(true),
      observedAt: isoTimestamp,
      players: unknownRecord,
      units: unknownRecord,
      cities: unknownRecord,
    }),
  );

// ---------------------------------------------------------------------------
// #7 civ7.live.gameInfo — GET /api/civ7/live/gameinfo
// ---------------------------------------------------------------------------
// Query: tables(csv, default "Terrains,Biomes,Features,Resources,Maps,MapSizes",
//   slice(0,8) — 8-table cap), limit(clamp 1..200, default 100).
// Success 200: { ok:true, observedAt, tables: Record<table, rows> }.
// Error 400: { ok:false, error }. N parallel reads.
//
// PARITY REFINEMENT (A3): each `tables[table]` value is the WHOLE
// `Civ7GameInfoRowsResult` object (legacy maps `[table, await
// getCiv7GameInfoRows(...)]`), not a bare row array — same mismatch as
// `civ7.gameInfo` (#3). Refined from `array(gameInfoRow)` to the opaque result
// record to preserve current `/api` behavior.
export const gameInfo = oc
  .errors(liveGameInfoErrors)
  .input(
    z.object({
      tables: z.string().default("Terrains,Biomes,Features,Resources,Maps,MapSizes"),
      limit: z.number().int().default(100),
    }),
  )
  .output(
    z.object({
      ok: z.literal(true),
      observedAt: isoTimestamp,
      tables: z.record(z.string(), unknownRecord),
    }),
  );

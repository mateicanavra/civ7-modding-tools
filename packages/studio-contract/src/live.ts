import { oc } from "@orpc/contract";
import type { Static } from "typebox";
import { Type } from "typebox";

import { liveEntitiesErrors, liveGameInfoErrors, liveSnapshotErrors } from "./errors.js";
import {
  contractSchema,
  emptyInputSchema,
  isoTimestampSchema,
  unknownRecordSchema,
} from "./shared.js";

/**
 * `civ7.live.*` sub-namespace - aggregated live runtime reads.
 *
 * Source of truth: audit/05-server-contracts.md endpoints #4 (status), #5
 * (snapshot), #6 (entities), #7 (gameInfo).
 * Current transport is TypeBox/effect-oRPC under `/rpc`; retired `/api/*`
 * strings below are audit/parity identifiers, not active routes.
 */

/**
 * A field that is either the live payload or an embedded `{ error }` marker.
 *
 * `live.status` returns **200** even when its one coherent playable-status
 * observation fails. That failure is projected in-band as the same `{ error }`
 * evidence for every derived field, so this procedure declares no contract
 * errors (only an outer defect yields a transport-level 500).
 */
const fieldOrErrorSchema = Type.Union([
  unknownRecordSchema,
  Type.Object({ error: Type.String() }, { additionalProperties: false }),
]);

// ---------------------------------------------------------------------------
// #4 civ7.live.status - live aggregate read (retired REST parity: GET /api/civ7/live/status)
// ---------------------------------------------------------------------------
// Request: none. Success 200: { ok, playable, observedAt, status, appUi,
// mapSummary, autoplay } where ok = playableStatus && readiness !== "unavailable",
// and status/appUi/mapSummary/autoplay are all projected from the same App UI
// snapshot or carry the same in-band error. Error 500 ONLY on outer throw.
const statusOutputSchema = Type.Object(
  {
    ok: Type.Boolean(),
    playable: Type.Boolean(),
    observedAt: isoTimestampSchema,
    status: fieldOrErrorSchema,
    appUi: fieldOrErrorSchema,
    mapSummary: fieldOrErrorSchema,
    autoplay: fieldOrErrorSchema,
  },
  { additionalProperties: false }
);
export type Civ7LiveStatusOutput = Static<typeof statusOutputSchema>;

export const status = oc.input(emptyInputSchema).output(contractSchema(statusOutputSchema));

// ---------------------------------------------------------------------------
// #5 civ7.live.snapshot - live snapshot read (retired REST parity: GET /api/civ7/live/snapshot)
// ---------------------------------------------------------------------------
// Query: x(0), y(0), width(24), height(18),
//   fields(csv, default "terrain,biome,feature,resource,visibility,owner"),
//   playerId(opt -> number or omitted), maxPlots(clamp 1..512, default 512).
// Success 200: { ok:true, observedAt, grid }. Error 400: { ok:false, error }.
//
// PARITY NOTE (audit/05 #5): the exact query parsing - `maxPlots` clamp to 1..512,
// `fields` csv split/trim/filter, `playerId` null->omit - lives in the handler.
// Contract input optionality documents the wire defaults; clamping is applied
// server-side. `fields` is accepted as the raw csv string to preserve parsing parity.
const snapshotOutputSchema = Type.Object(
  {
    ok: Type.Literal(true),
    observedAt: isoTimestampSchema,
    // Civ7MapGridResult (@civ7/direct-control). Opaque payload.
    grid: unknownRecordSchema,
  },
  { additionalProperties: false }
);
export type Civ7LiveSnapshotOutput = Static<typeof snapshotOutputSchema>;

export const snapshot = oc
  .errors(liveSnapshotErrors)
  .input(
    contractSchema(
      Type.Object(
        {
          x: Type.Optional(Type.Integer()),
          y: Type.Optional(Type.Integer()),
          width: Type.Optional(Type.Integer()),
          height: Type.Optional(Type.Integer()),
          fields: Type.Optional(Type.String()),
          playerId: Type.Optional(Type.Integer()),
          maxPlots: Type.Optional(Type.Integer()),
        },
        { additionalProperties: false }
      )
    )
  )
  .output(contractSchema(snapshotOutputSchema));

// ---------------------------------------------------------------------------
// #6 civ7.live.entities - live entities read (retired REST parity: GET /api/civ7/live/entities)
// ---------------------------------------------------------------------------
// Query: playerId(opt -> number/omit), maxItems(clamp 1..128, default 128).
// Success 200: { ok:true, observedAt, players, units, cities }.
// Error 400: { ok:false, error }. Reads FireTuner (3x Promise.all - any failure
// -> whole 400, NOT allSettled).
export const entities = oc
  .errors(liveEntitiesErrors)
  .input(
    contractSchema(
      Type.Object(
        {
          playerId: Type.Optional(Type.Integer()),
          maxItems: Type.Optional(Type.Integer()),
        },
        { additionalProperties: false }
      )
    )
  )
  .output(
    contractSchema(
      Type.Object(
        {
          ok: Type.Literal(true),
          observedAt: isoTimestampSchema,
          players: unknownRecordSchema,
          units: unknownRecordSchema,
          cities: unknownRecordSchema,
        },
        { additionalProperties: false }
      )
    )
  );

// ---------------------------------------------------------------------------
// #7 civ7.live.gameInfo - live table read (retired REST parity: GET /api/civ7/live/gameinfo)
// ---------------------------------------------------------------------------
// Query: tables(csv, default "Terrains,Biomes,Features,Resources,Maps,MapSizes",
//   slice(0,8) - 8-table cap), limit(clamp 1..200, default 100).
// Success 200: { ok:true, observedAt, tables: Record<table, rows> }.
// Error 400: { ok:false, error }. N parallel reads.
//
// PARITY REFINEMENT (A3): each `tables[table]` value is the WHOLE
// `Civ7GameInfoRowsResult` object (legacy maps `[table, await
// getCiv7GameInfoRows(...)]`), not a bare row array - same mismatch as
// `civ7.gameInfo` (#3). Refined from `array(gameInfoRow)` to the opaque result
// record to preserve retired REST parity.
export const gameInfo = oc
  .errors(liveGameInfoErrors)
  .input(
    contractSchema(
      Type.Object(
        {
          tables: Type.Optional(Type.String()),
          limit: Type.Optional(Type.Integer()),
        },
        { additionalProperties: false }
      )
    )
  )
  .output(
    contractSchema(
      Type.Object(
        {
          ok: Type.Literal(true),
          observedAt: isoTimestampSchema,
          tables: Type.Record(Type.String(), unknownRecordSchema),
        },
        { additionalProperties: false }
      )
    )
  );

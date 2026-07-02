import { oc } from "@orpc/contract";
import { Type } from "typebox";

import {
  autoplayErrors,
  civ7GameInfoErrors,
  civ7MapSummaryErrors,
  civ7StatusErrors,
  savedConfigsErrors,
  setupCatalogErrors,
  setupConfigErrors,
} from "./errors.js";
import {
  contractSchema,
  emptyInputSchema,
  isoTimestampSchema,
  unknownRecordSchema,
} from "./shared.js";

/**
 * `civ7.*` namespace - FireTuner socket reads + autoplay mutation.
 *
 * Source of truth: audit/05-server-contracts.md endpoints #1, #2, #3, #8, #10,
 * #11, #12 (and the `civ7.live.*` sub-namespace lives in ./live.ts).
 * Current transport is TypeBox/effect-oRPC under `/rpc`; retired `/api/*`
 * strings below are audit/parity identifiers, not active routes.
 *
 * Parity note: error status codes are NON-UNIFORM across these procedures
 * (gameInfo->400, setupConfig->503, savedConfigs/setupCatalog->500,
 * status/mapSummary->500, autoplay->409/503/500). Each procedure DECLARES its codes
 * via `.errors(...)` (./errors.ts), so the legacy statuses are contract-typed
 * and arrive client-side as oRPC defined errors.
 */

const setupCatalogSourceSchema = Type.Union([
  Type.Literal("official-resource-mirror"),
  Type.Literal("app-resources"),
]);

// ---------------------------------------------------------------------------
// #1 civ7.status - playable-status read (retired REST parity: GET /api/civ7/status)
// ---------------------------------------------------------------------------
// Request: none. Success 200: { ok: status.playable, status: PlayableStatus }.
// Error 500: { ok:false, error }. Reads FireTuner socket (getCiv7PlayableStatus).
export const status = oc
  .errors(civ7StatusErrors)
  .input(emptyInputSchema)
  .output(
    contractSchema(
      Type.Object(
        {
          ok: Type.Boolean(),
          // Civ7PlayableStatusResult (@civ7/direct-control). Opaque payload - see shared.ts.
          status: unknownRecordSchema,
        },
        { additionalProperties: false }
      )
    )
  );

// ---------------------------------------------------------------------------
// #2 civ7.mapSummary - map-summary read (retired REST parity: GET /api/civ7/map-summary)
// ---------------------------------------------------------------------------
// Request: none (server calls with { includeAreaRegionCounts: true }).
// Success 200: { ok:true, summary: MapSummary }. Error 500: { ok:false, error }.
export const mapSummary = oc
  .errors(civ7MapSummaryErrors)
  .input(emptyInputSchema)
  .output(
    contractSchema(
      Type.Object(
        {
          ok: Type.Literal(true),
          // Civ7MapSummaryResult (@civ7/direct-control). Opaque payload.
          summary: unknownRecordSchema,
        },
        { additionalProperties: false }
      )
    )
  );

// ---------------------------------------------------------------------------
// #3 civ7.gameInfo - table read (retired REST parity: GET /api/civ7/gameinfo?table=&limit=)
// ---------------------------------------------------------------------------
// Query: table (string, REQUIRED), limit (number, default 100).
// Success 200: { ok:true, rows }. Error 400 (incl. missing table): { ok:false, error }.
// NOTE: error status is 400 here, NOT 500.
//
// PARITY REFINEMENT (A3): the legacy handler assigns `rows = await
// getCiv7GameInfoRows(...)` and writes `{ ok:true, rows }` - i.e. `rows` is the
// WHOLE `Civ7GameInfoRowsResult` object (`{ host, port, table, source, rows,
// total, ... }`), NOT a bare row array. The A1 contract modelled it as
// `array(gameInfoRow)`, which does not match the retired REST payload. Refined
// to the opaque result record to preserve parity (the deep payload is internal,
// per shared.ts).
export const gameInfo = oc
  .errors(civ7GameInfoErrors)
  .input(
    contractSchema(
      Type.Object(
        {
          table: Type.String({ minLength: 1 }),
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
          // Civ7GameInfoRowsResult (@civ7/direct-control). Opaque payload (see shared.ts).
          rows: unknownRecordSchema,
        },
        { additionalProperties: false }
      )
    )
  );

// ---------------------------------------------------------------------------
// #8 civ7.autoplay - autoplay mutation (retired REST parity: POST /api/civ7/autoplay)
// ---------------------------------------------------------------------------
// Body: { action: "start" | "stop" }.
// Success 200: { ok: result.verified, action, autoplay, game, gameContext, result }.
// Errors: 400 (bad action/invalid engine request); 409 (run-in-game OR
// save/deploy active, with details.code); 503 direct-control unavailable; 500
// unexpected failure.
// Mutates game state; waits on scripting log markers (waitTimeoutMs around 90s).
// Dual-store 409 mutex + approval object land A3.
const autoplayActionSchema = Type.Union([Type.Literal("start"), Type.Literal("stop")]);

export const autoplay = oc
  .errors(autoplayErrors)
  .input(
    contractSchema(
      Type.Object(
        {
          action: autoplayActionSchema,
        },
        { additionalProperties: false }
      )
    )
  )
  .output(
    contractSchema(
      Type.Object(
        {
          ok: Type.Boolean(),
          action: autoplayActionSchema,
          // The following mirror Civ7AutoplayStatusResult fields + the action result.
          autoplay: unknownRecordSchema,
          game: unknownRecordSchema,
          gameContext: unknownRecordSchema,
          // Civ7AutoplayActionResult (@civ7/direct-control). Opaque payload.
          result: unknownRecordSchema,
        },
        { additionalProperties: false }
      )
    )
  );

// ---------------------------------------------------------------------------
// #10 civ7.setupConfig - setup-config read (retired REST parity: GET /api/civ7/setup-config)
// ---------------------------------------------------------------------------
// Request: none. Success 200: { ok:true, observedAt, setup, state, host, port }.
// Error 503 (UNIQUE): { ok:false, error, observedAt }. Reads FireTuner socket.
export const setupConfig = oc
  .errors(setupConfigErrors)
  .input(emptyInputSchema)
  .output(
    contractSchema(
      Type.Object(
        {
          ok: Type.Literal(true),
          observedAt: isoTimestampSchema,
          // Civ7SetupSnapshot (@civ7/direct-control). Opaque payload.
          setup: unknownRecordSchema,
          state: unknownRecordSchema,
          host: Type.String(),
          port: Type.Number(),
        },
        { additionalProperties: false }
      )
    )
  );

// ---------------------------------------------------------------------------
// #11 civ7.savedConfigs - saved-configs read (retired REST parity: GET /api/civ7/saved-configs)
// ---------------------------------------------------------------------------
// Request: none. Success 200: { ok:true, observedAt, directory, configurations }
// (spread of listCiv7SavedGameConfigurations listResult). Error 500:
// { ok:false, error, observedAt }. Reads filesystem (Civ7 saved-config dir).
export const savedConfigs = oc
  .errors(savedConfigsErrors)
  .input(emptyInputSchema)
  .output(
    contractSchema(
      Type.Object(
        {
          ok: Type.Literal(true),
          observedAt: isoTimestampSchema,
          directory: Type.String(),
          configurations: Type.Array(unknownRecordSchema),
        },
        { additionalProperties: false }
      )
    )
  );

// ---------------------------------------------------------------------------
// #12 civ7.setupCatalog - setup-catalog read (retired REST parity: GET /api/civ7/setup-catalog)
// ---------------------------------------------------------------------------
// Request: none. Success 200: { ok:true, catalog: Civ7SetupCatalog }.
// Error 500: { ok:false, error, observedAt }. Reads filesystem (repo mirror +
// macOS Steam app Resources). `catalog` reproduces the Civ7SetupCatalog type from
// apps/mapgen-studio/src/server/civ7Resources/catalog.ts faithfully.

const setupCatalogOptionSchema = Type.Object(
  {
    value: Type.String(),
    label: Type.String(),
    source: setupCatalogSourceSchema,
    sourcePath: Type.String(),
  },
  { additionalProperties: false }
);

export const setupCatalogSchema = Type.Object(
  {
    observedAt: isoTimestampSchema,
    roots: Type.Array(
      Type.Object(
        {
          source: setupCatalogSourceSchema,
          path: Type.String(),
          exists: Type.Boolean(),
        },
        { additionalProperties: false }
      )
    ),
    sourceFileCount: Type.Number(),
    leaders: Type.Array(setupCatalogOptionSchema),
    civilizations: Type.Array(setupCatalogOptionSchema),
    difficulties: Type.Array(setupCatalogOptionSchema),
    gameSpeeds: Type.Array(setupCatalogOptionSchema),
  },
  { additionalProperties: false }
);

export const setupCatalog = oc
  .errors(setupCatalogErrors)
  .input(emptyInputSchema)
  .output(
    contractSchema(
      Type.Object(
        {
          ok: Type.Literal(true),
          catalog: setupCatalogSchema,
        },
        { additionalProperties: false }
      )
    )
  );

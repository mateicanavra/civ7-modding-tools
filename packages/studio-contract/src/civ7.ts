import {
  Civ7GameOptionsSchema,
  Civ7MapOptionsSchema,
  Civ7PlayerSetupsSchema,
  Civ7SignedIntSeedSchema,
} from "@civ7/map-policy/setup";
import { oc } from "@orpc/contract";
import { Refine, type Static, Type } from "typebox";

import {
  autoplayErrors,
  civ7GameInfoErrors,
  civ7MapSummaryErrors,
  civ7StatusErrors,
  savedConfigsErrors,
  setupCatalogErrors,
  setupConfigErrors,
} from "./errors.js";
import { savedSetupConfigRef } from "./runInGame.js";
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

const setupObservedScalarSchema = Type.Union([
  Type.String(),
  Type.Number(),
  Type.Boolean(),
  Type.Null(),
]);

const setupObservedValueSchema = Type.Union([setupObservedScalarSchema, Type.Array(Type.String())]);

const setupInvalidReasonSchema = Type.Union([Type.String(), Type.Number(), Type.Null()]);

/** Live value-domain evidence used by Studio to build one setup select option. */
export const civ7SetupPossibleValueSchema = Type.Object(
  {
    value: setupObservedScalarSchema,
    destroyed: Type.Optional(Type.Boolean()),
    hidden: Type.Optional(Type.Boolean()),
    readOnly: Type.Optional(Type.Boolean()),
    invalidReason: Type.Optional(setupInvalidReasonSchema),
  },
  { additionalProperties: false }
);

/** Closed observation of one Civ7 setup parameter and its current authoring availability. */
export const civ7SetupParameterSchema = Type.Object(
  {
    id: Type.String({ minLength: 1 }),
    exists: Type.Boolean(),
    value: Type.Optional(setupObservedValueSchema),
    destroyed: Type.Optional(Type.Boolean()),
    hidden: Type.Optional(Type.Boolean()),
    readOnly: Type.Optional(Type.Boolean()),
    invalidReason: Type.Optional(setupInvalidReasonSchema),
    possibleValues: Type.Optional(Type.Array(civ7SetupPossibleValueSchema)),
  },
  { additionalProperties: false }
);

/** Studio-owned parameter observation projected from the current Civ7 setup surface. */
export type Civ7SetupParameter = Static<typeof civ7SetupParameterSchema>;

const civ7SetupParametersSchema = Refine(
  Type.Array(civ7SetupParameterSchema),
  (parameters) => new Set(parameters.map(({ id }) => id)).size === parameters.length,
  () => "Civ7 setup parameter observations must use unique id values."
);

/** Closed player-scoped parameter group used by Studio's setup authoring controls. */
export const civ7SetupPlayerGroupSchema = Type.Object(
  {
    playerId: Type.Integer({ minimum: 0, maximum: 63 }),
    parameters: civ7SetupParametersSchema,
  },
  { additionalProperties: false }
);

const civ7SetupPlayerGroupsSchema = Refine(
  Type.Array(civ7SetupPlayerGroupSchema),
  (players) => new Set(players.map(({ playerId }) => playerId)).size === players.length,
  () => "Civ7 setup player observations must use unique playerId values."
);

/** Closed selected-map evidence used to adopt the active map script into Studio state. */
export const civ7SetupSelectedMapSchema = Type.Object(
  {
    file: Type.String({ minLength: 1 }),
    value: Type.Optional(Type.String()),
  },
  { additionalProperties: false }
);

/**
 * Minimal live Civ7 setup observation consumed by Studio.
 * Provider state, endpoint identity, raw values, and unconsumed probes remain server-private.
 */
export const civ7SetupSnapshotSchema = Type.Object(
  {
    selectedMap: Type.Optional(civ7SetupSelectedMapSchema),
    parameters: civ7SetupParametersSchema,
    players: civ7SetupPlayerGroupsSchema,
    localPlayerId: Type.Optional(Type.Integer({ minimum: 0, maximum: 63 })),
  },
  { additionalProperties: false }
);

/** Minimal provider-neutral live setup observation admitted by the Studio contract. */
export type Civ7SetupSnapshot = Static<typeof civ7SetupSnapshotSchema>;

// ---------------------------------------------------------------------------
// #1 civ7.status - playable-status read (retired REST parity: GET /api/civ7/status)
// ---------------------------------------------------------------------------
// Request: none. Success 200: { ok: status.playable, status: PlayableStatus }.
// Error 500: { ok:false, error }. Reads FireTuner socket (getCiv7PlayableStatus).
/** Reads the current playable-status observation from Civ7 without mutating game state. */
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
/** Reads the current map summary, including area and region counts, as an opaque payload. */
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
/** Reads one named GameInfo table while preserving the direct-control result envelope. */
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

/** Starts or stops Civ7 autoplay under the Studio operation mutex. */
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
// Request: none. Success 200: { ok:true, observedAt, setup }.
// Error 503 (UNIQUE): { ok:false, error, observedAt }. Reads FireTuner socket.
/** Reads the provider-neutral setup state currently observed through FireTuner. */
export const setupConfig = oc
  .errors(setupConfigErrors)
  .input(emptyInputSchema)
  .output(
    contractSchema(
      Type.Object(
        {
          ok: Type.Literal(true),
          observedAt: isoTimestampSchema,
          setup: civ7SetupSnapshotSchema,
        },
        { additionalProperties: false }
      )
    )
  );

// ---------------------------------------------------------------------------
// #11 civ7.savedConfigs - saved-configs read (retired REST parity: GET /api/civ7/saved-configs)
// ---------------------------------------------------------------------------
// Request: none. Success 200: { ok:true, observedAt, configurations }.
// Provider directory and file-stat metadata remain server-private. Error 500:
// { ok:false, error, observedAt }. Reads the configured Civ7 saved-config provider.
/** Saved Civ7 setup evidence that may be absent when the file cannot prove a field exactly. */
export const savedSetupConfigurationSummarySchema = Type.Object(
  {
    gameSpeed: Type.Optional(Type.String()),
    mapSize: Type.Optional(Type.String()),
    mapName: Type.Optional(Type.String()),
    leader: Type.Optional(Type.String()),
    civilization: Type.Optional(Type.String()),
    difficulty: Type.Optional(Type.String()),
    mapSeed: Type.Optional(Civ7SignedIntSeedSchema),
    gameSeed: Type.Optional(Civ7SignedIntSeedSchema),
    playerCount: Type.Optional(Type.Integer({ minimum: 1, maximum: 64 })),
  },
  { additionalProperties: false }
);

/** One saved Civ7 configuration projected into the grouped setup model used at launch. */
export const savedSetupConfigurationSchema = Type.Object(
  {
    ...savedSetupConfigRef.properties,
    summary: savedSetupConfigurationSummarySchema,
    gameOptions: Civ7GameOptionsSchema,
    mapOptions: Civ7MapOptionsSchema,
    playerOptions: Civ7PlayerSetupsSchema,
  },
  { additionalProperties: false }
);
/** One admitted saved configuration returned by the Studio control API. */
export type Civ7SavedSetupConfiguration = Static<typeof savedSetupConfigurationSchema>;

/** Closed public response for listing provider-neutral saved Civ7 configurations. */
export const savedConfigsOutputSchema = Type.Object(
  {
    ok: Type.Literal(true),
    observedAt: isoTimestampSchema,
    configurations: Type.Array(savedSetupConfigurationSchema),
  },
  { additionalProperties: false }
);
/** Closed response carrying the saved configurations admitted from local Civ7Cfg files. */
export type Civ7SavedConfigsOutput = Static<typeof savedConfigsOutputSchema>;

/** Lists saved Civ7 setup files after projecting them into the public grouped model. */
export const savedConfigs = oc
  .errors(savedConfigsErrors)
  .input(emptyInputSchema)
  .output(contractSchema(savedConfigsOutputSchema));

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

const setupCatalogSchema = Type.Object(
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

/** Lists authoring choices discovered from official resources and installed game data. */
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

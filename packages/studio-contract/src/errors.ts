import type { StandardSchemaV1 } from "@standard-schema/spec";
import { Type } from "typebox";

import {
  type ExpectedFailureErrorData,
  expectedFailureErrorDataSchema,
  type FailedErrorData,
  failedErrorDataSchema,
  type RunInGamePublicErrorData,
  runInGamePublicErrorDataSchema,
  runInGameStatusNotFoundErrorDataSchema,
  type SaveDeployPublicErrorData,
  saveDeployPublicErrorDataSchema,
  saveDeployStatusNotFoundErrorDataSchema,
  type UnavailableFailureErrorData,
  unavailableFailureErrorDataSchema,
} from "./errors/errorData.js";
import { toStandardSchema } from "./lib/typeboxStandardSchema.js";

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
 * Expected engine failures are package-owned D3 failure values projected through
 * `../errors/mapping.ts`; unknown exceptions are router-edge defect containment.
 * Declared public data is TypeBox-owned and deliberately sealed. The old
 * open-ended engine details are not an accepted protocol.
 */

/** `observedAt` echo carried by the read failures that historically included it. */
const observedAtData = toStandardSchema(
  Type.Union([
    Type.Object(
      {
        observedAt: Type.Optional(Type.String()),
      },
      { additionalProperties: false }
    ),
    Type.Undefined(),
  ])
);

const expectedFailureData: StandardSchemaV1<ExpectedFailureErrorData, ExpectedFailureErrorData> =
  toStandardSchema(expectedFailureErrorDataSchema);
const unavailableFailureData: StandardSchemaV1<
  UnavailableFailureErrorData,
  UnavailableFailureErrorData
> = toStandardSchema(unavailableFailureErrorDataSchema);
const failedFailureData: StandardSchemaV1<FailedErrorData, FailedErrorData> =
  toStandardSchema(failedErrorDataSchema);
const runInGamePublicFailureData: StandardSchemaV1<
  RunInGamePublicErrorData,
  RunInGamePublicErrorData
> = toStandardSchema(runInGamePublicErrorDataSchema);
const saveDeployPublicFailureData: StandardSchemaV1<
  SaveDeployPublicErrorData,
  SaveDeployPublicErrorData
> = toStandardSchema(saveDeployPublicErrorDataSchema);

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
// civ7.autoplay — package runtime command (409 runtime gate / 400 invalid / 503 unavailable / 500 unexpected)
// ---------------------------------------------------------------------------

export const autoplayErrors = {
  AUTOPLAY_BLOCKED: {
    status: 409,
    message: "Civ7 autoplay is blocked by an active operation",
    data: expectedFailureData,
  },
  AUTOPLAY_INVALID: {
    status: 400,
    message: "Invalid Civ7 autoplay request",
    data: expectedFailureData,
  },
  AUTOPLAY_UNAVAILABLE: {
    status: 503,
    message: "Civ7 autoplay dependencies are unavailable",
    data: unavailableFailureData,
  },
  AUTOPLAY_FAILED: {
    status: 500,
    message: "Civ7 autoplay request failed",
    data: failedFailureData,
  },
} as const;

// ---------------------------------------------------------------------------
// runInGame.* — package operation runtime (409/400/500/503; 404 without daemon identity)
// ---------------------------------------------------------------------------

export const runInGameErrors = {
  RUN_IN_GAME_BLOCKED: {
    status: 409,
    message: "Run in Game is blocked by an active operation",
    data: runInGamePublicFailureData,
  },
  RUN_IN_GAME_INVALID: {
    status: 400,
    message: "Invalid Run in Game request",
    data: runInGamePublicFailureData,
  },
  RUN_IN_GAME_FAILED: {
    status: 500,
    message: "Run in Game failed",
    data: runInGamePublicFailureData,
  },
  RUN_IN_GAME_UNAVAILABLE: {
    status: 503,
    message: "Run in Game dependencies are unavailable",
    data: runInGamePublicFailureData,
  },
  RUN_IN_GAME_STATUS_NOT_FOUND: {
    status: 404,
    message: "Run in Game request not found",
    data: toStandardSchema(runInGameStatusNotFoundErrorDataSchema),
  },
} as const;

// ---------------------------------------------------------------------------
// mapConfigs.* — package operation runtime (409 runtime gate / 400 validation / 503 unavailable; 404 with identity echo)
// ---------------------------------------------------------------------------

export const mapConfigsErrors = {
  SAVE_DEPLOY_BLOCKED: {
    status: 409,
    message: "Save/Deploy is blocked by an active operation",
    data: saveDeployPublicFailureData,
  },
  SAVE_DEPLOY_INVALID: {
    status: 400,
    message: "Invalid Save/Deploy request",
    data: saveDeployPublicFailureData,
  },
  SAVE_DEPLOY_UNAVAILABLE: {
    status: 503,
    message: "Save/Deploy dependencies are unavailable",
    data: saveDeployPublicFailureData,
  },
  SAVE_DEPLOY_FAILED: {
    status: 500,
    message: "Save failed",
    data: saveDeployPublicFailureData,
  },
  SAVE_DEPLOY_STATUS_NOT_FOUND: {
    status: 404,
    message: "Save/Deploy request not found",
    data: toStandardSchema(saveDeployStatusNotFoundErrorDataSchema),
  },
} as const;

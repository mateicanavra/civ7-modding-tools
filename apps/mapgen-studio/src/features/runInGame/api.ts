// Run-in-game data surface: start a run. Ongoing operation freshness is
// daemon-pushed through `studio.operations.current` and `studio.events.watch`.
//
// EVERYTHING talks oRPC (FRAME §4.7): these callers speak the studio's own
// `@civ7/studio-server` contract through the typed oRPC client (`src/lib/orpc.ts`)
// — there is NO manual `fetch` of `/api/*` here anymore. The request body shape
// (including the `assertNoRawControlFields`-protected payload assembled here) is
// preserved verbatim; failures are read through oRPC's NATIVE typed contract
// errors: `safe(...)` + `isDefinedError(...)` expose the DECLARED code
// (RUN_IN_GAME_BLOCKED/INVALID/FAILED/UNAVAILABLE/STATUS_NOT_FOUND, statuses
// pinned in packages/studio-contract/src/errors.ts) and safe public failure
// category data.

import {
  operationStatusTypeSchema,
  RUN_IN_GAME_SAFE_FAILURE_CATEGORIES,
  type RunInGameOperationStatus,
  type RunInGameSafeFailureCategory,
} from "@civ7/studio-contract";
import { safe } from "@orpc/client";
import { Value } from "typebox/value";
import { orpcClient } from "../../lib/orpc";
import { type Civ7StudioSetupConfig, normalizeStudioSetupConfig } from "../civ7Setup/setupConfig";
import { projectStudioBrowserError } from "../studioErrors/definedErrorProjection";

export async function runCurrentConfigInGame(args: {
  recipeId: string;
  seed: string;
  mapSize: string;
  playerCount: number;
  resources: string;
  setupConfig: Civ7StudioSetupConfig;
  materializationMode: "durable" | "disposable";
  restartCivProcess?: boolean;
  selectedConfig?: {
    id?: string;
    label?: string;
    description?: string;
    sourcePath?: string;
    sortIndex?: number;
    latitudeBounds?: Readonly<{
      topLatitude: number;
      bottomLatitude: number;
    }>;
  };
  config: unknown;
  sourceSnapshot?: unknown;
}): Promise<
  | RunInGameOperationStatus
  | {
      ok: false;
      error: string;
      safeFailureCategory: RunInGameSafeFailureCategory;
      code?: string;
      statusCode?: number;
    }
> {
  // The request envelope is assembled exactly as before (the server runs
  // `assertNoRawControlFields` over it); only the transport is the oRPC client.
  // The legacy handler posted `selectedConfig` verbatim; the package operation
  // runtime now derives canonical selected id, seed, setup config, materialization
  // mode, and fingerprint before the workflow leaf ports run.
  // The request envelope type-checks directly against the start input now that
  // `selectedConfig.id` is optional in the contract (a disposable run sends
  // `selectedConfig` without an `id`). No `as unknown as Parameters<…>` cast — the
  // `assertNoRawControlFields`-protected payload is fully input-typed end to end.
  const request: Parameters<typeof orpcClient.runInGame.start>[0] = {
    recipeId: args.recipeId,
    seed: args.seed,
    mapSize: args.mapSize,
    playerCount: args.playerCount,
    resources: args.resources,
    setupConfig: normalizeStudioSetupConfig(args.setupConfig),
    materialization: { mode: args.materializationMode },
    ...(args.restartCivProcess ? { recovery: { restartCivProcess: true } } : {}),
    ...(args.selectedConfig ? { selectedConfig: args.selectedConfig } : {}),
    config: args.config,
    sourceSnapshot: args.sourceSnapshot,
  };
  const { error, data } = await safe(orpcClient.runInGame.start(request));
  if (error) {
    const projected = projectStudioBrowserError<Record<string, unknown>>(
      error,
      "Run in Game failed"
    );
    return {
      ok: false,
      error: projected.error,
      safeFailureCategory: safeFailureCategoryFromDetails(projected.details),
      ...(projected.code === undefined ? {} : { code: projected.code }),
      ...(projected.statusCode === undefined ? {} : { statusCode: projected.statusCode }),
    };
  }
  return Value.Parse(operationStatusTypeSchema, data);
}

function safeFailureCategoryFromDetails(
  details: Record<string, unknown> | undefined
): RunInGameSafeFailureCategory {
  const category = details?.safeFailureCategory;
  return typeof category === "string" &&
    RUN_IN_GAME_SAFE_FAILURE_CATEGORIES.includes(category as RunInGameSafeFailureCategory)
    ? (category as RunInGameSafeFailureCategory)
    : "internal-defect";
}

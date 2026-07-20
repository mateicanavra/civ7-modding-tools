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
  type LaunchSource,
  operationStatusTypeSchema,
  RUN_IN_GAME_SAFE_FAILURE_CATEGORIES,
  type RunInGameOperationStatus,
  type RunInGameRecipeSettings,
  type RunInGameSafeFailureCategory,
  type RunInGameWorldSettings,
} from "@civ7/studio-contract";
import { safe } from "@orpc/client";
import { Value } from "typebox/value";
import { orpcClient } from "../../lib/orpc";
import { type Civ7StudioSetupConfig, normalizeStudioSetupConfig } from "../civ7Setup/setupConfig";
import { projectStudioBrowserError } from "../studioErrors/definedErrorProjection";

export type RunCurrentConfigInGameArgs = {
  source: LaunchSource;
  recipeSettings: RunInGameRecipeSettings;
  worldSettings: RunInGameWorldSettings;
  setupConfig: Civ7StudioSetupConfig;
};

export type RunInGameStartRequest = Parameters<typeof orpcClient.runInGame.start>[0];

export function buildRunInGameStartRequest(
  args: RunCurrentConfigInGameArgs
): RunInGameStartRequest {
  return {
    source: args.source,
    recipeSettings: args.recipeSettings,
    worldSettings: args.worldSettings,
    setupConfig: normalizeStudioSetupConfig(args.setupConfig),
  };
}

export async function runCurrentConfigInGame(args: RunCurrentConfigInGameArgs): Promise<
  | RunInGameOperationStatus
  | {
      ok: false;
      error: string;
      safeFailureCategory: RunInGameSafeFailureCategory;
      code?: string;
      statusCode?: number;
    }
> {
  const request = buildRunInGameStartRequest(args);
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

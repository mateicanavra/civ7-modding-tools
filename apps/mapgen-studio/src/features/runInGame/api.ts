// This is the browser's typed oRPC admission boundary for Run in Game.

import {
  type MapConfigEnvelope,
  operationStatusTypeSchema,
  RUN_IN_GAME_SAFE_FAILURE_CATEGORIES,
  type RunInGameOperationStatus,
  type RunInGameSafeFailureCategory,
  type RunInGameWorldSettings,
  serializeMapConfigEnvelope,
} from "@civ7/studio-contract";
import { safe } from "@orpc/client";
import { Value } from "typebox/value";
import { orpcClient } from "../../lib/orpc";
import { type Civ7StudioSetupConfig, normalizeStudioSetupConfig } from "../civ7Setup/setupConfig";
import { projectStudioBrowserError } from "../studioErrors/definedErrorProjection";

export type RunCurrentConfigInGameArgs = {
  canonicalConfig: MapConfigEnvelope;
  seed: number | string;
  worldSettings: RunInGameWorldSettings;
  setupConfig: Civ7StudioSetupConfig;
};

export type RunInGameStartRequest = Parameters<typeof orpcClient.runInGame.start>[0];

export function buildRunInGameStartRequest(
  args: RunCurrentConfigInGameArgs
): RunInGameStartRequest {
  return {
    canonicalConfig: serializeMapConfigEnvelope(args.canonicalConfig),
    seed: args.seed,
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
  if (typeof category !== "string") return "internal-defect";
  for (const safeCategory of RUN_IN_GAME_SAFE_FAILURE_CATEGORIES) {
    if (safeCategory === category) return safeCategory;
  }
  return "internal-defect";
}

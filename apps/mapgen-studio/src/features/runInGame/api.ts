// Run-in-game data surface: start a run and poll its status.
//
// EVERYTHING talks oRPC (FRAME §4.7): these callers speak the studio's own
// `@civ7/studio-server` contract through the typed oRPC client (`src/lib/orpc.ts`)
// — there is NO manual `fetch` of `/api/*` here anymore. The request body shape
// (including the `assertNoRawControlFields`-protected payload assembled here) is
// preserved verbatim; failures are read through oRPC's NATIVE typed contract
// errors: `safe(...)` + `isDefinedError(...)` expose the DECLARED code
// (RUN_IN_GAME_BLOCKED/INVALID/FAILED/UNAVAILABLE/STATUS_NOT_FOUND, statuses
// pinned in packages/studio-server/src/contract/errors.ts) and its typed `data`
// (`details`, and the STATUS_NOT_FOUND server-identity echo). The caller's
// server-restart detection branches on `code === "RUN_IN_GAME_STATUS_NOT_FOUND"`
// instead of a raw 404 status code.

import type { RunInGameFailureDetails, RunInGameOperationStatus } from "@civ7/studio-server";
import { isDefinedError, safe } from "@orpc/client";
import { orpcClient } from "../../lib/orpc";
import { type Civ7StudioSetupConfig, normalizeStudioSetupConfig } from "../civ7Setup/setupConfig";

/**
 * Read the engine-attached `RunInGameFailureDetails` from a defined error's typed
 * `data`. The runInGame error map's `data` is a union (`{ details? }` for the
 * engine failures, the server-identity echo for STATUS_NOT_FOUND), so the read is
 * runtime-guarded rather than property-accessed across the union.
 */
function definedErrorDetails(data: unknown): RunInGameFailureDetails | undefined {
  if (data && typeof data === "object" && "details" in data) {
    return (data as { details?: RunInGameFailureDetails }).details;
  }
  return undefined;
}

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
  | { ok: false; error: string; details?: RunInGameFailureDetails; code?: string }
> {
  // The request envelope is assembled exactly as before (the server runs
  // `assertNoRawControlFields` over it); only the transport is the oRPC client.
  // The legacy handler posted `selectedConfig` verbatim (its `id` may be absent
  // for disposable runs) and `parseRunInGameSetupRequest` tolerates that, so we
  // pass it through the permissive (`.catchall`) start input unchanged.
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
    if (isDefinedError(error)) {
      const details = definedErrorDetails(error.data);
      return {
        ok: false,
        error: error.message || "Run in Game failed",
        code: error.code,
        ...(details !== undefined ? { details } : {}),
      };
    }
    return {
      ok: false,
      error: error instanceof Error && error.message ? error.message : "Run in Game failed",
    };
  }
  return data;
}

export async function fetchRunInGameStatus(
  requestId: string
): Promise<RunInGameOperationStatus | { ok: false; error: string; code?: string }> {
  const { error, data } = await safe(orpcClient.runInGame.status({ requestId }));
  if (error) {
    return {
      ok: false,
      error:
        error instanceof Error && error.message ? error.message : "Run in Game status unavailable",
      // `code === "RUN_IN_GAME_STATUS_NOT_FOUND"` is the restart-detection signal
      // (the former `statusCode === 404` branch in StudioShell).
      ...(isDefinedError(error) ? { code: error.code } : {}),
    };
  }
  return data;
}

// Run-in-game data surface: start a run and poll its status.
//
// EVERYTHING talks oRPC (FRAME §4.7): these callers speak the studio's own
// `@civ7/studio-server` contract through the typed oRPC client (`src/lib/orpc.ts`)
// — there is NO manual `fetch` of `/api/*` here anymore. The request body shape
// (including the `assertNoRawControlFields`-protected payload assembled here), the
// non-uniform error handling, and the status-code propagation are preserved
// verbatim: the transport moved from `fetch` to the oRPC client; the request
// envelope, the result shapes, and the 404 `statusCode` the caller uses for
// server-restart detection did not. The router pins the legacy HTTP code on
// `ORPCError.status` and carries `details` (and the 404 server-id echo) in
// `ORPCError.data`, which we read back below.
import { ORPCError } from "@orpc/client";

import { orpcClient, readErrorData } from "../../lib/orpc";
import { normalizeStudioSetupConfig, type Civ7StudioSetupConfig } from "../civ7Setup/setupConfig";
import type { RunInGameFailureDetails, RunInGameOperationStatus } from "./status";

/**
 * Translate a thrown oRPC client error into the legacy run-in-game failure
 * envelope. `ORPCError.status` is the pinned legacy HTTP code (used for the 404
 * restart-detection branch in `App.tsx`); `ORPCError.data.details` carries the
 * `RunInGameFailureDetails` the engine attached. A non-`ORPCError` throw maps to
 * the bare `err.message` shape the old `catch` block produced (no `statusCode`).
 */
function runInGameFailure(
  err: unknown,
  fallback: string,
): { error: string; details?: RunInGameFailureDetails; statusCode?: number } {
  if (err instanceof ORPCError) {
    // `details` (the `RunInGameFailureDetails` the engine attached) rides in the
    // error body; the router carries it via `ORPCError.data`.
    const data = readErrorData<{ details: RunInGameFailureDetails }>(err);
    return {
      error: err.message || `HTTP ${err.status}`,
      statusCode: err.status,
      ...(data?.details !== undefined ? { details: data.details } : {}),
    };
  }
  return { error: err instanceof Error ? err.message : fallback };
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
  | { ok: false; error: string; details?: RunInGameFailureDetails; statusCode?: number }
> {
  try {
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
    const body = await orpcClient.runInGame.start(request);
    return body as RunInGameOperationStatus;
  } catch (err) {
    return { ok: false, ...runInGameFailure(err, "Run in Game failed") };
  }
}

export async function fetchRunInGameStatus(
  requestId: string,
): Promise<RunInGameOperationStatus | { ok: false; error: string; statusCode?: number }> {
  try {
    const body = await orpcClient.runInGame.status({ requestId });
    return body as RunInGameOperationStatus;
  } catch (err) {
    const failure = runInGameFailure(err, "Run in Game status unavailable");
    return {
      ok: false,
      error: failure.error,
      ...(failure.statusCode !== undefined ? { statusCode: failure.statusCode } : {}),
    };
  }
}

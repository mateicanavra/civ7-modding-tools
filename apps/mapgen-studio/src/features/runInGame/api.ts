// Run-in-game HTTP surface: start a run and poll its status.
//
// Thin `fetch` wrappers over `/api/civ7/run-in-game*`. Extracted verbatim from
// `App.tsx` during the app-decomposition slice — the request body shape
// (including the `assertNoRawControlFields`-protected payload assembled here),
// non-uniform error handling, and status-code propagation are unchanged.
import { normalizeStudioSetupConfig, type Civ7StudioSetupConfig } from "../civ7Setup/setupConfig";
import type { RunInGameFailureDetails, RunInGameOperationStatus } from "./status";

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
    const res = await fetch("/api/civ7/run-in-game", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recipeId: args.recipeId,
        seed: args.seed,
        mapSize: args.mapSize,
        playerCount: args.playerCount,
        resources: args.resources,
        setupConfig: normalizeStudioSetupConfig(args.setupConfig),
        materialization: { mode: args.materializationMode },
        ...(args.restartCivProcess ? { recovery: { restartCivProcess: true } } : {}),
        selectedConfig: args.selectedConfig,
        config: args.config,
        sourceSnapshot: args.sourceSnapshot,
      }),
    });
    const body = (await res.json().catch(() => null)) as
      | (Partial<RunInGameOperationStatus> & { error?: string; details?: RunInGameFailureDetails })
      | null;
    if (!res.ok || !body?.requestId) {
      return {
        ok: false,
        error: body?.error ?? `HTTP ${res.status}`,
        details: body?.details,
        statusCode: res.status,
      };
    }
    return body as RunInGameOperationStatus;
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Run in Game failed" };
  }
}

export async function fetchRunInGameStatus(
  requestId: string,
): Promise<RunInGameOperationStatus | { ok: false; error: string; statusCode?: number }> {
  try {
    const res = await fetch(`/api/civ7/run-in-game/status?requestId=${encodeURIComponent(requestId)}`);
    const body = (await res.json().catch(() => null)) as (Partial<RunInGameOperationStatus> & { error?: string }) | null;
    if (!res.ok || !body?.requestId) {
      return { ok: false, error: body?.error ?? `HTTP ${res.status}`, statusCode: res.status };
    }
    return body as RunInGameOperationStatus;
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Run in Game status unavailable" };
  }
}

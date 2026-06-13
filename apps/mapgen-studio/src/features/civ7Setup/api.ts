// Civ7 setup data surface: live setup-config snapshot, saved configurations,
// the setup option catalog, and autoplay control.
//
// EVERYTHING talks oRPC (FRAME §4.7): these callers speak the studio's own
// `@civ7/studio-server` contract through the typed oRPC client (`src/lib/orpc.ts`)
// — there is NO manual `fetch` of `/api/*` here anymore. Failures are read through
// oRPC's NATIVE typed contract errors: `safe(...)` + `isDefinedError(...)` expose
// the DECLARED code (e.g. `SETUP_CONFIG_UNAVAILABLE`, status 503 pinned in
// packages/studio-server/src/contract/errors.ts) and its typed `data`
// (`observedAt`), so the failure envelope carries `{ error, code?, observedAt? }`
// instead of a raw transport status code.
import { isDefinedError, safe } from "@orpc/client";

import { orpcClient } from "../../lib/orpc";
import type { Civ7SetupSnapshotLike } from "./setupConfig";

export type Civ7SetupCatalogOption = Readonly<{
  value: string;
  label: string;
  source?: string;
  sourcePath?: string;
}>;

export type Civ7SetupCatalog = Readonly<{
  observedAt: string;
  leaders: ReadonlyArray<Civ7SetupCatalogOption>;
  civilizations: ReadonlyArray<Civ7SetupCatalogOption>;
  difficulties: ReadonlyArray<Civ7SetupCatalogOption>;
  gameSpeeds: ReadonlyArray<Civ7SetupCatalogOption>;
}>;

export async function fetchCiv7SetupConfig(
  options: { signal?: AbortSignal } = {}
): Promise<
  | { ok: true; observedAt: string; setup: Civ7SetupSnapshotLike }
  | { ok: false; error: string; observedAt?: string; code?: string }
> {
  const { error, data } = await safe(
    orpcClient.civ7.setupConfig({}, options.signal ? { signal: options.signal } : undefined)
  );
  if (error) {
    if (isDefinedError(error)) {
      // `observedAt` rides in the typed error data for the DECLARED
      // SETUP_CONFIG_UNAVAILABLE (503) failure.
      return {
        ok: false,
        error: error.message || "Civ7 setup config unavailable",
        code: error.code,
        ...(typeof error.data?.observedAt === "string"
          ? { observedAt: error.data.observedAt }
          : {}),
      };
    }
    return {
      ok: false,
      error:
        error instanceof Error && error.message ? error.message : "Civ7 setup config unavailable",
    };
  }
  return {
    ok: true,
    // Contract-required on the success body (civ7.setupConfig output: isoTimestamp).
    observedAt: data.observedAt,
    setup: data.setup as Civ7SetupSnapshotLike,
  };
}

// NOTE: The saved-configs and setup-catalog READS are served directly by the
// oRPC-native TanStack Query layer (`useSetupDataQueries` →
// `orpc.civ7.savedConfigs` / `orpc.civ7.setupCatalog`). The former imperative
// `fetchCiv7SavedSetupConfigs` / `fetchCiv7SetupCatalog` wrappers had no callers
// after that migration and were removed; the `Civ7SetupCatalog` /
// `Civ7SetupCatalogOption` TYPES above are kept (consumed by the query view +
// `setupOptions`).

export async function requestCiv7Autoplay(action: "start" | "stop"): Promise<{
  ok: boolean;
  action?: "start" | "stop";
  autoplay?: { isActive?: boolean; isPaused?: boolean; isPausedOrPending?: boolean };
  game?: { turn?: { ok?: boolean; value?: number } };
  error?: string;
}> {
  const { error, data: body } = await safe(orpcClient.civ7.autoplay({ action }));
  if (error) {
    return {
      ok: false,
      error:
        error instanceof Error && error.message ? error.message : "Civ7 autoplay request failed",
    };
  }
  // Parity: the autoplay procedure returns 200 with `ok = result.verified`, so a
  // succeeded-transport-but-unverified action still surfaces as `{ ok:false }`
  // (the legacy handler returned `{ ok:false, error }` when `body.ok` was falsy).
  if (!body.ok) {
    return { ok: false, error: "Civ7 autoplay request failed" };
  }
  return {
    ok: true,
    action: body.action,
    autoplay: body.autoplay as {
      isActive?: boolean;
      isPaused?: boolean;
      isPausedOrPending?: boolean;
    },
    game: body.game as { turn?: { ok?: boolean; value?: number } },
  };
}

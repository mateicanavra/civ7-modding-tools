import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import type { Civ7SetupCatalog } from "../../features/civ7Setup/api";
import type { Civ7SavedSetupConfigFile } from "../../features/civ7Setup/setupConfig";
import { orpc } from "../../lib/orpc";

/**
 * `useSetupDataQueries` — the saved-configs + setup-catalog READ surface, realised as
 * oRPC-native TanStack Query (architecture/10 §2: `orpc.<ns>.<proc>.queryOptions()` into
 * `useQuery`). It replaces the hand-rolled `StudioShell` load/retry/focus-refetch effect.
 *
 * Parity:
 * - Retry-on-failure and refetch-on-window-focus are provided by the shared query
 *   client defaults (`src/lib/query.ts`: `retry: 1`, `refetchOnWindowFocus: true`),
 *   matching the legacy retry timer + `window.addEventListener("focus", …)`.
 * - The derived view shapes (`{ status, directory, configurations, updatedAt, error }` /
 *   `{ status, catalog, updatedAt, error }`) are byte-for-byte the same objects
 *   `setupControlOptions` and the rest of the shell consumed before — only their source
 *   moved from `useState` to query state. `status` is `"idle"` until the first settle,
 *   then `"ok"` / `"error"`; `updatedAt`/`observedAt` fall back to the body value then
 *   `new Date().toISOString()`, exactly as the prior wrappers did.
 *
 * The oRPC client throws the contract's DEFINED errors on failure
 * (SAVED_CONFIGS_UNAVAILABLE / SETUP_CATALOG_UNAVAILABLE — see
 * packages/studio-server/src/contract/errors.ts), which `useQuery` surfaces as
 * `error`. These views only consume the message (the legacy wrappers only read
 * `error`/`observedAt` here), so the typed code/data are intentionally not
 * threaded through — `errorMessage` below is a plain message fallback, not an
 * oRPC extraction wrapper.
 */

export type SavedSetupConfigsView = {
  status: "idle" | "ok" | "error";
  directory?: string;
  configurations: ReadonlyArray<Civ7SavedSetupConfigFile>;
  updatedAt?: string;
  error?: string;
};

export type SetupCatalogView = {
  status: "idle" | "ok" | "error";
  catalog?: Civ7SetupCatalog;
  updatedAt?: string;
  error?: string;
};

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export function useSetupDataQueries(): {
  savedSetupConfigs: SavedSetupConfigsView;
  setupCatalog: SetupCatalogView;
} {
  const savedConfigsQuery = useQuery(orpc.civ7.savedConfigs.queryOptions({ input: {} }));
  const setupCatalogQuery = useQuery(orpc.civ7.setupCatalog.queryOptions({ input: {} }));

  const savedSetupConfigs = useMemo<SavedSetupConfigsView>(() => {
    if (savedConfigsQuery.isError) {
      return {
        status: "error",
        configurations: [],
        error: errorMessage(savedConfigsQuery.error, "Civ7 saved configurations unavailable"),
        updatedAt: new Date().toISOString(),
      };
    }
    const body = savedConfigsQuery.data;
    if (!body) {
      return { status: "idle", configurations: [] };
    }
    return {
      status: "ok",
      directory: body.directory ?? "",
      // The contract deliberately types `configurations` as opaque records:
      // the saved-config file shape is owned by @civ7/direct-control
      // (listCiv7SavedGameConfigurations), and re-declaring it in the oRPC
      // contract would just drift. The cast states that trust explicitly.
      configurations: body.configurations as unknown as ReadonlyArray<Civ7SavedSetupConfigFile>,
      updatedAt: body.observedAt ?? new Date().toISOString(),
    };
  }, [savedConfigsQuery.data, savedConfigsQuery.error, savedConfigsQuery.isError]);

  const setupCatalog = useMemo<SetupCatalogView>(() => {
    if (setupCatalogQuery.isError) {
      return {
        status: "error",
        error: errorMessage(setupCatalogQuery.error, "Civ7 setup catalog unavailable"),
        updatedAt: new Date().toISOString(),
      };
    }
    const body = setupCatalogQuery.data;
    if (!body) {
      return { status: "idle" };
    }
    // Same deliberate-opacity trust as `configurations` above: the catalog
    // shape is owned by the server's civ7Resources catalog builder.
    const catalog = body.catalog as unknown as Civ7SetupCatalog;
    return {
      status: "ok",
      catalog,
      updatedAt: catalog.observedAt ?? new Date().toISOString(),
    };
  }, [setupCatalogQuery.data, setupCatalogQuery.error, setupCatalogQuery.isError]);

  return { savedSetupConfigs, setupCatalog };
}

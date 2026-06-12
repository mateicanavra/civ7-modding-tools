// Civ7 setup data surface: live setup-config snapshot, saved configurations,
// the setup option catalog, and autoplay control.
//
// EVERYTHING talks oRPC (FRAME §4.7): these callers speak the studio's own
// `@civ7/studio-server` contract through the typed oRPC client (`src/lib/orpc.ts`)
// — there is NO manual `fetch` of `/api/*` here anymore. The request shapes, the
// optional abort signal, and the per-endpoint error/status-code RESULT shapes are
// preserved verbatim from the previous hand-rolled fetch wrappers: the transport
// moved from `fetch` to the oRPC client, the returned `{ ok, error, statusCode,
// observedAt }` envelopes did not. The non-uniform per-procedure status codes
// (setup-config → 503, saved-configs/setup-catalog → 500) survive because the
// router maps them onto `ORPCError.status`, which we read back below.
import { ORPCError } from "@orpc/client";

import { orpcClient, readErrorData } from "../../lib/orpc";
import type { Civ7SavedSetupConfigFile, Civ7SetupSnapshotLike } from "./setupConfig";

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

/**
 * Translate a thrown oRPC client error into the legacy failure envelope fields.
 *
 * The studio-server router re-throws per-procedure `ORPCError`s whose `status`
 * pins the legacy HTTP code and whose `data` carries the extra body fields
 * (`observedAt`, …). A non-`ORPCError` throw (e.g. the link could not reach the
 * dev server) maps to the same `err instanceof Error ? err.message : fallback`
 * shape the old `catch` blocks used, with no `statusCode`.
 */
function orpcFailure(
  err: unknown,
  fallback: string,
): { error: string; statusCode?: number; observedAt?: string } {
  if (err instanceof ORPCError) {
    // `observedAt` rides in the error body for setupConfig (503) and savedConfigs
    // (500) — the router attaches it via `orpcError(…, { observedAt })`.
    const data = readErrorData<{ observedAt: string }>(err);
    return {
      error: err.message || `HTTP ${err.status}`,
      statusCode: err.status,
      ...(typeof data?.observedAt === "string" ? { observedAt: data.observedAt } : {}),
    };
  }
  return { error: err instanceof Error ? err.message : fallback };
}

export async function fetchCiv7SetupConfig(options: { signal?: AbortSignal } = {}): Promise<
  | { ok: true; observedAt: string; setup: Civ7SetupSnapshotLike }
  | { ok: false; error: string; observedAt?: string; statusCode?: number }
> {
  try {
    const body = await orpcClient.civ7.setupConfig(
      {},
      options.signal ? { signal: options.signal } : undefined,
    );
    return {
      ok: true,
      // Contract-required on the success body (civ7.setupConfig output: isoTimestamp).
      observedAt: body.observedAt,
      setup: body.setup as Civ7SetupSnapshotLike,
    };
  } catch (err) {
    return { ok: false, ...orpcFailure(err, "Civ7 setup config unavailable") };
  }
}

export async function fetchCiv7SavedSetupConfigs(): Promise<
  | { ok: true; observedAt: string; directory: string; configurations: ReadonlyArray<Civ7SavedSetupConfigFile> }
  | { ok: false; error: string; observedAt?: string; statusCode?: number }
> {
  try {
    const body = await orpcClient.civ7.savedConfigs({});
    return {
      ok: true,
      // Both contract-required on the success body (civ7.savedConfigs output:
      // `observedAt: isoTimestamp`, `directory: z.string()`).
      observedAt: body.observedAt,
      directory: body.directory,
      configurations: body.configurations as unknown as ReadonlyArray<Civ7SavedSetupConfigFile>,
    };
  } catch (err) {
    return { ok: false, ...orpcFailure(err, "Civ7 saved configurations unavailable") };
  }
}

export async function fetchCiv7SetupCatalog(): Promise<
  | { ok: true; catalog: Civ7SetupCatalog }
  | { ok: false; error: string; observedAt?: string; statusCode?: number }
> {
  try {
    const body = await orpcClient.civ7.setupCatalog({});
    return { ok: true, catalog: body.catalog as unknown as Civ7SetupCatalog };
  } catch (err) {
    return { ok: false, ...orpcFailure(err, "Civ7 setup catalog unavailable") };
  }
}

export async function requestCiv7Autoplay(action: "start" | "stop"): Promise<{
  ok: boolean;
  action?: "start" | "stop";
  autoplay?: { isActive?: boolean; isPaused?: boolean; isPausedOrPending?: boolean };
  game?: { turn?: { ok?: boolean; value?: number } };
  error?: string;
}> {
  try {
    const body = await orpcClient.civ7.autoplay({ action });
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
  } catch (err) {
    return { ok: false, error: orpcFailure(err, "Civ7 autoplay request failed").error };
  }
}

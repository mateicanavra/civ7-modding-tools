// Civ7 setup HTTP surface: live setup-config snapshot, saved configurations,
// the setup option catalog, and autoplay control.
//
// Thin `fetch` wrappers over `/api/civ7/*`. Extracted verbatim from `App.tsx`
// during the app-decomposition slice — request shapes, the optional abort
// signal, and the per-endpoint error/status-code handling are unchanged.
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

export async function fetchCiv7SetupConfig(options: { signal?: AbortSignal } = {}): Promise<
  | { ok: true; observedAt: string; setup: Civ7SetupSnapshotLike }
  | { ok: false; error: string; observedAt?: string; statusCode?: number }
> {
  try {
    const res = await fetch("/api/civ7/setup-config", options.signal ? { signal: options.signal } : undefined);
    const body = (await res.json().catch(() => null)) as {
      ok?: boolean;
      observedAt?: string;
      setup?: Civ7SetupSnapshotLike;
      error?: string;
    } | null;
    if (!res.ok || !body?.ok || !body.setup) {
      return {
        ok: false,
        error: body?.error ?? `HTTP ${res.status}`,
        observedAt: body?.observedAt,
        statusCode: res.status,
      };
    }
    return {
      ok: true,
      observedAt: body.observedAt ?? new Date().toISOString(),
      setup: body.setup,
    };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Civ7 setup config unavailable" };
  }
}

export async function fetchCiv7SavedSetupConfigs(): Promise<
  | { ok: true; observedAt: string; directory: string; configurations: ReadonlyArray<Civ7SavedSetupConfigFile> }
  | { ok: false; error: string; observedAt?: string; statusCode?: number }
> {
  try {
    const res = await fetch("/api/civ7/saved-configs");
    const body = (await res.json().catch(() => null)) as {
      ok?: boolean;
      observedAt?: string;
      directory?: string;
      configurations?: ReadonlyArray<Civ7SavedSetupConfigFile>;
      error?: string;
    } | null;
    if (!res.ok || !body?.ok || !Array.isArray(body.configurations)) {
      return {
        ok: false,
        error: body?.error ?? `HTTP ${res.status}`,
        observedAt: body?.observedAt,
        statusCode: res.status,
      };
    }
    return {
      ok: true,
      observedAt: body.observedAt ?? new Date().toISOString(),
      directory: body.directory ?? "",
      configurations: body.configurations,
    };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Civ7 saved configurations unavailable" };
  }
}

export async function fetchCiv7SetupCatalog(): Promise<
  | { ok: true; catalog: Civ7SetupCatalog }
  | { ok: false; error: string; observedAt?: string; statusCode?: number }
> {
  try {
    const res = await fetch("/api/civ7/setup-catalog");
    const body = (await res.json().catch(() => null)) as {
      ok?: boolean;
      catalog?: Civ7SetupCatalog;
      error?: string;
      observedAt?: string;
    } | null;
    if (!res.ok || !body?.ok || !body.catalog) {
      return {
        ok: false,
        error: body?.error ?? `HTTP ${res.status}`,
        observedAt: body?.observedAt,
        statusCode: res.status,
      };
    }
    return { ok: true, catalog: body.catalog };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Civ7 setup catalog unavailable" };
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
    const res = await fetch("/api/civ7/autoplay", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    const body = (await res.json().catch(() => null)) as {
      ok?: boolean;
      action?: "start" | "stop";
      autoplay?: { isActive?: boolean; isPaused?: boolean; isPausedOrPending?: boolean };
      game?: { turn?: { ok?: boolean; value?: number } };
      error?: string;
    } | null;
    if (!res.ok || !body?.ok) {
      return { ok: false, error: body?.error ?? `HTTP ${res.status}` };
    }
    return { ok: true, action: body.action, autoplay: body.autoplay, game: body.game };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Civ7 autoplay request failed" };
  }
}

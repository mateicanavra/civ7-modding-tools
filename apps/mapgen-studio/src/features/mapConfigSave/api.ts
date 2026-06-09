// Map-config save/deploy HTTP surface and its persistence key.
//
// Thin `fetch` wrappers over the `/api/map-configs*` endpoints plus the
// localStorage key used to correlate the last save/deploy request across
// dev-server reloads. Extracted verbatim from `App.tsx` during the
// app-decomposition slice — request shapes, error handling, and the key string
// are unchanged (localStorage contract preserved).
import { delay } from "../../shared/async";
import type { MapConfigSaveDeployStatus } from "./status";

export const MAP_CONFIG_SAVE_LAST_REQUEST_KEY = "mapgen-studio.mapConfigSave.lastRequestId.v1";

export function toConfigId(label: string): string {
  const id = label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return id || `map-config-${Date.now()}`;
}

export async function fetchMapConfigSaveDeployStatus(
  requestId: string,
): Promise<MapConfigSaveDeployStatus | { ok: false; error: string; statusCode?: number }> {
  try {
    const res = await fetch(`/api/map-configs/status?requestId=${encodeURIComponent(requestId)}`);
    const body = (await res.json().catch(() => null)) as (Partial<MapConfigSaveDeployStatus> & { error?: string }) | null;
    if (!res.ok || !body?.requestId) {
      return { ok: false, error: body?.error ?? `HTTP ${res.status}`, statusCode: res.status };
    }
    return body as MapConfigSaveDeployStatus;
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Save/Deploy status unavailable" };
  }
}

export async function saveRepoBackedConfig(args: {
  requestId: string;
  id: string;
  name: string;
  description?: string;
  sourcePath?: string;
  sortIndex: number;
  latitudeBounds?: Readonly<{
    topLatitude: number;
    bottomLatitude: number;
  }>;
  config: unknown;
  onStatus?: (status: MapConfigSaveDeployStatus) => void;
}): Promise<
  | { ok: true; path?: string; deploy?: { command?: string } }
  | { ok: false; error: string; saved?: boolean; deployed?: boolean; path?: string }
> {
  const envelope = {
    $schema: "../../../dist/recipes/standard-map-config.schema.json",
    id: args.id,
    name: args.name,
    description: args.description?.trim() || args.name,
    recipe: "standard",
    sortIndex: args.sortIndex,
    ...(args.latitudeBounds ? { latitudeBounds: args.latitudeBounds } : {}),
    config: args.config,
  };
  try {
    const res = await fetch("/api/map-configs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId: args.requestId, id: args.id, sourcePath: args.sourcePath, envelope }),
    });
    const body = (await res.json().catch(() => null)) as (Partial<MapConfigSaveDeployStatus> & { error?: string }) | null;
    if (!res.ok || !body?.requestId) {
      return { ok: false, error: body?.error ?? `HTTP ${res.status}`, path: body?.path };
    }
    let status = body as MapConfigSaveDeployStatus;
    args.onStatus?.(status);
    while (status.status === "running") {
      await delay(500);
      const next = await fetchMapConfigSaveDeployStatus(status.requestId);
      if (!("requestId" in next)) {
        return { ok: false, error: next.error, saved: status.saved, deployed: status.deployed, path: status.path };
      }
      status = next;
      args.onStatus?.(status);
    }
    if (!status.ok || status.status === "failed") {
      return {
        ok: false,
        error: status.error ?? "Save/deploy failed",
        saved: status.saved,
        deployed: status.deployed,
        path: status.path,
      };
    }
    return { ok: true, path: status.path, deploy: status.deploy };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Repo config save failed" };
  }
}

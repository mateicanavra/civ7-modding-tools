// Map-config save/deploy data surface and its persistence key.
//
// EVERYTHING talks oRPC (FRAME §4.7): these callers speak the studio's own
// `@civ7/studio-server` contract through the typed oRPC client (`src/lib/orpc.ts`)
// — there is NO manual `fetch` of `/api/map-configs*` here anymore. The request
// shapes, the running-status poll loop, the error handling, and the localStorage
// key string are preserved verbatim (localStorage contract is hard-core parity):
// only the transport moved from `fetch` to the oRPC client. The non-uniform error
// codes (saveDeploy validation → 400, status miss → 404) survive on
// `ORPCError.status`.
import { ORPCError } from "@orpc/client";

import { orpcClient } from "../../lib/orpc";
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

/** Map a thrown oRPC client error to `{ error, statusCode }` (legacy code via `ORPCError.status`). */
function saveDeployFailure(err: unknown, fallback: string): { error: string; statusCode?: number } {
  if (err instanceof ORPCError) {
    return { error: err.message || `HTTP ${err.status}`, statusCode: err.status };
  }
  return { error: err instanceof Error ? err.message : fallback };
}

export async function fetchMapConfigSaveDeployStatus(
  requestId: string,
): Promise<MapConfigSaveDeployStatus | { ok: false; error: string; statusCode?: number }> {
  try {
    const body = await orpcClient.mapConfigs.status({ requestId });
    return body as MapConfigSaveDeployStatus;
  } catch (err) {
    return { ok: false, ...saveDeployFailure(err, "Save/Deploy status unavailable") };
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
  | { ok: true; path?: string; deploy?: MapConfigSaveDeployStatus["deploy"] }
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
    let status: MapConfigSaveDeployStatus;
    try {
      status = (await orpcClient.mapConfigs.saveDeploy({
        requestId: args.requestId,
        id: args.id,
        sourcePath: args.sourcePath,
        envelope,
      })) as MapConfigSaveDeployStatus;
    } catch (err) {
      // Parity: a saveDeploy throw carried `path` in the legacy body when present;
      // the oRPC error data does not, so we surface the failure without a path
      // (the engine only attaches `path` to the in-progress status, polled below).
      return { ok: false, ...saveDeployFailure(err, "Repo config save failed") };
    }
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

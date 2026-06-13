// Map-config save/deploy data surface.
//
// EVERYTHING talks oRPC (FRAME §4.7): these callers speak the studio's own
// `@civ7/studio-server` contract through the typed oRPC client (`src/lib/orpc.ts`)
// — there is NO manual `fetch` of `/api/map-configs*` here anymore. The request
// shapes and the running-status poll loop are preserved. Operation recovery is
// daemon-owned through `studio.operations.current`, not localStorage. Failures are
// read through oRPC's NATIVE typed contract errors: `safe(...)` +
// `isDefinedError(...)` expose the DECLARED code
// (SAVE_DEPLOY_BLOCKED/INVALID/FAILED/STATUS_NOT_FOUND, statuses pinned in
// packages/studio-server/src/contract/errors.ts) — the status-miss branch is
// `code === "SAVE_DEPLOY_STATUS_NOT_FOUND"` instead of a raw 404.
import { isDefinedError, safe } from "@orpc/client";

import { orpcClient } from "../../lib/orpc";
import { delay } from "../../shared/async";
import type { MapConfigSaveDeployStatus } from "./status";

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
): Promise<MapConfigSaveDeployStatus | { ok: false; error: string; code?: string }> {
  const { error, data } = await safe(orpcClient.mapConfigs.status({ requestId }));
  if (error) {
    return {
      ok: false,
      error:
        error instanceof Error && error.message
          ? error.message
          : "Save/Deploy status unavailable",
      ...(isDefinedError(error) ? { code: error.code } : {}),
    };
  }
  return data as MapConfigSaveDeployStatus;
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
    const saveResult = await safe(
      orpcClient.mapConfigs.saveDeploy({
        requestId: args.requestId,
        id: args.id,
        sourcePath: args.sourcePath,
        envelope,
      }),
    );
    if (saveResult.error) {
      // Parity: a saveDeploy throw carried `path` in the legacy body when present;
      // the oRPC error data does not, so we surface the failure without a path
      // (the engine only attaches `path` to the in-progress status, polled below).
      return {
        ok: false,
        error:
          saveResult.error instanceof Error && saveResult.error.message
            ? saveResult.error.message
            : "Repo config save failed",
      };
    }
    let status: MapConfigSaveDeployStatus = saveResult.data as MapConfigSaveDeployStatus;
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

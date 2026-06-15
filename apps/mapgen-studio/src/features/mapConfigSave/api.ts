// Map-config save/deploy data surface.
//
// EVERYTHING talks oRPC (FRAME §4.7): these callers speak the studio's own
// `@civ7/studio-server` contract through the typed oRPC client (`src/lib/orpc.ts`)
// — there is NO manual `fetch` of `/api/map-configs*` here anymore. The request
// shapes are preserved. Operation recovery and progress are daemon-owned through
// `studio.operations.current` and `studio.events.watch`, not localStorage or a
// private client-side status loop. Failures are read through oRPC's NATIVE typed
// contract errors: `safe(...)` +
// `isDefinedError(...)` expose the DECLARED code
// (SAVE_DEPLOY_BLOCKED/INVALID/FAILED/STATUS_NOT_FOUND, statuses pinned in
// packages/studio-server/src/contract/errors.ts).
import { safe } from "@orpc/client";

import { orpcClient } from "../../lib/orpc";
import type { MapConfigSaveDeployStatus } from "./status";

export function toConfigId(label: string): string {
  const id = label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return id || `map-config-${Date.now()}`;
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
  | { ok: true; status: MapConfigSaveDeployStatus; path?: string }
  | { ok: false; error: string; saved?: boolean; deployed?: boolean; path?: string }
> {
  const path = args.sourcePath ?? `mods/mod-swooper-maps/src/maps/configs/${args.id}.config.json`;
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
      })
    );
    if (saveResult.error) {
      return {
        ok: false,
        error:
          saveResult.error instanceof Error && saveResult.error.message
            ? saveResult.error.message
            : "Repo config save failed",
      };
    }
    const status = saveResult.data as MapConfigSaveDeployStatus;
    args.onStatus?.(status);
    return { ok: true, status, path: status.path ?? path };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Repo config save failed" };
  }
}

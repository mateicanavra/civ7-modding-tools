import {
  type ConfigSource,
  freezeSnapshot,
  type RunInGameOperationStatus,
  type RunInGameStartSource,
  serializeRunInGameStartSource,
  snapshotRunInGameStartSource,
} from "@civ7/studio-contract";
import type { RunInGameRelation } from "@swooper/mapgen-studio-ui";
import type { RecipeSettings, WorldSettings } from "@swooper/mapgen-studio-ui/types";
import type { Civ7StudioSetupConfig } from "../civ7Setup/setupConfig";

export type RunInGameClientSnapshot = Readonly<{
  requestId: string;
  authoringRevision: number;
  launchEnvelope: Readonly<{
    recipeSettings: Readonly<RecipeSettings>;
    worldSettings: Readonly<WorldSettings>;
    setupConfig: Civ7StudioSetupConfig;
    source: RunInGameStartSource;
  }>;
}>;

export type RunInGameCurrentRelation = RunInGameRelation;

/**
 * Retains exactly what the browser submitted. Catalog bytes are absent because
 * only the server can resolve and admit them; editor envelopes remain complete.
 */
export function buildRunInGameClientSnapshot(args: {
  requestId: string;
  authoringRevision: number;
  recipeSettings: RecipeSettings;
  worldSettings: WorldSettings;
  setupConfig: Civ7StudioSetupConfig;
  source: ConfigSource;
}): RunInGameClientSnapshot {
  const source = snapshotRunInGameStartSource(serializeRunInGameStartSource(args.source));
  if (source === undefined) throw new TypeError("Run in Game source must be portable JSON.");
  const launchEnvelope = freezeSnapshot({
    recipeSettings: structuredClone(args.recipeSettings),
    worldSettings: structuredClone(args.worldSettings),
    setupConfig: structuredClone(args.setupConfig),
    source,
  });
  return Object.freeze({
    requestId: args.requestId,
    authoringRevision: args.authoringRevision,
    launchEnvelope,
  });
}

export function relationForRunInGameOperation(args: {
  status?: RunInGameOperationStatus | null;
  snapshot?: RunInGameClientSnapshot | null;
  authoringRevision: number;
}): RunInGameCurrentRelation {
  if (!args.status || !args.snapshot || args.snapshot.requestId !== args.status.requestId) {
    return "unknown";
  }
  return args.snapshot.authoringRevision === args.authoringRevision ? "current" : "stale";
}

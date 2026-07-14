import {
  freezeSnapshot,
  type MapConfigEnvelope,
  type RunInGameOperationStatus,
  snapshotMapConfigEnvelope,
} from "@civ7/studio-contract";
import type { RunInGameRelation } from "@swooper/mapgen-studio-ui";
import type { WorldSettings } from "@swooper/mapgen-studio-ui/types";
import type { Civ7StudioSetupConfig } from "../civ7Setup/setupConfig";

export type RunInGameClientSnapshot = Readonly<{
  requestId: string;
  authoringRevision: number;
  launchEnvelope: Readonly<{
    seed: string;
    worldSettings: Readonly<WorldSettings>;
    setupConfig: Civ7StudioSetupConfig;
    canonicalConfig: MapConfigEnvelope;
  }>;
}>;

export type RunInGameCurrentRelation = RunInGameRelation;

/** Retains exactly the complete value the browser submitted. */
export function buildRunInGameClientSnapshot(args: {
  requestId: string;
  authoringRevision: number;
  seed: string;
  worldSettings: WorldSettings;
  setupConfig: Civ7StudioSetupConfig;
  canonicalConfig: MapConfigEnvelope;
}): RunInGameClientSnapshot {
  const canonicalConfig = snapshotMapConfigEnvelope(args.canonicalConfig);
  if (canonicalConfig === undefined)
    throw new TypeError("Run in Game config must be portable JSON.");
  return freezeSnapshot({
    requestId: args.requestId,
    authoringRevision: args.authoringRevision,
    launchEnvelope: {
      seed: args.seed,
      worldSettings: structuredClone(args.worldSettings),
      setupConfig: structuredClone(args.setupConfig),
      canonicalConfig,
    },
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

import type { WorldSettings } from "@swooper/mapgen-studio-ui/types";

/** Browser generation history records the admitted authoring values, never a config digest. */
export type BrowserRunSnapshot = Readonly<{
  authoringRevision: number;
  seed: string;
  worldSettings: Readonly<WorldSettings>;
}>;

export function buildBrowserRunSnapshot(args: {
  authoringRevision: number;
  seed: string;
  worldSettings: WorldSettings;
}): BrowserRunSnapshot {
  return {
    authoringRevision: args.authoringRevision,
    seed: args.seed,
    worldSettings: { ...args.worldSettings },
  };
}

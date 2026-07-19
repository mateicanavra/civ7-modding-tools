import type { Bounds, VizLayerEntryV2, VizManifestV2 } from "@swooper/mapgen-viz";

export type { Bounds, VizLayerEntryV2, VizManifestV2 };

export type VizAssetResolver = {
  readArrayBuffer(path: string): Promise<ArrayBuffer>;
};

export const DEFAULT_VIEW_STATE = { target: [0, 0, 0], zoom: 0 } as const;

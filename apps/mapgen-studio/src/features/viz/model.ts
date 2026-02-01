import type { Bounds, VizLayerEntryV1, VizManifestV1 } from "@swooper/mapgen-viz";

export type { Bounds, VizLayerEntryV1, VizManifestV1 };

export type VizAssetResolver = {
  readArrayBuffer(path: string): Promise<ArrayBuffer>;
};

export const DEFAULT_VIEW_STATE = { target: [0, 0, 0], zoom: 0 } as const;

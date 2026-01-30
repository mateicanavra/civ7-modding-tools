import type { VizLayerMeta } from "@swooper/mapgen-core";

export type Bounds = [minX: number, minY: number, maxX: number, maxY: number];

export type VizScalarFormat = "u8" | "i8" | "u16" | "i16" | "i32" | "f32";

export type VizLayerKind = "grid" | "points" | "segments";

export type VizLayerEntryV0 =
  | {
      kind: "grid";
      layerId: string;
      stepId: string;
      phase?: string;
      stepIndex: number;
      format: VizScalarFormat;
      dims: { width: number; height: number };
      path?: string;
      values?: ArrayBuffer;
      meta?: VizLayerMeta;
      bounds: Bounds;
      key?: string;
    }
  | {
      kind: "points";
      layerId: string;
      stepId: string;
      phase?: string;
      stepIndex: number;
      count: number;
      positionsPath?: string;
      positions?: ArrayBuffer;
      valuesPath?: string;
      values?: ArrayBuffer;
      valueFormat?: VizScalarFormat;
      meta?: VizLayerMeta;
      bounds: Bounds;
      key?: string;
    }
  | {
      kind: "segments";
      layerId: string;
      stepId: string;
      phase?: string;
      stepIndex: number;
      count: number;
      segmentsPath?: string;
      segments?: ArrayBuffer;
      valuesPath?: string;
      values?: ArrayBuffer;
      valueFormat?: VizScalarFormat;
      meta?: VizLayerMeta;
      bounds: Bounds;
      key?: string;
    };

export type VizManifestV0 = {
  version: 0;
  runId: string;
  planFingerprint: string;
  steps: Array<{ stepId: string; phase?: string; stepIndex: number }>;
  layers: VizLayerEntryV0[];
};

export type VizLayerVisibility = "default" | "debug" | "hidden";

export type TileLayout = "row-offset" | "col-offset";

export type EraLayerInfo = { eraIndex: number; baseLayerId: string };

export type VizAssetResolver = {
  readArrayBuffer(path: string): Promise<ArrayBuffer>;
};

export const DEFAULT_VIEW_STATE = { target: [0, 0, 0], zoom: 0 } as const;

export function getLayerKey(layer: { key?: string; stepId: string; layerId: string; kind: string }): string {
  return layer.key ?? `${layer.stepId}::${layer.layerId}::${layer.kind}`;
}

export function parseTectonicHistoryEraLayerId(layerId: string): EraLayerInfo | null {
  const m = /^foundation\.tectonicHistory\.era(\d+)\.(.+)$/.exec(layerId);
  if (!m) return null;
  const eraIndex = Number.parseInt(m[1] ?? "", 10);
  const baseLayerId = String(m[2] ?? "");
  if (!Number.isFinite(eraIndex) || eraIndex < 0 || !baseLayerId) return null;
  return { eraIndex, baseLayerId };
}

export function normalizeManifest(manifest: VizManifestV0 | null): VizManifestV0 | null {
  if (!manifest) return null;
  const layers = manifest.layers.map((layer) => (layer.key ? layer : { ...layer, key: getLayerKey(layer) }));
  return { ...manifest, layers };
}

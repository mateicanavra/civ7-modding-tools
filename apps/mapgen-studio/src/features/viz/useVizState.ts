import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Layer } from "@deck.gl/core";
import type { VizEvent } from "../../shared/vizEvents";
import { ingestVizEvent } from "./ingest";
import {
  buildBackgroundGridLayer,
  boundsForTileGrid,
  fitToBounds,
  renderDeckLayers,
} from "./deckgl/render";
import {
  formatLayerLabel,
  formatStepLabel,
  legendForLayer,
  resolveLayerVisibility,
} from "./presentation";
import {
  DEFAULT_VIEW_STATE,
  getLayerKey,
  normalizeManifest,
  parseTectonicHistoryEraLayerId,
  type Bounds,
  type TileLayout,
  type VizAssetResolver,
  type VizLayerEntryV0,
  type VizManifestV0,
} from "./model";

export type UseVizStateArgs = {
  enabled: boolean;
  mode: "browser" | "dump";
  assetResolver?: VizAssetResolver | null;
  tileLayout?: TileLayout;
  showMeshEdges?: boolean;
  showBackgroundGrid?: boolean;
  viewportSize?: { width: number; height: number };
  allowPendingSelection?: boolean;
  onError?(error: unknown): void;
};

export type UseVizStateResult = {
  ingest(event: VizEvent): void;
  clearStream(): void;
  setDumpManifest(manifest: VizManifestV0 | null): void;

  selectedStepId: string | null;
  setSelectedStepId(next: string | null): void;
  selectedLayerKey: string | null;
  setSelectedLayerKey(next: string | null): void;

  steps: Array<{ stepId: string; stepIndex: number }>;
  selectableLayers: Array<{ key: string; label: string; visibility: "default" | "debug" | "hidden"; group?: string }>;
  legend: ReturnType<typeof legendForLayer> | null;

  deck: { layers: Layer[]; viewState: any; onViewStateChange(next: any): void };

  effectiveLayer: VizLayerEntryV0 | null;
  era: { active: boolean; value: number; max: number | null; setValue(next: number): void };
  activeBounds: Bounds | null;
  fitToActive(): void;
  resetView(): void;
  manifest: VizManifestV0 | null;
};

export function useVizState(args: UseVizStateArgs): UseVizStateResult {
  const {
    enabled,
    mode,
    assetResolver,
    tileLayout = "row-offset",
    showMeshEdges = true,
    showBackgroundGrid = true,
    viewportSize = { width: 800, height: 600 },
    allowPendingSelection = false,
    onError,
  } = args;

  const [streamManifest, setStreamManifest] = useState<VizManifestV0 | null>(null);
  const [dumpManifest, setDumpManifestState] = useState<VizManifestV0 | null>(null);
  const manifest = mode === "dump" ? dumpManifest : streamManifest;

  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);
  const [selectedLayerKey, setSelectedLayerKey] = useState<string | null>(null);
  const selectedStepIdRef = useRef<string | null>(null);
  const selectedLayerKeyRef = useRef<string | null>(null);

  const [viewState, setViewState] = useState<any>({ ...DEFAULT_VIEW_STATE });
  const [layerStats, setLayerStats] = useState<{ min?: number; max?: number } | null>(null);
  const [resolvedLayers, setResolvedLayers] = useState<Layer[]>([]);
  const [eraIndex, setEraIndex] = useState<number>(0);

  useEffect(() => {
    selectedStepIdRef.current = selectedStepId;
  }, [selectedStepId]);

  useEffect(() => {
    selectedLayerKeyRef.current = selectedLayerKey;
  }, [selectedLayerKey]);

  const ingest = useCallback(
    (event: VizEvent) => {
      if (!enabled) return;
      setStreamManifest((prev) => ingestVizEvent(prev, event));

      if (event.type === "run.progress" && event.kind === "step.start") {
        setSelectedStepId((prev) => prev ?? event.stepId);
        return;
      }

      if (event.type === "viz.layer.upsert") {
        setSelectedStepId((prev) => prev ?? event.layer.stepId);
        setSelectedLayerKey((prev) => {
          if (prev) return prev;
          const desiredStep = selectedStepIdRef.current ?? event.layer.stepId;
          if (event.layer.stepId !== desiredStep) return prev;
          return event.layer.key;
        });
      }
    },
    [enabled]
  );

  const clearStream = useCallback(() => {
    setStreamManifest(null);
    setLayerStats(null);
    setResolvedLayers([]);
  }, []);

  const setDumpManifest = useCallback((next: VizManifestV0 | null) => {
    setDumpManifestState(normalizeManifest(next));
  }, []);

  const steps = useMemo(() => {
    if (!manifest) return [];
    return [...manifest.steps].sort((a, b) => a.stepIndex - b.stepIndex);
  }, [manifest]);

  useEffect(() => {
    if (!manifest) return;
    if (selectedStepId && manifest.steps.some((s) => s.stepId === selectedStepId)) return;
    if (allowPendingSelection && selectedStepId) return;
    const firstStep = [...manifest.steps].sort((a, b) => a.stepIndex - b.stepIndex)[0]?.stepId ?? null;
    setSelectedStepId(firstStep);
    setSelectedLayerKey(null);
  }, [allowPendingSelection, manifest, selectedStepId]);

  const layersForStep = useMemo(() => {
    if (!manifest || !selectedStepId) return [];
    return manifest.layers
      .filter((l) => l.stepId === selectedStepId)
      .map((l) => ({ key: getLayerKey(l), layer: l }));
  }, [manifest, selectedStepId]);

  const selectableLayers = useMemo(
    () =>
      layersForStep.map((entry) => ({
        key: entry.key,
        label: formatLayerLabel(entry.layer),
        visibility: resolveLayerVisibility(entry.layer),
        group: entry.layer.meta?.group,
      })),
    [layersForStep]
  );

  const selectedLayer = useMemo(() => {
    if (!layersForStep.length || !selectedLayerKey) return null;
    return layersForStep.find((l) => l.key === selectedLayerKey)?.layer ?? null;
  }, [layersForStep, selectedLayerKey]);

  useEffect(() => {
    if (!manifest || !selectedStepId) return;
    if (!layersForStep.length) return;
    const hasSelected = selectedLayerKey && layersForStep.some((l) => l.key === selectedLayerKey);
    if (hasSelected) return;
    if (allowPendingSelection && selectedLayerKey) return;
    const first = [...layersForStep].sort((a, b) => a.layer.stepIndex - b.layer.stepIndex)[0];
    if (!first) return;
    setSelectedLayerKey(first.key);
    const bounds =
      first.layer.kind === "grid"
        ? boundsForTileGrid(tileLayout, first.layer.dims, 1)
        : first.layer.bounds;
    const fit = fitToBounds(bounds, viewportSize);
    setViewState((prev: any) => ({ ...prev, ...fit }));
  }, [allowPendingSelection, layersForStep, manifest, selectedLayerKey, selectedStepId, tileLayout, viewportSize]);

  const eraInfo = useMemo(() => {
    if (!selectedLayer) return null;
    return parseTectonicHistoryEraLayerId(selectedLayer.layerId);
  }, [selectedLayer]);

  const eraMax = useMemo(() => {
    if (!manifest || !selectedStepId || !eraInfo) return null;
    let max = -1;
    const prefix = `foundation.tectonicHistory.era`;
    const suffix = `.${eraInfo.baseLayerId}`;
    for (const layer of manifest.layers) {
      if (layer.stepId !== selectedStepId) continue;
      if (!layer.layerId.startsWith(prefix)) continue;
      if (!layer.layerId.endsWith(suffix)) continue;
      const info = parseTectonicHistoryEraLayerId(layer.layerId);
      if (!info) continue;
      if (info.baseLayerId !== eraInfo.baseLayerId) continue;
      if (info.eraIndex > max) max = info.eraIndex;
    }
    return max >= 0 ? max : null;
  }, [manifest, selectedStepId, eraInfo]);

  useEffect(() => {
    if (!eraInfo) return;
    setEraIndex(eraInfo.eraIndex);
  }, [eraInfo]);

  const effectiveLayer = useMemo(() => {
    if (!manifest || !selectedStepId || !selectedLayer) return selectedLayer;
    if (!eraInfo) return selectedLayer;
    const idx = eraMax != null ? Math.max(0, Math.min(eraMax, eraIndex)) : eraIndex;
    const desiredId = `foundation.tectonicHistory.era${idx}.${eraInfo.baseLayerId}`;
    return (
      manifest.layers.find((l) => l.stepId === selectedStepId && l.layerId === desiredId) ?? selectedLayer
    );
  }, [manifest, selectedStepId, selectedLayer, eraInfo, eraIndex, eraMax]);

  const activeBounds = useMemo(() => {
    if (!effectiveLayer) return null;
    return effectiveLayer.kind === "grid"
      ? boundsForTileGrid(tileLayout, effectiveLayer.dims, 1)
      : effectiveLayer.bounds;
  }, [effectiveLayer, tileLayout]);

  const fitToActive = useCallback(() => {
    if (!activeBounds) return;
    const fit = fitToBounds(activeBounds, viewportSize);
    setViewState((prev: any) => ({ ...prev, ...fit }));
  }, [activeBounds, viewportSize]);

  const resetView = useCallback(() => {
    const fit = fitToBounds([0, 0, 1, 1], viewportSize);
    setViewState((prev: any) => ({ ...prev, ...fit }));
  }, [viewportSize]);

  useEffect(() => {
    if (!effectiveLayer) return;
    fitToActive();
  }, [effectiveLayer, fitToActive]);

  useEffect(() => {
    let alive = true;
    if (!manifest || !effectiveLayer) {
      setResolvedLayers([]);
      setLayerStats(null);
      return;
    }
    renderDeckLayers({
      manifest,
      layer: effectiveLayer,
      tileLayout,
      showMeshEdges,
      assetResolver,
    })
      .then((result) => {
        if (!alive) return;
        setResolvedLayers(result.layers);
        setLayerStats(result.stats);
      })
      .catch((error: unknown) => {
        if (!alive) return;
        onError?.(error);
      });
    return () => {
      alive = false;
    };
  }, [assetResolver, effectiveLayer, manifest, onError, showMeshEdges, tileLayout]);

  const backgroundGridLayer = useMemo(
    () =>
      buildBackgroundGridLayer({
        enabled: showBackgroundGrid,
        layer: effectiveLayer,
        viewState,
        viewportSize,
      }),
    [effectiveLayer, showBackgroundGrid, viewState, viewportSize]
  );

  const deckLayers = useMemo<Layer[]>(
    () => [...(backgroundGridLayer ? [backgroundGridLayer] : []), ...resolvedLayers],
    [backgroundGridLayer, resolvedLayers]
  );

  const legend = useMemo(() => {
    if (!effectiveLayer) return null;
    return legendForLayer(effectiveLayer, layerStats, {
      stepId: effectiveLayer.stepId,
      stepLabel: formatStepLabel(effectiveLayer.stepId),
      layerId: effectiveLayer.layerId,
      kind: effectiveLayer.kind,
      eraIndex: eraInfo && eraMax != null ? Math.max(0, Math.min(eraMax, eraIndex)) : undefined,
      tileLayout: effectiveLayer.kind === "grid" ? tileLayout : undefined,
    });
  }, [effectiveLayer, eraInfo, eraIndex, eraMax, layerStats, tileLayout]);

  return {
    ingest,
    clearStream,
    setDumpManifest,
    selectedStepId,
    setSelectedStepId,
    selectedLayerKey,
    setSelectedLayerKey,
    steps,
    selectableLayers,
    legend,
    deck: {
      layers: deckLayers,
      viewState,
      onViewStateChange: (next) => setViewState(next),
    },
    effectiveLayer,
    era: {
      active: Boolean(eraInfo && eraMax != null),
      value: eraIndex,
      max: eraMax,
      setValue: setEraIndex,
    },
    activeBounds,
    fitToActive,
    resetView,
    manifest,
  };
}

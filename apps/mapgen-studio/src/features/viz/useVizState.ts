import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import type { Layer } from "@deck.gl/core";
import type { VizEvent } from "../../shared/vizEvents";
import { boundsForTileGrid, renderDeckLayers } from "./deckgl/render";
import {
  formatLayerLabel,
  formatStepLabel,
  legendForLayer,
  resolveLayerVisibility,
} from "./presentation";
import {
  getLayerKey,
  normalizeManifest,
  type Bounds,
  type TileLayout,
  type VizAssetResolver,
  type VizLayerEntryV0,
  type VizManifestV0,
} from "./model";
import { getVizStore } from "./vizStore";

function isAbortError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  return (error as any).name === "AbortError";
}

export type UseVizStateArgs = {
  enabled: boolean;
  mode: "browser" | "dump";
  assetResolver?: VizAssetResolver | null;
  tileLayout?: TileLayout;
  showMeshEdges?: boolean;
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

  deck: { layers: Layer[] };

  effectiveLayer: VizLayerEntryV0 | null;
  activeBounds: Bounds | null;
  manifest: VizManifestV0 | null;
};

export function useVizState(args: UseVizStateArgs): UseVizStateResult {
  const {
    enabled,
    mode,
    assetResolver,
    tileLayout = "row-offset",
    showMeshEdges = true,
    allowPendingSelection = false,
    onError,
  } = args;

  const store = getVizStore();
  const snapshot = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
  const manifest = mode === "dump" ? snapshot.dumpManifest : snapshot.streamManifest;

  const selectedStepId = snapshot.selectedStepId;
  const selectedLayerKey = snapshot.selectedLayerKey;
  const setSelectedStepId = store.setSelectedStepId;
  const setSelectedLayerKey = store.setSelectedLayerKey;

  const [layerStats, setLayerStats] = useState<{ min?: number; max?: number } | null>(null);
  const [resolvedLayers, setResolvedLayers] = useState<Layer[]>([]);
  const renderAbortRef = useRef<AbortController | null>(null);
  const onErrorRef = useRef<UseVizStateArgs["onError"]>(onError);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  const ingest = useCallback(
    (event: VizEvent) => {
      if (!enabled) return;
      store.ingest(event);
    },
    [enabled, store]
  );

  const clearStream = useCallback(() => {
    store.clearStream();
    setLayerStats(null);
    setResolvedLayers([]);
  }, [store]);

  const setDumpManifest = useCallback((next: VizManifestV0 | null) => {
    store.setDumpManifest(normalizeManifest(next));
  }, [store]);

  const steps = useMemo(() => {
    if (!manifest) return [];
    return [...manifest.steps].sort((a, b) => a.stepIndex - b.stepIndex);
  }, [manifest]);

  const activeSelectedStepId = useMemo(() => {
    if (!manifest) return null;
    if (selectedStepId && (allowPendingSelection || manifest.steps.some((s) => s.stepId === selectedStepId))) {
      return selectedStepId;
    }
    return steps[0]?.stepId ?? null;
  }, [allowPendingSelection, manifest, selectedStepId, steps]);

  useEffect(() => {
    if (!manifest || allowPendingSelection) return;
    if (!selectedStepId) return;
    if (manifest.steps.some((s) => s.stepId === selectedStepId)) return;
    setSelectedStepId(activeSelectedStepId);
    setSelectedLayerKey(null);
  }, [
    activeSelectedStepId,
    allowPendingSelection,
    manifest,
    selectedStepId,
    setSelectedLayerKey,
    setSelectedStepId,
  ]);

  const layersForStep = useMemo(() => {
    if (!manifest || !activeSelectedStepId) return [];
    return manifest.layers
      .filter((l) => l.stepId === activeSelectedStepId)
      .map((l) => ({ key: getLayerKey(l), layer: l }));
  }, [activeSelectedStepId, manifest]);

  const activeSelectedLayerKey = useMemo(() => {
    if (!layersForStep.length) return selectedLayerKey ?? null;
    if (selectedLayerKey && (allowPendingSelection || layersForStep.some((l) => l.key === selectedLayerKey))) {
      return selectedLayerKey;
    }
    return layersForStep[0]?.key ?? null;
  }, [allowPendingSelection, layersForStep, selectedLayerKey]);

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
    if (!layersForStep.length || !activeSelectedLayerKey) return null;
    return layersForStep.find((l) => l.key === activeSelectedLayerKey)?.layer ?? null;
  }, [activeSelectedLayerKey, layersForStep]);

  const effectiveLayer = selectedLayer;

  const activeBounds = useMemo(() => {
    if (!effectiveLayer) return null;
    return effectiveLayer.kind === "grid"
      ? boundsForTileGrid(tileLayout, effectiveLayer.dims, 1)
      : effectiveLayer.bounds;
  }, [effectiveLayer, tileLayout]);

  useEffect(() => {
    // Cancel any in-flight render work. This prevents backlogs when the user
    // flips steps/layers quickly and avoids "UI freeze" from queued heavy work.
    renderAbortRef.current?.abort();
    const controller = new AbortController();
    renderAbortRef.current = controller;

    if (!manifest || !effectiveLayer) {
      setResolvedLayers((prev) => (prev.length ? [] : prev));
      setLayerStats((prev) => (prev ? null : prev));
      return;
    }
    renderDeckLayers({
      manifest,
      layer: effectiveLayer,
      tileLayout,
      showMeshEdges,
      assetResolver,
      signal: controller.signal,
    })
      .then((result) => {
        if (controller.signal.aborted) return;
        setResolvedLayers(result.layers);
        setLayerStats(result.stats);
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        if (isAbortError(error)) return;
        onErrorRef.current?.(error);
      });
    return () => {
      controller.abort();
      if (renderAbortRef.current === controller) renderAbortRef.current = null;
    };
  }, [assetResolver, effectiveLayer, manifest, showMeshEdges, tileLayout]);

  const legend = useMemo(() => {
    if (!effectiveLayer) return null;
    return legendForLayer(effectiveLayer, layerStats, {
      stepId: effectiveLayer.stepId,
      stepLabel: formatStepLabel(effectiveLayer.stepId),
      layerId: effectiveLayer.layerId,
      kind: effectiveLayer.kind,
      tileLayout: effectiveLayer.kind === "grid" ? tileLayout : undefined,
    });
  }, [effectiveLayer, layerStats, tileLayout]);

  return {
    ingest,
    clearStream,
    setDumpManifest,
    selectedStepId: activeSelectedStepId,
    setSelectedStepId,
    selectedLayerKey: activeSelectedLayerKey,
    setSelectedLayerKey,
    steps,
    selectableLayers,
    legend,
    deck: {
      layers: resolvedLayers,
    },
    effectiveLayer,
    activeBounds,
    manifest,
  };
}

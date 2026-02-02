import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import type { Layer } from "@deck.gl/core";
import type { VizEvent } from "../../shared/vizEvents";
import { parsePipelineAddress, type PipelineAddress } from "../../shared/pipelineAddress";
import { boundsForLayerInRenderSpace, renderDeckLayers } from "./deckgl/render";
import { buildStepDataTypeModel, type StepDataTypeModel } from "./dataTypeModel";
import {
  formatLayerLabel,
  formatStepLabel,
  legendForLayer,
  resolveLayerVisibility,
} from "./presentation";
import {
  type Bounds,
  type VizAssetResolver,
  type VizLayerEntryV1,
  type VizManifestV1,
} from "./model";
import { getVizStore } from "./vizStore";
import type { VizScalarStats } from "@swooper/mapgen-viz";

function isAbortError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  return (error as any).name === "AbortError";
}

export type UseVizStateArgs = {
  enabled: boolean;
  mode: "browser" | "dump";
  assetResolver?: VizAssetResolver | null;
  showEdgeOverlay?: boolean;
  allowPendingSelection?: boolean;
  onError?(error: unknown): void;
};

export type UseVizStateResult = {
  ingest(event: VizEvent): void;
  clearStream(): void;
  setDumpManifest(manifest: VizManifestV1 | null): void;

  selectedStepId: string | null;
  setSelectedStepId(next: string | null): void;
  selectedLayerKey: string | null;
  setSelectedLayerKey(next: string | null): void;
  showDebugLayers: boolean;
  setShowDebugLayers(next: boolean): void;

  steps: Array<{ stepId: string; stepIndex: number }>;
  pipelineSteps: Array<{ stepId: string; stepIndex: number; address: PipelineAddress | null }>;
  pipelineStages: Array<{
    stageId: string;
    steps: Array<{ stepId: string; stepIndex: number; address: PipelineAddress | null }>;
  }>;
  dataTypeModel: StepDataTypeModel | null;
  selectableLayers: Array<{ key: string; label: string; visibility: "default" | "debug" | "hidden"; group?: string }>;
  legend: ReturnType<typeof legendForLayer> | null;

  deck: { layers: Layer[] };

  effectiveLayer: VizLayerEntryV1 | null;
  activeBounds: Bounds | null;
  manifest: VizManifestV1 | null;
};

export function useVizState(args: UseVizStateArgs): UseVizStateResult {
  const {
    enabled,
    mode,
    assetResolver,
    showEdgeOverlay = true,
    allowPendingSelection = false,
    onError,
  } = args;

  const store = getVizStore();
  const snapshot = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
  const manifest = mode === "dump" ? snapshot.dumpManifest : snapshot.streamManifest;

  const selectedStepId = snapshot.selectedStepId;
  const selectedLayerKey = snapshot.selectedLayerKey;
  const showDebugLayers = snapshot.showDebugLayers;
  const setSelectedStepId = store.setSelectedStepId;
  const setSelectedLayerKey = store.setSelectedLayerKey;
  const setShowDebugLayers = store.setShowDebugLayers;

  const [layerStats, setLayerStats] = useState<VizScalarStats | null>(null);
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

  const setDumpManifest = useCallback((next: VizManifestV1 | null) => {
    store.setDumpManifest(next);
  }, [store]);

  const steps = useMemo(() => {
    if (!manifest) return [];
    return [...manifest.steps].sort((a, b) => a.stepIndex - b.stepIndex);
  }, [manifest]);

  const pipelineSteps = useMemo(
    () => steps.map((s) => ({ ...s, address: parsePipelineAddress(s.stepId) })),
    [steps]
  );

  const pipelineStages = useMemo(() => {
    const order: string[] = [];
    const byStage = new Map<string, UseVizStateResult["pipelineSteps"]>();
    for (const step of pipelineSteps) {
      const stageId = step.address?.stageId ?? "unknown";
      if (!byStage.has(stageId)) {
        byStage.set(stageId, []);
        order.push(stageId);
      }
      byStage.get(stageId)!.push(step);
    }
    return order.map((stageId) => ({ stageId, steps: byStage.get(stageId) ?? [] }));
  }, [pipelineSteps]);

  const activeSelectedStepId = useMemo(() => {
    if (!manifest) return null;
    if (selectedStepId && (allowPendingSelection || manifest.steps.some((s) => s.stepId === selectedStepId))) {
      return selectedStepId;
    }
    return steps[0]?.stepId ?? null;
  }, [allowPendingSelection, manifest, selectedStepId, steps]);

  const dataTypeModel = useMemo(() => {
    if (!manifest || !activeSelectedStepId) return null;
    return buildStepDataTypeModel(manifest, activeSelectedStepId, { includeDebug: showDebugLayers });
  }, [activeSelectedStepId, manifest, showDebugLayers]);

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
      .filter((l) => {
        const visibility = resolveLayerVisibility(l);
        if (visibility === "hidden") return false;
        if (visibility === "debug") return showDebugLayers;
        return true;
      })
      .map((l) => ({ key: l.layerKey, layer: l }));
  }, [activeSelectedStepId, manifest, showDebugLayers]);

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
    return boundsForLayerInRenderSpace(effectiveLayer, 1);
  }, [effectiveLayer]);

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
      showEdgeOverlay,
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
  }, [assetResolver, effectiveLayer, manifest, showEdgeOverlay]);

  const legend = useMemo(() => {
    if (!effectiveLayer) return null;
    return legendForLayer(effectiveLayer, layerStats, {
      stepId: effectiveLayer.stepId,
      stepLabel: formatStepLabel(effectiveLayer.stepId),
      layerKey: effectiveLayer.layerKey,
      dataTypeKey: effectiveLayer.dataTypeKey,
      kind: effectiveLayer.kind,
      spaceId: effectiveLayer.spaceId,
      variantKey: effectiveLayer.variantKey,
    });
  }, [effectiveLayer, layerStats]);

  return {
    ingest,
    clearStream,
    setDumpManifest,
    selectedStepId: activeSelectedStepId,
    setSelectedStepId,
    selectedLayerKey: activeSelectedLayerKey,
    setSelectedLayerKey,
    showDebugLayers,
    setShowDebugLayers,
    steps,
    pipelineSteps,
    pipelineStages,
    dataTypeModel,
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

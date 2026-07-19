import type { Layer } from "@deck.gl/core";
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import type { VizEvent } from "../../shared/vizEvents";
import { buildStepDataTypeModel, type StepDataTypeModel } from "./dataTypeModel";
import {
  boundsForLayerInRenderSpace,
  type RenderDeckLayersResult,
  renderDeckLayers,
  renderDeckLayersForSelection,
} from "./deckgl/render";
import {
  type Bounds,
  type VizAssetResolver,
  type VizLayerEntryV2,
  type VizManifestV2,
} from "./model";
import {
  formatLayerLabel,
  formatStepLabel,
  legendForLayer,
  resolveLayerVisibility,
} from "./presentation";
import { getVizStore } from "./vizStore";

function isAbortError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  return (error as any).name === "AbortError";
}

/** Runtime inputs that connect worker visualization evidence to one Studio selection surface. */
export type UseVizStateArgs = {
  enabled: boolean;
  assetResolver?: VizAssetResolver | null;
  showEdgeOverlay?: boolean;
  overlayDataTypeKey?: string | null;
  overlayVariantKeyPreference?: string | null;
  overlayOpacity?: number;
  allowPendingSelection?: boolean;
  onError?(error: unknown): void;
};

/** Selected visualization evidence, controls, Deck layers, and truthful legend presentation. */
export type UseVizStateResult = {
  ingest(event: VizEvent): void;
  clearStream(): void;

  selectedStepId: string | null;
  setSelectedStepId(next: string | null): void;
  selectedLayerKey: string | null;
  setSelectedLayerKey(next: string | null): void;
  showDebugLayers: boolean;
  setShowDebugLayers(next: boolean): void;

  steps: Array<{ stepId: string; stepIndex: number }>;
  dataTypeModel: StepDataTypeModel | null;
  selectableLayers: Array<{
    key: string;
    label: string;
    visibility: "default" | "debug" | "hidden";
    group?: string;
  }>;
  legend: ReturnType<typeof legendForLayer> | null;

  deck: { layers: Layer[] };

  effectiveLayer: VizLayerEntryV2 | null;
  activeBounds: Bounds | null;
  manifest: VizManifestV2 | null;
};

/**
 * Adopts worker evidence into Studio visualization state and renders the selected layer.
 * Async Deck work is cancelled on selection changes, and its scalar presentation is used only
 * while the originating manifest and layer remain the active object identities.
 */
export function useVizState(args: UseVizStateArgs): UseVizStateResult {
  const {
    enabled,
    assetResolver,
    showEdgeOverlay = true,
    overlayDataTypeKey = null,
    overlayVariantKeyPreference = null,
    overlayOpacity = 0.45,
    allowPendingSelection = false,
    onError,
  } = args;

  const store = getVizStore();
  const snapshot = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
  const manifest = snapshot.streamManifest;

  const selectedStepId = snapshot.selectedStepId;
  const selectedLayerKey = snapshot.selectedLayerKey;
  const showDebugLayers = snapshot.showDebugLayers;
  const setSelectedStepId = store.setSelectedStepId;
  const setSelectedLayerKey = store.setSelectedLayerKey;
  const setShowDebugLayers = store.setShowDebugLayers;

  const [rendered, setRendered] = useState<RenderDeckLayersResult>({
    layers: [],
    scalar: null,
    source: null,
  });
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
    setRendered({ layers: [], scalar: null, source: null });
  }, [store]);

  const steps = useMemo(() => {
    if (!manifest) return [];
    return [...manifest.steps].sort((a, b) => a.stepIndex - b.stepIndex);
  }, [manifest]);

  const activeSelectedStepId = useMemo(() => {
    if (!manifest) return null;
    if (
      selectedStepId &&
      (allowPendingSelection || manifest.steps.some((s) => s.stepId === selectedStepId))
    ) {
      return selectedStepId;
    }
    return steps[0]?.stepId ?? null;
  }, [allowPendingSelection, manifest, selectedStepId, steps]);

  const dataTypeModel = useMemo(() => {
    if (!manifest || !activeSelectedStepId) return null;
    return buildStepDataTypeModel(manifest, activeSelectedStepId, {
      includeDebug: showDebugLayers,
    });
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
    if (
      selectedLayerKey &&
      (allowPendingSelection || layersForStep.some((l) => l.key === selectedLayerKey))
    ) {
      return selectedLayerKey;
    }
    // Default preference: the map studio defaults to the MAP. When a step has
    // a tile-space grid layer, land there instead of whichever layer the
    // worker happened to emit first (points/mesh) — switching stages keeps
    // showing the hex grid wherever the step can draw one.
    const tileGrid = layersForStep.find(
      (l) => l.layer.kind === "grid" && l.layer.spaceId.startsWith("tile.")
    );
    return tileGrid?.key ?? layersForStep[0]?.key ?? null;
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

  const overlayLayer = useMemo(() => {
    if (!manifest || !overlayDataTypeKey) return null;
    if (!effectiveLayer) return null;
    let candidates = manifest.layers.filter((l) => l.dataTypeKey === overlayDataTypeKey);
    if (!candidates.length) return null;

    if (activeSelectedStepId) {
      const sameStep = candidates.filter((l) => l.stepId === activeSelectedStepId);
      if (sameStep.length) candidates = sameStep;
    }

    candidates = candidates.filter((l) => {
      const visibility = resolveLayerVisibility(l);
      if (visibility === "hidden") return false;
      if (visibility === "debug" && !showDebugLayers) return false;
      return true;
    });
    if (!candidates.length) return null;

    const preferredSpaceId = effectiveLayer.spaceId;
    const sameSpace = candidates.filter((l) => l.spaceId === preferredSpaceId);
    if (sameSpace.length) candidates = sameSpace;

    const preferredVariantKey = overlayVariantKeyPreference ?? effectiveLayer.variantKey ?? null;
    if (preferredVariantKey) {
      const sameVariant = candidates.filter((l) => l.variantKey === preferredVariantKey);
      if (sameVariant.length) candidates = sameVariant;
    }

    const sameKind = candidates.filter((l) => l.kind === effectiveLayer.kind);
    if (sameKind.length) candidates = sameKind;

    const preferredRole = effectiveLayer.meta?.role ?? null;
    if (preferredRole) {
      const sameRole = candidates.filter((l) => l.meta?.role === preferredRole);
      if (sameRole.length) candidates = sameRole;
    }

    const candidate = candidates[0] ?? null;
    if (!candidate) return null;
    if (candidate.layerKey === effectiveLayer.layerKey) return null;
    return candidate;
  }, [
    activeSelectedStepId,
    effectiveLayer,
    manifest,
    overlayDataTypeKey,
    overlayVariantKeyPreference,
    showDebugLayers,
  ]);

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
      // eslint-disable-next-line react-hooks/set-state-in-effect -- This effect orchestrates async render work (AbortController + renderDeckLayers). The synchronous setState here clears stale layers when there is no manifest/layer to render; clearing as part of an external-render-sync effect is legitimate and cannot be derived during render (the work is async).
      setRendered((previous) =>
        previous.layers.length || previous.source
          ? { layers: [], scalar: null, source: null }
          : previous
      );
      return;
    }
    renderDeckLayers({
      manifest,
      layer: effectiveLayer,
      overlayLayer,
      overlayOpacity,
      showEdgeOverlay,
      assetResolver,
      signal: controller.signal,
    })
      .then((result) => {
        if (controller.signal.aborted) return;
        setRendered(result);
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
  }, [assetResolver, effectiveLayer, manifest, overlayLayer, overlayOpacity, showEdgeOverlay]);

  const selectedRender = renderDeckLayersForSelection(rendered, manifest, effectiveLayer);

  const legend = useMemo(() => {
    if (!effectiveLayer) return null;
    return legendForLayer(effectiveLayer, selectedRender.scalar, {
      stepId: effectiveLayer.stepId,
      stepLabel: formatStepLabel(effectiveLayer.stepId),
      layerKey: effectiveLayer.layerKey,
      dataTypeKey: effectiveLayer.dataTypeKey,
      kind: effectiveLayer.kind,
      spaceId: effectiveLayer.spaceId,
      variantKey: effectiveLayer.variantKey,
    });
  }, [effectiveLayer, selectedRender.scalar]);

  return {
    ingest,
    clearStream,
    selectedStepId: activeSelectedStepId,
    setSelectedStepId,
    selectedLayerKey: activeSelectedLayerKey,
    setSelectedLayerKey,
    showDebugLayers,
    setShowDebugLayers,
    steps,
    dataTypeModel,
    selectableLayers,
    legend,
    deck: {
      layers: selectedRender.layers,
    },
    effectiveLayer,
    activeBounds,
    manifest,
  };
}

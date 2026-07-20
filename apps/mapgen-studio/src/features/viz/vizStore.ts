import type { VizEvent } from "../../shared/vizEvents";
import { ingestVizEvent } from "./ingest";
import type { VizManifestV2 } from "./model";

export type VizStoreSnapshot = Readonly<{
  streamManifest: VizManifestV2 | null;
  selectedStepId: string | null;
  selectedLayerKey: string | null;
  showDebugLayers: boolean;
}>;

export type VizStore = {
  subscribe(onStoreChange: () => void): () => void;
  getSnapshot(): VizStoreSnapshot;

  ingest(event: VizEvent): void;
  clearStream(): void;

  setSelectedStepId(next: string | null): void;
  setSelectedLayerKey(next: string | null): void;
  setShowDebugLayers(next: boolean): void;
};

export function createVizStore(): VizStore {
  const listeners = new Set<() => void>();

  let streamManifest: VizManifestV2 | null = null;
  let selectedStepId: string | null = null;
  let selectedLayerKey: string | null = null;
  let showDebugLayers = false;

  // `useSyncExternalStore` requires `getSnapshot()` to return a stable reference
  // when nothing changed; returning a fresh object on every call can cause
  // infinite render loops.
  let snapshot: VizStoreSnapshot = Object.freeze({
    streamManifest,
    selectedStepId,
    selectedLayerKey,
    showDebugLayers,
  });

  let pendingStreamManifest: VizManifestV2 | null | undefined = undefined;
  let pendingSelectedStepId: string | null | undefined = undefined;
  let pendingSelectedLayerKey: string | null | undefined = undefined;
  let rafId: number | null = null;
  let backstopId: ReturnType<typeof setTimeout> | null = null;

  const notify = () => {
    for (const l of listeners) l();
  };

  const updateSnapshot = () => {
    snapshot = Object.freeze({
      streamManifest,
      selectedStepId,
      selectedLayerKey,
      showDebugLayers,
    });
  };

  const commit = () => {
    if (rafId != null && typeof cancelAnimationFrame === "function") cancelAnimationFrame(rafId);
    if (backstopId != null) clearTimeout(backstopId);
    rafId = null;
    backstopId = null;
    let changed = false;

    if (pendingStreamManifest !== undefined && pendingStreamManifest !== streamManifest) {
      streamManifest = pendingStreamManifest;
      changed = true;
    }
    pendingStreamManifest = undefined;

    if (pendingSelectedStepId !== undefined && pendingSelectedStepId !== selectedStepId) {
      selectedStepId = pendingSelectedStepId;
      changed = true;
    }
    pendingSelectedStepId = undefined;

    if (pendingSelectedLayerKey !== undefined && pendingSelectedLayerKey !== selectedLayerKey) {
      selectedLayerKey = pendingSelectedLayerKey;
      changed = true;
    }
    pendingSelectedLayerKey = undefined;

    if (changed) {
      updateSnapshot();
      notify();
    }
  };

  // Commits batch onto the next animation frame, but rAF is throttled
  // indefinitely for hidden/backgrounded documents — which would leave streamed
  // manifests uncommitted (stale "awaiting matter" canvas) while non-rAF state
  // like run status keeps updating. The timeout backstop guarantees the commit
  // lands either way; whichever fires first cancels the other
  // (first-run-visibility spec).
  const requestCommit = () => {
    if (rafId != null || backstopId != null) return;
    if (typeof requestAnimationFrame === "function") {
      rafId = requestAnimationFrame(commit);
      backstopId = setTimeout(commit, 50);
    } else {
      backstopId = setTimeout(commit, 0);
    }
  };

  const getOrInitPendingManifest = (): VizManifestV2 | null => {
    if (pendingStreamManifest !== undefined) return pendingStreamManifest;
    pendingStreamManifest = streamManifest;
    return pendingStreamManifest;
  };

  const ingest = (event: VizEvent) => {
    const base = getOrInitPendingManifest();
    pendingStreamManifest = ingestVizEvent(base ?? null, event);

    // Default selection behavior during streaming:
    // - first step.start selects its step
    // - first layer in the currently-selected step selects that layer
    if (event.type === "run.progress" && event.kind === "step.start") {
      const current = pendingSelectedStepId !== undefined ? pendingSelectedStepId : selectedStepId;
      if (!current) pendingSelectedStepId = event.stepId;
    }

    if (event.type === "viz.layer.upsert") {
      const currentStep =
        pendingSelectedStepId !== undefined ? pendingSelectedStepId : selectedStepId;
      const desiredStep = currentStep ?? event.layer.stepId;
      if (!currentStep) pendingSelectedStepId = desiredStep;

      const currentLayer =
        pendingSelectedLayerKey !== undefined ? pendingSelectedLayerKey : selectedLayerKey;
      if (!currentLayer && event.layer.stepId === desiredStep) {
        pendingSelectedLayerKey = event.layer.layerKey;
      }
    }

    requestCommit();
  };

  return {
    subscribe(onStoreChange) {
      listeners.add(onStoreChange);
      return () => listeners.delete(onStoreChange);
    },
    getSnapshot() {
      return snapshot;
    },
    ingest,
    clearStream() {
      if (!streamManifest && pendingStreamManifest === undefined) return;
      streamManifest = null;
      pendingStreamManifest = undefined;
      updateSnapshot();
      notify();
    },
    setSelectedStepId(next) {
      if (selectedStepId === next) return;
      selectedStepId = next;
      // selection is user-driven: apply immediately (no RAF gating)
      updateSnapshot();
      notify();
    },
    setSelectedLayerKey(next) {
      if (selectedLayerKey === next) return;
      selectedLayerKey = next;
      updateSnapshot();
      notify();
    },
    setShowDebugLayers(next) {
      if (showDebugLayers === next) return;
      showDebugLayers = next;
      updateSnapshot();
      notify();
    },
  };
}

let singleton: VizStore | null = null;
export function getVizStore(): VizStore {
  if (!singleton) singleton = createVizStore();
  return singleton;
}

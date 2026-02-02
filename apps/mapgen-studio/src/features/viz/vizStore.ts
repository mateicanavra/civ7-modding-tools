import { ingestVizEvent } from "./ingest";
import type { VizEvent } from "../../shared/vizEvents";
import type { VizManifestV1 } from "./model";

export type VizStoreSnapshot = Readonly<{
  streamManifest: VizManifestV1 | null;
  dumpManifest: VizManifestV1 | null;
  selectedStepId: string | null;
  selectedLayerKey: string | null;
  showDebugLayers: boolean;
}>;

export type VizStore = {
  subscribe(onStoreChange: () => void): () => void;
  getSnapshot(): VizStoreSnapshot;

  ingest(event: VizEvent): void;
  clearStream(): void;
  setDumpManifest(next: VizManifestV1 | null): void;

  setSelectedStepId(next: string | null): void;
  setSelectedLayerKey(next: string | null): void;
  setShowDebugLayers(next: boolean): void;
};

function scheduleFrame(cb: () => void): number {
  if (typeof requestAnimationFrame === "function") return requestAnimationFrame(cb);
  return setTimeout(cb, 0) as unknown as number;
}

export function createVizStore(): VizStore {
  const listeners = new Set<() => void>();

  let streamManifest: VizManifestV1 | null = null;
  let dumpManifest: VizManifestV1 | null = null;
  let selectedStepId: string | null = null;
  let selectedLayerKey: string | null = null;
  let showDebugLayers = false;

  // `useSyncExternalStore` requires `getSnapshot()` to return a stable reference
  // when nothing changed; returning a fresh object on every call can cause
  // infinite render loops.
  let snapshot: VizStoreSnapshot = Object.freeze({
    streamManifest,
    dumpManifest,
    selectedStepId,
    selectedLayerKey,
    showDebugLayers,
  });

  let pendingStreamManifest: VizManifestV1 | null | undefined = undefined;
  let pendingSelectedStepId: string | null | undefined = undefined;
  let pendingSelectedLayerKey: string | null | undefined = undefined;
  let rafId: number | null = null;

  const notify = () => {
    for (const l of listeners) l();
  };

  const updateSnapshot = () => {
    snapshot = Object.freeze({
      streamManifest,
      dumpManifest,
      selectedStepId,
      selectedLayerKey,
      showDebugLayers,
    });
  };

  const commit = () => {
    rafId = null;
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

  const requestCommit = () => {
    if (rafId != null) return;
    rafId = scheduleFrame(commit);
  };

  const getOrInitPendingManifest = (): VizManifestV1 | null => {
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
      const currentStep = pendingSelectedStepId !== undefined ? pendingSelectedStepId : selectedStepId;
      const desiredStep = currentStep ?? event.layer.stepId;
      if (!currentStep) pendingSelectedStepId = desiredStep;

      const currentLayer = pendingSelectedLayerKey !== undefined ? pendingSelectedLayerKey : selectedLayerKey;
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
    setDumpManifest(next) {
      if (dumpManifest === next) return;
      dumpManifest = next;
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

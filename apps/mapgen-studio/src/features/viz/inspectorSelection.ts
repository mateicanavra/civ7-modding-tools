import type { RiverLakeInspectorLayerRef } from "./riverLakeInspector";

/**
 * Ports the water evidence navigator needs to move the explore selection. Kept as
 * a plain object so the helper stays pure and pinnable without React or store
 * imports (StudioShell supplies viewStore setters + `useVizState` setters).
 */
export interface RiverLakeInspectorSelectionPorts {
  stages: ReadonlyArray<{ stageId: string }> | undefined;
  setSelectedStageId: (id: string) => void;
  setSelectedStepId: (id: string) => void;
  setShowDebugLayers: (show: boolean) => void;
  setVizSelectedStepId: (id: string) => void;
  setVizSelectedLayerKey: (key: string) => void;
}

/**
 * Evidence navigator: jumps the explore selection to a water evidence layer.
 *
 * The inspector row's layer chips are claims about pipeline evidence; clicking
 * one must land the user ON that evidence. That means (1) re-pointing the
 * stage/step lists at the exact stage identity carried by the layer,
 * (2) forcing debug layers visible when the evidence is debug-class —
 * otherwise the jump would select a layer the data list is filtering out — and
 * (3) selecting the viz step + concrete layer key so the canvas renders it.
 * When no stage contains the step (e.g. a stale manifest from another recipe),
 * the stage/step lists are left alone but the viz layer is still selected.
 */
export function applyRiverLakeInspectorSelection(
  ref: RiverLakeInspectorLayerRef,
  ports: RiverLakeInspectorSelectionPorts
): void {
  const stage = ports.stages?.find((candidate) => candidate.stageId === ref.stageId);
  if (stage) {
    ports.setSelectedStageId(stage.stageId);
    ports.setSelectedStepId(ref.stepId);
  }
  if (ref.visibility === "debug") ports.setShowDebugLayers(true);
  ports.setVizSelectedStepId(ref.stepId);
  ports.setVizSelectedLayerKey(ref.layerKey);
}

export type PinnedSelection = {
  pinnedStepId: string | null;
  pinnedLayerKey: string | null;
  retainStep: boolean;
  retainLayer: boolean;
};

function shouldRetainLayer(pinnedStepId: string | null, pinnedLayerKey: string | null): boolean {
  return Boolean(pinnedStepId && pinnedLayerKey && pinnedLayerKey.startsWith(`${pinnedStepId}::`));
}

/** Snapshots whether the current step and its namespaced layer survive the next run reset. */
export function capturePinnedSelection(args: {
  selectedStepId: string | null;
  selectedLayerKey: string | null;
}): PinnedSelection {
  const pinnedStepId = args.selectedStepId;
  const pinnedLayerKey = args.selectedLayerKey;
  const retainStep = Boolean(pinnedStepId);
  const retainLayer = shouldRetainLayer(pinnedStepId, pinnedLayerKey);
  return { pinnedStepId, pinnedLayerKey, retainStep, retainLayer };
}

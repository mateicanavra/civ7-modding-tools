export type PinnedSelection = {
  pinnedStepId: string | null;
  pinnedLayerKey: string | null;
  retainStep: boolean;
  retainLayer: boolean;
};

export function shouldRetainLayer(
  pinnedStepId: string | null,
  pinnedLayerKey: string | null
): boolean {
  return Boolean(pinnedStepId && pinnedLayerKey && pinnedLayerKey.startsWith(`${pinnedStepId}::`));
}

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

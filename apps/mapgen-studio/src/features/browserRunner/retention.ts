export type PinnedSelection = {
  pinnedStepId: string | null;
  pinnedLayerKey: string | null;
  retainStep: boolean;
  retainLayer: boolean;
};

export function shouldRetainLayer(pinnedStepId: string | null, pinnedLayerKey: string | null): boolean {
  return Boolean(pinnedStepId && pinnedLayerKey && pinnedLayerKey.startsWith(`${pinnedStepId}::`));
}

export function capturePinnedSelection(args: {
  mode: "browser" | "dump";
  selectedStepId: string | null;
  selectedLayerKey: string | null;
}): PinnedSelection {
  const pinnedStepId = args.mode === "browser" ? args.selectedStepId : null;
  const pinnedLayerKey = args.mode === "browser" ? args.selectedLayerKey : null;
  const retainStep = Boolean(pinnedStepId);
  const retainLayer = shouldRetainLayer(pinnedStepId, pinnedLayerKey);
  return { pinnedStepId, pinnedLayerKey, retainStep, retainLayer };
}

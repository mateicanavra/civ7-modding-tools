import { describe, expect, it, vi } from "vitest";

import {
  applyRiverLakeInspectorSelection,
  type RiverLakeInspectorSelectionPorts,
} from "../../src/features/viz/inspectorSelection";
import type { RiverLakeInspectorLayerRef } from "../../src/features/viz/riverLakeInspector";

function makeRef(overrides: Partial<RiverLakeInspectorLayerRef> = {}): RiverLakeInspectorLayerRef {
  return {
    dataTypeKey: "map.rivers.projectedRiverMask",
    layerKey: "step-a::map.rivers.projectedRiverMask::tile.hexOddQ::grid",
    stepId: "stage-1.step-a",
    stepIndex: 1,
    spaceId: "tile.hexOddQ",
    kind: "grid",
    role: "projection",
    variantKey: null,
    visibility: "default",
    label: "Projected river mask",
    renderModeId: "grid:projection",
    nonZeroCount: 12,
    sampleCount: 100,
    presentation: {
      category: "navigable-projection",
      categoryLabel: "Projection plan",
      palette: {
        paletteId: "river-projection-teal",
        label: "Projection plan",
        activeColor: "#0f766e",
        inactiveColor: "#ccfbf1",
        debugColor: "#134e4a",
      },
    },
    ...overrides,
  };
}

function makePorts(
  stages: RiverLakeInspectorSelectionPorts["stages"]
): RiverLakeInspectorSelectionPorts & {
  setSelectedStageId: ReturnType<typeof vi.fn>;
  setSelectedStepId: ReturnType<typeof vi.fn>;
  setShowDebugLayers: ReturnType<typeof vi.fn>;
  setVizSelectedStepId: ReturnType<typeof vi.fn>;
  setVizSelectedLayerKey: ReturnType<typeof vi.fn>;
} {
  return {
    stages,
    setSelectedStageId: vi.fn(),
    setSelectedStepId: vi.fn(),
    setShowDebugLayers: vi.fn(),
    setVizSelectedStepId: vi.fn(),
    setVizSelectedLayerKey: vi.fn(),
  };
}

const STAGES = [
  { stageId: "stage-0", steps: [{ fullStepId: "stage-0.other" }] },
  {
    stageId: "stage-1",
    steps: [{ fullStepId: "stage-1.step-a" }, { fullStepId: "stage-1.step-b" }],
  },
];

describe("applyRiverLakeInspectorSelection", () => {
  it("sets the stage, step, viz step, and viz layer for the evidence layer", () => {
    const ports = makePorts(STAGES);
    const ref = makeRef();

    applyRiverLakeInspectorSelection(ref, ports);

    expect(ports.setSelectedStageId).toHaveBeenCalledWith("stage-1");
    expect(ports.setSelectedStepId).toHaveBeenCalledWith("stage-1.step-a");
    expect(ports.setVizSelectedStepId).toHaveBeenCalledWith("stage-1.step-a");
    expect(ports.setVizSelectedLayerKey).toHaveBeenCalledWith(ref.layerKey);
    expect(ports.setShowDebugLayers).not.toHaveBeenCalled();
  });

  it("forces debug layers visible ONLY for debug-class evidence", () => {
    const debugPorts = makePorts(STAGES);
    applyRiverLakeInspectorSelection(makeRef({ visibility: "debug" }), debugPorts);
    expect(debugPorts.setShowDebugLayers).toHaveBeenCalledWith(true);

    const hiddenPorts = makePorts(STAGES);
    applyRiverLakeInspectorSelection(makeRef({ visibility: "hidden" }), hiddenPorts);
    expect(hiddenPorts.setShowDebugLayers).not.toHaveBeenCalled();
  });

  it("skips stage/step selection when no stage contains the step but still selects the viz layer", () => {
    const ports = makePorts(STAGES);
    const ref = makeRef({ stepId: "stale-recipe.unknown-step" });

    applyRiverLakeInspectorSelection(ref, ports);

    expect(ports.setSelectedStageId).not.toHaveBeenCalled();
    expect(ports.setSelectedStepId).not.toHaveBeenCalled();
    expect(ports.setVizSelectedStepId).toHaveBeenCalledWith("stale-recipe.unknown-step");
    expect(ports.setVizSelectedLayerKey).toHaveBeenCalledWith(ref.layerKey);

    const noStagesPorts = makePorts(undefined);
    applyRiverLakeInspectorSelection(makeRef(), noStagesPorts);
    expect(noStagesPorts.setSelectedStageId).not.toHaveBeenCalled();
    expect(noStagesPorts.setVizSelectedLayerKey).toHaveBeenCalledWith(makeRef().layerKey);
  });
});

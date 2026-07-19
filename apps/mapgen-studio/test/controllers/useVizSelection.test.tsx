// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { Type } from "typebox";
import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";
import { type UseVizSelectionArgs, useVizSelection } from "../../src/app/hooks/useVizSelection";
import { getRecipeDefaultCanonicalConfig } from "../../src/features/configAuthoring/canonicalConfig";
import { type LayerVariant, type StepDataTypeModel } from "../../src/features/viz/dataTypeModel";
import type { VizLayerEntryV2 } from "../../src/features/viz/model";
import type { UseVizStateResult } from "../../src/features/viz/useVizState";
import type { RecipeArtifacts } from "../../src/recipes/catalog";
import { useViewStore } from "../../src/stores/viewStore";
import "./_setup";

// `useVizState` is mocked to a controllable handle so the cascade can be driven
// from a fixed `dataTypeModel`/`selectedLayerKey` and its viz writes observed.
// `getOverlaySuggestions` is mocked so the overlay group (EO-3/EO-4) has a
// deterministic, recipe-independent suggestion catalog.
type VizMockMethod =
  | "ingest"
  | "clearStream"
  | "setSelectedStepId"
  | "setSelectedLayerKey"
  | "setShowDebugLayers";

type VizTestHandle = Omit<UseVizStateResult, VizMockMethod> & {
  ingest: Mock<UseVizStateResult["ingest"]>;
  clearStream: Mock<UseVizStateResult["clearStream"]>;
  setSelectedStepId: Mock<UseVizStateResult["setSelectedStepId"]>;
  setSelectedLayerKey: Mock<UseVizStateResult["setSelectedLayerKey"]>;
  setShowDebugLayers: Mock<UseVizStateResult["setShowDebugLayers"]>;
};

type OverlaySuggestion = {
  id: string;
  label: string;
  primaryDataTypeKey: string;
  overlayDataTypeKey: string;
};

const vizMock = vi.hoisted<{ handle: VizTestHandle | null }>(() => ({ handle: null }));
const overlayMock = vi.hoisted<{ suggestions: OverlaySuggestion[] }>(() => ({ suggestions: [] }));

vi.mock("../../src/features/viz/useVizState", () => ({
  useVizState: vi.fn(() => {
    if (vizMock.handle === null) throw new Error("Viz test handle is not initialized");
    return vizMock.handle;
  }),
}));
vi.mock("../../src/recipes/overlaySuggestions", () => ({
  getOverlaySuggestions: vi.fn(() => overlayMock.suggestions),
}));

// ---- model fixture builders ----------------------------------------------
function variant(
  dataTypeKey: string,
  spaceId: "tile.hexOddR" | "world.xy",
  variantId: string,
  layerKey: string,
  variantKey: string | null
): LayerVariant {
  const layer: VizLayerEntryV2 = {
    kind: "grid",
    layerKey,
    dataTypeKey,
    ...(variantKey === null ? {} : { variantKey }),
    stepId: "stageA.a1",
    stageId: "stageA",
    stepIndex: 0,
    spaceId,
    bounds: [0, 0, 1, 1],
    dims: { width: 1, height: 1 },
    field: { format: "u8", data: { kind: "path", path: `${layerKey}.bin` } },
  };
  return {
    variantId,
    label: variantId,
    layerKey,
    layer,
  };
}
function makeModel(): StepDataTypeModel {
  return {
    stepId: "stageA.a1",
    dataTypes: [
      {
        dataTypeId: "terrain",
        label: "Terrain",
        visibility: "default",
        spaces: [
          {
            spaceId: "tile.hexOddR",
            label: "Tile",
            renderModes: [
              {
                renderModeId: "grid",
                label: "Grid",
                variants: [
                  variant("terrain", "tile.hexOddR", "v3", "terrain.grid.e3", "era:3"),
                  variant("terrain", "tile.hexOddR", "v1", "terrain.grid.e1", "era:1"),
                  variant("terrain", "tile.hexOddR", "vp", "terrain.grid.plain", null),
                ],
              },
            ],
          },
        ],
      },
      {
        dataTypeId: "rivers",
        label: "Rivers",
        visibility: "default",
        // Distinct spaceId from `terrain` so EO-4 exercises the space FALLBACK
        // (`selection.spaceId` is absent from the overlay data-type's spaces).
        spaces: [
          {
            spaceId: "world.xy",
            label: "World",
            renderModes: [
              {
                renderModeId: "grid",
                label: "Grid",
                variants: [
                  variant("rivers", "world.xy", "rv1", "rivers.grid.e1", "era:1"),
                  variant("rivers", "world.xy", "rv2", "rivers.grid.e2", "era:2"),
                ],
              },
            ],
          },
        ],
      },
    ],
  };
}

const recipeArtifacts: RecipeArtifacts = {
  id: "test-recipe",
  label: "Test Recipe",
  configSchema: Type.Object({}),
  defaultCanonicalConfig: getRecipeDefaultCanonicalConfig("standard"),
  catalogConfigs: [],
  uiMeta: {
    namespace: "test",
    recipeId: "test-recipe",
    stages: [
      {
        stageId: "stageA",
        stageLabel: "Stage A",
        steps: [
          {
            stepId: "a1",
            fullStepId: "stageA.a1",
            stepLabel: "A1",
            configFocusPathWithinStage: [],
          },
          {
            stepId: "a2",
            fullStepId: "stageA.a2",
            stepLabel: "A2",
            configFocusPathWithinStage: [],
          },
        ],
      },
      {
        stageId: "stageB",
        stageLabel: "Stage B",
        steps: [
          {
            stepId: "b1",
            fullStepId: "stageB.b1",
            stepLabel: "B1",
            configFocusPathWithinStage: [],
          },
        ],
      },
    ],
  },
  admitCanonicalConfig: (config) => config,
};

function makeVizHandle(): VizTestHandle {
  const handle = {
    ingest: vi.fn<UseVizStateResult["ingest"]>(),
    clearStream: vi.fn<UseVizStateResult["clearStream"]>(),
    selectedStepId: "stageA.a1",
    setSelectedStepId: vi.fn<UseVizStateResult["setSelectedStepId"]>(),
    selectedLayerKey: null,
    setSelectedLayerKey: vi.fn<UseVizStateResult["setSelectedLayerKey"]>(),
    showDebugLayers: false,
    setShowDebugLayers: vi.fn<UseVizStateResult["setShowDebugLayers"]>(),
    steps: [],
    dataTypeModel: makeModel(),
    selectableLayers: [],
    legend: null,
    deck: { layers: [] },
    effectiveLayer: null,
    activeBounds: null,
    manifest: null,
  } satisfies VizTestHandle;
  return handle;
}

beforeEach(() => {
  // Baseline view state: explore is on `stageA`/`stageA.a1`, era auto, no overlay.
  useViewStore.setState({
    selectedStageId: "stageA",
    selectedStepId: "stageA.a1",
    eraMode: "auto",
    manualEra: 1,
    overlaySelectionId: "",
    overlayVariantKeyPreference: null,
    overlayOpacity: 0.45,
    showEdges: true,
  });
  vizMock.handle = makeVizHandle();
  overlayMock.suggestions = [];
});

function render(overrides: Partial<UseVizSelectionArgs> = {}) {
  const setLocalError = vi.fn();
  let props: UseVizSelectionArgs = {
    recipe: "test-recipe",
    recipeArtifacts,
    browserRunning: false,
    setLocalError,
    ...overrides,
  };
  const view = renderHook((p: UseVizSelectionArgs) => useVizSelection(p), { initialProps: props });
  const rerender = (patch: Partial<UseVizSelectionArgs> = {}) => {
    props = { ...props, ...patch };
    act(() => view.rerender(props));
  };
  return { view, rerender, setLocalError };
}

const viz = (): VizTestHandle => {
  if (vizMock.handle === null) throw new Error("Viz test handle is not initialized");
  return vizMock.handle;
};
const store = () => useViewStore.getState();

describe("useVizSelection — Stage/Step cascade (SS)", () => {
  it("SS-5: stages are 1-indexed StageOptions with their authored labels", () => {
    const { view } = render();
    const stages = view.result.current.stages;
    expect(stages.map((s) => s.index)).toEqual([1, 2]);
    expect(stages[0]!.label).toBe("Stage A"); // explicit stageLabel
    expect(stages[1]!.label).toBe("Stage B");
    expect(stages[1]!.value).toBe("stageB");
  });

  it("SS-6: steps are derived ONLY from the selected stage", () => {
    const { view, rerender } = render();
    expect(view.result.current.steps.map((s) => s.value)).toEqual(["stageA.a1", "stageA.a2"]);

    act(() => useViewStore.setState({ selectedStageId: "stageB" }));
    rerender();
    expect(view.result.current.steps.map((s) => s.value)).toEqual(["stageB.b1"]);

    act(() => useViewStore.setState({ selectedStageId: "" }));
    rerender();
    expect(view.result.current.steps).toEqual([]);
  });

  it("SS-1: handleStageChange resets step to the new stage's first; viz syncs ONCE", () => {
    const { view } = render();
    viz().setSelectedStepId.mockClear();

    act(() => view.result.current.handleStageChange("stageB"));

    expect(store().selectedStageId).toBe("stageB");
    expect(store().selectedStepId).toBe("stageB.b1");
    // The viz-sync arm is the SOLE caller of viz.setSelectedStepId — exactly once,
    // never doubled by handleStageChange itself.
    expect(viz().setSelectedStepId).toHaveBeenCalledTimes(1);
    expect(viz().setSelectedStepId).toHaveBeenCalledWith("stageB.b1");
  });

  it("SS-2: viz-sync clears the layer on a real step change, and is guarded when equal", () => {
    const { rerender } = render();
    const handle = viz();
    handle.setSelectedLayerKey.mockClear();

    // (a) real step change → one layer clear
    act(() => useViewStore.setState({ selectedStepId: "stageA.a2" }));
    rerender();
    expect(handle.setSelectedLayerKey).toHaveBeenCalledTimes(1);
    expect(handle.setSelectedLayerKey).toHaveBeenCalledWith(null);

    // (b) the effect RE-RUNS (store step changes a2→a1) but viz is ALREADY at the
    // new step → the dedupe guard must skip the clear (no layer clobber). This is
    // the path the guard actually protects: a viz-led step move (e.g. the inspector)
    // that the store then catches up to.
    handle.selectedStepId = "stageA.a1";
    handle.setSelectedLayerKey.mockClear();
    act(() => useViewStore.setState({ selectedStepId: "stageA.a1" }));
    rerender();
    expect(handle.setSelectedLayerKey).not.toHaveBeenCalled();
  });

  it("SS-4: viz-sync fires only on selectedStepId, not on unrelated viz rerenders", () => {
    const { rerender } = render();
    const handle = viz();
    handle.setSelectedStepId.mockClear();

    // A viz-internal change (new model) with selectedStepId unchanged must NOT
    // re-run the sync arm (deps are [selectedStepId] only).
    handle.dataTypeModel = makeModel();
    rerender({ browserRunning: true });
    expect(handle.setSelectedStepId).not.toHaveBeenCalled();
  });

  it("SS-3: step-clamp RETAINS a step that is still valid in the (new) stage", () => {
    // The clamp runs when `steps` changes (here, the mount transition []→[a1,a2]);
    // a valid current step must be kept — the `some()` guard must not clobber it.
    useViewStore.setState({ selectedStageId: "stageA", selectedStepId: "stageA.a2" });
    render();
    expect(store().selectedStepId).toBe("stageA.a2");
  });

  it("SS-3: step-clamp RESETS a foreign step to steps[0]", () => {
    useViewStore.setState({ selectedStageId: "stageA", selectedStepId: "not-a-real-step" });
    render();
    expect(store().selectedStepId).toBe("stageA.a1");
  });
});

describe("useVizSelection — Layer selection (LS)", () => {
  it("LS-4: handleDataTypeChange applies era in fixed mode and bypasses it in auto", () => {
    // auto → first variant of the target render mode (era ignored)
    const auto = render();
    viz().setSelectedLayerKey.mockClear();
    act(() => auto.view.result.current.handleDataTypeChange("rivers"));
    expect(viz().setSelectedLayerKey).toHaveBeenCalledWith("rivers.grid.e1");

    // fixed, manualEra=2 → era-snapped variant (era:2)
    useViewStore.setState({ eraMode: "fixed", manualEra: 2 });
    const fixed = render();
    viz().setSelectedLayerKey.mockClear();
    act(() => fixed.view.result.current.handleDataTypeChange("rivers"));
    expect(viz().setSelectedLayerKey).toHaveBeenCalledWith("rivers.grid.e2");
  });

  it("LS-5: handleVariantChange seeds manualEra for era variants; flips fixed→auto only for non-era", () => {
    useViewStore.setState({ eraMode: "fixed", manualEra: 1 });
    const { view } = render();

    // era variant: set manualEra, KEEP fixed mode
    act(() => view.result.current.handleVariantChange("v3"));
    expect(store().manualEra).toBe(3);
    expect(store().eraMode).toBe("fixed");
    expect(viz().setSelectedLayerKey).toHaveBeenCalledWith("terrain.grid.e3");

    // non-era variant in fixed mode: flip to auto
    act(() => view.result.current.handleVariantChange("vp"));
    expect(store().eraMode).toBe("auto");
  });
});

describe("useVizSelection — Era / Overlay group (EO)", () => {
  it("EO-5: handleEraModeChange('fixed') seeds manualEra from autoEra", () => {
    // default selection variant is v3 (era:3) → autoEra=3
    const { view } = render();
    expect(store().manualEra).toBe(1);

    act(() => view.result.current.handleEraModeChange("fixed"));
    expect(store().eraMode).toBe("fixed");
    expect(store().manualEra).toBe(3);
  });

  it("EO-6: handleEraValueChange clamps to range and activates fixed mode", () => {
    const { view } = render();
    // range is {min:1, max:3}; 7 clamps to 3
    act(() => view.result.current.handleEraValueChange(7));
    expect(store().manualEra).toBe(3);
    expect(store().eraMode).toBe("fixed");
  });

  it("EO-3: overlay-prune clears a stale overlaySelectionId when no candidates exist", () => {
    overlayMock.suggestions = []; // no candidates
    useViewStore.setState({ overlaySelectionId: "stale" });
    render();
    expect(store().overlaySelectionId).toBe("");
  });

  it("EO-4: overlay-variant-pref era-snaps via the space fallback in fixed mode", () => {
    overlayMock.suggestions = [
      { id: "ov", label: "Ov", primaryDataTypeKey: "terrain", overlayDataTypeKey: "rivers" },
    ];
    useViewStore.setState({ overlaySelectionId: "ov", eraMode: "fixed", manualEra: 2 });
    render();
    // selection.spaceId ("tile.hexOddR") is absent from `rivers` → fallback to its
    // first space ("world.xy"); manualEra=2 snaps to the era:2 variant key.
    expect(store().overlayVariantKeyPreference).toBe("era:2");
  });
});

describe("useVizSelection — navigateTo single-owner facade (NAV, slice 2.7 commit B)", () => {
  it("NAV-1: navigateTo(stage) selects the stage; default step lands on steps[0]", () => {
    // The STAGE selection is the load-bearing assertion here (a stage-skip mutation
    // kills it). The default-step landing on steps[0] is co-guaranteed by the
    // step-clamp effect (see SS-3 reset), so the navigateTo-unique step behavior is
    // pinned by NAV-2 (the explicit-step path) instead.
    const { view } = render();
    act(() => view.result.current.navigateTo("stageB"));
    expect(store().selectedStageId).toBe("stageB");
    expect(store().selectedStepId).toBe("stageB.b1");
  });

  it("NAV-2: navigateTo(stage, step) selects the stage and the explicit step", () => {
    const { view } = render();
    act(() => view.result.current.navigateTo("stageA", "stageA.a2"));
    expect(store().selectedStageId).toBe("stageA");
    expect(store().selectedStepId).toBe("stageA.a2");
  });

  it("NAV-3: handleStepChange is a direct within-stage step write (NOT routed through navigateTo)", () => {
    // A within-stage step change needs no stage coordination, so it must NOT route
    // through navigateTo — that would add a redundant same-value setSelectedStageId
    // store notification. Stage stays put; only the step changes.
    const { view } = render(); // baseline stage is stageA
    act(() => view.result.current.handleStepChange("stageA.a2"));
    expect(store().selectedStageId).toBe("stageA");
    expect(store().selectedStepId).toBe("stageA.a2");
  });

  it("NAV-4: handleStageChange on an UNKNOWN stage selects it but does NOT reset the step", () => {
    const { view } = render(); // baseline step is stageA.a1
    act(() => view.result.current.handleStageChange("nonexistent"));
    expect(store().selectedStageId).toBe("nonexistent");
    expect(store().selectedStepId).toBe("stageA.a1"); // guard preserved — step untouched
  });
});

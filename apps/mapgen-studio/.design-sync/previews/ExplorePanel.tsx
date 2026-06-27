import { ExplorePanel, TooltipProvider } from "mapgen-studio";

// ExplorePanel is the Explore dock: stage/step navigation + the layer
// inspector (data type · space · render mode · variant · overlay) + era and
// water-proof sections. Framed in a bounded dark container; cardMode:column
// gives it full card width. The water-proof summary is null here (no active run).
const noop = () => {};

const props = {
  stages: [
    { value: "foundation", label: "Foundation", index: 0 },
    { value: "morphology", label: "Morphology", index: 1 },
    { value: "climate", label: "Climate", index: 2 },
    { value: "hydrology", label: "Hydrology", index: 3 },
  ],
  selectedStage: "morphology",
  onSelectedStageChange: noop,
  steps: [
    { value: "plates", label: "Plates", category: "tectonics" },
    { value: "uplift", label: "Uplift", category: "tectonics" },
    { value: "coastlines", label: "Coastlines", category: "shaping" },
  ],
  selectedStep: "uplift",
  onSelectedStepChange: noop,
  dataTypeOptions: [
    { value: "elevation", label: "Elevation" },
    { value: "rainfall", label: "Rainfall" },
    { value: "plates", label: "Plate ID" },
  ],
  selectedDataType: "elevation",
  onSelectedDataTypeChange: noop,
  spaceOptions: [{ value: "grid", label: "Grid" }],
  selectedSpace: "grid",
  onSelectedSpaceChange: noop,
  renderModeOptions: [
    { value: "heightmap", label: "Heightmap" },
    { value: "hillshade", label: "Hillshade" },
  ],
  selectedRenderMode: "heightmap",
  onSelectedRenderModeChange: noop,
  variantOptions: [{ value: "default", label: "Default" }],
  selectedVariant: "default",
  onSelectedVariantChange: noop,
  overlayOptions: [
    { value: "none", label: "None" },
    { value: "rivers", label: "Rivers" },
  ],
  selectedOverlay: "none",
  onSelectedOverlayChange: noop,
  overlayOpacity: 0.6,
  onOverlayOpacityChange: noop,
  eraEnabled: false,
  eraMode: "auto",
  eraValue: 2,
  eraMin: 0,
  eraMax: 6,
  onEraModeChange: noop,
  onEraValueChange: noop,
  showEdges: false,
  onShowEdgesChange: noop,
  showDebugLayers: false,
  onShowDebugLayersChange: noop,
  onFitView: noop,
  riverLakeInspectorSummary: null,
};

function Dock({ children }) {
  return (
    <div className="bg-background" style={{ padding: 16, height: 600, display: "flex" }}>
      <TooltipProvider>{children}</TooltipProvider>
    </div>
  );
}

export const Inspector = () => (
  <Dock>
    <ExplorePanel {...props} />
  </Dock>
);

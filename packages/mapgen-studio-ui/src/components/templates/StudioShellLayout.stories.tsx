import type { Meta, StoryObj } from "@storybook/react-vite";
import type {
  AppHeaderSetupState,
  ExplorePanelProps,
  GameConsoleProps,
  MapSize,
  PipelineConfig,
  RecipePanelProps,
  SelectOption,
  StudioShellLayoutProps,
  WorldSettings,
} from "@swooper/mapgen-studio-ui";
import {
  AppFooter,
  AppHeader,
  ExplorePanel,
  GameConsole,
  RecipePanel,
  StageViewTabs,
  StudioShellLayout,
} from "@swooper/mapgen-studio-ui";
import type { ReactNode } from "react";

/**
 * StudioShellLayout is the whole studio chrome as one slot-based template —
 * the canonical assembly the app host composes (StudioShell.tsx). This story
 * fills every slot with the same fixtures the individual component stories
 * use (AppHeader `Default` + GameConsole `LiveReady`, RecipePanel
 * `RecipeAndConfig`, ExplorePanel `Inspector`, AppFooter `Ready`), so the
 * template render IS the composed app at design time. The map canvas is
 * app-side deck.gl runtime, so the `canvas` slot carries a placeholder.
 * Tooltips ride the global decorator's `TooltipProvider`.
 */
const meta = {
  title: "templates/StudioShellLayout",
  component: StudioShellLayout,
} satisfies Meta<typeof StudioShellLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

const noop = () => {};

// ── AppHeader fixtures (composites/AppHeader `Default`) ─────────────────────
const setup: AppHeaderSetupState = {
  savedConfig: { id: "continents-std", displayName: "Continents — Standard" },
  leaderId: "",
  civilizationId: "",
  difficultyId: "",
  gameSpeedId: "",
};
const setupOptions = {
  savedConfigOptions: [
    { value: "continents-std", label: "Continents — Standard" },
    { value: "archipelago", label: "Archipelago" },
    { value: "pangaea", label: "Pangaea" },
  ],
  leaderOptions: [],
  civilizationOptions: [],
  difficultyOptions: [],
  gameSpeedOptions: [],
};

// ── GameConsole fixtures (panels/GameConsole `LiveReady`) ────────────────────
const gameConsoleProps = {
  liveGameStudioRelation: "current",
  onSyncFromLiveGame: noop,
  onToggleAutoplay: noop,
  onExplore: noop,
  operationControlsDisabled: false,
  isRunInGameRunning: false,
  runInGameStatus: null,
  runInGameCurrentRelation: "current",
  onRunInGame: noop,
  onCopyRunInGameDiagnostics: noop,
  saveDeployStatus: null,
  liveRuntime: {
    status: "ok",
    turn: 42,
    seed: 1474829,
    readiness: "Civ7 ready",
    autoplayActive: false,
  },
} satisfies GameConsoleProps;

// ── RecipePanel fixtures (panels/RecipePanel `RecipeAndConfig`) ──────────────
const recipeOptions: SelectOption[] = [{ value: "standard", label: "Standard" }];
const configOptions: SelectOption[] = [
  { value: "studio-current", label: "Studio Current" },
  { value: "swooper-earthlike", label: "Swooper Earthlike" },
];
const configSchema = {
  type: "object",
  properties: {
    elevation: {
      type: "object",
      title: "Elevation",
      properties: {
        seaLevel: { type: "number", title: "Sea level", default: 0.6 },
        mountainDensity: { type: "number", title: "Mountain density", default: 0.3 },
      },
    },
    climate: {
      type: "object",
      title: "Climate",
      properties: {
        rainfall: {
          type: "string",
          title: "Rainfall",
          enum: ["arid", "temperate", "wet"],
          default: "temperate",
        },
      },
    },
  },
};
const config: PipelineConfig = {
  elevation: { seaLevel: 0.6, mountainDensity: 0.3 },
  climate: { rainfall: "temperate" },
};
const recipePanelProps = {
  config,
  configSchema,
  onConfigChange: noop,
  onConfigReset: noop,
  recipeOptions,
  configOptions,
  selectedStep: "",
  recipeId: "standard",
  onRecipeChange: noop,
  configId: "studio-current",
  onConfigSelect: noop,
  onSaveToCurrent: noop,
  onSaveAsNew: noop,
  onImportConfig: noop,
  onExportConfig: noop,
  isSaveDeployRunning: false,
  saveDeployStatus: null,
  isSaveDisabled: false,
  isDirty: false,
  recipeCollapsed: false,
  configCollapsed: false,
} satisfies RecipePanelProps;

// ── ExplorePanel fixtures (panels/ExplorePanel `Inspector`) ──────────────────
const explorePanelProps = {
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
  eraMode: "auto" as const,
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
} satisfies ExplorePanelProps;

// ── AppFooter fixtures (composites/AppFooter `Ready`) ────────────────────────
const world: WorldSettings = {
  mapSize: "MAPSIZE_STANDARD",
  playerCount: 6,
  resources: "balanced",
};
const footerSeed = "1474829";
const mapSizeOptions: ReadonlyArray<SelectOption<MapSize>> = [
  { value: "MAPSIZE_TINY", label: "Tiny" },
  { value: "MAPSIZE_SMALL", label: "Small" },
  { value: "MAPSIZE_STANDARD", label: "Standard" },
  { value: "MAPSIZE_LARGE", label: "Large" },
  { value: "MAPSIZE_HUGE", label: "Huge" },
];
const mapSizeShortLabels: Record<string, string> = {
  MAPSIZE_TINY: "Tiny",
  MAPSIZE_SMALL: "Small",
  MAPSIZE_STANDARD: "Standard",
  MAPSIZE_LARGE: "Large",
  MAPSIZE_HUGE: "Huge",
};

// The map canvas is app-side deck.gl runtime, not a DS export — the stage
// slot carries a token-tinted placeholder in its place.
function CanvasPlaceholder() {
  return (
    <div
      className="relative h-full w-full"
      style={{
        background:
          "radial-gradient(ellipse 90% 70% at 50% 42%, color-mix(in oklab, var(--primary) 7%, transparent), transparent 65%)," +
          "radial-gradient(ellipse 60% 45% at 38% 55%, color-mix(in oklab, var(--foreground) 4%, transparent), transparent 70%)," +
          "var(--background)",
      }}
    >
      <span className="absolute left-1/2 top-[58%] -translate-x-1/2 text-label uppercase tracking-widest text-muted-foreground opacity-55 text-center">
        Map canvas
        <br />
        app-side deck.gl stage
      </span>
    </div>
  );
}

// Preview-only fixed-size viewport so the h-full shell has a real box — not a
// DS export.
function Viewport({ children }: { children: ReactNode }) {
  return (
    <div style={{ width: 1280, height: 800, borderRadius: 8, overflow: "hidden" }}>{children}</div>
  );
}

export const FullShell: Story = {
  // CSF3 requires args once when the component has required-ish shape; this
  // story owns its full scene in render (slots are elements), so no per-story
  // args are needed.
  args: {} as unknown as StudioShellLayoutProps,
  render: () => (
    <Viewport>
      <StudioShellLayout
        canvas={<CanvasPlaceholder />}
        leftPanel={<RecipePanel {...recipePanelProps} />}
        rightPanel={<ExplorePanel {...explorePanelProps} />}
        stageTabs={(g) => <StageViewTabs value="map" onValueChange={noop} top={g.panelTop} />}
        header={
          <AppHeader
            themePreference="dark"
            onThemeCycle={noop}
            showGrid
            onShowGridChange={noop}
            setup={setup}
            setupOptions={setupOptions}
            savedConfigModified={false}
            onSavedConfigChange={noop}
            onLeaderChange={noop}
            onCivilizationChange={noop}
            onDifficultyChange={noop}
            onGameSpeedChange={noop}
            gameConsole={<GameConsole {...gameConsoleProps} />}
          />
        }
        footer={
          <AppFooter
            status="ready"
            lastRun={{ seed: footerSeed, worldSettings: world }}
            globalSettings={world}
            seed={footerSeed}
            onGlobalSettingsChange={noop}
            onSeedChange={noop}
            onRun={noop}
            onReroll={noop}
            isRunning={false}
            isRunInGameRunning={false}
            isDirty={false}
            autoRunEnabled={false}
            onAutoRunEnabledChange={noop}
            mapSizeOptions={mapSizeOptions}
            mapSizeShortLabels={mapSizeShortLabels}
            playerCountOptions={[2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]}
            seedMin={0}
            seedMax={2147483647}
          />
        }
      />
    </Viewport>
  ),
};

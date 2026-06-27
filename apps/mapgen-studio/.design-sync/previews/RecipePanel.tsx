import { RecipePanel, TooltipProvider } from "mapgen-studio";

// RecipePanel is the 340px Recipe dock: recipe/preset selection + a
// schema-driven config-override form. Framed in a bounded dark container
// (it caps at max-h-full); cardMode:column gives it full card width.
const noop = () => {};

const recipeOptions = [
  { value: "mod-swooper-maps/standard", label: "Standard" },
  { value: "mod-swooper-maps/continents", label: "Continents" },
  { value: "mod-swooper-maps/archipelago", label: "Archipelago" },
];
const presetOptions = [
  { value: "none", label: "None" },
  { value: "continents", label: "Continents" },
  { value: "archipelago", label: "Archipelago" },
];
const settings = { recipe: "mod-swooper-maps/standard", preset: "continents", seed: "1474829" };

// A small but real RJSF schema + matching config so the override form renders.
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
        rainfall: { type: "string", title: "Rainfall", enum: ["arid", "temperate", "wet"], default: "temperate" },
      },
    },
  },
};
const config = {
  elevation: { seaLevel: 0.6, mountainDensity: 0.3 },
  climate: { rainfall: "temperate" },
};

const base = {
  config,
  configSchema,
  onConfigChange: noop,
  onConfigReset: noop,
  recipeOptions,
  presetOptions,
  selectedStep: "",
  settings,
  onSettingsChange: noop,
  onSaveToCurrent: noop,
  onSaveAsNew: noop,
  onImportPreset: noop,
  onExportPreset: noop,
  onDeletePreset: noop,
  canDeletePreset: true,
  isSaveDeployRunning: false,
  saveDeployStatus: null,
  isSaveDisabled: false,
  isDirty: false,
};

function Dock({ children }) {
  return (
    <div className="bg-background" style={{ padding: 16, height: 540, display: "flex" }}>
      <TooltipProvider>{children}</TooltipProvider>
    </div>
  );
}

export const RecipeAndConfig = () => (
  <Dock>
    <RecipePanel {...base} recipeCollapsed={false} configCollapsed={false} />
  </Dock>
);

export const RecipeSelection = () => (
  <Dock>
    <RecipePanel {...base} recipeCollapsed={false} configCollapsed={true} />
  </Dock>
);

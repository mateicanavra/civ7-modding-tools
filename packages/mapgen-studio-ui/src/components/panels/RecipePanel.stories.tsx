import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  type PipelineConfig,
  RecipePanel,
  type RecipePanelProps,
  type SelectOption,
} from "@swooper/mapgen-studio-ui";
import type { ReactNode } from "react";

/**
 * Adapted from `.design-sync/previews/RecipePanel.tsx`. The 340px Recipe dock:
 * recipe/preset selection + a schema-driven config-override form. A small but
 * real RJSF schema + matching config drive the override form. Tooltips come from
 * the global decorator's `TooltipProvider`.
 */
const meta = {
  title: "panels/RecipePanel",
  component: RecipePanel,
} satisfies Meta<typeof RecipePanel>;

export default meta;
type Story = StoryObj<typeof meta>;

const noop = () => {};

const recipeOptions: SelectOption[] = [
  { value: "mod-swooper-maps/standard", label: "Standard" },
  { value: "mod-swooper-maps/continents", label: "Continents" },
  { value: "mod-swooper-maps/archipelago", label: "Archipelago" },
];
const presetOptions: SelectOption[] = [
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
} satisfies Omit<RecipePanelProps, "recipeCollapsed" | "configCollapsed">;

// Preview-only bounded dark dock so the floating panel reads on its real
// substrate — not a DS export.
function Dock({ children }: { children: ReactNode }) {
  return (
    <div className="bg-background" style={{ padding: 16, height: 540, display: "flex" }}>
      {children}
    </div>
  );
}

export const RecipeAndConfig: Story = {
  args: { ...base, recipeCollapsed: false, configCollapsed: false },
  render: (args) => (
    <Dock>
      <RecipePanel {...args} />
    </Dock>
  ),
};

export const RecipeSelection: Story = {
  args: { ...base, recipeCollapsed: false, configCollapsed: true },
  render: (args) => (
    <Dock>
      <RecipePanel {...args} />
    </Dock>
  ),
};

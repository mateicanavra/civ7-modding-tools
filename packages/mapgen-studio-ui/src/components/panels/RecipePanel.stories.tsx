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
 * recipe/config selection + a schema-driven config editor. A small but
 * real RJSF schema + matching config drive the editor. Tooltips come from
 * the global decorator's `TooltipProvider`.
 */
const meta = {
  title: "panels/RecipePanel",
  component: RecipePanel,
} satisfies Meta<typeof RecipePanel>;

export default meta;
type Story = StoryObj<typeof meta>;

const noop = () => {};

const recipeOptions: SelectOption[] = [{ value: "standard", label: "Standard" }];
const configOptions: SelectOption[] = [
  { value: "studio-current", label: "Studio Current" },
  { value: "swooper-earthlike", label: "Swooper Earthlike" },
];

// A small but real RJSF schema + matching config so the editor renders.
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

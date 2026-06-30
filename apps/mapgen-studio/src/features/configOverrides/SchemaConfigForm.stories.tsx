import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactNode } from "react";
import {
  SchemaConfigForm,
  type SchemaConfigFormProps,
} from "@/features/configOverrides/SchemaConfigForm";
import { alwaysExpandedCollapse, noop } from "@/storybook/mockWidgetProps";

/**
 * SchemaConfigForm is the config-authoring ENGINE: it takes a JSON-schema-ish
 * `schema` + matching `value`, derives an rjsf uiSchema (boolean→switch,
 * string-enum→select, enum-array→tagSelect, long-string→textarea, …) and renders
 * the BrowserConfig* templates + widgets through @rjsf/core. Adapted from
 * `.design-sync/previews/SchemaConfigForm.tsx`. The fixture is a representative
 * civ7 mapgen config block so every widget/template node is exercised — schema +
 * value are plain props (exactly how RecipePanel feeds it), no server or oRPC.
 */
// `args` is cast to the full props so Storybook's CSF3 type inference treats
// every (otherwise-required) prop as optional — letting these render-only
// stories omit an `args` block. The value is never read: each story drives the
// component entirely through its own `render` body.
const meta = {
  title: "forms/SchemaConfigForm",
  component: SchemaConfigForm,
  args: {} as unknown as SchemaConfigFormProps<unknown>,
} satisfies Meta<typeof SchemaConfigForm>;

export default meta;
type Story = StoryObj<typeof meta>;

// A representative published-config-style schema; each branch targets one
// widget/template path. `climate.biomes.uniqueItems` marks the tag-set so rjsf
// surfaces `items.enum` as enumOptions for the tagSelect widget.
const schema = {
  type: "object",
  properties: {
    climate: {
      type: "object",
      title: "Climate",
      properties: {
        model: {
          type: "string",
          title: "Model",
          enum: ["earthlike", "arid", "tropical", "frozen"],
        },
        rainfall: { type: "number", title: "Rainfall" },
        enableRivers: { type: "boolean", title: "Enable Rivers" },
        biomes: {
          type: "array",
          title: "Biomes",
          uniqueItems: true,
          items: {
            type: "string",
            enum: ["tundra", "grassland", "desert", "rainforest", "marsh"],
          },
        },
        notes: {
          type: "string",
          title: "Notes",
          maxLength: 200,
        },
      },
    },
    landmass: {
      type: "object",
      title: "Landmass",
      properties: {
        waterPercent: { type: "number", title: "Water Percent" },
        continents: { type: "number", title: "Continents" },
        islands: {
          type: "array",
          title: "Islands",
          items: {
            type: "object",
            properties: {
              name: { type: "string", title: "Name" },
              size: {
                type: "string",
                title: "Size",
                enum: ["small", "medium", "large"],
              },
            },
          },
        },
      },
    },
  },
};

const value = {
  climate: {
    model: "earthlike",
    rainfall: 0.6,
    enableRivers: true,
    biomes: ["grassland", "rainforest"],
    notes: "Temperate baseline with elevated coastal moisture.",
  },
  landmass: {
    waterPercent: 0.62,
    continents: 3,
    islands: [
      { name: "Aurelia", size: "medium" },
      { name: "Borealis", size: "small" },
    ],
  },
};

// Preview-only popover-surface column matching RecipePanel's config section, so
// the recessed slabs read on the right tier.
function Panel({ children }: { children: ReactNode }) {
  return (
    <div
      className="bg-popover text-foreground border border-border"
      style={{ width: 384, borderRadius: 8, overflow: "hidden" }}
    >
      <div className="px-3 py-3">{children}</div>
    </div>
  );
}

// The whole engine: a multi-group config form driven by schema + value.
export const ConfigForm: Story = {
  render: () => (
    <Panel>
      <SchemaConfigForm
        schema={schema}
        value={value}
        disabled={false}
        collapse={alwaysExpandedCollapse}
        onChange={noop}
      />
    </Panel>
  ),
};

// focusPath narrows the engine to a single stage (RecipePanel's per-step "focus
// mode") — here it isolates the Climate group.
export const FocusedStage: Story = {
  render: () => (
    <Panel>
      <SchemaConfigForm
        schema={schema}
        value={value}
        focusPath={["climate"]}
        disabled={false}
        collapse={alwaysExpandedCollapse}
        onChange={noop}
      />
    </Panel>
  ),
};

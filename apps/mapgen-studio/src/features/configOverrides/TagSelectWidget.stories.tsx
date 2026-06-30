import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactNode } from "react";
import { TagSelectWidget } from "@/features/configOverrides/rjsfWidgets";
import { widgetProps } from "@/storybook/mockWidgetProps";

/**
 * TagSelectWidget is the multi-select pill row — the RJSF registry's Checkboxes/
 * tagSelect target. Each enum option is a toggle pill. The novel reusable control of
 * this cluster (no raw DS primitive equivalent). Adapted from
 * `.design-sync/previews/TagSelectWidget.tsx`; the typed `widgetProps` factory feeds
 * the story `args` (CSF3 requires args for required-prop widgets), and `render`
 * spreads them into the real widget on its preview substrate.
 */
const meta = {
  title: "forms/TagSelectWidget",
  component: TagSelectWidget,
} satisfies Meta<typeof TagSelectWidget>;

export default meta;
type Story = StoryObj<typeof meta>;

// Preview-only dark backdrop so the control reads on its real substrate.
function Demo({ children }: { children: ReactNode }) {
  return (
    <div
      className="bg-background text-foreground"
      style={{ padding: 20, borderRadius: 6, display: "flex", flexDirection: "column", gap: 12 }}
    >
      {children}
    </div>
  );
}

// Enum option set hoisted to module scope (constant fixture).
const biomeOptions = [
  { value: "temperate", label: "Temperate" },
  { value: "arid", label: "Arid" },
  { value: "wet", label: "Wet" },
  { value: "tropical", label: "Tropical" },
  { value: "tundra", label: "Tundra" },
  { value: "alpine", label: "Alpine" },
];

export const Selection: Story = {
  args: widgetProps({
    id: "cfg_biomes",
    name: "biomes",
    value: ["temperate", "wet", "alpine"],
    options: { emptyValue: [], enumOptions: biomeOptions },
  }),
  render: (args) => (
    <Demo>
      <div style={{ width: 320 }}>
        <TagSelectWidget {...args} />
      </div>
    </Demo>
  ),
};

export const Disabled: Story = {
  args: widgetProps({
    id: "cfg_biomes",
    name: "biomes",
    value: ["arid", "tundra"],
    options: { emptyValue: [], enumOptions: biomeOptions },
    disabled: true,
  }),
  render: (args) => (
    <Demo>
      <div style={{ width: 320 }}>
        <TagSelectWidget {...args} />
      </div>
    </Demo>
  ),
};

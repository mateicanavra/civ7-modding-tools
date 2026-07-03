import type { Meta, StoryObj } from "@storybook/react-vite";
import { SelectWidget } from "@swooper/mapgen-studio-ui";
import type { ReactNode } from "react";
import { widgetProps } from "../../storybook/mockWidgetProps.js";

/**
 * SelectWidget maps an RJSF enum onto the DS `Select` — the schema's "no selection"
 * placeholder round-trips through a reserved sentinel. Shown at rest. Adapted from
 * `.design-sync/previews/SelectWidget.tsx`; the typed `widgetProps` factory feeds the
 * story `args` (CSF3 requires args for required-prop widgets), and `render` spreads
 * them into the real widget on its preview substrate.
 */
const meta = {
  title: "forms/SelectWidget",
  component: SelectWidget,
} satisfies Meta<typeof SelectWidget>;

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
const rainfallOptions = [
  { value: "arid", label: "Arid" },
  { value: "temperate", label: "Temperate" },
  { value: "wet", label: "Wet" },
];

export const Selected: Story = {
  args: widgetProps({
    id: "cfg_rainfall",
    name: "rainfall",
    value: "temperate",
    options: { emptyValue: "", enumOptions: rainfallOptions },
    placeholder: "Choose rainfall",
  }),
  render: (args) => (
    <Demo>
      <div style={{ width: 220 }}>
        <SelectWidget {...args} />
      </div>
    </Demo>
  ),
};

export const Disabled: Story = {
  args: widgetProps({
    id: "cfg_rainfall",
    name: "rainfall",
    value: "wet",
    options: { emptyValue: "", enumOptions: rainfallOptions },
    disabled: true,
  }),
  render: (args) => (
    <Demo>
      <div style={{ width: 220 }}>
        <SelectWidget {...args} />
      </div>
    </Demo>
  ),
};

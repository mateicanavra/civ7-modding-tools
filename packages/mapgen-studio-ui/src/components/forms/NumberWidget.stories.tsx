import type { Meta, StoryObj } from "@storybook/react-vite";
import { NumberWidget } from "@swooper/mapgen-studio-ui";
import type { ReactNode } from "react";
import { widgetProps } from "../../storybook/mockWidgetProps.js";

/**
 * NumberWidget is the RJSF numeric control (type=number, inputMode=decimal) on the
 * DS `Input` — empties normalize to `emptyValue`, NaN is rejected. Adapted from
 * `.design-sync/previews/NumberWidget.tsx`; the typed `widgetProps` factory feeds the
 * story `args` (CSF3 requires args for required-prop widgets), and `render` spreads
 * them into the real widget on its preview substrate.
 */
const meta = {
  title: "forms/NumberWidget",
  component: NumberWidget,
} satisfies Meta<typeof NumberWidget>;

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

export const Filled: Story = {
  args: widgetProps({
    id: "cfg_seaLevel",
    name: "seaLevel",
    value: 0.6,
    options: { emptyValue: undefined },
  }),
  render: (args) => (
    <Demo>
      <div style={{ width: 160 }}>
        <NumberWidget {...args} />
      </div>
    </Demo>
  ),
};

export const Disabled: Story = {
  args: widgetProps({
    id: "cfg_seaLevel",
    name: "seaLevel",
    value: 0.3,
    options: { emptyValue: undefined },
    disabled: true,
  }),
  render: (args) => (
    <Demo>
      <div style={{ width: 160 }}>
        <NumberWidget {...args} />
      </div>
    </Demo>
  ),
};

/**
 * Flat-and-flush delta 9: value ≠ schema default ⇒ the DS drifted treatment
 * (warning border/ring) plus the inside-overlaid one-field undo. The clean
 * sibling shows the reserved slot: both fields keep identical box widths.
 */
export const Modified: Story = {
  args: widgetProps({
    id: "cfg_seaLevel",
    name: "seaLevel",
    label: "seaLevel",
    value: 0.85,
    options: { emptyValue: undefined },
    schema: { type: "number", default: 0.6 },
  }),
  render: (args) => (
    <Demo>
      <div style={{ width: 160 }}>
        <NumberWidget {...args} />
      </div>
      <div style={{ width: 160 }}>
        <NumberWidget
          {...args}
          id="cfg_mountainDensity"
          name="mountainDensity"
          label="mountainDensity"
          value={0.3}
          schema={{ type: "number", default: 0.3 }}
        />
      </div>
    </Demo>
  ),
};

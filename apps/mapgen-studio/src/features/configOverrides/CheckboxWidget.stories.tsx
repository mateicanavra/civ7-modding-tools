import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactNode } from "react";
import { CheckboxWidget } from "@/features/configOverrides/rjsfWidgets";
import { widgetProps } from "@/storybook/mockWidgetProps";

/**
 * CheckboxWidget is the RJSF boolean control on the DS `Checkbox`. Adapted from
 * `.design-sync/previews/CheckboxWidget.tsx`; the typed `widgetProps` factory feeds
 * the story `args` (CSF3 requires args for required-prop widgets), and `render`
 * spreads them into the real widget on its preview substrate.
 */
const meta = {
  title: "forms/CheckboxWidget",
  component: CheckboxWidget,
} satisfies Meta<typeof CheckboxWidget>;

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

// Preview-only label row — the widget is just the box; the label is chrome.
function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      {children}
      <span className="text-data text-muted-foreground">{label}</span>
    </div>
  );
}

export const Checked: Story = {
  args: widgetProps({
    id: "cfg_wrapX",
    name: "flag",
    value: true,
    options: { emptyValue: false },
  }),
  render: (args) => (
    <Demo>
      <Row label="Wrap east–west">
        <CheckboxWidget {...args} />
      </Row>
    </Demo>
  ),
};

export const Unchecked: Story = {
  args: widgetProps({
    id: "cfg_iceCaps",
    name: "flag",
    value: false,
    options: { emptyValue: false },
  }),
  render: (args) => (
    <Demo>
      <Row label="Polar ice caps">
        <CheckboxWidget {...args} />
      </Row>
    </Demo>
  ),
};

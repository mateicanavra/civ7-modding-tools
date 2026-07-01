import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactNode } from "react";
import { SwitchWidget } from "@/features/configOverrides/rjsfWidgets";
import { widgetProps } from "@/storybook/mockWidgetProps";

/**
 * SwitchWidget is the RJSF boolean control rendered as the DS `Switch` (the toggle
 * idiom, vs CheckboxWidget's box). Adapted from `.design-sync/previews/SwitchWidget.tsx`;
 * the typed `widgetProps` factory feeds the story `args` (CSF3 requires args for
 * required-prop widgets), and `render` spreads them into the real widget on its
 * preview substrate.
 */
const meta = {
  title: "forms/SwitchWidget",
  component: SwitchWidget,
} satisfies Meta<typeof SwitchWidget>;

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

// Preview-only label row — the widget is just the toggle; the label is chrome.
function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        alignItems: "center",
        justifyContent: "space-between",
        width: 220,
      }}
    >
      <span className="text-data text-muted-foreground">{label}</span>
      {children}
    </div>
  );
}

export const On: Story = {
  args: widgetProps({
    id: "cfg_drift",
    name: "flag",
    value: true,
    options: { emptyValue: false },
  }),
  render: (args) => (
    <Demo>
      <Row label="Continental drift">
        <SwitchWidget {...args} />
      </Row>
    </Demo>
  ),
};

export const Off: Story = {
  args: widgetProps({
    id: "cfg_mirror",
    name: "flag",
    value: false,
    options: { emptyValue: false },
  }),
  render: (args) => (
    <Demo>
      <Row label="Mirror hemispheres">
        <SwitchWidget {...args} />
      </Row>
    </Demo>
  ),
};

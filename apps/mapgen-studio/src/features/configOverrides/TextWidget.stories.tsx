import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactNode } from "react";
import { TextWidget } from "@/features/configOverrides/rjsfWidgets";
import { widgetProps } from "@/storybook/mockWidgetProps";

/**
 * TextWidget is the RJSF text control re-skinned onto the DS `Input` — the form's
 * string field, wired with empty-value normalization + error a11y. Adapted from
 * `.design-sync/previews/TextWidget.tsx`; props come from the typed `widgetProps`
 * factory.
 */
const meta = {
  title: "forms/TextWidget",
  component: TextWidget,
} satisfies Meta<typeof TextWidget>;

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
    id: "cfg_recipe",
    name: "recipe",
    value: "mod-swooper-maps/standard",
    placeholder: "recipe id",
  }),
  render: (args) => (
    <Demo>
      <div style={{ width: 260 }}>
        <TextWidget {...args} />
      </div>
    </Demo>
  ),
};

export const Disabled: Story = {
  args: widgetProps({
    id: "cfg_recipe",
    name: "recipe",
    value: "mod-swooper-maps/standard",
    disabled: true,
  }),
  render: (args) => (
    <Demo>
      <div style={{ width: 260 }}>
        <TextWidget {...args} />
      </div>
    </Demo>
  ),
};

import type { Meta, StoryObj } from "@storybook/react-vite";
import { TextareaWidget } from "@swooper/mapgen-studio-ui";
import type { ReactNode } from "react";
import { widgetProps } from "../../storybook/mockWidgetProps.js";

/**
 * TextareaWidget is the RJSF multiline control re-skinned onto the DS `Textarea`.
 * Adapted from `.design-sync/previews/TextareaWidget.tsx`; the typed `widgetProps`
 * factory feeds the story `args` (CSF3 requires args for required-prop widgets), and
 * `render` spreads them into the real widget on its preview substrate.
 */
const meta = {
  title: "forms/TextareaWidget",
  component: TextareaWidget,
} satisfies Meta<typeof TextareaWidget>;

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
    id: "cfg_notes",
    name: "notes",
    value: "Cool, wet archipelago.\nHigh sea level, frequent island chains.",
  }),
  render: (args) => (
    <Demo>
      <div style={{ width: 300 }}>
        <TextareaWidget {...args} />
      </div>
    </Demo>
  ),
};

export const Empty: Story = {
  args: widgetProps({
    id: "cfg_notes",
    name: "notes",
    value: "",
    placeholder: "Describe this config…",
  }),
  render: (args) => (
    <Demo>
      <div style={{ width: 300 }}>
        <TextareaWidget {...args} />
      </div>
    </Demo>
  ),
};

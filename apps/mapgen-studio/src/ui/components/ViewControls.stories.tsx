import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactNode } from "react";
import { ViewControls } from "@/ui/components/ViewControls";

/**
 * ViewControls is the floating map toolbar: a theme-cycle button (auto/light/
 * dark icon) + a grid-visibility toggle, separated by a hairline divider, on the
 * popover tier over the map. The buttons carry shadcn Tooltips whose
 * TooltipProvider is supplied by the global Storybook decorator.
 * Adapted from `.design-sync/previews/ViewControls.tsx`.
 */
const meta = {
  title: "composites/ViewControls",
  component: ViewControls,
} satisfies Meta<typeof ViewControls>;

export default meta;
type Story = StoryObj<typeof meta>;

const noop = () => {};

// Preview-only dark surface — not a DS export.
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

export const GridOn: Story = {
  args: { themePreference: "dark", onThemeCycle: noop, showGrid: true, onShowGridChange: noop },
  render: (args) => (
    <Demo>
      <ViewControls {...args} />
    </Demo>
  ),
};

export const GridOff: Story = {
  args: { themePreference: "system", onThemeCycle: noop, showGrid: false, onShowGridChange: noop },
  render: (args) => (
    <Demo>
      <ViewControls {...args} />
    </Demo>
  ),
};

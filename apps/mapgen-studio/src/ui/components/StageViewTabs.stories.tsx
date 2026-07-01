import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactNode } from "react";
import { StageViewTabs } from "@/ui/components/StageViewTabs";

/**
 * StageViewTabs is the stage's own Map/Pipeline view switcher — a segmented pill
 * that floats `absolute`, centered, at the stage's top edge.
 * Adapted from `.design-sync/previews/StageViewTabs.tsx`.
 */
const meta = {
  title: "composites/StageViewTabs",
  component: StageViewTabs,
} satisfies Meta<typeof StageViewTabs>;

export default meta;
type Story = StoryObj<typeof meta>;

const noop = () => {};

// Preview-only relative dark stage surface sized to reveal the floating pill,
// with top: 12 to clear the edge — not a DS export.
function Stage({ children }: { children: ReactNode }) {
  return (
    <div
      className="relative bg-background"
      style={{ width: 360, height: 64, borderRadius: 8, overflow: "hidden" }}
    >
      {children}
    </div>
  );
}

export const MapActive: Story = {
  args: { value: "map", onValueChange: noop, top: 12 },
  render: (args) => (
    <Stage>
      <StageViewTabs {...args} />
    </Stage>
  ),
};

export const PipelineActive: Story = {
  args: { value: "pipeline", onValueChange: noop, top: 12 },
  render: (args) => (
    <Stage>
      <StageViewTabs {...args} />
    </Stage>
  ),
};

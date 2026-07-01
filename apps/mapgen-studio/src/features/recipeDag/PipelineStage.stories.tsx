import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactNode } from "react";
import { PipelineStage, type PipelineStageProps } from "@/features/recipeDag/PipelineStage";
import { recipeDagFixture } from "@/storybook/recipeDagFixture";

/**
 * Adapted from `.design-sync/previews/PipelineStage.tsx`. The recipe dependency
 * graph as a first-class stage view: a headless-laid-out SVG canvas — dependency
 * rank crossed with phase lanes, bundled artifact edges, and selectable stage
 * nodes that expand to their steps. Driven by the shared `recipeDagFixture`
 * (a valid `RecipeDagResult`) so `buildRecipeDagLayout` lays it out
 * deterministically with no server.
 */
const meta = {
  title: "panels/PipelineStage",
  component: PipelineStage,
} satisfies Meta<typeof PipelineStage>;

export default meta;
type Story = StoryObj<typeof meta>;

const noop = () => {};

// The full prop bag — used both as `args` (to satisfy the typed `StoryObj`'s
// required props) and spread into the rendered component.
const props = {
  recipeId: "mod-swooper-maps/standard",
  dag: recipeDagFixture,
  status: "ready",
  error: null,
  isLightMode: false,
  expandedStageIds: new Set(["relief"]),
  selectedStageId: null,
  onToggleStage: noop,
  onSelectStage: noop,
  topInset: 16,
  bottomInset: 16,
} satisfies PipelineStageProps;

// Preview-only relative dark Stage surface — the component is `absolute inset-0`,
// so it needs a bounded positioned host; a wide viewport reveals the lanes/nodes/
// edges. Not a DS export.
function Stage({ children }: { children: ReactNode }) {
  return (
    <div
      className="relative bg-background"
      style={{ width: 1080, height: 600, borderRadius: 8, overflow: "hidden" }}
    >
      {children}
    </div>
  );
}

// The ready graph: phase lanes crossed with dependency ranks, the `relief` stage
// expanded to its steps (the fixture invariant), the console strip top-right.
export const PipelineGraph: Story = {
  args: props,
  render: (args) => (
    <Stage>
      <PipelineStage {...args} />
    </Stage>
  ),
};

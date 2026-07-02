import type { Meta, StoryObj } from "@storybook/react-vite";
import { RightDock, type RightDockProps } from "@swooper/mapgen-studio-ui";
import type { ReactNode } from "react";

/**
 * RightDock is the right-anchored floating rail that hosts the explore panel.
 * Adapted from `.design-sync/previews/RightDock.tsx`; title maps to the
 * design-sync export name for the Stage-2 flip.
 */
const meta = {
  title: "layout/RightDock",
  component: RightDock,
  // CSF3 requires args once when the component has required props; these stories
  // own their full scene in render, so no per-story args are needed.
  args: {} as unknown as RightDockProps,
} satisfies Meta<typeof RightDock>;

export default meta;
type Story = StoryObj<typeof meta>;

// RightDock is `position: absolute` + `pointer-events-none`, so the preview frames
// it in a `relative` map-substrate stage — preview-only scaffolding.
function Stage({ children }: { children: ReactNode }) {
  return (
    <div
      className="bg-background"
      style={{ position: "relative", width: 360, height: 300, borderRadius: 8, overflow: "hidden" }}
    >
      {children}
    </div>
  );
}

// Sample panel (pointer-events-auto) standing in for the composed-in content.
function SamplePanel() {
  return (
    <div
      className="bg-card border border-border pointer-events-auto"
      style={{ width: 200, borderRadius: 8, padding: 12 }}
    >
      <div className="text-label uppercase text-muted-foreground" style={{ marginBottom: 6 }}>
        Explore
      </div>
      <div className="text-data text-foreground">Stage · Step · Layers</div>
    </div>
  );
}

export const WithPanel: Story = {
  render: () => (
    <Stage>
      <RightDock top={12} bottom={12}>
        <SamplePanel />
      </RightDock>
    </Stage>
  ),
};

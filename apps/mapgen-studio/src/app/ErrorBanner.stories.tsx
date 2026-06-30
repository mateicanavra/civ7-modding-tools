import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactNode } from "react";
import { ErrorBanner } from "@/app/ErrorBanner";

/**
 * ErrorBanner is the centered destructive alert (role=alert) that renders only
 * when a message is present. Adapted from `.design-sync/previews/ErrorBanner.tsx`;
 * title maps to the design-sync export name for the Stage-2 flip.
 */
const meta = {
  title: "composites/ErrorBanner",
  component: ErrorBanner,
} satisfies Meta<typeof ErrorBanner>;

export default meta;
type Story = StoryObj<typeof meta>;

// ErrorBanner is absolutely positioned, so the preview frames it in a `relative`
// map-substrate stage — preview-only scaffolding, not a DS export.
function Stage({ children }: { children: ReactNode }) {
  return (
    <div
      className="bg-background"
      style={{ position: "relative", width: 480, height: 120, borderRadius: 8, overflow: "hidden" }}
    >
      {children}
    </div>
  );
}

export const GenerationFailed: Story = {
  args: {
    message:
      "Map generation failed: recipe ‘mod-swooper-maps/standard’ produced no land tiles at seed 1474829.",
    top: 16,
  },
  render: (args) => (
    <Stage>
      <ErrorBanner {...args} />
    </Stage>
  ),
};

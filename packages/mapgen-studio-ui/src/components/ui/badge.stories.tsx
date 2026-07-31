import type { Meta, StoryObj } from "@storybook/react-vite";
import { Badge } from "@swooper/mapgen-studio-ui";
import type { ReactNode } from "react";

/**
 * The dense status chip of the instrument panel: amber-contour warnings
 * (drift, autoplay, busy), quiet neutral count read-outs, and inset interactive
 * references. Interactive chips render a real button via `asChild`.
 */
const meta = {
  title: "primitives/Badge",
  component: Badge,
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

// Preview-only dark backdrop — not a DS export.
function Demo({ children }: { children: ReactNode }) {
  return (
    <div
      className="bg-background text-foreground"
      style={{
        padding: 20,
        borderRadius: 6,
        display: "flex",
        flexWrap: "wrap",
        gap: 10,
        alignItems: "center",
      }}
    >
      {children}
    </div>
  );
}

export const Variants: Story = {
  render: () => (
    <Demo>
      <Badge variant="warning">Auto</Badge>
      <Badge variant="warning">Busy</Badge>
      <Badge variant="neutral">rivers 42</Badge>
      <Badge variant="neutral">lakes 7</Badge>
      <Badge variant="interactive">elevation</Badge>
    </Demo>
  ),
};

export const Interactive: Story = {
  render: () => (
    <Demo>
      <Badge asChild variant="interactive">
        <button type="button" aria-label="Game setup drifted — click to re-apply the saved config">
          Re-apply
        </button>
      </Badge>
    </Demo>
  ),
};

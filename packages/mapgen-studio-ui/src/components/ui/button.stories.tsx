import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "@swooper/mapgen-studio-ui";
import { Dices, Play } from "lucide-react";
import type { ReactNode } from "react";

/**
 * Smoke story for the Stage-1 workbench foundation: proves theme + tokens + fonts
 * load and a borders-only primitive renders on its real graphite substrate.
 * Adapted from `.design-sync/previews/Button.tsx` (title maps to the design-sync
 * export name so Stage 2's package→storybook flip is a no-re-author cutover).
 */
const meta = {
  title: "primitives/Button",
  component: Button,
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// Preview-only dark backdrop so contours and the one filled primary read
// correctly — not a DS export.
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
      <Button>
        <Play /> Generate map
      </Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="destructive">Delete config</Button>
      <Button variant="link">View docs</Button>
    </Demo>
  ),
};

export const Sizes: Story = {
  render: () => (
    <Demo>
      <Button size="lg">Large</Button>
      <Button size="default">Default</Button>
      <Button size="sm">Small</Button>
      <Button size="icon" variant="outline" aria-label="Re-roll seed">
        <Dices />
      </Button>
    </Demo>
  ),
};

export const States: Story = {
  render: () => (
    <Demo>
      <Button>Run</Button>
      <Button disabled>Disabled</Button>
      <Button variant="outline" disabled>
        Disabled outline
      </Button>
    </Demo>
  ),
};

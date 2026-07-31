import type { Meta, StoryObj } from "@storybook/react-vite";
import { IconButton } from "@swooper/mapgen-studio-ui";
import { Braces, EllipsisVertical, Link, Maximize, Power, Undo2 } from "lucide-react";
import type { ReactNode } from "react";

/**
 * The contour-less icon-only toolbar action — the dominant interactive idiom
 * of the panel chrome (RecipePanel/ExplorePanel headers, ViewControls, config
 * toolbars). Idle rides the calibrated muted treatment; `active` marks
 * latched toggles with the muted fill; callers may layer intent color
 * (warning, primary) through `className`.
 */
const meta = {
  title: "primitives/IconButton",
  component: IconButton,
} satisfies Meta<typeof IconButton>;

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

export const States: Story = {
  render: () => (
    <Demo>
      <IconButton aria-label="Fit to view">
        <Maximize className="w-3.5 h-3.5" />
      </IconButton>
      <IconButton active aria-label="Disable Overrides" aria-pressed="true">
        <Power className="w-3.5 h-3.5" />
      </IconButton>
      <IconButton disabled aria-label="Focus Current Step">
        <Link className="w-3.5 h-3.5" />
      </IconButton>
      <IconButton aria-label="Options">
        <EllipsisVertical className="w-3.5 h-3.5" />
      </IconButton>
    </Demo>
  ),
};

export const IntentOverrides: Story = {
  render: () => (
    <Demo>
      <IconButton
        aria-label="Discard Changes"
        className="text-warning hover:text-warning hover:bg-warning/10"
      >
        <Undo2 className="w-3.5 h-3.5" />
      </IconButton>
      <IconButton
        aria-label="Show JSON"
        aria-pressed="true"
        className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
      >
        <Braces className="w-3.5 h-3.5" />
      </IconButton>
    </Demo>
  ),
};

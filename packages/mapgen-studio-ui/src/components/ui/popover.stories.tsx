import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button, Label, Popover, PopoverContent, PopoverTrigger } from "@swooper/mapgen-studio-ui";
import { SlidersHorizontal } from "lucide-react";

/**
 * Adapted from `.design-sync/previews/Popover.tsx`: a Radix floating surface on
 * the popover tier — a generic container for inspector pickers and overflow
 * content. Rendered `defaultOpen` so the open content is captured on first paint.
 */
const meta = {
  title: "primitives/Popover",
  component: Popover,
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;

export const OverlayOpacity: Story = {
  render: () => (
    <Popover defaultOpen>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" aria-label="Overlay settings">
          <SlidersHorizontal />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start">
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <Label>Overlay opacity</Label>
          <p className="text-muted-foreground" style={{ fontSize: 12, lineHeight: 1.5 }}>
            Blend the elevation overlay against the base terrain. Set to 0% to hide the overlay;
            100% paints it fully opaque over the surface map.
          </p>
          <div
            className="border border-border bg-input-background text-foreground"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderRadius: 4,
              padding: "4px 8px",
            }}
          >
            <span className="text-muted-foreground" style={{ fontSize: 11 }}>
              Opacity
            </span>
            <span style={{ fontSize: 12, fontFamily: "var(--font-mono, monospace)" }}>65%</span>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  ),
};

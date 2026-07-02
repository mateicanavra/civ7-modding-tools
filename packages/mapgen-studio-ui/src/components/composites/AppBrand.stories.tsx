import type { Meta, StoryObj } from "@storybook/react-vite";
import { AppBrand } from "@swooper/mapgen-studio-ui";
import type { ReactNode } from "react";

/**
 * AppBrand is the identity pill in the header ("MapGen Studio v0.1"), riding the
 * popover tier over the deck.gl map. The hover info-card only mounts on
 * mouseenter, so a static capture shows the resting pill only.
 * Adapted from `.design-sync/previews/AppBrand.tsx`.
 */
const meta = {
  title: "composites/AppBrand",
  component: AppBrand,
} satisfies Meta<typeof AppBrand>;

export default meta;
type Story = StoryObj<typeof meta>;

// Preview-only dark surface so the bordered popover chrome reads against the
// studio substrate — not a DS export.
function Demo({ children }: { children: ReactNode }) {
  return (
    <div
      className="bg-background text-foreground"
      style={{ padding: 24, borderRadius: 6, display: "flex", flexDirection: "column", gap: 12 }}
    >
      {children}
    </div>
  );
}

export const Default: Story = {
  render: () => (
    <Demo>
      <AppBrand />
    </Demo>
  ),
};

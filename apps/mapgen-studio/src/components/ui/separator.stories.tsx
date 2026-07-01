import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactNode } from "react";
import { Separator } from "@/components/ui";

/**
 * Adapted from `.design-sync/previews/Separator.tsx`. Separator is the studio's
 * intra-surface hairline (border-subtle tier) — quieter than a panel edge. Both
 * stories give the rule visible content on either side so the hairline reads.
 */
const meta = {
  title: "primitives/Separator",
  component: Separator,
} satisfies Meta<typeof Separator>;

export default meta;
type Story = StoryObj<typeof meta>;

// Preview-only dark backdrop so the hairline reads on the real graphite surface
// — not a DS export.
function Demo({ children }: { children: ReactNode }) {
  return (
    <div
      className="bg-background text-foreground"
      style={{
        padding: 20,
        borderRadius: 6,
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      {children}
    </div>
  );
}

// Horizontal: a labeled settings group split into two stacked sections.
export const Horizontal: Story = {
  render: () => (
    <Demo>
      <div
        className="bg-card border border-border"
        style={{
          width: 320,
          borderRadius: 6,
          padding: 14,
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <span className="text-foreground" style={{ fontSize: 13, fontWeight: 600 }}>
            World
          </span>
          <span className="text-muted-foreground" style={{ fontSize: 12 }}>
            Standard · 6 players · balanced resources
          </span>
        </div>
        <Separator />
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <span className="text-foreground" style={{ fontSize: 13, fontWeight: 600 }}>
            Recipe
          </span>
          <span className="text-muted-foreground" style={{ fontSize: 12 }}>
            mod-swooper-maps/standard · seed 1474829
          </span>
        </div>
      </div>
    </Demo>
  ),
};

// Vertical: hairlines dividing inline items in a toolbar row.
export const Vertical: Story = {
  render: () => (
    <Demo>
      <div
        className="bg-card border border-border text-muted-foreground"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          height: 32,
          padding: "0 12px",
          borderRadius: 6,
          fontSize: 12,
        }}
      >
        <span className="text-foreground" style={{ fontFamily: "var(--font-mono, monospace)" }}>
          96 × 60
        </span>
        <Separator orientation="vertical" />
        <span>Continents</span>
        <Separator orientation="vertical" />
        <span style={{ fontFamily: "var(--font-mono, monospace)" }}>seed 1474829</span>
      </div>
    </Demo>
  ),
};

import type { Meta, StoryObj } from "@storybook/react-vite";
import { ScrollArea } from "@swooper/mapgen-studio-ui";
import type { ReactNode } from "react";

/**
 * Adapted from `.design-sync/previews/ScrollArea.tsx`: Radix's custom scroller
 * with a quiet hairline thumb. A fixed 160px viewport + a tall preset list forces
 * overflow so the thumb shows.
 */
const meta = {
  title: "primitives/ScrollArea",
  component: ScrollArea,
} satisfies Meta<typeof ScrollArea>;

export default meta;
type Story = StoryObj<typeof meta>;

// Preview-only dark backdrop — not a DS export.
function Demo({ children }: { children: ReactNode }) {
  return (
    <div
      className="bg-background text-foreground"
      style={{ padding: 20, borderRadius: 6, display: "flex", flexDirection: "column", gap: 12 }}
    >
      {children}
    </div>
  );
}

// Module-scope fixture (hoisted so the render stays referentially stable).
const presets = [
  "continents",
  "pangaea",
  "archipelago",
  "fractal-highlands",
  "inland-sea",
  "shattered-plates",
  "tropical-belt",
  "polar-frontier",
  "rift-valley",
  "sundered-archipelago",
  "drowned-platform",
  "craton-cradle",
  "volcanic-arc",
  "monsoon-coast",
  "great-steppe",
];

export const PresetList: Story = {
  render: () => (
    <Demo>
      <div
        className="bg-card border border-border"
        style={{ width: 300, borderRadius: 6, overflow: "hidden" }}
      >
        <div
          className="text-muted-foreground border-b border-border"
          style={{
            padding: "8px 12px",
            fontSize: 11,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
          }}
        >
          Presets · 15
        </div>
        <ScrollArea style={{ height: 160 }}>
          <div style={{ padding: 4, display: "flex", flexDirection: "column" }}>
            {presets.map((name, i) => (
              <div
                key={name}
                className="text-foreground"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "7px 10px",
                  borderRadius: 4,
                  fontSize: 12,
                  fontFamily: "var(--font-mono, monospace)",
                  backgroundColor: i === 0 ? "var(--muted, transparent)" : "transparent",
                }}
              >
                <span>{name}</span>
                <span className="text-muted-foreground" style={{ fontSize: 11 }}>
                  96 × 60
                </span>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </Demo>
  ),
};

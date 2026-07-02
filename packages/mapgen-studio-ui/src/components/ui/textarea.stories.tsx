import type { Meta, StoryObj } from "@storybook/react-vite";
import { Label, Textarea } from "@swooper/mapgen-studio-ui";
import type { ReactNode } from "react";

/**
 * Adapted from `.design-sync/previews/Textarea.tsx`. Textarea is the multi-line
 * sibling of Input — same inset substrate, control border, and 11px data type.
 */
const meta = {
  title: "primitives/Textarea",
  component: Textarea,
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

// Preview-only dark backdrop so the inset field and placeholder/value type read
// on the real graphite surface — not a DS export.
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

// Hoisted constant fixture (module scope) — stable across renders.
const overrides = `{
  "landmass": { "waterPercent": 0.62 },
  "climate": { "rainfall": "wet" }
}`;

export const Default: Story = {
  render: () => (
    <Demo>
      <div style={{ width: 320 }}>
        <Textarea placeholder="Notes for this preset…" />
      </div>
    </Demo>
  ),
};

export const WithValue: Story = {
  render: () => (
    <Demo>
      <div style={{ width: 320, display: "flex", flexDirection: "column", gap: 4 }}>
        <Label htmlFor="overrides">Config overrides</Label>
        <Textarea id="overrides" className="font-mono" defaultValue={overrides} rows={4} />
      </div>
    </Demo>
  ),
};

export const Disabled: Story = {
  render: () => (
    <Demo>
      <div style={{ width: 320 }}>
        <Textarea disabled defaultValue={overrides} className="font-mono" rows={4} />
      </div>
    </Demo>
  ),
};

import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactNode } from "react";
import { Input, Label } from "@/components/ui";

/**
 * Adapted from `.design-sync/previews/Input.tsx`: the dense inset field (h-7,
 * 11px data type) on the `input-background` substrate with the control border.
 */
const meta = {
  title: "primitives/Input",
  component: Input,
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

// Preview-only dark backdrop so the inset field and placeholder/value type read
// on the real graphite surface — not a DS export.
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

export const Default: Story = {
  render: () => (
    <Demo>
      <div style={{ width: 240 }}>
        <Input placeholder="Search layers…" />
      </div>
    </Demo>
  ),
};

export const WithValue: Story = {
  render: () => (
    <Demo>
      <div style={{ width: 240 }}>
        <Input className="font-mono" defaultValue="1474829" aria-label="Seed" />
      </div>
    </Demo>
  ),
};

export const Disabled: Story = {
  render: () => (
    <Demo>
      <div style={{ width: 240 }}>
        <Input disabled defaultValue="mod-swooper-maps/standard" />
      </div>
    </Demo>
  ),
};

export const Field: Story = {
  render: () => (
    <Demo>
      <div style={{ width: 240, display: "flex", flexDirection: "column", gap: 4 }}>
        <Label htmlFor="seed">Seed</Label>
        <Input id="seed" className="font-mono" defaultValue="1474829" />
      </div>
      <div style={{ width: 240, display: "flex", flexDirection: "column", gap: 4 }}>
        <Label htmlFor="map-name">Map name</Label>
        <Input id="map-name" placeholder="Untitled continents" />
      </div>
    </Demo>
  ),
};

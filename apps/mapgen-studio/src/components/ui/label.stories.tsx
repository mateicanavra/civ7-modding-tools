import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactNode } from "react";
import { Checkbox, Input, Label, Switch } from "@/components/ui";

/**
 * Adapted from `.design-sync/previews/Label.tsx`: the field eyebrow — meaningless
 * alone, so every story pairs it with the control it names. `text-label` is the
 * 10px uppercase eyebrow variant.
 */
const meta = {
  title: "primitives/Label",
  component: Label,
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof meta>;

// Preview-only dark backdrop matching the studio — not a DS export.
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

export const WithInput: Story = {
  render: () => (
    <Demo>
      <div style={{ width: 220, display: "flex", flexDirection: "column", gap: 4 }}>
        <Label htmlFor="seed">Seed</Label>
        <Input id="seed" className="font-mono" defaultValue="1474829" />
      </div>
    </Demo>
  ),
};

export const WithSwitch: Story = {
  render: () => (
    <Demo>
      <div
        style={{
          display: "flex",
          gap: 8,
          alignItems: "center",
          justifyContent: "space-between",
          width: 220,
        }}
      >
        <Label htmlFor="show-grid">Show grid</Label>
        <Switch id="show-grid" defaultChecked />
      </div>
    </Demo>
  ),
};

export const WithCheckbox: Story = {
  render: () => (
    <Demo>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <Checkbox id="place-resources" defaultChecked />
        <Label htmlFor="place-resources">Resources</Label>
      </div>
    </Demo>
  ),
};

export const Eyebrow: Story = {
  render: () => (
    <Demo>
      <div style={{ width: 220, display: "flex", flexDirection: "column", gap: 4 }}>
        <Label htmlFor="players" className="text-label text-muted-foreground">
          Players
        </Label>
        <Input id="players" className="font-mono" defaultValue="6" />
      </div>
    </Demo>
  ),
};

import type { Meta, StoryObj } from "@storybook/react-vite";
import { Label, Switch } from "@swooper/mapgen-studio-ui";
import type { ReactNode } from "react";

/**
 * Adapted from `.design-sync/previews/Switch.tsx`. Switch is the 36x20 toggle —
 * checked fills with the one primary slate, unchecked rests on the muted surface.
 */
const meta = {
  title: "primitives/Switch",
  component: Switch,
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

// Preview-only dark backdrop so the track fill and thumb read on the real
// graphite surface — not a DS export.
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

export const Off: Story = {
  render: () => (
    <Demo>
      <Switch />
    </Demo>
  ),
};

export const On: Story = {
  render: () => (
    <Demo>
      <Switch defaultChecked />
    </Demo>
  ),
};

export const Disabled: Story = {
  render: () => (
    <Demo>
      <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
        <Switch disabled />
        <Switch defaultChecked disabled />
      </div>
    </Demo>
  ),
};

export const WithLabel: Story = {
  render: () => (
    <Demo>
      <div
        style={{
          display: "flex",
          gap: 8,
          alignItems: "center",
          justifyContent: "space-between",
          width: 200,
        }}
      >
        <Label htmlFor="show-grid">Show grid</Label>
        <Switch id="show-grid" defaultChecked />
      </div>
    </Demo>
  ),
};

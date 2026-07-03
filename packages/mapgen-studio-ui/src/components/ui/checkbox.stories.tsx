import type { Meta, StoryObj } from "@storybook/react-vite";
import { Checkbox, Label } from "@swooper/mapgen-studio-ui";
import type { ReactNode } from "react";

/**
 * Adapted from `.design-sync/previews/Checkbox.tsx`: a dense 14px box on the
 * studio's inset control substrate; checked fills with the one primary slate.
 */
const meta = {
  title: "primitives/Checkbox",
  component: Checkbox,
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

// Preview-only dark backdrop so the contour border and filled state read on the
// real graphite surface — not a DS export.
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
      <Checkbox />
    </Demo>
  ),
};

export const Checked: Story = {
  render: () => (
    <Demo>
      <Checkbox defaultChecked />
    </Demo>
  ),
};

export const Disabled: Story = {
  render: () => (
    <Demo>
      <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
        <Checkbox disabled />
        <Checkbox defaultChecked disabled />
      </div>
    </Demo>
  ),
};

export const WithLabel: Story = {
  render: () => (
    <Demo>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <Checkbox id="auto-run" defaultChecked />
        <Label htmlFor="auto-run">Auto-run on config change</Label>
      </div>
    </Demo>
  ),
};

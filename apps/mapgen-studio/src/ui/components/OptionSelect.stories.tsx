import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactNode } from "react";
import { OptionSelect } from "@/ui/components/OptionSelect";

/**
 * OptionSelect is a thin, token-driven adapter over the Radix Select that keeps
 * the studio chrome's simple value/onValueChange/options shape. Rendered CLOSED
 * here so each card shows the trigger with its selected label.
 * Adapted from `.design-sync/previews/OptionSelect.tsx`.
 */
const meta = {
  title: "composites/OptionSelect",
  component: OptionSelect,
} satisfies Meta<typeof OptionSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

const noop = () => {};

const MAP_SIZES = [
  { value: "MAPSIZE_TINY", label: "Tiny" },
  { value: "MAPSIZE_SMALL", label: "Small" },
  { value: "MAPSIZE_STANDARD", label: "Standard" },
  { value: "MAPSIZE_LARGE", label: "Large" },
  { value: "MAPSIZE_HUGE", label: "Huge" },
];

const RESOURCE_MODES = [
  { value: "balanced", label: "Balanced" },
  { value: "strategic", label: "Strategic" },
  { value: "abundant", label: "Abundant" },
];

// Preview-only dark surface — not a DS export.
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

export const MapSize: Story = {
  args: {
    value: "MAPSIZE_STANDARD",
    onValueChange: noop,
    options: MAP_SIZES,
    ariaLabel: "Map size",
    className: "w-44",
  },
  render: (args) => (
    <Demo>
      <OptionSelect {...args} />
    </Demo>
  ),
};

export const ResourceMode: Story = {
  args: {
    value: "strategic",
    onValueChange: noop,
    options: RESOURCE_MODES,
    ariaLabel: "Resource distribution",
    className: "w-44",
  },
  render: (args) => (
    <Demo>
      <OptionSelect {...args} />
    </Demo>
  ),
};

export const Disabled: Story = {
  args: {
    value: "MAPSIZE_STANDARD",
    onValueChange: noop,
    options: MAP_SIZES,
    ariaLabel: "Map size",
    className: "w-44",
    disabled: true,
  },
  render: (args) => (
    <Demo>
      <OptionSelect {...args} />
    </Demo>
  ),
};

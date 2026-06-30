import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactNode } from "react";
import type { Civ7StudioSetupConfig } from "@/features/civ7Setup/setupConfig";
import { AppHeader } from "@/ui/components/AppHeader";

/**
 * AppHeader is the top chrome bar: AppBrand (left), the Game bar (config
 * selector + setup gear), and the view controls (theme/grid) on the right. It
 * positions `absolute top-4`, so it's framed in a relative dark surface.
 * Tooltips are covered by the global Storybook decorator's TooltipProvider.
 * Adapted from `.design-sync/previews/AppHeader.tsx` — the preview's loose
 * `setupConfig` mock is completed here against the real `Civ7StudioSetupConfig`
 * (full `savedConfig` ref + required `gameOptions`).
 */
const meta = {
  title: "composites/AppHeader",
  component: AppHeader,
} satisfies Meta<typeof AppHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

const noop = () => {};

const savedConfigOptions = [
  { value: "continents-std", label: "Continents — Standard" },
  { value: "archipelago", label: "Archipelago" },
  { value: "pangaea", label: "Pangaea" },
];

const setupConfig: Civ7StudioSetupConfig = {
  savedConfig: {
    id: "continents-std",
    displayName: "Continents — Standard",
    fileName: "continents-std.json",
    path: "/configs/continents-std.json",
  },
  gameOptions: {},
  playerOptions: [{ playerId: 0, options: {} }],
};

const setupOptions = {
  savedConfigOptions,
  leaderOptions: [],
  civilizationOptions: [],
  difficultyOptions: [],
  gameSpeedOptions: [],
};

// Preview-only relative dark surface; full width so the `absolute top-4` header
// reads on its real substrate — not a DS export.
function Bar({ children }: { children: ReactNode }) {
  return (
    <div
      className="relative bg-background"
      style={{ width: 920, height: 72, borderRadius: 8, overflow: "hidden" }}
    >
      {children}
    </div>
  );
}

export const Default: Story = {
  args: {
    themePreference: "dark",
    onThemeCycle: noop,
    showGrid: true,
    onShowGridChange: noop,
    setupConfig,
    setupOptions,
    onSetupConfigChange: noop,
    onSavedConfigChange: noop,
    savedConfigModified: false,
  },
  render: (args) => (
    <Bar>
      <AppHeader {...args} />
    </Bar>
  ),
};

export const ModifiedConfig: Story = {
  args: {
    themePreference: "dark",
    onThemeCycle: noop,
    showGrid: false,
    onShowGridChange: noop,
    setupConfig,
    setupOptions,
    onSetupConfigChange: noop,
    onSavedConfigChange: noop,
    savedConfigModified: true,
  },
  render: (args) => (
    <Bar>
      <AppHeader {...args} />
    </Bar>
  ),
};

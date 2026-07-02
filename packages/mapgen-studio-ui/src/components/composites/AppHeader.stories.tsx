import type { Meta, StoryObj } from "@storybook/react-vite";
import type { AppHeaderSetupState } from "@swooper/mapgen-studio-ui";
import { AppHeader } from "@swooper/mapgen-studio-ui";
import type { ReactNode } from "react";

/**
 * AppHeader is the top chrome bar: AppBrand (left), the Game bar (config
 * selector + setup gear), and the view controls (theme/grid) on the right. It
 * positions `absolute top-4`, so it's framed in a relative dark surface.
 * Tooltips are covered by the global Storybook decorator's TooltipProvider.
 * Adapted from `.design-sync/previews/AppHeader.tsx` — the preview's loose
 * `setupConfig` mock became the `AppHeaderSetupState` view-model when the E4a
 * redesign made the header props-driven (the app container derives it; the
 * story hands it a plain structural fixture).
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

const setup: AppHeaderSetupState = {
  savedConfig: {
    id: "continents-std",
    displayName: "Continents — Standard",
  },
  leaderId: "",
  civilizationId: "",
  difficultyId: "",
  gameSpeedId: "",
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
    setup,
    setupOptions,
    onSavedConfigChange: noop,
    onLeaderChange: noop,
    onCivilizationChange: noop,
    onDifficultyChange: noop,
    onGameSpeedChange: noop,
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
    setup,
    setupOptions,
    onSavedConfigChange: noop,
    onLeaderChange: noop,
    onCivilizationChange: noop,
    onDifficultyChange: noop,
    onGameSpeedChange: noop,
    savedConfigModified: true,
  },
  render: (args) => (
    <Bar>
      <AppHeader {...args} />
    </Bar>
  ),
};

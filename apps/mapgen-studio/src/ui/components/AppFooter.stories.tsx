import type { Meta, StoryObj } from "@storybook/react-vite";
import type { RecipeSettings, WorldSettings } from "@swooper/mapgen-studio-ui";
import type { ReactNode } from "react";
import { AppFooter } from "@/ui/components/AppFooter";

/**
 * AppFooter is the World/Map console — a centered floating bar (size · players ·
 * seed · status · run). It positions `absolute bottom-4`, so it's framed in a
 * relative dark surface sized like its dock over the map. The footer
 * self-provides its own TooltipProvider internally, so its diagnostic hints work
 * standalone here.
 * Adapted from `.design-sync/previews/AppFooter.tsx`.
 */
const meta = {
  title: "composites/AppFooter",
  component: AppFooter,
} satisfies Meta<typeof AppFooter>;

export default meta;
type Story = StoryObj<typeof meta>;

const noop = () => {};

const world: WorldSettings = {
  mapSize: "MAPSIZE_STANDARD",
  playerCount: 6,
  resources: "balanced",
};
const recipe: RecipeSettings = {
  recipe: "mod-swooper-maps/standard",
  preset: "continents",
  seed: "1474829",
};

// Preview-only relative dark surface sized like the footer's dock over the
// map — not a DS export.
function Dock({ children }: { children: ReactNode }) {
  return (
    <div
      className="relative bg-background"
      style={{ width: 760, height: 80, borderRadius: 8, overflow: "hidden" }}
    >
      {children}
    </div>
  );
}

export const Ready: Story = {
  args: {
    status: "ready",
    lastRunSettings: recipe,
    lastGlobalSettings: world,
    globalSettings: world,
    currentSettings: recipe,
    onGlobalSettingsChange: noop,
    onSettingsChange: noop,
    onRun: noop,
    onReroll: noop,
    isRunning: false,
    isRunInGameRunning: false,
    isDirty: false,
    autoRunEnabled: false,
    onAutoRunEnabledChange: noop,
  },
  render: (args) => (
    <Dock>
      <AppFooter {...args} />
    </Dock>
  ),
};

export const RunningDirty: Story = {
  args: {
    status: "running",
    lastRunSettings: recipe,
    lastGlobalSettings: world,
    globalSettings: world,
    currentSettings: { ...recipe, seed: "1474830" },
    onGlobalSettingsChange: noop,
    onSettingsChange: noop,
    onRun: noop,
    onReroll: noop,
    isRunning: true,
    isRunInGameRunning: false,
    isDirty: true,
    autoRunEnabled: true,
    onAutoRunEnabledChange: noop,
  },
  render: (args) => (
    <Dock>
      <AppFooter {...args} />
    </Dock>
  ),
};

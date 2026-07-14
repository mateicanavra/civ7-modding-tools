import type { Meta, StoryObj } from "@storybook/react-vite";
import type { MapSize, SelectOption, WorldSettings } from "@swooper/mapgen-studio-ui";
import { AppFooter } from "@swooper/mapgen-studio-ui";
import type { ReactNode } from "react";

/**
 * AppFooter is the World/Map console — a centered floating bar (size · players ·
 * seed · status · run). It positions `absolute bottom-4`, so it's framed in a
 * relative dark surface sized like its dock over the map. Tooltips ride the
 * ambient TooltipProvider supplied by the global Storybook decorator.
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
const seed = "1474829";

// Options + seed-range fixture args — today's exact app values (E2-A
// options-via-props + the seedPolicy inject-props; fixture values, not policy).
const mapSizeOptions: ReadonlyArray<SelectOption<MapSize>> = [
  { value: "MAPSIZE_TINY", label: "Tiny" },
  { value: "MAPSIZE_SMALL", label: "Small" },
  { value: "MAPSIZE_STANDARD", label: "Standard" },
  { value: "MAPSIZE_LARGE", label: "Large" },
  { value: "MAPSIZE_HUGE", label: "Huge" },
];
const mapSizeShortLabels: Record<string, string> = {
  MAPSIZE_TINY: "Tiny",
  MAPSIZE_SMALL: "Small",
  MAPSIZE_STANDARD: "Standard",
  MAPSIZE_LARGE: "Large",
  MAPSIZE_HUGE: "Huge",
};
const playerCountOptions: ReadonlyArray<number> = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const seedMin = 0;
const seedMax = 2147483647;

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
    lastRun: { seed, worldSettings: world },
    globalSettings: world,
    seed,
    onGlobalSettingsChange: noop,
    onSeedChange: noop,
    onRun: noop,
    onReroll: noop,
    isRunning: false,
    isRunInGameRunning: false,
    isDirty: false,
    autoRunEnabled: false,
    onAutoRunEnabledChange: noop,
    mapSizeOptions,
    mapSizeShortLabels,
    playerCountOptions,
    seedMin,
    seedMax,
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
    lastRun: { seed, worldSettings: world },
    globalSettings: world,
    seed: "1474830",
    onGlobalSettingsChange: noop,
    onSeedChange: noop,
    onRun: noop,
    onReroll: noop,
    isRunning: true,
    isRunInGameRunning: false,
    isDirty: true,
    autoRunEnabled: true,
    onAutoRunEnabledChange: noop,
    mapSizeOptions,
    mapSizeShortLabels,
    playerCountOptions,
    seedMin,
    seedMax,
  },
  render: (args) => (
    <Dock>
      <AppFooter {...args} />
    </Dock>
  ),
};

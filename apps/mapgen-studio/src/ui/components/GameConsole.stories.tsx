import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactNode } from "react";
import { GameConsole, type GameConsoleProps } from "@/ui/components/GameConsole";

/**
 * Adapted from `.design-sync/previews/GameConsole.tsx`. The live-Civ7 command
 * cluster (live status chip + autoplay / explore / Run-in-Game controls) as
 * composed into the header's Game bar. Tooltips come from the global decorator's
 * `TooltipProvider`.
 */
const meta = {
  title: "panels/GameConsole",
  component: GameConsole,
} satisfies Meta<typeof GameConsole>;

export default meta;
type Story = StoryObj<typeof meta>;

const noop = () => {};

// Shared GameConsole props common to both stories; each story differs only by
// `liveRuntime` (present vs absent) supplied in its own `args`.
const base = {
  liveGameStudioRelation: "current",
  onSyncFromLiveGame: noop,
  onToggleAutoplay: noop,
  onExplore: noop,
  operationControlsDisabled: false,
  isRunInGameRunning: false,
  runInGameStatus: null,
  runInGameCurrentRelation: "current",
  onRunInGame: noop,
  onCopyRunInGameDiagnostics: noop,
  saveDeployStatus: null,
} satisfies Omit<GameConsoleProps, "liveRuntime">;

// Preview-only centered dark bar so the floating cluster reads on its real
// substrate — not a DS export.
function Bar({ children }: { children: ReactNode }) {
  return (
    <div
      className="relative bg-background"
      style={{ padding: 16, borderRadius: 8, display: "flex", justifyContent: "center" }}
    >
      {children}
    </div>
  );
}

export const LiveReady: Story = {
  args: {
    ...base,
    // `seed` is numeric on GameConsoleLiveRuntime (the preview's string was a
    // loose mock); corrected to the real type here.
    liveRuntime: {
      status: "ok",
      turn: 42,
      seed: 1474829,
      readiness: "Civ7 ready",
      autoplayActive: false,
    },
  },
  render: (args) => (
    <Bar>
      <GameConsole {...args} />
    </Bar>
  ),
};

export const NoLiveGame: Story = {
  args: { ...base, liveRuntime: undefined },
  render: (args) => (
    <Bar>
      <GameConsole {...args} />
    </Bar>
  ),
};

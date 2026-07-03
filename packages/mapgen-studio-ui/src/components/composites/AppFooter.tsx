import { Bolt, Dices, Globe, History, Play } from "lucide-react";
import React from "react";
import { LAYOUT } from "../../lib/layout.js";
import type {
  GenerationStatus,
  MapSize,
  RecipeSettings,
  SelectOption,
  WorldSettings,
} from "../../types/index.js";
import { Button } from "../ui/button.js";
import { Input } from "../ui/input.js";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip.js";
import { OptionSelect } from "./OptionSelect.js";

// ============================================================================
// APP FOOTER — the World/Map console (Pass-5 toolbar-architecture-v2 spec)
// ============================================================================
// The footer is the WORLD/MAP zone: one centered console authoring the map
// (size · players · seed) and driving the studio iteration loop
// (status · History · reroll · auto-run · Run). The console authors exactly
// the settings the map pipeline reads — a setting the pipeline does not
// consume gets no control here (resources lives in `WorldSettings` and keeps
// flowing through runs, but has no pipeline reader yet, so no select).
// Everything that observes or commands live Civ7 lives in `GameConsole`,
// composed into the header's Game bar (top = game, bottom = world/map). The
// footer still receives the game-side in-flight booleans because its
// authoring/run controls share one operation gate across both zones
// (behavior parity).
// ============================================================================

export interface AppFooterProps {
  /** Current generation status */
  status: GenerationStatus;
  /** Settings from the last completed run */
  lastRunSettings: RecipeSettings;
  /** World settings from the last completed run */
  lastGlobalSettings: WorldSettings;
  /** Current world settings (size, players) */
  globalSettings: WorldSettings;
  /** Callback when world settings change */
  onGlobalSettingsChange: (settings: WorldSettings) => void;
  /** Current recipe settings (for seed input) */
  currentSettings: RecipeSettings;
  /** Callback when recipe settings change */
  onSettingsChange: (settings: RecipeSettings) => void;
  /** Callback to start a generation run */
  onRun: () => void;
  /** Callback to reroll (new seed + run) */
  onReroll: () => void;
  /** Whether generation is currently running */
  isRunning: boolean;
  /** Whether Civ7 Run in Game is currently running (shared operation gate) */
  isRunInGameRunning: boolean;
  /** Whether config save/deploy is currently running (shared operation gate) */
  isSaveDeployRunning?: boolean;
  /** Visible reason shown when shared operation gates disable world/map controls */
  operationBusyLabel?: string | null;
  /** Whether current settings differ from last run */
  isDirty: boolean;
  /** Toast function for notifications */
  onToast?: (message: string) => void;
  /** When enabled, config changes auto-run the current seed */
  autoRunEnabled: boolean;
  /** Toggle auto-run mode */
  onAutoRunEnabledChange: (enabled: boolean) => void;
  /**
   * Map size options for the Size select (app-owned data — E2-A
   * options-via-props; mirrors the app's `MAP_SIZE_OPTIONS` shape).
   */
  mapSizeOptions: ReadonlyArray<SelectOption<MapSize>>;
  /** Map size value → short label (mirrors the app's `MAP_SIZE_SHORT`). */
  mapSizeShortLabels: Record<string, string>;
  /** Player count options (mirrors the app's `PLAYER_COUNT_OPTIONS`). */
  playerCountOptions: ReadonlyArray<number>;
  /**
   * Seed range bounds (inclusive). REQUIRED inject-props: the Civ7 seed-range
   * policy has exactly one owner (the app's `seedPolicy`) — a package-side
   * default would create a second owner (LEDGER adjudication 2).
   */
  seedMin: number;
  seedMax: number;
}
const FOOTER_HEIGHT = LAYOUT.FOOTER_HEIGHT;
export const AppFooter: React.FC<AppFooterProps> = ({
  status,
  lastRunSettings,
  lastGlobalSettings,
  globalSettings,
  onGlobalSettingsChange,
  currentSettings,
  onSettingsChange,
  onRun,
  onReroll,
  isRunning,
  isRunInGameRunning,
  isSaveDeployRunning = false,
  operationBusyLabel,
  isDirty,
  onToast,
  autoRunEnabled,
  onAutoRunEnabledChange,
  mapSizeOptions,
  mapSizeShortLabels,
  playerCountOptions,
  seedMin,
  seedMax,
}) => {
  // Token-driven chrome; theme follows the single `.dark` class. The footer
  // docks float over the deck.gl map, so they ride the `popover` tier.
  const panelBg = "bg-popover/95";
  const panelBorder = "border-border";
  const textPrimary = "text-foreground";
  const textSecondary = "text-muted-foreground";
  const textMuted = "text-muted-foreground/70";
  const dividerColor = "bg-border";
  // Status dots report data the instrument observes (the one place real color
  // belongs in the chrome): running = amber, error = destructive, ready =
  // success. `isDirty` is chrome identity, so it uses the slate accent.
  const statusDotClass =
    status === "running"
      ? "bg-warning"
      : status === "error"
        ? "bg-destructive"
        : isDirty
          ? "bg-primary"
          : "bg-success";
  const statusText =
    status === "running"
      ? "Running"
      : status === "error"
        ? "Error"
        : isDirty
          ? "Modified"
          : "Ready";
  const displaySize = mapSizeShortLabels[lastGlobalSettings.mapSize] || lastGlobalSettings.mapSize;
  const operationControlsDisabled = isRunning || isRunInGameRunning || isSaveDeployRunning;
  const busyTitle =
    operationControlsDisabled && operationBusyLabel ? operationBusyLabel : undefined;
  const updateSetting = <K extends keyof RecipeSettings>(key: K, value: RecipeSettings[K]) => {
    onSettingsChange({
      ...currentSettings,
      [key]: value,
    });
  };
  const updateWorldSetting = <K extends keyof WorldSettings>(key: K, value: WorldSettings[K]) => {
    onGlobalSettingsChange({
      ...globalSettings,
      [key]: value,
    });
  };
  // The History affordance compresses the old inline last-run cluster: the
  // tooltip presents the run, the accessible name mirrors it (a11y + static
  // markup parity), and the click keeps the copy-seed behavior the inline
  // seed button used to carry.
  const historyLabel = `Run history — last run: seed ${lastRunSettings.seed}, ${displaySize}, ${lastGlobalSettings.playerCount} players. Click to copy seed.`;
  const handleCopySeed = async () => {
    try {
      await navigator.clipboard.writeText(lastRunSettings.seed);
      onToast?.("Seed copied to clipboard");
    } catch (err) {
      console.error("Failed to copy seed:", err);
    }
  };
  return (
    // The footer relies on the AMBIENT `TooltipProvider` (one provider policy —
    // LEDGER adjudication 6; the app shell and the package Storybook preview
    // both supply it; absence renders tooltips silently blank). Diagnostics are
    // ALSO mirrored onto the visible triggers via `aria-label`/`title`, so the
    // request id, failure reason, and live/autoplay/stale hints stay present
    // for assistive tech and for the static markup — not hidden inside
    // hover-only Tooltip content.
    <footer
      className="absolute bottom-4 left-4 right-4 z-20 flex items-center justify-center"
      style={{
        height: FOOTER_HEIGHT,
      }}
    >
      {/* World/Map console — map authoring + studio iteration loop, centered. */}

      <div
        className={`h-10 shrink-0 inline-flex items-center gap-3 px-3 rounded-lg border backdrop-blur-sm ${panelBg} ${panelBorder}`}
      >
        {/* Console identity: the map/world zone, mirroring the Game bar. */}
        <div className="flex items-center gap-1.5">
          <Globe className={`w-4 h-4 ${textMuted}`} />
          <span className={`text-label font-semibold uppercase tracking-wider ${textSecondary}`}>
            World
          </span>
        </div>

        <div className={`w-px h-5 ${dividerColor}`} />

        {/* Status indicator */}
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${statusDotClass}`} />
          <span className={`text-data font-medium ${textPrimary}`}>{statusText}</span>
          {busyTitle ? (
            <span
              className="rounded border border-warning/40 px-1.5 py-0.5 text-label text-warning"
              title={busyTitle}
            >
              Busy
            </span>
          ) : null}
        </div>

        {/* Run history — the collapsed last-run cluster. */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={handleCopySeed}
              aria-label={historyLabel}
              title={historyLabel}
            >
              <History className="w-3.5 h-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <div className="flex flex-col gap-0.5">
              <span className="text-label font-medium uppercase tracking-wider opacity-70">
                Last run
              </span>
              <span className="font-mono">{lastRunSettings.seed}</span>
              <span>
                {displaySize} · {lastGlobalSettings.playerCount}p
              </span>
              <span className="opacity-70">Click to copy seed</span>
            </div>
          </TooltipContent>
        </Tooltip>

        <div className={`w-px h-5 ${dividerColor}`} />

        {/* Map settings (Pass-5: no map settings in the top bar) */}
        <div className="flex items-center gap-2">
          <span className={`text-label font-medium uppercase tracking-wider shrink-0 ${textMuted}`}>
            Size
          </span>
          <OptionSelect
            value={globalSettings.mapSize}
            onValueChange={(value) =>
              updateWorldSetting("mapSize", value as WorldSettings["mapSize"])
            }
            options={mapSizeOptions.map((opt) => ({
              value: opt.value,
              label: opt.label,
            }))}
            ariaLabel="World size"
            disabled={operationControlsDisabled}
            className="w-24"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className={`text-label font-medium uppercase tracking-wider shrink-0 ${textMuted}`}>
            Players
          </span>
          <OptionSelect
            value={globalSettings.playerCount.toString()}
            onValueChange={(value) => updateWorldSetting("playerCount", parseInt(value, 10))}
            options={playerCountOptions.map((count) => ({
              value: count.toString(),
              label: count.toString(),
            }))}
            ariaLabel="Players"
            disabled={operationControlsDisabled}
            className="w-14"
          />
        </div>

        <div className={`w-px h-5 ${dividerColor}`} />

        {/* Seed input */}
        <span className={`text-label font-medium uppercase tracking-wider ${textMuted}`}>Seed</span>
        <Tooltip>
          <TooltipTrigger asChild>
            <Input
              type="text"
              value={currentSettings.seed}
              onChange={(e) => updateSetting("seed", e.target.value)}
              placeholder="Seed"
              inputMode="numeric"
              pattern="[0-9]*"
              min={seedMin}
              max={seedMax}
              aria-label={`Generation seed (${seedMin}-${seedMax})`}
              disabled={operationControlsDisabled}
              title={busyTitle}
              className="w-20 font-mono"
            />
          </TooltipTrigger>
          <TooltipContent>{`Generation seed (${seedMin}-${seedMax})`}</TooltipContent>
        </Tooltip>

        {/* Reroll button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={onReroll}
              disabled={operationControlsDisabled}
              aria-label={busyTitle ?? "Re-roll: New seed and run"}
              title={busyTitle}
            >
              <Dices className="w-3.5 h-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Re-roll: New seed and run</TooltipContent>
        </Tooltip>

        {/* Auto-run toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={() => onAutoRunEnabledChange(!autoRunEnabled)}
              disabled={operationControlsDisabled}
              aria-pressed={autoRunEnabled}
              aria-label={busyTitle ?? "Toggle auto-run: run current seed on config changes"}
              title={busyTitle}
              className={
                autoRunEnabled ? "ring-1 ring-ring border-primary text-primary" : undefined
              }
            >
              <Bolt className="w-3.5 h-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Auto-run: run current seed on config changes</TooltipContent>
        </Tooltip>

        {/* Run button — the one filled action; dirty emphasis is the slate accent */}
        <Button
          onClick={onRun}
          disabled={operationControlsDisabled}
          aria-label={busyTitle ?? "Run current map generation"}
          title={busyTitle}
          className={`
            ${isDirty ? "ring-1 ring-ring border-primary" : ""}
            ${isRunning ? "opacity-70 cursor-wait" : ""}
          `}
        >
          <Play className="w-3 h-3" />
          <span>{isRunning ? "Running..." : "Run"}</span>
        </Button>
      </div>
    </footer>
  );
};

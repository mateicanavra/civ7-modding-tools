import React from "react";
import { Gamepad2, Settings } from "lucide-react";
import { AppBrand } from "./AppBrand";
import { ViewControls } from "./ViewControls";
import { OptionSelect } from "./OptionSelect";
import { Button, Tooltip, TooltipContent, TooltipTrigger } from "../../components/ui";
import {
  getLocalPlayerSetup,
  updateStudioSetupGameOption,
  updateStudioSetupPlayerOption,
  type Civ7StudioSetupConfig,
} from "../../features/civ7Setup/setupConfig";
import type { ThemePreference } from "../types";

/**
 * Sentinel selector value for the drifted state: the authored game setup no
 * longer equals the selected saved config's file, so the launch would be a
 * custom configuration. Not a selectable target — choosing a real config
 * re-applies that file.
 */
const CUSTOM_SETUP_VALUE = "__custom-setup__";

export interface AppHeaderProps {
  themePreference: ThemePreference;
  onThemeCycle: () => void;
  showGrid: boolean;
  onShowGridChange: (show: boolean) => void;
  setupConfig: Civ7StudioSetupConfig;
  setupOptions: {
    savedConfigOptions: ReadonlyArray<{ value: string; label: string }>;
    leaderOptions: ReadonlyArray<{ value: string; label: string }>;
    civilizationOptions: ReadonlyArray<{ value: string; label: string }>;
    difficultyOptions: ReadonlyArray<{ value: string; label: string }>;
    gameSpeedOptions: ReadonlyArray<{ value: string; label: string }>;
  };
  onSetupConfigChange: (config: Civ7StudioSetupConfig) => void;
  onSavedConfigChange: (configId: string) => void;
  /**
   * Config precedence: true when the authored setup state no longer equals
   * the selected saved config's file-derived state (any dropdown edit, live
   * sync, or stray persisted key counts — what would launch is no longer the
   * file). The selector then shows "Custom" in warning orange; the companion
   * re-apply affordance restores the file exactly.
   */
  savedConfigModified?: boolean;
  onHeaderHeightChange?: (height: number) => void;
  /**
   * The live-game command cluster (Pass-5 zoning v2: top = Game, bottom =
   * World/Map). Composed INLINE into the Game bar row, after the Config
   * cluster (selector + setup gear, Z-wave Game bar v3).
   */
  gameConsole?: React.ReactNode;
}
export const AppHeader: React.FC<AppHeaderProps> = ({
  themePreference,
  onThemeCycle,
  showGrid,
  onShowGridChange,
  setupConfig,
  setupOptions,
  savedConfigModified = false,
  onSetupConfigChange,
  onSavedConfigChange,
  onHeaderHeightChange,
  gameConsole,
}) => {
  const headerRef = React.useRef<HTMLElement | null>(null);
  const [setupOpen, setSetupOpen] = React.useState(false);
  // Token-driven chrome; theme follows the single `.dark` class. The header
  // docks float over the deck.gl map, so they ride the `popover` tier.
  const panelBg = "bg-popover/95";
  const panelBorder = "border-border";
  const textSecondary = "text-muted-foreground";
  const textMuted = "text-muted-foreground/70";
  const dividerColor = "bg-border";
  const localPlayerSetup = getLocalPlayerSetup(setupConfig);
  const updateLeader = (value: string) => {
    onSetupConfigChange(
      updateStudioSetupPlayerOption(setupConfig, "PlayerLeader", value || undefined)
    );
  };
  const updateCivilization = (value: string) => {
    onSetupConfigChange(
      updateStudioSetupPlayerOption(setupConfig, "PlayerCivilization", value || undefined)
    );
  };
  const updateDifficulty = (value: string) => {
    const nextGame = updateStudioSetupGameOption(setupConfig, "Difficulty", value || undefined);
    onSetupConfigChange(
      updateStudioSetupPlayerOption(nextGame, "PlayerDifficulty", value || undefined)
    );
  };
  const updateGameSpeed = (value: string) => {
    onSetupConfigChange(updateStudioSetupGameOption(setupConfig, "GameSpeeds", value || undefined));
  };
  React.useEffect(() => {
    const element = headerRef.current;
    if (!element || !onHeaderHeightChange) return;
    const reportHeight = () => {
      onHeaderHeightChange(Math.ceil(element.getBoundingClientRect().height));
    };
    reportHeight();
    const resizeObserver = new ResizeObserver(reportHeight);
    resizeObserver.observe(element);
    window.addEventListener("resize", reportHeight);
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", reportHeight);
    };
  }, [onHeaderHeightChange]);
  return (
    <header
      ref={headerRef}
      className="absolute top-4 left-4 right-4 z-20 grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3"
    >
      {/* Left: App Brand */}
      <div className="shrink-0">
        <AppBrand />
      </div>

      {/* Center: the Game bar — config selector, live command cluster, and
          the trailing game-setup disclosure. Map/world settings live in the
          footer's World/Map console (Pass-5 zoning v2). `@container` lets the
          status chip drop its seed suffix when this column narrows. */}
      <div className="@container min-w-0 flex flex-col items-center gap-2 overflow-visible">
        <div
          className={`flex min-h-10 max-w-full flex-wrap items-center justify-center gap-x-3 gap-y-2 px-3 py-1.5 rounded-lg border backdrop-blur-sm ${panelBg} ${panelBorder}`}
        >
          <div className="flex items-center gap-1.5">
            <Gamepad2 className={`w-4 h-4 ${textMuted}`} />
            <span className={`text-label font-semibold uppercase tracking-wider ${textSecondary}`}>
              Game
            </span>
          </div>

          <div className={`w-px h-5 shrink-0 ${dividerColor}`} />

          <div className="flex items-center gap-2">
            <span
              className={`text-label font-medium uppercase tracking-wider shrink-0 ${textMuted}`}
            >
              Config
            </span>
            {/* Config-precedence display: while the setup state matches the
                selected file the selector names it; once it drifts the
                selector itself says "Custom" (the launch is no longer the
                file). Picking the config again re-applies the file exactly. */}
            <OptionSelect
              value={savedConfigModified ? CUSTOM_SETUP_VALUE : (setupConfig.savedConfig?.id ?? "")}
              onValueChange={(value) => {
                if (value !== CUSTOM_SETUP_VALUE) onSavedConfigChange(value);
              }}
              options={
                savedConfigModified
                  ? [
                      { value: CUSTOM_SETUP_VALUE, label: "Custom" },
                      ...setupOptions.savedConfigOptions,
                    ]
                  : setupOptions.savedConfigOptions
              }
              ariaLabel="Saved config"
              className={`w-44 max-w-[34vw] ${savedConfigModified ? "border-warning text-warning ring-1 ring-warning/40" : ""}`}
            />
            {savedConfigModified && setupConfig.savedConfig ? (
              <button
                type="button"
                onClick={() => onSavedConfigChange(setupConfig.savedConfig!.id)}
                aria-label={`Game setup is Custom (drifted from ${setupConfig.savedConfig.displayName}) — click to re-apply the saved config`}
                title={`Game setup is Custom (drifted from ${setupConfig.savedConfig.displayName}) — click to re-apply the saved config`}
                className="shrink-0 rounded border border-warning/40 px-1.5 py-0.5 text-label text-warning cursor-pointer transition-colors hover:bg-warning/10"
              >
                Re-apply
              </button>
            ) : null}
            {/* Game-setup disclosure: the gear rides the config cluster (the
                setup it opens is what drifts a saved config), icon-only per
                the console contract. */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  aria-expanded={setupOpen}
                  aria-controls="app-header-setup-panel"
                  aria-label="Game setup"
                  title="Game setup"
                  onClick={() => setSetupOpen((open) => !open)}
                  className={`shrink-0 ${setupOpen ? "ring-1 ring-ring border-primary text-primary" : ""}`}
                >
                  <Settings className="w-3.5 h-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Game setup</TooltipContent>
            </Tooltip>
          </div>

          {gameConsole ? (
            <>
              <div className={`w-px h-5 shrink-0 ${dividerColor}`} />
              {gameConsole}
            </>
          ) : null}
        </div>

        {setupOpen ? (
          <div
            id="app-header-setup-panel"
            className={`flex min-h-10 max-w-full flex-wrap items-center justify-center gap-x-3 gap-y-2 px-3 py-1.5 rounded-lg border backdrop-blur-sm ${panelBg} ${panelBorder}`}
          >
            <div className="flex items-center gap-2">
              <span
                className={`text-label font-medium uppercase tracking-wider shrink-0 ${textMuted}`}
              >
                Leader
              </span>
              <OptionSelect
                value={String(localPlayerSetup.options.PlayerLeader ?? "")}
                onValueChange={(value) => updateLeader(value)}
                options={setupOptions.leaderOptions}
                ariaLabel="Leader"
                className="w-32"
              />
            </div>

            <div className={`w-px h-5 shrink-0 ${dividerColor}`} />

            <div className="flex items-center gap-2">
              <span
                className={`text-label font-medium uppercase tracking-wider shrink-0 ${textMuted}`}
              >
                Civ
              </span>
              <OptionSelect
                value={String(localPlayerSetup.options.PlayerCivilization ?? "")}
                onValueChange={(value) => updateCivilization(value)}
                options={setupOptions.civilizationOptions}
                ariaLabel="Civilization"
                className="w-32"
              />
            </div>

            <div className={`w-px h-5 shrink-0 ${dividerColor}`} />

            <div className="flex items-center gap-2">
              <span
                className={`text-label font-medium uppercase tracking-wider shrink-0 ${textMuted}`}
              >
                Difficulty
              </span>
              <OptionSelect
                value={String(
                  setupConfig.gameOptions.Difficulty ??
                    localPlayerSetup.options.PlayerDifficulty ??
                    ""
                )}
                onValueChange={(value) => updateDifficulty(value)}
                options={setupOptions.difficultyOptions}
                ariaLabel="Difficulty"
                className="w-28"
              />
            </div>

            <div className={`w-px h-5 shrink-0 ${dividerColor}`} />

            <div className="flex items-center gap-2">
              <span
                className={`text-label font-medium uppercase tracking-wider shrink-0 ${textMuted}`}
              >
                Speed
              </span>
              <OptionSelect
                value={String(setupConfig.gameOptions.GameSpeeds ?? "")}
                onValueChange={(value) => updateGameSpeed(value)}
                options={setupOptions.gameSpeedOptions}
                ariaLabel="Game speed"
                className="w-28"
              />
            </div>
          </div>
        ) : null}
      </div>

      {/* Right: View Controls */}
      <div className="shrink-0">
        <ViewControls
          themePreference={themePreference}
          onThemeCycle={onThemeCycle}
          showGrid={showGrid}
          onShowGridChange={onShowGridChange}
        />
      </div>
    </header>
  );
};

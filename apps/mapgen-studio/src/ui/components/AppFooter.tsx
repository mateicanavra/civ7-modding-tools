import React from 'react';
import { Bolt, Clock, Dices, Play } from 'lucide-react';
import { Button, Input, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../components/ui';
import { MAP_SIZE_SHORT, LAYOUT } from '../constants';
import { formatResourceMode } from '../utils';
import type { RecipeSettings, WorldSettings, GenerationStatus } from '../types';
import { CIV7_STUDIO_SEED_MAX, CIV7_STUDIO_SEED_MIN } from '../../features/civ7Setup/seedPolicy';

// ============================================================================
// APP FOOTER — the studio console (Pass-4 game-console-dock spec)
// ============================================================================
// The footer is the STUDIO zone: one centered console carrying studio-runtime
// status and run controls (status · last run · seed · reroll · auto-run ·
// Run). Everything that observes or commands live Civ7 lives in `GameConsole`,
// docked beneath the world bar in the header (top = game, bottom = studio).
// The footer still receives the game-side in-flight booleans because seed/
// reroll/run share one operation gate across both zones (behavior parity).
// ============================================================================

export interface AppFooterProps {
  /** Current generation status */
  status: GenerationStatus;
  /** Settings from the last completed run */
  lastRunSettings: RecipeSettings;
  /** World settings from the last completed run */
  lastGlobalSettings: WorldSettings;
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
  /** Whether current settings differ from last run */
  isDirty: boolean;
  /** Toast function for notifications */
  onToast?: (message: string) => void;
  /** When enabled, config changes auto-run the current seed */
  autoRunEnabled: boolean;
  /** Toggle auto-run mode */
  onAutoRunEnabledChange: (enabled: boolean) => void;
}
export const FOOTER_HEIGHT = LAYOUT.FOOTER_HEIGHT;
export const AppFooter: React.FC<AppFooterProps> = ({
  status,
  lastRunSettings,
  lastGlobalSettings,
  currentSettings,
  onSettingsChange,
  onRun,
  onReroll,
  isRunning,
  isRunInGameRunning,
  isSaveDeployRunning = false,
  isDirty,
  onToast,
  autoRunEnabled,
  onAutoRunEnabledChange
}) => {
  // Token-driven chrome; theme follows the single `.dark` class. The footer
  // docks float over the deck.gl map, so they ride the `popover` tier.
  const panelBg = 'bg-popover/95';
  const panelBorder = 'border-border';
  const textPrimary = 'text-foreground';
  const textSecondary = 'text-muted-foreground';
  const textMuted = 'text-muted-foreground/70';
  const dividerColor = 'bg-border';
  // Status dots report data the instrument observes (the one place real color
  // belongs in the chrome): running = amber, error = destructive, ready =
  // success. `isDirty` is chrome identity, so it uses the slate accent.
  const statusDotClass =
  status === 'running' ?
  'bg-warning' :
  status === 'error' ?
  'bg-destructive' :
  isDirty ?
  'bg-primary' :
  'bg-success';
  const statusText =
  status === 'running' ?
  'Running' :
  status === 'error' ?
  'Error' :
  isDirty ?
  'Modified' :
  'Ready';
  const displaySize =
  MAP_SIZE_SHORT[lastGlobalSettings.mapSize] || lastGlobalSettings.mapSize;
  const displayResources = formatResourceMode(lastGlobalSettings.resources);
  const operationControlsDisabled = isRunning || isRunInGameRunning || isSaveDeployRunning;
  const updateSetting = <K extends keyof RecipeSettings,>(
  key: K,
  value: RecipeSettings[K]) =>
  {
    onSettingsChange({
      ...currentSettings,
      [key]: value
    });
  };
  const handleCopySeed = async () => {
    try {
      await navigator.clipboard.writeText(lastRunSettings.seed);
      onToast?.('Seed copied to clipboard');
    } catch (err) {
      console.error('Failed to copy seed:', err);
    }
  };
  return (
    // The footer carries its own `TooltipProvider` so its diagnostic hints work
    // whether or not an ancestor provides one (the shell does; the static-markup
    // parity tests mount the footer bare). Diagnostics are ALSO mirrored onto the
    // visible triggers via `aria-label`/`title`, so the request id, failure
    // reason, and live/autoplay/stale hints stay present for assistive tech and
    // for the static markup — not hidden inside hover-only Tooltip content.
    <TooltipProvider>
    <footer
      className="absolute bottom-4 left-4 right-4 z-20 flex items-center justify-center"
      style={{
        height: FOOTER_HEIGHT
      }}>

      {/* Studio console — studio-runtime status + run controls, centered. */}

      <div
        className={`h-10 shrink-0 inline-flex items-center gap-3 px-3 rounded-lg border backdrop-blur-sm ${panelBg} ${panelBorder}`}>

        {/* Status indicator */}
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${statusDotClass}`} />
          <span className={`text-data font-medium ${textPrimary}`}>
            {statusText}
          </span>
        </div>

        <div className={`w-px h-5 ${dividerColor}`} />

        {/* Last Run label */}
        <div className="flex items-center gap-1.5">
          <Clock className={`w-3.5 h-3.5 ${textMuted}`} />
          <span
            className={`text-label font-medium uppercase tracking-wider ${textSecondary}`}>

            Last
          </span>
        </div>

        {/* Last run info */}
        <div className="flex items-center gap-2 text-data">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleCopySeed}
                className={`font-mono ${textPrimary} hover:text-primary hover:underline transition-colors cursor-pointer`}>

                {lastRunSettings.seed}
              </button>
            </TooltipTrigger>
            <TooltipContent>Click to copy seed</TooltipContent>
          </Tooltip>
          <span className={textMuted}>·</span>
          <span className={textPrimary}>{displaySize}</span>
          <span className={textMuted}>·</span>
          <span className={textPrimary}>{lastGlobalSettings.playerCount}p</span>
          <span className={textMuted}>·</span>
          <span className={textPrimary}>{displayResources}</span>
        </div>

        <div className={`w-px h-5 ${dividerColor}`} />

        {/* Seed input */}
        <span
          className={`text-label font-medium uppercase tracking-wider ${textMuted}`}>

          Seed
        </span>
        <Tooltip>
          <TooltipTrigger asChild>
            <Input
              type="text"
              value={currentSettings.seed}
              onChange={(e) => updateSetting('seed', e.target.value)}
              placeholder="Seed"
              inputMode="numeric"
              pattern="[0-9]*"
              min={CIV7_STUDIO_SEED_MIN}
              max={CIV7_STUDIO_SEED_MAX}
              aria-label={`Generation seed (${CIV7_STUDIO_SEED_MIN}-${CIV7_STUDIO_SEED_MAX})`}
              disabled={operationControlsDisabled}
              className="w-20 font-mono" />
          </TooltipTrigger>
          <TooltipContent>{`Generation seed (${CIV7_STUDIO_SEED_MIN}-${CIV7_STUDIO_SEED_MAX})`}</TooltipContent>
        </Tooltip>

        {/* Reroll button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={onReroll}
              disabled={operationControlsDisabled}
              aria-label="Re-roll: New seed and run">

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
              aria-label="Toggle auto-run: run current seed on config changes"
              className={autoRunEnabled ? "ring-1 ring-ring border-primary text-primary" : undefined}>

              <Bolt className="w-3.5 h-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Auto-run: run current seed on config changes</TooltipContent>
        </Tooltip>

        {/* Run button — the one filled action; dirty emphasis is the slate accent */}
        <Button
          onClick={onRun}
          disabled={operationControlsDisabled}
          className={`
            ${isDirty ? 'ring-1 ring-ring border-primary' : ''}
            ${isRunning ? 'opacity-70 cursor-wait' : ''}
          `}>

          <Play className="w-3 h-3" />
          <span>{isRunning ? 'Running...' : 'Run'}</span>
        </Button>
      </div>
    </footer>
    </TooltipProvider>);

};

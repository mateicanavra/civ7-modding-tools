import React from 'react';
import { Bolt, Bot, Clipboard, Clock, Dices, MonitorPlay, Play, Radio, RotateCw, Square } from 'lucide-react';
import { Button, Input, Tooltip, TooltipContent, TooltipTrigger } from '../../components/ui';
import { MAP_SIZE_SHORT, LAYOUT } from '../constants';
import { formatResourceMode } from '../utils';
import type { RecipeSettings, WorldSettings, GenerationStatus } from '../types';
import {
  formatRunInGamePhaseLabel,
  runInGamePrimaryActionLabel,
  runInGameCanRetryStatus,
  type RunInGameOperationStatus,
} from '../../features/runInGame/status';
import type { RunInGameCurrentRelation } from '../../features/runInGame/clientState';
import { CIV7_STUDIO_SEED_MAX, CIV7_STUDIO_SEED_MIN } from '../../features/civ7Setup/seedPolicy';
import {
  formatMapConfigSaveDeployPhaseLabel,
  type MapConfigSaveDeployStatus,
} from '../../features/mapConfigSave/status';
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
  /** Callback to launch the current map config in Civ7 */
  onRunInGame: () => void;
  /** Callback to refresh the current Civ7 Run in Game operation status */
  onRunInGameRetryStatus?: () => void;
  /** Callback to copy current Civ7 Run in Game diagnostics */
  onCopyRunInGameDiagnostics?: () => void;
  /** Callback to reroll (new seed + run) */
  onReroll: () => void;
  /** Whether generation is currently running */
  isRunning: boolean;
  /** Whether Civ7 Run in Game is currently running */
  isRunInGameRunning: boolean;
  /** Whether config save/deploy is currently running */
  isSaveDeployRunning?: boolean;
  /** Current config save/deploy status */
  saveDeployStatus?: MapConfigSaveDeployStatus | null;
  /** Request-correlated Civ7 Run in Game status */
  runInGameStatus?: RunInGameOperationStatus | null;
  /** Whether the recorded operation matches the current authored Studio state */
  runInGameCurrentRelation?: RunInGameCurrentRelation;
  /** Whether current settings differ from last run */
  isDirty: boolean;
  /** Light mode flag for styling */
  lightMode: boolean;
  /** Read-only live Civ7 runtime status */
  liveRuntime?: {
    status: "idle" | "ok" | "error";
    turn?: number;
    seed?: number;
    readiness?: string;
    autoplayActive?: boolean;
    autoplayPaused?: boolean;
    updatedAt?: string;
    error?: string;
  };
  /** Whether the current Studio config/seed matches the proved live game source. */
  liveGameStudioRelation?: "current" | "stale" | "unknown";
  /** Callback to apply a visible live-runtime or proved-run suggestion back into Studio. */
  onSyncFromLiveGame?: () => void;
  /** Whether a Civ7 autoplay start/stop request is in flight */
  isAutoplayActionRunning?: boolean;
  /** Callback to start or stop Civ7 native autoplay */
  onToggleAutoplay?: () => void;
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
  onRunInGame,
  onRunInGameRetryStatus,
  onCopyRunInGameDiagnostics,
  onReroll,
  isRunning,
  isRunInGameRunning,
  isSaveDeployRunning = false,
  saveDeployStatus,
  runInGameStatus,
  runInGameCurrentRelation = "unknown",
  isDirty,
  liveRuntime,
  liveGameStudioRelation = "unknown",
  onSyncFromLiveGame,
  isAutoplayActionRunning = false,
  onToggleAutoplay,
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
  const liveDotClass =
    liveRuntime?.status === "ok" ? "bg-success" : liveRuntime?.status === "error" ? "bg-destructive" : "bg-muted-foreground";
  const liveText =
    liveRuntime?.status === "ok"
      ? liveRuntime.turn !== undefined || liveRuntime.seed !== undefined
        ? `Turn ${liveRuntime.turn ?? "?"} · Seed ${liveRuntime.seed ?? "?"}`
        : liveRuntime.readiness ?? "Civ7 ready"
      : liveRuntime?.status === "error"
        ? liveRuntime.error ?? "Live unavailable"
        : "Live idle";
  const runInGamePhaseLabel = runInGameStatus ? formatRunInGamePhaseLabel(runInGameStatus.phase) : "Run in Game";
  const runInGameStateLabel =
    runInGameStatus && !isRunInGameRunning
      ? runInGameCurrentRelation === "stale"
        ? "Stale"
        : runInGameCurrentRelation === "current"
          ? "Current"
          : "Previous"
      : null;
  const runInGameDotClass =
    runInGameCurrentRelation === "stale"
      ? "bg-warning"
      : runInGameStatus?.status === "complete"
      ? "bg-success"
      : runInGameStatus?.status === "failed" || runInGameStatus?.status === "blocked" || runInGameStatus?.status === "uncertain"
        ? "bg-destructive"
        : isRunInGameRunning
          ? "bg-warning"
          : "bg-muted-foreground";
  const runInGameButtonText = runInGamePrimaryActionLabel(runInGameStatus, runInGameCurrentRelation);
  const operationControlsDisabled = isRunning || isRunInGameRunning || isSaveDeployRunning;
  const liveSyncAvailable =
    liveRuntime?.status === "ok" &&
    liveGameStudioRelation === "stale" &&
    Boolean(onSyncFromLiveGame) &&
    !operationControlsDisabled;
  const liveSyncTitle = liveSyncAvailable
    ? "Apply live game suggestion to Studio"
    : liveRuntime?.readiness ?? liveRuntime?.error ?? "Civ7 live runtime status";
  const autoplayControlDisabled = operationControlsDisabled || isAutoplayActionRunning || liveRuntime?.status !== "ok" || !onToggleAutoplay;
  const autoplayButtonText = isAutoplayActionRunning
    ? "Autoplay..."
    : liveRuntime?.autoplayActive
      ? "Stop Auto"
      : "Start Auto";
  const autoplayTitle = liveRuntime?.autoplayActive
    ? `Stop Civ7 autoplay${liveRuntime.autoplayPaused ? " (paused)" : ""}`
    : "Start Civ7 autoplay";
  const saveDeployLabel = saveDeployStatus ? formatMapConfigSaveDeployPhaseLabel(saveDeployStatus.phase) : null;
  const saveDeployTitle = saveDeployStatus
    ? [
        `Save/Deploy: ${saveDeployLabel}`,
        saveDeployStatus.requestId ? `Request: ${saveDeployStatus.requestId}` : null,
        saveDeployStatus.path ? `Path: ${saveDeployStatus.path}` : null,
        saveDeployStatus.error ? `Error: ${saveDeployStatus.error}` : null,
      ].filter(Boolean).join("\n")
    : "Config save/deploy status";
  const runInGameTitle = [
    runInGameStatus ? `Run in Game: ${runInGamePhaseLabel}` : "Run in Game: launch current config in Civ7",
    runInGameStatus?.requestId ? `Request: ${runInGameStatus.requestId}` : null,
    runInGameStatus?.materialization?.mapScript ? `Map: ${runInGameStatus.materialization.mapScript}` : null,
    runInGameStateLabel ? `Studio state: ${runInGameStateLabel}` : null,
    runInGameStatus?.error ? `Error: ${runInGameStatus.error}` : null,
    runInGameStatus?.details?.recoveryHint ? `Recovery: ${runInGameStatus.details.recoveryHint}` : null,
  ].filter(Boolean).join("\n");
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
    <footer
      className="absolute bottom-4 left-4 right-4 z-20 flex items-center justify-center gap-2"
      style={{
        height: FOOTER_HEIGHT
      }}>

      {/* Status Panel */}
      <div
        className={`h-10 inline-flex items-center gap-3 px-3 rounded-lg border backdrop-blur-sm ${panelBg} ${panelBorder}`}>

        {/* Status indicator */}
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${statusDotClass}`} />
          <span className={`text-[11px] font-medium ${textPrimary}`}>
            {statusText}
          </span>
        </div>

        <div className={`w-px h-5 ${dividerColor}`} />

        {/* Last Run label */}
        <div className="flex items-center gap-1.5">
          <Clock className={`w-3.5 h-3.5 ${textMuted}`} />
          <span
            className={`text-[10px] font-medium uppercase tracking-wider ${textSecondary}`}>

            Last
          </span>
        </div>

        <div className={`w-px h-5 ${dividerColor}`} />

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
      </div>

      {/* Live Civ7 Panel. The "stale vs live game" emphasis is a warning about
          data, so it uses the `warning` token (not the slate identity accent). */}
      <div
        className={`h-10 inline-flex min-w-0 max-w-[420px] items-center gap-2 px-3 rounded-lg border backdrop-blur-sm ${panelBg} ${panelBorder}`}>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={onSyncFromLiveGame}
              disabled={!liveSyncAvailable}
              className={`inline-flex h-7 min-w-0 items-center gap-2 rounded border px-2 transition-colors ${
                liveGameStudioRelation === "stale"
                  ? "border-warning text-warning ring-1 ring-warning/40"
                  : "border-transparent"
              } ${liveSyncAvailable ? "cursor-pointer hover:bg-warning/10" : "cursor-default disabled:opacity-100"}`}>

              <Radio className={`w-3.5 h-3.5 ${liveGameStudioRelation === "stale" ? "text-warning" : textMuted}`} />
              <div className={`w-2 h-2 shrink-0 rounded-full ${liveDotClass}`} />
              <span className={`truncate text-data font-medium ${liveGameStudioRelation === "stale" ? "text-warning" : textPrimary}`}>
                {liveText}
              </span>
              {liveRuntime?.autoplayActive ? (
                <span className="shrink-0 rounded border border-warning/40 px-1.5 py-0.5 text-label text-warning">
                  Auto
                </span>
              ) : null}
            </button>
          </TooltipTrigger>
          <TooltipContent>{liveSyncTitle}</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              onClick={onToggleAutoplay}
              disabled={autoplayControlDisabled}
              className={`h-7 px-2 ${liveRuntime?.autoplayActive ? "border-warning/60 text-warning" : ""}`}>

              {liveRuntime?.autoplayActive ? <Square className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              <span>{autoplayButtonText}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>{autoplayTitle}</TooltipContent>
        </Tooltip>
      </div>

      {/* Run Controls Panel */}
      <div
        className={`h-10 inline-flex items-center gap-2 px-3 rounded-lg border backdrop-blur-sm ${panelBg} ${panelBorder}`}>

        {/* Seed input */}
        <span
          className={`text-[10px] font-medium uppercase tracking-wider ${textMuted}`}>

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

        {/* Run in Game button */}
        {saveDeployStatus && saveDeployStatus.status !== "complete" ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className={`hidden max-w-[150px] items-center gap-1.5 overflow-hidden text-data font-medium ${textPrimary} lg:inline-flex`}>

                <div className={`h-2 w-2 shrink-0 rounded-full ${saveDeployStatus.status === "failed" ? "bg-destructive" : "bg-warning"}`} />
                <span className="truncate">{saveDeployLabel}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent className="whitespace-pre-line">{saveDeployTitle}</TooltipContent>
          </Tooltip>
        ) : null}
        {runInGameStatus ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className={`hidden max-w-[180px] items-center gap-1.5 overflow-hidden text-data font-medium ${textPrimary} lg:inline-flex`}>

                <div className={`h-2 w-2 shrink-0 rounded-full ${runInGameDotClass}`} />
                <span className="truncate">{runInGamePhaseLabel}</span>
                {runInGameStateLabel ? (
                  <span className={`shrink-0 rounded border px-1 py-0.5 text-label ${runInGameCurrentRelation === "stale" ? "border-warning/40 text-warning" : "border-border text-muted-foreground"}`}>
                    {runInGameStateLabel}
                  </span>
                ) : null}
              </div>
            </TooltipTrigger>
            <TooltipContent className="whitespace-pre-line">{runInGameTitle}</TooltipContent>
          </Tooltip>
        ) : null}
        {runInGameStatus && onRunInGameRetryStatus && runInGameCanRetryStatus(runInGameStatus) ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={onRunInGameRetryStatus}
                aria-label="Refresh Run in Game status">

                <RotateCw className="w-3.5 h-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Refresh Run in Game status</TooltipContent>
          </Tooltip>
        ) : null}
        {runInGameStatus && onCopyRunInGameDiagnostics ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={onCopyRunInGameDiagnostics}
                aria-label="Copy Run in Game diagnostics">

                <Clipboard className="w-3.5 h-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Copy Run in Game diagnostics</TooltipContent>
          </Tooltip>
        ) : null}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={onRunInGame}
              disabled={operationControlsDisabled}
              variant="outline"
              className={isRunInGameRunning ? 'opacity-70 cursor-wait' : undefined}>

              <MonitorPlay className="w-3.5 h-3.5" />
              <span>{runInGameButtonText}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent className="whitespace-pre-line">{runInGameTitle}</TooltipContent>
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
    </footer>);

};

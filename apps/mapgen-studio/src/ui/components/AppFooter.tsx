import React from 'react';
import { Bolt, Clipboard, Clock, Dices, MonitorPlay, Play, Radio, RotateCw } from 'lucide-react';
import { Button, Input } from './ui';
import { MAP_SIZE_SHORT, LAYOUT } from '../constants';
import { formatResourceMode } from '../utils';
import type { RecipeSettings, WorldSettings, GenerationStatus } from '../types';
import {
  formatRunInGamePhaseLabel,
  runInGameCanRetryStatus,
  type RunInGameOperationStatus,
} from '../../features/runInGame/status';
import type { RunInGameCurrentRelation } from '../../features/runInGame/clientState';
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
    updatedAt?: string;
    error?: string;
  };
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
  runInGameStatus,
  runInGameCurrentRelation = "unknown",
  isDirty,
  lightMode,
  liveRuntime,
  onToast,
  autoRunEnabled,
  onAutoRunEnabledChange
}) => {
  const panelBg = lightMode ? 'bg-white/95' : 'bg-[#141418]/95';
  const panelBorder = lightMode ? 'border-gray-200' : 'border-[#2a2a32]';
  const textPrimary = lightMode ? 'text-[#1f2937]' : 'text-[#e8e8ed]';
  const textSecondary = lightMode ? 'text-[#6b7280]' : 'text-[#8a8a96]';
  const textMuted = lightMode ? 'text-[#9ca3af]' : 'text-[#5a5a66]';
  const dividerColor = lightMode ? 'bg-gray-200' : 'bg-[#2a2a32]';
  const statusDotClass =
  status === 'running' ?
  'bg-amber-400' :
  status === 'error' ?
  'bg-red-400' :
  isDirty ?
  'bg-orange-400' :
  'bg-emerald-400';
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
    liveRuntime?.status === "ok" ? "bg-emerald-400" : liveRuntime?.status === "error" ? "bg-red-400" : "bg-gray-400";
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
      ? "bg-orange-400"
      : runInGameStatus?.status === "complete"
      ? "bg-emerald-400"
      : runInGameStatus?.status === "failed" || runInGameStatus?.status === "blocked" || runInGameStatus?.status === "uncertain"
        ? "bg-red-400"
        : isRunInGameRunning
          ? "bg-amber-400"
          : "bg-gray-400";
  const runInGameButtonText = isRunInGameRunning
    ? runInGamePhaseLabel
    : runInGameStatus?.status === "failed" || runInGameStatus?.status === "blocked" || runInGameStatus?.status === "uncertain"
      ? "Retry Run"
      : "Run in Game";
  const runInGameTitle = [
    runInGameStatus ? `Run in Game: ${runInGamePhaseLabel}` : "Run in Game: launch current config in Civ7",
    runInGameStatus?.requestId ? `Request: ${runInGameStatus.requestId}` : null,
    runInGameStatus?.materialization?.mapScript ? `Map: ${runInGameStatus.materialization.mapScript}` : null,
    runInGameStateLabel ? `Studio state: ${runInGameStateLabel}` : null,
    runInGameStatus?.error ? `Error: ${runInGameStatus.error}` : null,
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
        <div className="flex items-center gap-2 text-[11px]">
          <button
            onClick={handleCopySeed}
            title="Click to copy seed"
            className={`font-mono ${textPrimary} hover:text-orange-500 hover:underline transition-colors cursor-pointer`}>

            {lastRunSettings.seed}
          </button>
          <span className={textMuted}>·</span>
          <span className={textPrimary}>{displaySize}</span>
          <span className={textMuted}>·</span>
          <span className={textPrimary}>{lastGlobalSettings.playerCount}p</span>
          <span className={textMuted}>·</span>
          <span className={textPrimary}>{displayResources}</span>
        </div>
      </div>

      {/* Live Civ7 Panel */}
      <div
        className={`h-10 inline-flex min-w-0 max-w-[300px] items-center gap-2 px-3 rounded-lg border backdrop-blur-sm ${panelBg} ${panelBorder}`}
        title={liveRuntime?.readiness ?? liveRuntime?.error ?? "Civ7 live runtime status"}>

        <Radio className={`w-3.5 h-3.5 ${textMuted}`} />
        <div className={`w-2 h-2 shrink-0 rounded-full ${liveDotClass}`} />
        <span className={`truncate text-[11px] font-medium ${textPrimary}`}>
          {liveText}
        </span>
        {liveRuntime?.autoplayActive ? (
          <span className="shrink-0 rounded border border-amber-400/40 px-1.5 py-0.5 text-[10px] text-amber-500">
            Auto
          </span>
        ) : null}
      </div>

      {/* Run Controls Panel */}
      <div
        className={`h-10 inline-flex items-center gap-2 px-3 rounded-lg border backdrop-blur-sm ${panelBg} ${panelBorder}`}>

        {/* Seed input */}
        <span
          className={`text-[10px] font-medium uppercase tracking-wider ${textMuted}`}>

          Seed
        </span>
        <Input
          type="text"
          value={currentSettings.seed}
          onChange={(e) => updateSetting('seed', e.target.value)}
          placeholder="Seed"
          title="Generation seed"
          lightMode={lightMode}
          className="w-20 font-mono" />


        {/* Reroll button */}
        <Button
          variant="outline"
          size="icon"
          onClick={onReroll}
          disabled={isRunning}
          title="Re-roll: New seed and run">

          <Dices className="w-3.5 h-3.5" />
        </Button>

        {/* Auto-run toggle */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => onAutoRunEnabledChange(!autoRunEnabled)}
          disabled={isRunning}
          aria-pressed={autoRunEnabled}
          aria-label="Toggle auto-run: run current seed on config changes"
          title="Auto-run: run current seed on config changes"
          className={autoRunEnabled ? "ring-2 ring-orange-400/50 border-orange-400 text-orange-500" : undefined}>

          <Bolt className="w-3.5 h-3.5" />
        </Button>

        {/* Run in Game button */}
        {runInGameStatus ? (
          <div
            className={`hidden max-w-[180px] items-center gap-1.5 overflow-hidden text-[11px] font-medium ${textPrimary} lg:inline-flex`}
            title={runInGameTitle}>

            <div className={`h-2 w-2 shrink-0 rounded-full ${runInGameDotClass}`} />
            <span className="truncate">{runInGamePhaseLabel}</span>
            {runInGameStateLabel ? (
              <span className={`shrink-0 rounded border px-1 py-0.5 text-[10px] ${runInGameCurrentRelation === "stale" ? "border-orange-400/40 text-orange-500" : "border-gray-400/30 text-gray-400"}`}>
                {runInGameStateLabel}
              </span>
            ) : null}
          </div>
        ) : null}
        {runInGameStatus && onRunInGameRetryStatus && runInGameCanRetryStatus(runInGameStatus) ? (
          <Button
            variant="outline"
            size="icon"
            onClick={onRunInGameRetryStatus}
            title="Refresh Run in Game status">

            <RotateCw className="w-3.5 h-3.5" />
          </Button>
        ) : null}
        {runInGameStatus && onCopyRunInGameDiagnostics ? (
          <Button
            variant="outline"
            size="icon"
            onClick={onCopyRunInGameDiagnostics}
            title="Copy Run in Game diagnostics">

            <Clipboard className="w-3.5 h-3.5" />
          </Button>
        ) : null}
        <Button
          onClick={onRunInGame}
          disabled={isRunning || isRunInGameRunning}
          variant="outline"
          title={runInGameTitle}
          className={isRunInGameRunning ? 'opacity-70 cursor-wait' : undefined}>

          <MonitorPlay className="w-3.5 h-3.5" />
          <span>{runInGameButtonText}</span>
        </Button>

        {/* Run button */}
        <Button
          onClick={onRun}
          disabled={isRunning}
          className={`
            ${isDirty ? 'ring-2 ring-orange-400/50 border-orange-400' : ''}
            ${isRunning ? 'opacity-70 cursor-wait' : ''}
          `}>

          <Play className="w-3 h-3" />
          <span>{isRunning ? 'Running...' : 'Run'}</span>
        </Button>
      </div>
    </footer>);

};

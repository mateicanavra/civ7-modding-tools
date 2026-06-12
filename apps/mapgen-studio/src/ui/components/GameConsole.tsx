import React from 'react';
import { Bot, Clipboard, MonitorPlay, Radio, RotateCw, Square } from 'lucide-react';
import { Button, Tooltip, TooltipContent, TooltipTrigger } from '../../components/ui';
import {
  formatRunInGamePhaseLabel,
  runInGamePrimaryActionLabel,
  runInGameCanRetryStatus,
  type RunInGameOperationStatus,
} from '../../features/runInGame/status';
import type { RunInGameCurrentRelation } from '../../features/runInGame/clientState';
import {
  formatMapConfigSaveDeployPhaseLabel,
  type MapConfigSaveDeployStatus,
} from '../../features/mapConfigSave/status';

// ============================================================================
// GAME CONSOLE
// ============================================================================
// The footer's live-Civ7 area (Pass-3 footer-consoles spec): every control and
// readout that observes or commands the LIVE GAME lives here — live runtime
// chip + apply-suggestion bridge, autoplay, Run in Game with its status/retry/
// diagnostics, and the save-deploy chip. New live-game controls belong in this
// unit, not in the studio console. The studio↔game bridge cues (stale warning
// ring, Current/Stale/Previous relation chip) are computed against the current
// authored Studio state and surface here, beside the controls they qualify.
// ============================================================================

/** Read-only live Civ7 runtime snapshot the console renders. */
export interface GameConsoleLiveRuntime {
  status: "idle" | "ok" | "error";
  turn?: number;
  seed?: number;
  readiness?: string;
  autoplayActive?: boolean;
  autoplayPaused?: boolean;
  updatedAt?: string;
  error?: string;
}

export interface GameConsoleProps {
  /** Read-only live Civ7 runtime status */
  liveRuntime?: GameConsoleLiveRuntime;
  /** Whether the current Studio config/seed matches the proved live game source. */
  liveGameStudioRelation?: "current" | "stale" | "unknown";
  /** Callback to apply a visible live-runtime or proved-run suggestion back into Studio. */
  onSyncFromLiveGame?: () => void;
  /** Whether a Civ7 autoplay start/stop request is in flight */
  isAutoplayActionRunning?: boolean;
  /** Callback to start or stop Civ7 native autoplay */
  onToggleAutoplay?: () => void;
  /** Whether any studio/game operation is in flight (shared control gating) */
  operationControlsDisabled: boolean;
  /** Whether Civ7 Run in Game is currently running */
  isRunInGameRunning: boolean;
  /** Request-correlated Civ7 Run in Game status */
  runInGameStatus?: RunInGameOperationStatus | null;
  /** Whether the recorded operation matches the current authored Studio state */
  runInGameCurrentRelation?: RunInGameCurrentRelation;
  /** Callback to launch the current map config in Civ7 */
  onRunInGame: () => void;
  /** Callback to refresh the current Civ7 Run in Game operation status */
  onRunInGameRetryStatus?: () => void;
  /** Callback to copy current Civ7 Run in Game diagnostics */
  onCopyRunInGameDiagnostics?: () => void;
  /** Current config save/deploy status */
  saveDeployStatus?: MapConfigSaveDeployStatus | null;
}

export const GameConsole: React.FC<GameConsoleProps> = ({
  liveRuntime,
  liveGameStudioRelation = "unknown",
  onSyncFromLiveGame,
  isAutoplayActionRunning = false,
  onToggleAutoplay,
  operationControlsDisabled,
  isRunInGameRunning,
  runInGameStatus,
  runInGameCurrentRelation = "unknown",
  onRunInGame,
  onRunInGameRetryStatus,
  onCopyRunInGameDiagnostics,
  saveDeployStatus,
}) => {
  // Token-driven chrome; the console floats over the map on the popover tier.
  const panelBg = 'bg-popover/95';
  const panelBorder = 'border-border';
  const textPrimary = 'text-foreground';
  const textMuted = 'text-muted-foreground/70';
  // The "stale vs live game" emphasis is a warning about data, so it uses the
  // `warning` token (not the slate identity accent).
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

  return (
    <div
      className={`h-10 inline-flex min-w-0 max-w-full items-center gap-2 px-3 rounded-lg border backdrop-blur-sm ${panelBg} ${panelBorder}`}>

      {/* Console identity: this is the live-game area, named so it can grow. */}
      <span className={`text-label font-semibold uppercase tracking-wider shrink-0 ${textMuted}`}>
        Civ7
      </span>
      <div className="w-px h-5 shrink-0 bg-border" />

      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={onSyncFromLiveGame}
            disabled={!liveSyncAvailable}
            aria-label={liveSyncTitle}
            title={liveSyncTitle}
            className={`inline-flex h-7 min-w-0 max-w-[280px] items-center gap-2 rounded border px-2 transition-colors ${
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
            aria-label={autoplayTitle}
            title={autoplayTitle}
            className={`h-7 px-2 shrink-0 ${liveRuntime?.autoplayActive ? "border-warning/60 text-warning" : ""}`}>

            {liveRuntime?.autoplayActive ? <Square className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
            <span>{autoplayButtonText}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>{autoplayTitle}</TooltipContent>
      </Tooltip>

      {saveDeployStatus && saveDeployStatus.status !== "complete" ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              role="status"
              aria-label={saveDeployTitle}
              title={saveDeployTitle}
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
              role="status"
              aria-label={runInGameTitle}
              title={runInGameTitle}
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
              className="shrink-0"
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
              className="shrink-0"
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
            aria-label={runInGameTitle}
            title={runInGameTitle}
            className={isRunInGameRunning ? 'shrink-0 opacity-70 cursor-wait' : 'shrink-0'}>

            <MonitorPlay className="w-3.5 h-3.5" />
            <span>{runInGameButtonText}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent className="whitespace-pre-line">{runInGameTitle}</TooltipContent>
      </Tooltip>
    </div>
  );
};

import type { MapConfigSaveDeployStatus, RunInGameOperationStatus } from "@civ7/studio-contract";
import {
  Bug,
  ChevronDown,
  LoaderCircle,
  Play,
  Radio,
  Rocket,
  RotateCw,
  ScanEye,
  Square,
} from "lucide-react";
import React from "react";
import { cn } from "../../lib/utils.js";
import { Button } from "../ui/button.js";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover.js";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip.js";
import {
  formatMapConfigSaveDeployPhaseLabel,
  formatRunInGamePhaseLabel,
  type RunInGameRelation,
  runInGamePrimaryActionLabel,
} from "./statusLabels.js";

// ============================================================================
// GAME CONSOLE
// ============================================================================
// The Game bar's command cluster (Pass-5 toolbar-architecture-v2 spec; Z-wave
// status consolidation): every control and readout that observes or commands
// the LIVE GAME lives here. The cluster is ONE status + THREE commands:
//
//   [signal chip: dot + turn/seed + chevron]  [autoplay]  [explore]  [Play]
//
// The chip is the single merged game status — its dot folds the live runtime,
// the Run in Game operation, and save/deploy into one color, and clicking it
// opens the status hang-off: a panel docked under the bar (same idiom as the
// header's setup disclosure) carrying the expanded per-operation statuses and
// their secondary affordances (apply-live-to-Studio, copy
// diagnostics as the Bug action). Nothing else in the bar pulses or stacks
// pills; the studio↔game bridge cues (stale warning ring, Current/Stale/
// Previous relation) surface on the chip and inside the hang-off. Operation
// freshness is daemon-pushed; the hang-off offers diagnostics, not status
// readback.
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
  /**
   * Callback for the Explore command: reveal the full map in the live game
   * via the canonical `display.explore.request` control procedure (UI
   * display queue suppressed while gameplay discovers the tiles). The
   * button renders disabled until a handler is wired.
   */
  onExplore?: () => void;
  /** Whether a map explore (reveal) request is in flight */
  isExploreActionRunning?: boolean;
  /** Whether any studio/game operation is in flight (shared control gating) */
  operationControlsDisabled: boolean;
  /** Visible reason shown when shared operation gates disable game controls */
  operationBusyLabel?: string | null;
  /** Whether Civ7 Run in Game is currently running */
  isRunInGameRunning: boolean;
  /** Request-correlated Civ7 Run in Game status */
  runInGameStatus?: RunInGameOperationStatus | null;
  /** Whether the recorded operation matches the current authored Studio state */
  runInGameCurrentRelation?: RunInGameRelation;
  /** Callback to launch the current map config in Civ7 */
  onRunInGame: () => void;
  /** Callback to copy current Civ7 Run in Game diagnostics */
  onCopyRunInGameDiagnostics?: () => void;
  /** Current config save/deploy status */
  saveDeployStatus?: MapConfigSaveDeployStatus | null;
  /** Initial open state for the status hang-off (tests + dev affordance). */
  defaultStatusOpen?: boolean;
}

/**
 * Autoplay glyph: one play triangle wrapped by the clockwise repeat loop —
 * "keep playing forward". Composed from lucide parts because no single glyph
 * carries both. The `!` overrides beat the Button's `[&_svg]:size-3.5` rule.
 */
const AutoplayGlyph: React.FC = () => (
  <span aria-hidden="true" className="relative inline-flex h-4 w-4 items-center justify-center">
    <RotateCw className="!h-4 !w-4" />
    <Play className="absolute !h-[7px] !w-[7px] translate-x-[0.5px] fill-current" strokeWidth={0} />
  </span>
);

export const GameConsole: React.FC<GameConsoleProps> = ({
  liveRuntime,
  liveGameStudioRelation = "unknown",
  onSyncFromLiveGame,
  isAutoplayActionRunning = false,
  onToggleAutoplay,
  onExplore,
  isExploreActionRunning = false,
  operationControlsDisabled,
  operationBusyLabel,
  isRunInGameRunning,
  runInGameStatus,
  runInGameCurrentRelation = "unknown",
  onRunInGame,
  onCopyRunInGameDiagnostics,
  saveDeployStatus,
  defaultStatusOpen = false,
}) => {
  // The hang-off is a Radix Popover (E3 rebuild of the hand-rolled popup):
  // Radix owns positioning, outside-click/Escape dismissal, and the trigger's
  // aria wiring — opening anything else IS an outside click, so it never
  // stacks against the header's setup-disclosure row. The open state stays
  // CONTROLLED here because the chip's own chrome reads it (active border +
  // chevron rotation).
  const [statusOpen, setStatusOpen] = React.useState(defaultStatusOpen);
  const textPrimary = "text-foreground";
  const textMuted = "text-muted-foreground/70";
  const eyebrowClass = cn("text-label font-medium uppercase tracking-wider", textMuted);
  // The "stale vs live game" emphasis is a warning about data, so it uses the
  // `warning` token (not the slate identity accent).
  const liveDotClass =
    liveRuntime?.status === "ok"
      ? "bg-success"
      : liveRuntime?.status === "error"
        ? "bg-destructive"
        : "bg-muted-foreground";
  // The live summary splits into a primary segment (always rendered) and the
  // seed suffix, which the chip drops when the Game bar container narrows
  // (container query on the header's center column). The full string stays in
  // the tooltip/accessible name.
  const liveHasGameIdentity =
    liveRuntime?.status === "ok" &&
    (liveRuntime.turn !== undefined || liveRuntime.seed !== undefined);
  const liveTextPrimary =
    liveRuntime?.status === "ok"
      ? liveHasGameIdentity
        ? `Turn ${liveRuntime.turn ?? "?"}`
        : (liveRuntime.readiness ?? "Civ7 ready")
      : liveRuntime?.status === "error"
        ? (liveRuntime.error ?? "Live unavailable")
        : "Live idle";
  const liveTextSeedSuffix = liveHasGameIdentity ? ` · Seed ${liveRuntime?.seed ?? "?"}` : "";
  const liveText = `${liveTextPrimary}${liveTextSeedSuffix}`;
  const runInGamePhaseLabel = runInGameStatus
    ? formatRunInGamePhaseLabel(runInGameStatus.phase)
    : "Run in Game";
  const runInGameStateLabel =
    runInGameStatus && !isRunInGameRunning
      ? runInGameCurrentRelation === "stale"
        ? "Stale"
        : runInGameCurrentRelation === "current"
          ? "Current"
          : "Previous"
      : null;
  const runInGameFailed =
    runInGameStatus?.status === "failed" ||
    runInGameStatus?.status === "blocked" ||
    runInGameStatus?.status === "uncertain";
  const runInGameDotClass =
    runInGameCurrentRelation === "stale"
      ? "bg-warning"
      : runInGameStatus?.status === "complete"
        ? "bg-success"
        : runInGameFailed
          ? "bg-destructive"
          : isRunInGameRunning
            ? "bg-warning"
            : "bg-muted-foreground";
  const runInGameButtonText = runInGamePrimaryActionLabel(
    runInGameStatus,
    runInGameCurrentRelation
  );
  const liveSyncAvailable =
    liveRuntime?.status === "ok" &&
    liveGameStudioRelation === "stale" &&
    Boolean(onSyncFromLiveGame) &&
    !operationControlsDisabled;
  const autoplayControlDisabled =
    operationControlsDisabled ||
    isAutoplayActionRunning ||
    liveRuntime?.status !== "ok" ||
    !onToggleAutoplay;
  // Icon-only contract (Pass-4): the start/stop/in-flight wording the label
  // used to carry lives entirely in the accessible name + tooltip.
  const autoplayTitle = isAutoplayActionRunning
    ? "Autoplay request in flight"
    : operationControlsDisabled && operationBusyLabel
      ? operationBusyLabel
      : liveRuntime?.autoplayActive
        ? `Stop Civ7 autoplay${liveRuntime.autoplayPaused ? " (paused)" : ""}`
        : "Start Civ7 autoplay";
  const exploreTitle = !onExplore
    ? "Explore: tile visibility control is not yet available"
    : isExploreActionRunning
      ? "Explore request in flight"
      : operationControlsDisabled && operationBusyLabel
        ? operationBusyLabel
        : "Explore: reveal the full map in the live game";
  const saveDeployLabel = saveDeployStatus
    ? formatMapConfigSaveDeployPhaseLabel(saveDeployStatus.phase)
    : null;
  const saveDeployActive = saveDeployStatus?.status === "running";
  const saveDeployDotClass =
    saveDeployStatus?.status === "failed"
      ? "bg-destructive"
      : saveDeployStatus?.status === "complete"
        ? "bg-success"
        : "bg-warning";
  // The chip's ONE dot folds every tracked operation into a single color:
  // any failure wins, then in-flight/stale warnings, then live health.
  const combinedDotClass =
    liveRuntime?.status === "error" || runInGameFailed || saveDeployStatus?.status === "failed"
      ? "bg-destructive"
      : isRunInGameRunning ||
          saveDeployActive ||
          runInGameCurrentRelation === "stale" ||
          liveGameStudioRelation === "stale"
        ? "bg-warning"
        : liveRuntime?.status === "ok"
          ? "bg-success"
          : "bg-muted-foreground";
  // Activity overrides the idle turn/seed readout: while something is in
  // flight the chip narrates the phase, then settles back to the live line.
  const chipText = isRunInGameRunning
    ? runInGamePhaseLabel
    : saveDeployActive
      ? (saveDeployLabel ?? liveText)
      : liveText;
  // Rendered chip content: live summaries drop the seed suffix when the Game
  // bar container narrows (`@max-3xl` ≈ 768px container width) — the turn is
  // the at-a-glance signal; the seed stays in the tooltip and hang-off.
  const chipContent =
    !isRunInGameRunning && !saveDeployActive && liveTextSeedSuffix ? (
      <>
        {liveTextPrimary}
        <span className="@max-3xl:hidden">{liveTextSeedSuffix}</span>
      </>
    ) : (
      chipText
    );
  const chipTitle = [
    `Live: ${liveText}`,
    liveRuntime?.autoplayActive
      ? `Autoplay active${liveRuntime.autoplayPaused ? " (paused)" : ""}`
      : null,
    liveGameStudioRelation === "stale"
      ? "Live game is ahead of Studio — open for the apply action"
      : null,
    runInGameStatus ? `Run in Game: ${runInGamePhaseLabel}` : null,
    runInGameStateLabel ? `Studio state: ${runInGameStateLabel}` : null,
    runInGameStatus?.requestId ? `Request: ${runInGameStatus.requestId}` : null,
    saveDeployStatus ? `Save/Deploy: ${saveDeployLabel}` : null,
    saveDeployStatus?.requestId ? `Deploy request: ${saveDeployStatus.requestId}` : null,
    "Click to expand game status",
  ]
    .filter(Boolean)
    .join("\n");
  // The labeled CTA keeps the full operation story in its accessible name:
  // dynamic action ("Run in Game", "Retry Run", "Restart Civ & Run") first.
  const runInGameTitle = [
    runInGameButtonText,
    runInGameStatus ? `Run in Game: ${runInGamePhaseLabel}` : "Launches the current config in Civ7",
    runInGameStatus?.requestId ? `Request: ${runInGameStatus.requestId}` : null,
    runInGameStatus?.materialization?.mapScript
      ? `Map: ${runInGameStatus.materialization.mapScript}`
      : null,
    runInGameStateLabel ? `Studio state: ${runInGameStateLabel}` : null,
    runInGameStatus?.error ? `Error: ${runInGameStatus.error}` : null,
    runInGameStatus?.details?.recoveryHint
      ? `Recovery: ${runInGameStatus.details.recoveryHint}`
      : null,
    operationControlsDisabled && operationBusyLabel ? operationBusyLabel : null,
  ]
    .filter(Boolean)
    .join("\n");
  const applyLiveTitle = "Apply live game suggestion to Studio";

  return (
    <div className="relative inline-flex min-w-0 max-w-full items-center gap-2">
      {/* Hover text lives on ONE surface (the Radix tooltip); the accessible
          name mirrors the full merged status via aria-label. The native
          `title` mirrors are gone — they rendered the browser tooltip ON TOP
          of the Radix one (E3 hover-text dedupe). */}
      <Popover open={statusOpen} onOpenChange={setStatusOpen}>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <button
                type="button"
                aria-label={chipTitle}
                className={cn(
                  "inline-flex h-7 min-w-0 max-w-[280px] cursor-pointer items-center gap-2 rounded border px-2 transition-colors hover:bg-accent",
                  liveGameStudioRelation === "stale"
                    ? "border-warning text-warning ring-1 ring-warning/40"
                    : statusOpen
                      ? "border-input bg-accent"
                      : "border-transparent"
                )}
              >
                <Radio
                  className={cn(
                    "w-3.5 h-3.5",
                    liveGameStudioRelation === "stale" ? "text-warning" : textMuted
                  )}
                />
                <div className={cn("w-2 h-2 shrink-0 rounded-full", combinedDotClass)} />
                <span
                  className={cn(
                    "truncate text-data font-medium",
                    liveGameStudioRelation === "stale" ? "text-warning" : textPrimary
                  )}
                >
                  {chipContent}
                </span>
                {liveRuntime?.autoplayActive ? (
                  <span className="shrink-0 rounded border border-warning/40 px-1.5 py-0.5 text-label text-warning">
                    Auto
                  </span>
                ) : null}
                <ChevronDown
                  className={cn(
                    "h-3 w-3 shrink-0",
                    textMuted,
                    "transition-transform",
                    statusOpen && "rotate-180"
                  )}
                />
              </button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent className="whitespace-pre-line">{chipTitle}</TooltipContent>
        </Tooltip>

        {operationControlsDisabled && operationBusyLabel ? (
          <span
            className="shrink-0 rounded border border-warning/40 px-1.5 py-0.5 text-label text-warning"
            title={operationBusyLabel}
          >
            Busy
          </span>
        ) : null}

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={onToggleAutoplay}
              disabled={autoplayControlDisabled}
              aria-label={autoplayTitle}
              className={cn(
                "shrink-0",
                liveRuntime?.autoplayActive && "border-warning/60 text-warning"
              )}
            >
              {isAutoplayActionRunning ? (
                <LoaderCircle className="w-3.5 h-3.5 animate-spin" />
              ) : liveRuntime?.autoplayActive ? (
                <Square className="w-3.5 h-3.5" />
              ) : (
                <AutoplayGlyph />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{autoplayTitle}</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={onExplore}
              disabled={
                operationControlsDisabled ||
                isExploreActionRunning ||
                liveRuntime?.status !== "ok" ||
                !onExplore
              }
              aria-label={exploreTitle}
              className="shrink-0"
            >
              {isExploreActionRunning ? (
                <LoaderCircle className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <ScanEye className="w-3.5 h-3.5" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{exploreTitle}</TooltipContent>
        </Tooltip>

        {/* The Game CTA mirrors the World console's Run: the one filled action
          in its bar, same Button size, verb label. Rocket = launch Civ7 (the
          action leaves the studio — the old external-launch semantic). It
          rides the same Radix tooltip surface as the other commands (the
          operation story stays in the accessible name). */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={onRunInGame}
              disabled={operationControlsDisabled}
              aria-label={runInGameTitle}
              className={isRunInGameRunning ? "shrink-0 opacity-70 cursor-wait" : "shrink-0"}
            >
              <Rocket className="w-3 h-3" />
              <span>{isRunInGameRunning ? "Playing..." : "Play"}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent className="whitespace-pre-line">{runInGameTitle}</TooltipContent>
        </Tooltip>

        {/* The expanded status panel — Radix renders it (portaled) only while
          open, anchored under the chip trigger; the className overrides the
          PopoverContent defaults back to today's panel chrome (w-80, flush
          sections instead of padding, translucent popover tier). */}
        <PopoverContent
          aria-label="Expanded game status"
          align="start"
          sideOffset={14}
          className="w-80 overflow-hidden bg-popover/95 p-0 backdrop-blur-sm"
        >
          <div className="flex flex-col divide-y divide-border-subtle">
            {/* Live runtime */}
            <div className="flex flex-col gap-1.5 px-3 py-2.5">
              <div className="flex items-center gap-2">
                <span className={eyebrowClass}>Live game</span>
                {liveRuntime?.autoplayActive ? (
                  <span className="rounded border border-warning/40 px-1.5 py-0.5 text-label text-warning">
                    Auto{liveRuntime.autoplayPaused ? " (paused)" : ""}
                  </span>
                ) : null}
              </div>
              <div className="flex items-center gap-2">
                <span className={cn("h-2 w-2 shrink-0 rounded-full", liveDotClass)} />
                <span className={cn("truncate text-data font-medium", textPrimary)}>
                  {liveText}
                </span>
              </div>
              {liveRuntime?.readiness &&
              liveRuntime.status === "ok" &&
              (liveRuntime.turn !== undefined || liveRuntime.seed !== undefined) ? (
                <span className={cn("text-label", textMuted)}>{liveRuntime.readiness}</span>
              ) : null}
              {liveSyncAvailable ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onSyncFromLiveGame}
                  aria-label={applyLiveTitle}
                  title={applyLiveTitle}
                  className="self-start border-warning/40 text-warning hover:bg-warning/10"
                >
                  Apply to Studio
                </Button>
              ) : null}
            </div>

            {/* Run in Game operation */}
            <div className="flex flex-col gap-1.5 px-3 py-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className={eyebrowClass}>Run in Game</span>
                <div className="flex items-center gap-1">
                  {runInGameStatus && onCopyRunInGameDiagnostics ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={onCopyRunInGameDiagnostics}
                          aria-label="Copy Run in Game diagnostics"
                        >
                          <Bug className="w-3.5 h-3.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Copy Run in Game diagnostics</TooltipContent>
                    </Tooltip>
                  ) : null}
                </div>
              </div>
              {runInGameStatus ? (
                <>
                  <div className="flex items-center gap-2">
                    <span className={cn("h-2 w-2 shrink-0 rounded-full", runInGameDotClass)} />
                    <span className={cn("text-data font-medium", textPrimary)}>
                      {runInGamePhaseLabel}
                    </span>
                    {runInGameStateLabel ? (
                      <span
                        className={cn(
                          "rounded border px-1 py-0.5 text-label",
                          runInGameCurrentRelation === "stale"
                            ? "border-warning/40 text-warning"
                            : "border-border text-muted-foreground"
                        )}
                      >
                        {runInGameStateLabel}
                      </span>
                    ) : null}
                  </div>
                  <span
                    className={cn("truncate text-label", textMuted)}
                    title={runInGameStatus.requestId}
                  >
                    {runInGameStatus.requestId}
                  </span>
                  {runInGameStatus.details?.code === "map-mod-not-loaded" ? (
                    // Known error: the map deployed fine but Civ isn't loading the
                    // mod (a game update commonly auto-disables it). Surface it as a
                    // named, actionable condition rather than a raw failure string.
                    <div className="flex flex-col gap-1 rounded border border-warning/40 bg-warning/10 px-2 py-1.5">
                      <span className="text-label font-medium text-warning">
                        Map mod disabled in Civilization
                      </span>
                      <p className="text-label text-muted-foreground">
                        {runInGameStatus.details.recoveryHint ??
                          "Enable the Swooper Physics Maps mod in Civ’s Add-Ons menu, then retry Run in Game."}
                      </p>
                    </div>
                  ) : (
                    <>
                      {runInGameStatus.error ? (
                        <p className="text-label text-destructive">{runInGameStatus.error}</p>
                      ) : null}
                      {runInGameStatus.details?.recoveryHint ? (
                        <p className={cn("text-label", textMuted)}>
                          {runInGameStatus.details.recoveryHint}
                        </p>
                      ) : null}
                    </>
                  )}
                </>
              ) : (
                <span className={cn("text-data", textMuted)}>No run yet</span>
              )}
            </div>

            {/* Save & deploy operation */}
            {saveDeployStatus ? (
              <div className="flex flex-col gap-1.5 px-3 py-2.5">
                <span className={eyebrowClass}>Save &amp; Deploy</span>
                <div className="flex items-center gap-2">
                  <span className={cn("h-2 w-2 shrink-0 rounded-full", saveDeployDotClass)} />
                  <span className={cn("text-data font-medium", textPrimary)}>
                    {saveDeployLabel}
                  </span>
                </div>
                {saveDeployStatus.requestId ? (
                  <span
                    className={cn("truncate text-label", textMuted)}
                    title={saveDeployStatus.requestId}
                  >
                    {saveDeployStatus.requestId}
                  </span>
                ) : null}
                {saveDeployStatus.error ? (
                  <p className="text-label text-destructive">{saveDeployStatus.error}</p>
                ) : null}
              </div>
            ) : null}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

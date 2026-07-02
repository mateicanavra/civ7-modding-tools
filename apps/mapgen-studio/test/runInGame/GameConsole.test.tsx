import type { RunInGameOperationStatus } from "@civ7/studio-contract";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { TooltipProvider } from "../../src/components/ui/tooltip";
import { GameConsole, type GameConsoleProps } from "../../src/ui/components/GameConsole";

// The game console owns all live-Civ7 markup (Pass-5 toolbar-architecture-v2
// spec: it renders as the command cluster inside the header's Game bar; the
// Z-wave folded the status pills into ONE chip + the status hang-off panel).
// These scenarios moved here from AppFooter.test.tsx when the console left
// the footer. Expanded-status pins render with `defaultStatusOpen` because
// static markup cannot click the chip open.

function renderConsole(overrides: Partial<GameConsoleProps> = {}) {
  return renderToStaticMarkup(
    <TooltipProvider>
      <GameConsole
        operationControlsDisabled={false}
        isRunInGameRunning={false}
        onRunInGame={vi.fn()}
        liveRuntime={{ status: "ok", readiness: "shell" }}
        defaultStatusOpen
        {...overrides}
      />
    </TooltipProvider>
  );
}

function renderWithStatus(
  status: RunInGameOperationStatus,
  relation: "current" | "stale" | "unknown" = "unknown"
) {
  return renderConsole({
    isRunInGameRunning: status.status === "running",
    runInGameStatus: status,
    runInGameCurrentRelation: relation,
    onCopyRunInGameDiagnostics: vi.fn(),
  });
}

describe("GameConsole Run in Game status", () => {
  it("renders the active Run in Game phase with its diagnostics affordance", () => {
    const html = renderWithStatus({
      ok: true,
      requestId: "studio-run-in-game-test",
      phase: "waiting-for-proof",
      status: "running",
      startedAt: "2026-06-01T00:00:00.000Z",
      updatedAt: "2026-06-01T00:00:01.000Z",
      completedPhases: [
        "materializing",
        "deploying",
        "checking-civ7",
        "preparing-setup",
        "starting-game",
      ],
      materialization: {
        mode: "disposable",
        mapScript: "{swooper-maps}/maps/studio-current.js",
      },
    });

    expect(html).toContain("Waiting for Proof");
    expect(html).toContain("studio-run-in-game-test");
    expect(html).toContain("Copy Run in Game diagnostics");
  });

  it("renders diagnostics and retry run affordances for failed operations", () => {
    const html = renderWithStatus({
      ok: false,
      requestId: "studio-run-in-game-failed",
      phase: "failed",
      status: "failed",
      startedAt: "2026-06-01T00:00:00.000Z",
      updatedAt: "2026-06-01T00:00:01.000Z",
      completedPhases: ["materializing", "deploying"],
      error: "Civ7 setup cannot see {swooper-maps}/maps/studio-current.js",
      details: {
        code: "setup-map-row-not-visible",
        reloadRequired: true,
      },
    });

    expect(html).not.toContain("Refresh Run in Game status");
    expect(html).toContain("Retry Run");
    expect(html).toContain("setup cannot see");
  });

  it("renders restart-Civ recovery as the primary Run in Game action", () => {
    const html = renderWithStatus(
      {
        ok: false,
        requestId: "studio-run-in-game-restart-needed",
        phase: "blocked",
        status: "blocked",
        startedAt: "2026-06-01T00:00:00.000Z",
        updatedAt: "2026-06-01T00:00:01.000Z",
        completedPhases: ["materializing", "deploying", "checking-civ7"],
        error: "Civ7 setup cannot see {swooper-maps}/maps/studio-current.js",
        details: {
          code: "setup-map-row-not-visible",
          reloadBoundary: "process-restart-required",
        },
      },
      "current"
    );

    expect(html).toContain("Restart Civ &amp; Run");
  });

  it("does not carry restart-Civ recovery onto stale authored Studio state", () => {
    const html = renderWithStatus(
      {
        ok: false,
        requestId: "studio-run-in-game-stale-restart-needed",
        phase: "blocked",
        status: "blocked",
        startedAt: "2026-06-01T00:00:00.000Z",
        updatedAt: "2026-06-01T00:00:01.000Z",
        completedPhases: ["materializing", "deploying", "checking-civ7"],
        error: "Civ7 setup cannot see {swooper-maps}/maps/studio-current.js",
        details: {
          code: "setup-map-row-not-visible",
          reloadBoundary: "process-restart-required",
        },
      },
      "stale"
    );

    expect(html).toContain("Run Current");
    expect(html).not.toContain("Restart Civ &amp; Run");
  });

  it("keeps map script fatal recovery on retry instead of process restart", () => {
    const html = renderWithStatus(
      {
        ok: false,
        requestId: "studio-run-in-game-map-script-failed",
        phase: "failed",
        status: "failed",
        startedAt: "2026-06-01T00:00:00.000Z",
        updatedAt: "2026-06-01T00:00:01.000Z",
        completedPhases: [
          "materializing",
          "deploying",
          "preparing-setup",
          "starting-game",
          "waiting-for-proof",
        ],
        error: "Civ7 could not load generated map script",
        details: {
          code: "map-script-load-failed",
          dismissNotificationRequired: true,
          recoveryBoundary: "civ-notification-dismiss",
          recoveryHint:
            "Dismiss the Civ fatal notification, fix or regenerate the map script, then retry Run in Game.",
        },
      },
      "current"
    );

    expect(html).toContain("Retry Run");
    expect(html).not.toContain("Restart Civ &amp; Run");
    expect(html).toContain("Dismiss the Civ fatal notification");
  });

  it("marks a previous operation stale when the authored Studio state has changed", () => {
    const html = renderWithStatus(
      {
        ok: true,
        requestId: "studio-run-in-game-complete",
        phase: "complete",
        status: "complete",
        startedAt: "2026-06-01T00:00:00.000Z",
        updatedAt: "2026-06-01T00:00:01.000Z",
        completedPhases: [
          "materializing",
          "deploying",
          "checking-civ7",
          "preparing-setup",
          "starting-game",
          "waiting-for-proof",
        ],
      },
      "stale"
    );

    expect(html).toContain("Stale");
    expect(html).toContain("Studio state: Stale");
  });
});

describe("GameConsole live runtime and save/deploy", () => {
  it("renders save/deploy status with its request id", () => {
    const html = renderConsole({
      operationControlsDisabled: true,
      operationBusyLabel: "Game controls are paused while Save & Deploy is running.",
      saveDeployStatus: {
        ok: true,
        requestId: "studio-save-deploy-test",
        phase: "deploying",
        status: "running",
        startedAt: "2026-06-01T00:00:00.000Z",
        updatedAt: "2026-06-01T00:00:01.000Z",
        path: "mods/mod-swooper-maps/src/maps/configs/studio-current.config.json",
      },
    });

    expect(html).toContain("Save/Deploy: Deploying");
    expect(html).toContain("studio-save-deploy-test");
    expect(html).toContain("Game controls are paused while Save &amp; Deploy is running.");
    expect(html).toContain("Busy");
    expect(html).toContain("disabled");
  });

  it("renders a Civ7 autoplay start button from live runtime status", () => {
    const html = renderConsole({
      liveRuntime: { status: "ok", readiness: "ready", autoplayActive: false },
      onToggleAutoplay: vi.fn(),
    });

    expect(html).toContain("Start Civ7 autoplay");
  });

  it("renders a Civ7 autoplay stop button when autoplay is active", () => {
    const html = renderConsole({
      liveRuntime: { status: "ok", readiness: "ready", autoplayActive: true },
      onToggleAutoplay: vi.fn(),
    });

    expect(html).toContain("Stop Civ7 autoplay");
    expect(html).toContain("Auto");
  });

  it("renders the Explore placeholder disabled until a handler is wired", () => {
    const html = renderConsole();

    expect(html).toContain("Explore: tile visibility control is not yet available");
  });

  it("renders the wired Explore reveal action when live and a handler exists", () => {
    const html = renderConsole({
      liveRuntime: { status: "ok", readiness: "ready" },
      onExplore: vi.fn(),
    });

    expect(html).toContain("Explore: reveal the full map in the live game");
  });

  it("disables Explore and narrates the in-flight request while revealing", () => {
    const html = renderConsole({
      liveRuntime: { status: "ok", readiness: "ready" },
      onExplore: vi.fn(),
      isExploreActionRunning: true,
    });

    expect(html).toContain("Explore request in flight");
  });

  it("shows the shared busy reason on disabled Autoplay and Explore controls", () => {
    const html = renderConsole({
      liveRuntime: { status: "ok", readiness: "ready" },
      onToggleAutoplay: vi.fn(),
      onExplore: vi.fn(),
      operationControlsDisabled: true,
      operationBusyLabel: "Game controls are paused while Run in Game is running.",
    });

    expect(html).toContain("Game controls are paused while Run in Game is running.");
    expect(html).toContain("Busy");
  });

  it("highlights live seed status when a proved live game is out of sync with Studio", () => {
    const html = renderConsole({
      liveRuntime: { status: "ok", turn: 12, seed: 123 },
      liveGameStudioRelation: "stale",
      onSyncFromLiveGame: vi.fn(),
    });

    expect(html).toContain("Apply live game suggestion to Studio");
    // The stale-live-game emphasis is token-driven (`warning`), not a raw
    // palette class — the design system forbids hardcoded color utilities.
    expect(html).toContain("border-warning");
    expect(html).toContain("Seed 123");
    // Responsive chip: the seed suffix rides a container-query span so the
    // chip collapses to just the turn when the Game bar narrows.
    expect(html).toContain("@max-3xl:hidden");
  });
});

describe("GameConsole combined status chip + hang-off (Z-wave)", () => {
  it("keeps the hang-off closed by default: secondary affordances stay off the bar", () => {
    const html = renderConsole({
      defaultStatusOpen: false,
      runInGameStatus: {
        ok: true,
        requestId: "studio-run-in-game-closed",
        phase: "complete",
        status: "complete",
        startedAt: "2026-06-01T00:00:00.000Z",
        updatedAt: "2026-06-01T00:00:01.000Z",
        completedPhases: ["materializing", "deploying"],
      },
      onCopyRunInGameDiagnostics: vi.fn(),
    });

    expect(html).toContain('aria-expanded="false"');
    expect(html).not.toContain("Copy Run in Game diagnostics");
    // The chip's title still aggregates the merged status for hover/AT.
    expect(html).toContain("studio-run-in-game-closed");
  });

  it("renders the labeled Play CTA, swapping to Playing... while a run is in flight", () => {
    const idle = renderConsole({ defaultStatusOpen: false });
    expect(idle).toContain(">Play<");

    const running = renderConsole({
      defaultStatusOpen: false,
      isRunInGameRunning: true,
      runInGameStatus: {
        ok: true,
        requestId: "studio-run-in-game-running",
        phase: "deploying",
        status: "running",
        startedAt: "2026-06-01T00:00:00.000Z",
        updatedAt: "2026-06-01T00:00:01.000Z",
        completedPhases: ["materializing"],
      },
    });
    expect(running).toContain("Playing...");
    // Activity narration: the chip text carries the in-flight phase.
    expect(running).toContain(">Deploying<");
  });

  it("folds operation failures into the chip's single status dot", () => {
    // Hang-off closed: the only status dot in the markup is the chip's.
    const html = renderConsole({
      defaultStatusOpen: false,
      runInGameStatus: {
        ok: false,
        requestId: "studio-run-in-game-folded",
        phase: "failed",
        status: "failed",
        startedAt: "2026-06-01T00:00:00.000Z",
        updatedAt: "2026-06-01T00:00:01.000Z",
        completedPhases: ["materializing"],
        error: "deploy exploded",
      },
    });

    expect(html).toContain("bg-destructive");
  });
});

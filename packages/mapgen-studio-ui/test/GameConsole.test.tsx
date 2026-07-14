// @vitest-environment jsdom
import type { RunInGameOperationStatus } from "@civ7/studio-contract";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { GameConsole, type GameConsoleProps } from "../src/components/panels/GameConsole.js";
import { TooltipProvider } from "../src/components/ui/tooltip.js";

// The game console owns all live-Civ7 markup (Pass-5 toolbar-architecture-v2
// spec: it renders as the command cluster inside the header's Game bar; the
// Z-wave folded the status pills into ONE chip + the status hang-off panel).
// These scenarios moved here from AppFooter.test.tsx when the console left
// the footer. Expanded-status pins render with `defaultStatusOpen` because
// a test render cannot click the chip open.
//
// Harness note (E3 Popover rebuild): the hang-off is a Radix Popover whose
// content PORTALS to document.body — `renderToStaticMarkup` omits portals, so
// these pins render through testing-library/jsdom and assert against the full
// document body markup instead.

// Radix Popper measures its anchor via ResizeObserver, which jsdom lacks.
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
(globalThis as { ResizeObserver?: unknown }).ResizeObserver ??= ResizeObserverStub;

afterEach(cleanup);

function renderConsole(overrides: Partial<GameConsoleProps> = {}) {
  cleanup();
  render(
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
  return document.body.innerHTML;
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

type PrivateRunStatusLeakSentinel = Readonly<{
  command: string;
  rawOutput: string;
  stack: string;
  workspaceRoot: string;
  materialization: {
    generatedModRoot: string;
    sourcePath: string;
  };
  attribution: {
    sourceDeploymentPath: string;
  };
  diagnostics: {
    sections: {
      deployment: string;
    };
  };
}>;

function terminalStatusWithPrivateSentinels(
  terminalStatus: "failed" | "cancelled"
): RunInGameOperationStatus & PrivateRunStatusLeakSentinel {
  const privateSentinels = {
    command: "runInGame.start --source /private-sentinel/user/source.config.json",
    rawOutput: "Traceback: setup cannot see /tmp/private-deploy/Swooper.lua",
    stack: "Error: hidden\n    at internal (/private/workspace/run.ts:12:3)",
    workspaceRoot: "/private-sentinel/user/run-workspace",
    materialization: {
      generatedModRoot: "/private-sentinel/user/generated-mod",
      sourcePath: "mods/mod-swooper-maps/src/maps/configs/private.config.json",
    },
    attribution: {
      sourceDeploymentPath: "/private-sentinel/user/Civ7/Mods/Swooper.lua",
    },
    diagnostics: {
      sections: {
        deployment: "Private diagnostics section must not render",
      },
    },
  } satisfies PrivateRunStatusLeakSentinel;
  const common = {
    requestId: `studio-run-in-game-${terminalStatus}-public`,
    diagnosticsId: `run-diagnostics-${terminalStatus}-public`,
    recoveryActions: ["copy-diagnostics" as const],
    ...privateSentinels,
  };

  if (terminalStatus === "failed") {
    return {
      ...common,
      phase: "failed",
      status: "failed",
      safeFailureCategory: "runtime-observation",
    } satisfies RunInGameOperationStatus & PrivateRunStatusLeakSentinel;
  }
  return {
    ...common,
    phase: "cancelled",
    status: "cancelled",
    safeFailureCategory: "operation-cancelled",
  } satisfies RunInGameOperationStatus & PrivateRunStatusLeakSentinel;
}

describe("GameConsole Run in Game status", () => {
  it("wires the rendered Play control to the Run in Game callback", () => {
    const onRunInGame = vi.fn();
    render(
      <TooltipProvider>
        <GameConsole
          operationControlsDisabled={false}
          isRunInGameRunning={false}
          onRunInGame={onRunInGame}
          liveRuntime={{ status: "ok", readiness: "shell" }}
        />
      </TooltipProvider>
    );

    fireEvent.click(screen.getByRole("button", { name: /Launches the current config in Civ7/i }));

    expect(onRunInGame).toHaveBeenCalledTimes(1);
  });

  it("disables Run in Game while the current config is invalid", () => {
    const onRunInGame = vi.fn();
    renderConsole({
      onRunInGame,
      runInGameDisabled: true,
      runInGameDisabledReason: "Correct the current config before running in game.",
    });

    const play = screen.getByRole("button", {
      name: /Correct the current config before running in game/i,
    });
    expect(play).toHaveProperty("disabled", true);
    fireEvent.click(play);
    expect(onRunInGame).not.toHaveBeenCalled();
  });

  it("renders the active Run in Game phase with its diagnostics affordance", () => {
    const html = renderWithStatus({
      requestId: "studio-run-in-game-test",
      phase: "observing-runtime",
      status: "running",
      diagnosticsId: "run-diagnostics-studio-run-in-game-test",
      recoveryActions: ["copy-diagnostics", "retry-status"],
    });

    expect(html).toContain("Observing Runtime");
    expect(html).toContain("studio-run-in-game-test");
    expect(html).toContain("Copy Run in Game diagnostics");
    expect(html).toContain("run-diagnostics-studio-run-in-game-test");
  });

  it("renders diagnostics and retry run affordances for failed operations", () => {
    const html = renderWithStatus({
      requestId: "studio-run-in-game-failed",
      phase: "failed",
      status: "failed",
      safeFailureCategory: "runtime-observation",
      diagnosticsId: "run-diagnostics-studio-run-in-game-failed",
      recoveryActions: ["copy-diagnostics", "retry-run"],
    });

    expect(html).not.toContain("Refresh Run in Game status");
    expect(html).toContain("Retry Run");
    expect(html).toContain("runtime-observation");
    expect(html).not.toContain("setup cannot see");
  });

  it.each([
    "failed",
    "cancelled",
  ] as const)("keeps %s terminal public copy safe and action-neutral in the status panel", (terminalStatus) => {
    const safeFailureCategory =
      terminalStatus === "failed" ? "runtime-observation" : "operation-cancelled";
    const statusWithPrivateSentinels = terminalStatusWithPrivateSentinels(terminalStatus);
    const html = renderWithStatus(statusWithPrivateSentinels);

    expect(html).toContain(terminalStatus === "failed" ? "Failed" : "Cancelled");
    expect(html).toContain(`studio-run-in-game-${terminalStatus}-public`);
    expect(html).toContain(safeFailureCategory);
    expect(html).toContain(`run-diagnostics-${terminalStatus}-public`);

    const statusPanel = document.querySelector<HTMLElement>('[aria-label="Expanded game status"]');
    expect(statusPanel).not.toBeNull();
    const statusPanelText = statusPanel?.textContent ?? "";
    expect(statusPanelText).not.toContain("Retry Run");
    expect(statusPanelText).not.toContain("Run Current");
    expect(statusPanelText).not.toContain("Restart Civ");
    expect(statusPanelText).not.toContain("Playing");
    expect(statusPanelText).not.toContain("Starting Game");

    for (const unsafeCopy of [
      "runInGame.start",
      "/private-sentinel/user",
      "/tmp/private-deploy",
      "/private/workspace",
      "mods/mod-swooper-maps/src/maps/configs/private.config.json",
      "Swooper.lua",
      "Traceback",
      "Error: hidden",
      "Private diagnostics section must not render",
      "sourceDeploymentPath",
      "generatedModRoot",
    ]) {
      expect(html).not.toContain(unsafeCopy);
    }
  });

  it("keeps restart-Civ recovery off the primary Run in Game action", () => {
    const html = renderWithStatus(
      {
        requestId: "studio-run-in-game-restart-needed",
        phase: "failed",
        status: "failed",
        safeFailureCategory: "runtime-control",
        recoveryActions: ["copy-diagnostics", "restart-civ-process-and-retry", "retry-run"],
      },
      "current"
    );

    expect(html).toContain("Retry Run");
    expect(html).not.toContain("Restart Civ &amp; Run");
  });

  it("does not carry restart-Civ recovery onto stale authored Studio state", () => {
    const html = renderWithStatus(
      {
        requestId: "studio-run-in-game-stale-restart-needed",
        phase: "failed",
        status: "failed",
        safeFailureCategory: "runtime-control",
        recoveryActions: ["copy-diagnostics", "restart-civ-process-and-retry", "retry-run"],
      },
      "stale"
    );

    expect(html).toContain("Run Current");
    expect(html).not.toContain("Restart Civ &amp; Run");
  });

  it("keeps map script fatal recovery on retry instead of process restart", () => {
    const html = renderWithStatus(
      {
        requestId: "studio-run-in-game-map-script-failed",
        phase: "failed",
        status: "failed",
        safeFailureCategory: "runtime-observation",
        recoveryActions: ["copy-diagnostics", "dismiss-civ-notification-and-retry", "retry-run"],
      },
      "current"
    );

    expect(html).toContain("Retry Run");
    expect(html).not.toContain("Restart Civ &amp; Run");
    expect(html).toContain("runtime-observation");
    expect(html).not.toContain("Dismiss the Civ fatal notification");
  });

  it("marks a previous operation stale when the authored Studio state has changed", () => {
    const html = renderWithStatus(
      {
        requestId: "studio-run-in-game-complete",
        phase: "completed",
        status: "completed",
        recoveryActions: ["copy-diagnostics"],
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
        recoveryActions: ["copy-diagnostics", "retry-status"],
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
        requestId: "studio-run-in-game-closed",
        phase: "completed",
        status: "completed",
        recoveryActions: ["copy-diagnostics"],
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
        requestId: "studio-run-in-game-running",
        phase: "deploying",
        status: "running",
        recoveryActions: ["copy-diagnostics", "retry-status"],
      },
    });
    expect(running).toContain("Playing...");
    // Activity narration: the chip text carries the in-flight phase.
    expect(running).toContain(">Deploying<");
  });

  it("wires the chip's aria-controls to the open status panel's id (Radix owns the id)", () => {
    // Regression (E3 review fold): the panel used to carry a custom
    // id="game-status-panel", but Radix Popover renders its own contentId
    // BEFORE spreading user props — so the custom id overrode the generated
    // one while the trigger's aria-controls still pointed at Radix's id,
    // dangling at an element that no longer existed. Letting Radix own the
    // id keeps the trigger↔content linkage intact.
    renderConsole({
      runInGameStatus: {
        requestId: "studio-run-in-game-aria",
        phase: "completed",
        status: "completed",
        recoveryActions: ["copy-diagnostics"],
      },
      onCopyRunInGameDiagnostics: vi.fn(),
    });

    const trigger = document.querySelector<HTMLElement>("[aria-controls][aria-expanded]");
    expect(trigger).not.toBeNull();
    const panel = document.querySelector<HTMLElement>('[aria-label="Expanded game status"]');
    expect(panel).not.toBeNull();

    const controls = trigger?.getAttribute("aria-controls");
    expect(controls).toBeTruthy();
    // The linkage must resolve: aria-controls names the rendered panel's id.
    expect(panel?.id).toBe(controls);
    // And Radix — not a hand-authored constant — owns that id.
    expect(panel?.id).not.toBe("game-status-panel");
  });

  it("folds operation failures into the chip's single status dot", () => {
    // Hang-off closed: the only status dot in the markup is the chip's.
    const html = renderConsole({
      defaultStatusOpen: false,
      runInGameStatus: {
        requestId: "studio-run-in-game-folded",
        phase: "failed",
        status: "failed",
        safeFailureCategory: "deployment",
        recoveryActions: ["copy-diagnostics", "retry-run"],
      },
    });

    expect(html).toContain("bg-destructive");
  });
});

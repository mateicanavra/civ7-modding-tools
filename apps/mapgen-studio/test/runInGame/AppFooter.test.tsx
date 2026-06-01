import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { AppFooter } from "../../src/ui/components/AppFooter";
import type { RecipeSettings, WorldSettings } from "../../src/ui/types";
import type { RunInGameOperationStatus } from "../../src/features/runInGame/status";

const recipeSettings: RecipeSettings = {
  recipe: "standard",
  preset: "none",
  seed: "123",
};

const worldSettings: WorldSettings = {
  mode: "browser",
  mapSize: "MAPSIZE_STANDARD",
  playerCount: 8,
  resources: "balanced",
};

function renderFooter(status: RunInGameOperationStatus, relation: "current" | "stale" | "unknown" = "unknown") {
  return renderToStaticMarkup(
    <AppFooter
      status="ready"
      lastRunSettings={recipeSettings}
      lastGlobalSettings={worldSettings}
      currentSettings={recipeSettings}
      onSettingsChange={vi.fn()}
      onRun={vi.fn()}
      onRunInGame={vi.fn()}
      onRunInGameRetryStatus={vi.fn()}
      onCopyRunInGameDiagnostics={vi.fn()}
      onReroll={vi.fn()}
      isRunning={false}
      isRunInGameRunning={status.status === "running"}
      runInGameStatus={status}
      runInGameCurrentRelation={relation}
      isDirty={false}
      lightMode={false}
      liveRuntime={{ status: "ok", readiness: "shell" }}
      autoRunEnabled={false}
      onAutoRunEnabledChange={vi.fn()}
    />
  );
}

describe("AppFooter Run in Game status", () => {
  it("renders active Run in Game phase separately from browser run status", () => {
    const html = renderFooter({
      ok: true,
      requestId: "studio-run-in-game-test",
      phase: "waiting-for-proof",
      status: "running",
      startedAt: "2026-06-01T00:00:00.000Z",
      updatedAt: "2026-06-01T00:00:01.000Z",
      completedPhases: ["materializing", "deploying", "checking-civ7", "preparing-setup", "starting-game"],
      materialization: {
        mode: "disposable",
        mapScript: "{swooper-maps}/maps/studio-current.js",
      },
    });

    expect(html).toContain("Waiting for Proof");
    expect(html).toContain("studio-run-in-game-test");
    expect(html).toContain("Copy Run in Game diagnostics");
    expect(html).toContain("Ready");
  });

  it("renders retry status and retry run affordances for failed operations", () => {
    const html = renderFooter({
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

    expect(html).toContain("Refresh Run in Game status");
    expect(html).toContain("Retry Run");
    expect(html).toContain("setup cannot see");
  });

  it("marks a previous operation stale when the authored Studio state has changed", () => {
    const html = renderFooter({
      ok: true,
      requestId: "studio-run-in-game-complete",
      phase: "complete",
      status: "complete",
      startedAt: "2026-06-01T00:00:00.000Z",
      updatedAt: "2026-06-01T00:00:01.000Z",
      completedPhases: ["materializing", "deploying", "checking-civ7", "preparing-setup", "starting-game", "waiting-for-proof"],
    }, "stale");

    expect(html).toContain("Stale");
    expect(html).toContain("Studio state: Stale");
  });
});

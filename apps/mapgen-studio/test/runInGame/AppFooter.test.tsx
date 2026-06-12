import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { AppFooter } from "../../src/ui/components/AppFooter";
import { TooltipProvider } from "../../src/components/ui/tooltip";
import type { RecipeSettings, WorldSettings } from "../../src/ui/types";

// The footer is the STUDIO console (Pass-4 game-console-dock spec). Live-game
// markup is covered by GameConsole.test.tsx; the footer keeps the shared
// operation gate: game-side operations disable studio run controls.

const recipeSettings: RecipeSettings = {
  recipe: "standard",
  preset: "none",
  seed: "123",
};

const worldSettings: WorldSettings = {
  mapSize: "MAPSIZE_STANDARD",
  playerCount: 8,
  resources: "balanced",
};

function renderFooter(overrides: Partial<Parameters<typeof AppFooter>[0]> = {}) {
  return renderToStaticMarkup(
    <TooltipProvider>
      <AppFooter
        status="ready"
        lastRunSettings={recipeSettings}
        lastGlobalSettings={worldSettings}
        currentSettings={recipeSettings}
        onSettingsChange={vi.fn()}
        onRun={vi.fn()}
        onReroll={vi.fn()}
        isRunning={false}
        isRunInGameRunning={false}
        isDirty={false}
        autoRunEnabled={false}
        onAutoRunEnabledChange={vi.fn()}
        {...overrides}
      />
    </TooltipProvider>
  );
}

describe("AppFooter studio console", () => {
  it("renders studio status and run controls without any live-game markup", () => {
    const html = renderFooter();

    expect(html).toContain("Ready");
    expect(html).toContain("Re-roll: New seed and run");
    expect(html).toContain("Generation seed");
    expect(html).not.toContain("Run in Game");
    expect(html).not.toContain("Civ7");
  });

  it("disables run controls while Run in Game is running (shared operation gate)", () => {
    const html = renderFooter({ isRunInGameRunning: true });

    expect(html).toContain("disabled");
  });

  it("disables run controls while config save/deploy is running (shared operation gate)", () => {
    const html = renderFooter({ isSaveDeployRunning: true });

    expect(html).toContain("disabled");
  });
});

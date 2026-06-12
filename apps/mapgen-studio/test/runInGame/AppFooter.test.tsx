import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { AppFooter } from "../../src/ui/components/AppFooter";
import { TooltipProvider } from "../../src/components/ui/tooltip";
import type { RecipeSettings, WorldSettings } from "../../src/ui/types";

// The footer is the WORLD/MAP console (Pass-5 toolbar-architecture-v2 spec):
// map authoring (size · players · resources · seed) + the studio iteration
// loop, with the last run compressed into the History affordance. Live-game
// markup is covered by GameConsole.test.tsx; the footer keeps the shared
// operation gate: game-side operations disable the authoring/run controls.

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
        globalSettings={worldSettings}
        onGlobalSettingsChange={vi.fn()}
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

describe("AppFooter world/map console", () => {
  it("renders status, map settings, and run controls without any live-game markup", () => {
    const html = renderFooter();

    expect(html).toContain("Ready");
    expect(html).toContain('aria-label="World size"');
    expect(html).toContain('aria-label="Players"');
    expect(html).toContain('aria-label="Resources"');
    expect(html).toContain("Re-roll: New seed and run");
    expect(html).toContain("Generation seed");
    expect(html).not.toContain("Run in Game");
    expect(html).not.toContain("Civ7");
  });

  it("compresses the last run into the History control's accessible name", () => {
    const html = renderFooter();

    // The old inline cluster is gone; its data rides the History affordance.
    expect(html).toContain("Run history");
    expect(html).toContain("seed 123");
    expect(html).toContain("8 players");
    expect(html).toContain("Click to copy seed");
  });

  it("disables map settings and run controls while Run in Game is running (shared operation gate)", () => {
    const html = renderFooter({ isRunInGameRunning: true });

    expect(html).toContain("disabled");
    // The relocated selects ride the same gate as seed/reroll/run.
    const sizeTrigger = html.match(/<button[^>]*aria-label="World size"[^>]*>/)?.[0] ?? "";
    expect(sizeTrigger).toContain("disabled");
  });

  it("disables run controls while config save/deploy is running (shared operation gate)", () => {
    const html = renderFooter({ isSaveDeployRunning: true });

    expect(html).toContain("disabled");
  });
});

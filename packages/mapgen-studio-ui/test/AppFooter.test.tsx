import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { AppFooter } from "../src/components/composites/AppFooter.js";
import { TooltipProvider } from "../src/components/ui/tooltip.js";
import type { WorldSettings } from "../src/types/index.js";

// The footer is the WORLD/MAP console (Pass-5 toolbar-architecture-v2 spec,
// narrowed by world-console-map-params): map authoring (size · players ·
// seed) + the studio iteration loop, with the last run compressed into the
// History affordance. The console only authors settings the map pipeline
// reads — resources stays in WorldSettings and keeps flowing through runs,
// but has no pipeline reader, so no control renders for it. Live-game markup
// is covered by GameConsole.test.tsx; the footer keeps the shared operation
// gate: game-side operations disable the authoring/run controls.

const seed = "123";

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
        lastRun={{ seed, worldSettings }}
        globalSettings={worldSettings}
        onGlobalSettingsChange={vi.fn()}
        seed={seed}
        onSeedChange={vi.fn()}
        onRun={vi.fn()}
        onReroll={vi.fn()}
        isRunning={false}
        isRunInGameRunning={false}
        isDirty={false}
        autoRunEnabled={false}
        onAutoRunEnabledChange={vi.fn()}
        mapSizeOptions={[
          { value: "MAPSIZE_TINY", label: "Tiny" },
          { value: "MAPSIZE_SMALL", label: "Small" },
          { value: "MAPSIZE_STANDARD", label: "Standard" },
          { value: "MAPSIZE_LARGE", label: "Large" },
          { value: "MAPSIZE_HUGE", label: "Huge" },
        ]}
        mapSizeShortLabels={{ MAPSIZE_STANDARD: "Standard" }}
        playerCountOptions={[2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]}
        seedMin={0}
        seedMax={2147483647}
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
    expect(html).toContain("Re-roll: New seed and run");
    expect(html).toContain("Generation seed");
    expect(html).not.toContain("Run in Game");
    expect(html).not.toContain("Civ7");
  });

  it("renders no Resources control or mention (pipeline-input rule; state still flows)", () => {
    const html = renderFooter();

    expect(html).not.toContain("Resources");
    expect(html).not.toContain("resources");
  });

  it("compresses the last run into the History control's accessible name", () => {
    const html = renderFooter();

    // The old inline cluster is gone; its data rides the History affordance.
    expect(html).toContain("Run history");
    expect(html).toContain("seed 123");
    expect(html).toContain("8 players");
    expect(html).toContain("Click to copy seed");
  });

  it("does not invent run history before the first browser generation", () => {
    const html = renderFooter({ lastRun: null });

    expect(html).not.toContain("Run history");
    expect(html).not.toContain("Last run");
  });

  it("disables map settings and run controls while Run in Game is running (shared operation gate)", () => {
    const html = renderFooter({
      isRunInGameRunning: true,
      operationBusyLabel: "World controls are paused while Run in Game is running.",
    });

    expect(html).toContain("disabled");
    expect(html).toContain("World controls are paused while Run in Game is running.");
    expect(html).toContain("Busy");
    // The relocated selects ride the same gate as seed/reroll/run.
    const sizeTrigger = html.match(/<button[^>]*aria-label="World size"[^>]*>/)?.[0] ?? "";
    expect(sizeTrigger).toContain("disabled");
  });

  it("disables run controls while config save/deploy is running (shared operation gate)", () => {
    const html = renderFooter({
      isSaveDeployRunning: true,
      operationBusyLabel: "World controls are paused while Save & Deploy is running.",
    });

    expect(html).toContain("disabled");
    expect(html).toContain("World controls are paused while Save &amp; Deploy is running.");
  });
});

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { AppHeader, type AppHeaderProps } from "../src/components/composites/AppHeader.js";
import { TooltipProvider } from "../src/components/ui/tooltip.js";

// Config-precedence pins (P7): the saved-config selector claims the file only
// while the authored setup state equals the file-derived state. Once drifted,
// the selector itself goes "Custom" (warning emphasis) and the companion
// Re-apply affordance restores the file exactly. Static markup cannot open
// the Radix select, so these pins assert the drifted chrome + affordances.
// Args are the E4a `AppHeaderSetupState` view-model (structure-rewire §5) —
// the app container derives it; here it is a plain structural fixture.

function renderHeader(overrides: Partial<AppHeaderProps> = {}) {
  return renderToStaticMarkup(
    <TooltipProvider>
      <AppHeader
        themePreference="dark"
        onThemeCycle={vi.fn()}
        showGrid={false}
        onShowGridChange={vi.fn()}
        setup={{
          savedConfig: { id: "tot-config", displayName: "ToT Config" },
          leaderId: "",
          civilizationId: "",
          difficultyId: "DIFFICULTY_CUSTOM",
          gameSpeedId: "",
        }}
        setupOptions={{
          savedConfigOptions: [
            { value: "", label: "No saved config" },
            { value: "tot-config", label: "ToT Config" },
          ],
          leaderOptions: [{ value: "", label: "Leader" }],
          civilizationOptions: [{ value: "", label: "Civilization" }],
          difficultyOptions: [{ value: "", label: "Difficulty" }],
          gameSpeedOptions: [{ value: "", label: "Speed" }],
        }}
        onSavedConfigChange={vi.fn()}
        onLeaderChange={vi.fn()}
        onCivilizationChange={vi.fn()}
        onDifficultyChange={vi.fn()}
        onGameSpeedChange={vi.fn()}
        {...overrides}
      />
    </TooltipProvider>
  );
}

describe("AppHeader saved-config precedence display", () => {
  it("claims the saved config cleanly when the setup state matches the file", () => {
    const html = renderHeader({ savedConfigModified: false });

    expect(html).not.toContain("Re-apply");
    expect(html).not.toContain("ring-warning");
  });

  it("shows Custom emphasis and the Re-apply affordance when the setup drifts from the file", () => {
    const html = renderHeader({ savedConfigModified: true });

    // The selector trigger carries the warning (Custom) emphasis...
    expect(html).toContain("ring-warning");
    // ...and the re-apply affordance names the drift and the way back.
    expect(html).toContain("Re-apply");
    expect(html).toContain("Game setup is Custom (drifted from ToT Config)");
  });
});

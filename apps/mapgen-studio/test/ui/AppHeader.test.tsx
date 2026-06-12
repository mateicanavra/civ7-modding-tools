import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { AppHeader, type AppHeaderProps } from "../../src/ui/components/AppHeader";
import { TooltipProvider } from "../../src/components/ui/tooltip";

// Config-precedence pins (P7): the saved-config selector claims the file only
// while the authored setup state equals the file-derived state. Once drifted,
// the selector itself goes "Custom" (warning emphasis) and the companion
// Re-apply affordance restores the file exactly. Static markup cannot open
// the Radix select, so these pins assert the drifted chrome + affordances.

const SAVED_CONFIG_REF = {
  id: "tot-config",
  displayName: "ToT Config",
  fileName: "ToT Config.Civ7Cfg",
  path: "/tmp/ToT Config.Civ7Cfg",
};

function renderHeader(overrides: Partial<AppHeaderProps> = {}) {
  return renderToStaticMarkup(
    <TooltipProvider>
      <AppHeader
        themePreference="dark"
        onThemeCycle={vi.fn()}
        showGrid={false}
        onShowGridChange={vi.fn()}
        setupConfig={{
          savedConfig: SAVED_CONFIG_REF,
          gameOptions: { Difficulty: "DIFFICULTY_CUSTOM" },
          playerOptions: [{ playerId: 0, options: {} }],
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
        onSetupConfigChange={vi.fn()}
        onSavedConfigChange={vi.fn()}
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

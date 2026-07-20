// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { RecipePanel } from "../src/components/panels/RecipePanel.js";
import { TooltipProvider } from "../src/components/ui/tooltip.js";

afterEach(cleanup);

describe("RecipePanel overrides toggle", () => {
  it("reports overrides enablement through the single Power icon toggle", () => {
    const onConfigEditingEnabledChange = vi.fn();

    render(
      <TooltipProvider>
        <RecipePanel
          config={{}}
          configSchema={{ type: "object", properties: {} }}
          onConfigChange={vi.fn()}
          recipeOptions={[{ value: "standard", label: "Standard" }]}
          configOptions={[{ value: "studio-current", label: "Studio Current" }]}
          selectedStep=""
          recipeId="standard"
          onRecipeChange={vi.fn()}
          configId="studio-current"
          onConfigSelect={vi.fn()}
          onSaveToCurrent={vi.fn()}
          onSaveAsNew={vi.fn()}
          onImportConfig={vi.fn()}
          onExportConfig={vi.fn()}
          isDirty={false}
          configEditingEnabled={false}
          onConfigEditingEnabledChange={onConfigEditingEnabledChange}
        />
      </TooltipProvider>
    );

    // One control, one signal (flat-and-flush delta 3): no Switch, no
    // Editing/Locked caption — a fixed Power glyph whose highlight and
    // aria-pressed carry the state.
    expect(screen.queryByRole("switch")).toBeNull();
    expect(screen.queryByText("Locked")).toBeNull();
    const toggle = screen.getByRole("button", { name: "Enable Overrides" });
    expect(toggle.getAttribute("aria-pressed")).toBe("false");

    fireEvent.click(toggle);

    expect(onConfigEditingEnabledChange).toHaveBeenCalledWith(true);
  });
});

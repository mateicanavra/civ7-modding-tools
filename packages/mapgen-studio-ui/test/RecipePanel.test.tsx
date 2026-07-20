// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { RecipePanel } from "../src/components/panels/RecipePanel.js";
import { TooltipProvider } from "../src/components/ui/tooltip.js";

afterEach(cleanup);

describe("RecipePanel config editing lock", () => {
  it("labels and reports the toggle as config editing enablement", () => {
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

    expect(screen.getByText("Locked")).toBeTruthy();
    const editingSwitch = screen.getByRole("switch", { name: "Enable config editing" });
    expect(editingSwitch.getAttribute("aria-checked")).toBe("false");

    fireEvent.click(editingSwitch);

    expect(onConfigEditingEnabledChange).toHaveBeenCalledWith(true);
  });
});

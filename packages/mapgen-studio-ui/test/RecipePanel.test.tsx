// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { RecipePanel } from "../src/components/panels/RecipePanel.js";
import { TooltipProvider } from "../src/components/ui/tooltip.js";

afterEach(cleanup);

describe("RecipePanel blocked authoring recovery", () => {
  it("disables Save and exposes only the two explicit config recovery commands", () => {
    const onSelectExistingCatalogConfig = vi.fn();
    const onCreateNewEditorConfig = vi.fn();
    const onSaveToCurrent = vi.fn();

    render(
      <TooltipProvider>
        <RecipePanel
          config={null}
          configSchema={{}}
          onConfigChange={vi.fn()}
          onConfigReset={vi.fn()}
          recipeOptions={[{ value: "standard", label: "Standard" }]}
          presetOptions={[{ value: "none", label: "None" }]}
          selectedStep=""
          settings={{ recipe: "standard", preset: "none", seed: "123" }}
          onSettingsChange={vi.fn()}
          onSaveToCurrent={onSaveToCurrent}
          onSaveAsNew={vi.fn()}
          onImportPreset={vi.fn()}
          onExportPreset={vi.fn()}
          isDirty={false}
          authoringBlocked={{
            reason: "missing-catalog-source",
            onSelectExistingCatalogConfig,
            onCreateNewEditorConfig,
          }}
        />
      </TooltipProvider>
    );

    expect(screen.getByText("The saved catalog config is no longer available.")).toBeTruthy();
    const selectExisting = screen.getByRole("button", {
      name: "Select existing catalog config",
    });
    const createNew = screen.getByRole("button", { name: "Create new editor config" });
    const save = screen.getByRole("button", { name: /^Save & Deploy$/i });
    expect(save).toHaveProperty("disabled", true);

    fireEvent.click(selectExisting);
    fireEvent.click(createNew);
    fireEvent.click(save);

    expect(onSelectExistingCatalogConfig).toHaveBeenCalledTimes(1);
    expect(onCreateNewEditorConfig).toHaveBeenCalledTimes(1);
    expect(onSaveToCurrent).not.toHaveBeenCalled();
  });
});

describe("RecipePanel config editing lock", () => {
  it("labels and reports the toggle as config editing enablement", () => {
    const onConfigEditingEnabledChange = vi.fn();

    render(
      <TooltipProvider>
        <RecipePanel
          config={{}}
          configSchema={{ type: "object", properties: {} }}
          onConfigChange={vi.fn()}
          onConfigReset={vi.fn()}
          recipeOptions={[{ value: "standard", label: "Standard" }]}
          presetOptions={[{ value: "none", label: "None" }]}
          selectedStep=""
          settings={{ recipe: "standard", preset: "none", seed: "123" }}
          onSettingsChange={vi.fn()}
          onSaveToCurrent={vi.fn()}
          onSaveAsNew={vi.fn()}
          onImportPreset={vi.fn()}
          onExportPreset={vi.fn()}
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

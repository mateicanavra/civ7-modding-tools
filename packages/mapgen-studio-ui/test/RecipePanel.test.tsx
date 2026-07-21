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

describe("RecipePanel scoped stage restore (flat-and-flush deltas 5+8, re-cut)", () => {
  const configSchema = {
    type: "object",
    properties: {
      elevation: {
        type: "object",
        title: "Elevation",
        properties: {
          seaLevel: { type: "number", title: "Sea level", default: 0.6 },
          mountainDensity: { type: "number", title: "Mountain density", default: 0.3 },
        },
      },
      climate: {
        type: "object",
        title: "Climate",
        properties: {
          rainfall: {
            type: "string",
            title: "Rainfall",
            enum: ["arid", "temperate", "wet"],
            default: "temperate",
          },
        },
      },
    },
  };

  // The LOADED config: elevation was loaded off-default (0.7), climate at the
  // schema default. The working config drifts elevation further (0.85).
  const baselineConfig = {
    elevation: { seaLevel: 0.7, mountainDensity: 0.3 },
    climate: { rainfall: "temperate" },
  };

  const renderPanel = (onConfigChange: (next: unknown) => void) =>
    render(
      <TooltipProvider>
        <RecipePanel
          config={{
            elevation: { seaLevel: 0.85, mountainDensity: 0.3 },
            climate: { rainfall: "temperate" },
          }}
          baselineConfig={baselineConfig}
          configSchema={configSchema}
          onConfigChange={onConfigChange}
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
          configEditingEnabled={true}
          onConfigEditingEnabledChange={vi.fn()}
        />
      </TooltipProvider>
    );

  it("change-gates the per-stage Discard icon and rolls only that stage back to the loaded config", () => {
    const onConfigChange = vi.fn();
    renderPanel(onConfigChange);

    // Delta 8 (re-keyed): the Discard icon is present ONLY on the stage with
    // working changes vs the LOADED config — absent, not disabled, on the
    // clean one.
    expect(screen.getByRole("button", { name: "Discard Changes to Elevation" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Discard Changes to Climate" })).toBeNull();

    // Delta 5: the dialog copy names the one stage it acts on; confirming
    // rolls ONLY that stage back to the loaded config's values (0.7 — the
    // baseline, NOT the 0.6 schema default; one resolution path).
    fireEvent.click(screen.getByRole("button", { name: "Discard Changes to Elevation" }));
    expect(
      screen.getByText(
        "This will discard your working changes to Elevation, restoring the values from the selected config."
      )
    ).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Discard" }));

    expect(onConfigChange).toHaveBeenCalledWith({
      elevation: { seaLevel: 0.7, mountainDensity: 0.3 },
      climate: { rainfall: "temperate" },
    });
  });

  it("offers Reset to Defaults behind the stage options menu and patches to schema defaults", () => {
    const onConfigChange = vi.fn();
    renderPanel(onConfigChange);

    // The destructive defaults reset lives BEHIND the options menu, not on
    // the header row (the Eraser semantics moved there in the re-cut).
    const optionsTrigger = screen.getByRole("button", { name: "Elevation Options" });
    fireEvent.keyDown(optionsTrigger, { key: "Enter" });
    fireEvent.click(screen.getByRole("menuitem", { name: /Reset to Defaults/ }));

    expect(
      screen.getByText("This will reset Elevation to the recipe's default values.")
    ).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Reset" }));

    expect(onConfigChange).toHaveBeenCalledWith({
      elevation: { seaLevel: 0.6, mountainDensity: 0.3 },
      climate: { rainfall: "temperate" },
    });
  });
});

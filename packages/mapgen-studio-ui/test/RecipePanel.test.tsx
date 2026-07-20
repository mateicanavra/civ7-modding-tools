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

describe("RecipePanel scoped stage reset (flat-and-flush deltas 5+8)", () => {
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

  it("dirty-gates the per-stage Reset icon and patches only that stage back to schema defaults", () => {
    const onConfigChange = vi.fn();

    render(
      <TooltipProvider>
        <RecipePanel
          config={{
            elevation: { seaLevel: 0.85, mountainDensity: 0.3 },
            climate: { rainfall: "temperate" },
          }}
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

    // Delta 8: the Reset icon is present ONLY on the drifted stage — absent,
    // not disabled, on the clean one.
    expect(screen.getByRole("button", { name: "Reset Elevation" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Reset Climate" })).toBeNull();

    // Delta 5: the dialog copy names the one stage it acts on; confirming
    // patches ONLY that stage back to its schema defaults (the same values
    // the dirty gate compared against — one resolution path).
    fireEvent.click(screen.getByRole("button", { name: "Reset Elevation" }));
    expect(
      screen.getByText("This will reset Elevation overrides to their default values.")
    ).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Reset" }));

    expect(onConfigChange).toHaveBeenCalledWith({
      elevation: { seaLevel: 0.6, mountainDensity: 0.3 },
      climate: { rainfall: "temperate" },
    });
  });
});

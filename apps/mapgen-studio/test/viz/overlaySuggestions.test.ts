import { describe, expect, it } from "vitest";
import { getOverlaySuggestions } from "../../src/recipes/overlaySuggestions";

describe("getOverlaySuggestions", () => {
  it("returns configured suggestions for known recipes", () => {
    const suggestions = getOverlaySuggestions("mod-swooper-maps/standard");
    expect(suggestions.length).toBeGreaterThan(0);
    expect(suggestions.some((suggestion) => suggestion.primaryDataTypeKey === "foundation.history.boundaryType")).toBe(
      true
    );
  });

  it("returns an empty list for unknown recipes", () => {
    expect(getOverlaySuggestions("unknown/recipe")).toEqual([]);
  });
});

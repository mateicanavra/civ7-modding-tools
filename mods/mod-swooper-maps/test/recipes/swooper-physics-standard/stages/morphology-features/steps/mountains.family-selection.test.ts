import { describe, expect, it } from "bun:test";
import { assertSameMountainFamilySelection } from "../../../../../../src/recipes/standard/stages/morphology-features/steps/mountains/step.js";

describe("mountains family selection", () => {
  it("treats absent mountain-family config as the empty shared config", () => {
    expect(() =>
      assertSameMountainFamilySelection(
        { strategy: "default", config: {} },
        { strategy: "default" }
      )
    ).not.toThrow();
  });

  it("does not collapse nested undefined mountain-family config to an empty object", () => {
    expect(() =>
      assertSameMountainFamilySelection(
        { strategy: "default", config: { nested: undefined } },
        { strategy: "default", config: { nested: {} } }
      )
    ).toThrow("identical ridge/foothill config");
  });
});

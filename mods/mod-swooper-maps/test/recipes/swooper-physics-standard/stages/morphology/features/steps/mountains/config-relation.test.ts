import { describe, expect, it } from "bun:test";
import { assertSameMountainFamilyConfig } from "../../../../../../../../src/recipes/standard/stages/morphology/features/steps/mountains/config-relation.js";

describe("mountain family config", () => {
  it("treats absent mountain-family config as the empty shared config", () => {
    expect(() =>
      assertSameMountainFamilyConfig(
        { strategy: "orogenic-range-growth", config: {} },
        { strategy: "mountain-proximity" }
      )
    ).not.toThrow();
  });

  it("does not collapse nested undefined mountain-family config to an empty object", () => {
    expect(() =>
      assertSameMountainFamilyConfig(
        { strategy: "orogenic-range-growth", config: { nested: undefined } },
        { strategy: "mountain-proximity", config: { nested: {} } }
      )
    ).toThrow("identical ridge/foothill config");
  });
});

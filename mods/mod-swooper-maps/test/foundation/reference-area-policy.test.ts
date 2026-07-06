import { describe, expect, it } from "bun:test";

import {
  deriveFoundationReferenceArea,
  requireEnvDimensions,
} from "../../src/domain/foundation/model/policy/reference-area.js";

describe("foundation reference-area policy", () => {
  it("derives reference area exactly from validated map dimensions", () => {
    const dimensions = requireEnvDimensions(
      { env: { dimensions: { width: 84, height: 54 } } },
      "test"
    );

    expect(deriveFoundationReferenceArea(dimensions)).toBe(4536);
  });

  it("fails instead of falling back to a synthetic reference area", () => {
    expect(() =>
      requireEnvDimensions({ env: { dimensions: { width: 0, height: 54 } } }, "test")
    ).toThrow("[Foundation] Invalid env.dimensions for test.");

    expect(() =>
      requireEnvDimensions({ env: { dimensions: { width: 84.5, height: 54 } } }, "test")
    ).toThrow("[Foundation] Invalid env.dimensions for test.");

    expect(() =>
      deriveFoundationReferenceArea({ width: Number.MAX_SAFE_INTEGER, height: 2 })
    ).toThrow("[Foundation] Cannot derive reference area from invalid map area.");
  });
});

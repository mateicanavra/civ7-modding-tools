import { describe, expect, it } from "bun:test";

import { resolveDefaultDiscoveryPlacement } from "../src/discovery-defaults.js";

describe("resolveDefaultDiscoveryPlacement", () => {
  it("selects mapping matching active DiscoverySiftingType", () => {
    const result = resolveDefaultDiscoveryPlacement({
      discoveryVisualTypes: {
        IMPROVEMENT_CAVE: 10,
        IMPROVEMENT_RUINS: 20,
      },
      discoveryActivationTypes: {
        BASIC: 1,
        INVESTIGATION: 2,
      },
      discoverySiftingImprovements: [
        { QueueType: 111, ConstructibleType: "IMPROVEMENT_CAVE", Activation: "BASIC" },
        { QueueType: 222, ConstructibleType: "IMPROVEMENT_RUINS", Activation: "INVESTIGATION" },
      ],
      activeSiftingType: 222,
    });

    expect(result).toEqual({
      discoveryVisualType: 20,
      discoveryActivationType: 2,
    });
  });

  it("returns null when active DiscoverySiftingType has no mapping", () => {
    const result = resolveDefaultDiscoveryPlacement({
      discoveryVisualTypes: {
        IMPROVEMENT_CAVE: 10,
        IMPROVEMENT_RUINS: 20,
      },
      discoveryActivationTypes: {
        BASIC: 1,
        INVESTIGATION: 2,
      },
      discoverySiftingImprovements: [
        { QueueType: 111, ConstructibleType: "IMPROVEMENT_CAVE", Activation: "BASIC" },
        { QueueType: 222, ConstructibleType: "IMPROVEMENT_RUINS", Activation: "INVESTIGATION" },
      ],
      activeSiftingType: 999,
    });

    expect(result).toBeNull();
  });

  it("returns null when active mapping exists but row is unusable", () => {
    const result = resolveDefaultDiscoveryPlacement({
      discoveryVisualTypes: {
        IMPROVEMENT_CAVE: 10,
      },
      discoveryActivationTypes: {
        BASIC: 1,
      },
      discoverySiftingImprovements: [
        { QueueType: 111, ConstructibleType: "UNKNOWN", Activation: "UNKNOWN" },
      ],
      activeSiftingType: 111,
    });

    expect(result).toBeNull();
  });
});

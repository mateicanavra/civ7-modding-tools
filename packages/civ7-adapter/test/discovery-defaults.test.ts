import { describe, expect, it } from "bun:test";

import { resolveDefaultDiscoveryPlacement } from "../src/discovery-defaults.js";

describe("resolveDefaultDiscoveryPlacement", () => {
  it("selects mapping matching active DiscoverySiftingType hash", () => {
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
        { QueueType: "QUEUE_A", ConstructibleType: "IMPROVEMENT_CAVE", Activation: "BASIC" },
        { QueueType: "QUEUE_B", ConstructibleType: "IMPROVEMENT_RUINS", Activation: "INVESTIGATION" },
      ],
      activeSiftingType: 222,
      makeHash: (value) => (value === "QUEUE_B" ? 222 : 111),
    });

    expect(result).toEqual({
      discoveryVisualType: 20,
      discoveryActivationType: 2,
    });
  });

  it("falls back to first valid row when active DiscoverySiftingType is unavailable", () => {
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
        { QueueType: "QUEUE_A", ConstructibleType: "IMPROVEMENT_CAVE", Activation: "BASIC" },
        { QueueType: "QUEUE_B", ConstructibleType: "IMPROVEMENT_RUINS", Activation: "INVESTIGATION" },
      ],
      activeSiftingType: "UNKNOWN_QUEUE",
      makeHash: () => 999,
    });

    expect(result).toEqual({
      discoveryVisualType: 10,
      discoveryActivationType: 1,
    });
  });

  it("falls back to cave/basic constants when table entries are unusable", () => {
    const result = resolveDefaultDiscoveryPlacement({
      discoveryVisualTypes: {
        IMPROVEMENT_CAVE: 10,
      },
      discoveryActivationTypes: {
        BASIC: 1,
      },
      discoverySiftingImprovements: [
        { QueueType: "QUEUE_A", ConstructibleType: "UNKNOWN", Activation: "UNKNOWN" },
      ],
    });

    expect(result).toEqual({
      discoveryVisualType: 10,
      discoveryActivationType: 1,
    });
  });
});

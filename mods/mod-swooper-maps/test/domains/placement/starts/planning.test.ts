import { describe, expect, it } from "bun:test";
import placementDomain from "@mapgen/domain/placement/ops";

describe("start planning", () => {
  it("materializes the authored tier bias from operation defaults", () => {
    expect(placementDomain.ops.planStarts.defaultConfig.config.tierBias).toEqual({
      primary: 0.08,
      islandCluster: 0.02,
      marginal: -0.08,
    });
  });
});

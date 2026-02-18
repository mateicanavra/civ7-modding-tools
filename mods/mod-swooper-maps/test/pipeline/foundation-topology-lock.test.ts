import { describe, expect, it } from "bun:test";

import { STANDARD_STAGES } from "../../src/recipes/standard/recipe.js";

const EXPECTED_STAGE_IDS = [
  "foundation",
  "morphology-coasts",
  "morphology-routing",
  "morphology-erosion",
  "morphology-features",
  "hydrology-climate-baseline",
  "hydrology-hydrography",
  "hydrology-climate-refine",
  "ecology-pedology",
  "ecology-biomes",
  "ecology-features-score",
  "ecology-ice",
  "ecology-reefs",
  "ecology-wetlands",
  "ecology-vegetation",
  "map-morphology",
  "map-hydrology",
  "map-ecology",
  "placement",
] as const;

const LEGACY_STAGE_ALIASES = [
  "hydrology-pre",
  "hydrology-core",
  "hydrology-post",
  "narrative-pre",
  "narrative-mid",
  "narrative-post",
] as const;

describe("pipeline foundation-topology lock", () => {
  it("keeps the standard stage topology and ordering locked", () => {
    const stageIds = STANDARD_STAGES.map((stage) => stage.id);
    expect(stageIds).toEqual(EXPECTED_STAGE_IDS);
  });

  it("does not allow legacy stage aliases in the standard recipe", () => {
    const stageIds = STANDARD_STAGES.map((stage) => stage.id);
    for (const legacyId of LEGACY_STAGE_ALIASES) {
      expect(stageIds).not.toContain(legacyId);
    }
  });

  it("keeps a single foundation stage path in the topology", () => {
    const stageIds = STANDARD_STAGES.map((stage) => stage.id);
    const foundationPathIds = stageIds.filter(
      (id) => id === "foundation" || id.startsWith("foundation-")
    );
    expect(foundationPathIds).toEqual(["foundation"]);
  });
});

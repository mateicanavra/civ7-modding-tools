import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import path from "node:path";

import PlotMountainsStepContract from "../../src/recipes/standard/stages/map-morphology/steps/plotMountains.contract.js";
import { foundationArtifacts } from "../../src/recipes/standard/stages/foundation/artifacts.js";

describe("morphology contract guardrails", () => {
  it("requires history/provenance tiles for belt synthesis and drops legacy plates dependency", () => {
    const requires = PlotMountainsStepContract.artifacts?.requires ?? [];
    const requiredIds = requires.map((artifact: any) => (typeof artifact === "string" ? artifact : artifact.id));

    expect(requiredIds).toContain(foundationArtifacts.tectonicHistoryTiles.id);
    expect(requiredIds).toContain(foundationArtifacts.tectonicProvenanceTiles.id);
    expect(requiredIds).not.toContain(foundationArtifacts.plates.id);
  });

  it("plotMountains does not reference legacy plate drivers", () => {
    const repoRoot = path.resolve(import.meta.dir, "../..");
    const plotMountainsPath = path.join(
      repoRoot,
      "src/recipes/standard/stages/map-morphology/steps/plotMountains.ts"
    );
    const text = readFileSync(plotMountainsPath, "utf8");
    expect(text).not.toContain("foundationPlates");
    expect(text).not.toContain("foundationArtifacts.plates");
  });
});

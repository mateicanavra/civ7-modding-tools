import { describe, expect, it } from "bun:test";

import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

import { MAP_PROJECTION_EFFECT_TAGS } from "../../src/recipes/standard/tags.js";
import standardRecipe, { STANDARD_STAGES } from "../../src/recipes/standard/recipe.js";

function listFilesRecursive(rootDir: string): string[] {
  const out: string[] = [];
  const entries = readdirSync(rootDir);
  for (const entry of entries) {
    const full = path.join(rootDir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      out.push(...listFilesRecursive(full));
      continue;
    }
    out.push(full);
  }
  return out;
}

describe("map stamping contract guardrails", () => {
  it("does not allow physics contracts to require map artifacts or effects", () => {
    const repoRoot = path.resolve(import.meta.dir, "../..");
    const roots = [
      path.join(repoRoot, "src/recipes/standard/stages/foundation"),
      path.join(repoRoot, "src/recipes/standard/stages/morphology-coasts"),
      path.join(repoRoot, "src/recipes/standard/stages/morphology-routing"),
      path.join(repoRoot, "src/recipes/standard/stages/morphology-erosion"),
      path.join(repoRoot, "src/recipes/standard/stages/morphology-features"),
      path.join(repoRoot, "src/recipes/standard/stages/hydrology-climate-baseline"),
      path.join(repoRoot, "src/recipes/standard/stages/hydrology-hydrography"),
      path.join(repoRoot, "src/recipes/standard/stages/hydrology-climate-refine"),
      path.join(repoRoot, "src/recipes/standard/stages/ecology-pedology"),
      path.join(repoRoot, "src/recipes/standard/stages/ecology-biomes"),
      path.join(repoRoot, "src/recipes/standard/stages/ecology-features"),
    ];

    const contractFiles = roots.flatMap((candidate) => {
      try {
        const stat = statSync(candidate);
        if (stat.isDirectory()) {
          return listFilesRecursive(candidate).filter((file) => file.endsWith("contract.ts"));
        }
        return [candidate];
      } catch {
        return [];
      }
    });

    expect(contractFiles.length).toBeGreaterThan(0);

    for (const file of contractFiles) {
      const text = readFileSync(file, "utf8");
      expect(text).not.toContain("artifact:map.");
      expect(text).not.toContain("effect:map.");
      expect(text).not.toContain("MAP_PROJECTION_EFFECT_TAGS.map");
    }
  });

  it("only calls TerrainBuilder.buildElevation in the dedicated build-elevation step", () => {
    const repoRoot = path.resolve(import.meta.dir, "../..");
    const stagesRoot = path.join(repoRoot, "src/recipes/standard/stages");
    const files = listFilesRecursive(stagesRoot).filter((file) => file.endsWith(".ts"));

    const callers = files.filter((file) => {
      const text = readFileSync(file, "utf8");
      return /adapter\.buildElevation\s*\(/.test(text);
    });

    callers.sort();
    expect(callers).toEqual([path.join(stagesRoot, "map-elevation/steps/buildElevation.ts")]);

    const contractText = readFileSync(
      path.join(stagesRoot, "map-elevation/steps/buildElevation.contract.ts"),
      "utf8"
    );
    expect(contractText).toContain("MAP_PROJECTION_EFFECT_TAGS.map.elevationBuilt");
  });

  it("keeps Civ7 terrain materialization order aligned with static water before elevation", () => {
    const stepIds = standardRecipe.recipe.steps.map((step) => step.id);
    const indexOfStep = (stage: string, step: string): number =>
      stepIds.findIndex((id) => id.endsWith(`.${stage}.${step}`));

    const lakes = indexOfStep("map-hydrology", "lakes");
    const elevation = indexOfStep("map-elevation", "build-elevation");
    const rivers = indexOfStep("map-rivers", "plot-rivers");
    const ecologyScoring = indexOfStep("ecology-features", "score-layers");

    expect(lakes).toBeGreaterThan(-1);
    expect(elevation).toBeGreaterThan(-1);
    expect(rivers).toBeGreaterThan(-1);
    expect(ecologyScoring).toBeGreaterThan(-1);
    expect(lakes).toBeLessThan(elevation);
    expect(elevation).toBeLessThan(rivers);
    expect(rivers).toBeLessThan(ecologyScoring);
  });

  it("keeps deterministic lake projection on the stampLakes adapter capability", () => {
    const repoRoot = path.resolve(import.meta.dir, "../..");
    const stagesRoot = path.join(repoRoot, "src/recipes/standard/stages");
    const files = listFilesRecursive(stagesRoot).filter((file) => file.endsWith(".ts"));

    const engineLakeGenerators = files.filter((file) => {
      const text = readFileSync(file, "utf8");
      return /adapter\.generateLakes\s*\(/.test(text);
    });
    const lakeStampers = files.filter((file) => {
      const text = readFileSync(file, "utf8");
      return /adapter\.stampLakes\s*\(/.test(text);
    });

    engineLakeGenerators.sort();
    lakeStampers.sort();
    expect(engineLakeGenerators).toEqual([]);
    expect(lakeStampers).toEqual([path.join(stagesRoot, "map-hydrology/steps/lakes.ts")]);
  });

  it("keeps native Civ river modeling constrained to the dedicated map-rivers step", () => {
    const repoRoot = path.resolve(import.meta.dir, "../..");
    const stagesRoot = path.join(repoRoot, "src/recipes/standard/stages");
    const files = listFilesRecursive(stagesRoot).filter((file) => file.endsWith(".ts"));

    const nativeRiverGeneratorCallers = files.filter((file) => {
      const text = readFileSync(file, "utf8");
      return /adapter\.modelRivers\s*\(/.test(text);
    });

    nativeRiverGeneratorCallers.sort();
    expect(nativeRiverGeneratorCallers).toEqual([
      path.join(stagesRoot, "map-rivers/steps/plotRivers.ts"),
    ]);

    const plotRiversText = readFileSync(
      path.join(stagesRoot, "map-rivers/steps/plotRivers.ts"),
      "utf8"
    );
    const plotRiversContractText = readFileSync(
      path.join(stagesRoot, "map-rivers/steps/plotRivers.contract.ts"),
      "utf8"
    );
    expect(plotRiversText).toContain("selectNavigableRiverTerrain");
    expect(plotRiversText).toContain("setTerrainType");
    expect(plotRiversText).toContain("map.rivers.authoredTerrainMaterialization");
    expect(plotRiversText).toContain("CIV7_DEFAULT_RIVER_MODELING_ARGS");
    expect(plotRiversText).toContain("modelRivers(");
    expect(plotRiversContractText).toContain("MAP_PROJECTION_EFFECT_TAGS.map.riversPlotted");
    expect(plotRiversContractText).not.toContain("riversModeled");
  });

  it("labels standard recipe tile layers as Civ row-major odd-q", () => {
    const repoRoot = path.resolve(import.meta.dir, "../..");
    const stagesRoot = path.join(repoRoot, "src/recipes/standard/stages");
    const files = listFilesRecursive(stagesRoot).filter((file) => file.endsWith(".ts"));

    const oddRCallsites = files.filter((file) =>
      readFileSync(file, "utf8").includes("tile.hexOddR")
    );

    expect(oddRCallsites).toEqual([]);
  });

  it("does not add stage-shaped map helper directories outside the recipe stage list", () => {
    const repoRoot = path.resolve(import.meta.dir, "../..");
    const stagesRoot = path.join(repoRoot, "src/recipes/standard/stages");
    const recipeStageIds = new Set(STANDARD_STAGES.map((stage) => stage.id));
    const mapStageDirs = readdirSync(stagesRoot)
      .filter((entry) => entry.startsWith("map-"))
      .filter((entry) => statSync(path.join(stagesRoot, entry)).isDirectory());

    for (const dir of mapStageDirs) {
      expect(recipeStageIds.has(dir)).toBe(true);
    }
  });

  it("does not allow physics stage code to call engine elevation/cliff reads", () => {
    const repoRoot = path.resolve(import.meta.dir, "../..");
    const physicsRoots = [
      path.join(repoRoot, "src/recipes/standard/stages/foundation"),
      path.join(repoRoot, "src/recipes/standard/stages/morphology-coasts"),
      path.join(repoRoot, "src/recipes/standard/stages/morphology-routing"),
      path.join(repoRoot, "src/recipes/standard/stages/morphology-erosion"),
      path.join(repoRoot, "src/recipes/standard/stages/morphology-features"),
      path.join(repoRoot, "src/recipes/standard/stages/hydrology-climate-baseline"),
      path.join(repoRoot, "src/recipes/standard/stages/hydrology-hydrography"),
      path.join(repoRoot, "src/recipes/standard/stages/hydrology-climate-refine"),
      path.join(repoRoot, "src/recipes/standard/stages/ecology-pedology"),
      path.join(repoRoot, "src/recipes/standard/stages/ecology-biomes"),
      path.join(repoRoot, "src/recipes/standard/stages/ecology-features"),
    ];

    const files = physicsRoots.flatMap((candidate) => {
      try {
        const stat = statSync(candidate);
        if (stat.isDirectory()) {
          return listFilesRecursive(candidate).filter((file) => file.endsWith(".ts"));
        }
        return [candidate];
      } catch {
        return [];
      }
    });

    expect(files.length).toBeGreaterThan(0);

    for (const file of files) {
      const text = readFileSync(file, "utf8");
      expect(text).not.toMatch(/adapter\.getElevation\s*\(/);
      expect(text).not.toMatch(/adapter\.isCliffCrossing\s*\(/);
    }
  });

  it("does not introduce artifact:map.realized.* anywhere in source", () => {
    const repoRoot = path.resolve(import.meta.dir, "../..");
    const workspaceRoot = path.resolve(repoRoot, "..", "..");
    const roots = [
      path.join(repoRoot, "src"),
      path.join(workspaceRoot, "packages/mapgen-core/src"),
    ];

    const files = roots.flatMap((candidate) => {
      try {
        const stat = statSync(candidate);
        if (stat.isDirectory()) {
          return listFilesRecursive(candidate).filter((file) => file.endsWith(".ts"));
        }
        return [candidate];
      } catch {
        return [];
      }
    });

    expect(files.length).toBeGreaterThan(0);

    for (const file of files) {
      const text = readFileSync(file, "utf8");
      expect(text).not.toContain("artifact:map.realized.");
    }
  });

  it("uses the expected naming convention for map effects", () => {
    const effectPattern = /^effect:map\.[a-z][a-zA-Z0-9]*(Plotted|Built|ParityCaptured)$/;
    const effects = Object.values(MAP_PROJECTION_EFFECT_TAGS.map);

    expect(effects.length).toBeGreaterThan(0);
    for (const effect of effects) {
      expect(effect).toMatch(effectPattern);
    }
  });
});

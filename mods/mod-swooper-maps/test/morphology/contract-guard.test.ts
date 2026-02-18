import { describe, expect, it } from "bun:test";

import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

import LandmassPlatesStepContract from "../../src/recipes/standard/stages/morphology-coasts/steps/landmassPlates.contract.js";
import PlotMountainsStepContract from "../../src/recipes/standard/stages/map-morphology/steps/plotMountains.contract.js";
import { mapArtifacts } from "../../src/recipes/standard/map-artifacts.js";
import { morphologyArtifacts } from "../../src/recipes/standard/stages/morphology/artifacts.js";

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

describe("morphology contract guardrails", () => {
  it("does not introduce runtime-continent or LandmassRegionId surfaces into morphology contracts", () => {
    const repoRoot = path.resolve(import.meta.dir, "../..");
    const contracts = [
      path.join(repoRoot, "src/recipes/standard/stages/morphology/artifacts.ts"),
      path.join(repoRoot, "src/recipes/standard/stages/morphology-coasts/steps"),
      path.join(repoRoot, "src/recipes/standard/stages/morphology-routing/steps"),
      path.join(repoRoot, "src/recipes/standard/stages/morphology-erosion/steps"),
      path.join(repoRoot, "src/recipes/standard/stages/morphology-features/steps"),
    ];

    const files = contracts.flatMap((candidate) => {
      try {
        const stat = statSync(candidate);
        if (stat.isDirectory()) {
          return listFilesRecursive(candidate).filter(
            (file) => file.endsWith("contract.ts") || file.endsWith("artifacts.ts")
          );
        }
        return [candidate];
      } catch {
        return [];
      }
    });

    expect(files.length).toBeGreaterThan(0);

    for (const file of files) {
      const text = readFileSync(file, "utf8");
      expect(text).not.toContain("westContinent");
      expect(text).not.toContain("eastContinent");
      expect(text).not.toContain("LandmassRegionId");
    }
  });

  it("does not reintroduce runtime-continent or LandmassRegionId surfaces in morphology/hydrology steps", () => {
    const repoRoot = path.resolve(import.meta.dir, "../..");
    const roots = [
      path.join(repoRoot, "src/recipes/standard/stages/morphology-coasts"),
      path.join(repoRoot, "src/recipes/standard/stages/morphology-routing"),
      path.join(repoRoot, "src/recipes/standard/stages/morphology-erosion"),
      path.join(repoRoot, "src/recipes/standard/stages/morphology-features"),
      path.join(repoRoot, "src/recipes/standard/stages/hydrology-climate-baseline/steps"),
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
      expect(text).not.toContain("westContinent");
      expect(text).not.toContain("eastContinent");
      expect(text).not.toContain("LandmassRegionId");
      expect(text).not.toContain("markLandmassId(");
    }
  });

  it("does not publish HOTSPOTS overlays from morphology steps", () => {
    const repoRoot = path.resolve(import.meta.dir, "../..");
    const roots = [
      path.join(repoRoot, "src/recipes/standard/stages/morphology-coasts"),
      path.join(repoRoot, "src/recipes/standard/stages/morphology-routing"),
      path.join(repoRoot, "src/recipes/standard/stages/morphology-erosion"),
      path.join(repoRoot, "src/recipes/standard/stages/morphology-features"),
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
      const calls = Array.from(text.matchAll(/publishStoryOverlay\s*\([\s\S]{0,200}\)/g));
      const publishesHotspots = calls.some((match) =>
        /HOTSPOTS|["']hotspots["']/.test(match[0])
      );
      expect(publishesHotspots).toBe(false);
    }
  });

  it("does not retain morphology dual-read diagnostics in morphology-coasts steps", () => {
    const repoRoot = path.resolve(import.meta.dir, "../..");
    const root = path.join(repoRoot, "src/recipes/standard/stages/morphology-coasts/steps");
    const files = listFilesRecursive(root).filter((file) => file.endsWith(".ts"));

    expect(files.length).toBeGreaterThan(0);

    for (const file of files) {
      const text = readFileSync(file, "utf8");
      expect(text).not.toContain("morphology.dualRead");
      expect(text).not.toContain("dualRead");
    }
  });

  it("does not import legacy config bags in morphology contracts or steps", () => {
    const repoRoot = path.resolve(import.meta.dir, "../..");
    const roots = [
      path.join(repoRoot, "src/recipes/standard/stages/morphology-coasts"),
      path.join(repoRoot, "src/recipes/standard/stages/morphology-routing"),
      path.join(repoRoot, "src/recipes/standard/stages/morphology-erosion"),
      path.join(repoRoot, "src/recipes/standard/stages/morphology-features"),
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
      expect(text).not.toContain("@mapgen/domain/config");
    }
  });

  it("does not require story overlays in morphology step contracts", () => {
    const repoRoot = path.resolve(import.meta.dir, "../..");
    const roots = [
      path.join(repoRoot, "src/recipes/standard/stages/morphology-coasts/steps"),
      path.join(repoRoot, "src/recipes/standard/stages/morphology-routing/steps"),
      path.join(repoRoot, "src/recipes/standard/stages/morphology-erosion/steps"),
      path.join(repoRoot, "src/recipes/standard/stages/morphology-features/steps"),
    ];

    const contractFiles = roots.flatMap((root) =>
      listFilesRecursive(root).filter((file) => file.endsWith("contract.ts"))
    );

    expect(contractFiles.length).toBeGreaterThan(0);

    for (const file of contractFiles) {
      const text = readFileSync(file, "utf8");
      expect(text).not.toContain("artifact:storyOverlays");
    }
  });

  it("does not import overlays in morphology step implementations", () => {
    const repoRoot = path.resolve(import.meta.dir, "../..");
    const roots = [
      path.join(repoRoot, "src/recipes/standard/stages/morphology-coasts/steps"),
      path.join(repoRoot, "src/recipes/standard/stages/morphology-routing/steps"),
      path.join(repoRoot, "src/recipes/standard/stages/morphology-erosion/steps"),
      path.join(repoRoot, "src/recipes/standard/stages/morphology-features/steps"),
    ];

    const stepFiles = roots.flatMap((root) =>
      listFilesRecursive(root).filter((file) => file.endsWith(".ts") && !file.endsWith("contract.ts"))
    );

    expect(stepFiles.length).toBeGreaterThan(0);

    for (const file of stepFiles) {
      const text = readFileSync(file, "utf8");
      expect(text).not.toContain("overlays.js");
      expect(text).not.toContain("readOverlay");
    }
  });

  it("does not reintroduce legacy morphology module imports", () => {
    const repoRoot = path.resolve(import.meta.dir, "../..");
    const srcRoot = path.join(repoRoot, "src");
    const legacyImports = [
      "@mapgen/domain/morphology/landmass",
      "@mapgen/domain/morphology/coastlines",
      "@mapgen/domain/morphology/islands",
      "@mapgen/domain/morphology/mountains",
      "@mapgen/domain/morphology/volcanoes",
    ];

    const files = listFilesRecursive(srcRoot).filter((file) => file.endsWith(".ts"));
    expect(files.length).toBeGreaterThan(0);

    for (const file of files) {
      const text = readFileSync(file, "utf8");
      for (const legacyImport of legacyImports) {
        expect(text).not.toContain(legacyImport);
      }
    }
  });

  it("does not use legacy morphology config keys in map configs", () => {
    const repoRoot = path.resolve(import.meta.dir, "../..");
    const mapsRoot = path.join(repoRoot, "src/maps");
    const candidates = [
      ...listFilesRecursive(mapsRoot).filter((file) => file.endsWith(".ts")),
      path.join(repoRoot, "test/standard-run.test.ts"),
    ];

    const legacyKeyPatterns = [/\blandmass\s*:/, /\boceanSeparation\s*:/];

    for (const file of candidates) {
      const text = readFileSync(file, "utf8");
      for (const pattern of legacyKeyPatterns) {
        expect(text).not.toMatch(pattern);
      }
    }
  });

  it("synthesizes belt drivers in morphology-coasts and consumes them downstream (no legacy plates)", () => {
    const landmassRequires = LandmassPlatesStepContract.artifacts?.requires ?? [];
    const landmassRequiredIds = landmassRequires.map((artifact: any) =>
      typeof artifact === "string" ? artifact : artifact.id
    );
    expect(landmassRequiredIds).toContain(mapArtifacts.foundationCrustTiles.id);
    expect(landmassRequiredIds).toContain(mapArtifacts.foundationTectonicHistoryTiles.id);
    expect(landmassRequiredIds).toContain(mapArtifacts.foundationTectonicProvenanceTiles.id);
    expect(landmassRequiredIds).not.toContain(mapArtifacts.foundationPlates.id);

    const landmassProvides = LandmassPlatesStepContract.artifacts?.provides ?? [];
    const landmassProvidedIds = landmassProvides.map((artifact: any) =>
      typeof artifact === "string" ? artifact : artifact.id
    );
    expect(landmassProvidedIds).toContain(morphologyArtifacts.beltDrivers.id);

    const mountainsRequires = PlotMountainsStepContract.artifacts?.requires ?? [];
    const mountainRequiredIds = mountainsRequires.map((artifact: any) =>
      typeof artifact === "string" ? artifact : artifact.id
    );
    expect(mountainRequiredIds).toContain(morphologyArtifacts.beltDrivers.id);
    expect(mountainRequiredIds).not.toContain(mapArtifacts.foundationTectonicHistoryTiles.id);
    expect(mountainRequiredIds).not.toContain(mapArtifacts.foundationTectonicProvenanceTiles.id);
    expect(mountainRequiredIds).not.toContain(mapArtifacts.foundationPlates.id);
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

  it("publishes HOTSPOTS only from the narrative-owned producer", () => {
    const repoRoot = path.resolve(import.meta.dir, "../..");
    const srcRoot = path.join(repoRoot, "src");
    const allowed = ["src/domain/narrative/tagging/hotspots.ts"];

    const files = listFilesRecursive(srcRoot).filter((file) => file.endsWith(".ts"));
    const publishers = files
      .filter((file) => {
        const text = readFileSync(file, "utf8");
        const calls = Array.from(text.matchAll(/publishStoryOverlay\s*\([\s\S]{0,200}\)/g));
        return calls.some((match) => /HOTSPOTS|["']hotspots["']/.test(match[0]));
      })
      .map((file) => path.relative(repoRoot, file))
      .sort();

    expect(publishers).toEqual(allowed);
  });

  it("does not use morphology effect-tag gating in morphology steps or tags", () => {
    const repoRoot = path.resolve(import.meta.dir, "../..");
    const roots = [
      path.join(repoRoot, "src/recipes/standard/stages/morphology-coasts"),
      path.join(repoRoot, "src/recipes/standard/stages/morphology-routing"),
      path.join(repoRoot, "src/recipes/standard/stages/morphology-erosion"),
      path.join(repoRoot, "src/recipes/standard/stages/morphology-features"),
      path.join(repoRoot, "src/recipes/standard/tags.ts"),
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
      expect(text).not.toContain("landmassApplied");
      expect(text).not.toContain("coastlinesApplied");
      expect(text).not.toContain("effect:engine.landmassApplied");
      expect(text).not.toContain("effect:engine.coastlinesApplied");
    }
  });

  it("does not use morphology effect-tag gating in migrated consumer contracts", () => {
    const repoRoot = path.resolve(import.meta.dir, "../..");
    const migratedContracts: Array<{
      file: string;
      mustRequire: "topography";
    }> = [
      {
        file: path.join(repoRoot, "src/recipes/standard/stages/map-hydrology/steps/lakes.contract.ts"),
        mustRequire: "topography",
      },
    ];

    for (const { file, mustRequire } of migratedContracts) {
      const text = readFileSync(file, "utf8");
      expect(text).not.toContain("M4_EFFECT_TAGS.engine.coastlinesApplied");
      expect(text).not.toContain("M4_EFFECT_TAGS.engine.landmassApplied");

      if (mustRequire === "topography") {
        expect(text).toContain("morphologyArtifacts.topography");
      }
    }
  });
});

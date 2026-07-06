import { describe, expect, it } from "bun:test";

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import foundation, { artifacts as foundationArtifacts } from "@mapgen/domain/foundation";
import {
  FOUNDATION_MANTLE_FORCING_ARTIFACT_TAG,
  FOUNDATION_MANTLE_POTENTIAL_ARTIFACT_TAG,
  FOUNDATION_PLATE_MOTION_ARTIFACT_TAG,
  FOUNDATION_TECTONIC_HISTORY_TILES_ARTIFACT_TAG,
  FOUNDATION_TECTONIC_PROVENANCE_ARTIFACT_TAG,
  FOUNDATION_TECTONIC_PROVENANCE_TILES_ARTIFACT_TAG,
} from "@swooper/mapgen-core";
import * as ts from "typescript";
import { mapArtifacts } from "../../src/recipes/standard/map-artifacts.js";
import ProjectionStepContract from "../../src/recipes/standard/stages/foundation-projection/steps/projection.contract.js";
import TectonicsStepContract from "../../src/recipes/standard/stages/foundation-tectonics/steps/tectonics.contract.js";

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

// Foundation is authored as a family of sibling stages (foundation-mantle,
// -plates, -tectonics, -crust, -projection) plus the shared `foundation/` hub
// (artifacts/validation/viz). Discover them dynamically so these guards span the
// whole family without re-encoding the stage list.
function foundationStageDirs(repoRoot: string): string[] {
  const stagesDir = path.join(repoRoot, "src/recipes/standard/stages");
  return readdirSync(stagesDir)
    .filter((entry) => entry === "foundation" || entry.startsWith("foundation-"))
    .map((entry) => path.join(stagesDir, entry))
    .filter((full) => statSync(full).isDirectory());
}

function listImportSources(text: string, fileName: string): string[] {
  const sourceFile = ts.createSourceFile(fileName, text, ts.ScriptTarget.Latest, false);

  return sourceFile.statements.flatMap((statement) => {
    if (ts.isImportDeclaration(statement) && ts.isStringLiteral(statement.moduleSpecifier)) {
      return [statement.moduleSpecifier.text];
    }

    return [];
  });
}

describe("foundation contract guardrails", () => {
  it("requires volcanism in foundation plates schema", () => {
    expect(JSON.stringify(mapArtifacts.foundationPlates.schema)).toContain("volcanism");
  });

  it("does not reintroduce legacy plate kinematics on plateGraph", () => {
    const repoRoot = path.resolve(import.meta.dir, "../..");
    const contractFile = path.join(
      repoRoot,
      "src/domain/foundation/ops/compute-plate-graph/contract.ts"
    );
    const text = readFileSync(contractFile, "utf8");
    expect(text).not.toContain("velocityX");
    expect(text).not.toContain("velocityY");
    expect(text).not.toContain("rotation");
  });

  it("keeps foundation advanced override lowering typed (no runtime cast-merge path)", () => {
    const repoRoot = path.resolve(import.meta.dir, "../..");
    const stageIndexFiles = foundationStageDirs(repoRoot)
      .map((dir) => path.join(dir, "index.ts"))
      .filter((file) => existsSync(file));

    expect(stageIndexFiles.length).toBeGreaterThan(0);

    const bannedExactFragments = [
      "const mantleOverrideValues = (advanced?.mantleForcing ?? {}) as",
      "const budgetsOverrideValues = (advanced?.budgets ?? {}) as",
      "const meshOverrideValues = (advanced?.mesh ?? {}) as",
      "typeof mantleOverrideValues.",
      "typeof budgetsOverrideValues.",
      "typeof meshOverrideValues.",
      "FOUNDATION_STUDIO_STEP_CONFIG_IDS",
      "__studioUiMetaSentinelPath",
      "advancedRecord[stepId]",
      "FOUNDATION_STEP_IDS",
    ] as const;

    const bannedStructuralPatterns = [
      // Reintroduced cast-merge over advanced bags, e.g. `(advanced?.foo ?? {}) as ...`.
      /\(\s*advanced\?\.[^)]*\?\?\s*\{\}\s*\)\s+as\s+/,
      // Reintroduced spread fallback object merge branch.
      /\.\.\.\s*\(\s*typeof\s+[^)]+===\s*['"]object['"]\s*\?\s*[^:]+:\s*\{\}\s*\)/,
      // Reintroduced dynamic sentinel passthrough path.
      /\badvancedRecord\s*\[\s*stepId\s*\]/,
    ] as const;

    for (const stageFile of stageIndexFiles) {
      const text = readFileSync(stageFile, "utf8");
      for (const fragment of bannedExactFragments) {
        expect(text, stageFile).not.toContain(fragment);
      }
      for (const pattern of bannedStructuralPatterns) {
        expect(text, stageFile).not.toMatch(pattern);
      }
    }
  });

  it("exposes tectonics as focused op contracts instead of the legacy aggregate", () => {
    const domainOpKeys = Object.keys(foundation.ops);
    const tectonicsStepOpKeys = Object.keys(TectonicsStepContract.ops);

    expect(domainOpKeys).not.toContain("computeTectonicHistory");
    expect(tectonicsStepOpKeys).not.toContain("computeTectonicHistory");
    expect(tectonicsStepOpKeys).toEqual(
      expect.arrayContaining([
        "computeEraPlateMembership",
        "computeEraTectonicFields",
        "computeTectonicHistoryRollups",
        "computeTectonicsCurrent",
        "computeTracerAdvection",
        "computeTectonicProvenance",
      ])
    );
  });

  it("keeps decomposed tectonics strategy imports local to op rules/modules", () => {
    const repoRoot = path.resolve(import.meta.dir, "../..");
    const strategyFiles = [
      "src/domain/foundation/ops/compute-era-plate-membership/strategies/default.ts",
      "src/domain/foundation/ops/compute-era-tectonic-fields/strategies/default.ts",
      "src/domain/foundation/ops/compute-hotspot-events/strategies/default.ts",
      "src/domain/foundation/ops/compute-segment-events/strategies/default.ts",
      "src/domain/foundation/ops/compute-tectonic-history-rollups/strategies/default.ts",
      "src/domain/foundation/ops/compute-tectonics-current/strategies/default.ts",
      "src/domain/foundation/ops/compute-tracer-advection/strategies/default.ts",
      "src/domain/foundation/ops/compute-tectonic-provenance/strategies/default.ts",
    ] as const;
    const allowedImportSources = new Set(["@swooper/mapgen-core/authoring", "../contract.js"]);

    for (const relativeFile of strategyFiles) {
      const text = readFileSync(path.join(repoRoot, relativeFile), "utf8");
      expect(text).not.toContain("domain/foundation/lib/tectonics/");
      expect(text).not.toContain("lib/tectonics/");
      const importSources = listImportSources(text, relativeFile);

      expect(importSources.length).toBeGreaterThan(0);
      expect(importSources.some((source) => source.startsWith("../rules/"))).toBe(true);

      for (const source of importSources) {
        const isLocalRulesImport = source.startsWith("../rules/");
        const isAllowedImport = isLocalRulesImport || allowedImportSources.has(source);
        expect(isAllowedImport).toBe(true);
      }
    }
  });

  it("keeps decomposed tectonics op rules free of lib/tectonics re-export shims", () => {
    const repoRoot = path.resolve(import.meta.dir, "../..");
    const rulesFiles = [
      "src/domain/foundation/ops/compute-era-plate-membership/rules/index.ts",
      "src/domain/foundation/ops/compute-era-tectonic-fields/rules/index.ts",
      "src/domain/foundation/ops/compute-hotspot-events/rules/index.ts",
      "src/domain/foundation/ops/compute-segment-events/rules/index.ts",
      "src/domain/foundation/ops/compute-tectonic-history-rollups/rules/index.ts",
      "src/domain/foundation/ops/compute-tectonics-current/rules/index.ts",
      "src/domain/foundation/ops/compute-tracer-advection/rules/index.ts",
      "src/domain/foundation/ops/compute-tectonic-provenance/rules/index.ts",
    ] as const;

    const forbiddenReExportPattern =
      /^\s*export\s+\{[^}]+\}\s+from\s+["'][^"']*lib\/tectonics\/[^"']+["'];?/m;

    for (const relativeFile of rulesFiles) {
      const text = readFileSync(path.join(repoRoot, relativeFile), "utf8");
      expect(text).not.toMatch(forbiddenReExportPattern);
    }
  });

  it("publishes maximal foundation truth ids + map-facing projection ids via contracts", () => {
    expect(foundationArtifacts.mantlePotential.id).toBe(FOUNDATION_MANTLE_POTENTIAL_ARTIFACT_TAG);
    expect(foundationArtifacts.mantleForcing.id).toBe(FOUNDATION_MANTLE_FORCING_ARTIFACT_TAG);
    expect(foundationArtifacts.plateMotion.id).toBe(FOUNDATION_PLATE_MOTION_ARTIFACT_TAG);
    expect(foundationArtifacts.tectonicProvenance.id).toBe(
      FOUNDATION_TECTONIC_PROVENANCE_ARTIFACT_TAG
    );
    expect(mapArtifacts.foundationTectonicHistoryTiles.id).toBe(
      FOUNDATION_TECTONIC_HISTORY_TILES_ARTIFACT_TAG
    );
    expect(mapArtifacts.foundationTectonicProvenanceTiles.id).toBe(
      FOUNDATION_TECTONIC_PROVENANCE_TILES_ARTIFACT_TAG
    );
  });

  it("requires tectonic provenance before projection", () => {
    const requires = ProjectionStepContract.artifacts?.requires ?? [];
    const requiredIds = requires.map((artifact: any) =>
      typeof artifact === "string" ? artifact : artifact.id
    );
    expect(requiredIds).toContain(foundationArtifacts.tectonicProvenance.id);
  });

  it("keeps projected motion surfaces derived from canonical plateMotion", () => {
    const repoRoot = path.resolve(import.meta.dir, "../..");
    const projectionContractFile = path.join(
      repoRoot,
      "src/recipes/standard/stages/foundation-projection/steps/projection.contract.ts"
    );
    const projectionStepFile = path.join(
      repoRoot,
      "src/recipes/standard/stages/foundation-projection/steps/projection.ts"
    );

    const projectionContractText = readFileSync(projectionContractFile, "utf8");
    expect(projectionContractText).toContain("foundationArtifacts.plateMotion");

    const projectionStepText = readFileSync(projectionStepFile, "utf8");
    expect(projectionStepText).toContain(
      "const plateMotion = deps.artifacts.foundationPlateMotion.read(context);"
    );
    expect(projectionStepText).toContain("plateMotion,");
    expect(projectionStepText).toContain("platesResult.plates.movementU");
    expect(projectionStepText).toContain("platesResult.plates.movementV");
    expect(projectionStepText).not.toContain("plateGraph.plates[");
    expect(projectionStepText).not.toContain(".velocityX");
    expect(projectionStepText).not.toContain(".velocityY");
  });
});

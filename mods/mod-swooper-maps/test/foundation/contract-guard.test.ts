import { describe, expect, it } from "bun:test";

import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import {
  FOUNDATION_MANTLE_FORCING_ARTIFACT_TAG,
  FOUNDATION_MANTLE_POTENTIAL_ARTIFACT_TAG,
  FOUNDATION_PLATE_MOTION_ARTIFACT_TAG,
  FOUNDATION_TECTONIC_HISTORY_TILES_ARTIFACT_TAG,
  FOUNDATION_TECTONIC_PROVENANCE_ARTIFACT_TAG,
  FOUNDATION_TECTONIC_PROVENANCE_TILES_ARTIFACT_TAG,
} from "@swooper/mapgen-core";
import { mapArtifacts } from "../../src/recipes/standard/map-artifacts.js";
import { foundationArtifacts } from "../../src/recipes/standard/stages/foundation/artifacts.js";
import ProjectionStepContract from "../../src/recipes/standard/stages/foundation/steps/projection.contract.js";

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

describe("foundation contract guardrails", () => {
  it("requires volcanism in foundation plates schema", () => {
    const repoRoot = path.resolve(import.meta.dir, "../..");
    const artifactsFile = path.join(repoRoot, "src/recipes/standard/stages/foundation/artifacts.ts");
    const text = readFileSync(artifactsFile, "utf8");
    expect(text).toContain("volcanism");
  });

  it("does not import domain config bag schemas from op contracts", () => {
    const repoRoot = path.resolve(import.meta.dir, "../..");
    const foundationOpsDir = path.join(repoRoot, "src/domain/foundation/ops");
    const contractFiles = listFilesRecursive(foundationOpsDir).filter((file) =>
      file.endsWith(path.join("contract.ts"))
    );

    expect(contractFiles.length).toBeGreaterThan(0);

    for (const file of contractFiles) {
      const text = readFileSync(file, "utf8");
      expect(text).not.toContain("@mapgen/domain/config");
      expect(text).not.toContain("FoundationConfigSchema");
    }
  });

  it("does not import domain config bags from the foundation step contract", () => {
    const repoRoot = path.resolve(import.meta.dir, "../..");
    const stepsDir = path.join(repoRoot, "src/recipes/standard/stages/foundation/steps");
    const contractFiles = listFilesRecursive(stepsDir).filter((file) => file.endsWith("contract.ts"));

    expect(contractFiles.length).toBeGreaterThan(0);

    for (const file of contractFiles) {
      const text = readFileSync(file, "utf8");
      expect(text).not.toContain("@mapgen/domain/config");
      expect(text).not.toContain("FoundationConfigSchema");
    }
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

  it("does not reintroduce removed foundation surfaces", () => {
    const repoRoot = path.resolve(import.meta.dir, "../..");
    const roots = [
      path.join(repoRoot, "src/domain/foundation"),
      path.join(repoRoot, "src/recipes/standard/stages/foundation"),
      path.join(repoRoot, "src/maps"),
    ];

    const files = roots.flatMap((root) =>
      listFilesRecursive(root).filter((file) => file.endsWith(".ts"))
    );

    expect(files.length).toBeGreaterThan(0);

    for (const file of files) {
      const text = readFileSync(file, "utf8");
      expect(text).not.toContain("directionality");
      expect(text).not.toContain("foundation.dynamics");
      expect(text).not.toContain("foundation.config");
      expect(text).not.toContain("foundation.seed");
      expect(text).not.toContain("foundation.diagnostics");
      expect(text).not.toContain("wrap_x");
      expect(text).not.toContain("wrap_y");
      expect(text).not.toContain("environment_wrap");

      // M11/U11: remove legacy latitude-band tectonics injection and neighbor-scan op surface.
      expect(text).not.toMatch(/\bcomputeTectonics\b/);
      expect(text).not.toContain("polarBandFraction");
      expect(text).not.toContain("polarBoundary");
    }
  });

  it("does not reintroduce dead foundation knobs or required-unused inputs", () => {
    const repoRoot = path.resolve(import.meta.dir, "../..");
    const roots = [
      path.join(repoRoot, "src/domain/foundation"),
      path.join(repoRoot, "src/recipes/standard/stages/foundation"),
      path.join(repoRoot, "src/maps"),
    ];
    const files = roots.flatMap((root) =>
      listFilesRecursive(root).filter((file) => file.endsWith(".ts") || file.endsWith(".json"))
    );
    expect(files.length).toBeGreaterThan(0);

    for (const file of files) {
      const text = readFileSync(file, "utf8");
      expect(text).not.toContain("upliftToMaturity");
      expect(text).not.toContain("ageToMaturity");
      expect(text).not.toContain("disruptionToMaturity");
      expect(text).not.toContain("lithosphereProfile");
      expect(text).not.toContain("mantleProfile");
      expect(text).not.toContain("potentialMode");
      expect(text).not.toContain("tangentialSpeed");
      expect(text).not.toContain("tangentialJitterDeg");
    }

    const tectonicHistoryContract = readFileSync(
      path.join(repoRoot, "src/domain/foundation/ops/compute-tectonic-history/contract.ts"),
      "utf8"
    );
    expect(tectonicHistoryContract).not.toContain("segments: FoundationTectonicSegmentsSchema");
  });

  it("keeps foundation advanced override lowering typed (no runtime cast-merge path)", () => {
    const repoRoot = path.resolve(import.meta.dir, "../..");
    const stageFile = path.join(repoRoot, "src/recipes/standard/stages/foundation/index.ts");
    const text = readFileSync(stageFile, "utf8");

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

    for (const fragment of bannedExactFragments) {
      expect(text).not.toContain(fragment);
    }

    const bannedStructuralPatterns = [
      // Reintroduced cast-merge over advanced bags, e.g. `(advanced?.foo ?? {}) as ...`.
      /\(\s*advanced\?\.[^)]*\?\?\s*\{\}\s*\)\s+as\s+/,
      // Reintroduced spread fallback object merge branch.
      /\.\.\.\s*\(\s*typeof\s+[^)]+===\s*['"]object['"]\s*\?\s*[^:]+:\s*\{\}\s*\)/,
      // Reintroduced dynamic sentinel passthrough path.
      /\badvancedRecord\s*\[\s*stepId\s*\]/,
    ] as const;

    for (const pattern of bannedStructuralPatterns) {
      expect(text).not.toMatch(pattern);
    }
  });

  it("keeps tectonics step on decomposed op chain (no mega-op binding)", () => {
    const repoRoot = path.resolve(import.meta.dir, "../..");
    const tectonicsStepContract = readFileSync(
      path.join(repoRoot, "src/recipes/standard/stages/foundation/steps/tectonics.contract.ts"),
      "utf8"
    );
    expect(tectonicsStepContract).not.toMatch(/\bcomputeTectonicHistory\s*:/);
    expect(tectonicsStepContract).toContain("computeEraPlateMembership");
    expect(tectonicsStepContract).toContain("computeEraTectonicFields");
    expect(tectonicsStepContract).toContain("computeTectonicHistoryRollups");
    expect(tectonicsStepContract).toContain("computeTectonicsCurrent");
    expect(tectonicsStepContract).toContain("computeTracerAdvection");
    expect(tectonicsStepContract).toContain("computeTectonicProvenance");
  });

  it("does not expose legacy computeTectonicHistory through foundation domain ops surfaces", () => {
    const repoRoot = path.resolve(import.meta.dir, "../..");
    const contractsFile = readFileSync(path.join(repoRoot, "src/domain/foundation/ops/contracts.ts"), "utf8");
    const implementationsFile = readFileSync(path.join(repoRoot, "src/domain/foundation/ops/index.ts"), "utf8");

    expect(contractsFile).not.toMatch(/\bcomputeTectonicHistory\b/);
    expect(contractsFile).not.toContain("./compute-tectonic-history/contract.js");

    expect(implementationsFile).not.toMatch(/\bcomputeTectonicHistory\b/);
    expect(implementationsFile).not.toContain("./compute-tectonic-history/index.js");
  });

  it("keeps decomposed tectonics ops off legacy compute-tectonic-history internals", () => {
    const repoRoot = path.resolve(import.meta.dir, "../..");
    const decomposedOpFiles = [
      "src/domain/foundation/ops/compute-era-plate-membership/contract.ts",
      "src/domain/foundation/ops/compute-era-plate-membership/strategies/default.ts",
      "src/domain/foundation/ops/compute-era-tectonic-fields/contract.ts",
      "src/domain/foundation/ops/compute-era-tectonic-fields/strategies/default.ts",
      "src/domain/foundation/ops/compute-hotspot-events/contract.ts",
      "src/domain/foundation/ops/compute-hotspot-events/strategies/default.ts",
      "src/domain/foundation/ops/compute-segment-events/contract.ts",
      "src/domain/foundation/ops/compute-segment-events/strategies/default.ts",
      "src/domain/foundation/ops/compute-tectonic-history-rollups/contract.ts",
      "src/domain/foundation/ops/compute-tectonic-history-rollups/strategies/default.ts",
      "src/domain/foundation/ops/compute-tectonics-current/contract.ts",
      "src/domain/foundation/ops/compute-tectonics-current/strategies/default.ts",
      "src/domain/foundation/ops/compute-tracer-advection/contract.ts",
      "src/domain/foundation/ops/compute-tracer-advection/strategies/default.ts",
      "src/domain/foundation/ops/compute-tectonic-provenance/contract.ts",
      "src/domain/foundation/ops/compute-tectonic-provenance/strategies/default.ts",
    ] as const;

    for (const relativeFile of decomposedOpFiles) {
      const text = readFileSync(path.join(repoRoot, relativeFile), "utf8");
      expect(text).not.toContain("compute-tectonic-history/lib/");
      expect(text).not.toContain("compute-tectonic-history/contract.js");
    }
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
      expect(text).not.toContain("compute-tectonic-history/lib/");
      expect(text).not.toContain("compute-tectonic-history/contract.js");

      const importSources = text
        .split(/\r?\n/)
        .map((line) => line.match(/^\s*import(?:\s+type)?\s+.*\sfrom\s+["']([^"']+)["'];?/))
        .filter((match): match is RegExpMatchArray => Boolean(match))
        .map((match) => match[1]);

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

  it("keeps foundation tectonics consumers off compute-tectonic-history contract imports", () => {
    const repoRoot = path.resolve(import.meta.dir, "../..");
    const files = [
      "src/domain/foundation/ops/compute-crust-evolution/contract.ts",
      "src/domain/foundation/ops/compute-plates-tensors/contract.ts",
      "src/domain/foundation/ops/compute-plates-tensors/lib/project-plates.ts",
      "src/domain/foundation/lib/require.ts",
    ] as const;

    for (const relativeFile of files) {
      const text = readFileSync(path.join(repoRoot, relativeFile), "utf8");
      expect(text).not.toContain("compute-tectonic-history/contract.js");
      expect(text).toContain("tectonics/schemas.js");
    }
  });

  it("publishes maximal foundation truth ids + map-facing projection ids via contracts", () => {
    expect(foundationArtifacts.mantlePotential.id).toBe(FOUNDATION_MANTLE_POTENTIAL_ARTIFACT_TAG);
    expect(foundationArtifacts.mantleForcing.id).toBe(FOUNDATION_MANTLE_FORCING_ARTIFACT_TAG);
    expect(foundationArtifacts.plateMotion.id).toBe(FOUNDATION_PLATE_MOTION_ARTIFACT_TAG);
    expect(foundationArtifacts.tectonicProvenance.id).toBe(FOUNDATION_TECTONIC_PROVENANCE_ARTIFACT_TAG);
    expect(mapArtifacts.foundationTectonicHistoryTiles.id).toBe(FOUNDATION_TECTONIC_HISTORY_TILES_ARTIFACT_TAG);
    expect(mapArtifacts.foundationTectonicProvenanceTiles.id).toBe(FOUNDATION_TECTONIC_PROVENANCE_TILES_ARTIFACT_TAG);
  });

  it("requires tectonic provenance before projection", () => {
    const requires = ProjectionStepContract.artifacts?.requires ?? [];
    const requiredIds = requires.map((artifact: any) => (typeof artifact === "string" ? artifact : artifact.id));
    expect(requiredIds).toContain(foundationArtifacts.tectonicProvenance.id);
  });

  it("keeps projected motion surfaces derived from canonical plateMotion", () => {
    const repoRoot = path.resolve(import.meta.dir, "../..");
    const projectionContractFile = path.join(
      repoRoot,
      "src/recipes/standard/stages/foundation/steps/projection.contract.ts"
    );
    const projectionStepFile = path.join(
      repoRoot,
      "src/recipes/standard/stages/foundation/steps/projection.ts"
    );

    const projectionContractText = readFileSync(projectionContractFile, "utf8");
    expect(projectionContractText).toContain("foundationArtifacts.plateMotion");

    const projectionStepText = readFileSync(projectionStepFile, "utf8");
    expect(projectionStepText).toContain("const plateMotion = deps.artifacts.foundationPlateMotion.read(context);");
    expect(projectionStepText).toContain("plateMotion,");
    expect(projectionStepText).toContain("platesResult.plates.movementU");
    expect(projectionStepText).toContain("platesResult.plates.movementV");
    expect(projectionStepText).not.toContain("plateGraph.plates[");
    expect(projectionStepText).not.toContain(".velocityX");
    expect(projectionStepText).not.toContain(".velocityY");
  });
});

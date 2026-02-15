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
      expect(text).not.toContain("computeTectonics");
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

  it("publishes maximal foundation artifact ids via contracts", () => {
    expect(foundationArtifacts.mantlePotential.id).toBe(FOUNDATION_MANTLE_POTENTIAL_ARTIFACT_TAG);
    expect(foundationArtifacts.mantleForcing.id).toBe(FOUNDATION_MANTLE_FORCING_ARTIFACT_TAG);
    expect(foundationArtifacts.plateMotion.id).toBe(FOUNDATION_PLATE_MOTION_ARTIFACT_TAG);
    expect(foundationArtifacts.tectonicProvenance.id).toBe(FOUNDATION_TECTONIC_PROVENANCE_ARTIFACT_TAG);
    expect(foundationArtifacts.tectonicHistoryTiles.id).toBe(FOUNDATION_TECTONIC_HISTORY_TILES_ARTIFACT_TAG);
    expect(foundationArtifacts.tectonicProvenanceTiles.id).toBe(
      FOUNDATION_TECTONIC_PROVENANCE_TILES_ARTIFACT_TAG
    );
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

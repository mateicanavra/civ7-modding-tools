#!/usr/bin/env node
import path from "node:path";
import {
  assertContains,
  assertNoFindings,
  importSources,
  modRoot,
  repoRel,
  stagesRoot,
} from "../../../../../../../../_support/execution/command-check/mapgen-static-check-lib.mjs";

const foundationDomain = path.join(modRoot, "src/domain/foundation");
const foundationStage = path.join(stagesRoot, "foundation");
const findings = [];

const artifactsFile = path.join(foundationStage, "artifacts.ts");
findings.push(...assertContains(artifactsFile, "volcanism", "foundation-plates-schema"));

const tectonicsContract = path.join(stagesRoot, "foundation-tectonics/steps/tectonics.contract.ts");
for (const op of [
  "computeEraPlateMembership",
  "computeEraTectonicFields",
  "computeTectonicHistoryRollups",
  "computeTectonicsCurrent",
  "computeTracerAdvection",
  "computeTectonicProvenance",
]) {
  findings.push(...assertContains(tectonicsContract, op, "focused-tectonics-op-contract"));
}

const strategyFiles = [
  "compute-era-plate-membership",
  "compute-era-tectonic-fields",
  "compute-hotspot-events",
  "compute-segment-events",
  "compute-tectonic-history-rollups",
  "compute-tectonics-current",
  "compute-tracer-advection",
  "compute-tectonic-provenance",
].map((op) => path.join(foundationDomain, `ops/${op}/strategies/default.ts`));
for (const file of strategyFiles) {
  const sources = importSources(file).map((source) => source.source);
  if (!sources.some((source) => source.startsWith("../rules/"))) {
    findings.push({
      file: repoRel(file),
      line: 1,
      rule: "tectonics-strategy-rules-import",
      detail: "missing ../rules import",
    });
  }
}

findings.push(
  ...assertContains(
    artifactsFile,
    "artifact:foundation.mantlePotential",
    "foundation-artifact-tags"
  ),
  ...assertContains(artifactsFile, "artifact:foundation.mantleForcing", "foundation-artifact-tags"),
  ...assertContains(artifactsFile, "artifact:foundation.plateMotion", "foundation-artifact-tags"),
  ...assertContains(
    artifactsFile,
    "artifact:foundation.tectonicProvenance",
    "foundation-artifact-tags"
  ),
  ...assertContains(
    path.join(modRoot, "src/recipes/standard/map-artifacts.ts"),
    "artifact:map.foundationTectonicHistoryTiles",
    "foundation-map-artifact-tags"
  ),
  ...assertContains(
    path.join(modRoot, "src/recipes/standard/map-artifacts.ts"),
    "artifact:map.foundationTectonicProvenanceTiles",
    "foundation-map-artifact-tags"
  )
);

const projectionContract = path.join(
  stagesRoot,
  "foundation-projection/steps/projection.contract.ts"
);
const projectionStep = path.join(stagesRoot, "foundation-projection/steps/projection.ts");
findings.push(
  ...assertContains(
    projectionContract,
    "foundationArtifacts.tectonicProvenance",
    "projection-requires-provenance"
  ),
  ...assertContains(
    projectionContract,
    "foundationArtifacts.plateMotion",
    "projection-plate-motion-contract"
  ),
  ...assertContains(
    projectionStep,
    "const plateMotion = deps.artifacts.foundationPlateMotion.read(context);",
    "projection-plate-motion-source"
  ),
  ...assertContains(projectionStep, "plateMotion,", "projection-plate-motion-source"),
  ...assertContains(
    projectionStep,
    "platesResult.plates.movementU",
    "projection-plate-motion-source"
  ),
  ...assertContains(
    projectionStep,
    "platesResult.plates.movementV",
    "projection-plate-motion-source"
  )
);

assertNoFindings("preserve_decomposed_foundation_contract_surfaces", findings);

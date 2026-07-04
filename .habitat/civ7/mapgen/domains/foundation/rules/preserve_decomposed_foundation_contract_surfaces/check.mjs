#!/usr/bin/env node
import path from "node:path";
import {
  assertContains,
  assertNoFindings,
  importSources,
  modRoot,
  repoRel,
  textFindings,
  stagesRoot,
} from "../../../../../../_support/execution/command-check/mapgen-static-check-lib.mjs";

const foundationDomain = path.join(modRoot, "src/domain/foundation");
const foundationStage = path.join(stagesRoot, "foundation");
const findings = [];

const artifactsFile = path.join(foundationStage, "artifacts.ts");
const foundationValidationFile = path.join(foundationStage, "validation.ts");
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

const foundationStageArtifactSurfaces = [
  ["mesh", "mesh.artifact.ts", "artifact:foundation.mesh"],
  ["mantlePotential", "mantle-potential.artifact.ts", "artifact:foundation.mantlePotential"],
  ["mantleForcing", "mantle-forcing.artifact.ts", "artifact:foundation.mantleForcing"],
  ["crustInit", "crust-init.artifact.ts", "artifact:foundation.crustInit"],
  ["crust", "crust.artifact.ts", "artifact:foundation.crust"],
  ["plateMotion", "plate-motion.artifact.ts", "artifact:foundation.plateMotion"],
  ["plateGraph", "plate-graph.artifact.ts", "artifact:foundation.plateGraph"],
  ["tectonicSegments", "tectonic-segments.artifact.ts", "artifact:foundation.tectonicSegments"],
  ["tectonicHistory", "tectonic-history.artifact.ts", "artifact:foundation.tectonicHistory"],
  [
    "tectonicProvenance",
    "tectonic-provenance.artifact.ts",
    "artifact:foundation.tectonicProvenance",
  ],
  ["plateTopology", "plate-topology.artifact.ts", "artifact:foundation.plateTopology"],
  ["tectonics", "current-tectonics.artifact.ts", "artifact:foundation.tectonics"],
];

const foundationInternalArtifactSurfaces = [
  ["plate-id-by-era.artifact.ts", "artifact:foundation.plateIdByEra"],
  ["tectonic-era-fields.artifact.ts", "artifact:foundation.tectonicEraFields"],
  ["tectonic-events.artifact.ts", "artifact:foundation.tectonicEvents"],
  ["tracer-index-by-era.artifact.ts", "artifact:foundation.tracerIndexByEra"],
];

for (const [, fileName, artifactTag] of foundationStageArtifactSurfaces) {
  findings.push(
    ...assertContains(
      path.join(foundationDomain, `artifacts/${fileName}`),
      artifactTag,
      "foundation-artifact-tags"
    )
  );
}

for (const [fileName, artifactTag] of foundationInternalArtifactSurfaces) {
  findings.push(
    ...assertContains(
      path.join(foundationDomain, `artifacts/${fileName}`),
      artifactTag,
      "foundation-artifact-tags"
    )
  );
}

for (const [stageKey] of foundationStageArtifactSurfaces) {
  const importName = `${stageKey}Artifact`;
  findings.push(
    ...assertContains(artifactsFile, `${stageKey}: ${importName}`, "foundation-stage-artifact-wiring"),
    ...assertContains(artifactsFile, importName, "foundation-stage-artifact-public-import")
  );
}

findings.push(
  ...textFindings(
    foundationValidationFile,
    [
      "validateMeshArtifact",
      "validateCrustArtifact",
      "validateMantlePotentialArtifact",
      "validateMantleForcingArtifact",
      "validatePlateMotionArtifact",
      "validatePlateGraphArtifact",
      "validateTectonicSegmentsArtifact",
      "validateTectonicHistoryArtifact",
      "validateTectonicProvenanceArtifact",
      "validatePlateTopologyArtifact",
      "validateTectonicsArtifact",
    ],
    "foundation-truth-validators-owned-by-domain-artifacts"
  ),
);

findings.push(
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

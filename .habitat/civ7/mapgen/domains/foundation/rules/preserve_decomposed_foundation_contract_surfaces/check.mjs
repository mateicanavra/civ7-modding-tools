#!/usr/bin/env node
import path from "node:path";
import {
  assertContains,
  assertNoFindings,
  importSources,
  modRoot,
  repoRel,
  stagesRoot,
} from "../../../../../../_support/execution/command-check/mapgen-static-check-lib.mjs";

const foundationDomain = path.join(modRoot, "src/domain/foundation");
const findings = [];

findings.push(
  ...assertContains(
    path.join(modRoot, "src/recipes/standard/artifacts/foundation-plates.artifact.ts"),
    "volcanism",
    "foundation-plates-schema"
  )
);

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
  ["mesh", "mesh.artifact.ts", "artifact:foundation.mesh", "mesh"],
  [
    "mantlePotential",
    "mantle-potential.artifact.ts",
    "artifact:foundation.mantlePotential",
    "mantlePotential",
  ],
  [
    "mantleForcing",
    "mantle-forcing.artifact.ts",
    "artifact:foundation.mantleForcing",
    "mantleForcing",
  ],
  ["crustInit", "crust-init.artifact.ts", "artifact:foundation.crustInit", "crustInit"],
  ["crust", "crust.artifact.ts", "artifact:foundation.crust", "crust"],
  ["plateMotion", "plate-motion.artifact.ts", "artifact:foundation.plateMotion", "plateMotion"],
  ["plateGraph", "plate-graph.artifact.ts", "artifact:foundation.plateGraph", "plateGraph"],
  [
    "tectonicSegments",
    "tectonic-segments.artifact.ts",
    "artifact:foundation.tectonicSegments",
    "tectonicSegments",
  ],
  [
    "tectonicHistory",
    "tectonic-history.artifact.ts",
    "artifact:foundation.tectonicHistory",
    "tectonicHistory",
  ],
  [
    "tectonicProvenance",
    "tectonic-provenance.artifact.ts",
    "artifact:foundation.tectonicProvenance",
    "tectonicProvenance",
  ],
  [
    "plateTopology",
    "plate-topology.artifact.ts",
    "artifact:foundation.plateTopology",
    "plateTopology",
  ],
  [
    "tectonics",
    "current-tectonics.artifact.ts",
    "artifact:foundation.tectonics",
    "currentTectonics",
  ],
];

const foundationInternalArtifactSurfaces = [
  ["plate-id-by-era.artifact.ts", "artifact:foundation.plateIdByEra", "plateIdByEra"],
  ["tectonic-era-fields.artifact.ts", "artifact:foundation.tectonicEraFields", "tectonicEraFields"],
  ["tectonic-events.artifact.ts", "artifact:foundation.tectonicEvents", "tectonicEvents"],
  ["tracer-index-by-era.artifact.ts", "artifact:foundation.tracerIndexByEra", "tracerIndexByEra"],
];

for (const [, fileName, artifactTag, contractKey] of foundationStageArtifactSurfaces) {
  const artifactFile = path.join(foundationDomain, `artifacts/${fileName}`);
  findings.push(
    ...assertContains(artifactFile, artifactTag, "foundation-artifact-tags"),
    ...assertContains(artifactFile, "export function validate", "foundation-artifact-validators"),
    ...assertContains(
      path.join(foundationDomain, "artifacts/index.ts"),
      `${contractKey}: ${contractKey}.artifact`,
      "foundation-artifact-index"
    ),
    ...assertContains(
      path.join(foundationDomain, "artifacts/index.ts"),
      `${contractKey}: ${contractKey}.validate`,
      "foundation-artifact-validator-index"
    )
  );
}

for (const [fileName, artifactTag, contractKey] of foundationInternalArtifactSurfaces) {
  const artifactFile = path.join(foundationDomain, `artifacts/${fileName}`);
  findings.push(
    ...assertContains(artifactFile, artifactTag, "foundation-artifact-tags"),
    ...assertContains(artifactFile, "export function validate", "foundation-artifact-validators"),
    ...assertContains(
      path.join(foundationDomain, "artifacts/index.ts"),
      `${contractKey}: ${contractKey}.artifact`,
      "foundation-artifact-index"
    ),
    ...assertContains(
      path.join(foundationDomain, "artifacts/index.ts"),
      `${contractKey}: ${contractKey}.validate`,
      "foundation-artifact-validator-index"
    )
  );
}

findings.push(
  ...assertContains(
    path.join(foundationDomain, "index.ts"),
    'export { artifactContracts, artifacts, validators } from "./artifacts/index.js";',
    "foundation-domain-artifact-surface"
  )
);

findings.push(
  ...assertContains(
    path.join(
      modRoot,
      "src/recipes/standard/artifacts/foundation-tectonic-history-tiles.artifact.ts"
    ),
    "artifact:map.foundationTectonicHistoryTiles",
    "foundation-map-artifact-tags"
  ),
  ...assertContains(
    path.join(
      modRoot,
      "src/recipes/standard/artifacts/foundation-tectonic-provenance-tiles.artifact.ts"
    ),
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

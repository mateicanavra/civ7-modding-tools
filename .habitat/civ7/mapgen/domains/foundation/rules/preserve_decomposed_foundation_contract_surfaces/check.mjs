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

const tectonicsContract = path.join(stagesRoot, "foundation-tectonics/steps/tectonics/config.ts");
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
  ["mesh.artifact.ts", "artifact:foundation.mesh"],
  ["mantle-potential.artifact.ts", "artifact:foundation.mantlePotential"],
  ["mantle-forcing.artifact.ts", "artifact:foundation.mantleForcing"],
  ["crust-init.artifact.ts", "artifact:foundation.crustInit"],
  ["crust.artifact.ts", "artifact:foundation.crust"],
  ["plate-motion.artifact.ts", "artifact:foundation.plateMotion"],
  ["plate-graph.artifact.ts", "artifact:foundation.plateGraph"],
  ["tectonic-segments.artifact.ts", "artifact:foundation.tectonicSegments"],
  ["tectonic-history.artifact.ts", "artifact:foundation.tectonicHistory"],
  ["tectonic-provenance.artifact.ts", "artifact:foundation.tectonicProvenance"],
  ["plate-topology.artifact.ts", "artifact:foundation.plateTopology"],
  ["current-tectonics.artifact.ts", "artifact:foundation.tectonics"],
];

const foundationInternalArtifactSurfaces = [
  ["plate-id-by-era.artifact.ts", "artifact:foundation.plateIdByEra"],
  ["tectonic-era-fields.artifact.ts", "artifact:foundation.tectonicEraFields"],
  ["tectonic-events.artifact.ts", "artifact:foundation.tectonicEvents"],
  ["tracer-index-by-era.artifact.ts", "artifact:foundation.tracerIndexByEra"],
];

for (const [fileName, artifactTag] of foundationStageArtifactSurfaces) {
  const artifactFile = path.join(foundationDomain, `artifacts/${fileName}`);
  findings.push(...assertContains(artifactFile, artifactTag, "foundation-artifact-tags"));
}

for (const [fileName, artifactTag] of foundationInternalArtifactSurfaces) {
  const artifactFile = path.join(foundationDomain, `artifacts/${fileName}`);
  findings.push(...assertContains(artifactFile, artifactTag, "foundation-artifact-tags"));
}

findings.push(
  ...assertContains(
    path.join(foundationDomain, "index.ts"),
    'export { artifactModules, artifacts } from "./artifacts/index.js";',
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
  "foundation-projection/steps/projection/config.ts"
);
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
  )
);

assertNoFindings("preserve_decomposed_foundation_contract_surfaces", findings);

#!/usr/bin/env node
import { readdirSync, statSync } from "node:fs";
import path from "node:path";
import {
  assertContains,
  assertNoFindings,
  existingFiles,
  importSources,
  modRoot,
  pathExists,
  read,
  repoRel,
  stagesRoot,
  textFindings,
  walkFiles,
} from "../../_shared/mapgen-static-check-lib.mjs";

const foundationDomain = path.join(modRoot, "src/domain/foundation");
const foundationStage = path.join(stagesRoot, "foundation");
const mapsRoot = path.join(modRoot, "src/maps");
const findings = [];

function foundationStageDirs() {
  return readdirSync(stagesRoot)
    .filter((entry) => entry === "foundation" || entry.startsWith("foundation-"))
    .map((entry) => path.join(stagesRoot, entry))
    .filter((full) => statSync(full).isDirectory());
}

const foundationStages = foundationStageDirs();
const artifactsFile = path.join(foundationStage, "artifacts.ts");
findings.push(...assertContains(artifactsFile, "volcanism", "foundation-plates-schema"));

const foundationOpContractFiles = walkFiles(path.join(foundationDomain, "ops"), [".ts"]).filter(
  (file) => file.endsWith("contract.ts")
);
const foundationStepContractFiles = foundationStages.flatMap((stageDir) =>
  walkFiles(stageDir, [".ts"]).filter((file) => file.endsWith("contract.ts"))
);
for (const file of [...foundationOpContractFiles, ...foundationStepContractFiles]) {
  findings.push(
    ...textFindings(file, ["@mapgen/domain/config", "FoundationConfigSchema"], "domain-config-bag")
  );
}

findings.push(
  ...textFindings(
    path.join(foundationDomain, "ops/compute-plate-graph/contract.ts"),
    ["velocityX", "velocityY", "rotation"],
    "legacy-plate-kinematics"
  )
);

const foundationSurfaceFiles = existingFiles([foundationDomain, ...foundationStages, mapsRoot], [
  ".ts",
  ".json",
]);
for (const file of foundationSurfaceFiles) {
  findings.push(
    ...textFindings(
      file,
      [
        "directionality",
        "foundation.dynamics",
        "foundation.config",
        "foundation.seed",
        "foundation.diagnostics",
        "wrap_x",
        "wrap_y",
        "environment_wrap",
        "polarBandFraction",
        "polarBoundary",
        "upliftToMaturity",
        "ageToMaturity",
        "disruptionToMaturity",
        "lithosphereProfile",
        "mantleProfile",
        "potentialMode",
        "tangentialSpeed",
        "tangentialJitterDeg",
      ],
      "removed-foundation-surface"
    )
  );
  for (const match of read(file).matchAll(/\bcomputeTectonics\b/gu)) {
    findings.push({
      file: repoRel(file),
      line: lineOf(read(file), match.index ?? 0),
      rule: "legacy-compute-tectonics",
      detail: match[0],
    });
  }
}

const foundationIndex = path.join(foundationDomain, "index.ts");
const tectonicsContract = path.join(
  stagesRoot,
  "foundation-tectonics/steps/tectonics.contract.ts"
);
const foundationIndexText = read(foundationIndex);
const tectonicsContractText = read(tectonicsContract);
if (
  /\bcomputeTectonicHistory\b/u.test(foundationIndexText) ||
  /\bcomputeTectonicHistory\b/u.test(tectonicsContractText)
) {
  findings.push({
    file: repoRel(tectonicsContract),
    line: 1,
    rule: "legacy-aggregate-tectonics",
    detail: "computeTectonicHistory",
  });
}
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

const stageIndexFiles = foundationStages
  .map((stageDir) => path.join(stageDir, "index.ts"))
  .filter((file) => pathExists(file));
const bannedAdvancedFragments = [
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
];
for (const stageIndex of stageIndexFiles) {
  findings.push(...textFindings(stageIndex, bannedAdvancedFragments, "foundation-advanced-cast-merge"));
  for (const pattern of [
    /\(\s*advanced\?\.[^)]*\?\?\s*\{\}\s*\)\s+as\s+/gu,
    /\.\.\.\s*\(\s*typeof\s+[^)]+===\s*['"]object['"]\s*\?\s*[^:]+:\s*\{\}\s*\)/gu,
    /\badvancedRecord\s*\[\s*stepId\s*\]/gu,
  ]) {
    const text = read(stageIndex);
    for (const match of text.matchAll(pattern)) {
      findings.push({
        file: repoRel(stageIndex),
        line: lineOf(text, match.index ?? 0),
        rule: "foundation-advanced-cast-merge",
        detail: match[0],
      });
    }
  }
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
const allowedStrategyImports = new Set(["@swooper/mapgen-core/authoring", "../contract.js"]);
for (const file of strategyFiles) {
  const sources = importSources(file).map((source) => source.source);
  findings.push(
    ...textFindings(
      file,
      ["domain/foundation/lib/tectonics/", "lib/tectonics/"],
      "tectonics-strategy-shim"
    )
  );
  if (!sources.some((source) => source.startsWith("../rules/"))) {
    findings.push({
      file: repoRel(file),
      line: 1,
      rule: "tectonics-strategy-rules-import",
      detail: "missing ../rules import",
    });
  }
  for (const source of sources) {
    if (!source.startsWith("../rules/") && !allowedStrategyImports.has(source)) {
      findings.push({
        file: repoRel(file),
        line: 1,
        rule: "tectonics-strategy-import",
        detail: source,
      });
    }
  }
}

for (const file of [
  "compute-era-plate-membership",
  "compute-era-tectonic-fields",
  "compute-hotspot-events",
  "compute-segment-events",
  "compute-tectonic-history-rollups",
  "compute-tectonics-current",
  "compute-tracer-advection",
  "compute-tectonic-provenance",
].map((op) => path.join(foundationDomain, `ops/${op}/rules/index.ts`))) {
  for (const match of read(file).matchAll(
    /^\s*export\s+\{[^}]+\}\s+from\s+["'][^"']*lib\/tectonics\/[^"']+["'];?/gmu
  )) {
    findings.push({
      file: repoRel(file),
      line: lineOf(read(file), match.index ?? 0),
      rule: "tectonics-rules-reexport-shim",
      detail: match[0].trim(),
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
findings.push(
  ...textFindings(
    projectionStep,
    ["plateGraph.plates[", ".velocityX", ".velocityY"],
    "projection-legacy-motion-source"
  )
);

assertNoFindings("foundation-contract-surfaces", findings);

function lineOf(text, index) {
  return text.slice(0, index).split("\n").length;
}

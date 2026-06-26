#!/usr/bin/env node
import path from "node:path";
import {
  assertContains,
  assertEqual,
  assertNoFindings,
  callers,
  existingFiles,
  modRoot,
  read,
  repoRel,
  srcRoot,
  stagesRoot,
  textFindings,
  walkFiles,
} from "../../../../../../_shared/mapgen-static-check-lib.mjs";

const morphologyStages = [
  "morphology-coasts",
  "morphology-routing",
  "morphology-erosion",
  "morphology-features",
].map((stage) => path.join(stagesRoot, stage));
const morphologyContractFiles = [
  path.join(stagesRoot, "morphology/artifacts.ts"),
  ...existingFiles(
    morphologyStages.map((root) => path.join(root, "steps")),
    [".ts"]
  ).filter((file) => file.endsWith("contract.ts") || file.endsWith("artifacts.ts")),
];
const morphologyHydrologyFiles = existingFiles(
  [...morphologyStages, path.join(stagesRoot, "hydrology-climate-baseline/steps")],
  [".ts"]
);
const findings = [];

for (const file of morphologyContractFiles) {
  findings.push(
    ...textFindings(
      file,
      ["westContinent", "eastContinent", "LandmassRegionId"],
      "runtime-continent-contract"
    )
  );
}
for (const file of morphologyHydrologyFiles) {
  findings.push(
    ...textFindings(
      file,
      ["westContinent", "eastContinent", "LandmassRegionId", "markLandmassId("],
      "runtime-continent-step"
    )
  );
}
for (const file of existingFiles(morphologyStages, [".ts"])) {
  findings.push(...textFindings(file, ["@mapgen/domain/config"], "legacy-config-bag"));
  const text = read(file);
  for (const match of text.matchAll(/publishStoryOverlay\s*\([\s\S]{0,200}\)/gu)) {
    if (/HOTSPOTS|["']hotspots["']/.test(match[0])) {
      findings.push({
        file: repoRel(file),
        line: lineOf(text, match.index ?? 0),
        rule: "morphology-hotspot-overlay",
        detail: match[0].trim(),
      });
    }
  }
}
for (const file of walkFiles(path.join(stagesRoot, "morphology-coasts/steps"), [".ts"])) {
  findings.push(...textFindings(file, ["morphology.dualRead", "dualRead"], "morphology-dual-read"));
}
for (const file of existingFiles(
  morphologyStages.map((root) => path.join(root, "steps")),
  [".ts"]
).filter((file) => file.endsWith("contract.ts"))) {
  findings.push(
    ...textFindings(file, ["artifact:storyOverlays"], "morphology-story-overlay-contract")
  );
}
for (const file of existingFiles(
  morphologyStages.map((root) => path.join(root, "steps")),
  [".ts"]
).filter((file) => !file.endsWith("contract.ts"))) {
  findings.push(
    ...textFindings(file, ["overlays.js", "readOverlay"], "morphology-overlay-implementation")
  );
}

for (const file of walkFiles(srcRoot, [".ts"])) {
  findings.push(
    ...textFindings(
      file,
      [
        "@mapgen/domain/morphology/landmass",
        "@mapgen/domain/morphology/coastlines",
        "@mapgen/domain/morphology/islands",
        "@mapgen/domain/morphology/mountains",
        "@mapgen/domain/morphology/volcanoes",
      ],
      "legacy-morphology-module-import"
    )
  );
}
for (const file of [
  ...walkFiles(path.join(modRoot, "src/maps"), [".ts"]),
  path.join(modRoot, "test/standard-run.test.ts"),
]) {
  const text = read(file);
  for (const pattern of [/\blandmass\s*:/gu, /\boceanSeparation\s*:/gu]) {
    for (const match of text.matchAll(pattern)) {
      findings.push({
        file: repoRel(file),
        line: lineOf(text, match.index ?? 0),
        rule: "legacy-morphology-config-key",
        detail: match[0],
      });
    }
  }
}

const landmassContract = path.join(
  stagesRoot,
  "morphology-coasts/steps/landmassPlates.contract.ts"
);
const mountainsContract = path.join(stagesRoot, "morphology-features/steps/mountains.contract.ts");
findings.push(
  ...assertContains(landmassContract, "mapArtifacts.foundationCrustTiles", "belt-driver-contract"),
  ...assertContains(
    landmassContract,
    "mapArtifacts.foundationTectonicHistoryTiles",
    "belt-driver-contract"
  ),
  ...assertContains(
    landmassContract,
    "mapArtifacts.foundationTectonicProvenanceTiles",
    "belt-driver-contract"
  ),
  ...assertContains(landmassContract, "morphologyArtifacts.beltDrivers", "belt-driver-contract"),
  ...assertContains(mountainsContract, "morphologyArtifacts.beltDrivers", "belt-driver-contract")
);
findings.push(
  ...textFindings(
    landmassContract,
    ["mapArtifacts.foundationPlates"],
    "legacy-plate-driver-contract"
  ),
  ...textFindings(
    mountainsContract,
    [
      "mapArtifacts.foundationTectonicHistoryTiles",
      "mapArtifacts.foundationTectonicProvenanceTiles",
      "mapArtifacts.foundationPlates",
    ],
    "legacy-plate-driver-contract"
  )
);

const plotMountains = path.join(stagesRoot, "map-morphology/steps/plotMountains.ts");
findings.push(
  ...textFindings(
    plotMountains,
    ["foundationPlates", "foundationArtifacts.plates"],
    "plot-mountains-legacy-plates"
  )
);

const hotspotPublishers = walkFiles(srcRoot, [".ts"])
  .filter((file) => {
    const text = read(file);
    return Array.from(text.matchAll(/publishStoryOverlay\s*\([\s\S]{0,200}\)/gu)).some((match) =>
      /HOTSPOTS|["']hotspots["']/.test(match[0])
    );
  })
  .map((file) => path.relative(srcRoot, file).split(path.sep).join("/"))
  .sort();
findings.push(
  ...assertEqual(
    hotspotPublishers,
    ["domain/narrative/tagging/hotspots.ts"],
    "hotspot-overlay-owner",
    "HOTSPOTS publishers"
  )
);

const morphologyEffectFiles = existingFiles(
  [...morphologyStages, path.join(srcRoot, "recipes/standard/tags.ts")],
  [".ts"]
);
for (const file of morphologyEffectFiles) {
  findings.push(
    ...textFindings(
      file,
      [
        "landmassApplied",
        "coastlinesApplied",
        "effect:engine.landmassApplied",
        "effect:engine.coastlinesApplied",
      ],
      "legacy-morphology-effect-gating"
    )
  );
}
const lakesContract = path.join(stagesRoot, "map-hydrology/steps/lakes.contract.ts");
findings.push(
  ...textFindings(
    lakesContract,
    [
      "STANDARD_ENGINE_EFFECT_TAGS.engine.coastlinesApplied",
      "STANDARD_ENGINE_EFFECT_TAGS.engine.landmassApplied",
      "morphologyArtifacts.topography",
    ],
    "migrated-consumer-effect-gating"
  )
);

assertNoFindings("preserve_morphology_contracts_and_overlay_ownership", findings);

function lineOf(text, index) {
  return text.slice(0, index).split("\n").length;
}

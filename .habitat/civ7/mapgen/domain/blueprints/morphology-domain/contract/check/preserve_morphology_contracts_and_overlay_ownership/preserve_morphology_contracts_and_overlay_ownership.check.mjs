#!/usr/bin/env node
import path from "node:path";
import {
  assertContains,
  assertEqual,
  assertNoFindings,
  read,
  srcRoot,
  stagesRoot,
  walkFiles,
} from "../../../../../../../../_support/execution/command-check/mapgen-static-check-lib.mjs";

const findings = [];

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

assertNoFindings("preserve_morphology_contracts_and_overlay_ownership", findings);

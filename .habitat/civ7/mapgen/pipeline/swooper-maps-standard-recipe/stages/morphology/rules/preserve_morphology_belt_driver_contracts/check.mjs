#!/usr/bin/env node
import path from "node:path";
import {
  assertContains,
  assertNoFindings,
  stagesRoot,
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

assertNoFindings("preserve_morphology_belt_driver_contracts", findings);


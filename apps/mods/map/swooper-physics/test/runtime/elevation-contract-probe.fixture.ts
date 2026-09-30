#!/usr/bin/env bun
import { createHash } from "node:crypto";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  applyGeneratedFilePlan,
  type GeneratedFilePlan,
} from "@civ7/plugin-files/generated-file-plan";
import { bundleCiv7MapScript } from "../../src/runtime/map-script/compiler.js";
import { ELEVATION_PROBE } from "./elevation-contract-map.fixture.js";

export const elevationProbeAppRoot = fileURLToPath(new URL("../../", import.meta.url));
export const elevationProbeOutputRoot = resolve(
  elevationProbeAppRoot,
  "dist/elevation-contract-probe"
);
export const elevationProbeMapScript = `{${ELEVATION_PROBE.id}}/maps/elevation-contract.js`;

/** Builds a disposable diagnostic mod through the application's existing compiler and file owner. */
export async function buildElevationProbePlan(proofId: string): Promise<GeneratedFilePlan> {
  if (!/^[a-zA-Z0-9-]{1,100}$/.test(proofId))
    throw new Error("Use a short alphanumeric/hyphen proof ID.");
  const content = await bundleCiv7MapScript({
    source: `import { registerElevationContractProbe } from "./test/runtime/elevation-contract-map.fixture.ts";\nregisterElevationContractProbe(${JSON.stringify(proofId)});`,
    sourceName: "elevation-contract-probe.ts",
    appRoot: elevationProbeAppRoot,
  });
  return {
    exclusiveSets: [{ relativeDir: "maps", fileExtension: ".js" }],
    files: [
      { relativePath: "maps/elevation-contract.js", content },
      {
        relativePath: "config/config.xml",
        content: `<?xml version="1.0" encoding="utf-8"?>
<Database><Maps><Row File="${elevationProbeMapScript}" Name="LOC_ELEVATION_CONTRACT_NAME" Description="LOC_ELEVATION_CONTRACT_DESCRIPTION" SortIndex="999"/></Maps></Database>`,
      },
      {
        relativePath: "text/en_us/MapText.xml",
        content: `<?xml version="1.0" encoding="utf-8"?>
<Database><EnglishText><Row Tag="LOC_ELEVATION_CONTRACT_NAME"><Text>Elevation Contract Probe</Text></Row><Row Tag="LOC_ELEVATION_CONTRACT_DESCRIPTION"><Text>Disposable native elevation diagnostic. Tiny, four players.</Text></Row></EnglishText></Database>`,
      },
      {
        relativePath: `${ELEVATION_PROBE.id}.modinfo`,
        content: `<?xml version="1.0" encoding="utf-8"?>
<Mod id="${ELEVATION_PROBE.id}" version="1" xmlns="ModInfo">
  <Properties><Name>Elevation Contract Probe</Name><Description>Disposable native elevation diagnostic</Description><Authors>Swooper</Authors><Package>Mod</Package></Properties>
  <Dependencies><Mod id="base-standard" title="LOC_MODULE_BASE_STANDARD_NAME"/></Dependencies>
  <ActionCriteria><Criteria id="always"><AlwaysMet/></Criteria></ActionCriteria>
  <ActionGroups>
    <ActionGroup id="game-elevation-contract" scope="game" criteria="always"><Actions><UpdateText><Item>text/en_us/MapText.xml</Item></UpdateText><ImportFiles><Item>maps/elevation-contract.js</Item></ImportFiles></Actions></ActionGroup>
    <ActionGroup id="shell-elevation-contract" scope="shell" criteria="always"><Actions><UpdateDatabase><Item>config/config.xml</Item></UpdateDatabase><UpdateText><Item>text/en_us/MapText.xml</Item></UpdateText></Actions></ActionGroup>
  </ActionGroups>
</Mod>`,
      },
      {
        relativePath: "proof.json",
        content: JSON.stringify(
          {
            proofId,
            ...ELEVATION_PROBE,
            scriptSha256: createHash("sha256").update(content).digest("hex"),
            mapScript: elevationProbeMapScript,
            evidence: "built-only; no native observations",
          },
          null,
          2
        ),
      },
    ],
  };
}

if (import.meta.main) {
  const proofId = process.argv[2];
  if (!proofId || process.argv.length !== 3)
    throw new Error(
      "Usage: bun test/runtime/elevation-contract-probe.fixture.ts <proof-id> (build only; never deploys or launches)"
    );
  await applyGeneratedFilePlan(await buildElevationProbePlan(proofId), {
    outputRoot: elevationProbeOutputRoot,
  });
  console.log(
    JSON.stringify(
      {
        outputRoot: elevationProbeOutputRoot,
        proofId,
        mapScript: elevationProbeMapScript,
        liveVerifierFlags: [
          "--mutate",
          "--map-script",
          elevationProbeMapScript,
          "--map-size",
          "MAPSIZE_TINY",
          "--seed",
          String(ELEVATION_PROBE.mapSeed),
          "--game-seed",
          String(ELEVATION_PROBE.gameSeed),
          "--player-count",
          String(ELEVATION_PROBE.playerCount),
        ],
        status: "built-only; installation and live launch require separate authorization",
      },
      null,
      2
    )
  );
}

#!/usr/bin/env bun
import { createHash } from "node:crypto";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { applyGeneratedFilePlan, type GeneratedFilePlan } from "@civ7/plugin-files/generated-file-plan";
import { bundleCiv7MapScript } from "../../src/runtime/map-script/compiler.js";
import { RIVER_PROBE, RIVER_TERRAIN_PROBE, RIVER_PROBE_VARIANTS, type RiverProbeAtlas, type RiverProbeVariant } from "./river-contract-map.fixture.js";

export const riverProbeAppRoot = fileURLToPath(new URL("../../", import.meta.url));
export const riverProbeOutputRoot = resolve(riverProbeAppRoot, "dist/river-contract-probe");
export const riverProbeMapScript = `{${RIVER_PROBE.id}}/maps/river-contract.js`;

/** One disposable mod; rebuilding replaces the selected variant, never adds a second active map. */
export async function buildRiverProbePlan(proofId: string, variant: RiverProbeVariant = "authored", atlasKind: RiverProbeAtlas = "legacy"): Promise<GeneratedFilePlan> {
  if (!/^[a-zA-Z0-9-]{1,100}$/.test(proofId)) throw new Error("Use a short alphanumeric/hyphen proof ID.");
  if (!Object.hasOwn(RIVER_PROBE_VARIANTS, variant)) throw new Error(`Unknown river probe variant: ${variant}`);
  if (atlasKind !== "legacy" && atlasKind !== "terrain-admission") throw new Error(`Unknown river probe atlas: ${atlasKind}`);
  if (atlasKind === "terrain-admission" && variant !== "authored") throw new Error("Terrain admission requires the authored finalization tuple.");
  const probe = atlasKind === "terrain-admission" ? RIVER_TERRAIN_PROBE : RIVER_PROBE;
  const displayLabel = atlasKind === "terrain-admission" ? RIVER_TERRAIN_PROBE.displayLabel : "River Contract Probe";
  const adapterImport = atlasKind === "terrain-admission" ? 'import { Civ7Adapter } from "./src/runtime/map-script/adapter.ts";\n' : "";
  const adapterFactory = atlasKind === "terrain-admission" ? ", (width, height) => new Civ7Adapter(width, height)" : "";
  const content = await bundleCiv7MapScript({
    source: `${adapterImport}import { registerRiverContractProbe } from "./test/live/river-contract-map.fixture.ts";\nregisterRiverContractProbe(${JSON.stringify(proofId)}, ${JSON.stringify(variant)}, ${JSON.stringify(atlasKind)}${adapterFactory});`,
    sourceName: "river-contract-probe.ts",
    appRoot: riverProbeAppRoot,
  });
  return {
    exclusiveSets: [{ relativeDir: "maps", fileExtension: ".js" }],
    files: [
      { relativePath: "maps/river-contract.js", content },
      { relativePath: "config/config.xml", content: `<?xml version="1.0" encoding="utf-8"?>
<Database><Maps><Row File="${riverProbeMapScript}" Name="LOC_RIVER_CONTRACT_NAME" Description="LOC_RIVER_CONTRACT_DESCRIPTION" SortIndex="999"/></Maps></Database>` },
      { relativePath: "text/en_us/MapText.xml", content: `<?xml version="1.0" encoding="utf-8"?>
<Database><EnglishText><Row Tag="LOC_RIVER_CONTRACT_NAME"><Text>${displayLabel}</Text></Row><Row Tag="LOC_RIVER_CONTRACT_DESCRIPTION"><Text>Disposable native river diagnostic. Tiny, four players. Revision ${probe.diagnosticRevision}.</Text></Row></EnglishText></Database>` },
      { relativePath: `${RIVER_PROBE.id}.modinfo`, content: `<?xml version="1.0" encoding="utf-8"?>
<Mod id="${RIVER_PROBE.id}" version="1" xmlns="ModInfo">
  <Properties><Name>${displayLabel}</Name><Description>Disposable native river diagnostic revision ${probe.diagnosticRevision}</Description><Authors>Swooper</Authors><Package>Mod</Package></Properties>
  <Dependencies><Mod id="base-standard" title="LOC_MODULE_BASE_STANDARD_NAME"/></Dependencies>
  <ActionCriteria><Criteria id="always"><AlwaysMet/></Criteria></ActionCriteria>
  <ActionGroups>
    <ActionGroup id="game-river-contract" scope="game" criteria="always"><Actions><UpdateText><Item>text/en_us/MapText.xml</Item></UpdateText><ImportFiles><Item>maps/river-contract.js</Item></ImportFiles></Actions></ActionGroup>
    <ActionGroup id="shell-river-contract" scope="shell" criteria="always"><Actions><UpdateDatabase><Item>config/config.xml</Item></UpdateDatabase><UpdateText><Item>text/en_us/MapText.xml</Item></UpdateText></Actions></ActionGroup>
  </ActionGroups>
</Mod>` },
      { relativePath: "proof.json", content: JSON.stringify({ proofId, ...probe, variant, atlasKind,
        settings: RIVER_PROBE_VARIANTS[variant], scriptSha256: createHash("sha256").update(content).digest("hex"),
        mapScript: riverProbeMapScript, evidence: "built-only; no native observations",
        qualification: "completion means all diagnostic phases ran, not river parity or successful writes",
        networkWitness: "experimental bounded ordinal-to-ID-to-plots lookup; no shipped argument contract",
      }, null, 2) },
    ],
  };
}

if (import.meta.main) {
  const proofId = process.argv[2];
  const variant = process.argv[3] ?? "authored";
  const atlasKind = process.argv[4] ?? "legacy";
  if (!proofId || process.argv.length > 5 || !Object.hasOwn(RIVER_PROBE_VARIANTS, variant) || (atlasKind !== "legacy" && atlasKind !== "terrain-admission"))
    throw new Error("Usage: bun test/live/river-contract-probe.ts <proof-id> [authored|aesthetic|length|upstream|percent] [legacy|terrain-admission] (build only)");
  await applyGeneratedFilePlan(await buildRiverProbePlan(proofId, variant as RiverProbeVariant, atlasKind), { outputRoot: riverProbeOutputRoot });
  console.log(JSON.stringify({ outputRoot: riverProbeOutputRoot, proofId, variant, atlasKind,
    mapScript: riverProbeMapScript,
    liveVerifierFlags: ["--mutate", "--map-script", riverProbeMapScript, "--map-size", "MAPSIZE_TINY", "--seed", String(RIVER_PROBE.mapSeed), "--game-seed", String(RIVER_PROBE.gameSeed), "--player-count", String(RIVER_PROBE.playerCount)],
    status: "built-only; installation and live launch require separate authorization",
  }, null, 2));
}

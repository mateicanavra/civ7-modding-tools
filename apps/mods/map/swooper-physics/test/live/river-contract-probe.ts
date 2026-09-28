#!/usr/bin/env bun
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { applyGeneratedFilePlan, type GeneratedFilePlan } from "@civ7/plugin-files/generated-file-plan";
import { loadSwooperMapConfigCatalog } from "@swooper/swooper-physics/tooling/catalog-source";
import { canonicalMapConfigContentDigest, canonicalMapConfigDigest } from "@swooper/swooper-physics/standard/map-config";
import { renderSwooperCatalogMapSource } from "../../src/runtime/file-plan.js";
import { bundleCiv7MapScript } from "../../src/runtime/map-script/compiler.js";
import { RIVER_PROBE, RIVER_TERRAIN_PROBE, RIVER_LAKE_NAVIGATION_PROBE, RIVER_PROBE_VARIANTS, type RiverProbeAtlas, type RiverProbeVariant } from "./river-contract-map.fixture.js";
import { FULL_MAP_RIVER_PROBE, FULL_MAP_RIVER_PROBE_ATLASES, FULL_MAP_RIVER_PROBE_EDGES, type FullMapProbeIdentity, type FullMapRiverProbeAtlas } from "./river-full-map.fixture.js";
import { WATER_HEIGHT_MAINTENANCE_ATLAS, WATER_HEIGHT_MAINTENANCE_PROBE } from "./water-height-maintenance.fixture.js";

export const riverProbeAppRoot = fileURLToPath(new URL("../../", import.meta.url));
export const riverProbeOutputRoot = resolve(riverProbeAppRoot, "dist/river-contract-probe");
// The deploy CLI's --id names a directory, not the logical Mod id in the manifest.
export const riverProbeInstallDirectoryName = "mod-swooper-river-contract-v1";
export const riverProbeDeployFlags = ["--input", riverProbeOutputRoot, "--id", riverProbeInstallDirectoryName] as const;
export const riverProbeMapScript = `{${RIVER_PROBE.id}}/maps/river-contract.js`;
export type RiverProbeAtlasSelection = RiverProbeAtlas | FullMapRiverProbeAtlas | typeof WATER_HEIGHT_MAINTENANCE_ATLAS;
const atlases: readonly string[] = ["legacy", "terrain-admission", "lake-navigation", ...FULL_MAP_RIVER_PROBE_ATLASES, WATER_HEIGHT_MAINTENANCE_ATLAS];
const isFullMapAtlas = (atlas: string): atlas is FullMapRiverProbeAtlas =>
  (FULL_MAP_RIVER_PROBE_ATLASES as readonly string[]).includes(atlas);

/** Builds one diagnostic mod tree; installation identity and duplicate detection are separate concerns. */
export async function buildRiverProbePlan(proofId: string, variant: RiverProbeVariant = "authored", atlasKind: RiverProbeAtlasSelection = "legacy"): Promise<GeneratedFilePlan> {
  if (!/^[a-zA-Z0-9-]{1,100}$/.test(proofId)) throw new Error("Use a short alphanumeric/hyphen proof ID.");
  if (!Object.hasOwn(RIVER_PROBE_VARIANTS, variant)) throw new Error(`Unknown river probe variant: ${variant}`);
  if (!atlases.includes(atlasKind)) throw new Error(`Unknown river probe atlas: ${atlasKind}`);
  if (atlasKind !== "legacy" && variant !== "authored") throw new Error("Adapter atlases require the authored finalization tuple.");
  const maintenance = atlasKind === WATER_HEIGHT_MAINTENANCE_ATLAS;
  const fullMap = isFullMapAtlas(atlasKind) || maintenance;
  const probe = fullMap ? { ...RIVER_PROBE, ...(maintenance ? WATER_HEIGHT_MAINTENANCE_PROBE : FULL_MAP_RIVER_PROBE) } : atlasKind === "terrain-admission" ? RIVER_TERRAIN_PROBE : atlasKind === "lake-navigation" ? RIVER_LAKE_NAVIGATION_PROBE : RIVER_PROBE;
  const displayLabel = "displayLabel" in probe ? probe.displayLabel : "River Contract Probe";
  const adapterImport = atlasKind !== "legacy" ? 'import { Civ7Adapter } from "./src/runtime/map-script/adapter.ts";\n' : "";
  const adapterFactory = atlasKind !== "legacy" ? ", (width, height) => new Civ7Adapter(width, height)" : "";
  let source = `${adapterImport}import { registerRiverContractProbe } from "./test/live/river-contract-map.fixture.ts";\nregisterRiverContractProbe(${JSON.stringify(proofId)}, ${JSON.stringify(variant)}, ${JSON.stringify(atlasKind)}${adapterFactory});`;
  let identity: FullMapProbeIdentity | undefined;
  if (fullMap) {
    const [config] = await loadSwooperMapConfigCatalog({ catalogConfigIds: ["swooper-earthlike"] });
    if (!config || config.canonicalConfig.id !== "swooper-earthlike") throw new Error("Missing canonical swooper-earthlike config.");
    identity = { configHash: canonicalMapConfigContentDigest(config.canonicalConfig),
      envelopeHash: canonicalMapConfigDigest(config.canonicalConfig),
      fixtureSourceSha256: createHash("sha256").update(await readFile(new URL(maintenance ? "./water-height-maintenance.fixture.ts" : "./river-full-map.fixture.ts", import.meta.url))).digest("hex") };
    source = maintenance ? `${adapterImport}import { installWaterHeightMaintenanceProbe } from "./test/live/water-height-maintenance.fixture.ts";
installWaterHeightMaintenanceProbe(Civ7Adapter.prototype, ${JSON.stringify(proofId)}, ${JSON.stringify(identity)});
${renderSwooperCatalogMapSource(config)}` : `${adapterImport}import { installFullMapRiverProbe } from "./test/live/river-full-map.fixture.ts";
installFullMapRiverProbe(Civ7Adapter.prototype, ${JSON.stringify(proofId)}, ${JSON.stringify(atlasKind)}, ${JSON.stringify(identity)});
${renderSwooperCatalogMapSource(config)}`;
  }
  const content = await bundleCiv7MapScript({
    source,
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
<Database><EnglishText><Row Tag="LOC_RIVER_CONTRACT_NAME"><Text>${displayLabel}</Text></Row><Row Tag="LOC_RIVER_CONTRACT_DESCRIPTION"><Text>Disposable native river diagnostic. ${fullMap ? "Huge, ten players" : "Tiny, four players"}. Revision ${probe.diagnosticRevision}.</Text></Row></EnglishText></Database>` },
      { relativePath: `${RIVER_PROBE.id}.modinfo`, content: `<?xml version="1.0" encoding="utf-8"?>
<Mod id="${RIVER_PROBE.id}" version="1" xmlns="ModInfo">
  <Properties><Name>${displayLabel}</Name><Description>Disposable native river diagnostic revision ${probe.diagnosticRevision}</Description><Authors>Swooper</Authors><Package>Mod</Package></Properties>
  <Dependencies><Mod id="base-standard" title="LOC_MODULE_BASE_STANDARD_NAME"/>${fullMap ? '<Mod id="swooper-maps" title="LOC_MODULE_SWOOPER_MAPS_NAME"/>' : ""}</Dependencies>
  <ActionCriteria><Criteria id="always"><AlwaysMet/></Criteria></ActionCriteria>
  <ActionGroups>
    <ActionGroup id="game-river-contract" scope="game" criteria="always"><Actions><UpdateText><Item>text/en_us/MapText.xml</Item></UpdateText><ImportFiles><Item>maps/river-contract.js</Item></ImportFiles></Actions></ActionGroup>
    <ActionGroup id="shell-river-contract" scope="shell" criteria="always"><Actions><UpdateDatabase><Item>config/config.xml</Item></UpdateDatabase><UpdateText><Item>text/en_us/MapText.xml</Item></UpdateText></Actions></ActionGroup>
  </ActionGroups>
</Mod>` },
      { relativePath: "proof.json", content: JSON.stringify({ proofId, ...probe, ...identity, variant, atlasKind,
        ...(isFullMapAtlas(atlasKind) ? { intervention: { riverClass: "NAVIGABLE",
          extraWriteCount: FULL_MAP_RIVER_PROBE_EDGES[atlasKind].length, edges: FULL_MAP_RIVER_PROBE_EDGES[atlasKind] } } : {}),
        settings: RIVER_PROBE_VARIANTS[variant], scriptSha256: createHash("sha256").update(content).digest("hex"),
        mapScript: riverProbeMapScript, installDirectoryName: riverProbeInstallDirectoryName,
        evidence: "built-only; no native observations",
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
  if (!proofId || process.argv.length > 5 || !Object.hasOwn(RIVER_PROBE_VARIANTS, variant) || !atlases.includes(atlasKind))
    throw new Error(`Usage: bun test/live/river-contract-probe.ts <proof-id> [authored|aesthetic|length|upstream|percent] [${atlases.join("|")}] (build only)`);
  await applyGeneratedFilePlan(await buildRiverProbePlan(proofId, variant as RiverProbeVariant, atlasKind as RiverProbeAtlasSelection), { outputRoot: riverProbeOutputRoot });
  const fullMap = isFullMapAtlas(atlasKind) || atlasKind === WATER_HEIGHT_MAINTENANCE_ATLAS;
  const probe = atlasKind === WATER_HEIGHT_MAINTENANCE_ATLAS ? WATER_HEIGHT_MAINTENANCE_PROBE : fullMap ? FULL_MAP_RIVER_PROBE : RIVER_PROBE;
  console.log(JSON.stringify({ outputRoot: riverProbeOutputRoot, proofId, variant, atlasKind,
    mapScript: riverProbeMapScript, installDirectoryName: riverProbeInstallDirectoryName,
    deployFlags: riverProbeDeployFlags,
    liveVerifierFlags: ["--mutate", "--map-script", riverProbeMapScript, "--map-size", fullMap ? "MAPSIZE_HUGE" : "MAPSIZE_TINY", "--seed", String(probe.mapSeed), "--game-seed", String(probe.gameSeed), "--player-count", String(probe.playerCount)],
    status: "built-only; installation and live launch require separate authorization",
  }, null, 2));
}

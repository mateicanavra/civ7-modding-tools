import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

type ExtractedTables = {
  terrainTypeOrder: string[];
  biomeOrder: string[];
  featureOrder: string[];
  featureValidTerrains: Record<string, string[]>;
  featureValidBiomes: Record<string, string[]>;
  featureTags: Record<string, string[]>;
  featurePolicies: Record<string, FeaturePolicy>;
  resourceOrder: string[];
  resourceValidPlacementRows: Record<string, ResourceValidPlacementRow[]>;
  resourcePlacementFlags: Record<string, ResourcePlacementFlags>;
  mapGlobals: {
    polarWaterRows: number;
    oceanWaterColumns: number;
  };
  sources: string[];
};

type ResourceValidPlacementRow = {
  biomeType: string;
  terrainType: string;
  featureType?: string;
};

type ResourcePlacementFlags = {
  adjacentToLand: boolean;
  lakeEligible: boolean;
};

type FeaturePolicy = {
  noLake: boolean;
  minimumElevation?: number;
  placementClass?: string;
  naturalWonderTiles?: number;
  naturalWonderDirection?: number;
  naturalWonderPlaceFirst?: boolean;
};

function fatal(message: string): never {
  console.error(message);
  process.exit(1);
}

function extractXmlSection(xml: string, tag: string): string {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "m");
  const m = re.exec(xml);
  if (!m?.[1]) fatal(`[civ7-tables] missing <${tag}> section`);
  return m[1];
}

function extractOptionalXmlSection(xml: string, tag: string): string | null {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "m");
  return re.exec(xml)?.[1] ?? null;
}

function extractRowAttr(sectionXml: string, attr: string): string[] {
  const out: string[] = [];
  const re = new RegExp(`<Row\\s+[^>]*${attr}="([^"]+)"[^>]*/>`, "g");
  let m: RegExpExecArray | null;
  while ((m = re.exec(sectionXml))) {
    const v = m[1];
    if (v) out.push(v);
  }
  return out;
}

function extractRowAttrs(sectionXml: string, attrs: readonly string[]): Record<string, string>[] {
  const out: Record<string, string>[] = [];
  const rowRe = /<Row\s+([^>]*)\/>/g;
  let row: RegExpExecArray | null;
  while ((row = rowRe.exec(sectionXml))) {
    const rawAttrs = row[1] ?? "";
    const parsed: Record<string, string> = {};
    for (const attr of attrs) {
      const attrRe = new RegExp(`${attr}="([^"]+)"`);
      const match = attrRe.exec(rawAttrs);
      if (match?.[1]) parsed[attr] = match[1];
    }
    if (attrs.every((attr) => typeof parsed[attr] === "string")) out.push(parsed);
  }
  return out;
}

function extractRows(sectionXml: string): Record<string, string>[] {
  const out: Record<string, string>[] = [];
  const rowRe = /<Row\s+([^>]*)\/>/g;
  let row: RegExpExecArray | null;
  while ((row = rowRe.exec(sectionXml))) {
    const rawAttrs = row[1] ?? "";
    const parsed: Record<string, string> = {};
    const attrRe = /([A-Za-z0-9_]+)="([^"]*)"/g;
    let attr: RegExpExecArray | null;
    while ((attr = attrRe.exec(rawAttrs))) {
      const key = attr[1];
      const value = attr[2];
      if (key && value !== undefined) parsed[key] = value;
    }
    out.push(parsed);
  }
  return out;
}

function assertNoDuplicates(label: string, values: string[]): void {
  const seen = new Set<string>();
  const dupes = new Set<string>();
  for (const v of values) {
    if (seen.has(v)) dupes.add(v);
    seen.add(v);
  }
  if (dupes.size) fatal(`[civ7-tables] duplicate ${label}: ${[...dupes].join(", ")}`);
}

function indexByOrder(values: string[]): Record<string, number> {
  return Object.fromEntries(values.map((v, i) => [v, i]));
}

function appendUnique(out: string[], values: string[]): void {
  const seen = new Set(out);
  for (const value of values) {
    if (seen.has(value)) fatal(`[civ7-tables] duplicate features: ${value}`);
    seen.add(value);
    out.push(value);
  }
}

function uniqueValues(values: string[]): string[] {
  return [...new Set(values)];
}

function parseTerrainXml(xml: string): Pick<ExtractedTables, "terrainTypeOrder" | "biomeOrder"> {
  const terrains = extractRowAttr(extractXmlSection(xml, "Terrains"), "TerrainType");
  const biomes = extractRowAttr(extractXmlSection(xml, "Biomes"), "BiomeType");

  if (!terrains.length) fatal("[civ7-tables] no terrain rows found");
  if (!biomes.length) fatal("[civ7-tables] no biome rows found");

  assertNoDuplicates("terrain types", terrains);
  assertNoDuplicates("biomes", biomes);

  return {
    terrainTypeOrder: terrains,
    biomeOrder: biomes,
  };
}

function parseFeatureXml(xml: string, relPath: string): string[] {
  const features = extractRowAttr(extractXmlSection(xml, "Features"), "FeatureType");
  if (!features.length) fatal(`[civ7-tables] no feature rows found in ${relPath}`);
  assertNoDuplicates(`features in ${relPath}`, features);
  return features;
}

function parseFeatureValidTerrainsXml(xml: string): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  const section = extractXmlSection(xml, "Feature_ValidTerrains");
  for (const row of extractRowAttrs(section, ["FeatureType", "TerrainType"])) {
    const featureType = row.FeatureType;
    const terrainType = row.TerrainType;
    if (!featureType || !terrainType) continue;
    out[featureType] ??= [];
    if (!out[featureType].includes(terrainType)) out[featureType].push(terrainType);
  }
  return out;
}

function parseFeatureValidBiomesXml(xml: string): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  const section = extractXmlSection(xml, "Feature_ValidBiomes");
  for (const row of extractRowAttrs(section, ["FeatureType", "BiomeType"])) {
    const featureType = row.FeatureType;
    const biomeType = row.BiomeType;
    if (!featureType || !biomeType) continue;
    out[featureType] ??= [];
    if (!out[featureType].includes(biomeType)) out[featureType].push(biomeType);
  }
  return out;
}

function parseFeatureTagsXml(xml: string): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  const section = extractOptionalXmlSection(xml, "TypeTags");
  if (!section) return out;
  for (const row of extractRowAttrs(section, ["Type", "Tag"])) {
    const featureType = row.Type;
    const tag = row.Tag;
    if (!featureType?.startsWith("FEATURE_") || !tag) continue;
    out[featureType] ??= [];
    if (!out[featureType].includes(tag)) out[featureType].push(tag);
  }
  return out;
}

function parseFeaturePoliciesXml(xml: string): Record<string, FeaturePolicy> {
  const out: Record<string, FeaturePolicy> = {};
  const featureRows = extractRows(extractXmlSection(xml, "Features"));
  for (const row of featureRows) {
    const featureType = row.FeatureType;
    if (!featureType) continue;
    const policy: FeaturePolicy = {
      noLake: row.NoLake === "true",
      ...(row.PlacementClass ? { placementClass: row.PlacementClass } : {}),
    };
    if (row.MinimumElevation !== undefined) {
      const minimumElevation = Number(row.MinimumElevation);
      if (Number.isFinite(minimumElevation)) policy.minimumElevation = minimumElevation;
    }
    out[featureType] = policy;
  }

  const naturalWonderRows = extractRows(extractXmlSection(xml, "Feature_NaturalWonders"));
  for (const row of naturalWonderRows) {
    const featureType = row.FeatureType;
    if (!featureType) continue;
    const tiles = Number(row.Tiles);
    const direction = Number(row.Direction ?? -1);
    out[featureType] ??= { noLake: false };
    if (Number.isFinite(tiles)) out[featureType].naturalWonderTiles = tiles;
    if (Number.isFinite(direction)) out[featureType].naturalWonderDirection = direction;
    if (row.PlaceFirst === "true") out[featureType].naturalWonderPlaceFirst = true;
  }
  return out;
}

function parseResourceXml(xml: string, relPath: string): {
  resourceOrder: string[];
  validPlacementRows: Record<string, ResourceValidPlacementRow[]>;
  placementFlags: Record<string, ResourcePlacementFlags>;
} {
  const resourcesSection = extractXmlSection(xml, "Resources");
  const resourceRows = extractRows(resourcesSection);
  const resourceOrder = resourceRows
    .map((row) => row.ResourceType)
    .filter((value): value is string => typeof value === "string" && value.length > 0);
  if (!resourceOrder.length) fatal(`[civ7-tables] no resource rows found in ${relPath}`);
  assertNoDuplicates(`resources in ${relPath}`, resourceOrder);

  const placementFlags: Record<string, ResourcePlacementFlags> = {};
  for (const row of resourceRows) {
    const resourceType = row.ResourceType;
    if (!resourceType) continue;
    placementFlags[resourceType] = {
      adjacentToLand: row.AdjacentToLand === "true",
      lakeEligible: row.LakeEligible !== "false",
    };
  }

  const validPlacementRows: Record<string, ResourceValidPlacementRow[]> = {};
  const validBiomesSection = extractXmlSection(xml, "Resource_ValidBiomes");
  for (const row of extractRows(validBiomesSection)) {
    const resourceType = row.ResourceType;
    const biomeType = row.BiomeType;
    const terrainType = row.TerrainType;
    if (!resourceType || !biomeType || !terrainType) continue;
    validPlacementRows[resourceType] ??= [];
    validPlacementRows[resourceType].push({
      biomeType,
      terrainType,
      ...(row.FeatureType ? { featureType: row.FeatureType } : {}),
    });
  }

  return { resourceOrder, validPlacementRows, placementFlags };
}

function extractConstNumber(js: string, name: string, relPath: string): number {
  const re = new RegExp(`const\\s+${name}\\s*=\\s*(-?\\d+(?:\\.\\d+)?)\\s*;`);
  const m = re.exec(js);
  if (!m?.[1]) fatal(`[civ7-tables] missing ${name} in ${relPath}`);
  const value = Number(m[1]);
  if (!Number.isFinite(value)) fatal(`[civ7-tables] invalid numeric ${name} in ${relPath}`);
  return value;
}

function parseMapGlobals(js: string, relPath: string): ExtractedTables["mapGlobals"] {
  return {
    polarWaterRows: extractConstNumber(js, "g_PolarWaterRows", relPath),
    oceanWaterColumns: extractConstNumber(js, "g_OceanWaterColumns", relPath),
  };
}

function toTsObjectLiteral(obj: Record<string, number>): string {
  const lines = Object.keys(obj)
    .sort()
    .map((k) => `  ${JSON.stringify(k)}: ${obj[k]},`);
  return `{\n${lines.join("\n")}\n}`;
}

function toTsNumberArrayObjectLiteral(obj: Record<string, number[]>): string {
  const lines = Object.keys(obj)
    .sort((a, b) => Number(a) - Number(b))
    .map((k) => `  ${JSON.stringify(k)}: [${obj[k]!.join(", ")}],`);
  return `{\n${lines.join("\n")}\n}`;
}

function toTsStringArrayObjectLiteral(obj: Record<string, string[]>): string {
  const lines = Object.keys(obj)
    .sort((a, b) => Number(a) - Number(b))
    .map((k) => `  ${JSON.stringify(k)}: [${obj[k]!.map((v) => JSON.stringify(v)).join(", ")}],`);
  return `{\n${lines.join("\n")}\n}`;
}

function toTsResourcePlacementRowsObjectLiteral(
  obj: Record<string, Array<readonly [number, number, number]>>
): string {
  const lines = Object.keys(obj)
    .sort((a, b) => Number(a) - Number(b))
    .map((k) => {
      const rows = obj[k]!.map((row) => `[${row.join(", ")}]`).join(", ");
      return `  ${JSON.stringify(k)}: [${rows}],`;
    });
  return `{\n${lines.join("\n")}\n}`;
}

function toTsResourcePolicyFlagsObjectLiteral(
  obj: Record<string, { adjacentToLand: boolean; lakeEligible: boolean }>
): string {
  const lines = Object.keys(obj)
    .sort((a, b) => Number(a) - Number(b))
    .map((k) => {
      const flags = obj[k]!;
      return `  ${JSON.stringify(k)}: { adjacentToLand: ${flags.adjacentToLand}, lakeEligible: ${flags.lakeEligible} },`;
    });
  return `{\n${lines.join("\n")}\n}`;
}

function mergeFeatureValidTerrains(
  target: Record<string, string[]>,
  source: Record<string, string[]>
): void {
  for (const [featureType, terrainTypes] of Object.entries(source)) {
    target[featureType] ??= [];
    for (const terrainType of terrainTypes) {
      if (!target[featureType].includes(terrainType)) target[featureType].push(terrainType);
    }
  }
}

function mergeFeaturePolicies(
  target: Record<string, FeaturePolicy>,
  source: Record<string, FeaturePolicy>
): void {
  for (const [featureType, policy] of Object.entries(source)) {
    target[featureType] = {
      ...(target[featureType] ?? { noLake: false }),
      ...policy,
    };
  }
}

function mergeFeatureTags(target: Record<string, string[]>, source: Record<string, string[]>): void {
  for (const [featureType, tags] of Object.entries(source)) {
    target[featureType] ??= [];
    for (const tag of tags) {
      if (!target[featureType].includes(tag)) target[featureType].push(tag);
    }
  }
}

function indexFeatureValidTerrains(
  featureValidTerrains: Record<string, string[]>,
  featureTypes: Record<string, number>,
  terrainTypeIndices: Record<string, number>
): Record<string, number[]> {
  const out: Record<string, number[]> = {};
  for (const [featureType, terrainTypes] of Object.entries(featureValidTerrains)) {
    const featureIndex = featureTypes[featureType];
    if (featureIndex == null) continue;
    const terrainIndices = terrainTypes
      .map((terrainType) => terrainTypeIndices[terrainType])
      .filter((value): value is number => Number.isFinite(value))
      .sort((a, b) => a - b);
    if (terrainIndices.length) out[String(featureIndex)] = terrainIndices;
  }
  return out;
}

function indexFeatureTags(
  featureTags: Record<string, string[]>,
  featureTypes: Record<string, number>
): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const [featureType, tags] of Object.entries(featureTags)) {
    const featureIndex = featureTypes[featureType];
    if (featureIndex == null) continue;
    const uniqueTags = Array.from(new Set(tags)).sort();
    if (uniqueTags.length) out[String(featureIndex)] = uniqueTags;
  }
  return out;
}

function indexFeaturePolicies(
  featurePolicies: Record<string, FeaturePolicy>,
  featureTypes: Record<string, number>
): Record<string, FeaturePolicy> {
  const out: Record<string, FeaturePolicy> = {};
  for (const [featureType, policy] of Object.entries(featurePolicies)) {
    const featureIndex = featureTypes[featureType];
    if (featureIndex == null) continue;
    out[String(featureIndex)] = policy;
  }
  return out;
}

function toTsFeaturePoliciesObjectLiteral(obj: Record<string, FeaturePolicy>): string {
  const lines = Object.keys(obj)
    .sort((a, b) => Number(a) - Number(b))
    .map((k) => {
      const policy = obj[k]!;
      const props = [
        `noLake: ${policy.noLake}`,
        ...(policy.minimumElevation !== undefined
          ? [`minimumElevation: ${policy.minimumElevation}`]
          : []),
        ...(policy.placementClass ? [`placementClass: ${JSON.stringify(policy.placementClass)}`] : []),
        ...(policy.naturalWonderTiles !== undefined
          ? [`naturalWonderTiles: ${policy.naturalWonderTiles}`]
          : []),
        ...(policy.naturalWonderDirection !== undefined
          ? [`naturalWonderDirection: ${policy.naturalWonderDirection}`]
          : []),
        ...(policy.naturalWonderPlaceFirst ? ["naturalWonderPlaceFirst: true"] : []),
      ];
      return `  ${JSON.stringify(k)}: { ${props.join(", ")} },`;
    });
  return `{\n${lines.join("\n")}\n}`;
}

function mergeResourceTables(
  targetOrder: string[],
  targetRows: Record<string, ResourceValidPlacementRow[]>,
  targetFlags: Record<string, ResourcePlacementFlags>,
  source: ReturnType<typeof parseResourceXml>
): void {
  const seen = new Set(targetOrder);
  for (const resourceType of source.resourceOrder) {
    if (seen.has(resourceType)) fatal(`[civ7-tables] duplicate resources: ${resourceType}`);
    seen.add(resourceType);
    targetOrder.push(resourceType);
  }
  for (const [resourceType, rows] of Object.entries(source.validPlacementRows)) {
    targetRows[resourceType] ??= [];
    targetRows[resourceType].push(...rows);
  }
  for (const [resourceType, flags] of Object.entries(source.placementFlags)) {
    targetFlags[resourceType] = flags;
  }
}

function indexResourceValidPlacementRows(
  resourceValidPlacementRows: Record<string, ResourceValidPlacementRow[]>,
  resourceTypes: Record<string, number>,
  biomeGlobals: Record<string, number>,
  terrainTypeIndices: Record<string, number>,
  featureTypes: Record<string, number>
): Record<string, Array<readonly [number, number, number]>> {
  const out: Record<string, Array<readonly [number, number, number]>> = {};
  for (const [resourceType, rows] of Object.entries(resourceValidPlacementRows)) {
    const resourceIndex = resourceTypes[resourceType];
    if (resourceIndex == null) continue;
    const indexedRows: Array<readonly [number, number, number]> = [];
    const seen = new Set<string>();
    for (const row of rows) {
      const biomeIndex = biomeGlobals[row.biomeType];
      const terrainIndex = terrainTypeIndices[row.terrainType];
      const featureIndex = row.featureType ? featureTypes[row.featureType] : -1;
      if (!Number.isFinite(biomeIndex) || !Number.isFinite(terrainIndex)) continue;
      if (row.featureType && !Number.isFinite(featureIndex)) continue;
      const key = `${biomeIndex}:${terrainIndex}:${featureIndex}`;
      if (seen.has(key)) continue;
      seen.add(key);
      indexedRows.push([biomeIndex, terrainIndex, featureIndex]);
    }
    if (indexedRows.length) out[String(resourceIndex)] = indexedRows;
  }
  return out;
}

function indexResourcePlacementFlags(
  resourcePlacementFlags: Record<string, ResourcePlacementFlags>,
  resourceTypes: Record<string, number>
): Record<string, { adjacentToLand: boolean; lakeEligible: boolean }> {
  const out: Record<string, { adjacentToLand: boolean; lakeEligible: boolean }> = {};
  for (const [resourceType, flags] of Object.entries(resourcePlacementFlags)) {
    const resourceIndex = resourceTypes[resourceType];
    if (resourceIndex == null) continue;
    out[String(resourceIndex)] = flags;
  }
  return out;
}

function main(): void {
  const repoRoot = process.cwd();
  const terrainXmlRelPath = "Base/modules/base-standard/data/terrain.xml";
  const mapGlobalsRelPath = "Base/modules/base-standard/maps/map-globals.js";
  const featureXmlRelPaths = [
    "Base/modules/base-standard/data/racetowonders-terrain.xml",
    "Base/modules/base-standard/data/marvelous-mountains-terrain.xml",
    terrainXmlRelPath,
    "DLC/mountain-natural-wonders/modules/data/terrain.xml",
    "DLC/water-wonders/modules/data/terrain.xml",
  ];
  const resourceXmlRelPaths = [
    "Base/modules/base-standard/data/resources.xml",
    "Base/modules/base-standard/data/resources-v2.xml",
  ];
  const terrainXmlPath = resolve(repoRoot, ".civ7/outputs/resources", terrainXmlRelPath);
  const policyOutPath = resolve(repoRoot, "packages/civ7-map-policy/src/civ7-tables.gen.ts");
  const adapterOutPath = resolve(repoRoot, "packages/civ7-adapter/src/civ7-tables.gen.ts");
  const outPath = resolve(repoRoot, "apps/mapgen-studio/src/civ7-data/civ7-tables.gen.ts");

  const xml = readFileSync(terrainXmlPath, "utf8");
  const terrainAndBiome = parseTerrainXml(xml);
  const mapGlobalsPath = resolve(repoRoot, ".civ7/outputs/resources", mapGlobalsRelPath);
  if (!existsSync(mapGlobalsPath)) fatal(`[civ7-tables] missing source file: ${mapGlobalsRelPath}`);
  const mapGlobals = parseMapGlobals(readFileSync(mapGlobalsPath, "utf8"), mapGlobalsRelPath);
  const featureOrder: string[] = [];
  const featureValidTerrains: Record<string, string[]> = {};
  const featureValidBiomes: Record<string, string[]> = {};
  const featureTags: Record<string, string[]> = {};
  const featurePolicies: Record<string, FeaturePolicy> = {};
  const resourceOrder: string[] = [];
  const resourceValidPlacementRows: Record<string, ResourceValidPlacementRow[]> = {};
  const resourcePlacementFlags: Record<string, ResourcePlacementFlags> = {};
  for (const relPath of featureXmlRelPaths) {
    const path = resolve(repoRoot, ".civ7/outputs/resources", relPath);
    if (!existsSync(path)) fatal(`[civ7-tables] missing source file: ${relPath}`);
    const featureXml = readFileSync(path, "utf8");
    appendUnique(featureOrder, parseFeatureXml(featureXml, relPath));
    mergeFeatureValidTerrains(featureValidTerrains, parseFeatureValidTerrainsXml(featureXml));
    mergeFeatureValidTerrains(featureValidBiomes, parseFeatureValidBiomesXml(featureXml));
    mergeFeatureTags(featureTags, parseFeatureTagsXml(featureXml));
    mergeFeaturePolicies(featurePolicies, parseFeaturePoliciesXml(featureXml));
  }
  for (const relPath of resourceXmlRelPaths) {
    const path = resolve(repoRoot, ".civ7/outputs/resources", relPath);
    if (!existsSync(path)) fatal(`[civ7-tables] missing source file: ${relPath}`);
    mergeResourceTables(
      resourceOrder,
      resourceValidPlacementRows,
      resourcePlacementFlags,
      parseResourceXml(readFileSync(path, "utf8"), relPath)
    );
  }
  const extracted: ExtractedTables = {
    ...terrainAndBiome,
    featureOrder,
    featureValidTerrains,
    featureValidBiomes,
    featureTags,
    featurePolicies,
    resourceOrder,
    resourceValidPlacementRows,
    resourcePlacementFlags,
    mapGlobals,
    sources: uniqueValues([
      terrainXmlRelPath,
      mapGlobalsRelPath,
      ...featureXmlRelPaths,
      ...resourceXmlRelPaths,
    ]),
  };

  const terrainTypeIndices = indexByOrder(extracted.terrainTypeOrder);
  const biomeGlobals = indexByOrder(extracted.biomeOrder);
  const featureTypes = indexByOrder(extracted.featureOrder);
  const resourceTypes = indexByOrder(extracted.resourceOrder);
  const featureValidTerrainTypeIndices = indexFeatureValidTerrains(
    extracted.featureValidTerrains,
    featureTypes,
    terrainTypeIndices
  );
  const featureValidBiomeTypeIndices = indexFeatureValidTerrains(
    extracted.featureValidBiomes,
    featureTypes,
    biomeGlobals
  );
  const featureTagsByFeatureType = indexFeatureTags(extracted.featureTags, featureTypes);
  const indexedFeaturePolicies = indexFeaturePolicies(extracted.featurePolicies, featureTypes);
  const indexedResourceValidPlacementRows = indexResourceValidPlacementRows(
    extracted.resourceValidPlacementRows,
    resourceTypes,
    biomeGlobals,
    terrainTypeIndices,
    featureTypes
  );
  const indexedResourcePlacementFlags = indexResourcePlacementFlags(
    extracted.resourcePlacementFlags,
    resourceTypes
  );

  if (featureTypes.FEATURE_BERMUDA_TRIANGLE !== 0 || featureTypes.FEATURE_MOUNT_EVEREST !== 1) {
    fatal("[civ7-tables] feature order does not match live GameInfo.Features natural-wonder prefix");
  }
  if (featureTypes.FEATURE_SAGEBRUSH_STEPPE !== 2 || featureTypes.FEATURE_MAPU_A_VAEA_BLOWHOLES !== 45) {
    fatal("[civ7-tables] feature order does not match live GameInfo.Features base/DLC ordering");
  }
  if (resourceTypes.RESOURCE_COTTON !== 0 || resourceTypes.RESOURCE_PITCH !== 54) {
    fatal("[civ7-tables] resource order does not match base-standard resources.xml/resources-v2.xml ordering");
  }

  mkdirSync(dirname(outPath), { recursive: true });
  mkdirSync(dirname(policyOutPath), { recursive: true });
  mkdirSync(dirname(adapterOutPath), { recursive: true });

  const policyFile = `/* eslint-disable */
/**
 * GENERATED FILE — DO NOT EDIT BY HAND.
 *
 * Generated by: \`bun scripts/mapgen-studio/generate-civ7-browser-tables.ts\`
 * Source of truth: Civ7 official resource XML under \`.civ7/outputs/resources\`
 *
 * Purpose:
 * - Provide Civ7-derived terrain/biome/feature indices for mock generation.
 * - Keep browser Studio, diagnostics, and adapter mocks on the same GameInfo order.
 */

export const CIV7_BROWSER_TABLES_V0 = {
  version: 0 as const,
  source: ${JSON.stringify(extracted.sources, null, 2)} as const,
  mapGlobals: ${JSON.stringify(extracted.mapGlobals, null, 2)} as const,
  terrainTypeIndices: ${toTsObjectLiteral(terrainTypeIndices)} as const,
  biomeGlobals: ${toTsObjectLiteral(biomeGlobals)} as const,
  featureTypes: ${toTsObjectLiteral(featureTypes)} as const,
  featureValidTerrainTypeIndices: ${toTsNumberArrayObjectLiteral(featureValidTerrainTypeIndices)} as const,
  featureValidBiomeTypeIndices: ${toTsNumberArrayObjectLiteral(featureValidBiomeTypeIndices)} as const,
  featureTagsByFeatureType: ${toTsStringArrayObjectLiteral(featureTagsByFeatureType)} as const,
  featurePolicies: ${toTsFeaturePoliciesObjectLiteral(indexedFeaturePolicies)} as const,
  resourceTypes: ${toTsObjectLiteral(resourceTypes)} as const,
  resourceValidPlacementRows: ${toTsResourcePlacementRowsObjectLiteral(indexedResourceValidPlacementRows)} as const,
  resourcePlacementFlags: ${toTsResourcePolicyFlagsObjectLiteral(indexedResourcePlacementFlags)} as const,
} as const;

export type Civ7BrowserTablesV0 = typeof CIV7_BROWSER_TABLES_V0;
`;

  const adapterFile = `/* eslint-disable */
/**
 * GENERATED FILE — DO NOT EDIT BY HAND.
 *
 * Generated by: \`bun scripts/mapgen-studio/generate-civ7-browser-tables.ts\`
 * Source of truth: \`@civ7/map-policy\` generated Civ7 table contract.
 */

export { CIV7_BROWSER_TABLES_V0 } from "@civ7/map-policy";
export type { Civ7BrowserTablesV0 } from "@civ7/map-policy";
`;

  const appFile = `/* eslint-disable */
/**
 * GENERATED FILE — DO NOT EDIT BY HAND.
 *
 * Generated by: \`bun scripts/mapgen-studio/generate-civ7-browser-tables.ts\`
 * Source of truth: \`@civ7/map-policy\` generated Civ7 table contract.
 */

export { CIV7_BROWSER_TABLES_V0 } from "@civ7/map-policy";
export type { Civ7BrowserTablesV0 } from "@civ7/map-policy";
`;

  writeFileSync(policyOutPath, policyFile);
  writeFileSync(adapterOutPath, adapterFile);
  writeFileSync(outPath, appFile);
  console.log(`[civ7-tables] wrote ${policyOutPath}`);
  console.log(`[civ7-tables] wrote ${adapterOutPath}`);
  console.log(`[civ7-tables] wrote ${outPath}`);
}

main();

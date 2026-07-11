/**
 * Civ7 map-policy generated-table verifier (S2, placement-realignment).
 *
 * Verifies or regenerates `packages/civ7-map-policy/src/civ7-tables.gen.ts`
 * from the official Civ7 resources submodule at `.civ7/outputs/resources`
 * (READ-ONLY).
 *
 * This restores the lost generator behind the committed V0 tables (see
 * docs/projects/placement-realignment/diagnosis.md RC4: the file claimed
 * generation by scripts/mapgen-studio/generate-civ7-browser-tables.ts, which
 * only ever emitted a terrain/biome/feature subset) and extends the output
 * with V1 policy data (resource weights/minimums/required-for-age,
 * MapResourceMinimumAmountModifier, StartBias tables, start-buffer globals).
 *
 * Usage:
 *   bun ./scripts/verify.ts          # verify committed output is current
 *   bun ./scripts/verify.ts --write  # regenerate from the package root
 */

import { execSync } from "node:child_process";
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { CIV7_RIVER_TYPE_METADATA_SOURCE } from "../src/river-type-metadata.source.js";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(SCRIPT_DIR, "../../..");
const SUBMODULE_ROOT = resolve(REPO_ROOT, ".civ7/outputs/resources");
const OUT_PATH = resolve(REPO_ROOT, "packages/civ7-map-policy/src/civ7-tables.gen.ts");

// ---------------------------------------------------------------------------
// Source files (paths relative to the submodule root)
// ---------------------------------------------------------------------------

const BASE_TERRAIN = "Base/modules/base-standard/data/terrain.xml";
const MAP_GLOBALS = "Base/modules/base-standard/maps/map-globals.js";
const RACETOWONDERS_TERRAIN = "Base/modules/base-standard/data/racetowonders-terrain.xml";
const MARVELOUS_TERRAIN = "Base/modules/base-standard/data/marvelous-mountains-terrain.xml";
const DLC_MOUNTAIN_TERRAIN = "DLC/mountain-natural-wonders/modules/data/terrain.xml";
const DLC_WATER_TERRAIN = "DLC/water-wonders/modules/data/terrain.xml";
const BASE_RESOURCES = "Base/modules/base-standard/data/resources.xml";
const BASE_RESOURCES_V2 = "Base/modules/base-standard/data/resources-v2.xml";
const MAPS_XML = "Base/modules/base-standard/data/maps.xml";

/** V0 source list — kept verbatim (order included) for byte-stable output. */
const V0_SOURCES = [
  BASE_TERRAIN,
  MAP_GLOBALS,
  RACETOWONDERS_TERRAIN,
  MARVELOUS_TERRAIN,
  DLC_MOUNTAIN_TERRAIN,
  DLC_WATER_TERRAIN,
  BASE_RESOURCES,
  BASE_RESOURCES_V2,
] as const;

/**
 * Feature definition load order. This reproduces the live GameInfo.Features
 * index order captured in the committed V0 tables (verified against live
 * engine readbacks by the legality-repair evidence): the base-standard wonder
 * add-on files (racetowonders, marvelous-mountains) load BEFORE terrain.xml,
 * then the two DLC wonder modules append.
 */
const FEATURE_SOURCE_FILES = [
  RACETOWONDERS_TERRAIN,
  MARVELOUS_TERRAIN,
  BASE_TERRAIN,
  DLC_MOUNTAIN_TERRAIN,
  DLC_WATER_TERRAIN,
] as const;

/** Resource definition load order (GameInfo.Resources index order). */
const RESOURCE_SOURCE_FILES = [BASE_RESOURCES, BASE_RESOURCES_V2] as const;

// ---------------------------------------------------------------------------
// Small XML helpers (the official files are flat attribute-only <Row/> tables)
// ---------------------------------------------------------------------------

type Attrs = Record<string, string>;

function fatal(message: string): never {
  console.error(`[civ7-map-policy:verify] ${message}`);
  process.exit(1);
}

function readSub(relPath: string): string {
  return readFileSync(resolve(SUBMODULE_ROOT, relPath), "utf8");
}

function stripComments(xml: string): string {
  return xml.replace(/<!--[\s\S]*?-->/g, "");
}

/** Concatenated inner content of every `<tag>...</tag>` section in the file. */
function xmlSections(xml: string, tag: string): string[] {
  const out: string[] = [];
  const re = new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`, "g");
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml))) out.push(m[1] ?? "");
  return out;
}

/** All `<Row .../>` attribute maps within a section, in document order. */
function sectionRows(sectionXml: string): Attrs[] {
  const out: Attrs[] = [];
  const rowRe = /<Row\b([^>]*?)\/?>/g;
  const attrRe = /([A-Za-z_][\w]*)="([^"]*)"/g;
  let m: RegExpExecArray | null;
  while ((m = rowRe.exec(stripComments(sectionXml)))) {
    const attrs: Attrs = {};
    let a: RegExpExecArray | null;
    while ((a = attrRe.exec(m[1] ?? ""))) attrs[a[1]!] = a[2]!;
    out.push(attrs);
  }
  return out;
}

function rowsIn(relPath: string, tag: string): Attrs[] {
  return xmlSections(readSub(relPath), tag).flatMap(sectionRows);
}

function rowsAcross(relPaths: readonly string[], tag: string): Attrs[] {
  return relPaths.flatMap((p) => rowsIn(p, tag));
}

function assertNoDuplicates(label: string, values: string[]): void {
  const seen = new Set<string>();
  for (const v of values) {
    if (seen.has(v)) fatal(`duplicate ${label}: ${v}`);
    seen.add(v);
  }
}

function requireIndex(map: Record<string, number>, key: string, context: string): number {
  const idx = map[key];
  if (idx === undefined) fatal(`unknown ${context}: ${key}`);
  return idx;
}

// ---------------------------------------------------------------------------
// V0 extraction (must stay byte-stable with the committed tables)
// ---------------------------------------------------------------------------

function indexByOrder(values: string[]): Record<string, number> {
  return Object.fromEntries(values.map((v, i) => [v, i]));
}

const terrainOrder = rowsIn(BASE_TERRAIN, "Terrains")
  .map((r) => r.TerrainType)
  .filter((v): v is string => Boolean(v));
const biomeOrder = rowsIn(BASE_TERRAIN, "Biomes")
  .map((r) => r.BiomeType)
  .filter((v): v is string => Boolean(v));
if (!terrainOrder.length || !biomeOrder.length) fatal("missing terrain/biome rows");
assertNoDuplicates("terrain", terrainOrder);
assertNoDuplicates("biome", biomeOrder);
const terrainTypeIndices = indexByOrder(terrainOrder);
const biomeGlobals = indexByOrder(biomeOrder);

type FeatureRow = Attrs & { FeatureType: string };
const featureRows: FeatureRow[] = rowsAcross(FEATURE_SOURCE_FILES, "Features").filter(
  (r): r is FeatureRow => Boolean(r.FeatureType)
);
const featureOrder = featureRows.map((r) => r.FeatureType);
if (!featureOrder.length) fatal("no feature rows found");
assertNoDuplicates("feature", featureOrder);
const featureTypes = indexByOrder(featureOrder);

const featureValidTerrainTypeIndices: Record<number, number[]> = {};
for (const row of rowsAcross(FEATURE_SOURCE_FILES, "Feature_ValidTerrains")) {
  if (!row.FeatureType || !row.TerrainType) continue;
  const f = requireIndex(featureTypes, row.FeatureType, "feature (Feature_ValidTerrains)");
  const t = requireIndex(terrainTypeIndices, row.TerrainType, "terrain (Feature_ValidTerrains)");
  (featureValidTerrainTypeIndices[f] ??= []).push(t);
}

const featureValidBiomeTypeIndices: Record<number, number[]> = {};
for (const row of rowsAcross(FEATURE_SOURCE_FILES, "Feature_ValidBiomes")) {
  if (!row.FeatureType || !row.BiomeType) continue;
  const f = requireIndex(featureTypes, row.FeatureType, "feature (Feature_ValidBiomes)");
  const b = requireIndex(biomeGlobals, row.BiomeType, "biome (Feature_ValidBiomes)");
  (featureValidBiomeTypeIndices[f] ??= []).push(b);
}

const featureTagsByFeatureType: Record<number, string[]> = {};
for (const row of rowsAcross(FEATURE_SOURCE_FILES, "TypeTags")) {
  if (!row.Type || !row.Tag) continue;
  const f = featureTypes[row.Type];
  if (f === undefined) continue; // TypeTags also carries non-feature types
  (featureTagsByFeatureType[f] ??= []).push(row.Tag);
}
for (const tags of Object.values(featureTagsByFeatureType)) tags.sort();

type NaturalWonderRow = { tiles: number; direction: number; placeFirst: boolean };
const naturalWonderRows: Record<number, NaturalWonderRow> = {};
for (const row of rowsAcross(FEATURE_SOURCE_FILES, "Feature_NaturalWonders")) {
  if (!row.FeatureType || !row.Tiles) continue;
  const f = requireIndex(featureTypes, row.FeatureType, "feature (Feature_NaturalWonders)");
  naturalWonderRows[f] = {
    tiles: Number(row.Tiles),
    direction: row.Direction !== undefined ? Number(row.Direction) : -1,
    placeFirst: row.PlaceFirst === "true",
  };
}

type FeaturePolicy = {
  noLake: boolean;
  minimumElevation?: number;
  placementClass: string;
  naturalWonder?: NaturalWonderRow;
};
const featurePolicies: Record<number, FeaturePolicy> = {};
featureRows.forEach((row, idx) => {
  if (!row.PlacementClass) fatal(`feature ${row.FeatureType} has no PlacementClass`);
  const policy: FeaturePolicy = {
    noLake: row.NoLake === "true",
    placementClass: row.PlacementClass,
  };
  if (row.MinimumElevation !== undefined) policy.minimumElevation = Number(row.MinimumElevation);
  const nw = naturalWonderRows[idx];
  if (nw) policy.naturalWonder = nw;
  featurePolicies[idx] = policy;
});

type ResourceRowAttrs = Attrs & { ResourceType: string };
const resourceRowsRaw: ResourceRowAttrs[] = rowsAcross(RESOURCE_SOURCE_FILES, "Resources").filter(
  (r): r is ResourceRowAttrs => Boolean(r.ResourceType)
);
const resourceOrder = resourceRowsRaw.map((r) => r.ResourceType);
if (!resourceOrder.length) fatal("no resource rows found");
assertNoDuplicates("resource", resourceOrder);
const resourceTypes = indexByOrder(resourceOrder);

const resourceValidPlacementRows: Record<number, Array<[number, number, number]>> = {};
for (const row of rowsAcross(RESOURCE_SOURCE_FILES, "Resource_ValidBiomes")) {
  if (!row.ResourceType || !row.BiomeType || !row.TerrainType) continue;
  const r = requireIndex(resourceTypes, row.ResourceType, "resource (Resource_ValidBiomes)");
  const b = requireIndex(biomeGlobals, row.BiomeType, "biome (Resource_ValidBiomes)");
  const t = requireIndex(terrainTypeIndices, row.TerrainType, "terrain (Resource_ValidBiomes)");
  const f =
    row.FeatureType !== undefined
      ? requireIndex(featureTypes, row.FeatureType, "feature (Resource_ValidBiomes)")
      : -1;
  (resourceValidPlacementRows[r] ??= []).push([b, t, f]);
}

const resourcePlacementFlags: Record<number, { adjacentToLand: boolean; lakeEligible: boolean }> =
  {};
resourceRowsRaw.forEach((row, idx) => {
  resourcePlacementFlags[idx] = {
    adjacentToLand: row.AdjacentToLand === "true",
    lakeEligible: row.LakeEligible !== "false",
  };
});

function jsGlobal(source: string, name: string): number {
  const m = new RegExp(`const ${name} = (-?[\\d.]+);`).exec(source);
  if (!m?.[1]) fatal(`missing JS global ${name} in ${MAP_GLOBALS}`);
  return Number(m[1]);
}
const mapGlobalsSource = readSub(MAP_GLOBALS);
const mapGlobals = {
  polarWaterRows: jsGlobal(mapGlobalsSource, "g_PolarWaterRows"),
  oceanWaterColumns: jsGlobal(mapGlobalsSource, "g_OceanWaterColumns"),
};

// ---------------------------------------------------------------------------
// V1 extraction (additive policy data)
// ---------------------------------------------------------------------------

/**
 * DLC resource data files. Today only ashoka-himiko-alt ships one
 * (Resource_RequiredLeaders rows only). If a future submodule refresh adds
 * NEW <Resources> rows in DLC, index assignment must be decided explicitly —
 * the generator fails loudly instead of guessing.
 */
function discoverDlcResourceFiles(): string[] {
  const out: string[] = [];
  const dlcRoot = resolve(SUBMODULE_ROOT, "DLC");
  for (const entry of readdirSync(dlcRoot).sort()) {
    const candidate = join(dlcRoot, entry, "modules/data/resources.xml");
    try {
      statSync(candidate);
      out.push(relative(SUBMODULE_ROOT, candidate));
    } catch {
      // no resources.xml in this DLC
    }
  }
  return out;
}
const dlcResourceFiles = discoverDlcResourceFiles();
for (const file of dlcResourceFiles) {
  for (const row of rowsIn(file, "Resources")) {
    if (row.ResourceType && resourceTypes[row.ResourceType] === undefined) {
      fatal(
        `DLC file ${file} defines a NEW resource ${row.ResourceType}; ` +
          `decide its GameInfo index explicitly before regenerating`
      );
    }
  }
}
const allResourceDataFiles = [...RESOURCE_SOURCE_FILES, ...dlcResourceFiles];

type ResourceRowV1 = {
  type: string;
  classType: string;
  weight: number;
  minimumPerHemisphere: number;
  hemisphereUnique: boolean;
  staple: boolean;
  tradeable: boolean;
  unlocksCiv: boolean;
};
const resourceRows: Record<string, ResourceRowV1> = {};
resourceRowsRaw.forEach((row, idx) => {
  if (row.Weight === undefined) fatal(`resource ${row.ResourceType} has no Weight`);
  if (!row.ResourceClassType) fatal(`resource ${row.ResourceType} has no ResourceClassType`);
  resourceRows[String(idx)] = {
    type: row.ResourceType,
    classType: row.ResourceClassType,
    weight: Number(row.Weight),
    minimumPerHemisphere:
      row.MinimumPerHemisphere !== undefined ? Number(row.MinimumPerHemisphere) : 0,
    hemisphereUnique: row.HemisphereUnique === "true",
    staple: row.Staple === "true",
    tradeable: row.Tradeable !== "false",
    unlocksCiv: row.UnlocksCiv === "true",
  };
});

const resourceValidAges: Record<string, string[]> = {};
for (const row of rowsAcross(allResourceDataFiles, "Resource_ValidAges")) {
  if (!row.ResourceType || !row.AgeType) continue;
  const r = requireIndex(resourceTypes, row.ResourceType, "resource (Resource_ValidAges)");
  (resourceValidAges[String(r)] ??= []).push(row.AgeType);
}

const resourceRequiredLeaders: Record<string, string[]> = {};
for (const row of rowsAcross(allResourceDataFiles, "Resource_RequiredLeaders")) {
  if (!row.ResourceType || !row.LeaderType) continue;
  const r = requireIndex(resourceTypes, row.ResourceType, "resource (Resource_RequiredLeaders)");
  const list = (resourceRequiredLeaders[String(r)] ??= []);
  if (!list.includes(row.LeaderType)) list.push(row.LeaderType);
}
for (const leaders of Object.values(resourceRequiredLeaders)) leaders.sort();

/**
 * Static approximation of ResourceBuilder.isResourceRequiredForAge: a
 * resource is "required" for an age when at least one leader requires it
 * (Resource_RequiredLeaders) and the resource is valid in that age
 * (Resource_ValidAges). The engine call additionally filters to leaders in
 * the running game — that game-state dependence cannot be tabled statically
 * (recorded in the S2 decision log; Milestone A live probe verifies).
 */
const isResourceRequiredForAge: Record<string, string[]> = {};
for (const idx of Object.keys(resourceRequiredLeaders)) {
  isResourceRequiredForAge[idx] = [...(resourceValidAges[idx] ?? [])];
}

type MinimumAmountModifierRow = { mapType: string; mapSizeType: string; amount: number };
const mapResourceMinimumAmountModifier: MinimumAmountModifierRow[] = rowsIn(
  MAPS_XML,
  "MapResourceMinimumAmountModifier"
)
  .filter((r) => r.MapType && r.MapSizeType && r.Amount !== undefined)
  .map((r) => ({ mapType: r.MapType!, mapSizeType: r.MapSizeType!, amount: Number(r.Amount) }));
if (!mapResourceMinimumAmountModifier.length) {
  fatal("no MapResourceMinimumAmountModifier rows found");
}

// --- StartBias tables ------------------------------------------------------

const START_BIAS_VALUE_ATTR: Record<string, string | null> = {
  StartBiasBiomes: "BiomeType",
  StartBiasTerrains: "TerrainType",
  StartBiasFeatureClasses: "FeatureClassType",
  StartBiasResources: "ResourceType",
  StartBiasRivers: null,
  StartBiasLakes: null,
  StartBiasAdjacentToCoasts: null,
  StartBiasNaturalWonders: null,
};

function discoverStartBiasFiles(): string[] {
  const out: string[] = [];
  const walk = (dir: string): void => {
    for (const entry of readdirSync(dir).sort()) {
      const full = join(dir, entry);
      const st = statSync(full);
      if (st.isDirectory()) walk(full);
      else if (entry.endsWith(".xml") && readFileSync(full, "utf8").includes("<StartBias")) {
        out.push(relative(SUBMODULE_ROOT, full));
      }
    }
  };
  walk(resolve(SUBMODULE_ROOT, "Base/modules"));
  walk(resolve(SUBMODULE_ROOT, "DLC"));
  return out.sort();
}
const startBiasFiles = discoverStartBiasFiles();

type StartBiasValueRow = {
  civilizationType: string | null;
  leaderType: string | null;
  value: string;
  score: number;
};
type StartBiasScoreRow = {
  civilizationType: string | null;
  leaderType: string | null;
  score: number;
};

function collectStartBias(tag: string): Array<StartBiasValueRow | StartBiasScoreRow> {
  const valueAttr = START_BIAS_VALUE_ATTR[tag];
  if (valueAttr === undefined) fatal(`unknown StartBias table ${tag}`);
  const rows: Array<StartBiasValueRow | StartBiasScoreRow> = [];
  for (const file of startBiasFiles) {
    for (const row of rowsIn(file, tag)) {
      if (row.Score === undefined) continue;
      const owner = {
        civilizationType: row.CivilizationType ?? null,
        leaderType: row.LeaderType ?? null,
      };
      if (!owner.civilizationType && !owner.leaderType) {
        fatal(`${tag} row in ${file} has neither CivilizationType nor LeaderType`);
      }
      if (valueAttr === null) {
        rows.push({ ...owner, score: Number(row.Score) });
      } else {
        const value = row[valueAttr];
        if (!value) fatal(`${tag} row in ${file} is missing ${valueAttr}`);
        rows.push({ ...owner, value, score: Number(row.Score) });
      }
    }
  }
  return rows;
}

const startBias = {
  biomes: collectStartBias("StartBiasBiomes") as StartBiasValueRow[],
  terrains: collectStartBias("StartBiasTerrains") as StartBiasValueRow[],
  featureClasses: collectStartBias("StartBiasFeatureClasses") as StartBiasValueRow[],
  resources: collectStartBias("StartBiasResources") as StartBiasValueRow[],
  rivers: collectStartBias("StartBiasRivers") as StartBiasScoreRow[],
  lakes: collectStartBias("StartBiasLakes") as StartBiasScoreRow[],
  adjacentToCoasts: collectStartBias("StartBiasAdjacentToCoasts") as StartBiasScoreRow[],
  naturalWonders: collectStartBias("StartBiasNaturalWonders") as StartBiasScoreRow[],
};

const startGlobals = {
  requiredBufferBetweenMajorStarts: jsGlobal(
    mapGlobalsSource,
    "g_RequiredBufferBetweenMajorStarts"
  ),
  desiredBufferBetweenMajorStarts: jsGlobal(mapGlobalsSource, "g_DesiredBufferBetweenMajorStarts"),
  requiredDistanceFromMajorForDiscoveries: jsGlobal(
    mapGlobalsSource,
    "g_RequiredDistanceFromMajorForDiscoveries"
  ),
  avoidSeamOffset: jsGlobal(mapGlobalsSource, "g_AvoidSeamOffset"),
  ignoreStartSectorPctFromCtr: jsGlobal(mapGlobalsSource, "g_IgnoreStartSectorPctFromCtr"),
  startSectorWeight: jsGlobal(mapGlobalsSource, "g_StartSectorWeight"),
};

const v1Sources = [...allResourceDataFiles, MAPS_XML, MAP_GLOBALS, ...startBiasFiles];

// ---------------------------------------------------------------------------
// Emission — V0 formatting must stay byte-stable with the committed tables
// ---------------------------------------------------------------------------

function sortedIndexLiteral(obj: Record<string, number>): string {
  const lines = Object.keys(obj)
    .sort()
    .map((k) => `  ${JSON.stringify(k)}: ${obj[k]},`);
  return `{\n${lines.join("\n")}\n}`;
}

function numericKeys(obj: Record<number, unknown>): number[] {
  return Object.keys(obj)
    .map(Number)
    .sort((a, b) => a - b);
}

function numberArrayMapLiteral(obj: Record<number, number[]>): string {
  const lines = numericKeys(obj).map((k) => `  "${k}": [${obj[k]!.join(", ")}],`);
  return `{\n${lines.join("\n")}\n}`;
}

function stringArrayMapLiteral(obj: Record<number, string[]>): string {
  const lines = numericKeys(obj).map(
    (k) => `  "${k}": [${obj[k]!.map((v) => JSON.stringify(v)).join(", ")}],`
  );
  return `{\n${lines.join("\n")}\n}`;
}

function featurePoliciesLiteral(obj: Record<number, FeaturePolicy>): string {
  const lines = numericKeys(obj).map((k) => {
    const p = obj[k]!;
    const parts = [`noLake: ${p.noLake}`];
    if (p.minimumElevation !== undefined) parts.push(`minimumElevation: ${p.minimumElevation}`);
    parts.push(`placementClass: ${JSON.stringify(p.placementClass)}`);
    if (p.naturalWonder) {
      parts.push(`naturalWonderTiles: ${p.naturalWonder.tiles}`);
      parts.push(`naturalWonderDirection: ${p.naturalWonder.direction}`);
      if (p.naturalWonder.placeFirst) parts.push(`naturalWonderPlaceFirst: true`);
    }
    return `  "${k}": { ${parts.join(", ")} },`;
  });
  return `{\n${lines.join("\n")}\n}`;
}

function placementRowsLiteral(obj: Record<number, Array<[number, number, number]>>): string {
  const lines = numericKeys(obj).map((k) => {
    const rows = obj[k]!.map((row) => `[${row.join(", ")}]`).join(", ");
    return `  "${k}": [${rows}],`;
  });
  return `{\n${lines.join("\n")}\n}`;
}

function placementFlagsLiteral(
  obj: Record<number, { adjacentToLand: boolean; lakeEligible: boolean }>
): string {
  const lines = numericKeys(obj).map((k) => {
    const f = obj[k]!;
    return `  "${k}": { adjacentToLand: ${f.adjacentToLand}, lakeEligible: ${f.lakeEligible} },`;
  });
  return `{\n${lines.join("\n")}\n}`;
}

function submoduleCommit(): string {
  try {
    return execSync("git rev-parse HEAD", { cwd: SUBMODULE_ROOT, encoding: "utf8" }).trim();
  } catch {
    fatal("cannot read submodule commit (.civ7/outputs/resources not initialized?)");
  }
}

const commit = submoduleCommit();

const file = `/* eslint-disable */
/**
 * GENERATED FILE — DO NOT EDIT BY HAND.
 *
 * Generated by: \`nx run civ7-map-policy:verify -- --write\`
 * Source evidence: Civ7 official resource XML/JS under \`.civ7/outputs/resources\`,
 * plus live/runtime river evidence listed in \`CIV7_RIVER_TYPE_METADATA_SOURCE\`
 * Submodule commit: ${commit}
 *
 * Purpose:
 * - Provide Civ7-derived terrain/biome/feature indices and river metadata for mock generation.
 * - Keep browser Studio, diagnostics, and adapter mocks on the same GameInfo order.
 * - V1 adds resource weights/hemisphere minimums/required-for-age data,
 *   MapResourceMinimumAmountModifier rows, StartBias tables, and start-buffer
 *   globals for policy-grounded placement planning.
 */

export const CIV7_BROWSER_TABLES_V0 = {
  version: 0 as const,
  source: ${JSON.stringify(V0_SOURCES, null, 2)} as const,
  mapGlobals: ${JSON.stringify(mapGlobals, null, 2)} as const,
  terrainTypeIndices: ${sortedIndexLiteral(terrainTypeIndices)} as const,
  biomeGlobals: ${sortedIndexLiteral(biomeGlobals)} as const,
  featureTypes: ${sortedIndexLiteral(featureTypes)} as const,
  featureValidTerrainTypeIndices: ${numberArrayMapLiteral(featureValidTerrainTypeIndices)} as const,
  featureValidBiomeTypeIndices: ${numberArrayMapLiteral(featureValidBiomeTypeIndices)} as const,
  featureTagsByFeatureType: ${stringArrayMapLiteral(featureTagsByFeatureType)} as const,
  featurePolicies: ${featurePoliciesLiteral(featurePolicies)} as const,
  resourceTypes: ${sortedIndexLiteral(resourceTypes)} as const,
  resourceValidPlacementRows: ${placementRowsLiteral(resourceValidPlacementRows)} as const,
  resourcePlacementFlags: ${placementFlagsLiteral(resourcePlacementFlags)} as const,
  riverTypes: ${JSON.stringify(CIV7_RIVER_TYPE_METADATA_SOURCE, null, 2)} as const,
} as const;

export type Civ7BrowserTablesV0 = typeof CIV7_BROWSER_TABLES_V0;

export type Civ7ResourceRowV1 = {
  readonly type: string;
  readonly classType: string;
  readonly weight: number;
  readonly minimumPerHemisphere: number;
  readonly hemisphereUnique: boolean;
  readonly staple: boolean;
  readonly tradeable: boolean;
  readonly unlocksCiv: boolean;
};

export type Civ7MapResourceMinimumAmountModifierRowV1 = {
  readonly mapType: string;
  readonly mapSizeType: string;
  readonly amount: number;
};

export type Civ7StartBiasValueRowV1 = {
  readonly civilizationType: string | null;
  readonly leaderType: string | null;
  readonly value: string;
  readonly score: number;
};

export type Civ7StartBiasScoreRowV1 = {
  readonly civilizationType: string | null;
  readonly leaderType: string | null;
  readonly score: number;
};

export type Civ7PolicyTablesV1 = {
  readonly version: 1;
  readonly source: readonly string[];
  /** Per-resource catalog row, keyed by GameInfo resource index. */
  readonly resourceRows: Readonly<Record<string, Civ7ResourceRowV1>>;
  /** Ages each resource is valid in (Resource_ValidAges), keyed by resource index. */
  readonly resourceValidAges: Readonly<Record<string, readonly string[]>>;
  /** Leaders requiring each resource (Resource_RequiredLeaders incl. DLC), keyed by resource index. */
  readonly resourceRequiredLeaders: Readonly<Record<string, readonly string[]>>;
  /**
   * Static approximation of ResourceBuilder.isResourceRequiredForAge: ages
   * for which the resource is leader-required AND age-valid. The live engine
   * additionally filters to leaders present in the running game.
   */
  readonly isResourceRequiredForAge: Readonly<Record<string, readonly string[]>>;
  /** GameInfo.MapResourceMinimumAmountModifier rows (maps.xml). */
  readonly mapResourceMinimumAmountModifier: readonly Civ7MapResourceMinimumAmountModifierRowV1[];
  /** GameInfo.StartBias* rows across base + DLC civilization/leader data. */
  readonly startBias: {
    readonly biomes: readonly Civ7StartBiasValueRowV1[];
    readonly terrains: readonly Civ7StartBiasValueRowV1[];
    readonly featureClasses: readonly Civ7StartBiasValueRowV1[];
    readonly resources: readonly Civ7StartBiasValueRowV1[];
    readonly rivers: readonly Civ7StartBiasScoreRowV1[];
    readonly lakes: readonly Civ7StartBiasScoreRowV1[];
    readonly adjacentToCoasts: readonly Civ7StartBiasScoreRowV1[];
    readonly naturalWonders: readonly Civ7StartBiasScoreRowV1[];
  };
  /** Start-placement globals from map-globals.js. */
  readonly startGlobals: {
    readonly requiredBufferBetweenMajorStarts: number;
    readonly desiredBufferBetweenMajorStarts: number;
    readonly requiredDistanceFromMajorForDiscoveries: number;
    readonly avoidSeamOffset: number;
    readonly ignoreStartSectorPctFromCtr: number;
    readonly startSectorWeight: number;
  };
};

export const CIV7_POLICY_TABLES_V1: Civ7PolicyTablesV1 = ${JSON.stringify(
  {
    version: 1,
    source: v1Sources,
    resourceRows,
    resourceValidAges,
    resourceRequiredLeaders,
    isResourceRequiredForAge,
    mapResourceMinimumAmountModifier,
    startBias,
    startGlobals,
  },
  null,
  2
)};
`;

// ---------------------------------------------------------------------------
// Write / check
// ---------------------------------------------------------------------------

const writeMode = process.argv.includes("--write");
if (!writeMode) {
  const existing = readFileSync(OUT_PATH, "utf8");
  if (existing !== file) {
    fatal(
      `committed ${relative(REPO_ROOT, OUT_PATH)} is stale — rerun ` +
        "`nx run civ7-map-policy:verify -- --write` against the current submodule"
    );
  }
  console.log("[civ7-map-policy:verify] committed tables are current");
} else {
  writeFileSync(OUT_PATH, file);
  console.log(`[civ7-map-policy:verify] wrote ${relative(REPO_ROOT, OUT_PATH)}`);
}

const count = (o: object): number => Object.keys(o).length;
console.log(
  [
    `submodule=${commit.slice(0, 12)}`,
    `terrains=${terrainOrder.length}`,
    `biomes=${biomeOrder.length}`,
    `features=${featureOrder.length}`,
    `resources=${resourceOrder.length}`,
    `validPlacementResources=${count(resourceValidPlacementRows)}`,
    `resourceRows=${count(resourceRows)}`,
    `requiredLeaderResources=${count(resourceRequiredLeaders)}`,
    `minAmountModifierRows=${mapResourceMinimumAmountModifier.length}`,
    `startBiasRows=${Object.values(startBias).reduce((n, rows) => n + rows.length, 0)}`,
    `startBiasFiles=${startBiasFiles.length}`,
    `dlcResourceFiles=${dlcResourceFiles.length}`,
  ].join(" ")
);

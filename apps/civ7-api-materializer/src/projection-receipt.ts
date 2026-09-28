import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { type DeclarationEmission, emitBaseDeclarationProjection } from "./declaration-emit.js";
import { buildBaseModuleCatalog, type ModuleCatalog } from "./module-catalog.js";
import {
  CIV7_MAP_SCRIPT_MODULE_RESOLUTION_FILE,
  type MapScriptModuleResolution,
  projectMapScriptModuleResolution,
  renderMapScriptModuleResolution,
} from "./module-resolution.js";
import {
  EXPECTED_BASE_MAP_SCRIPT_ROOT_COUNT,
  projectDeclarationRealms,
  type RealmProjection,
} from "./realms.js";
import { collectBaseSourceMapEvidence, compareUtf8 } from "./source-maps.js";

const DECLARATION_PROJECTION_SCHEMA_VERSION = 5 as const;

const EXPECTED_BASE_SOURCE_MAP_COUNT = 1433;
const EXPECTED_EMBEDDED_TYPESCRIPT_SOURCE_COUNT = 960;
const EXPECTED_EMBEDDED_TS_SOURCE_COUNT = 716;
const EXPECTED_EMBEDDED_TSX_SOURCE_COUNT = 244;
const EXPECTED_COMPILED_BARREL_COUNT = 3;
const EXPECTED_COMPILED_IMPORT_BARREL_COUNT = 2;
const EXPECTED_UNRESOLVED_TARGET_COUNT = 5;

interface ProjectionSourceSnapshot {
  readonly receiptPath: ".civ7-source-receipt.json";
  readonly sourceReceiptSha256: string;
  readonly profileId: string;
  readonly sha256: string;
  readonly fileCount: number;
  readonly totalBytes: number;
  readonly applicationVersion: string;
  readonly steamBuildId: string;
}

export interface DeclarationProjectionReceipt {
  readonly schemaVersion: typeof DECLARATION_PROJECTION_SCHEMA_VERSION;
  readonly sourceSnapshot: ProjectionSourceSnapshot;
  readonly compiler: DeclarationEmission["compiler"];
  readonly sources: {
    readonly sourceMapCount: number;
    readonly embeddedTypeScriptCount: number;
    readonly tsCount: number;
    readonly tsxCount: number;
    readonly ignoredEmbeddedSourceCount: number;
    readonly sha256: string;
  };
  readonly modules: {
    readonly shardCount: number;
    readonly embeddedTypeScriptCount: number;
    readonly compiledBarrelCount: number;
    readonly compiledImportBarrelCount: number;
    readonly flatOutputFileNameMaxLength: number;
    readonly unresolvedTargets: DeclarationEmission["unresolvedTargets"];
    readonly compiledOnlyEdgeTargets: readonly string[];
    readonly sha256: string;
  };
  readonly emission: {
    readonly diagnosticCount: number;
    readonly diagnosticsSha256: string;
    readonly globalAugmentationCount: number;
    readonly globalAugmentationsSha256: string;
    readonly edgesSha256: string;
    readonly runtimeStylesheetImports: DeclarationEmission["runtimeStylesheetImports"];
    readonly anyKeywordCount: number;
  };
  readonly externalTypeEvidence: ModuleCatalog["solidTypeEvidence"];
  readonly realms: {
    readonly shell: { readonly rootCount: number; readonly moduleCount: number };
    readonly game: { readonly rootCount: number; readonly moduleCount: number };
    readonly map: { readonly rootCount: number; readonly moduleCount: number };
    readonly nonScriptMaps: RealmProjection["nonScriptMaps"];
    readonly sha256: string;
  };
  readonly moduleResolution: {
    readonly mapScript: {
      readonly path: typeof CIV7_MAP_SCRIPT_MODULE_RESOLUTION_FILE;
      readonly rootIds: readonly string[];
      readonly moduleIds: readonly string[];
      readonly sha256: string;
    };
  };
}

export interface OfficialBaseDeclarationProjection {
  readonly catalog: ModuleCatalog;
  readonly declarations: DeclarationEmission;
  readonly realms: RealmProjection;
  readonly mapScriptResolution: MapScriptModuleResolution;
  readonly receipt: DeclarationProjectionReceipt;
  readonly receiptText: string;
}

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function requireRecord(value: unknown, label: string): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error(`${label} must be an object`);
  }
  return value as Record<string, unknown>;
}

function requireString(value: unknown, label: string): string {
  if (typeof value !== "string" || value.length === 0) throw new Error(`${label} must be a string`);
  return value;
}

function requireNonNegativeInteger(value: unknown, label: string): number {
  if (!Number.isSafeInteger(value) || (value as number) < 0) {
    throw new Error(`${label} must be a non-negative integer`);
  }
  return value as number;
}

async function readProjectionSourceSnapshot(
  snapshotRoot: string
): Promise<ProjectionSourceSnapshot> {
  const receiptPath = ".civ7-source-receipt.json" as const;
  let receiptText: string;
  let parsed: unknown;
  try {
    receiptText = await readFile(join(snapshotRoot, receiptPath), "utf8");
    parsed = JSON.parse(receiptText);
  } catch (error) {
    throw new Error(`Invalid source snapshot receipt at ${join(snapshotRoot, receiptPath)}`, {
      cause: error,
    });
  }
  const receipt = requireRecord(parsed, "Source snapshot receipt");
  const profile = requireRecord(receipt.profile, "Source snapshot profile");
  const snapshot = requireRecord(receipt.snapshot, "Source snapshot identity");
  const source = requireRecord(receipt.source, "Source identity");
  const application = requireRecord(source.application, "Application identity");
  const steam = requireRecord(source.steam, "Steam identity");
  return {
    receiptPath,
    sourceReceiptSha256: sha256(receiptText),
    profileId: requireString(profile.id, "Source profile id"),
    sha256: requireString(snapshot.sha256, "Source snapshot sha256"),
    fileCount: requireNonNegativeInteger(snapshot.fileCount, "Source snapshot fileCount"),
    totalBytes: requireNonNegativeInteger(snapshot.totalBytes, "Source snapshot totalBytes"),
    applicationVersion: requireString(application.longVersion, "Application longVersion"),
    steamBuildId: requireString(steam.buildId, "Steam buildId"),
  };
}

function sourceManifest(catalog: ModuleCatalog): string {
  return catalog.sourceMaps.embeddedTypeScriptSources
    .map(
      (source) =>
        `${source.sourcePath}\0${source.mapPath}\0${source.compiledPath}\0${sha256(source.sourceText)}\n`
    )
    .join("");
}

function shardManifest(declarations: DeclarationEmission): string {
  return declarations.shards
    .map(
      (shard) =>
        `${shard.outputFileName}\0${shard.virtualId}\0${shard.evidenceKind}\0${sha256(shard.text)}\n`
    )
    .join("");
}

function realmManifest(realms: RealmProjection): string {
  return `${JSON.stringify({
    roots: realms.rootEvidence,
    nonScriptMaps: realms.nonScriptMaps,
    shell: realms.shell.moduleIds,
    game: realms.game.moduleIds,
    map: realms.map.moduleIds,
  })}\n`;
}

function globalAugmentationManifest(declarations: DeclarationEmission): string {
  return declarations.shards
    .filter((shard) => shard.globalAugmentationCount > 0)
    .map(
      (shard) =>
        `${shard.outputFileName}\0${shard.globalAugmentationCount}\0${sha256(shard.text)}\n`
    )
    .join("");
}

function uniqueCompiledOnlyTargets(declarations: DeclarationEmission): readonly string[] {
  return [
    ...new Set(
      declarations.edges.flatMap((edge) =>
        edge.status === "compiled-only" && edge.targetVirtualId !== undefined
          ? [edge.targetVirtualId]
          : []
      )
    ),
  ].sort(compareUtf8);
}

/** Constructs the deterministic receipt without writing generated authority files. */
export async function buildDeclarationProjectionReceipt(
  snapshotRoot: string,
  catalog: ModuleCatalog,
  declarations: DeclarationEmission,
  realms: RealmProjection,
  mapScriptResolution: MapScriptModuleResolution
): Promise<DeclarationProjectionReceipt> {
  const embeddedSources = catalog.sourceMaps.embeddedTypeScriptSources;
  const compiledBarrelCount = catalog.declarationModules.filter(
    (module) => module.evidenceKind === "compiled-barrel"
  ).length;
  return {
    schemaVersion: DECLARATION_PROJECTION_SCHEMA_VERSION,
    sourceSnapshot: await readProjectionSourceSnapshot(snapshotRoot),
    compiler: declarations.compiler,
    sources: {
      sourceMapCount: catalog.sourceMaps.mapCount,
      embeddedTypeScriptCount: embeddedSources.length,
      tsCount: embeddedSources.filter((source) => source.sourceKind === "ts").length,
      tsxCount: embeddedSources.filter((source) => source.sourceKind === "tsx").length,
      ignoredEmbeddedSourceCount: catalog.sourceMaps.ignoredEmbeddedSourceCount,
      sha256: sha256(sourceManifest(catalog)),
    },
    modules: {
      shardCount: declarations.shards.length,
      embeddedTypeScriptCount: embeddedSources.length,
      compiledBarrelCount,
      compiledImportBarrelCount: catalog.declarationModules.filter(
        (module) => module.evidenceKind === "compiled-import-barrel"
      ).length,
      flatOutputFileNameMaxLength: declarations.shards.reduce(
        (maximum, shard) => Math.max(maximum, shard.outputFileName.length),
        0
      ),
      unresolvedTargets: declarations.unresolvedTargets,
      compiledOnlyEdgeTargets: uniqueCompiledOnlyTargets(declarations),
      sha256: sha256(shardManifest(declarations)),
    },
    emission: {
      diagnosticCount: declarations.diagnostics.length,
      diagnosticsSha256: sha256(`${JSON.stringify(declarations.diagnostics)}\n`),
      globalAugmentationCount: declarations.globalAugmentationCount,
      globalAugmentationsSha256: sha256(globalAugmentationManifest(declarations)),
      edgesSha256: sha256(`${JSON.stringify(declarations.edges)}\n`),
      runtimeStylesheetImports: declarations.runtimeStylesheetImports,
      anyKeywordCount: declarations.anyKeywordCount,
    },
    externalTypeEvidence: catalog.solidTypeEvidence,
    realms: {
      shell: { rootCount: realms.shell.roots.length, moduleCount: realms.shell.moduleIds.length },
      game: { rootCount: realms.game.roots.length, moduleCount: realms.game.moduleIds.length },
      map: { rootCount: realms.map.roots.length, moduleCount: realms.map.moduleIds.length },
      nonScriptMaps: realms.nonScriptMaps,
      sha256: sha256(realmManifest(realms)),
    },
    moduleResolution: {
      mapScript: {
        path: CIV7_MAP_SCRIPT_MODULE_RESOLUTION_FILE,
        rootIds: mapScriptResolution.rootIds,
        moduleIds: mapScriptResolution.modules.map((module) => module.virtualId),
        sha256: sha256(renderMapScriptModuleResolution(mapScriptResolution)),
      },
    },
  };
}

/** Refuses corpus drift instead of accepting a historical profile alongside the current one. */
export function assertOfficialProjectionProfile(
  catalog: ModuleCatalog,
  declarations: DeclarationEmission,
  realms: RealmProjection
): void {
  if (catalog.sourceMaps.mapCount !== EXPECTED_BASE_SOURCE_MAP_COUNT) {
    throw new Error(
      `Official Base declaration corpus changed: expected ${EXPECTED_BASE_SOURCE_MAP_COUNT} source maps; found ${catalog.sourceMaps.mapCount}`
    );
  }
  const sources = catalog.sourceMaps.embeddedTypeScriptSources;
  const tsCount = sources.filter((source) => source.sourceKind === "ts").length;
  const tsxCount = sources.filter((source) => source.sourceKind === "tsx").length;
  if (
    sources.length !== EXPECTED_EMBEDDED_TYPESCRIPT_SOURCE_COUNT ||
    tsCount !== EXPECTED_EMBEDDED_TS_SOURCE_COUNT ||
    tsxCount !== EXPECTED_EMBEDDED_TSX_SOURCE_COUNT
  ) {
    throw new Error(
      `Official Base declaration corpus changed: expected ${EXPECTED_EMBEDDED_TYPESCRIPT_SOURCE_COUNT} sources (${EXPECTED_EMBEDDED_TS_SOURCE_COUNT} TS, ${EXPECTED_EMBEDDED_TSX_SOURCE_COUNT} TSX); found ${sources.length} (${tsCount} TS, ${tsxCount} TSX)`
    );
  }
  const compiledBarrelCount = catalog.declarationModules.filter(
    (module) => module.evidenceKind === "compiled-barrel"
  ).length;
  if (compiledBarrelCount !== EXPECTED_COMPILED_BARREL_COUNT) {
    throw new Error(
      `Official Base declaration corpus changed: expected ${EXPECTED_COMPILED_BARREL_COUNT} compiled-only barrels; found ${compiledBarrelCount}`
    );
  }
  const compiledImportBarrelCount = catalog.declarationModules.filter(
    (module) => module.evidenceKind === "compiled-import-barrel"
  ).length;
  if (compiledImportBarrelCount !== EXPECTED_COMPILED_IMPORT_BARREL_COUNT) {
    throw new Error(
      `Official Base declaration corpus changed: expected ${EXPECTED_COMPILED_IMPORT_BARREL_COUNT} compiled import barrels; found ${compiledImportBarrelCount}`
    );
  }
  if (declarations.unresolvedTargets.length !== EXPECTED_UNRESOLVED_TARGET_COUNT) {
    throw new Error(
      `Official Base declaration corpus changed: expected ${EXPECTED_UNRESOLVED_TARGET_COUNT} absent declaration targets; found ${declarations.unresolvedTargets.length}`
    );
  }
  if (realms.map.roots.length !== EXPECTED_BASE_MAP_SCRIPT_ROOT_COUNT) {
    throw new Error(
      `Official Base map-root projection changed: expected ${EXPECTED_BASE_MAP_SCRIPT_ROOT_COUNT}; found ${realms.map.roots.length}`
    );
  }
}

/** Projects the pinned official Base declaration corpus entirely in memory. */
export async function projectOfficialBaseDeclarations(
  snapshotRoot: string
): Promise<OfficialBaseDeclarationProjection> {
  const sourceMaps = await collectBaseSourceMapEvidence(snapshotRoot);
  const catalog = await buildBaseModuleCatalog(snapshotRoot, sourceMaps);
  const declarations = emitBaseDeclarationProjection(catalog);
  const realms = await projectDeclarationRealms(snapshotRoot, catalog, declarations.edges);
  const mapScriptResolution = projectMapScriptModuleResolution(declarations);
  assertOfficialProjectionProfile(catalog, declarations, realms);
  const receipt = await buildDeclarationProjectionReceipt(
    snapshotRoot,
    catalog,
    declarations,
    realms,
    mapScriptResolution
  );
  return {
    catalog,
    declarations,
    realms,
    mapScriptResolution,
    receipt,
    receiptText: `${JSON.stringify(receipt, null, 2)}\n`,
  };
}

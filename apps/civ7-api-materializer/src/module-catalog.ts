import { readFile } from "node:fs/promises";
import { join, posix } from "node:path";
import ts from "typescript";
import {
  type BaseSourceMapEvidence,
  collectBaseSourceMapEvidence,
  compareUtf8,
  type EmbeddedTypeScriptSource,
  listBaseFiles,
} from "./source-maps.js";

const SOLID_TYPE_EVIDENCE_VERSION = "1.9.5" as const;

const SOLID_SOURCE_MAP_PATHS = [
  "Base/modules/core/vendor/solid-js/dist/solid.js.map",
  "Base/modules/core/vendor/solid-js/store/dist/store.js.map",
  "Base/modules/core/vendor/solid-js/web/dist/web.js.map",
] as const;

interface EmbeddedDeclarationModule {
  readonly evidenceKind: "embedded-typescript";
  readonly virtualId: string;
  readonly compiledPath: string;
  readonly source: EmbeddedTypeScriptSource;
}

interface CompiledBarrelReexport {
  readonly statementText: string;
  readonly specifier: string;
}

export interface CompiledBarrelModule {
  readonly evidenceKind: "compiled-barrel";
  readonly virtualId: string;
  readonly compiledPath: string;
  readonly mapPath: string;
  readonly reexports: readonly CompiledBarrelReexport[];
}

export type DeclarationModule = EmbeddedDeclarationModule | CompiledBarrelModule;

interface SolidTypeEvidence {
  readonly packageName: "solid-js";
  readonly version: typeof SOLID_TYPE_EVIDENCE_VERSION;
  readonly sourceMapPaths: typeof SOLID_SOURCE_MAP_PATHS;
  readonly embeddedSourcePaths: readonly string[];
}

export interface ModuleCatalog {
  readonly sourceMaps: BaseSourceMapEvidence;
  readonly declarationModules: readonly DeclarationModule[];
  readonly declarationModuleIds: readonly string[];
  readonly compiledModuleIds: readonly string[];
  readonly solidTypeEvidence: SolidTypeEvidence;
}

export type RetainedModuleResolution =
  | {
      readonly status: "declaration" | "compiled-only" | "unresolved";
      readonly originalSpecifier: string;
      readonly rewrittenSpecifier: string;
      readonly targetVirtualId: string;
    }
  | {
      readonly status: "external";
      readonly originalSpecifier: string;
      readonly rewrittenSpecifier: string;
    }
  | {
      readonly status: "unretained";
      readonly originalSpecifier: string;
      readonly rewrittenSpecifier: string;
    };

function parseDiagnostics(sourceFile: ts.SourceFile): readonly ts.DiagnosticWithLocation[] {
  return (
    (
      sourceFile as ts.SourceFile & {
        readonly parseDiagnostics?: readonly ts.DiagnosticWithLocation[];
      }
    ).parseDiagnostics ?? []
  );
}

function assertCanonicalCompiledPath(compiledPath: string): void {
  if (
    compiledPath.includes("\\") ||
    compiledPath.includes("\0") ||
    compiledPath !== posix.normalize(compiledPath)
  ) {
    throw new Error(`Compiled module path is not canonical POSIX evidence: ${compiledPath}`);
  }
}

/** Maps an official compiled module path to its exact Civ7 virtual module id. */
export function virtualIdForCompiledPath(compiledPath: string): string {
  assertCanonicalCompiledPath(compiledPath);
  const prefix = "Base/modules/";
  if (!compiledPath.startsWith(prefix) || !compiledPath.endsWith(".js")) {
    throw new Error(`Compiled declaration module must be Base JavaScript: ${compiledPath}`);
  }
  const modulePath = compiledPath.slice(prefix.length);
  if (modulePath.length === 0 || modulePath.startsWith("/") || modulePath.includes("/../")) {
    throw new Error(`Compiled declaration module has no canonical virtual id: ${compiledPath}`);
  }
  return `/${modulePath}`;
}

function hasSorted(values: readonly string[], value: string): boolean {
  let low = 0;
  let high = values.length - 1;
  while (low <= high) {
    const middle = (low + high) >>> 1;
    const comparison = compareUtf8(values[middle] ?? "", value);
    if (comparison === 0) return true;
    if (comparison < 0) low = middle + 1;
    else high = middle - 1;
  }
  return false;
}

function canonicalInternalTarget(fromVirtualId: string, specifier: string): string | undefined {
  let target: string;
  if (specifier.startsWith("#core/")) {
    target = `/core/${specifier.slice("#core/".length)}`;
  } else if (specifier.startsWith("#base/")) {
    target = `/base-standard/${specifier.slice("#base/".length)}`;
  } else if (specifier.startsWith("./") || specifier.startsWith("../")) {
    target = posix.normalize(posix.join(posix.dirname(fromVirtualId), specifier));
  } else {
    return undefined;
  }

  if (!target.startsWith("/") || target === "/" || target.includes("\\") || target.includes("\0")) {
    throw new Error(
      `Retained module specifier escapes the Civ7 virtual module root: ${fromVirtualId} -> ${specifier}`
    );
  }
  const compiledTarget = target.endsWith(".jsx")
    ? `${target.slice(0, -".jsx".length)}.js`
    : posix.extname(target) === ""
      ? `${target}.js`
      : target;
  if (!compiledTarget.endsWith(".js")) {
    throw new Error(
      `Retained declaration module specifier does not identify JavaScript: ${fromVirtualId} -> ${specifier}`
    );
  }
  return compiledTarget;
}

/** Resolves only declaration-retained Civ7 aliases/relatives and pinned externals. */
export function resolveRetainedModuleSpecifier(
  catalog: Pick<ModuleCatalog, "compiledModuleIds" | "declarationModuleIds">,
  fromVirtualId: string,
  specifier: string
): RetainedModuleResolution {
  if (specifier === "solid-js" || specifier.startsWith("solid-js/")) {
    return {
      status: "external",
      originalSpecifier: specifier,
      rewrittenSpecifier: specifier,
    };
  }

  const targetVirtualId = canonicalInternalTarget(fromVirtualId, specifier);
  if (targetVirtualId === undefined) {
    return {
      status: "unretained",
      originalSpecifier: specifier,
      rewrittenSpecifier: specifier,
    };
  }
  if (hasSorted(catalog.declarationModuleIds, targetVirtualId)) {
    return {
      status: "declaration",
      originalSpecifier: specifier,
      rewrittenSpecifier: targetVirtualId,
      targetVirtualId,
    };
  }
  if (hasSorted(catalog.compiledModuleIds, targetVirtualId)) {
    return {
      status: "compiled-only",
      originalSpecifier: specifier,
      rewrittenSpecifier: targetVirtualId,
      targetVirtualId,
    };
  }
  return {
    status: "unresolved",
    originalSpecifier: specifier,
    rewrittenSpecifier: targetVirtualId,
    targetVirtualId,
  };
}

async function extractCompiledBarrels(
  snapshotRoot: string,
  sourceMaps: BaseSourceMapEvidence
): Promise<readonly CompiledBarrelModule[]> {
  const barrels: CompiledBarrelModule[] = [];
  for (const mapPath of sourceMaps.emptyCompiledMapPaths) {
    const compiledPath = mapPath.slice(0, -".map".length);
    const javascript = await readFile(join(snapshotRoot, compiledPath), "utf8").catch(() => null);
    // Asset-loader maps can be retained without a paired synthetic .js file.
    if (javascript === null) continue;
    const sourceFile = ts.createSourceFile(
      compiledPath,
      javascript,
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.JS
    );
    const diagnostics = parseDiagnostics(sourceFile);
    if (diagnostics.length > 0) {
      const first = diagnostics[0];
      throw new Error(
        `Cannot parse compiled-only barrel evidence at ${compiledPath}: TS${first.code} ${ts.flattenDiagnosticMessageText(first.messageText, "\n")}`
      );
    }

    const reexports = sourceFile.statements.flatMap((statement) => {
      if (
        !ts.isExportDeclaration(statement) ||
        statement.moduleSpecifier === undefined ||
        !ts.isStringLiteralLike(statement.moduleSpecifier)
      ) {
        return [];
      }
      return [
        {
          statementText: statement.getText(sourceFile),
          specifier: statement.moduleSpecifier.text,
        } satisfies CompiledBarrelReexport,
      ];
    });
    if (reexports.length === 0) continue;
    barrels.push({
      evidenceKind: "compiled-barrel",
      virtualId: virtualIdForCompiledPath(compiledPath),
      compiledPath,
      mapPath,
      reexports,
    });
  }
  barrels.sort((left, right) => compareUtf8(left.virtualId, right.virtualId));
  return barrels;
}

async function extractSolidTypeEvidence(snapshotRoot: string): Promise<SolidTypeEvidence> {
  const embeddedSourcePaths: string[] = [];
  const versions = new Set<string>();
  for (const mapPath of SOLID_SOURCE_MAP_PATHS) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(await readFile(join(snapshotRoot, mapPath), "utf8"));
    } catch (error) {
      throw new Error(`Invalid embedded Solid source-map evidence at ${mapPath}`, { cause: error });
    }
    if (typeof parsed !== "object" || parsed === null) {
      throw new Error(`Embedded Solid source map must contain an object at ${mapPath}`);
    }
    const record = parsed as Record<string, unknown>;
    if (
      record.version !== 3 ||
      !Array.isArray(record.sources) ||
      record.sources.length !== 1 ||
      typeof record.sources[0] !== "string" ||
      !Array.isArray(record.sourcesContent) ||
      record.sourcesContent.length !== 1 ||
      typeof record.sourcesContent[0] !== "string"
    ) {
      throw new Error(`Embedded Solid source map is incomplete at ${mapPath}`);
    }
    const embeddedSourcePath = record.sources[0];
    const versionMatch = embeddedSourcePath.match(
      /(?:^|\/)\.pnpm\/solid-js@([^/]+)\/node_modules\/solid-js\//
    );
    if (versionMatch?.[1] === undefined) {
      throw new Error(`Embedded Solid source path has no pnpm version evidence at ${mapPath}`);
    }
    versions.add(versionMatch[1]);
    embeddedSourcePaths.push(embeddedSourcePath);
  }
  if (versions.size !== 1 || !versions.has(SOLID_TYPE_EVIDENCE_VERSION)) {
    throw new Error(
      `Embedded Solid type evidence must be pinned to ${SOLID_TYPE_EVIDENCE_VERSION}; found ${[
        ...versions,
      ]
        .sort(compareUtf8)
        .join(", ")}`
    );
  }
  return {
    packageName: "solid-js",
    version: SOLID_TYPE_EVIDENCE_VERSION,
    sourceMapPaths: SOLID_SOURCE_MAP_PATHS,
    embeddedSourcePaths,
  };
}

/** Builds the deterministic Base module catalog without inferring declarations from JavaScript. */
export async function buildBaseModuleCatalog(
  snapshotRoot: string,
  providedSourceMaps?: BaseSourceMapEvidence
): Promise<ModuleCatalog> {
  const sourceMaps = providedSourceMaps ?? (await collectBaseSourceMapEvidence(snapshotRoot));
  const compiledModuleIds = (await listBaseFiles(snapshotRoot))
    .filter((path) => path.startsWith("Base/modules/") && path.endsWith(".js"))
    .map(virtualIdForCompiledPath)
    .sort(compareUtf8);
  for (let index = 1; index < compiledModuleIds.length; index += 1) {
    if (compiledModuleIds[index - 1] === compiledModuleIds[index]) {
      throw new Error(`Compiled virtual module id collision: ${compiledModuleIds[index]}`);
    }
  }

  const embeddedModules: EmbeddedDeclarationModule[] = sourceMaps.embeddedTypeScriptSources.map(
    (source) => ({
      evidenceKind: "embedded-typescript",
      virtualId: virtualIdForCompiledPath(source.compiledPath),
      compiledPath: source.compiledPath,
      source,
    })
  );
  const declarationModules: DeclarationModule[] = [
    ...embeddedModules,
    ...(await extractCompiledBarrels(snapshotRoot, sourceMaps)),
  ];
  declarationModules.sort((left, right) => compareUtf8(left.virtualId, right.virtualId));
  for (let index = 1; index < declarationModules.length; index += 1) {
    const previous = declarationModules[index - 1];
    const current = declarationModules[index];
    if (previous?.virtualId === current?.virtualId) {
      throw new Error(
        `Declaration virtual module id collision at ${current.virtualId}: ${previous.compiledPath} and ${current.compiledPath}`
      );
    }
  }

  return {
    sourceMaps,
    declarationModules,
    declarationModuleIds: declarationModules.map((module) => module.virtualId),
    compiledModuleIds,
    solidTypeEvidence: await extractSolidTypeEvidence(snapshotRoot),
  };
}

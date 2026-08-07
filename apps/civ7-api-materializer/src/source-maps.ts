import { Buffer } from "node:buffer";
import { readdir, readFile, stat } from "node:fs/promises";
import { join, posix, relative, sep } from "node:path";

const SOURCE_MAP_VERSION = 3;
const JAVASCRIPT_SOURCE_MAP_SUFFIX = ".js.map";

type EmbeddedSourceKind = "ts" | "tsx";

export interface EmbeddedTypeScriptSource {
  readonly mapPath: string;
  readonly compiledPath: string;
  readonly sourcePath: string;
  readonly sourceKind: EmbeddedSourceKind;
  readonly sourceText: string;
}

export interface BaseSourceMapEvidence {
  readonly mapCount: number;
  readonly embeddedTypeScriptSources: readonly EmbeddedTypeScriptSource[];
  readonly emptyCompiledMapPaths: readonly string[];
  readonly ignoredEmbeddedSourceCount: number;
}

interface ParsedSourceMap {
  readonly version: number;
  readonly sourceRoot?: string | null;
  readonly sources: readonly string[];
  readonly sourcesContent: readonly (string | null)[];
}

/** Orders paths by their UTF-8 bytes, independent of the host locale. */
export function compareUtf8(left: string, right: string): number {
  return Buffer.compare(Buffer.from(left, "utf8"), Buffer.from(right, "utf8"));
}

function posixPath(value: string): string {
  return value.split(sep).join("/");
}

/** Lists regular files below the admitted Base root in deterministic order. */
export async function listBaseFiles(snapshotRoot: string): Promise<readonly string[]> {
  const absoluteBaseRoot = join(snapshotRoot, "Base");
  const baseStats = await stat(absoluteBaseRoot).catch(() => null);
  if (!baseStats?.isDirectory()) {
    throw new Error(`Missing official Base snapshot root: ${absoluteBaseRoot}`);
  }

  const files: string[] = [];
  const visit = async (directory: string): Promise<void> => {
    const entries = await readdir(directory, { withFileTypes: true });
    entries.sort((left, right) => compareUtf8(left.name, right.name));
    for (const entry of entries) {
      const absolutePath = join(directory, entry.name);
      if (entry.isDirectory()) {
        await visit(absolutePath);
      } else if (entry.isFile()) {
        files.push(posixPath(relative(snapshotRoot, absolutePath)));
      } else {
        throw new Error(`Unsupported filesystem entry in official Base snapshot: ${absolutePath}`);
      }
    }
  };

  await visit(absoluteBaseRoot);
  files.sort(compareUtf8);
  return files;
}

function parseSourceMap(mapPath: string, text: string): ParsedSourceMap {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch (error) {
    throw new Error(`Invalid source map JSON at ${mapPath}`, { cause: error });
  }
  if (typeof parsed !== "object" || parsed === null) {
    throw new Error(`Source map must contain an object at ${mapPath}`);
  }

  const record = parsed as Record<string, unknown>;
  if (record.version !== SOURCE_MAP_VERSION) {
    throw new Error(`Source map must use version 3 at ${mapPath}`);
  }
  if (
    !Array.isArray(record.sources) ||
    !record.sources.every((value) => typeof value === "string")
  ) {
    throw new Error(`Source map must contain only string sources at ${mapPath}`);
  }
  if (
    !Array.isArray(record.sourcesContent) ||
    !record.sourcesContent.every((value) => value === null || typeof value === "string")
  ) {
    throw new Error(`Source map must contain string or null sourcesContent at ${mapPath}`);
  }
  if (record.sources.length !== record.sourcesContent.length) {
    throw new Error(`Source map sourcesContent must align with sources at ${mapPath}`);
  }
  if (
    record.sourceRoot !== undefined &&
    record.sourceRoot !== null &&
    typeof record.sourceRoot !== "string"
  ) {
    throw new Error(`Source map sourceRoot must be a string or null at ${mapPath}`);
  }

  return record as unknown as ParsedSourceMap;
}

function sourcePathWithoutQuery(sourcePath: string): string {
  const suffixStart = sourcePath.search(/[?#]/);
  return suffixStart === -1 ? sourcePath : sourcePath.slice(0, suffixStart);
}

function embeddedSourceKind(sourcePath: string): EmbeddedSourceKind | undefined {
  const path = sourcePathWithoutQuery(sourcePath);
  if (path.endsWith(".tsx")) return "tsx";
  if (path.endsWith(".ts")) return "ts";
  return undefined;
}

function assertRelativeSourceMapPath(value: string, label: string, mapPath: string): void {
  if (
    value.includes("\\") ||
    value.includes("\0") ||
    posix.isAbsolute(value) ||
    /^[a-zA-Z][a-zA-Z\d+.-]*:/.test(value)
  ) {
    throw new Error(`${label} must be a relative POSIX path at ${mapPath}: ${value}`);
  }
}

/** Resolves source-map provenance to one canonical Base-relative source path. */
function resolveEmbeddedSourcePath(
  mapPath: string,
  sourceRoot: string | null | undefined,
  sourcePath: string
): string {
  const path = sourcePathWithoutQuery(sourcePath);
  assertRelativeSourceMapPath(path, "Source map source", mapPath);
  if (sourceRoot !== undefined && sourceRoot !== null && sourceRoot !== "") {
    assertRelativeSourceMapPath(sourceRoot, "Source map sourceRoot", mapPath);
  }

  const resolved = posix.normalize(posix.join(posix.dirname(mapPath), sourceRoot ?? "", path));
  if (resolved !== "Base" && !resolved.startsWith("Base/")) {
    throw new Error(`Embedded source escapes the official Base root at ${mapPath}: ${sourcePath}`);
  }
  return resolved;
}

/** Reads and validates all Base source-map evidence used by declaration projection. */
export async function collectBaseSourceMapEvidence(
  snapshotRoot: string
): Promise<BaseSourceMapEvidence> {
  const sources: EmbeddedTypeScriptSource[] = [];
  const emptyCompiledMapPaths: string[] = [];
  const sourceOwners = new Map<string, string>();
  const compiledOwners = new Map<string, string>();
  let mapCount = 0;
  let ignoredEmbeddedSourceCount = 0;

  for (const mapPath of await listBaseFiles(snapshotRoot)) {
    if (!mapPath.endsWith(JAVASCRIPT_SOURCE_MAP_SUFFIX)) continue;
    mapCount += 1;
    const map = parseSourceMap(mapPath, await readFile(join(snapshotRoot, mapPath), "utf8"));
    if (map.sources.length === 0) {
      emptyCompiledMapPaths.push(mapPath);
      continue;
    }

    const typeScriptIndexes = map.sources.flatMap((sourcePath, index) =>
      embeddedSourceKind(sourcePath) === undefined ? [] : [index]
    );
    if (typeScriptIndexes.length === 0) {
      ignoredEmbeddedSourceCount += map.sourcesContent.filter(
        (sourceContent) => typeof sourceContent === "string"
      ).length;
      continue;
    }
    if (map.sources.length !== 1 || typeScriptIndexes.length !== 1) {
      throw new Error(
        `Declaration source map must contain exactly one embedded TS/TSX source at ${mapPath}`
      );
    }

    const sourcePath = map.sources[0];
    const sourceText = map.sourcesContent[0];
    const sourceKind = embeddedSourceKind(sourcePath);
    if (sourceKind === undefined || typeof sourceText !== "string") {
      throw new Error(`Declaration source map must embed its single TS/TSX source at ${mapPath}`);
    }

    const canonicalSourcePath = resolveEmbeddedSourcePath(mapPath, map.sourceRoot, sourcePath);
    const sourceOwner = sourceOwners.get(canonicalSourcePath);
    if (sourceOwner !== undefined) {
      throw new Error(
        `Embedded source path collision at ${canonicalSourcePath}: ${sourceOwner} and ${mapPath}`
      );
    }
    sourceOwners.set(canonicalSourcePath, mapPath);

    const compiledPath = mapPath.slice(0, -".map".length);
    const compiledOwner = compiledOwners.get(compiledPath);
    if (compiledOwner !== undefined) {
      throw new Error(
        `Compiled source-map path collision at ${compiledPath}: ${compiledOwner} and ${mapPath}`
      );
    }
    compiledOwners.set(compiledPath, mapPath);
    sources.push({
      mapPath,
      compiledPath,
      sourcePath: canonicalSourcePath,
      sourceKind,
      sourceText,
    });
  }

  sources.sort((left, right) => compareUtf8(left.sourcePath, right.sourcePath));
  emptyCompiledMapPaths.sort(compareUtf8);
  return {
    mapCount,
    embeddedTypeScriptSources: sources,
    emptyCompiledMapPaths,
    ignoredEmbeddedSourceCount,
  };
}

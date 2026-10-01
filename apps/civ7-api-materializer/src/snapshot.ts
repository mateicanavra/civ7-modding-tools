import { Buffer } from "node:buffer";
import { createHash } from "node:crypto";
import { mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises";
import { basename, dirname, extname, join, relative, sep } from "node:path";
import {
  EXCLUDED_BASENAMES,
  EXCLUDED_EXTENSIONS,
  EXCLUDED_SEGMENT_PATHS,
  type SnapshotFile,
  SOURCE_PROFILE_ID,
  SOURCE_RECEIPT_FILE,
  SOURCE_RECEIPT_SCHEMA_VERSION,
  SOURCE_ROOTS,
  type SourceIdentity,
  type SourceMapEvidence,
  type SourceReceipt,
} from "./model.js";

const SOURCE_MAP_SUFFIX = ".js.map";
const SOURCE_MAP_VERSION = 3;
const PROFILE_PAYLOAD = {
  id: SOURCE_PROFILE_ID,
  roots: SOURCE_ROOTS,
  excludedSegmentPaths: EXCLUDED_SEGMENT_PATHS,
  excludedBasenames: EXCLUDED_BASENAMES,
  excludedExtensions: EXCLUDED_EXTENSIONS,
  excludedBasenamePrefixes: ["ShaderAutoGen_"] as const,
};

function sha256(value: string | Uint8Array): string {
  return createHash("sha256").update(value).digest("hex");
}

function posixPath(value: string): string {
  return value.split(sep).join("/");
}

function compareUtf8(left: string, right: string): number {
  return Buffer.compare(Buffer.from(left, "utf8"), Buffer.from(right, "utf8"));
}

/** Returns whether one Resources-relative path belongs to the official API evidence profile. */
export function isAdmittedSourcePath(relativePath: string): boolean {
  const normalized = relativePath.replaceAll("\\", "/").replace(/^\.\//, "");
  const [root] = normalized.split("/");
  if (!SOURCE_ROOTS.includes(root as (typeof SOURCE_ROOTS)[number])) return false;

  const name = basename(normalized);
  if (EXCLUDED_BASENAMES.includes(name as (typeof EXCLUDED_BASENAMES)[number])) return false;
  if (name.startsWith("ShaderAutoGen_")) return false;

  const pathWithinRoot = normalized.slice(root.length + 1);
  if (
    EXCLUDED_SEGMENT_PATHS.some(
      (segmentPath) =>
        pathWithinRoot === segmentPath ||
        pathWithinRoot.startsWith(`${segmentPath}/`) ||
        pathWithinRoot.includes(`/${segmentPath}/`)
    )
  ) {
    return false;
  }

  const extension = extname(name).toLowerCase();
  return !EXCLUDED_EXTENSIONS.includes(extension as (typeof EXCLUDED_EXTENSIONS)[number]);
}

async function walkFiles(root: string): Promise<readonly string[]> {
  const files: string[] = [];
  const visit = async (directory: string): Promise<void> => {
    const entries = await readdir(directory, { withFileTypes: true });
    entries.sort((left, right) => compareUtf8(left.name, right.name));
    for (const entry of entries) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) {
        await visit(path);
      } else if (entry.isFile()) {
        files.push(path);
      } else {
        throw new Error(`Unsupported filesystem entry in Civ7 source corpus: ${path}`);
      }
    }
  };
  await visit(root);
  return files;
}

function snapshotDigest(files: readonly SnapshotFile[], schemaVersion: number): string {
  const orderedFiles = [...files].sort((left, right) =>
    schemaVersion === 1
      ? left.path.localeCompare(right.path, "en-US")
      : compareUtf8(left.path, right.path)
  );
  const manifest = orderedFiles
    .map((file) => `${file.path}\0${file.size}\0${file.sha256}\n`)
    .join("");
  return sha256(manifest);
}

function emptySourceMapEvidence(): SourceMapEvidence {
  return {
    fileCount: 0,
    sourceCount: 0,
    embeddedSourceCount: 0,
    missingSourceContentCount: 0,
  };
}

function addSourceMapEvidence(
  evidence: SourceMapEvidence,
  path: string,
  content: string
): SourceMapEvidence {
  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch (error) {
    throw new Error(`Invalid source map JSON at ${path}`, { cause: error });
  }
  if (typeof parsed !== "object" || parsed === null) {
    throw new Error(`Source map must contain an object at ${path}`);
  }
  const record = parsed as { version?: unknown; sources?: unknown; sourcesContent?: unknown };
  if (record.version !== SOURCE_MAP_VERSION) {
    throw new Error(`Source map must use version 3 at ${path}`);
  }
  if (!Array.isArray(record.sources)) {
    throw new Error(`Source map is missing a sources array at ${path}`);
  }
  if (!record.sources.every((source) => typeof source === "string")) {
    throw new Error(`Source map contains a non-string source at ${path}`);
  }
  if (!Array.isArray(record.sourcesContent)) {
    throw new Error(`Source map sourcesContent must be an array at ${path}`);
  }
  if (record.sourcesContent.length !== record.sources.length) {
    throw new Error(`Source map sourcesContent must align with sources at ${path}`);
  }
  if (
    !record.sourcesContent.every((sourceContent) =>
      sourceContent === null ? true : typeof sourceContent === "string"
    )
  ) {
    throw new Error(`Source map contains invalid embedded source content at ${path}`);
  }

  const embeddedSourceCount = record.sourcesContent.filter(
    (sourceContent) => typeof sourceContent === "string"
  ).length;
  return {
    fileCount: evidence.fileCount + 1,
    sourceCount: evidence.sourceCount + record.sources.length,
    embeddedSourceCount: evidence.embeddedSourceCount + embeddedSourceCount,
    missingSourceContentCount:
      evidence.missingSourceContentCount + record.sources.length - embeddedSourceCount,
  };
}

export interface BuildSnapshotResult {
  readonly files: readonly SnapshotFile[];
  readonly receipt: SourceReceipt;
  readonly receiptText: string;
}

/** Stages an exact admitted source snapshot and its deterministic provenance receipt. */
async function collectSnapshot(
  sourceRoot: string,
  outputRoot: string | undefined,
  sourceIdentity: SourceIdentity
): Promise<BuildSnapshotResult> {
  const files: SnapshotFile[] = [];
  let sourceMaps = emptySourceMapEvidence();

  for (const sourceRootName of SOURCE_ROOTS) {
    const absoluteRoot = join(sourceRoot, sourceRootName);
    const rootStats = await stat(absoluteRoot).catch(() => null);
    if (!rootStats?.isDirectory()) {
      throw new Error(`Missing installed Civ7 source root: ${absoluteRoot}`);
    }
    for (const sourcePath of await walkFiles(absoluteRoot)) {
      const sourceRelativePath = posixPath(relative(sourceRoot, sourcePath));
      if (!isAdmittedSourcePath(sourceRelativePath)) continue;

      const bytes = await readFile(sourcePath);
      if (outputRoot !== undefined) {
        const destinationPath = join(outputRoot, sourceRelativePath);
        await mkdir(dirname(destinationPath), { recursive: true });
        await writeFile(destinationPath, bytes);
      }
      files.push({
        path: sourceRelativePath,
        size: bytes.byteLength,
        sha256: sha256(bytes),
      });
      if (sourceRelativePath.endsWith(SOURCE_MAP_SUFFIX)) {
        sourceMaps = addSourceMapEvidence(sourceMaps, sourceRelativePath, bytes.toString("utf8"));
      }
    }
  }

  files.sort((left, right) => compareUtf8(left.path, right.path));
  const receipt: SourceReceipt = {
    schemaVersion: SOURCE_RECEIPT_SCHEMA_VERSION,
    source: sourceIdentity,
    profile: {
      ...PROFILE_PAYLOAD,
      sha256: sha256(`${JSON.stringify(PROFILE_PAYLOAD)}\n`),
    },
    snapshot: {
      fileCount: files.length,
      totalBytes: files.reduce((total, file) => total + file.size, 0),
      sha256: snapshotDigest(files, SOURCE_RECEIPT_SCHEMA_VERSION),
    },
    sourceMaps,
  };
  const receiptText = `${JSON.stringify(receipt, null, 2)}\n`;
  if (outputRoot !== undefined) {
    await writeFile(join(outputRoot, SOURCE_RECEIPT_FILE), receiptText);
  }
  return { files, receipt, receiptText };
}

/** Stages an exact admitted source snapshot and its deterministic provenance receipt. */
export async function buildSnapshot(
  sourceRoot: string,
  outputRoot: string,
  sourceIdentity: SourceIdentity
): Promise<BuildSnapshotResult> {
  return collectSnapshot(sourceRoot, outputRoot, sourceIdentity);
}

/** Re-reads the admitted source bytes without materializing another tree. */
export async function fingerprintSourceSnapshot(
  sourceRoot: string,
  sourceIdentity: SourceIdentity
): Promise<BuildSnapshotResult> {
  return collectSnapshot(sourceRoot, undefined, sourceIdentity);
}

/** Recomputes the exact admitted snapshot digest already stored at a destination. */
export async function inspectSnapshot(root: string): Promise<BuildSnapshotResult> {
  const receiptText = await readFile(join(root, SOURCE_RECEIPT_FILE), "utf8");
  const receipt = JSON.parse(receiptText) as SourceReceipt;
  const files: SnapshotFile[] = [];
  for (const path of await walkFiles(root)) {
    const relativePath = posixPath(relative(root, path));
    if (relativePath === ".git" || relativePath === SOURCE_RECEIPT_FILE) continue;
    const bytes = await readFile(path);
    files.push({ path: relativePath, size: bytes.byteLength, sha256: sha256(bytes) });
  }
  files.sort((left, right) => compareUtf8(left.path, right.path));
  return { files, receipt, receiptText };
}

/** Proves that stored receipt claims match the exact bytes in its snapshot. */
export function assertSnapshotReceipt(result: BuildSnapshotResult): void {
  const schemaVersion = result.receipt.schemaVersion as number;
  if (schemaVersion !== 1 && schemaVersion !== SOURCE_RECEIPT_SCHEMA_VERSION) {
    throw new Error(`Unsupported Civ7 source receipt schema version: ${schemaVersion}`);
  }
  const actualDigest = snapshotDigest(result.files, schemaVersion);
  const actualBytes = result.files.reduce((total, file) => total + file.size, 0);
  if (
    result.receipt.snapshot.sha256 !== actualDigest ||
    result.receipt.snapshot.fileCount !== result.files.length ||
    result.receipt.snapshot.totalBytes !== actualBytes
  ) {
    throw new Error("Civ7 source receipt does not match the materialized snapshot bytes");
  }
}

import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { FileSystem } from "@effect/platform";
import type { PlatformError } from "@effect/platform/Error";
import {
  FileReadFailed,
  FileWriteFailed,
} from "@internal/habitat-harness/resources/errors/index";
import { Effect } from "effect";

export interface HabitatDirectoryEntry {
  readonly name: string;
  readonly kind: "directory" | "file" | "other";
}

export function isDirectory(
  targetPath: string
): Effect.Effect<boolean, FileReadFailed, FileSystem.FileSystem> {
  return FileSystem.FileSystem.pipe(
    Effect.flatMap((fs) => fs.stat(targetPath)),
    Effect.map((info) => info.type === "Directory"),
    Effect.catchAll((cause) =>
      isMissingPath(cause) ? Effect.succeed(false) : readFailed<boolean>(targetPath, cause)
    )
  );
}

export function isFile(
  targetPath: string
): Effect.Effect<boolean, FileReadFailed, FileSystem.FileSystem> {
  return FileSystem.FileSystem.pipe(
    Effect.flatMap((fs) => fs.stat(targetPath)),
    Effect.map((info) => info.type === "File"),
    Effect.catchAll((cause) =>
      isMissingPath(cause) ? Effect.succeed(false) : readFailed<boolean>(targetPath, cause)
    )
  );
}

export function makeDirectory(targetPath: string) {
  return FileSystem.FileSystem.pipe(
    Effect.flatMap((fs) => fs.makeDirectory(targetPath, { recursive: true })),
    Effect.mapError((cause) => writeFailure(targetPath, cause))
  );
}

export function readDirectory(targetPath: string) {
  return FileSystem.FileSystem.pipe(
    Effect.flatMap((fs) =>
      fs.readDirectory(targetPath).pipe(
        Effect.flatMap((entries) =>
          Effect.forEach(entries, (name): Effect.Effect<HabitatDirectoryEntry, FileReadFailed> => {
            const entryPath = path.join(targetPath, name);
            return fs.stat(entryPath).pipe(
              Effect.map((info) => ({
                name,
                kind: entryKind(info.type),
              })),
              Effect.mapError((cause) => readFailure(entryPath, cause))
            );
          })
        )
      )
    ),
    Effect.mapError((cause) =>
      cause instanceof FileReadFailed ? cause : readFailure(targetPath, cause)
    )
  );
}

export function readText(targetPath: string) {
  return FileSystem.FileSystem.pipe(
    Effect.flatMap((fs) => fs.readFileString(targetPath)),
    Effect.mapError((cause) => readFailure(targetPath, cause))
  );
}

export function writeText(targetPath: string, contents: string) {
  return FileSystem.FileSystem.pipe(
    Effect.flatMap((fs) => fs.writeFileString(targetPath, contents)),
    Effect.mapError((cause) => writeFailure(targetPath, cause))
  );
}

export function isDirectorySync(targetPath: string): boolean {
  return statKindSync(targetPath) === "Directory";
}

export function isFileSync(targetPath: string): boolean {
  return statKindSync(targetPath) === "File";
}

export function readDirectorySync(targetPath: string): readonly HabitatDirectoryEntry[] {
  return readdirSync(targetPath, { withFileTypes: true }).map((entry) => ({
    name: entry.name,
    kind: entry.isDirectory() ? "directory" : entry.isFile() ? "file" : "other",
  }));
}

export function readTextSync(targetPath: string): string {
  return readFileSync(targetPath, "utf8");
}

export function statKindSync(targetPath: string): FileSystem.File.Type | undefined {
  try {
    const stat = statSync(targetPath);
    if (stat.isDirectory()) return "Directory";
    if (stat.isFile()) return "File";
    if (stat.isSymbolicLink()) return "SymbolicLink";
    if (stat.isBlockDevice()) return "BlockDevice";
    if (stat.isCharacterDevice()) return "CharacterDevice";
    if (stat.isFIFO()) return "FIFO";
    if (stat.isSocket()) return "Socket";
    return "Unknown";
  } catch {
    return undefined;
  }
}

function entryKind(type: FileSystem.File.Type): HabitatDirectoryEntry["kind"] {
  if (type === "Directory") return "directory";
  if (type === "File") return "file";
  return "other";
}

function readFailed<A>(targetPath: string, cause: PlatformError): Effect.Effect<A, FileReadFailed> {
  return Effect.fail(readFailure(targetPath, cause));
}

function readFailure(targetPath: string, cause: unknown) {
  return new FileReadFailed({
    path: targetPath,
    cause: renderPlatformCause(cause),
  });
}

function writeFailure(targetPath: string, cause: unknown) {
  return new FileWriteFailed({
    path: targetPath,
    cause: renderPlatformCause(cause),
  });
}

function renderPlatformCause(cause: unknown): string {
  return cause instanceof Error ? cause.message : String(cause);
}

function isMissingPath(cause: PlatformError): boolean {
  return cause._tag === "SystemError" && cause.reason === "NotFound";
}

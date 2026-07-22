import { createHash } from "node:crypto";
import { type Dirent, lstatSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { FileSystem } from "@effect/platform";
import type { PlatformError } from "@effect/platform/Error";
import { FileReadFailed, FileWriteFailed } from "@habitat/cli/resources/errors/index";
import { Effect, Match } from "effect";

export interface HabitatDirectoryEntry {
  readonly name: string;
  readonly kind: "directory" | "file" | "other";
}

export const isDirectory = Effect.fn("habitat.platform.isDirectory")(function* (
  targetPath: string
) {
  return yield* FileSystem.FileSystem.pipe(
    Effect.flatMap((fs) => fs.stat(targetPath)),
    Effect.map((info) => info.type === "Directory"),
    Effect.catchIf(isMissingPath, () => Effect.succeed(false)),
    Effect.mapError((cause) => readFailure(targetPath, cause))
  );
});

export const isFile = Effect.fn("habitat.platform.isFile")(function* (targetPath: string) {
  return yield* FileSystem.FileSystem.pipe(
    Effect.flatMap((fs) => fs.stat(targetPath)),
    Effect.map((info) => info.type === "File"),
    Effect.catchIf(isMissingPath, () => Effect.succeed(false)),
    Effect.mapError((cause) => readFailure(targetPath, cause))
  );
});

export function makeDirectory(targetPath: string) {
  return FileSystem.FileSystem.pipe(
    Effect.flatMap((fs) => fs.makeDirectory(targetPath, { recursive: true })),
    Effect.mapError((cause) => writeFailure(targetPath, cause))
  );
}

export const readDirectory = Effect.fn("habitat.platform.readDirectory")(function* (
  targetPath: string
) {
  const fs = yield* FileSystem.FileSystem;
  const entries = yield* fs
    .readDirectory(targetPath)
    .pipe(Effect.mapError((cause) => readFailure(targetPath, cause)));
  return yield* Effect.forEach(entries, (name) => directoryEntry(fs, targetPath, name));
});

const directoryEntry = Effect.fn("habitat.platform.directoryEntry")(function* (
  fs: FileSystem.FileSystem,
  targetPath: string,
  name: string
): Effect.fn.Return<HabitatDirectoryEntry, FileReadFailed> {
  const entryPath = path.join(targetPath, name);
  const info = yield* fs
    .stat(entryPath)
    .pipe(Effect.mapError((cause) => readFailure(entryPath, cause)));
  return { name, kind: entryKind(info.type) };
});

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
  return readdirSync(targetPath, { withFileTypes: true }).map(habitatDirectoryEntrySync);
}

function habitatDirectoryEntrySync(entry: Dirent<string>): HabitatDirectoryEntry {
  return { name: entry.name, kind: directoryEntryKindSync(entry) };
}

function directoryEntryKindSync(entry: Dirent<string>): HabitatDirectoryEntry["kind"] {
  return Match.value(entry).pipe(
    Match.when(
      (candidate) => candidate.isDirectory(),
      () => "directory" as const
    ),
    Match.when(
      (candidate) => candidate.isFile(),
      () => "file" as const
    ),
    Match.orElse(() => "other" as const)
  );
}

export function readTextSync(targetPath: string): string {
  return readFileSync(targetPath, "utf8");
}

export function pathExistsSync(targetPath: string): boolean {
  return statKindSync(targetPath) !== undefined;
}

export function hashFileSync(targetPath: string): string | null {
  return Match.value(isFileSync(targetPath)).pipe(
    Match.when(true, () => createHash("sha256").update(readFileSync(targetPath)).digest("hex")),
    Match.orElse(() => null)
  );
}

export function statKindSync(targetPath: string): FileSystem.File.Type | undefined {
  const stat = lstatSync(targetPath, { throwIfNoEntry: false });
  return Match.value(stat).pipe(
    Match.when(Match.undefined, () => undefined),
    Match.when(
      (candidate) => candidate.isDirectory(),
      () => "Directory" as const
    ),
    Match.when(
      (candidate) => candidate.isFile(),
      () => "File" as const
    ),
    Match.when(
      (candidate) => candidate.isSymbolicLink(),
      () => "SymbolicLink" as const
    ),
    Match.when(
      (candidate) => candidate.isBlockDevice(),
      () => "BlockDevice" as const
    ),
    Match.when(
      (candidate) => candidate.isCharacterDevice(),
      () => "CharacterDevice" as const
    ),
    Match.when(
      (candidate) => candidate.isFIFO(),
      () => "FIFO" as const
    ),
    Match.when(
      (candidate) => candidate.isSocket(),
      () => "Socket" as const
    ),
    Match.orElse(() => "Unknown" as const)
  );
}

function entryKind(type: FileSystem.File.Type): HabitatDirectoryEntry["kind"] {
  if (type === "Directory") return "directory";
  if (type === "File") return "file";
  return "other";
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
  return Match.value(cause).pipe(
    Match.when(Match.instanceOf(Error), (error) => error.message),
    Match.orElse(String)
  );
}

function isMissingPath(cause: PlatformError): boolean {
  return cause._tag === "SystemError" && cause.reason === "NotFound";
}

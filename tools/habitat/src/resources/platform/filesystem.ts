import { createHash } from "node:crypto";
import { type Dirent, lstatSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { FileSystem } from "@effect/platform";
import type { PlatformError } from "@effect/platform/Error";
import { FileReadFailed, FileWriteFailed } from "@habitat/cli/resources/errors/index";
import { Effect, Either, Match } from "effect";

export interface HabitatDirectoryEntry {
  readonly name: string;
  readonly kind: "directory" | "file" | "other";
}

export type HabitatPathKind = HabitatDirectoryEntry["kind"] | "missing";

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

export const readPathKind = Effect.fn("habitat.platform.readPathKind")(function* (
  targetPath: string
) {
  const fs = yield* FileSystem.FileSystem;
  const link = yield* fs.readLink(targetPath).pipe(Effect.either);
  return yield* Either.match(link, {
    onRight: () => Effect.succeed("other" as const),
    onLeft: (cause) => pathKindAfterReadLinkFailure(fs, targetPath, cause),
  });
});

function pathKindAfterReadLinkFailure(
  fs: FileSystem.FileSystem,
  targetPath: string,
  cause: PlatformError
) {
  const decision = Match.value(cause).pipe(
    Match.when(isMissingPath, () => ({ kind: "missing" as const })),
    Match.when(isNonSymbolicLink, () => ({ kind: "stat" as const })),
    Match.orElse((readLinkCause) => ({ kind: "failed" as const, cause: readLinkCause }))
  );
  return Match.value(decision).pipe(
    Match.when({ kind: "missing" }, () => Effect.succeed("missing" as const)),
    Match.when({ kind: "stat" }, () => statPathKind(fs, targetPath)),
    Match.when({ kind: "failed" }, ({ cause: readLinkCause }) =>
      Effect.fail(readFailure(targetPath, readLinkCause))
    ),
    Match.exhaustive
  );
}

function statPathKind(fs: FileSystem.FileSystem, targetPath: string) {
  return fs.stat(targetPath).pipe(
    Effect.map((info) => fileTypeToPathKind(info.type)),
    Effect.catchIf(isMissingPath, () => Effect.succeed("missing" as const)),
    Effect.mapError((cause) => readFailure(targetPath, cause))
  );
}

function fileTypeToPathKind(type: FileSystem.File.Type): HabitatPathKind {
  return Match.value(type).pipe(
    Match.when("Directory", () => "directory" as const),
    Match.when("File", () => "file" as const),
    Match.orElse(() => "other" as const)
  );
}

export const readDirectory = Effect.fn("habitat.platform.readDirectory")(function* (
  targetPath: string
) {
  const fs = yield* FileSystem.FileSystem;
  const entries = yield* fs
    .readDirectory(targetPath)
    .pipe(Effect.mapError((cause) => readFailure(targetPath, cause)));
  return yield* Effect.forEach(entries, (name) => directoryEntry(targetPath, name));
});

const directoryEntry = Effect.fn("habitat.platform.directoryEntry")(function* (
  targetPath: string,
  name: string
): Effect.fn.Return<HabitatDirectoryEntry, FileReadFailed, FileSystem.FileSystem> {
  const entryPath = path.join(targetPath, name);
  const kind = yield* readPathKind(entryPath);
  const observedKind = Match.value(kind).pipe(
    Match.when("missing", () => "other" as const),
    Match.orElse((observed) => observed)
  );
  return {
    name,
    kind: observedKind,
  };
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

function isNonSymbolicLink(cause: PlatformError): boolean {
  return (
    cause._tag === "SystemError" &&
    (cause.reason === "InvalidData" ||
      (cause.reason === "Unknown" &&
        cause.syscall === "readlink" &&
        cause.description?.startsWith("EINVAL:") === true))
  );
}

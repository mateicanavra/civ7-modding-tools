import { FileSystem } from "@effect/platform";
import * as PlatformError from "@effect/platform/Error";
import type { HabitatDirectoryEntry } from "@habitat/cli/resources/platform/index";
import { Effect, Match, Option } from "effect";

export function makeFakePlatformFileSystemLayer(
  events: string[] = [],
  files: ReadonlyMap<string, string> = new Map(),
  directories: ReadonlyMap<string, readonly HabitatDirectoryEntry[]> = new Map()
) {
  return FileSystem.layerNoop({
    stat: (targetPath) =>
      Effect.try({
        try: () => fakeFileInfo(events, files, directories, targetPath),
        catch: platformError,
      }),
    makeDirectory: (targetPath) =>
      Effect.sync(() => {
        events.push(`mkdir:${targetPath}`);
      }),
    makeTempDirectoryScoped: (options) => {
      const targetPath = `/tmp/${options?.prefix ?? ""}fake`;
      const acquire = Effect.sync(() => {
        events.push(`mkdtemp:${targetPath}`);
        return targetPath;
      });
      const release = Effect.sync(() => {
        events.push(`remove:${targetPath}`);
      });
      return acquire.pipe(Effect.acquireRelease(() => release));
    },
    readDirectory: (targetPath) =>
      Effect.try({
        try: () => {
          events.push(`readdir:${targetPath}`);
          const entries = directories.get(targetPath);
          if (entries === undefined) throw notFound(targetPath);
          return entries.map((entry) => entry.name);
        },
        catch: platformError,
      }),
    readFileString: (targetPath) =>
      Effect.try({
        try: () => {
          events.push(`read:${targetPath}`);
          const text = files.get(targetPath);
          if (text === undefined) throw notFound(targetPath);
          return text;
        },
        catch: platformError,
      }),
    writeFileString: (targetPath, contents) =>
      Effect.sync(() => {
        events.push(`write:${targetPath}:${contents}`);
      }),
  });
}

function fileInfo(type: FileSystem.File.Type): FileSystem.File.Info {
  return {
    type,
    mtime: Option.none(),
    atime: Option.none(),
    birthtime: Option.none(),
    dev: 0,
    ino: Option.none(),
    mode: 0,
    nlink: Option.none(),
    uid: Option.none(),
    gid: Option.none(),
    rdev: Option.none(),
    size: FileSystem.Size(0n),
    blksize: Option.none(),
    blocks: Option.none(),
  };
}

function fakeFileInfo(
  events: string[],
  files: ReadonlyMap<string, string>,
  directories: ReadonlyMap<string, readonly HabitatDirectoryEntry[]>,
  targetPath: string
) {
  events.push(`stat:${targetPath}`);
  return Match.value(targetPath).pipe(
    Match.when(
      (candidatePath) => directories.has(candidatePath),
      () => fileInfo("Directory")
    ),
    Match.when(
      (candidatePath) => files.has(candidatePath),
      () => fileInfo("File")
    ),
    Match.orElse(() => {
      throw notFound(targetPath);
    })
  );
}

function notFound(path: string): PlatformError.PlatformError {
  return new PlatformError.SystemError({
    reason: "NotFound",
    module: "FileSystem",
    method: "stat",
    pathOrDescriptor: path,
    description: `Fake platform filesystem has no fixture for path: ${path}`,
  });
}

function platformError(cause: unknown): PlatformError.PlatformError {
  return Match.value(cause).pipe(
    Match.when(isPlatformError, (platformCause) => platformCause),
    Match.orElse((unknownCause) => notFound(String(unknownCause)))
  );
}

function isPlatformError(cause: unknown): cause is PlatformError.PlatformError {
  return PlatformError.isPlatformError(cause);
}

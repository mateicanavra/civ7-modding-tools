import { FileSystem } from "@effect/platform";
import * as PlatformError from "@effect/platform/Error";
import type { HabitatDirectoryEntry } from "@habitat/cli/resources/platform/index";
import { Effect, Option } from "effect";

export function makeFakePlatformFileSystemLayer(
  events: string[] = [],
  files: ReadonlyMap<string, string> = new Map(),
  directories: ReadonlyMap<string, readonly HabitatDirectoryEntry[]> = new Map()
) {
  return FileSystem.layerNoop({
    stat: (targetPath) =>
      Effect.try({
        try: () => {
          events.push(`stat:${targetPath}`);
          if (directories.has(targetPath)) return fileInfo("Directory");
          if (files.has(targetPath)) return fileInfo("File");
          throw notFound(targetPath);
        },
        catch: platformError,
      }),
    makeDirectory: (targetPath) =>
      Effect.sync(() => {
        events.push(`mkdir:${targetPath}`);
      }),
    makeTempDirectoryScoped: (options) =>
      Effect.acquireRelease(
        Effect.sync(() => {
          const targetPath = `/tmp/${options?.prefix ?? ""}fake`;
          events.push(`mkdtemp:${targetPath}`);
          return targetPath;
        }),
        (targetPath) =>
          Effect.sync(() => {
            events.push(`remove:${targetPath}`);
          })
      ),
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
  return isPlatformError(cause) ? cause : notFound(String(cause));
}

function isPlatformError(cause: unknown): cause is PlatformError.PlatformError {
  return PlatformError.isPlatformError(cause);
}

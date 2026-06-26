import { FileSystem } from "@effect/platform";
import type { PlatformError } from "@effect/platform/Error";
import type { HabitatDirectoryEntry } from "@internal/habitat-harness/resources/platform/index";
import { Effect } from "effect";

export function makeFakePlatformFileSystemLayer(
  events: string[] = [],
  files: ReadonlyMap<string, string> = new Map(),
  directories: ReadonlyMap<string, readonly HabitatDirectoryEntry[]> = new Map()
) {
  return FileSystem.layerNoop({
    stat: (targetPath) =>
      Effect.sync(() => {
        events.push(`stat:${targetPath}`);
        if (directories.has(targetPath)) return fileInfo("Directory");
        if (files.has(targetPath)) return fileInfo("File");
        throw notFound(targetPath);
      }).pipe(Effect.mapError(platformError)),
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
      Effect.sync(() => {
        events.push(`readdir:${targetPath}`);
        const entries = directories.get(targetPath);
        if (entries === undefined) throw notFound(targetPath);
        return entries.map((entry) => entry.name);
      }).pipe(Effect.mapError(platformError)),
    readFileString: (targetPath) =>
      Effect.sync(() => {
        events.push(`read:${targetPath}`);
        const text = files.get(targetPath);
        if (text === undefined) throw notFound(targetPath);
        return text;
      }).pipe(Effect.mapError(platformError)),
    writeFileString: (targetPath, contents) =>
      Effect.sync(() => {
        events.push(`write:${targetPath}:${contents}`);
      }),
  });
}

function fileInfo(type: FileSystem.File.Type): FileSystem.File.Info {
  return {
    type,
    mtime: none,
    atime: none,
    birthtime: none,
    dev: 0,
    ino: none,
    mode: 0,
    nlink: none,
    uid: none,
    gid: none,
    rdev: none,
    size: 0n as FileSystem.Size,
    blksize: none,
    blocks: none,
  };
}

const none = { _id: "Option", _tag: "None" } as const;

function notFound(path: string): PlatformError {
  return {
    _tag: "SystemError",
    reason: "NotFound",
    module: "FileSystem",
    method: "stat",
    pathOrDescriptor: path,
    message: `Fake platform filesystem has no fixture for path: ${path}`,
  };
}

function platformError(cause: unknown): PlatformError {
  return isPlatformError(cause) ? cause : notFound(String(cause));
}

function isPlatformError(cause: unknown): cause is PlatformError {
  return Boolean(cause && typeof cause === "object" && "_tag" in cause);
}

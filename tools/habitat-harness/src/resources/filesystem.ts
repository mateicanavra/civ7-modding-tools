import {
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { Context, Effect, Layer } from "effect";
import { FileReadFailed, FileWriteFailed } from "../errors/index.ts";

export interface HabitatDirectoryEntry {
  readonly name: string;
  readonly kind: "directory" | "file" | "other";
}

export interface HabitatFileSystemService {
  readonly isDirectory: (targetPath: string) => Effect.Effect<boolean, FileReadFailed>;
  readonly isFile: (targetPath: string) => Effect.Effect<boolean, FileReadFailed>;
  readonly makeDirectory: (targetPath: string) => Effect.Effect<void, FileWriteFailed>;
  readonly makeTempDirectory: (prefix: string) => Effect.Effect<string, FileWriteFailed>;
  readonly readDirectory: (
    targetPath: string
  ) => Effect.Effect<readonly HabitatDirectoryEntry[], FileReadFailed>;
  readonly readText: (targetPath: string) => Effect.Effect<string, FileReadFailed>;
  readonly writeText: (
    targetPath: string,
    contents: string
  ) => Effect.Effect<void, FileWriteFailed>;
  readonly remove: (targetPath: string) => Effect.Effect<void, FileWriteFailed>;
}

export class HabitatFileSystem extends Context.Tag("@internal/habitat-harness/HabitatFileSystem")<
  HabitatFileSystem,
  HabitatFileSystemService
>() {}

export const HabitatFileSystemLive = Layer.succeed(HabitatFileSystem, {
  isDirectory: (targetPath) =>
    Effect.sync(() => {
      try {
        return statSync(targetPath).isDirectory();
      } catch (cause) {
        if (isMissingPath(cause)) return false;
        throw new FileReadFailed({
          path: targetPath,
          cause: cause instanceof Error ? cause.message : String(cause),
        });
      }
    }),
  isFile: (targetPath) =>
    Effect.sync(() => {
      try {
        return statSync(targetPath).isFile();
      } catch (cause) {
        if (isMissingPath(cause)) return false;
        throw new FileReadFailed({
          path: targetPath,
          cause: cause instanceof Error ? cause.message : String(cause),
        });
      }
    }),
  makeDirectory: (targetPath) =>
    Effect.try({
      try: () => mkdirSync(targetPath, { recursive: true }),
      catch: (cause) =>
        new FileWriteFailed({
          path: targetPath,
          cause: cause instanceof Error ? cause.message : String(cause),
        }),
    }).pipe(Effect.asVoid),
  makeTempDirectory: (prefix) =>
    Effect.try({
      try: () => mkdtempSync(path.join(tmpdir(), prefix)),
      catch: (cause) =>
        new FileWriteFailed({
          path: path.join(tmpdir(), prefix),
          cause: cause instanceof Error ? cause.message : String(cause),
        }),
    }),
  readDirectory: (targetPath) =>
    Effect.try({
      try: () =>
        readdirSync(targetPath, { withFileTypes: true }).map((entry) => ({
          name: entry.name,
          kind: entry.isDirectory() ? ("directory" as const) : entry.isFile() ? "file" : "other",
        })),
      catch: (cause) =>
        new FileReadFailed({
          path: targetPath,
          cause: cause instanceof Error ? cause.message : String(cause),
        }),
    }),
  readText: (targetPath) =>
    Effect.try({
      try: () => readFileSync(targetPath, "utf8"),
      catch: (cause) =>
        new FileReadFailed({
          path: targetPath,
          cause: cause instanceof Error ? cause.message : String(cause),
        }),
    }),
  writeText: (targetPath, contents) =>
    Effect.try({
      try: () => writeFileSync(targetPath, contents),
      catch: (cause) =>
        new FileWriteFailed({
          path: targetPath,
          cause: cause instanceof Error ? cause.message : String(cause),
        }),
    }).pipe(Effect.asVoid),
  remove: (targetPath) =>
    Effect.try({
      try: () => rmSync(targetPath, { recursive: true, force: true }),
      catch: (cause) =>
        new FileWriteFailed({
          path: targetPath,
          cause: cause instanceof Error ? cause.message : String(cause),
        }),
    }).pipe(Effect.asVoid),
});

export function makeFakeHabitatFileSystemLayer(
  events: string[] = [],
  files: ReadonlyMap<string, string> = new Map(),
  directories: ReadonlyMap<string, readonly HabitatDirectoryEntry[]> = new Map()
) {
  return Layer.succeed(HabitatFileSystem, {
    isDirectory: (targetPath) =>
      Effect.sync(() => {
        events.push(`isDirectory:${targetPath}`);
        return directories.has(targetPath);
      }),
    isFile: (targetPath) =>
      Effect.sync(() => {
        events.push(`isFile:${targetPath}`);
        return files.has(targetPath);
      }),
    makeDirectory: (targetPath) =>
      Effect.sync(() => {
        events.push(`mkdir:${targetPath}`);
      }),
    makeTempDirectory: (prefix) =>
      Effect.sync(() => {
        const targetPath = `/tmp/${prefix}fake`;
        events.push(`mkdtemp:${targetPath}`);
        return targetPath;
      }),
    readDirectory: (targetPath) =>
      Effect.gen(function* () {
        events.push(`readdir:${targetPath}`);
        const entries = directories.get(targetPath);
        if (entries !== undefined) return entries;
        return yield* Effect.fail(
          new FileReadFailed({
            path: targetPath,
            cause: "Fake Habitat filesystem has no directory fixture for path.",
          })
        );
      }),
    readText: (targetPath) =>
      Effect.gen(function* () {
        events.push(`read:${targetPath}`);
        const text = files.get(targetPath);
        if (text !== undefined) return text;
        return yield* Effect.fail(
          new FileReadFailed({
            path: targetPath,
            cause: "Fake Habitat filesystem has no text fixture for path.",
          })
        );
      }),
    writeText: (targetPath, contents) =>
      Effect.sync(() => {
        events.push(`write:${targetPath}:${contents}`);
      }),
    remove: (targetPath) =>
      Effect.sync(() => {
        events.push(`remove:${targetPath}`);
      }),
  });
}

function isMissingPath(cause: unknown): boolean {
  return typeof cause === "object" && cause !== null && "code" in cause && cause.code === "ENOENT";
}

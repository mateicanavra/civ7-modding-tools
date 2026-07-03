import { mkdirSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { Context, Effect, Layer } from "effect";
import { FileReadFailed, FileWriteFailed } from "../errors/index.js";

export interface HabitatFileSystemService {
  readonly makeDirectory: (targetPath: string) => Effect.Effect<void, FileWriteFailed>;
  readonly makeTempDirectory: (prefix: string) => Effect.Effect<string, FileWriteFailed>;
  readonly readText: (targetPath: string) => Effect.Effect<string, FileReadFailed>;
  readonly remove: (targetPath: string) => Effect.Effect<void, FileWriteFailed>;
}

export class HabitatFileSystem extends Context.Tag("@internal/habitat-harness/HabitatFileSystem")<
  HabitatFileSystem,
  HabitatFileSystemService
>() {}

export const HabitatFileSystemLive = Layer.succeed(HabitatFileSystem, {
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
  readText: (targetPath) =>
    Effect.try({
      try: () => readFileSync(targetPath, "utf8"),
      catch: (cause) =>
        new FileReadFailed({
          path: targetPath,
          cause: cause instanceof Error ? cause.message : String(cause),
        }),
    }),
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
  files: ReadonlyMap<string, string> = new Map()
) {
  return Layer.succeed(HabitatFileSystem, {
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
    remove: (targetPath) =>
      Effect.sync(() => {
        events.push(`remove:${targetPath}`);
      }),
  });
}

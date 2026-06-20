import { mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { Context, Effect, Layer } from "effect";
import { FileWriteFailed } from "../errors/index.js";

export interface HabitatFileSystemService {
  readonly makeDirectory: (targetPath: string) => Effect.Effect<void, FileWriteFailed>;
  readonly makeTempDirectory: (prefix: string) => Effect.Effect<string, FileWriteFailed>;
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

export function makeFakeHabitatFileSystemLayer(events: string[] = []) {
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
    remove: (targetPath) =>
      Effect.sync(() => {
        events.push(`remove:${targetPath}`);
      }),
  });
}

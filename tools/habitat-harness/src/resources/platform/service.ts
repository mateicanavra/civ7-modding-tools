import { repoRoot } from "@internal/habitat-harness/resources/paths";
import { Context, Layer } from "effect";
import {
  hashFileSync,
  isDirectory,
  isDirectorySync,
  isFileSync,
  pathExistsSync,
  readDirectory,
  readDirectorySync,
  readText,
  readTextSync,
  statKindSync,
} from "./filesystem.js";
import { acquireTempDirectory } from "./temp-dir.js";

export interface HabitatPlatformService {
  readonly acquireTempDirectory: typeof acquireTempDirectory;
  readonly env: Record<string, string | undefined>;
  readonly hashFile: typeof hashFileSync;
  readonly isDirectory: typeof isDirectory;
  readonly isDirectorySync: typeof isDirectorySync;
  readonly isFile: typeof isFileSync;
  readonly pathExists: typeof pathExistsSync;
  readonly readDirectory: typeof readDirectory;
  readonly readDirectorySync: typeof readDirectorySync;
  readonly readText: typeof readText;
  readonly readTextSync: typeof readTextSync;
  readonly repoRoot: string;
  readonly statKind: typeof statKindSync;
}

export class HabitatPlatform extends Context.Tag("@internal/habitat-harness/HabitatPlatform")<
  HabitatPlatform,
  HabitatPlatformService
>() {}

export const HabitatPlatformLive = Layer.succeed(HabitatPlatform, {
  acquireTempDirectory,
  env: process.env,
  hashFile: hashFileSync,
  isDirectory,
  isDirectorySync,
  isFile: isFileSync,
  pathExists: pathExistsSync,
  readDirectory,
  readDirectorySync,
  readText,
  readTextSync,
  repoRoot,
  statKind: statKindSync,
});

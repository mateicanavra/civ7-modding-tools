import { repoRoot } from "@internal/habitat-harness/resources/paths";
import { Context, Layer } from "effect";
import {
  hashFileSync,
  isFileSync,
  pathExistsSync,
  readText,
  readTextSync,
  statKindSync,
} from "./filesystem.js";
import { acquireTempDirectory } from "./temp-dir.js";

export interface HabitatPlatformService {
  readonly acquireTempDirectory: typeof acquireTempDirectory;
  readonly env: Record<string, string | undefined>;
  readonly hashFile: typeof hashFileSync;
  readonly isFile: typeof isFileSync;
  readonly pathExists: typeof pathExistsSync;
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
  isFile: isFileSync,
  pathExists: pathExistsSync,
  readText,
  readTextSync,
  repoRoot,
  statKind: statKindSync,
});

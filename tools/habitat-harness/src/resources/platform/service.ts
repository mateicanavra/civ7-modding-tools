import { repoRoot } from "@internal/habitat-harness/resources/paths";
import { Context, Layer } from "effect";
import { hashFileSync, pathExistsSync, readText } from "./filesystem.js";
import { acquireTempDirectory } from "./temp-dir.js";

export interface HabitatPlatformService {
  readonly acquireTempDirectory: typeof acquireTempDirectory;
  readonly env: Record<string, string | undefined>;
  readonly hashFile: typeof hashFileSync;
  readonly pathExists: typeof pathExistsSync;
  readonly readText: typeof readText;
  readonly repoRoot: string;
}

export class HabitatPlatform extends Context.Tag("@internal/habitat-harness/HabitatPlatform")<
  HabitatPlatform,
  HabitatPlatformService
>() {}

export const HabitatPlatformLive = Layer.succeed(HabitatPlatform, {
  acquireTempDirectory,
  env: process.env,
  hashFile: hashFileSync,
  pathExists: pathExistsSync,
  readText,
  repoRoot,
});

import { repoRoot } from "@habitat/cli/resources/paths";
import { Context, Layer } from "effect";
import {
  hashFileSync,
  isDirectory,
  isDirectorySync,
  isFile,
  isFileSync,
  makeDirectory,
  pathExistsSync,
  readDirectory,
  readDirectorySync,
  readText,
  readTextSync,
  statKindSync,
  writeText,
} from "./filesystem.js";
import { acquireTempDirectory } from "./temp-dir.js";

export interface HabitatPlatformService {
  readonly acquireTempDirectory: typeof acquireTempDirectory;
  readonly env: Record<string, string | undefined>;
  readonly hashFile: typeof hashFileSync;
  readonly isDirectory: typeof isDirectory;
  readonly isDirectorySync: typeof isDirectorySync;
  readonly isFile: typeof isFileSync;
  readonly isFileEffect: typeof isFile;
  readonly makeDirectory: typeof makeDirectory;
  readonly pathExists: typeof pathExistsSync;
  readonly readDirectory: typeof readDirectory;
  readonly readDirectorySync: typeof readDirectorySync;
  readonly readText: typeof readText;
  readonly readTextSync: typeof readTextSync;
  readonly repoRoot: string;
  readonly statKind: typeof statKindSync;
  readonly writeText: typeof writeText;
}

/** Read-only filesystem capability used by structural policies without exposing platform assembly. */
export type HabitatFileSystemReadPort = Pick<
  HabitatPlatformService,
  "isDirectory" | "readDirectory" | "readText"
> & {
  readonly isFile: HabitatPlatformService["isFileEffect"];
};

export class HabitatPlatform extends Context.Tag("@habitat/cli/HabitatPlatform")<
  HabitatPlatform,
  HabitatPlatformService
>() {}

export function makeHabitatPlatformService(
  input: { readonly repoRoot: string; readonly env?: Record<string, string | undefined> } = {
    repoRoot,
  }
): HabitatPlatformService {
  return {
    acquireTempDirectory,
    env: input.env ?? process.env,
    hashFile: hashFileSync,
    isDirectory,
    isDirectorySync,
    isFile: isFileSync,
    isFileEffect: isFile,
    makeDirectory,
    pathExists: pathExistsSync,
    readDirectory,
    readDirectorySync,
    readText,
    readTextSync,
    repoRoot: input.repoRoot,
    statKind: statKindSync,
    writeText,
  };
}

export function makeHabitatPlatformLayer(
  input: { readonly repoRoot: string; readonly env?: Record<string, string | undefined> } = {
    repoRoot,
  }
) {
  return Layer.succeed(HabitatPlatform, makeHabitatPlatformService(input));
}

export const HabitatPlatformLive = makeHabitatPlatformLayer({ repoRoot });

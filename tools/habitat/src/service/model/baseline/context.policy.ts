import type { GitProviderService } from "@habitat/cli/providers/git/index";
import type { HabitatPlatformService } from "@habitat/cli/resources/platform/index";
import { Match } from "effect";
import type {
  BaselineRuleContractInput,
  RuleIntroductionBaselineManifest,
} from "./dto/baseline.schema.js";

export interface BaselineDirectoryEntry {
  readonly name: string;
  readonly kind: "directory" | "file" | "other";
}

export type BaselineFileSystemPort = Pick<
  HabitatPlatformService,
  "isDirectory" | "makeDirectory" | "readDirectory" | "readText" | "writeText"
> & {
  readonly isFile: HabitatPlatformService["isFileEffect"];
};

export type BaselineGitPort = Pick<
  GitProviderService,
  "lsTreeNameOnly" | "mergeBase" | "show"
>;

export interface BaselineAuthorityContext {
  fileSystem: BaselineFileSystemPort;
  git: BaselineGitPort;
  repoRoot: string;
  baselinesDir?: string;
  registry?: readonly BaselineRuleContractInput[];
  ruleIntroductionManifests?: readonly RuleIntroductionBaselineManifest[];
}

export function externalSourceFilePath(sourcePath: string): string {
  return sourcePath.split("#")[0] ?? sourcePath;
}

export function errorMessage(error: unknown): string {
  return Match.value(error).pipe(
    Match.when(Match.instanceOf(Error), (cause) => cause.message),
    Match.orElse(String)
  );
}

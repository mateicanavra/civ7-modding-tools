import * as path from "node:path";
import * as Config from "@civ7/config";

interface ResolvedRootOptions {
  projectRoot: string;
  profile: string;
  flagsRoot?: string;
  flagsConfig?: string;
}

/**
 * Resolves the XML resource root selected by a data command.
 *
 * An explicit command flag wins; otherwise the selected profile's admitted
 * unzip destination is reused so crawl, explore, and slice share one resource
 * location policy.
 */
export async function resolveRootFromConfigOrFlag(opts: ResolvedRootOptions): Promise<string> {
  const { projectRoot, profile, flagsRoot, flagsConfig } = opts;
  if (flagsRoot) {
    return path.resolve(projectRoot, Config.expandPath(flagsRoot));
  }
  const cfg = (await Config.loadConfig(projectRoot, flagsConfig)).raw;
  return Config.resolveUnzipDir({ projectRoot, profile }, cfg);
}

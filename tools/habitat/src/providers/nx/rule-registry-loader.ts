import fs from "node:fs";
import path from "node:path";
import {
  loadRuleRegistryDocument,
  type RuleRegistryDirectoryEntry,
  type RuleRegistryDocumentV1,
  type RuleRegistryRecordV1,
  type RuleRegistrySyncFileSystem,
} from "@habitat/cli/service/model/rules/index";

export type NxRuleRegistryRecord = RuleRegistryRecordV1;
export type NxRuleRegistryDocument = RuleRegistryDocumentV1;

export function loadRuleRegistryDocumentForNxPlugin(registryPath: string): NxRuleRegistryDocument {
  return loadRuleRegistryDocument(registryPath, nodeRuleRegistryFileSystem);
}

const nodeRuleRegistryFileSystem: RuleRegistrySyncFileSystem = {
  isDirectory(registryPath: string) {
    return fs.existsSync(registryPath) && fs.statSync(registryPath).isDirectory();
  },
  readDirectory(registryPath: string): readonly RuleRegistryDirectoryEntry[] {
    return fs.readdirSync(registryPath, { withFileTypes: true }).map((entry) => ({
      name: entry.name,
      kind: entry.isDirectory() ? "directory" : entry.isFile() ? "file" : "other",
    }));
  },
  readText(registryPath: string): string {
    return fs.readFileSync(path.resolve(registryPath), "utf8");
  },
};

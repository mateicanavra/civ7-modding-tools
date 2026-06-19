import path from "node:path";
import { Value } from "typebox/value";
import { StagedMutationPathSchema, type StagedMutationPath } from "./schema.js";

export function stagedPathsFromNameStatus(output: string): StagedMutationPath[] {
  const tokens = output.split("\0").filter(Boolean);
  const paths: StagedMutationPath[] = [];
  for (let index = 0; index < tokens.length; ) {
    const status = tokens[index++] ?? "";
    if (status.startsWith("R")) {
      pushPath(paths, tokens[index++], "renamed-from");
      pushPath(paths, tokens[index++], "renamed-to");
      continue;
    }
    if (status.startsWith("C")) {
      pushPath(paths, tokens[index++], "copied-from");
      pushPath(paths, tokens[index++], "copied-to");
      continue;
    }
    pushPath(paths, tokens[index++], actionForStatus(status));
  }
  return uniquePaths(paths);
}

export function modifiedStagedPaths(paths: readonly string[]): StagedMutationPath[] {
  return uniquePaths(paths.map((candidate) => parsePath(candidate, "modified")));
}

function actionForStatus(status: string): StagedMutationPath["action"] {
  if (status.startsWith("A")) return "added";
  if (status.startsWith("D")) return "deleted";
  return "modified";
}

function pushPath(
  paths: StagedMutationPath[],
  candidate: string | undefined,
  action: StagedMutationPath["action"]
) {
  if (!candidate) return;
  paths.push(parsePath(candidate, action));
}

function parsePath(candidate: string, action: StagedMutationPath["action"]): StagedMutationPath {
  return Value.Parse(StagedMutationPathSchema, {
    path: candidate.split(path.sep).join("/"),
    action,
  });
}

function uniquePaths(paths: readonly StagedMutationPath[]): StagedMutationPath[] {
  const seen = new Set<string>();
  return paths.filter((item) => {
    const key = `${item.action}:${item.path}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

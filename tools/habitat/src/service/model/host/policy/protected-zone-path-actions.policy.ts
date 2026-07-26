import path from "node:path";
import { Value } from "typebox/value";
import { type StagedMutationPath, StagedMutationPathSchema } from "../dto/protected-zone.schema.js";

export type StagedNameStatusParseResult =
  | { readonly ok: true; readonly paths: readonly StagedMutationPath[] }
  | { readonly ok: false; readonly message: string };

/** Admits a complete NUL-delimited cached Git name-status stream. */
export function parseStagedPathsFromNameStatus(output: string): StagedNameStatusParseResult {
  if (output === "") return { ok: true, paths: [] };
  if (!output.endsWith("\0")) {
    return {
      ok: false,
      message: "Staged path action output is missing its terminal NUL delimiter.",
    };
  }

  const tokens = output.slice(0, -1).split("\0");
  if (tokens.some((token) => token === "")) {
    return {
      ok: false,
      message: "Staged path action output contains an empty status or path token.",
    };
  }

  const paths: StagedMutationPath[] = [];
  for (let index = 0; index < tokens.length; ) {
    const status = tokens[index++];
    if (!status) return malformedStatusRecord(index - 1);
    const action = actionForStatus(status);
    if (!action) return malformedStatusRecord(index - 1, status);

    const pathCount = action === "renamed" || action === "copied" ? 2 : 1;
    const recordPaths = tokens.slice(index, index + pathCount);
    if (recordPaths.length !== pathCount) return incompleteStatusRecord(status, pathCount);
    index += pathCount;

    try {
      if (action === "renamed") {
        pushPath(paths, recordPaths[0], "renamed-from");
        pushPath(paths, recordPaths[1], "renamed-to");
      } else if (action === "copied") {
        pushPath(paths, recordPaths[0], "copied-from");
        pushPath(paths, recordPaths[1], "copied-to");
      } else {
        pushPath(paths, recordPaths[0], action);
      }
    } catch (error) {
      return {
        ok: false,
        message: `Staged path action ${status} contains an invalid repository path: ${errorMessage(error)}.`,
      };
    }
  }
  return { ok: true, paths: uniquePaths(paths) };
}

/** Applies cached Git actions without collapsing deletions, renames, or copies. */
export function applyStagedPathActions(
  headPaths: readonly string[],
  actions: readonly StagedMutationPath[]
): string[] {
  const staged = new Set(headPaths.map(normalizeRepoPath));
  for (const { path: candidate, action } of actions) {
    const normalized = normalizeRepoPath(candidate);
    if (action === "deleted" || action === "renamed-from") {
      staged.delete(normalized);
      continue;
    }
    if (action !== "copied-from") staged.add(normalized);
  }
  return [...staged].sort();
}

function actionForStatus(
  status: string
): StagedMutationPath["action"] | "renamed" | "copied" | null {
  if (status === "A") return "added";
  if (status === "D") return "deleted";
  if (status === "M") return "modified";
  if (isSimilarityStatus(status, "R")) return "renamed";
  if (isSimilarityStatus(status, "C")) return "copied";
  return null;
}

function isSimilarityStatus(status: string, prefix: "R" | "C"): boolean {
  const match = status.match(new RegExp(`^${prefix}(\\d{1,3})$`, "u"));
  return match?.[1] !== undefined && Number(match[1]) <= 100;
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

function malformedStatusRecord(tokenIndex: number, status?: string): StagedNameStatusParseResult {
  return {
    ok: false,
    message: status
      ? `Staged path action output contains unsupported status ${JSON.stringify(status)} at token ${tokenIndex}.`
      : `Staged path action output is missing a status at token ${tokenIndex}.`,
  };
}

function incompleteStatusRecord(
  status: string,
  expectedPathCount: number
): StagedNameStatusParseResult {
  return {
    ok: false,
    message:
      `Staged path action ${status} requires ${expectedPathCount} path ` +
      `${expectedPathCount === 1 ? "token" : "tokens"}.`,
  };
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function normalizeRepoPath(repoPath: string): string {
  return repoPath.replace(/\\/g, "/").replace(/^\.\//, "");
}

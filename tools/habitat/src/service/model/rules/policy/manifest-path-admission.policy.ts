/** One physical rule-manifest path that canonical registry admission refuses. */
export interface RuleManifestPathAdmissionIssue {
  readonly path: string;
  readonly message: string;
}

/**
 * Identifies every path the Habitat registry treats as a rule-manifest candidate.
 *
 * Legacy `*.rule.json` files remain candidates so admission can reject them rather
 * than silently ignoring authority that uses the retired filename.
 */
export function isRuleManifestCandidatePath(filePath: string): boolean {
  const fileName = filePath.split("/").at(-1);
  return fileName === "rule.json" || Boolean(fileName?.endsWith(".rule.json"));
}

/** Refuses retired manifest filenames and category/operation packet nesting. */
export function ruleManifestPathAdmissionIssues(
  paths: readonly string[]
): RuleManifestPathAdmissionIssue[] {
  return paths.flatMap((rulePath) => {
    const issues: RuleManifestPathAdmissionIssue[] = [];
    if (rulePath.endsWith(".rule.json")) {
      issues.push({
        path: rulePath,
        message: "Rule manifest files must be named rule.json.",
      });
    }
    if (usesStaleCategoryOperationPath(rulePath)) {
      issues.push({
        path: rulePath,
        message:
          "Rule packets must not use category/operation-kind path nesting; use .habitat/blueprints/<blueprint>/<packet>, _blueprints/<candidate>/<packet>, or rules/<packet>.",
      });
    }
    return issues;
  });
}

function usesStaleCategoryOperationPath(rulePath: string): boolean {
  const segments = rulePath.split("/");
  const blueprintIndex = segments.lastIndexOf("blueprints");
  if (blueprintIndex < 0) return false;
  const category = segments[blueprintIndex + 2];
  const operationKind = segments[blueprintIndex + 3];
  const packet = segments[blueprintIndex + 4];
  const fileName = segments[blueprintIndex + 5];
  return (
    category !== undefined &&
    operationKind !== undefined &&
    packet !== undefined &&
    fileName === "rule.json" &&
    staleCategories.has(category) &&
    staleOperationKinds.has(operationKind)
  );
}

const staleCategories = new Set([
  "boundary",
  "structure",
  "contract",
  "execution",
  "artifact",
  "output",
  "quality",
  "policy",
]);

const staleOperationKinds = new Set(["check", "fix", "generate", "migrate", "triage"]);

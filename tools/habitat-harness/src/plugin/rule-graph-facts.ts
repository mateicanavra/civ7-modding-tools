import type { RuleGraphFacts, RuleRegistryRecordV1 } from "../domains/rule-registry/schema.ts";
import type { WorkspaceGraphTargetNames } from "../providers/nx/schema.ts";

type RuleGraphTargetNames = Pick<
  WorkspaceGraphTargetNames,
  "biomeCi" | "boundaries" | "generatedCheck" | "sourceCheck"
>;

export function ruleGraphFactsForNxPlugin(
  records: readonly RuleRegistryRecordV1[],
  ownerRoots: ReadonlyMap<string, string>,
  targetNames: RuleGraphTargetNames
): RuleGraphFacts[] {
  return records.map((rule) => {
    const root = ownerRoots.get(rule.ownerProject);
    if (!root) {
      throw new Error(
        `Habitat graph metadata contract failure: unknown ownerProject '${rule.ownerProject}' for rule '${rule.id}'.`
      );
    }
    return {
      id: rule.id,
      ownerProject: rule.ownerProject,
      ownerRoot: root,
      alias: ruleGraphAlias(rule, targetNames),
    };
  });
}

function ruleGraphAlias(
  rule: RuleRegistryRecordV1,
  targetNames: RuleGraphTargetNames
): RuleGraphFacts["alias"] {
  if (rule.id === "format-ci") {
    return {
      kind: "depends-on",
      target: { project: "@internal/habitat-harness", target: targetNames.biomeCi },
    };
  }
  if (rule.ownerTool === "target-check") {
    if (!rule.graphTarget) {
      throw new Error(
        `Habitat graph metadata contract failure: missing graphTarget for target-check rule '${rule.id}'.`
      );
    }
    return {
      kind: "depends-on",
      target: { ...rule.graphTarget },
    };
  }
  return { kind: "direct-rule-check" };
}

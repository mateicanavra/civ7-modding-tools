import type { RuleGraphFacts, RuleRegistryRecord } from "../../rules/dto/registry.schema.ts";
import type { WorkspaceGraphTargetNames } from "../../workspace/index.ts";

type RuleGraphTargetNames = Pick<
  WorkspaceGraphTargetNames,
  "biomeCi" | "boundaries" | "generatedCheck" | "sourceCheck"
>;

export function ruleGraphFactsForNxPlugin(
  records: readonly RuleRegistryRecord[],
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
      lane: rule.lane,
      message: rule.message,
      alias: ruleGraphAlias(rule, targetNames),
    };
  });
}

function ruleGraphAlias(
  rule: RuleRegistryRecord,
  targetNames: RuleGraphTargetNames
): RuleGraphFacts["alias"] {
  if (rule.id === "enforce_formatting_and_import_hygiene") {
    return {
      kind: "depends-on",
      target: { project: "habitat", target: targetNames.biomeCi },
    };
  }
  if (rule.runner.name === "nx") {
    return {
      kind: "depends-on",
      target: { ...rule.runner.target },
    };
  }
  return { kind: "direct-rule-check" };
}

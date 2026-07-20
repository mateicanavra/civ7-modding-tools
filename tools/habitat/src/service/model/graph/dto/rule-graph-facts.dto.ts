import type { RuleGraphFacts, RuleRegistryRecord } from "../../rules/dto/registry.schema.ts";

export function ruleGraphFactsForNxPlugin(
  records: readonly RuleRegistryRecord[],
  ownerRoots: ReadonlyMap<string, string>
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
      graphDependencies: rule.graphDependencies ?? [],
      alias: ruleGraphAlias(rule),
    };
  });
}

function ruleGraphAlias(rule: RuleRegistryRecord): RuleGraphFacts["alias"] {
  if (rule.runner.name === "nx") {
    return {
      kind: "depends-on",
      target: { ...rule.runner.target },
    };
  }
  return { kind: "direct-rule-check" };
}

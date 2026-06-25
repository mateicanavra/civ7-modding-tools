import type { RuleFactsCatalog } from "@habitat/cli/service/model/rules/policy/catalog.policy";
import { factsForRuleIds } from "@habitat/cli/service/model/rules/policy/catalog.policy";

export function baselineContractInputs(rules: RuleFactsCatalog, ruleIds?: readonly string[]) {
  const baselineFacts = ruleIds ? factsForRuleIds(rules.baseline, ruleIds) : rules.baseline;
  const selectorsByRuleId = factsByRuleId(
    ruleIds ? factsForRuleIds(rules.selector, ruleIds) : rules.selector
  );
  return baselineFacts.map((fact) => {
    const selector = selectorsByRuleId.get(fact.id);
    return {
      ...fact,
      ...(selector
        ? {
            ownerProject: selector.ownerProject,
            ownerTool: selector.ownerTool,
          }
        : {}),
    };
  });
}

function factsByRuleId<T extends { id: string }>(facts: readonly T[]): Map<string, T> {
  return new Map(facts.map((fact) => [fact.id, fact]));
}

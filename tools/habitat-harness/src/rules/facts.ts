import { workspaceGraphTargetNames } from "../lib/workspace-graph/target-names.js";
import {
  activeRuleRegistryDocument,
  ruleBaselineFacts,
  ruleCommandExecutionFacts,
  ruleFileLayerFacts,
  ruleGraphFacts,
  ruleHookCheckFacts,
  rulePatternFacts,
  ruleReportFacts,
  ruleRoutingFacts,
  ruleSelectorFacts,
} from "./registry/index.js";

const records = activeRuleRegistryDocument.rules;

export const activeRuleSelectorFacts = ruleSelectorFacts(records);
export const activeRuleReportFacts = ruleReportFacts(records);
export const activeRuleBaselineFacts = ruleBaselineFacts(records);
export const activeRuleCommandExecutionFacts = ruleCommandExecutionFacts(records);
export const activeRulePatternFacts = rulePatternFacts(records);
export const activeRuleFileLayerFacts = ruleFileLayerFacts(records);
export const activeRuleHookCheckFacts = ruleHookCheckFacts(records);
export const activeRuleRoutingFacts = ruleRoutingFacts(records);
export const activeRuleGraphFacts = ruleGraphFacts(
  records,
  new Map(Object.entries(activeRuleRegistryDocument.ownerRoots)),
  workspaceGraphTargetNames()
);

export function factsForRuleIds<T extends { id: string }>(
  facts: readonly T[],
  ruleIds: readonly string[]
): T[] {
  const byId = new Map(facts.map((fact) => [fact.id, fact]));
  return ruleIds.flatMap((ruleId) => {
    const fact = byId.get(ruleId);
    return fact ? [fact] : [];
  });
}

import { workspaceGraphTargetNames } from "@internal/habitat-harness/providers/nx/targets";
import { activeRuleRegistryDocument } from "../repositories/registry.repository.js";
import {
  ruleBaselineFacts,
  ruleCommandExecutionFacts,
  ruleFileLayerFacts,
  ruleGritFacts,
  ruleHookCheckFacts,
  ruleReportFacts,
  ruleRoutingFacts,
  ruleSelectorFacts,
  ruleSourceFacts,
} from "./facts.policy.js";
import { ruleGraphFacts } from "./graph.policy.js";

const records = activeRuleRegistryDocument.rules;

export const activeRuleSelectorFacts = ruleSelectorFacts(records);
export const activeRuleReportFacts = ruleReportFacts(records);
export const activeRuleBaselineFacts = ruleBaselineFacts(records);
export const activeRuleCommandExecutionFacts = ruleCommandExecutionFacts(records);
export const activeRuleSourceFacts = ruleSourceFacts(records);
export const activeRuleGritFacts = ruleGritFacts(records);
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

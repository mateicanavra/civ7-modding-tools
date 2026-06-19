import {
  activeRuleRegistryDocument,
  ruleBaselineFacts,
  ruleCommandExecutionFacts,
  ruleFileLayerFacts,
  ruleGritFacts,
  ruleLocalFeedbackFacts,
  ruleReportFacts,
  ruleRoutingFacts,
  ruleSelectorFacts,
} from "./registry/index.js";

const records = activeRuleRegistryDocument.rules;

export const activeRuleSelectorFacts = ruleSelectorFacts(records);
export const activeRuleReportFacts = ruleReportFacts(records);
export const activeRuleBaselineFacts = ruleBaselineFacts(records);
export const activeRuleCommandExecutionFacts = ruleCommandExecutionFacts(records);
export const activeRuleGritFacts = ruleGritFacts(records);
export const activeRuleFileLayerFacts = ruleFileLayerFacts(records);
export const activeRuleLocalFeedbackFacts = ruleLocalFeedbackFacts(records);
export const activeRuleRoutingFacts = ruleRoutingFacts(records);

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

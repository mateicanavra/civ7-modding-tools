import { workspaceGraphTargetNames } from "@internal/habitat-harness/providers/nx/targets";
import type { RuleRegistryDocumentV1 } from "../dto/registry.schema.js";
import { activeRuleRegistryDocument } from "../repositories/registry.repository.js";
import { ruleArtifactPathFacts } from "./artifact-paths.policy.js";
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

export interface RuleFactsCatalog {
  readonly artifactPath: ReturnType<typeof ruleArtifactPathFacts>;
  readonly selector: ReturnType<typeof ruleSelectorFacts>;
  readonly report: ReturnType<typeof ruleReportFacts>;
  readonly baseline: ReturnType<typeof ruleBaselineFacts>;
  readonly commandExecution: ReturnType<typeof ruleCommandExecutionFacts>;
  readonly source: ReturnType<typeof ruleSourceFacts>;
  readonly grit: ReturnType<typeof ruleGritFacts>;
  readonly fileLayer: ReturnType<typeof ruleFileLayerFacts>;
  readonly hookCheck: ReturnType<typeof ruleHookCheckFacts>;
  readonly routing: ReturnType<typeof ruleRoutingFacts>;
  readonly graph: ReturnType<typeof ruleGraphFacts>;
}

export function ruleFactsCatalog(document: RuleRegistryDocumentV1): RuleFactsCatalog {
  const records = document.rules;
  return {
    artifactPath: ruleArtifactPathFacts(records),
    selector: ruleSelectorFacts(records),
    report: ruleReportFacts(records),
    baseline: ruleBaselineFacts(records),
    commandExecution: ruleCommandExecutionFacts(records),
    source: ruleSourceFacts(records),
    grit: ruleGritFacts(records),
    fileLayer: ruleFileLayerFacts(records),
    hookCheck: ruleHookCheckFacts(records),
    routing: ruleRoutingFacts(records),
    graph: ruleGraphFacts(
      records,
      new Map(Object.entries(document.ownerRoots)),
      workspaceGraphTargetNames()
    ),
  };
}

export const activeRuleFacts = ruleFactsCatalog(activeRuleRegistryDocument);
export const activeRuleArtifactPathFacts = activeRuleFacts.artifactPath;
export const activeRuleSelectorFacts = activeRuleFacts.selector;
export const activeRuleReportFacts = activeRuleFacts.report;
export const activeRuleBaselineFacts = activeRuleFacts.baseline;
export const activeRuleCommandExecutionFacts = activeRuleFacts.commandExecution;
export const activeRuleSourceFacts = activeRuleFacts.source;
export const activeRuleGritFacts = activeRuleFacts.grit;
export const activeRuleFileLayerFacts = activeRuleFacts.fileLayer;
export const activeRuleHookCheckFacts = activeRuleFacts.hookCheck;
export const activeRuleRoutingFacts = activeRuleFacts.routing;
export const activeRuleGraphFacts = activeRuleFacts.graph;

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

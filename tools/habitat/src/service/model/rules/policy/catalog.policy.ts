import { workspaceGraphTargetNames } from "@habitat/cli/service/model/workspace/index";
import type { RuleRegistryDocument } from "../dto/registry.schema.js";
import { ruleAuthorityPathFacts } from "./authority-paths.policy.js";
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
  ruleStructureFacts,
} from "./facts.policy.js";
import { ruleGraphFacts } from "./graph.policy.js";

export interface RuleFactsCatalog {
  readonly authorityPath: ReturnType<typeof ruleAuthorityPathFacts>;
  readonly selector: ReturnType<typeof ruleSelectorFacts>;
  readonly report: ReturnType<typeof ruleReportFacts>;
  readonly baseline: ReturnType<typeof ruleBaselineFacts>;
  readonly commandExecution: ReturnType<typeof ruleCommandExecutionFacts>;
  readonly source: ReturnType<typeof ruleSourceFacts>;
  readonly grit: ReturnType<typeof ruleGritFacts>;
  readonly structure: ReturnType<typeof ruleStructureFacts>;
  readonly fileLayer: ReturnType<typeof ruleFileLayerFacts>;
  readonly hookCheck: ReturnType<typeof ruleHookCheckFacts>;
  readonly routing: ReturnType<typeof ruleRoutingFacts>;
  readonly graph: ReturnType<typeof ruleGraphFacts>;
}

export function ruleFactsCatalog(document: RuleRegistryDocument): RuleFactsCatalog {
  const records = document.rules;
  return {
    authorityPath: ruleAuthorityPathFacts(records),
    selector: ruleSelectorFacts(records),
    report: ruleReportFacts(records),
    baseline: ruleBaselineFacts(records),
    commandExecution: ruleCommandExecutionFacts(records),
    source: ruleSourceFacts(records),
    grit: ruleGritFacts(records),
    structure: ruleStructureFacts(records),
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

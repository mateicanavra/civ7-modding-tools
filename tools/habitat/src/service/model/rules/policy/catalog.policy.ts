import { workspaceGraphTargetNames } from "@habitat/cli/service/model/workspace/index";
import { Context, Option } from "effect";
import type { RuleRegistryDocument } from "../dto/registry.schema.js";
import { ruleAuthorityPathFacts } from "./authority-paths.policy.js";
import {
  ruleBaselineFacts,
  ruleCommandExecutionFacts,
  ruleDiagnosticFacts,
  ruleFileLayerFacts,
  ruleGritFacts,
  ruleHookCheckFacts,
  ruleReportFacts,
  ruleRoutingFacts,
  ruleSelectorFacts,
  ruleStructureFacts,
} from "./facts.policy.js";
import { ruleGraphFacts } from "./graph.policy.js";

export interface RuleFactsCatalog {
  readonly authorityPath: Readonly<ReturnType<typeof ruleAuthorityPathFacts>>;
  readonly selector: Readonly<ReturnType<typeof ruleSelectorFacts>>;
  readonly report: Readonly<ReturnType<typeof ruleReportFacts>>;
  readonly baseline: Readonly<ReturnType<typeof ruleBaselineFacts>>;
  readonly commandExecution: Readonly<ReturnType<typeof ruleCommandExecutionFacts>>;
  readonly diagnostic: Readonly<ReturnType<typeof ruleDiagnosticFacts>>;
  readonly grit: Readonly<ReturnType<typeof ruleGritFacts>>;
  readonly structure: Readonly<ReturnType<typeof ruleStructureFacts>>;
  readonly fileLayer: Readonly<ReturnType<typeof ruleFileLayerFacts>>;
  readonly hookCheck: Readonly<ReturnType<typeof ruleHookCheckFacts>>;
  readonly routing: Readonly<ReturnType<typeof ruleRoutingFacts>>;
  readonly graph: Readonly<ReturnType<typeof ruleGraphFacts>>;
}

/** Immutable projection snapshot shared by rule selection and execution resources. */
export class RuleFacts extends Context.Tag("@habitat/cli/RuleFacts")<
  RuleFacts,
  RuleFactsCatalog
>() {}

export function ruleFactsCatalog(document: RuleRegistryDocument): RuleFactsCatalog {
  const records = document.rules;
  return deepFreeze({
    authorityPath: ruleAuthorityPathFacts(records),
    selector: ruleSelectorFacts(records),
    report: ruleReportFacts(records),
    baseline: ruleBaselineFacts(records),
    commandExecution: ruleCommandExecutionFacts(records),
    diagnostic: ruleDiagnosticFacts(records),
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
  });
}

function deepFreeze<T>(value: T): T {
  if (typeof value !== "object" || value === null || Object.isFrozen(value)) return value;
  for (const child of Object.values(value)) deepFreeze(child);
  return Object.freeze(value);
}

export function factsForRuleIds<T extends { id: string }>(
  facts: readonly T[],
  ruleIds: readonly string[]
): T[] {
  const byId = new Map(facts.map((fact) => [fact.id, fact]));
  return ruleIds.flatMap((ruleId) => Option.toArray(Option.fromNullable(byId.get(ruleId))));
}

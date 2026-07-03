import type { RuleSelectorFacts as RegistryRuleSelectorFacts } from "../dto/registry.schema.js";

export interface RuleSelection {
  owner?: string;
  rule?: string;
  rules?: readonly string[];
  runner?: string;
}

export type RuleSelectorKind = "owner" | "rule" | "runner";
export type RuleSelectionFailureReason =
  | "unknown-selector"
  | "wrong-selector-namespace"
  | "empty-selection";

export interface RuleSelectorFact {
  kind: RuleSelectorKind;
  requestedValue: string;
  known: boolean;
  matchedNamespace?: RuleSelectorKind;
  matchingRuleIds: string[];
}

export interface RuleSelectionEmptyIntersection {
  participants: RuleSelectorFact[];
  matchingRuleIdsBySelector: Record<string, string[]>;
}

export type RuleSelectionResult =
  | { ok: true; rules: RegistryRuleSelectorFacts[]; requested: RuleSelection }
  | {
      ok: false;
      requested: RuleSelection;
      reason: RuleSelectionFailureReason;
      selectorFacts: RuleSelectorFact[];
      emptyIntersection?: RuleSelectionEmptyIntersection;
      message: string;
    };

export function selectRules(
  selection: RuleSelection = {},
  registry: readonly RegistryRuleSelectorFacts[]
): RuleSelectionResult {
  const facts = selectorFacts(selection, registry);
  const wrongNamespace = facts.find((fact) => !fact.known && fact.matchedNamespace);
  if (wrongNamespace) {
    return {
      ok: false,
      requested: selection,
      reason: "wrong-selector-namespace",
      selectorFacts: facts,
      message: describeSelectorFacts([wrongNamespace]),
    };
  }

  const unknown = facts.find((fact) => !fact.known);
  if (unknown) {
    return {
      ok: false,
      requested: selection,
      reason: "unknown-selector",
      selectorFacts: facts,
      message: describeSelectorFacts([unknown]),
    };
  }

  const selectedRuleIds = filterRuleIds(selection, registry);
  const selected = selectedRuleIds
    .map((ruleId) => registry.find((rule) => rule.id === ruleId))
    .filter((rule): rule is RegistryRuleSelectorFacts => Boolean(rule));
  if (facts.length > 0 && selected.length === 0 && !isKnownEmptyRunnerSelection(facts)) {
    return {
      ok: false,
      requested: selection,
      reason: "empty-selection",
      selectorFacts: facts,
      emptyIntersection: {
        participants: facts,
        matchingRuleIdsBySelector: Object.fromEntries(
          facts.map((fact) => [selectorKey(fact), fact.matchingRuleIds])
        ),
      },
      message: `No Habitat rules match the requested selector combination: ${facts
        .map((fact) => `${selectorLabel(fact.kind)} ${JSON.stringify(fact.requestedValue)}`)
        .join(", ")}.`,
    };
  }

  return { ok: true, requested: selection, rules: selected };
}

export function describeRuleSelectionFailure(failure: { message: string }): string {
  return failure.message;
}

function filterRuleIds(
  selection: RuleSelection,
  registry: readonly RegistryRuleSelectorFacts[]
): string[] {
  let selected = [...registry];
  const requestedRules = ruleSelectorValues(selection);
  if (selection.owner) selected = selected.filter((rule) => rule.ownerProject === selection.owner);
  if (requestedRules.length > 0) {
    const requestedRuleSet = new Set(requestedRules);
    selected = selected.filter((rule) => requestedRuleSet.has(rule.id));
  }
  if (selection.runner) selected = selected.filter((rule) => rule.runner.name === selection.runner);
  return selected.map((rule) => rule.id);
}

function selectorFacts(
  selection: RuleSelection,
  registry: readonly RegistryRuleSelectorFacts[]
): RuleSelectorFact[] {
  const facts: RuleSelectorFact[] = [];
  if (selection.owner) facts.push(selectorFact("owner", selection.owner, registry));
  for (const ruleId of ruleSelectorValues(selection)) {
    facts.push(selectorFact("rule", ruleId, registry));
  }
  if (selection.runner) facts.push(selectorFact("runner", selection.runner, registry));
  return facts;
}

function ruleSelectorValues(selection: RuleSelection): string[] {
  return [...new Set([...(selection.rule ? [selection.rule] : []), ...(selection.rules ?? [])])];
}

function selectorFact(
  kind: RuleSelectorKind,
  requestedValue: string,
  registry: readonly RegistryRuleSelectorFacts[]
): RuleSelectorFact {
  const matchingRuleIds = matchingRulesForKind(kind, requestedValue, registry).map(
    (rule) => rule.id
  );
  const matchedNamespace =
    matchingRuleIds.length > 0 ? undefined : firstMatchingNamespace(kind, requestedValue, registry);
  return {
    kind,
    requestedValue,
    known: matchingRuleIds.length > 0 || isKnownRunnerSelector(kind, requestedValue),
    matchedNamespace,
    matchingRuleIds,
  };
}

const knownRunnerSelectors = new Set(["habitat", "nx", "grit"]);

function isKnownRunnerSelector(kind: RuleSelectorKind, value: string): boolean {
  return kind === "runner" && knownRunnerSelectors.has(value);
}

function isKnownEmptyRunnerSelection(facts: readonly RuleSelectorFact[]): boolean {
  return (
    facts.length === 1 &&
    facts[0]?.kind === "runner" &&
    facts[0].known &&
    facts[0].matchingRuleIds.length === 0
  );
}

function matchingRulesForKind(
  kind: RuleSelectorKind,
  value: string,
  registry: readonly RegistryRuleSelectorFacts[]
): RegistryRuleSelectorFacts[] {
  switch (kind) {
    case "owner":
      return registry.filter((rule) => rule.ownerProject === value);
    case "rule":
      return registry.filter((rule) => rule.id === value);
    case "runner":
      return registry.filter((rule) => rule.runner.name === value);
  }
}

function firstMatchingNamespace(
  requestedKind: RuleSelectorKind,
  value: string,
  registry: readonly RegistryRuleSelectorFacts[]
): RuleSelectorKind | undefined {
  return (["owner", "rule", "runner"] as const).find(
    (kind) => kind !== requestedKind && matchingRulesForKind(kind, value, registry).length > 0
  );
}

function selectorKey(fact: RuleSelectorFact): string {
  return `${fact.kind}:${fact.requestedValue}`;
}

function selectorLabel(kind: RuleSelectorKind): string {
  if (kind === "owner") return "owner id";
  if (kind === "rule") return "rule id";
  return "runner id";
}

function describeSelectorFacts(facts: RuleSelectorFact[]): string {
  return facts
    .map((fact) => {
      const label = selectorLabel(fact.kind);
      if (fact.matchedNamespace) {
        return `${JSON.stringify(fact.requestedValue)} is a known ${selectorLabel(
          fact.matchedNamespace
        )}, not a ${label}.`;
      }
      return `Unknown Habitat ${label}: ${JSON.stringify(fact.requestedValue)}.`;
    })
    .join(" ");
}

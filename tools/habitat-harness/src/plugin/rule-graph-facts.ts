import type { NxRuleRegistryRecord } from "../providers/nx/rule-registry-loader.ts";
import type { WorkspaceGraphTargetNames } from "../providers/nx/schema.ts";

type RuleGraphTargetNames = Pick<
  WorkspaceGraphTargetNames,
  "biomeCi" | "boundaries" | "generatedCheck" | "sourceCheck"
>;

export function ruleGraphFactsForNxPlugin(
  records: readonly NxRuleRegistryRecord[],
  ownerRoots: ReadonlyMap<string, string>,
  targetNames: RuleGraphTargetNames
): NxRuleGraphFacts[] {
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
      alias: ruleGraphAlias(rule, targetNames),
    };
  });
}

function ruleGraphAlias(
  rule: NxRuleRegistryRecord,
  targetNames: RuleGraphTargetNames
): NxRuleGraphFacts["alias"] {
  if (rule.id === "format-ci") {
    return {
      kind: "depends-on",
      target: { project: "@internal/habitat-harness", target: targetNames.biomeCi },
    };
  }
  if (rule.ownerTool === "nx") {
    if (!rule.graphTarget) {
      throw new Error(
        `Habitat graph metadata contract failure: missing graphTarget for nx rule '${rule.id}'.`
      );
    }
    return {
      kind: "depends-on",
      target: { ...rule.graphTarget },
    };
  }
  return { kind: "direct-rule-check" };
}

export interface NxRuleGraphFacts {
  readonly id: string;
  readonly ownerProject: string;
  readonly ownerRoot: string;
  readonly alias:
    | { readonly kind: "direct-rule-check" }
    | {
        readonly kind: "depends-on";
        readonly target: { readonly project: string; readonly target: string };
      };
}

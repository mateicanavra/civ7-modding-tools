import type {
  RuleGraphFacts,
  RuleRegistryRecordV1,
} from "@habitat/cli/service/model/rules/dto/registry.schema";
import type { WorkspaceGraphTargetNames } from "../../workspace/index.ts";

type RuleGraphTargetNames = Pick<
  WorkspaceGraphTargetNames,
  "biomeCi" | "boundaries" | "generatedCheck" | "sourceCheck"
>;

export function ruleGraphFactsForNxPlugin(
  records: readonly RuleRegistryRecordV1[],
  ownerRoots: ReadonlyMap<string, string>,
  targetNames: RuleGraphTargetNames
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
      alias: ruleGraphAlias(rule, targetNames),
    };
  });
}

function ruleGraphAlias(
  rule: RuleRegistryRecordV1,
  targetNames: RuleGraphTargetNames
): RuleGraphFacts["alias"] {
  if (rule.id === "format-ci") {
    return {
      kind: "depends-on",
      target: { project: "@habitat/cli", target: targetNames.biomeCi },
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

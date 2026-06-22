import {
  RuleGraphTargetNamesSchema,
  type WorkspaceGraphTargetNames,
} from "@internal/habitat-harness/providers/nx/schema";
import type { Static } from "typebox";
import { Value } from "typebox/value";
import type { RuleGraphFacts, RuleRegistryRecordV1 } from "./schema.js";

export function ruleGraphFacts(
  records: readonly RuleRegistryRecordV1[],
  ownerRoots: ReadonlyMap<string, string>,
  targetNames: RuleGraphTargetNames | WorkspaceGraphTargetNames
): RuleGraphFacts[] {
  const graphTargetNames = Value.Parse(
    RuleGraphTargetNamesSchema,
    Value.Clean(RuleGraphTargetNamesSchema, { ...targetNames })
  );
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
      alias: ruleGraphAlias(rule, graphTargetNames),
    };
  });
}

type RuleGraphTargetNames = Static<typeof RuleGraphTargetNamesSchema>;

function ruleGraphAlias(
  rule: RuleRegistryRecordV1,
  targetNames: RuleGraphTargetNames
): RuleGraphFacts["alias"] {
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

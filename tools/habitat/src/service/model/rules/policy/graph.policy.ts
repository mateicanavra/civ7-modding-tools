import {
  RuleGraphTargetNamesSchema,
  type WorkspaceGraphTargetNames,
} from "@habitat/cli/service/model/workspace/index";
import type { Static } from "typebox";
import { Value } from "typebox/value";
import type { RuleGraphFacts, RuleRegistryRecordV1 } from "../dto/registry.schema.js";

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
      lane: rule.lane,
      message: rule.message,
      alias: ruleGraphAlias(rule, graphTargetNames),
    };
  });
}

type RuleGraphTargetNames = Static<typeof RuleGraphTargetNamesSchema>;

function ruleGraphAlias(
  rule: RuleRegistryRecordV1,
  targetNames: RuleGraphTargetNames
): RuleGraphFacts["alias"] {
  if (rule.id === "enforce_formatting_and_import_hygiene") {
    return {
      kind: "depends-on",
      target: { project: "habitat", target: targetNames.biomeCi },
    };
  }
  if (rule.runner.name === "nx") {
    return {
      kind: "depends-on",
      target: { ...rule.runner.target },
    };
  }
  return { kind: "direct-rule-check" };
}

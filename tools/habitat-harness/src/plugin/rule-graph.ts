import type { RuleGraphFacts, RuleRegistryRecordV1 } from "../rules/registry/schema.js";

interface GraphTargetNames {
  boundaries: string;
  biomeCi: string;
  generatedCheck: string;
  gritCheck: string;
}

const DEFAULT_TARGET_NAMES: GraphTargetNames = {
  boundaries: "boundaries",
  biomeCi: "biome:ci",
  generatedCheck: "generated:check",
  gritCheck: "grit:check",
};

export function ruleGraphFacts(
  records: readonly RuleRegistryRecordV1[],
  ownerRoots: ReadonlyMap<string, string>,
  targetNames: GraphTargetNames = DEFAULT_TARGET_NAMES
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
  targetNames: GraphTargetNames
): RuleGraphFacts["alias"] {
  if (rule.id === "biome-ci") {
    return {
      kind: "depends-on",
      target: { project: "@internal/habitat-harness", target: targetNames.biomeCi },
    };
  }
  if (rule.id === "nx-boundaries") {
    return {
      kind: "depends-on",
      target: { project: "@internal/habitat-harness", target: targetNames.boundaries },
    };
  }
  if (rule.ownerTool === "grit-check") {
    return {
      kind: "depends-on",
      target: { project: "@internal/habitat-harness", target: targetNames.gritCheck },
    };
  }
  if (rule.ownerTool === "file-layer") {
    return {
      kind: "depends-on",
      target: { project: "@internal/habitat-harness", target: targetNames.generatedCheck },
    };
  }
  if (rule.ownerTool === "wrapped-test") {
    if (!rule.graphTarget) {
      throw new Error(
        `Habitat graph metadata contract failure: missing graphTarget for wrapped-test rule '${rule.id}'.`
      );
    }
    return {
      kind: "depends-on",
      target: { ...rule.graphTarget },
    };
  }
  return { kind: "direct-rule-check" };
}

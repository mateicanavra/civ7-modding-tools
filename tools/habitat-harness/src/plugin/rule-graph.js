/**
 * @typedef {import("../rules/registry/schema.js").RuleGraphFacts} RuleGraphFacts
 * @typedef {import("../rules/registry/schema.js").RuleRegistryRecordV1} RuleRegistryRecordV1
 * @typedef {{ project: string, target: string }} GraphTarget
 * @typedef {{ boundaries: string, biomeCi: string, generatedCheck: string, gritCheck: string }} GraphTargetNames
 */

const DEFAULT_TARGET_NAMES = {
  boundaries: "boundaries",
  biomeCi: "biome:ci",
  generatedCheck: "generated:check",
  gritCheck: "grit:check",
};

/**
 * @param {readonly RuleRegistryRecordV1[]} records
 * @param {ReadonlyMap<string, string>} ownerRoots
 * @param {GraphTargetNames} [targetNames]
 * @returns {RuleGraphFacts[]}
 */
export function ruleGraphFacts(records, ownerRoots, targetNames = DEFAULT_TARGET_NAMES) {
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

/**
 * @param {RuleRegistryRecordV1} rule
 * @param {GraphTargetNames} targetNames
 * @returns {RuleGraphFacts["alias"]}
 */
function ruleGraphAlias(rule, targetNames) {
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

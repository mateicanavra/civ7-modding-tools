import path from "node:path";
import { Value } from "typebox/value";
import { ruleRegistryRepoPath } from "../lib/artifact-paths.ts";
import { repoRoot } from "../lib/paths.ts";
import {
  WorkspaceGraphTargetNameOptionsSchema,
  WorkspaceGraphTargetNamesSchema,
} from "../lib/workspace-graph/schema.ts";
import { workspaceGraphTargetNames } from "../lib/workspace-graph-contract.ts";
import { ruleGraphFacts } from "../rules/registry/graph.ts";
import { loadRuleRegistryDocument } from "../rules/registry/load.ts";
import {
  type InferredProjects,
  InferredProjectsSchema,
  type NxTargetDefinition,
  NxTargetDefinitionSchema,
} from "./target-definition-schema.ts";
import {
  aggregateCheckTarget,
  aliasRuleTarget,
  biomeTargets,
  boundariesTarget,
  directRuleTarget,
  generatedCheckTarget,
  gritCheckTarget,
  habitatInputs,
  ownerCheckTarget,
} from "./target-definitions.ts";

const rulesPath = path.join(repoRoot, ruleRegistryRepoPath);
const rules = loadRuleRegistryDocument(rulesPath);

export const createNodesV2 = [
  `${ruleRegistryRepoPath}/**/*.json`,
  (configFiles: string[], options: unknown) => {
    const projects = buildInferredProjects({
      registry: rules,
      options,
    });
    return configFiles.map((configFile) => [configFile, { projects }]);
  },
];

function buildInferredProjects(input: {
  registry: typeof rules;
  options: unknown;
}): InferredProjects {
  const targetNames = Value.Parse(
    WorkspaceGraphTargetNamesSchema,
    workspaceGraphTargetNames(
      Value.Parse(WorkspaceGraphTargetNameOptionsSchema, input.options ?? {})
    )
  );
  const ownerRoots = new Map(Object.entries(input.registry.ownerRoots));
  const projects: InferredProjects = {};
  const addTarget = (
    root: string,
    _project: string,
    target: string,
    definition: NxTargetDefinition
  ) => {
    projects[root] ??= { targets: {} };
    projects[root].targets[target] = targetDefinition(definition);
  };

  addHarnessTargets({ addTarget, ownerRoots, targetNames });
  const inputs = habitatInputs();
  const graphFacts = ruleGraphFacts(input.registry.rules, ownerRoots, targetNames);
  for (const rule of graphFacts) addRuleTarget({ addTarget, inputs, rule, targetNames });
  for (const [owner, root] of ownerRootsForRules(graphFacts)) {
    addTarget(root, owner, targetNames.check, ownerCheckTarget(owner, inputs));
  }
  return Value.Parse(InferredProjectsSchema, projects);
}

function addHarnessTargets(input: {
  addTarget: (
    root: string,
    project: string,
    target: string,
    definition: NxTargetDefinition
  ) => void;
  ownerRoots: ReadonlyMap<string, string>;
  targetNames: ReturnType<typeof workspaceGraphTargetNames>;
}) {
  const harnessProject = "@internal/habitat-harness";
  const harnessRoot = input.ownerRoots.get(harnessProject);
  if (!harnessRoot) {
    throw new Error(
      `Habitat graph metadata contract failure: unknown ownerProject '${harnessProject}'.`
    );
  }
  const biome = biomeTargets();
  input.addTarget(harnessRoot, harnessProject, input.targetNames.biomeFormat, biome.format);
  input.addTarget(harnessRoot, harnessProject, input.targetNames.biomeCheck, biome.check);
  input.addTarget(harnessRoot, harnessProject, input.targetNames.biomeCi, biome.ci);
  input.addTarget(harnessRoot, harnessProject, input.targetNames.boundaries, boundariesTarget());
  input.addTarget(harnessRoot, harnessProject, input.targetNames.gritCheck, gritCheckTarget());
  input.addTarget(
    harnessRoot,
    harnessProject,
    input.targetNames.generatedCheck,
    generatedCheckTarget()
  );
  input.addTarget(
    harnessRoot,
    harnessProject,
    input.targetNames.aggregateCheck,
    aggregateCheckTarget()
  );
}

function addRuleTarget(input: {
  addTarget: (
    root: string,
    project: string,
    target: string,
    definition: NxTargetDefinition
  ) => void;
  inputs: string[];
  rule: ReturnType<typeof ruleGraphFacts>[number];
  targetNames: ReturnType<typeof workspaceGraphTargetNames>;
}) {
  const target = `${input.targetNames.rulePrefix}${input.rule.id}`;
  if (input.rule.alias.kind === "direct-rule-check") {
    input.addTarget(
      input.rule.ownerRoot,
      input.rule.ownerProject,
      target,
      directRuleTarget(input.rule.id, input.rule.ownerProject, input.inputs)
    );
    return;
  }
  const dependency = input.rule.alias.target;
  input.addTarget(
    input.rule.ownerRoot,
    input.rule.ownerProject,
    target,
    aliasRuleTarget(
      [{ projects: [dependency.project], target: dependency.target }],
      `Alias for ${dependency.project}:${dependency.target} (${input.rule.id})`
    )
  );
}

function ownerRootsForRules(rules: ReturnType<typeof ruleGraphFacts>): Map<string, string> {
  return new Map(rules.map((rule) => [rule.ownerProject, rule.ownerRoot]));
}

function targetDefinition(value: NxTargetDefinition): NxTargetDefinition {
  return Value.Parse(NxTargetDefinitionSchema, value);
}

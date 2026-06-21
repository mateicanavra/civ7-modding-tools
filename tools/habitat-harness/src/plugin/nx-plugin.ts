import path from "node:path";
import { Value } from "typebox/value";
import { ruleGraphFacts } from "../domains/rule-registry/graph.ts";
import { loadRuleRegistryDocument } from "../domains/rule-registry/load.ts";
import type { RuleRegistryRecordV1 } from "../domains/rule-registry/schema.js";
import { ruleRegistryRepoPath } from "../lib/artifact-paths.ts";
import { repoRoot } from "../lib/paths.ts";
import {
  WorkspaceGraphTargetNameOptionsSchema,
  WorkspaceGraphTargetNamesSchema,
} from "../providers/nx/schema.ts";
import { workspaceGraphTargetNames } from "../providers/nx/targets.ts";
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
  const recordsById = new Map(input.registry.rules.map((rule) => [rule.id, rule]));
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
  for (const rule of graphFacts) {
    const record = recordsById.get(rule.id);
    if (!record) {
      throw new Error(`Habitat graph metadata contract failure: missing rule record '${rule.id}'.`);
    }
    addRuleTarget({ addTarget, record, rule, targetNames });
  }
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
  record: RuleRegistryRecordV1;
  rule: ReturnType<typeof ruleGraphFacts>[number];
  targetNames: ReturnType<typeof workspaceGraphTargetNames>;
}) {
  const target = `${input.targetNames.rulePrefix}${input.rule.id}`;
  if (input.rule.alias.kind === "direct-rule-check") {
    input.addTarget(
      input.rule.ownerRoot,
      input.rule.ownerProject,
      target,
      directRuleTarget(
        input.rule.id,
        input.rule.ownerProject,
        inputsForRuleTarget(input.record, input.rule.ownerRoot)
      )
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

function inputsForRuleTarget(rule: RuleRegistryRecordV1, ownerRoot: string): string[] {
  const covered = pathCoverageInputs(rule.pathCoverage, ownerRoot);
  if (covered.kind === "workspace-gate") return habitatInputs();

  const inputs = new Set<string>([
    "{workspaceRoot}/tools/habitat-harness/src/**",
    "{workspaceRoot}/package.json",
    "{workspaceRoot}/bun.lock",
    `{workspaceRoot}/.habitat/rules/${rule.id}/**`,
    ...covered.inputs,
  ]);
  if (rule.ownerTool === "pattern-check") {
    inputs.add("{workspaceRoot}/.habitat/source-check/pattern-rules.mjs");
    for (const scanRoot of rule.scanRoots) inputs.add(workspaceInput(scanRoot));
    if (rule.manifestPath) inputs.add(workspaceInput(rule.manifestPath));
  }
  if (rule.ownerTool === "habitat" || rule.ownerTool === "command-check") {
    inputs.add("{workspaceRoot}/scripts/lint/**");
  }
  return [...inputs];
}

function pathCoverageInputs(
  coverage: RuleRegistryRecordV1["pathCoverage"],
  ownerRoot: string
): { kind: "scoped"; inputs: string[] } | { kind: "workspace-gate" } {
  const inputs: string[] = [];
  for (const entry of coverage) {
    switch (entry.kind) {
      case "exact-path":
        inputs.push(...entry.patterns.map(workspaceInput));
        break;
      case "project-owner":
        inputs.push(workspaceInput(`${ownerRoot}/**`));
        break;
      case "workspace-gate":
      case "unresolved-metadata":
        return { kind: "workspace-gate" };
    }
  }
  return { kind: "scoped", inputs };
}

function workspaceInput(repoRelativePath: string): string {
  return `{workspaceRoot}/${repoRelativePath}`;
}

function ownerRootsForRules(rules: ReturnType<typeof ruleGraphFacts>): Map<string, string> {
  return new Map(rules.map((rule) => [rule.ownerProject, rule.ownerRoot]));
}

function targetDefinition(value: NxTargetDefinition): NxTargetDefinition {
  return Value.Parse(NxTargetDefinitionSchema, value);
}

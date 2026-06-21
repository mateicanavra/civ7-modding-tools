import path from "node:path";
import { Value } from "typebox/value";
import {
  sourceCheckRuleModuleRepoPath,
  sourceCheckRuleRuntimeRepoPath,
} from "../domains/source-check/module-paths.ts";
import { ruleRegistryRepoPath } from "../lib/artifact-paths.ts";
import { repoRoot } from "../lib/paths.ts";
import {
  loadRuleRegistryDocumentForNxPlugin,
  type NxRuleRegistryDocument,
  type NxRuleRegistryRecord,
} from "../providers/nx/rule-registry-loader.ts";
import {
  WorkspaceGraphTargetNameOptionsSchema,
  WorkspaceGraphTargetNamesSchema,
} from "../providers/nx/schema.ts";
import { workspaceGraphTargetNames } from "../providers/nx/targets.ts";
import { ruleGraphFactsForNxPlugin } from "./rule-graph-facts.ts";
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
  habitatInputs,
  ownerCheckTarget,
  sourceCheckTarget,
} from "./target-definitions.ts";

const rulesPath = path.join(repoRoot, ruleRegistryRepoPath);

export const createNodesV2 = [
  `${ruleRegistryRepoPath}/**/*.json`,
  (configFiles: string[], options: unknown) => {
    const registry = loadRuleRegistryDocumentForNxPlugin(rulesPath);
    const projects = buildInferredProjects({
      registry,
      options,
    });
    const anchorConfigFile =
      configFiles.find((configFile) => configFile.endsWith("index.json")) ?? configFiles[0];
    return anchorConfigFile ? [[anchorConfigFile, { projects }]] : [];
  },
];

function buildInferredProjects(input: {
  registry: NxRuleRegistryDocument;
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
  projects[".habitat"] = { name: "@internal/habitat-artifacts", targets: {} };
  const addTarget = (
    root: string,
    _project: string,
    target: string,
    definition: NxTargetDefinition
  ) => {
    projects[root] ??= { targets: {} };
    projects[root].targets[target] = targetDefinition(definition);
  };

  addHarnessToolTargets({
    addTarget,
    ownerRoots,
    records: input.registry.rules,
    targetNames,
  });
  const graphFacts = ruleGraphFactsForNxPlugin(input.registry.rules, ownerRoots, targetNames);
  const recordsByOwner = new Map<string, NxRuleRegistryRecord[]>();
  for (const rule of graphFacts) {
    const record = recordsById.get(rule.id);
    if (!record) {
      throw new Error(`Habitat graph metadata contract failure: missing rule record '${rule.id}'.`);
    }
    appendMapValue(recordsByOwner, rule.ownerProject, record);
    addRuleTarget({ addTarget, record, rule, targetNames });
  }
  for (const [owner, root] of ownerRootsForRules(graphFacts)) {
    const records = recordsByOwner.get(owner) ?? [];
    addTarget(
      root,
      owner,
      targetNames.check,
      ownerCheckTarget(owner, inputsForOwner(records, root))
    );
  }
  return Value.Parse(InferredProjectsSchema, projects);
}

function addHarnessToolTargets(input: {
  addTarget: (
    root: string,
    project: string,
    target: string,
    definition: NxTargetDefinition
  ) => void;
  ownerRoots: ReadonlyMap<string, string>;
  records: readonly NxRuleRegistryRecord[];
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
  input.addTarget(
    harnessRoot,
    harnessProject,
    input.targetNames.sourceCheck,
    sourceCheckTarget(inputsForSourceCheckTarget(input.records))
  );
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
  record: NxRuleRegistryRecord;
  rule: ReturnType<typeof ruleGraphFactsForNxPlugin>[number];
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

function inputsForRuleTarget(rule: NxRuleRegistryRecord, ownerRoot: string): string[] {
  const covered = pathCoverageInputs(rule, ownerRoot);
  if (covered.kind === "workspace-gate") return habitatInputs();

  const inputs = new Set<string>([
    "{workspaceRoot}/package.json",
    "{workspaceRoot}/bun.lock",
    `{workspaceRoot}/.habitat/rules/${rule.id}/**`,
    ...covered.inputs,
  ]);
  if (rule.ownerProject === "@internal/habitat-harness") {
    inputs.add("{workspaceRoot}/tools/habitat-harness/src/**");
  }
  if (rule.ownerTool === "source-check") {
    inputs.add(workspaceInput(sourceCheckRuleRuntimeRepoPath));
    inputs.add(workspaceInput(sourceCheckRuleModuleRepoPath(rule.id)));
    for (const scanRoot of rule.scanRoots ?? []) inputs.add(workspaceScanRootInput(scanRoot));
    if (rule.manifestPath) inputs.add(workspaceInput(rule.manifestPath));
  }
  if (rule.ownerTool === "habitat" || rule.ownerTool === "command-check") {
    inputs.add("{workspaceRoot}/scripts/lint/**");
  }
  return [...inputs];
}

function inputsForOwner(rules: readonly NxRuleRegistryRecord[], ownerRoot: string): string[] {
  const inputs = new Set<string>();
  for (const rule of rules) {
    const ruleInputs = inputsForRuleTarget(rule, ownerRoot);
    if (sameInputSet(ruleInputs, habitatInputs())) return habitatInputs();
    for (const input of ruleInputs) inputs.add(input);
  }
  return inputs.size ? [...inputs] : habitatInputs();
}

function inputsForSourceCheckTarget(rules: readonly NxRuleRegistryRecord[]): string[] {
  const inputs = new Set<string>([
    "{workspaceRoot}/tools/habitat-harness/src/**",
    "{workspaceRoot}/package.json",
    "{workspaceRoot}/bun.lock",
    "{workspaceRoot}/.habitat/rules/**",
    workspaceInput(sourceCheckRuleRuntimeRepoPath),
  ]);
  for (const rule of rules) {
    if (rule.ownerTool !== "source-check") continue;
    inputs.add(workspaceInput(sourceCheckRuleModuleRepoPath(rule.id)));
    for (const scanRoot of rule.scanRoots ?? []) inputs.add(workspaceScanRootInput(scanRoot));
    if (rule.manifestPath) inputs.add(workspaceInput(rule.manifestPath));
  }
  return [...inputs];
}

function pathCoverageInputs(
  rule: NxRuleRegistryRecord,
  ownerRoot: string
): { kind: "scoped"; inputs: string[] } | { kind: "workspace-gate" } {
  const inputs: string[] = [];
  for (const entry of rule.pathCoverage) {
    switch (entry.kind) {
      case "exact-path":
        inputs.push(...entry.patterns.map(workspaceInput));
        break;
      case "project-owner":
        inputs.push(workspaceInput(`${ownerRoot}/**`));
        break;
      case "workspace-gate":
        return { kind: "workspace-gate" };
      case "unresolved-metadata":
        if (rule.ownerTool !== "source-check") inputs.push(workspaceInput(`${ownerRoot}/**`));
        break;
    }
  }
  return { kind: "scoped", inputs };
}

function workspaceInput(repoRelativePath: string): string {
  return `{workspaceRoot}/${repoRelativePath}`;
}

function workspaceScanRootInput(repoRelativePath: string): string {
  if (repoRelativePath.includes("*") || /\.[^/]+$/.test(repoRelativePath)) {
    return workspaceInput(repoRelativePath);
  }
  return workspaceInput(`${repoRelativePath}/**`);
}

function ownerRootsForRules(
  rules: ReturnType<typeof ruleGraphFactsForNxPlugin>
): Map<string, string> {
  return new Map(rules.map((rule) => [rule.ownerProject, rule.ownerRoot]));
}

function appendMapValue<T>(map: Map<string, T[]>, key: string, value: T): void {
  const values = map.get(key);
  if (values) {
    values.push(value);
    return;
  }
  map.set(key, [value]);
}

function sameInputSet(left: readonly string[], right: readonly string[]): boolean {
  if (left.length !== right.length) return false;
  const rightSet = new Set(right);
  return left.every((input) => rightSet.has(input));
}

function targetDefinition(value: NxTargetDefinition): NxTargetDefinition {
  return Value.Parse(NxTargetDefinitionSchema, value);
}

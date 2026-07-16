import fs from "node:fs";
import path from "node:path";
import type { CreateNodesV2 } from "@nx/devkit";
import { Value } from "typebox/value";
import {
  loadRuleRegistryDocumentForNxPlugin,
  type NxRuleRegistryDocument,
  type NxRuleRegistryRecord,
} from "./nx-rule-registry-loader.ts";
import {
  habitatAuthorityProjectName,
  habitatAuthorityRoot,
  ruleRegistryRepoPath,
} from "./resources/authority-paths.ts";
import { repoRoot } from "./resources/paths.ts";
import { ruleGraphFactsForNxPlugin } from "./service/model/graph/dto/rule-graph-facts.dto.ts";
import {
  type InferredProjects,
  InferredProjectsSchema,
  type NxTargetDefinition,
  NxTargetDefinitionSchema,
} from "./service/model/graph/dto/target-definition.schema.ts";
import {
  aliasRuleTarget,
  directRuleTarget,
  habitatInputs,
  ownerCheckTarget,
  ownerLocalCheckTarget,
} from "./service/model/graph/policy/target-definitions.policy.ts";
import {
  WorkspaceGraphTargetNameOptionsSchema,
  WorkspaceGraphTargetNamesSchema,
} from "./service/model/workspace/dto/workspace.schema.ts";
import { workspaceGraphTargetNames } from "./service/model/workspace/policy/workspace-targets.policy.ts";

const rulesPath = path.join(repoRoot, ruleRegistryRepoPath);

const harnessInternalBoundaryProjects = [
  {
    name: "habitat-cli",
    root: "tools/habitat/src/cli",
    tags: ["kind:tooling", "habitat:cli"],
  },
  {
    name: "habitat-service",
    root: "tools/habitat/src/service",
    tags: ["kind:tooling", "habitat:service", "layer:service-shell"],
  },
  {
    name: "habitat-service-model",
    root: "tools/habitat/src/service/model",
    tags: ["kind:tooling", "habitat:service", "layer:service-model"],
  },
  {
    name: "habitat-providers",
    root: "tools/habitat/src/providers",
    tags: ["kind:tooling", "habitat:runtime", "layer:resource-provider"],
  },
  {
    name: "habitat-resources",
    root: "tools/habitat/src/resources",
    tags: ["kind:tooling", "habitat:runtime", "layer:resource-provider"],
  },
  {
    name: "habitat-runtime",
    root: "tools/habitat/src/runtime",
    tags: ["kind:tooling", "habitat:runtime"],
  },
] as const;

export const createNodesV2 = [
  `${ruleRegistryRepoPath}/**/*.json`,
  (configFiles: readonly string[], options: unknown) => {
    const registry = loadRuleRegistryDocumentForNxPlugin(rulesPath);
    const projects = buildInferredProjects({
      registry,
      options,
    });
    const anchorConfigFile =
      configFiles.find((configFile) => configFile.endsWith("index.json")) ?? configFiles[0];
    return anchorConfigFile ? [[anchorConfigFile, { projects }]] : [];
  },
] satisfies CreateNodesV2;

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
  projects[habitatAuthorityRoot] = {
    name: habitatAuthorityProjectName,
    tags: ["kind:tooling"],
    targets: {},
  };
  addHarnessInternalBoundaryProjects(projects);
  const addTarget = (
    root: string,
    _project: string,
    target: string,
    definition: NxTargetDefinition
  ) => {
    projects[root] ??= { targets: {} };
    projects[root].targets[target] = targetDefinition(definition);
  };

  const graphFacts = ruleGraphFactsForNxPlugin(input.registry.rules, ownerRoots);
  for (const rule of graphFacts) {
    const record = recordsById.get(rule.id);
    if (!record) {
      throw new Error(`Habitat graph metadata contract failure: missing rule record '${rule.id}'.`);
    }
    assertRuleTargetsLeafWork(rule, targetNames);
    addRuleTarget({ addTarget, record, rule, targetNames });
  }
  const ownerEntries = [...ownerRootsForRules(graphFacts)].sort(([left], [right]) =>
    left.localeCompare(right)
  );
  for (const [owner, root] of ownerEntries) {
    const ownerFacts = graphFacts
      .filter((rule) => rule.ownerProject === owner)
      .sort((left, right) => left.id.localeCompare(right.id));
    const localRecords = ownerFacts.flatMap((rule) => {
      if (rule.alias.kind !== "direct-rule-check") return [];
      const record = recordsById.get(rule.id);
      if (!record) {
        throw new Error(`Habitat graph metadata contract failure: missing rule '${rule.id}'.`);
      }
      return [record];
    });
    const localRuleIds = ownerFacts.flatMap((rule) =>
      rule.alias.kind === "direct-rule-check" ? [rule.id] : []
    );
    const localTarget = `${targetNames.check}:local`;
    const [firstLocalRuleId, ...remainingLocalRuleIds] = localRuleIds;
    if (firstLocalRuleId) {
      addTarget(
        root,
        owner,
        localTarget,
        ownerLocalCheckTarget({
          owner,
          repoRoot,
          ruleIds: [firstLocalRuleId, ...remainingLocalRuleIds],
          inputs: inputsForOwner(localRecords, root),
          graphDependencies: ownerFacts.flatMap((rule) =>
            rule.alias.kind === "direct-rule-check"
              ? rule.graphDependencies.map((target) => ({
                  projects: [target.project],
                  target: target.target,
                }))
              : []
          ),
        })
      );
    }
    addTarget(
      root,
      owner,
      targetNames.check,
      ownerCheckTarget({
        owner,
        localTarget: localRuleIds.length > 0 ? localTarget : undefined,
        graphDependencies: ownerFacts.flatMap((rule) =>
          rule.alias.kind === "depends-on"
            ? [rule.alias.target, ...rule.graphDependencies].map((target) => ({
                projects: [target.project],
                target: target.target,
              }))
            : []
        ),
      })
    );
  }
  return Value.Parse(InferredProjectsSchema, projects);
}

function assertRuleTargetsLeafWork(
  rule: ReturnType<typeof ruleGraphFactsForNxPlugin>[number],
  targetNames: ReturnType<typeof workspaceGraphTargetNames>
): void {
  const generatedRoutingTargets = new Set([
    "check",
    targetNames.check,
    `${targetNames.check}:local`,
  ]);
  const targets = [
    ...(rule.alias.kind === "depends-on" ? [rule.alias.target] : []),
    ...rule.graphDependencies,
  ];
  for (const target of targets) {
    if (
      !generatedRoutingTargets.has(target.target) &&
      !target.target.startsWith(targetNames.rulePrefix)
    ) {
      continue;
    }
    throw new Error(
      `Habitat graph metadata contract failure: rule '${rule.id}' must target leaf work, not generated routing target '${target.project}:${target.target}'.`
    );
  }
}

function addHarnessInternalBoundaryProjects(projects: InferredProjects): void {
  for (const project of [...harnessInternalBoundaryProjects, ...harnessServiceModuleProjects()]) {
    projects[project.root] = {
      name: project.name,
      tags: [...project.tags],
      targets: {},
    };
  }
}

function harnessServiceModuleProjects(): Array<{
  name: string;
  root: string;
  tags: readonly string[];
}> {
  const modulesRoot = "tools/habitat/src/service/modules";
  const absoluteModulesRoot = path.join(repoRoot, modulesRoot);
  if (!fs.existsSync(absoluteModulesRoot)) return [];
  return fs
    .readdirSync(absoluteModulesRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => ({
      name: `habitat-service-${entry.name}`,
      root: `${modulesRoot}/${entry.name}`,
      tags: ["kind:tooling", "habitat:service", "layer:service-module"] as const,
    }));
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
        repoRoot,
        inputsForRuleTarget(input.record, input.rule.ownerRoot),
        input.rule.graphDependencies.map((target) => ({
          projects: [target.project],
          target: target.target,
        }))
      )
    );
    return;
  }
  const dependencies = [input.rule.alias.target, ...input.rule.graphDependencies];
  input.addTarget(
    input.rule.ownerRoot,
    input.rule.ownerProject,
    target,
    aliasRuleTarget(
      dependencies.map((target) => ({ projects: [target.project], target: target.target })),
      `Alias for ${input.rule.alias.target.project}:${input.rule.alias.target.target} (${input.rule.id})`
    )
  );
}

function inputsForRuleTarget(rule: NxRuleRegistryRecord, ownerRoot: string): string[] {
  const covered = pathCoverageInputs(rule, ownerRoot);
  if (covered.kind === "workspace-gate") return habitatInputs();

  const inputs = new Set<string>(["{workspaceRoot}/.habitat/**", ...covered.inputs]);
  if (rule.manifestFilePath) inputs.add(workspaceInput(rule.manifestFilePath));
  if (rule.supportFiles?.baseline) inputs.add(workspaceInput(rule.supportFiles.baseline));
  if (rule.supportFiles?.ruleIntroductionManifest) {
    inputs.add(workspaceInput(rule.supportFiles.ruleIntroductionManifest));
  }
  if (isPatternBackedRule(rule)) {
    inputs.add(workspaceInput(rule.runner.files.pattern));
    if (rule.runner.fix) inputs.add(workspaceInput(rule.runner.fix.pattern));
    for (const scopeInput of gritRuleScopeInputs(rule)) inputs.add(scopeInput);
  }
  if (rule.runner.name === "habitat" && rule.runner.mode === "structure") {
    inputs.add(workspaceInput(rule.runner.files.structure));
  }
  if (rule.runner.name === "habitat" && rule.runner.mode === "script") {
    inputs.add(workspaceInput(rule.runner.files.script));
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

type PatternBackedRegistryRecord =
  Extract<NxRuleRegistryRecord["runner"], { name: "grit" }> extends infer GritRunner
    ? NxRuleRegistryRecord & { runner: GritRunner; scanRoots?: string[] }
    : never;

function gritRuleScopeInputs(rule: PatternBackedRegistryRecord): string[] {
  const exactPathInputs = rule.pathCoverage.flatMap((entry) =>
    entry.kind === "exact-path" ? entry.patterns.map(workspaceInput) : []
  );
  if (exactPathInputs.length > 0) return exactPathInputs;
  return (rule.scanRoots ?? []).map(workspaceScanRootInput);
}

function isPatternBackedRule(rule: NxRuleRegistryRecord): rule is PatternBackedRegistryRecord {
  return rule.runner.name === "grit";
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
        if (rule.runner.name !== "grit") inputs.push(workspaceInput(`${ownerRoot}/**`));
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

function sameInputSet(left: readonly string[], right: readonly string[]): boolean {
  if (left.length !== right.length) return false;
  const rightSet = new Set(right);
  return left.every((input) => rightSet.has(input));
}

function targetDefinition(value: NxTargetDefinition): NxTargetDefinition {
  return Value.Parse(NxTargetDefinitionSchema, value);
}

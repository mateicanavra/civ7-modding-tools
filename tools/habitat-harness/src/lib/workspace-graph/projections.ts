import { Value } from "typebox/value";
import type { RuleGraphFacts } from "../../rules/registry/schema.js";
import {
  explicitProjectTargetDependency,
  graphRefusalMessage,
  resolveTargetDependencyDeclaration,
  sameProjectTargetDependency,
} from "./dependencies.js";
import {
  type AggregateWorkspaceTargetDeclaration,
  type GraphRefusalState,
  type ResolvedTargetDependency,
  type TargetDependencyDeclaration,
  type TargetDependencyResolution,
  type VerifyTargetPlan,
  VerifyTargetPlanSchema,
  type WorkspaceGraphTargetNames,
  type WorkspaceProject,
  type WorkspaceTargetState,
  WorkspaceTargetStateSchema,
} from "./schema.js";
import {
  classifyTargetNames,
  verifyTargetNames,
  workspaceGraphTargetNames,
} from "./target-names.js";

export function findWorkspaceOwningProject(
  repoRelativePath: string,
  projects: readonly WorkspaceProject[]
): WorkspaceProject | undefined {
  return projects
    .filter(
      (project) =>
        repoRelativePath === project.root || repoRelativePath.startsWith(`${project.root}/`)
    )
    .sort((a, b) => b.root.length - a.root.length || a.name.localeCompare(b.name))[0];
}

export function workspaceProjectHasTarget(project: WorkspaceProject, targetName: string): boolean {
  return project.targets.some((target) => target.name === targetName);
}

export function projectTargetStates(project: WorkspaceProject): WorkspaceTargetState[] {
  return classifyTargetNames().map((target) =>
    workspaceProjectHasTarget(project, target)
      ? parseTargetState({
          kind: "available-project-target",
          project: project.name,
          projectRoot: project.root,
          target,
          command: `nx run ${project.name}:${target}`,
        })
      : parseTargetState({
          kind: "unavailable-project-target",
          project: project.name,
          projectRoot: project.root,
          target,
          reason: "missing-target",
        })
  );
}

export function workspaceTargetStates(
  projects: readonly WorkspaceProject[] = [],
  targetNames: WorkspaceGraphTargetNames = workspaceGraphTargetNames(),
  declarations: readonly AggregateWorkspaceTargetDeclaration[] = []
): WorkspaceTargetState[] {
  return [
    parseTargetState({
      kind: "aggregate-workspace-target",
      target: targetNames.lint,
      command: "bun run lint",
      dependencies: [],
    }),
    ...declarations.map((declaration) => aggregateTargetState(declaration, projects)),
  ];
}

export function ruleAliasTargetState(input: {
  projects: readonly WorkspaceProject[];
  rule: RuleGraphFacts;
  targetNames?: WorkspaceGraphTargetNames;
}): WorkspaceTargetState | undefined {
  if (input.rule.alias.kind === "direct-rule-check") return undefined;
  const targetNames = input.targetNames ?? workspaceGraphTargetNames();
  const target = `${targetNames.rulePrefix}${input.rule.id}`;
  const declaration = ruleDependencyDeclaration(input.rule, targetNames);
  const dependencies = resolveTargetDependencyDeclaration(declaration, {
    declaringProject: input.rule.ownerProject,
    projects: input.projects,
  });
  const refusal = unresolvedTargetState(dependencies, target, input.rule.ownerProject);
  if (refusal) return refusal;
  const resolved = resolvedDependencies(dependencies);
  const dependency = resolved[0];
  if (!dependency) {
    return parseTargetState({
      kind: "graph-refusal",
      reason: "unresolved-alias-dependency",
      target,
      project: input.rule.ownerProject,
      message: "Workspace graph refusal: alias target has no resolved dependency.",
    });
  }
  return parseTargetState({
    kind: "alias-target",
    project: input.rule.ownerProject,
    projectRoot: input.rule.ownerRoot,
    target,
    dependency,
  });
}

export function verifyTargetPlan(
  projects: readonly WorkspaceProject[] = [],
  targetNames: WorkspaceGraphTargetNames = workspaceGraphTargetNames(),
  declarations: readonly AggregateWorkspaceTargetDeclaration[] = [],
  rules: readonly RuleGraphFacts[] = []
): VerifyTargetPlan {
  const states = [
    ...verifyProjectTargetStates(projects, targetNames),
    ...declarations.map((declaration) => aggregateTargetState(declaration, projects)),
    ...ruleGraphTargetStates({ projects, rules, targetNames }),
  ];
  const refusal = firstGraphRefusal(states);
  if (refusal) {
    return Value.Parse(VerifyTargetPlanSchema, {
      kind: "verify-target-plan-refused",
      refusal,
      targets: availableVerifyTargetNames(states),
    });
  }
  return Value.Parse(VerifyTargetPlanSchema, {
    kind: "verify-target-plan",
    targets: availableVerifyTargetNames(states),
    states,
  });
}

export function ruleGraphTargetStates(input: {
  projects: readonly WorkspaceProject[];
  rules: readonly RuleGraphFacts[];
  targetNames?: WorkspaceGraphTargetNames;
}): WorkspaceTargetState[] {
  const targetNames = input.targetNames ?? workspaceGraphTargetNames();
  return input.rules.flatMap((rule) => {
    const state = ruleAliasTargetState({ projects: input.projects, rule, targetNames });
    return state ? [state] : [];
  });
}

function aggregateTargetState(
  declaration: AggregateWorkspaceTargetDeclaration,
  projects: readonly WorkspaceProject[]
): WorkspaceTargetState {
  const target = declaration.declaration.target;
  const dependencies = resolveTargetDependencyDeclaration(declaration.declaration, {
    declaringProject: "",
    projects,
  });
  return (
    unresolvedTargetState(dependencies, target) ??
    parseTargetState({
      kind: "aggregate-workspace-target",
      target,
      command: declaration.command,
      dependencies: resolvedDependencies(dependencies),
    })
  );
}

function verifyProjectTargetStates(
  projects: readonly WorkspaceProject[],
  targetNames: WorkspaceGraphTargetNames
): WorkspaceTargetState[] {
  const requiredGraphTargets = new Set([
    targetNames.boundaries,
    targetNames.biomeCi,
    targetNames.generatedCheck,
    targetNames.gritCheck,
  ]);
  return verifyTargetNames(targetNames).flatMap((target) => {
    const owners = projects.filter((project) => workspaceProjectHasTarget(project, target));
    if (owners.length > 0) {
      return owners.map((project) =>
        parseTargetState({
          kind: "available-project-target",
          project: project.name,
          projectRoot: project.root,
          target,
          command: `nx run ${project.name}:${target}`,
        })
      );
    }
    if (!requiredGraphTargets.has(target)) return [];
    return [
      parseTargetState({
        kind: "graph-refusal",
        reason: "missing-target",
        target,
        message: `Workspace graph refusal: no project exposes target '${target}'.`,
      }),
    ];
  });
}

function ruleDependencyDeclaration(
  rule: RuleGraphFacts,
  targetNames: WorkspaceGraphTargetNames
): TargetDependencyDeclaration {
  if (rule.alias.kind === "direct-rule-check") {
    throw new Error(`Rule '${rule.id}' does not declare a graph dependency.`);
  }
  if (rule.id === "nx-boundaries") return sameProjectTargetDependency(targetNames.boundaries);
  return explicitProjectTargetDependency(rule.alias.target.project, rule.alias.target.target);
}

function unresolvedTargetState(
  dependencies: readonly TargetDependencyResolution[],
  target: string,
  project?: string
): WorkspaceTargetState | undefined {
  const unresolved = dependencies.find(
    (dependency) => dependency.kind === "unresolved-target-dependency"
  );
  if (!unresolved) return undefined;
  return parseTargetState({
    kind: "graph-refusal",
    reason: "unresolved-alias-dependency",
    target,
    project: project ?? unresolved.project,
    message: graphRefusalMessage(unresolved),
  });
}

function firstGraphRefusal(states: readonly WorkspaceTargetState[]): GraphRefusalState | undefined {
  return states.find((state): state is GraphRefusalState => state.kind === "graph-refusal");
}

function availableVerifyTargetNames(states: readonly WorkspaceTargetState[]): string[] {
  return [
    ...new Set(
      states.flatMap((state) =>
        state.kind === "available-project-target" || state.kind === "aggregate-workspace-target"
          ? [state.target]
          : []
      )
    ),
  ];
}

function resolvedDependencies(
  dependencies: readonly TargetDependencyResolution[]
): ResolvedTargetDependency[] {
  return dependencies.filter(
    (dependency): dependency is ResolvedTargetDependency =>
      dependency.kind === "resolved-target-dependency"
  );
}

function parseTargetState(value: WorkspaceTargetState): WorkspaceTargetState {
  return Value.Parse(WorkspaceTargetStateSchema, value);
}

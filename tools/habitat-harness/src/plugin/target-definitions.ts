import type { NxTargetDefinition } from "./target-definition-schema.js";

const workspaceCwd = { cwd: "{workspaceRoot}" };

export function habitatInputs(): string[] {
  return [
    "{workspaceRoot}/tools/habitat-harness/src/**",
    "{workspaceRoot}/tools/habitat-harness/baselines/**",
    "{workspaceRoot}/.grit/patterns/habitat/**",
    "{workspaceRoot}/.grit/grit.yaml",
    "{workspaceRoot}/.gritignore",
    "{workspaceRoot}/package.json",
    "{workspaceRoot}/bun.lock",
    "{workspaceRoot}/scripts/lint/**",
    "{workspaceRoot}/packages/**",
    "{workspaceRoot}/apps/**",
    "{workspaceRoot}/mods/**",
    "{workspaceRoot}/docs/**",
  ];
}

export function biomeTargets(): {
  format: NxTargetDefinition;
  check: NxTargetDefinition;
  ci: NxTargetDefinition;
} {
  const inputs = [
    "{workspaceRoot}/biome.json",
    "{workspaceRoot}/bun.lock",
    "{workspaceRoot}/package.json",
    "{workspaceRoot}/apps/**",
    "{workspaceRoot}/packages/**",
    "{workspaceRoot}/mods/**",
    "{workspaceRoot}/tools/**",
    "{workspaceRoot}/scripts/**",
    "{workspaceRoot}/docs/**",
    "{workspaceRoot}/vitest.config.ts",
  ];
  return {
    format: {
      command: "biome format --write .",
      options: workspaceCwd,
      cache: false,
      inputs,
      metadata: { description: "Biome formatter write pass for the repo hygiene layer (H4)" },
    },
    check: {
      command: "biome check .",
      options: workspaceCwd,
      cache: true,
      inputs,
      metadata: { description: "Biome formatter, lint hygiene, and safe-assist check (H4)" },
    },
    ci: {
      command: "biome ci .",
      options: workspaceCwd,
      cache: true,
      inputs,
      metadata: { description: "Biome CI gate for hygiene-layer enforcement (H4)" },
    },
  };
}

export function boundariesTarget(): NxTargetDefinition {
  return {
    command:
      "FORCE_COLOR=0 eslint . --quiet --config eslint.boundaries.config.mjs --no-config-lookup",
    options: workspaceCwd,
    cache: true,
    inputs: habitatInputs(),
    metadata: {
      description:
        "project-plane module boundaries via @nx/enforce-module-boundaries (habitat-boundary-tags/H3)",
    },
  };
}

export function gritCheckTarget(): NxTargetDefinition {
  return {
    command: "bun tools/habitat-harness/bin/dev.ts check --tool grit-check",
    options: workspaceCwd,
    cache: true,
    inputs: habitatInputs(),
    metadata: {
      description: "Habitat-owned GritQL source-shape catalog (habitat-grit-catalog/H5)",
    },
  };
}

export function generatedCheckTarget(): NxTargetDefinition {
  return {
    command: "bun tools/habitat-harness/bin/dev.ts check --tool file-layer",
    options: workspaceCwd,
    cache: false,
    inputs: habitatInputs(),
    metadata: { description: "Habitat file-layer structural gate" },
  };
}

export function aggregateCheckTarget(inputs = habitatInputs()): NxTargetDefinition {
  return {
    command: "bun tools/habitat-harness/bin/dev.ts check",
    options: workspaceCwd,
    cache: true,
    inputs,
    metadata: { description: "aggregate Habitat rule check; runs broad native-tool checks once" },
  };
}

export function aliasRuleTarget(
  dependsOn: NxTargetDefinition["dependsOn"],
  description: string
): NxTargetDefinition {
  return {
    command: 'node -e ""',
    options: workspaceCwd,
    cache: false,
    outputs: [],
    dependsOn,
    metadata: { description },
  };
}

export function directRuleTarget(
  ruleId: string,
  ownerProject: string,
  inputs = habitatInputs()
): NxTargetDefinition {
  return {
    command: `bun tools/habitat-harness/bin/dev.ts check --rule ${ruleId}`,
    options: workspaceCwd,
    cache: true,
    inputs,
    metadata: { description: `Habitat rule ${ruleId} owned by ${ownerProject}` },
  };
}

export function ownerCheckTarget(owner: string, inputs = habitatInputs()): NxTargetDefinition {
  return {
    command: `bun tools/habitat-harness/bin/dev.ts check --owner ${owner}`,
    options: workspaceCwd,
    cache: true,
    inputs,
    metadata: {
      description: `habitat rules owned by ${owner} (wrapped enforcement; see docs/projects/habitat-harness/)`,
    },
  };
}

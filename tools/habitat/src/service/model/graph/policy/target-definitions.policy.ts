import type { NxTargetDefinition } from "../dto/target-definition.schema.js";

const workspaceCwd = { cwd: "{workspaceRoot}" };

export function habitatInputs(): string[] {
  return [
    "{workspaceRoot}/.habitat/**",
    "{workspaceRoot}/tools/habitat/src/**",
    "{workspaceRoot}/.grit/grit.yaml",
    "{workspaceRoot}/.grit/patterns",
    "{workspaceRoot}/package.json",
    "{workspaceRoot}/bun.lock",
    "{workspaceRoot}/packages/**",
    "{workspaceRoot}/apps/**",
    "{workspaceRoot}/mods/**",
    "{workspaceRoot}/docs/**",
  ];
}

export function boundaryInputs(): string[] {
  const sourceInputs = [
    "{workspaceRoot}/apps/**/*.cjs",
    "{workspaceRoot}/apps/**/*.cts",
    "{workspaceRoot}/apps/**/*.js",
    "{workspaceRoot}/apps/**/*.jsx",
    "{workspaceRoot}/apps/**/*.mjs",
    "{workspaceRoot}/apps/**/*.mts",
    "{workspaceRoot}/apps/**/*.ts",
    "{workspaceRoot}/apps/**/*.tsx",
    "{workspaceRoot}/mods/**/*.cjs",
    "{workspaceRoot}/mods/**/*.cts",
    "{workspaceRoot}/mods/**/*.js",
    "{workspaceRoot}/mods/**/*.jsx",
    "{workspaceRoot}/mods/**/*.mjs",
    "{workspaceRoot}/mods/**/*.mts",
    "{workspaceRoot}/mods/**/*.ts",
    "{workspaceRoot}/mods/**/*.tsx",
    "{workspaceRoot}/packages/**/*.cjs",
    "{workspaceRoot}/packages/**/*.cts",
    "{workspaceRoot}/packages/**/*.js",
    "{workspaceRoot}/packages/**/*.jsx",
    "{workspaceRoot}/packages/**/*.mjs",
    "{workspaceRoot}/packages/**/*.mts",
    "{workspaceRoot}/packages/**/*.ts",
    "{workspaceRoot}/packages/**/*.tsx",
    "{workspaceRoot}/scripts/**/*.cjs",
    "{workspaceRoot}/scripts/**/*.cts",
    "{workspaceRoot}/scripts/**/*.js",
    "{workspaceRoot}/scripts/**/*.jsx",
    "{workspaceRoot}/scripts/**/*.mjs",
    "{workspaceRoot}/scripts/**/*.mts",
    "{workspaceRoot}/scripts/**/*.ts",
    "{workspaceRoot}/scripts/**/*.tsx",
    "{workspaceRoot}/tools/**/*.cjs",
    "{workspaceRoot}/tools/**/*.cts",
    "{workspaceRoot}/tools/**/*.js",
    "{workspaceRoot}/tools/**/*.jsx",
    "{workspaceRoot}/tools/**/*.mjs",
    "{workspaceRoot}/tools/**/*.mts",
    "{workspaceRoot}/tools/**/*.ts",
    "{workspaceRoot}/tools/**/*.tsx",
    "!{workspaceRoot}/**/dist/**",
    "!{workspaceRoot}/**/types/**",
    "!{workspaceRoot}/**/mod/**",
    "!{workspaceRoot}/**/example-generated-mod/**",
  ];
  return [
    "{workspaceRoot}/eslint.boundaries.config.mjs",
    "{workspaceRoot}/nx.json",
    "{workspaceRoot}/package.json",
    "{workspaceRoot}/bun.lock",
    "{workspaceRoot}/docs/projects/habitat-harness/taxonomy.md",
    "{workspaceRoot}/apps/**/package.json",
    "{workspaceRoot}/mods/**/package.json",
    "{workspaceRoot}/packages/**/package.json",
    "{workspaceRoot}/tools/**/package.json",
    ...sourceInputs,
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
      "FORCE_COLOR=0 eslint . --quiet --cache --cache-strategy content --cache-location .nx/cache/eslint-boundaries --config eslint.boundaries.config.mjs --no-config-lookup",
    options: workspaceCwd,
    cache: true,
    inputs: boundaryInputs(),
    metadata: {
      description:
        "project-plane module boundaries via @nx/enforce-module-boundaries (habitat-boundary-tags/H3)",
    },
  };
}

export function sourceCheckTarget(inputs = habitatInputs()): NxTargetDefinition {
  return {
    command: "bun tools/habitat/bin/dev.ts check --tool source-check",
    options: workspaceCwd,
    cache: true,
    inputs,
    metadata: {
      description: "Habitat-owned GritQL source-shape catalog (habitat-catalog/H5)",
    },
  };
}

export function generatedCheckTarget(): NxTargetDefinition {
  return {
    command: "bun tools/habitat/bin/dev.ts check --tool file-layer",
    options: workspaceCwd,
    cache: false,
    inputs: habitatInputs(),
    metadata: { description: "Habitat file-layer structural gate" },
  };
}

export function aggregateCheckTarget(inputs = habitatInputs()): NxTargetDefinition {
  return {
    command: "bun tools/habitat/bin/dev.ts check",
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
    command: `bun tools/habitat/bin/dev.ts check --rule ${ruleId}`,
    options: workspaceCwd,
    cache: true,
    inputs,
    metadata: { description: `Habitat rule ${ruleId} owned by ${ownerProject}` },
  };
}

export function ownerCheckTarget(owner: string, inputs = habitatInputs()): NxTargetDefinition {
  return {
    command: `bun tools/habitat/bin/dev.ts check --owner ${owner}`,
    options: workspaceCwd,
    cache: true,
    inputs,
    metadata: {
      description: `habitat rules owned by ${owner} (wrapped enforcement; see docs/projects/habitat-harness/)`,
    },
  };
}

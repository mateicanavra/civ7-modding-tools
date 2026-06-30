import path from "node:path";
import { type Tree } from "@nx/devkit";
import { Value } from "typebox/value";
import { scaffoldRefusal } from "../scaffolding/refusal.ts";
import {
  type ProjectScaffoldDecision,
  ProjectScaffoldDecisionSchema,
  type SupportedProjectKind,
  SupportedProjectKindSchema,
} from "../scaffolding/schema.ts";
import { findPackageNameCollision } from "./package-scan.ts";
import {
  type HabitatProjectGeneratorOptions,
  HabitatProjectGeneratorOptionsSchema,
} from "./schema.ts";

const PROJECT_KIND_CONTRACTS = {
  plugin: {
    tag: "kind:plugin",
    rootForName: (name: string) => `packages/plugins/${pluginSlugForName(name)}`,
    packageNameForName: (name: string) => pluginSlugForName(name),
  },
} as const;

export function decideProjectScaffold(
  tree: Tree,
  rawOptions: HabitatProjectGeneratorOptions
): ProjectScaffoldDecision {
  const parsed = Value.Parse(HabitatProjectGeneratorOptionsSchema, rawOptions);
  const kind = normalizeProjectKind(parsed.kind);
  if (kind === null) return unsupportedProjectKindDecision(parsed.kind);

  const name = slugify(parsed.name);
  const contract = PROJECT_KIND_CONTRACTS[kind];
  const expectedRoot = contract.rootForName(name);
  const expectedPackageName = contract.packageNameForName(name);
  const root = normalizePath(parsed.directory ?? expectedRoot);
  const packageName = parsed.packageName ?? expectedPackageName;

  if (root !== expectedRoot) {
    return refuse("root-mismatch", {
      blockedAction: `create ${kind} project '${name}'`,
      requestClass: "supported-project-scaffold",
      recovery: `Use root '${expectedRoot}' for kind:${kind}.`,
      retryCondition: "Retry with the canonical root or omit the directory option.",
    });
  }
  if (packageName !== expectedPackageName) {
    return refuse("package-name-mismatch", {
      blockedAction: `create ${kind} project '${name}'`,
      requestClass: "supported-project-scaffold",
      recovery: `Use package name '${expectedPackageName}' for kind:${kind}.`,
      retryCondition: "Retry with the canonical package name or omit the packageName option.",
    });
  }
  if (tree.exists(root) && tree.children(root).length > 0) {
    return refuse("non-empty-root", {
      blockedAction: `create ${kind} project '${name}'`,
      requestClass: "supported-project-scaffold",
      recovery: `Choose an empty target root; '${root}' already contains files.`,
      retryCondition: "Retry after choosing a new name or intentionally clearing the target root.",
    });
  }

  const packageNameCollision = findPackageNameCollision(tree, packageName, root);
  if (packageNameCollision) {
    return refuse("package-name-collision", {
      blockedAction: `create ${kind} project '${name}'`,
      requestClass: "supported-project-scaffold",
      recovery: `Choose a project name whose package name does not collide with ${packageNameCollision}.`,
      retryCondition:
        "Retry after choosing a new name or removing the stale package intentionally.",
    });
  }

  const request = {
    kind: "supported-project-scaffold" as const,
    projectKind: kind,
    name,
    root,
    packageName,
    tag: contract.tag,
  };
  const writeSet = projectScaffoldWriteSet(root);

  return Value.Parse(ProjectScaffoldDecisionSchema, {
    kind: "write-project-scaffold",
    request,
    writeSet,
  });
}

export { PROJECT_KIND_CONTRACTS };

function unsupportedProjectKindDecision(kindInput: string): ProjectScaffoldDecision {
  const normalizedKind = normalizeKindInput(kindInput);

  return Value.Parse(ProjectScaffoldDecisionSchema, {
    kind: "refuse-scaffold",
    refusal: scaffoldRefusal({
      blockedAction: `create unsupported project kind '${normalizedKind}'`,
      requestClass: "unsupported-project-kind",
      reason: "unsupported-project-kind",
      recovery: "Use plugin.",
      retryCondition: "Retry with kind plugin.",
    }),
  });
}

function refuse(
  reason: "root-mismatch" | "package-name-mismatch" | "non-empty-root" | "package-name-collision",
  input: {
    blockedAction: string;
    requestClass: "supported-project-scaffold";
    recovery: string;
    retryCondition: string;
  }
): ProjectScaffoldDecision {
  return Value.Parse(ProjectScaffoldDecisionSchema, {
    kind: "refuse-scaffold",
    refusal: scaffoldRefusal({
      ...input,
      reason,
    }),
  });
}

function projectScaffoldWriteSet(root: string): string[] {
  return [
    path.posix.join(root, "package.json"),
    path.posix.join(root, "tsconfig.json"),
    path.posix.join(root, "src", "index.ts"),
    path.posix.join(root, "test", "index.test.ts"),
    path.posix.join(root, "README.md"),
  ];
}

function normalizeProjectKind(kind: string): SupportedProjectKind | null {
  const normalized = normalizeKindInput(kind);
  return Value.Check(SupportedProjectKindSchema, normalized)
    ? Value.Parse(SupportedProjectKindSchema, normalized)
    : null;
}

function normalizeKindInput(kind: string): string {
  return kind.trim().replace(/^kind:/, "");
}

function slugify(value: string): string {
  const slug = value
    .trim()
    .replace(/^@[^/]+\//, "")
    .replace(/[^a-zA-Z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
  if (!slug) {
    throw new Error("Project name must contain at least one alphanumeric character.");
  }
  return slug;
}

function pluginSlugForName(name: string): string {
  return name.startsWith("plugin-") ? name : `plugin-${name}`;
}

function normalizePath(value: string): string {
  return value.replace(/\\/g, "/").replace(/^\/+/, "").replace(/\/+$/g, "");
}

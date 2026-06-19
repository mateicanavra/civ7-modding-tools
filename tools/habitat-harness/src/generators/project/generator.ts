import path from "node:path";
import { writeJson, type Tree } from "@nx/devkit";
import { type Static, Type } from "typebox";
import { Value } from "typebox/value";

const UniformProjectKindSchema = Type.Union([
  Type.Literal("plugin"),
  Type.Literal("foundation"),
  Type.Literal("app"),
]);
type ProjectKind = Static<typeof UniformProjectKindSchema>;

const ProjectKindInputSchema = Type.Union([
  UniformProjectKindSchema,
  Type.Literal("kind:plugin"),
  Type.Literal("kind:foundation"),
  Type.Literal("kind:app"),
  Type.String({ minLength: 1 }),
]);
type ProjectKindInput = Static<typeof ProjectKindInputSchema>;

export const HabitatProjectGeneratorOptionsSchema = Type.Object(
  {
    name: Type.String({ minLength: 1 }),
    kind: ProjectKindInputSchema,
    packageName: Type.Optional(Type.String({ minLength: 1 })),
    directory: Type.Optional(Type.String({ minLength: 1 })),
  },
  { additionalProperties: true }
);
export type HabitatProjectGeneratorOptions = Static<typeof HabitatProjectGeneratorOptionsSchema>;

const PackageJsonNameSchema = Type.Object(
  { name: Type.Optional(Type.String({ minLength: 1 })) },
  { additionalProperties: true }
);

const PROJECT_KIND_CONTRACTS = {
  plugin: {
    tag: "kind:plugin",
    rootForName: (name: string) => `packages/plugins/${pluginSlugForName(name)}`,
    packageNameForName: (name: string, packageScope: string | null) =>
      packageNameWithScope(packageScope, pluginSlugForName(name)),
  },
  foundation: {
    tag: "kind:foundation",
    rootForName: (name: string) => `packages/${name}`,
    packageNameForName: (name: string, packageScope: string | null) =>
      packageNameWithScope(packageScope, name),
  },
  app: {
    tag: "kind:app",
    rootForName: (name: string) => `apps/${name}`,
    packageNameForName: (name: string) => name,
  },
} as const;

const PACKAGE_SCAN_IGNORED_DIRECTORIES = new Set([
  ".git",
  ".nx",
  "dist",
  "mod",
  "node_modules",
  "tmp",
]);

interface NormalizedProjectGeneratorOptions {
  kind: ProjectKind;
  tag: string;
  name: string;
  root: string;
  packageName: string;
}

export async function projectGenerator(
  tree: Tree,
  rawOptions: HabitatProjectGeneratorOptions
): Promise<void> {
  const options = normalizeOptions(tree, rawOptions);
  if (tree.exists(options.root) && tree.children(options.root).length > 0) {
    throw new Error(`Refusing to overwrite non-empty project root: ${options.root}`);
  }
  const packageNameCollision = findPackageNameCollision(tree, options.packageName, options.root);
  if (packageNameCollision) {
    throw new Error(
      `Refusing to generate ${options.packageName}; package name already exists at ${packageNameCollision}.`
    );
  }

  writeJson(tree, path.posix.join(options.root, "package.json"), packageJson(options));
  tree.write(path.posix.join(options.root, "tsconfig.json"), tsconfigJson(options));
  tree.write(path.posix.join(options.root, "src", "index.ts"), indexSource(options));
  tree.write(path.posix.join(options.root, "test", "index.test.ts"), testSource(options));
  tree.write(path.posix.join(options.root, "README.md"), readme(options));
}

function normalizeOptions(
  tree: Tree,
  rawOptions: HabitatProjectGeneratorOptions
): NormalizedProjectGeneratorOptions {
  const parsed = Value.Parse(HabitatProjectGeneratorOptionsSchema, rawOptions);
  const kind = normalizeProjectKind(parsed.kind);
  if (kind === null) {
    throw new Error(
      `Habitat project generator supports only uniform kinds: plugin, foundation, app. Refusing "${parsed.kind}".`
    );
  }

  const name = slugify(parsed.name);
  const contract = PROJECT_KIND_CONTRACTS[kind];
  const expectedRoot = contract.rootForName(name);
  const packageScope = inferWorkspacePackageScope(tree);
  const expectedPackageName = contract.packageNameForName(name, packageScope);
  const root = normalizePath(parsed.directory ?? expectedRoot);
  const packageName = parsed.packageName ?? expectedPackageName;

  if (root !== expectedRoot) {
    throw new Error(
      `Refusing mismatched Habitat project root for kind:${kind}: expected ${expectedRoot}, received ${root}.`
    );
  }

  if (packageName !== expectedPackageName) {
    throw new Error(
      `Refusing mismatched Habitat package name for kind:${kind}: expected ${expectedPackageName}, received ${packageName}.`
    );
  }

  return {
    kind,
    tag: contract.tag,
    name,
    root,
    packageName,
  };
}

function packageJson(options: NormalizedProjectGeneratorOptions) {
  return {
    name: options.packageName,
    version: "0.1.0",
    private: true,
    nx: {
      tags: [options.tag],
    },
    type: "module",
    main: "./dist/index.js",
    types: "./dist/index.d.ts",
    files: ["dist"],
    exports: {
      ".": {
        types: "./dist/index.d.ts",
        import: "./dist/index.js",
      },
    },
    scripts: {
      build: "tsc -p tsconfig.json",
      check: "tsc -p tsconfig.json --noEmit",
      test: "bun test",
      clean: "rimraf dist",
    },
    engines: {
      node: "22.22.0",
    },
  };
}

function tsconfigJson(options: NormalizedProjectGeneratorOptions): string {
  return `{
  "extends": "${relativePrefix(options.root)}tsconfig.base.json",
  "compilerOptions": {
    "composite": true,
    "declaration": true,
    "outDir": "dist",
    "rootDir": "src",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "noEmit": false
  },
  "include": ["src"]
}
`;
}

function indexSource(options: NormalizedProjectGeneratorOptions): string {
  return `export const habitatProjectKind = "${options.tag}" as const;\n\nexport function describeHabitatProject(): string {\n  return "${options.packageName} (${options.tag})";\n}\n`;
}

function testSource(options: NormalizedProjectGeneratorOptions): string {
  return `import { expect, test } from "bun:test";\nimport { habitatProjectKind } from "../src/index";\n\ntest("${options.packageName} declares its Habitat kind", () => {\n  expect(habitatProjectKind).toBe("${options.tag}");\n});\n`;
}

function readme(options: NormalizedProjectGeneratorOptions): string {
  return `# ${options.packageName}\n\nGenerated by \`@internal/habitat-harness:project\` for \`${options.tag}\`.\n\nKeep structure changes aligned with \`docs/projects/habitat-harness/taxonomy.md\`.\n`;
}

function normalizeProjectKind(kind: ProjectKindInput): ProjectKind | null {
  const normalized = kind.replace(/^kind:/, "");
  return Value.Check(UniformProjectKindSchema, normalized)
    ? Value.Parse(UniformProjectKindSchema, normalized)
    : null;
}

function slugify(value: string): string {
  const slug = value
    .trim()
    .replace(/^@[^/]+\//, "")
    .replace(/[^a-zA-Z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
  if (!slug) throw new Error("Project name must contain at least one alphanumeric character.");
  return slug;
}

function pluginSlugForName(name: string): string {
  return name.startsWith("plugin-") ? name : `plugin-${name}`;
}

function normalizePath(value: string): string {
  return value.replace(/\\/g, "/").replace(/^\/+/, "").replace(/\/+$/g, "");
}

function packageNameWithScope(packageScope: string | null, name: string): string {
  return packageScope ? `@${packageScope}/${name}` : name;
}

function inferWorkspacePackageScope(tree: Tree): string | null {
  const scopeCounts = new Map<string, number>();
  for (const packageJsonPath of packageJsonPaths(tree)) {
    const packageName = readPackageJsonName(tree, packageJsonPath);
    const scope = packageName?.match(/^@([^/]+)\//)?.[1];
    if (!scope) continue;
    scopeCounts.set(scope, (scopeCounts.get(scope) ?? 0) + 1);
  }
  return [...scopeCounts.entries()]
    .sort(([leftScope, leftCount], [rightScope, rightCount]) =>
      rightCount === leftCount ? leftScope.localeCompare(rightScope) : rightCount - leftCount
    )
    .at(0)?.[0] ?? null;
}

function findPackageNameCollision(
  tree: Tree,
  packageName: string,
  projectRoot: string
): string | null {
  for (const packageJsonPath of packageJsonPaths(tree)) {
    if (packageJsonPath === path.posix.join(projectRoot, "package.json")) continue;
    if (readPackageJsonName(tree, packageJsonPath) === packageName) return packageJsonPath;
  }
  return null;
}

function packageJsonPaths(tree: Tree): string[] {
  const paths: string[] = [];
  const roots = ["apps", "mods", "packages", "tools"];
  for (const root of roots) {
    collectPackageJsonPaths(tree, root, paths);
  }
  return paths;
}

function collectPackageJsonPaths(tree: Tree, directory: string, paths: string[]): void {
  if (!tree.exists(directory)) return;
  if (tree.exists(path.posix.join(directory, "package.json"))) {
    paths.push(path.posix.join(directory, "package.json"));
  }
  for (const child of tree.children(directory)) {
    if (PACKAGE_SCAN_IGNORED_DIRECTORIES.has(child)) continue;
    const childPath = path.posix.join(directory, child);
    if (
      !tree.exists(path.posix.join(childPath, "package.json")) &&
      tree.children(childPath).length === 0
    ) {
      continue;
    }
    collectPackageJsonPaths(tree, childPath, paths);
  }
}

function readPackageJsonName(tree: Tree, filePath: string): string | null {
  const contents = tree.read(filePath, "utf8");
  if (contents === null) return null;
  const parsed: unknown = JSON.parse(contents);
  const packageJson = Value.Parse(PackageJsonNameSchema, parsed);
  return packageJson.name ?? null;
}

function relativePrefix(root: string): string {
  return `${root
    .split("/")
    .filter(Boolean)
    .map(() => "..")
    .join("/")}/`;
}

export { PROJECT_KIND_CONTRACTS };
export default projectGenerator;

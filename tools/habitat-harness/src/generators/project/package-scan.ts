import path from "node:path";
import { type Tree } from "@nx/devkit";
import { Value } from "typebox/value";
import { PackageJsonNameSchema } from "./schema.ts";

const PACKAGE_SCAN_IGNORED_DIRECTORIES = new Set([
  ".git",
  ".nx",
  "dist",
  "mod",
  "node_modules",
  "tmp",
]);

export function findPackageNameCollision(
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

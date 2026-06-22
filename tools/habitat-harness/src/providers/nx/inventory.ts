import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import type { WorkspaceProject } from "@internal/habitat-harness/service/model/workspace/index";
import { Value } from "typebox/value";
import {
  type PackageJsonTargetInventory,
  PackageJsonTargetInventorySchema,
  type RootPackageJsonWorkspace,
  RootPackageJsonWorkspaceSchema,
} from "./inventory.schema.js";

export function readPackageTargetInventory(workspaceRoot: string): WorkspaceProject[] {
  return workspacePackageJsonPaths(workspaceRoot)
    .map((packageJsonPath) => packageProject(workspaceRoot, packageJsonPath))
    .filter((project): project is WorkspaceProject => Boolean(project))
    .sort((a, b) => a.root.localeCompare(b.root) || a.name.localeCompare(b.name));
}

export function addProjectTarget(
  projects: readonly WorkspaceProject[],
  projectName: string,
  targetName: string
): WorkspaceProject[] {
  return projects.map((project) =>
    project.name === projectName && !project.targets.some((target) => target.name === targetName)
      ? { ...project, targets: [...project.targets, { name: targetName }].sort(byTargetName) }
      : project
  );
}

export function ensureProject(
  projects: readonly WorkspaceProject[],
  projectName: string,
  root: string
): WorkspaceProject[] {
  if (projects.some((project) => project.name === projectName)) return [...projects];
  return [...projects, { name: projectName, root, sourceRoot: null, tags: [], targets: [] }].sort(
    (a, b) => a.root.localeCompare(b.root) || a.name.localeCompare(b.name)
  );
}

function packageProject(
  workspaceRoot: string,
  packageJsonPath: string
): WorkspaceProject | undefined {
  const packageJson = parsePackageJson(packageJsonPath);
  if (!packageJson.name) return undefined;
  return {
    name: packageJson.name,
    root: path.relative(workspaceRoot, path.dirname(packageJsonPath)).replaceAll(path.sep, "/"),
    sourceRoot: null,
    tags: [],
    targets: [...targetNames(packageJson)].sort().map((name) => ({ name })),
  };
}

function parsePackageJson(packageJsonPath: string): PackageJsonTargetInventory {
  const value: unknown = JSON.parse(readFileSync(packageJsonPath, "utf8"));
  return Value.Parse(PackageJsonTargetInventorySchema, value);
}

function parseRootPackageJson(workspaceRoot: string): RootPackageJsonWorkspace {
  const value: unknown = JSON.parse(readFileSync(path.join(workspaceRoot, "package.json"), "utf8"));
  return Value.Parse(RootPackageJsonWorkspaceSchema, value);
}

function targetNames(packageJson: PackageJsonTargetInventory): Set<string> {
  return new Set([
    ...Object.keys(packageJson.scripts ?? {}),
    ...Object.keys(packageJson.nx?.targets ?? {}),
  ]);
}

function workspacePackageJsonPaths(workspaceRoot: string): string[] {
  const packageJsonPaths = new Set<string>();
  for (const workspace of parseRootPackageJson(workspaceRoot).workspaces ?? []) {
    const search = packageJsonSearch(workspaceRoot, workspace);
    if (!search) continue;
    collectPackageJsonPaths(search.directory, packageJsonPaths, search.depth);
  }
  return [...packageJsonPaths].sort();
}

function packageJsonSearch(
  workspaceRoot: string,
  workspacePattern: string
): { directory: string; depth: number } | undefined {
  const segments = workspacePattern.split("/").filter(Boolean);
  const firstWildcard = segments.findIndex((segment) => segment.includes("*"));
  const baseSegments = firstWildcard === -1 ? segments : segments.slice(0, firstWildcard);
  const depth = firstWildcard === -1 ? 0 : Math.max(1, segments.length - baseSegments.length);
  const directory = path.join(workspaceRoot, ...baseSegments);
  return directory.startsWith(workspaceRoot) ? { directory, depth } : undefined;
}

function collectPackageJsonPaths(directory: string, paths: Set<string>, depth: number): void {
  if (depth < 0 || !existsSync(directory)) return;
  const packageJsonPath = path.join(directory, "package.json");
  if (existsSync(packageJsonPath)) paths.add(packageJsonPath);
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory())
      collectPackageJsonPaths(path.join(directory, entry.name), paths, depth - 1);
  }
}

function byTargetName(a: { name: string }, b: { name: string }): number {
  return a.name.localeCompare(b.name);
}

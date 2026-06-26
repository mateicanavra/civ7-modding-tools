import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import {
  type BoundaryGraphEdge,
  boundaryTags,
  extractBoundaryConfigConstraints,
  normalizeRepoPath,
  type TaxonomyConstraint,
  type WorkspaceManifestProject,
} from "@internal/habitat-harness/service/model/graph/policy/boundary-taxonomy.policy";
import type { WorkspaceProject } from "@internal/habitat-harness/service/model/workspace/index";
import { createProjectGraphAsync } from "@nx/devkit";

export async function readWorkspaceManifestProjects(
  root: string
): Promise<WorkspaceManifestProject[]> {
  const rootPackagePath = path.join(root, "package.json");
  const rootPackage = JSON.parse(await fs.readFile(rootPackagePath, "utf8")) as {
    name?: string;
    workspaces?: string[];
    nx?: { tags?: string[] };
  };
  const workspacePatterns = rootPackage.workspaces ?? [];
  const manifestRoots = new Set<string>(["."]);
  for (const pattern of workspacePatterns) {
    for (const workspaceRoot of await expandSimpleWorkspacePattern(root, pattern)) {
      manifestRoots.add(workspaceRoot);
    }
  }

  const projects: WorkspaceManifestProject[] = [];
  for (const manifestRoot of [...manifestRoots].sort()) {
    const manifestPath = path.join(root, manifestRoot, "package.json");
    const manifest = JSON.parse(await fs.readFile(manifestPath, "utf8")) as {
      name?: string;
      nx?: { tags?: string[] };
    };
    if (!manifest.name) continue;
    const projectJsonTags = await readProjectJsonTags(root, manifestRoot);
    projects.push({
      name: manifest.name,
      root: normalizeRepoPath(manifestRoot),
      tags: boundaryTags([...(manifest.nx?.tags ?? []), ...projectJsonTags]),
    });
  }
  return projects.sort((a, b) => a.root.localeCompare(b.root) || a.name.localeCompare(b.name));
}

export async function readBoundaryConfigConstraints(
  configPath: string
): Promise<TaxonomyConstraint[]> {
  const imported = (await import(pathToFileURL(configPath).href)) as { default?: unknown };
  return extractBoundaryConfigConstraints(imported.default);
}

export async function readNxProjectMetadataFromGraph(): Promise<{
  projects: WorkspaceProject[];
  graphEdges: BoundaryGraphEdge[];
}> {
  const graph = await createProjectGraphAsync();
  const projects = Object.entries(graph.nodes)
    .filter(([, node]) => node.type === "app" || node.type === "lib")
    .map(([name, node]) => {
      const data = node.data;
      return {
        name,
        root: normalizeRepoPath(data.root),
        sourceRoot: data.sourceRoot ? normalizeRepoPath(data.sourceRoot) : null,
        tags: boundaryTags(data.tags ?? []),
        targets: Object.keys(data.targets ?? {})
          .sort()
          .map((targetName) => ({ name: targetName })),
      } satisfies WorkspaceProject;
    })
    .sort((a, b) => a.root.localeCompare(b.root) || a.name.localeCompare(b.name));

  const workspaceProjectNames = new Set(projects.map((project) => project.name));
  const graphEdges = Object.entries(graph.dependencies)
    .flatMap(([source, deps]) =>
      deps
        .filter((dep) => workspaceProjectNames.has(source) && workspaceProjectNames.has(dep.target))
        .map((dep) => ({ source, target: dep.target, type: dep.type }))
    )
    .sort((a, b) => a.source.localeCompare(b.source) || a.target.localeCompare(b.target));

  return { projects, graphEdges };
}

async function readProjectJsonTags(root: string, projectRoot: string): Promise<string[]> {
  try {
    const projectConfig = JSON.parse(
      await fs.readFile(path.join(root, projectRoot, "project.json"), "utf8")
    ) as { tags?: string[] };
    return projectConfig.tags ?? [];
  } catch (error) {
    if (isNodeError(error) && error.code === "ENOENT") return [];
    throw error;
  }
}

async function expandSimpleWorkspacePattern(root: string, pattern: string): Promise<string[]> {
  if (!pattern.endsWith("/*")) {
    throw new Error(`Unsupported workspace pattern ${pattern}`);
  }
  const parent = pattern.slice(0, -2);
  const parentPath = path.join(root, parent);
  const entries = await fs.readdir(parentPath, { withFileTypes: true });
  const roots: string[] = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const workspaceRoot = normalizeRepoPath(path.join(parent, entry.name));
    try {
      await fs.access(path.join(root, workspaceRoot, "package.json"));
      roots.push(workspaceRoot);
    } catch {
      // Workspace globs may include non-package directories; ignore them.
    }
  }
  return roots;
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error;
}

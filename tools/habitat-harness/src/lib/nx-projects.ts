import { createProjectGraphAsync } from "@nx/devkit";
import path from "node:path";
import { repoRoot } from "./paths.js";

export interface NxProjectTarget {
  name: string;
}

export interface NxProjectMetadata {
  name: string;
  root: string;
  sourceRoot: string | null;
  tags: string[];
  targets: NxProjectTarget[];
}

export interface NxProjectMetadataReader {
  readProjects(): Promise<NxProjectMetadata[]>;
}

export class NxProjectGraphMetadataReader implements NxProjectMetadataReader {
  async readProjects(): Promise<NxProjectMetadata[]> {
    const graph = await createProjectGraphAsync();
    return Object.entries(graph.nodes)
      .map(([name, node]) => {
        const data = node.data;
        return {
          name,
          root: normalizeProjectRoot(data.root),
          sourceRoot: data.sourceRoot ? normalizeProjectRoot(data.sourceRoot) : null,
          tags: [...(data.tags ?? [])],
          targets: Object.keys(data.targets ?? {})
            .sort()
            .map((targetName) => ({ name: targetName })),
        };
      })
      .sort((a, b) => a.root.localeCompare(b.root) || a.name.localeCompare(b.name));
  }
}

export function findOwningProject(
  repoRelativePath: string,
  projects: readonly NxProjectMetadata[]
): NxProjectMetadata | undefined {
  return projects
    .filter((project) => isInsideProject(repoRelativePath, project))
    .sort((a, b) => b.root.length - a.root.length || a.name.localeCompare(b.name))[0];
}

export function projectHasTarget(project: NxProjectMetadata, targetName: string): boolean {
  return project.targets.some((target) => target.name === targetName);
}

function normalizeProjectRoot(projectRoot: string): string {
  return path.relative(repoRoot, path.resolve(repoRoot, projectRoot)).replaceAll(path.sep, "/");
}

function isInsideProject(repoRelativePath: string, project: NxProjectMetadata): boolean {
  return repoRelativePath === project.root || repoRelativePath.startsWith(`${project.root}/`);
}

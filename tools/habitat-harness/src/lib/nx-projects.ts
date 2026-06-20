import {
  findWorkspaceOwningProject,
  type WorkspaceProject,
  workspaceProjectHasTarget,
} from "../domains/workspace-graph-integration/index.js";
import { NxWorkspaceGraphProjectReader } from "../providers/nx/graph.js";

export type NxProjectMetadata = WorkspaceProject;

export interface NxProjectMetadataReader {
  readProjects(): Promise<NxProjectMetadata[]>;
}

export class NxProjectGraphMetadataReader implements NxProjectMetadataReader {
  async readProjects(): Promise<NxProjectMetadata[]> {
    return new NxWorkspaceGraphProjectReader().readProjects();
  }
}

export function findOwningProject(
  repoRelativePath: string,
  projects: readonly NxProjectMetadata[]
): NxProjectMetadata | undefined {
  return findWorkspaceOwningProject(repoRelativePath, projects);
}

export function projectHasTarget(project: NxProjectMetadata, targetName: string): boolean {
  return workspaceProjectHasTarget(project, targetName);
}

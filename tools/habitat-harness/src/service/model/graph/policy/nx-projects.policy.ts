import { NxWorkspaceGraphProjectReader } from "@internal/habitat-harness/providers/nx/graph";
import {
  findWorkspaceOwningProject,
  type WorkspaceProject,
  workspaceProjectHasTarget,
} from "@internal/habitat-harness/service/model/workspace/index";

export type NxProjectMetadata = WorkspaceProject;

export interface NxProjectMetadataReader {
  readProjects(): Promise<NxProjectMetadata[]>;
}

export class NxProjectGraphMetadataReader implements NxProjectMetadataReader {
  constructor(private readonly repoRoot: string) {}

  async readProjects(): Promise<NxProjectMetadata[]> {
    return new NxWorkspaceGraphProjectReader(this.repoRoot).readProjects();
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

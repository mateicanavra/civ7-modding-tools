import path from "node:path";
import {
  type WorkspaceGraphReadState,
  WorkspaceGraphReadStateSchema,
  WorkspaceGraphSnapshotSchema,
  type WorkspaceProject,
  WorkspaceProjectSchema,
} from "@internal/habitat-harness/service/model/workspace/index";
import { createProjectGraphAsync } from "@nx/devkit";
import { Value } from "typebox/value";

export type WorkspaceGraphProjectReader = {
  readProjects(): Promise<WorkspaceProject[]>;
};

export class NxWorkspaceGraphProjectReader implements WorkspaceGraphProjectReader {
  constructor(private readonly repoRoot: string) {}

  async readProjects(): Promise<WorkspaceProject[]> {
    const graph = await createProjectGraphAsync();
    return Object.entries(graph.nodes)
      .map(([name, node]) => {
        const data = node.data;
        return Value.Parse(WorkspaceProjectSchema, {
          name,
          root: normalizeProjectRoot(data.root, this.repoRoot),
          sourceRoot: data.sourceRoot ? normalizeProjectRoot(data.sourceRoot, this.repoRoot) : null,
          tags: [...(data.tags ?? [])],
          targets: Object.keys(data.targets ?? {})
            .sort()
            .map((targetName) => ({ name: targetName })),
        });
      })
      .sort((a, b) => a.root.localeCompare(b.root) || a.name.localeCompare(b.name));
  }
}

export async function readWorkspaceGraph(
  repoRoot: string,
  reader: WorkspaceGraphProjectReader = new NxWorkspaceGraphProjectReader(repoRoot)
): Promise<WorkspaceGraphReadState> {
  let projects: WorkspaceProject[];
  try {
    projects = await reader.readProjects();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return parseReadState({
      kind: message.toLowerCase().includes("daemon") ? "nx-daemon-failure" : "nx-read-failure",
      message,
    });
  }
  const snapshotCandidate = { projects };
  const errors = [...Value.Errors(WorkspaceGraphSnapshotSchema, snapshotCandidate)];
  if (errors.length > 0) {
    return parseReadState({
      kind: "malformed-graph-json",
      message: errors.map((error) => error.message).join("; "),
    });
  }
  return parseReadState({
    kind: "graph-ready",
    snapshot: Value.Parse(WorkspaceGraphSnapshotSchema, snapshotCandidate),
  });
}

function parseReadState(value: WorkspaceGraphReadState): WorkspaceGraphReadState {
  return Value.Parse(WorkspaceGraphReadStateSchema, value);
}

function normalizeProjectRoot(projectRoot: string, repoRoot: string): string {
  return path.relative(repoRoot, path.resolve(repoRoot, projectRoot)).replaceAll(path.sep, "/");
}

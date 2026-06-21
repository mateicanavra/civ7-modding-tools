import path from "node:path";
import { repoRoot } from "@internal/habitat-harness/service/runtime/paths";
import { createProjectGraphAsync } from "@nx/devkit";
import { Value } from "typebox/value";
import {
  type WorkspaceGraphReadState,
  WorkspaceGraphReadStateSchema,
  WorkspaceGraphSnapshotSchema,
  type WorkspaceProject,
  WorkspaceProjectSchema,
} from "./schema.js";

export type WorkspaceGraphProjectReader = {
  readProjects(): Promise<WorkspaceProject[]>;
};

export class NxWorkspaceGraphProjectReader implements WorkspaceGraphProjectReader {
  async readProjects(): Promise<WorkspaceProject[]> {
    const graph = await createProjectGraphAsync();
    return Object.entries(graph.nodes)
      .map(([name, node]) => {
        const data = node.data;
        return Value.Parse(WorkspaceProjectSchema, {
          name,
          root: normalizeProjectRoot(data.root),
          sourceRoot: data.sourceRoot ? normalizeProjectRoot(data.sourceRoot) : null,
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
  reader: WorkspaceGraphProjectReader = new NxWorkspaceGraphProjectReader()
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

function normalizeProjectRoot(projectRoot: string): string {
  return path.relative(repoRoot, path.resolve(repoRoot, projectRoot)).replaceAll(path.sep, "/");
}

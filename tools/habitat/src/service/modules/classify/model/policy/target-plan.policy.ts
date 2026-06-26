import type { WorkspaceProject } from "@habitat/cli/service/model/workspace/index";
import {
  projectTargetStates,
  workspaceTargetStates,
} from "@habitat/cli/service/model/workspace/index";
import type { ClassifiedTarget, UnavailableClassifiedTarget } from "../dto/classify.schema.js";

export function projectTargets(project: WorkspaceProject): {
  targets: ClassifiedTarget[];
  unavailableTargets: UnavailableClassifiedTarget[];
} {
  const states = projectTargetStates(project);
  return {
    targets: states
      .filter((state) => state.kind === "available-project-target")
      .map((state) => ({
        command: state.command,
        owner: "project",
        project: project.name,
        target: state.target,
        source: { kind: "nx-project-graph", project: project.name, target: state.target },
      })),
    unavailableTargets: states
      .filter((state) => state.kind === "unavailable-project-target")
      .map((state) => ({
        owner: "project",
        project: state.project,
        target: state.target,
        reason: "missing-nx-target",
      })),
  };
}

export function workspaceTargets(projects: readonly WorkspaceProject[]): ClassifiedTarget[] {
  return workspaceTargetStates(projects)
    .filter((state) => state.kind === "aggregate-workspace-target")
    .map((state) => ({
      command: state.command,
      owner: "workspace",
      project: null,
      target: state.target,
      source: {
        kind: "workspace-graph",
        target: state.target,
        reason: "aggregate target from workspace graph",
      },
    }));
}

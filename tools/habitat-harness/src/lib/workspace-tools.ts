import { repoRoot } from "./paths.js";

export type HabitatToolExecutionPlane = "workspace-bun-run" | "workspace-bunx-binary" | "system";

export interface MaterializedHabitatCommand {
  requestedExecutable: string;
  executable: string;
  argv: string[];
  cwd?: string;
  executionPlane: HabitatToolExecutionPlane;
}

type WorkspaceToolStrategy = "bun-run" | "bunx-binary";

const workspaceToolExecutables = new Map<string, WorkspaceToolStrategy>([
  ["biome", "bun-run"],
  ["grit", "bun-run"],
  ["nx", "bun-run"],
  ["oclif", "bun-run"],
  ["openspec", "bunx-binary"],
  ["rimraf", "bun-run"],
  ["tsc", "bun-run"],
  ["vitest", "bun-run"],
]);

export function materializeHabitatCommand(
  requestedExecutable: string,
  argv: readonly string[]
): MaterializedHabitatCommand {
  const workspaceStrategy = workspaceToolExecutables.get(requestedExecutable);
  if (workspaceStrategy === "bun-run") {
    return {
      requestedExecutable,
      executable: "bun",
      cwd: repoRoot,
      argv: ["run", "--cwd", repoRoot, requestedExecutable, ...argv],
      executionPlane: "workspace-bun-run",
    };
  }
  if (workspaceStrategy === "bunx-binary") {
    return {
      requestedExecutable,
      executable: "bun",
      cwd: repoRoot,
      argv: ["x", "--no-install", requestedExecutable, ...argv],
      executionPlane: "workspace-bunx-binary",
    };
  }
  return {
    requestedExecutable,
    executable: requestedExecutable,
    argv: [...argv],
    executionPlane: "system",
  };
}

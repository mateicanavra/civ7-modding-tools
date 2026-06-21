import type {
  HabitatConfigValue,
  HabitatToolExecutionPlane,
} from "@internal/habitat-harness/service/runtime/config/index";
import { makeHabitatConfig } from "@internal/habitat-harness/service/runtime/config/index";

export interface MaterializedHabitatCommand {
  requestedExecutable: string;
  executable: string;
  argv: string[];
  cwd?: string;
  executionPlane: HabitatToolExecutionPlane;
}

export function materializeHabitatCommandWithConfig(
  config: HabitatConfigValue,
  requestedExecutable: string,
  argv: readonly string[]
): MaterializedHabitatCommand {
  const workspaceTool = config.workspaceTools.get(requestedExecutable);
  if (workspaceTool?.strategy === "bun-run") {
    return {
      requestedExecutable,
      executable: "bun",
      cwd: config.repoRoot,
      argv: [
        "run",
        "--cwd",
        config.repoRoot,
        workspaceTool.executable,
        ...(workspaceTool.argvPrefix ?? []),
        ...argv,
      ],
      executionPlane: "workspace-bun-run",
    };
  }
  if (workspaceTool?.strategy === "bunx-binary") {
    return {
      requestedExecutable,
      executable: "bun",
      cwd: config.repoRoot,
      argv: ["x", "--no-install", workspaceTool.executable, ...argv],
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

export function materializeDefaultHabitatCommand(
  requestedExecutable: string,
  argv: readonly string[]
): MaterializedHabitatCommand {
  return materializeHabitatCommandWithConfig(makeHabitatConfig(), requestedExecutable, argv);
}

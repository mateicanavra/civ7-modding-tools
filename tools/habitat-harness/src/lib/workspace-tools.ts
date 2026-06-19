import { repoRoot } from "./paths.js";
import { Context, Effect, Layer } from "effect";

export type HabitatToolExecutionPlane = "workspace-bun-run" | "workspace-bunx-binary" | "system";

export interface MaterializedHabitatCommand {
  requestedExecutable: string;
  executable: string;
  argv: string[];
  cwd?: string;
  executionPlane: HabitatToolExecutionPlane;
}

type WorkspaceToolStrategy = "bun-run" | "bunx-binary";

interface WorkspaceTool {
  executable: string;
  strategy: WorkspaceToolStrategy;
  argvPrefix?: string[];
}

const workspaceToolExecutables = new Map<string, WorkspaceTool>([
  ["format-check", { executable: "biome", strategy: "bun-run" }],
  [
    "import-boundaries",
    {
      executable: "eslint",
      strategy: "bun-run",
      argvPrefix: ["--quiet", "--config", "eslint.boundaries.config.mjs", "--no-config-lookup"],
    },
  ],
  ["pattern-check", { executable: "grit", strategy: "bun-run" }],
  ["target-check", { executable: "nx", strategy: "bun-run" }],
  ["grit", { executable: "grit", strategy: "bun-run" }],
]);

export interface WorkspaceToolProviderService {
  materialize: (
    requestedExecutable: string,
    argv: readonly string[]
  ) => Effect.Effect<MaterializedHabitatCommand>;
}

export class WorkspaceToolProvider extends Context.Tag(
  "@internal/habitat-harness/WorkspaceToolProvider"
)<WorkspaceToolProvider, WorkspaceToolProviderService>() {}

export const WorkspaceToolProviderLive = Layer.scoped(
  WorkspaceToolProvider,
  Effect.acquireRelease(
    Effect.sync((): WorkspaceToolProviderService => ({
      materialize: (requestedExecutable, argv) =>
        Effect.sync(() => materializeWorkspaceTool(requestedExecutable, argv)),
    })),
    () => Effect.void
  )
);

export function materializeWorkspaceToolCommand(
  requestedExecutable: string,
  argv: readonly string[]
): Effect.Effect<MaterializedHabitatCommand, never, WorkspaceToolProvider> {
  return Effect.gen(function* () {
    const provider = yield* WorkspaceToolProvider;
    return yield* provider.materialize(requestedExecutable, argv);
  });
}

export function materializeHabitatCommand(
  requestedExecutable: string,
  argv: readonly string[]
): MaterializedHabitatCommand {
  return Effect.runSync(
    materializeWorkspaceToolCommand(requestedExecutable, argv).pipe(
      Effect.provide(WorkspaceToolProviderLive)
    )
  );
}

function materializeWorkspaceTool(
  requestedExecutable: string,
  argv: readonly string[]
): MaterializedHabitatCommand {
  const workspaceTool = workspaceToolExecutables.get(requestedExecutable);
  if (workspaceTool?.strategy === "bun-run") {
    return {
      requestedExecutable,
      executable: "bun",
      cwd: repoRoot,
      argv: [
        "run",
        "--cwd",
        repoRoot,
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
      cwd: repoRoot,
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

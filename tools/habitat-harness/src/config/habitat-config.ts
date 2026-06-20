import path from "node:path";
import { Context, Effect, Layer } from "effect";
import { repoRoot } from "../lib/paths.js";

export type HabitatToolExecutionPlane = "workspace-bun-run" | "workspace-bunx-binary" | "system";

export type WorkspaceToolStrategy = "bun-run" | "bunx-binary";

export interface WorkspaceToolPolicy {
  readonly executable: string;
  readonly strategy: WorkspaceToolStrategy;
  readonly argvPrefix?: readonly string[];
}

export interface HabitatTimeoutPolicy {
  readonly commandTimeoutMs?: number;
}

export interface HabitatConfigValue {
  readonly repoRoot: string;
  readonly harnessRoot: string;
  readonly cacheRoot: string;
  readonly patternCacheRoot: string;
  readonly telemetryDisabled: boolean;
  readonly timeoutPolicy: HabitatTimeoutPolicy;
  readonly workspaceTools: ReadonlyMap<string, WorkspaceToolPolicy>;
}

export interface HabitatConfigService {
  readonly get: Effect.Effect<HabitatConfigValue>;
}

export class HabitatConfig extends Context.Tag("@internal/habitat-harness/HabitatConfig")<
  HabitatConfig,
  HabitatConfigService
>() {}

export const defaultWorkspaceToolPolicies = new Map<string, WorkspaceToolPolicy>([
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

export function makeHabitatConfig(
  overrides: Partial<Omit<HabitatConfigValue, "workspaceTools">> & {
    readonly workspaceTools?: ReadonlyMap<string, WorkspaceToolPolicy>;
  } = {}
): HabitatConfigValue {
  const root = overrides.repoRoot ?? repoRoot;
  const cacheRoot = overrides.cacheRoot ?? path.join(root, ".habitat", "cache");
  return {
    repoRoot: root,
    harnessRoot: overrides.harnessRoot ?? path.join(root, "tools", "habitat-harness"),
    cacheRoot,
    patternCacheRoot: overrides.patternCacheRoot ?? path.join(cacheRoot, "patterns"),
    telemetryDisabled: overrides.telemetryDisabled ?? true,
    timeoutPolicy: overrides.timeoutPolicy ?? {},
    workspaceTools: overrides.workspaceTools ?? defaultWorkspaceToolPolicies,
  };
}

export function makeHabitatConfigLayer(config: HabitatConfigValue = makeHabitatConfig()) {
  return Layer.succeed(HabitatConfig, { get: Effect.succeed(config) });
}

export const HabitatConfigLive = makeHabitatConfigLayer();

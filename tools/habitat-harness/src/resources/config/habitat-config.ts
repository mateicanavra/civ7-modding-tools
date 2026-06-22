import path from "node:path";
import { repoRoot } from "@internal/habitat-harness/resources/paths";
import { Config, Context, Effect, Layer, Option } from "effect";

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
  ["biome", { executable: "biome", strategy: "bun-run" }],
  ["format-check", { executable: "biome", strategy: "bun-run" }],
  ["nx", { executable: "nx", strategy: "bun-run" }],
  ["grit", { executable: "grit", strategy: "bun-run" }],
]);

/**
 * Runtime-owned config surface. Static tool policy stays typed in Habitat; host
 * deployment choices enter through Effect's ConfigProvider.
 */
export const habitatConfigDescriptor = Config.all({
  repoRoot: Config.withDefault(Config.string("HABITAT_REPO_ROOT"), repoRoot),
  harnessRoot: Config.option(Config.string("HABITAT_HARNESS_ROOT")),
  cacheRoot: Config.option(Config.string("HABITAT_CACHE_ROOT")),
  patternCacheRoot: Config.option(Config.string("HABITAT_PATTERN_CACHE_ROOT")),
  telemetryDisabled: Config.withDefault(Config.boolean("HABITAT_TELEMETRY_DISABLED"), true),
  commandTimeoutMs: Config.option(Config.integer("HABITAT_COMMAND_TIMEOUT_MS")),
});

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

export const loadHabitatConfig = Effect.map(habitatConfigDescriptor, (config) => {
  const root = config.repoRoot;
  const cacheRoot = Option.getOrElse(config.cacheRoot, () => path.join(root, ".habitat", "cache"));
  return makeHabitatConfig({
    repoRoot: root,
    harnessRoot: Option.getOrElse(config.harnessRoot, () =>
      path.join(root, "tools", "habitat-harness")
    ),
    cacheRoot,
    patternCacheRoot: Option.getOrElse(config.patternCacheRoot, () =>
      path.join(cacheRoot, "patterns")
    ),
    telemetryDisabled: config.telemetryDisabled,
    timeoutPolicy: {
      commandTimeoutMs: Option.getOrUndefined(config.commandTimeoutMs),
    },
  });
});

export function makeHabitatConfigLayer(config: HabitatConfigValue = makeHabitatConfig()) {
  return Layer.succeed(HabitatConfig, { get: Effect.succeed(config) });
}

export const HabitatConfigLive = Layer.effect(
  HabitatConfig,
  Effect.map(loadHabitatConfig, (config) => ({ get: Effect.succeed(config) }))
);

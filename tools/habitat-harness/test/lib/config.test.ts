import { HabitatConfig, HabitatConfigLive } from "@internal/habitat-harness/resources/config/index";
import { HabitatPlatform } from "@internal/habitat-harness/resources/platform/index";
import { HabitatRuntimeLive } from "@internal/habitat-harness/runtime/layers";
import { ConfigProvider, Effect, Layer } from "effect";
import { describe, expect, test } from "vitest";

describe("Habitat config resource", () => {
  test("loads live runtime config through Effect ConfigProvider", async () => {
    const configProvider = ConfigProvider.fromMap(
      new Map([
        ["HABITAT_REPO_ROOT", "/tmp/effect-config-repo"],
        ["HABITAT_CACHE_ROOT", "/tmp/effect-config-cache"],
        ["HABITAT_PATTERN_CACHE_ROOT", "/tmp/effect-config-patterns"],
        ["HABITAT_TELEMETRY_DISABLED", "false"],
        ["HABITAT_COMMAND_TIMEOUT_MS", "125"],
      ])
    );

    const config = await Effect.runPromise(
      Effect.gen(function* () {
        const resource = yield* HabitatConfig;
        return yield* resource.get;
      }).pipe(
        Effect.provide(
          HabitatConfigLive.pipe(Layer.provide(Layer.setConfigProvider(configProvider)))
        )
      )
    );

    expect(config).toMatchObject({
      repoRoot: "/tmp/effect-config-repo",
      harnessRoot: "/tmp/effect-config-repo/tools/habitat-harness",
      cacheRoot: "/tmp/effect-config-cache",
      patternCacheRoot: "/tmp/effect-config-patterns",
      telemetryDisabled: false,
      timeoutPolicy: { commandTimeoutMs: 125 },
    });
  });

  test("realizes repo-scoped runtime resources from live config", async () => {
    const configProvider = ConfigProvider.fromMap(
      new Map([["HABITAT_REPO_ROOT", "/tmp/effect-config-runtime"]])
    );

    const result = await Effect.runPromise(
      Effect.gen(function* () {
        const configResource = yield* HabitatConfig;
        const platform = yield* HabitatPlatform;
        const config = yield* configResource.get;
        return {
          configRepoRoot: config.repoRoot,
          platformRepoRoot: platform.repoRoot,
        };
      }).pipe(
        Effect.provide(
          HabitatRuntimeLive.pipe(Layer.provide(Layer.setConfigProvider(configProvider)))
        )
      )
    );

    expect(result).toEqual({
      configRepoRoot: "/tmp/effect-config-runtime",
      platformRepoRoot: "/tmp/effect-config-runtime",
    });
  });
});

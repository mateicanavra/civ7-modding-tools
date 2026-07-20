import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { ruleRegistryRepoPath } from "@habitat/cli/resources/authority-paths";
import { HabitatConfig, HabitatConfigLive } from "@habitat/cli/resources/config/index";
import { HabitatPlatform } from "@habitat/cli/resources/platform/index";
import { HabitatRuntimeLive } from "@habitat/cli/runtime/layers";
import { RuleFacts } from "@habitat/cli/service/model/rules/index";
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
    const configLayer = HabitatConfigLive.pipe(
      Layer.provide(Layer.setConfigProvider(configProvider))
    );

    const config = await Effect.runPromise(
      Effect.gen(function* () {
        const resource = yield* HabitatConfig;
        return yield* resource.get;
      }).pipe(Effect.provide(configLayer))
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
    const repoRoot = mkdtempSync(path.join(tmpdir(), "habitat-config-runtime-"));
    const authorityRoot = path.join(repoRoot, ruleRegistryRepoPath);
    mkdirSync(authorityRoot, { recursive: true });
    writeFileSync(
      path.join(authorityRoot, "index.json"),
      '{"schemaVersion":2,"ownerRoots":{"habitat":"tools/habitat"}}\n'
    );
    const configProvider = ConfigProvider.fromMap(new Map([["HABITAT_REPO_ROOT", repoRoot]]));
    const runtimeLayer = HabitatRuntimeLive.pipe(
      Layer.provide(Layer.setConfigProvider(configProvider))
    );

    try {
      const result = await Effect.runPromise(
        Effect.gen(function* () {
          const configResource = yield* HabitatConfig;
          const platform = yield* HabitatPlatform;
          const rules = yield* RuleFacts;
          const config = yield* configResource.get;
          return {
            configRepoRoot: config.repoRoot,
            platformRepoRoot: platform.repoRoot,
            ruleCount: rules.selector.length,
          };
        }).pipe(Effect.provide(runtimeLayer))
      );

      expect(result).toEqual({
        configRepoRoot: repoRoot,
        platformRepoRoot: repoRoot,
        ruleCount: 0,
      });
    } finally {
      rmSync(repoRoot, { recursive: true, force: true });
    }
  });
});

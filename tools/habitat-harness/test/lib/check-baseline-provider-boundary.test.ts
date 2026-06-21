import {
  BaselineAuthority,
  BaselineAuthorityLive,
} from "@internal/habitat-harness/service/modules/check/baseline/index";
import { activeRuleSelectorFacts } from "@internal/habitat-harness/service/modules/check/rules/registry/active-facts";
import { executeSelectedRulesEffect } from "@internal/habitat-harness/service/modules/check/structural/execution";
import {
  captureOutput,
  makeHabitatCommandResult,
} from "@internal/habitat-harness/service/runtime/command/index";
import { makeFakeGitProviderLayer } from "@internal/habitat-harness/service/runtime/git/index";
import { Effect, Layer } from "effect";
import { describe, expect, test } from "vitest";
import { makeFakePlatformFileSystemLayer } from "../support/fake-platform-file-system.js";

describe("check and baseline provider boundaries", () => {
  test("BaselineAuthorityLive reads integrity state through filesystem and git providers", async () => {
    const root = "/repo";
    const baselinesDir = "/repo/.habitat/baselines";
    const events: string[] = [];
    const gitCalls: string[][] = [];
    const registry = [baselineRule("existing-rule")];
    const layer = Layer.mergeAll(
      BaselineAuthorityLive,
      makeFakePlatformFileSystemLayer(
        events,
        new Map([[`${baselinesDir}/existing-rule.json`, "[]\n"]]),
        new Map([[baselinesDir, [{ name: "existing-rule.json", kind: "file" }]]])
      ),
      makeFakeGitProviderLayer((argv, options) => {
        gitCalls.push([...argv]);
        if (argv[0] === "merge-base") {
          return commandResult(argv, options.cwd, "merge-base-sha\n");
        }
        if (argv[0] === "show" && argv[1] === "merge-base-sha:.habitat/rules/rules.json") {
          return commandResult(argv, options.cwd, ruleRegistryJson(["existing-rule"]));
        }
        if (
          argv[0] === "show" &&
          argv[1] === "merge-base-sha:.habitat/baselines/existing-rule.json"
        ) {
          return commandResult(argv, options.cwd, "[]\n");
        }
        return commandResult(argv, options.cwd, "", 1, "not found\n");
      })
    );

    const result = await Effect.runPromise(
      Effect.gen(function* () {
        const baseline = yield* BaselineAuthority;
        return yield* baseline.checkIntegrity("main", {
          repoRoot: root,
          baselinesDir,
          registry,
        });
      }).pipe(Effect.provide(layer))
    );

    expect(result).toEqual({ status: "accepted", refusals: [] });
    expect(events).toEqual([
      `stat:${baselinesDir}`,
      `readdir:${baselinesDir}`,
      `stat:${baselinesDir}/existing-rule.json`,
      `stat:${baselinesDir}/existing-rule.json`,
      `read:${baselinesDir}/existing-rule.json`,
    ]);
    expect(gitCalls).toEqual([
      ["merge-base", "HEAD", "main"],
      ["show", "merge-base-sha:.habitat/rules/rules.json"],
      ["show", "merge-base-sha:.habitat/baselines/existing-rule.json"],
    ]);
  });

  test("BaselineAuthorityLive writes baselines through the platform filesystem", async () => {
    const baselinesDir = "/repo/.habitat/baselines";
    const events: string[] = [];
    const layer = Layer.mergeAll(BaselineAuthorityLive, makeFakePlatformFileSystemLayer(events));

    await Effect.runPromise(
      Effect.gen(function* () {
        const baseline = yield* BaselineAuthority;
        yield* baseline.write("new-rule", ["z::last", "a::first"], {
          repoRoot: "/repo",
          baselinesDir,
          registry: [],
        });
      }).pipe(Effect.provide(layer))
    );

    expect(events).toEqual([
      `mkdir:${baselinesDir}`,
      `write:${baselinesDir}/new-rule.json:${JSON.stringify(["a::first", "z::last"], null, 2)}\n`,
    ]);
  });

  test("staged file-layer checks render GitProvider failures as diagnostics", async () => {
    const fileLayerRule = activeRuleSelectorFacts.find((rule) => rule.ownerTool === "file-layer");
    expect(fileLayerRule).toBeDefined();
    const gitCalls: string[][] = [];
    const layer = Layer.mergeAll(
      makeFakeGitProviderLayer((argv, options) => {
        gitCalls.push([...argv]);
        return commandResult(argv, options.cwd, "", 1, "fake staged diff failure\n");
      })
    );

    const results = await Effect.runPromise(
      executeSelectedRulesEffect([fileLayerRule!], { staged: true }).pipe(Effect.provide(layer))
    );
    const record = results.get(fileLayerRule!.id);

    expect(gitCalls).toEqual([["diff", "--cached", "--name-status", "-z"]]);
    expect(record?.result.exitCode).toBe(1);
    expect(record?.result.diagnostics[0]?.message).toContain("fake staged diff failure");
  });
});

function baselineRule(id: string) {
  return {
    id,
    exceptionPath: "none",
    ownerProject: "@internal/habitat-harness",
    ownerTool: "source-check",
  } as const;
}

function ruleRegistryJson(ruleIds: readonly string[]) {
  return JSON.stringify(
    {
      schemaVersion: 1,
      ownerRoots: {
        "@internal/habitat-harness": "tools/habitat-harness",
      },
      rules: ruleIds.map((id) => ({
        id,
        ownerProject: "@internal/habitat-harness",
        ownerTool: "command-check",
        lane: "enforced",
        scope: "tools/habitat-harness/**",
        forbids: "fixture violation",
        why: "fixture base registry record for provider-boundary tests",
        detect: ["fixture", id],
        remediate: null,
        message: "fixture baseline authority diagnostic",
        exceptionPath: "none",
        pathCoverage: [{ kind: "workspace-gate" }],
      })),
    },
    null,
    2
  );
}

function commandResult(
  argv: readonly string[],
  cwd: string,
  stdout: string,
  exitCode = 0,
  stderr = ""
) {
  return makeHabitatCommandResult(
    {
      commandId: `git-${argv.join("-")}`,
      kind: "git-state",
      executable: "git",
      argv,
      cwd,
      captureGitState: false,
    },
    {
      exit: { code: exitCode, signal: null, interrupted: false },
      stdout: captureOutput(stdout),
      stderr: captureOutput(stderr),
    }
  );
}

import {
  makeFakeGitProviderLayer,
  makeGitProviderFromCommandHandler,
} from "@habitat/cli/providers/git/index";
import { captureOutput, makeHabitatCommandResult } from "@habitat/cli/resources/command/index";
import {
  isDirectory,
  isFile,
  makeDirectory,
  readDirectory,
  readText,
  writeText,
} from "@habitat/cli/resources/platform/index";
import {
  checkBaselineIntegrityEffect,
  writeBaselineEffect,
} from "@habitat/cli/service/model/baseline/index";
import { executeSelectedRulesEffect } from "@habitat/cli/service/model/check/policy/structural/execution.policy";
import { Effect, Layer } from "effect";
import { describe, expect, test } from "vitest";
import { makeFakePlatformFileSystemLayer } from "../support/fake-platform-file-system.js";
import { makeTestHabitatServiceDeps } from "../support/habitat-service-deps.js";

describe("check and baseline provider boundaries", () => {
  test("baseline integrity reads state through filesystem and git providers", async () => {
    const root = "/repo";
    const baselinesDir = "/repo/.habitat/baselines";
    const events: string[] = [];
    const gitCalls: string[][] = [];
    const registry = [baselineRule("existing-rule")];
    const git = makeGitProviderFromCommandHandler((argv, options) => {
      gitCalls.push([...argv]);
      if (argv[0] === "merge-base") {
        return commandResult(argv, options.cwd, "merge-base-sha\n");
      }
      if (argv[0] === "ls-tree" && argv[4] === ".habitat") {
        return commandResult(
          argv,
          options.cwd,
          ".habitat/global/workspace/blueprints/project-boundary-model/structure/check/existing-rule/existing-rule.rule.json\n"
        );
      }
      if (
        argv[0] === "show" &&
        argv[1] === "merge-base-sha:.habitat/baselines/existing-rule.json"
      ) {
        return commandResult(argv, options.cwd, "[]\n");
      }
      return commandResult(argv, options.cwd, "", 1, "not found\n");
    });
    const layer = Layer.mergeAll(
      makeFakePlatformFileSystemLayer(
        events,
        new Map([[`${baselinesDir}/existing-rule.json`, "[]\n"]]),
        new Map([[baselinesDir, [{ name: "existing-rule.json", kind: "file" }]]])
      )
    );

    const result = await Effect.runPromise(
      checkBaselineIntegrityEffect("main", {
        git,
        fileSystem: baselineFileSystemPort(),
        repoRoot: root,
        baselinesDir,
        registry,
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
      ["show", "merge-base-sha:.habitat/rules.json"],
      [
        "show",
        "merge-base-sha:tools/habitat/src/service/model/check/policy/rule-runtime/rules.json",
      ],
      ["ls-tree", "-r", "--name-only", "merge-base-sha", ".habitat"],
      ["show", "merge-base-sha:.habitat/baselines/existing-rule.json"],
    ]);
  });

  test("baseline expansion writes through the platform filesystem", async () => {
    const baselinesDir = "/repo/.habitat/baselines";
    const events: string[] = [];
    const layer = makeFakePlatformFileSystemLayer(events);

    await Effect.runPromise(
      writeBaselineEffect("new-rule", ["z::last", "a::first"], {
        git: makeTestHabitatServiceDeps().git,
        fileSystem: baselineFileSystemPort(),
        repoRoot: "/repo",
        baselinesDir,
        registry: [],
      }).pipe(Effect.provide(layer))
    );

    expect(events).toEqual([
      `mkdir:${baselinesDir}`,
      `write:${baselinesDir}/new-rule.json:${JSON.stringify(["a::first", "z::last"], null, 2)}\n`,
    ]);
  });

  test("staged file-layer checks render GitProvider failures as diagnostics", async () => {
    const fileLayerRule = makeTestHabitatServiceDeps().rules.selector.find(
      (rule) => rule.ownerTool === "file-layer"
    );
    expect(fileLayerRule).toBeDefined();
    const gitCalls: string[][] = [];
    const git = makeGitProviderFromCommandHandler((argv, options) => {
      gitCalls.push([...argv]);
      return commandResult(argv, options.cwd, "", 1, "fake staged diff failure\n");
    });
    const deps = makeTestHabitatServiceDeps({ git });

    const results = await Effect.runPromise(
      executeSelectedRulesEffect(
        [fileLayerRule!],
        { staged: true },
        {
          baselineFileSystem: baselineFileSystemPort(),
          biome: deps.biome,
          commandRunner: deps.commandRunner,
          git: deps.git,
          nx: deps.nx,
          repoRoot: "/repo",
          rules: deps.rules,
        }
      )
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
    ownerProject: "habitat",
    ownerTool: "source-check",
  } as const;
}

function baselineFileSystemPort() {
  return {
    isDirectory,
    isFile,
    makeDirectory,
    readDirectory,
    readText,
    writeText,
  };
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

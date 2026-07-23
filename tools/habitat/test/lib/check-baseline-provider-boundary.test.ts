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
  readPathKind,
  readText,
  writeText,
} from "@habitat/cli/resources/platform/index";
import {
  checkBaselineIntegrityEffect,
  writeBaselineEffect,
} from "@habitat/cli/service/model/baseline/index";
import { executeSelectedRulesEffect } from "@habitat/cli/service/model/check/policy/structural/execution.policy";
import { Effect, Layer, Match, Schema } from "effect";
import { describe, expect, test } from "vitest";
import { makeFakePlatformFileSystemLayer } from "../support/fake-platform-file-system.js";
import { makeTestHabitatServiceDeps } from "../support/habitat-service-deps.js";

const fixtureRepoRoot = path.join(path.sep, "repo");
const stringifyJsonDocument = Schema.encodeSync(Schema.parseJson());

describe("check and baseline provider boundaries", () => {
  test("baseline integrity reads state through filesystem and git providers", async () => {
    const root = fixtureRepoRoot;
    const baselinesDir = path.join(root, ".habitat", "baselines");
    const events: string[] = [];
    const gitCalls: string[][] = [];
    const registry = [baselineRule("existing-rule")];
    const git = makeGitProviderFromCommandHandler((argv, options) =>
      recordAndReturn(gitCalls, [...argv], baselineGitCommandResult(argv, options.cwd))
    );
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
      [
        "show",
        "merge-base-sha:.habitat/global/workspace/_blueprints/project-boundary-model/existing-rule/rule.json",
      ],
      ["show", "merge-base-sha:.habitat/baselines/existing-rule.json"],
    ]);
  });

  test("baseline expansion writes through the platform filesystem", async () => {
    const baselinesDir = path.join(fixtureRepoRoot, ".habitat", "baselines");
    const events: string[] = [];
    const layer = makeFakePlatformFileSystemLayer(events);

    await Effect.runPromise(
      writeBaselineEffect(
        "new-rule",
        [
          { key: "a::first", count: 1 },
          { key: "z::last", count: 1 },
        ],
        {
          git: makeTestHabitatServiceDeps().git,
          fileSystem: baselineFileSystemPort(),
          repoRoot: fixtureRepoRoot,
          baselinesDir,
          registry: [],
        }
      ).pipe(Effect.provide(layer))
    );

    expect(events).toEqual([
      `mkdir:${baselinesDir}`,
      `write:${baselinesDir}/new-rule.json:${stringifyJsonDocument({
        schemaVersion: 1,
        occurrences: [
          { key: "a::first", count: 1 },
          { key: "z::last", count: 1 },
        ],
      })}\n`,
    ]);
  });

  test("baseline expansion persists repeated diagnostics as exact occurrences", async () => {
    const baselinesDir = path.join(fixtureRepoRoot, ".habitat", "baselines");
    const events: string[] = [];
    const layer = makeFakePlatformFileSystemLayer(events);

    await Effect.runPromise(
      writeBaselineEffect(
        "counted-rule",
        [
          { key: "a::repeated", count: 2 },
          { key: "z::single", count: 1 },
        ],
        {
          git: makeTestHabitatServiceDeps().git,
          fileSystem: baselineFileSystemPort(),
          repoRoot: fixtureRepoRoot,
          baselinesDir,
          registry: [],
        }
      ).pipe(Effect.provide(layer))
    );

    expect(events).toEqual([
      `mkdir:${baselinesDir}`,
      `write:${baselinesDir}/counted-rule.json:${stringifyJsonDocument({
        schemaVersion: 1,
        occurrences: [
          { key: "a::repeated", count: 2 },
          { key: "z::single", count: 1 },
        ],
      })}\n`,
    ]);
  });

  test("staged file-layer checks render GitProvider failures as diagnostics", async () => {
    const fileLayerRule = makeTestHabitatServiceDeps().rules.selector.find(
      (rule) => rule.runner.name === "habitat" && rule.runner.mode === "file-layer"
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
          command: deps.commandRunner,
          git: deps.git,
          ruleDiagnostics: deps.ruleDiagnostics,
          nx: deps.nx,
          repoRoot: fixtureRepoRoot,
          rules: deps.rules,
          structureFileSystem: structureFileSystemPort(),
        }
      ).pipe(Effect.provide(makeFakePlatformFileSystemLayer([])))
    );
    const record = results.get(fileLayerRule!.id);

    expect(gitCalls).toEqual([["diff", "--cached", "--name-status", "-z"]]);
    expect(record?.result.exitCode).toBe(1);
    expect(record?.result.diagnostics[0]?.message).toContain("fake staged diff failure");
  });
});

function baselineGitCommandResult(argv: readonly string[], cwd: string) {
  return Match.value({ command: argv[0], argument: argv[1], scope: argv[4] }).pipe(
    Match.when({ command: "merge-base" }, () => commandResult(argv, cwd, "merge-base-sha\n")),
    Match.when({ command: "ls-tree", scope: ".habitat" }, () =>
      commandResult(
        argv,
        cwd,
        ".habitat/global/workspace/_blueprints/project-boundary-model/existing-rule/rule.json\n"
      )
    ),
    Match.when(
      {
        command: "show",
        argument:
          "merge-base-sha:.habitat/global/workspace/_blueprints/project-boundary-model/existing-rule/rule.json",
      },
      () => commandResult(argv, cwd, stringifyJsonDocument(existingRuleDocument()))
    ),
    Match.when(
      {
        command: "show",
        argument: "merge-base-sha:.habitat/baselines/existing-rule.json",
      },
      () => commandResult(argv, cwd, "[]\n")
    ),
    Match.orElse(() => commandResult(argv, cwd, "", 1, "not found\n"))
  );
}

function existingRuleDocument() {
  return {
    schemaVersion: 2,
    id: "existing-rule",
    title: "Existing Rule",
    placement: {
      niche: "global/workspace",
      blueprint: "project-boundary-model",
      category: "structure",
    },
    operation: { kind: "check" },
    ownerProject: "habitat",
    lane: "enforced",
    runner: {
      name: "grit",
      files: {
        pattern:
          ".habitat/global/workspace/_blueprints/project-boundary-model/existing-rule/pattern.md",
      },
    },
  };
}

function recordAndReturn<Event, Value>(events: Event[], event: Event, value: Value): Value {
  events.push(event);
  return value;
}

function baselineRule(id: string) {
  return {
    id,
    baselinePath: `.habitat/baselines/${id}.json`,
    ownerProject: "habitat",
    runner: "grit",
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

function structureFileSystemPort() {
  return {
    isDirectory,
    isFile,
    readDirectory,
    readPathKind,
    readText,
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

import path from "node:path";

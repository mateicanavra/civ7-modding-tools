import path from "node:path";
import { FileSystem } from "@effect/platform";
import { NodeContext } from "@effect/platform-node";
import { BiomeProvider, makeBiomeProviderLayer } from "@habitat/cli/providers/biome/index";
import {
  GitProvider,
  makeGitProviderLayer,
  makeGitStateProviderLayer,
} from "@habitat/cli/providers/git/index";
import { ruleRegistryRepoPath } from "@habitat/cli/resources/authority-paths";
import {
  CommandRunner,
  CommandRunnerLive,
  CommandUnavailable,
} from "@habitat/cli/resources/command/index";
import { makeHabitatConfig, makeHabitatConfigLayer } from "@habitat/cli/resources/config/index";
import { makeHabitatPlatformService } from "@habitat/cli/resources/platform/index";
import { RuleDiagnostics } from "@habitat/cli/resources/rule-diagnostics/index";
import { makeStandaloneRuleDiagnosticsLayer } from "@habitat/cli/runtime/standalone-layers";
import { type CheckOptions, type CheckReport } from "@habitat/cli/service/model/check/index";
import {
  createCheckReportEffect,
  rulesForExecution,
  type StructuralExecutionContext,
} from "@habitat/cli/service/model/check/policy/structural/index";
import {
  loadRuleRegistryDocumentEffect,
  ruleFactsCatalog,
} from "@habitat/cli/service/model/rules/index";
import { selectRules } from "@habitat/cli/service/model/rules/policy/selection.policy";
import { Context, Effect, Layer, Match } from "effect";
import { StandaloneCheckFailure, type StandaloneCheckRequest } from "./model.js";

export const runStandaloneCheck = Effect.fn("habitat.standalone.check.run")(function* (
  request: StandaloneCheckRequest
) {
  return yield* standaloneCheckProgram(request).pipe(
    Effect.provide(makeStandaloneCheckLayer(request.repoRoot)),
    Effect.scoped,
    Effect.mapError(runtimeFailure)
  );
});

const standaloneCheckProgram = Effect.fn("habitat.standalone.check.program")(function* (
  request: StandaloneCheckRequest
) {
  const fileSystem = yield* FileSystem.FileSystem;
  const command = yield* CommandRunner;
  const git = yield* GitProvider;
  const biome = yield* BiomeProvider;
  const platform = makeHabitatPlatformService({ repoRoot: request.repoRoot });
  const document = yield* loadRuleRegistryDocumentEffect(
    path.join(request.repoRoot, ruleRegistryRepoPath),
    {
      isDirectory: platform.isDirectory,
      readDirectory: platform.readDirectory,
      readText: platform.readText,
    }
  );
  const rules = ruleFactsCatalog(document);
  const options = checkOptions(request);
  yield* refuseUnsupportedSelection(options, rules.selector, request.staged);

  const diagnosticsContext = yield* Layer.build(
    makeStandaloneRuleDiagnosticsLayer(request.repoRoot, rules)
  );
  const ruleDiagnostics = Context.get(diagnosticsContext, RuleDiagnostics);
  const baselineFileSystem = {
    isDirectory: platform.isDirectory,
    isFile: platform.isFileEffect,
    makeDirectory: platform.makeDirectory,
    readDirectory: platform.readDirectory,
    readText: platform.readText,
    writeText: platform.writeText,
  };
  const context: StructuralExecutionContext = {
    baselineFileSystem,
    repoRoot: request.repoRoot,
    biome,
    command,
    git,
    ruleDiagnostics,
    nx: refusingNxPort(request.repoRoot),
    rules,
    structureFileSystem: {
      isDirectory: platform.isDirectory,
      isFile: platform.isFileEffect,
      readDirectory: platform.readDirectoryNoFollow,
      readPathKind: platform.readPathKind,
      readText: platform.readText,
    },
  };
  return yield* createCheckReportEffect(options, context);
});

function makeStandaloneCheckLayer(repoRoot: string) {
  const foundation = Layer.mergeAll(
    NodeContext.layer,
    makeHabitatConfigLayer(makeHabitatConfig({ repoRoot })),
    makeGitStateProviderLayer(repoRoot)
  );
  const command = CommandRunnerLive.pipe(Layer.provide(foundation));
  const git = makeGitProviderLayer(repoRoot).pipe(Layer.provide(command));
  const biome = makeBiomeProviderLayer(repoRoot).pipe(Layer.provide(command));
  return Layer.mergeAll(NodeContext.layer, command, git, biome);
}

function checkOptions(request: StandaloneCheckRequest): CheckOptions {
  const rule = Match.value(request.rules.length).pipe(
    Match.when(1, () => request.rules[0]),
    Match.orElse(() => undefined)
  );
  const rules = Match.value(request.rules.length > 1).pipe(
    Match.when(true, () => request.rules),
    Match.orElse(() => undefined)
  );
  return {
    owner: request.owner,
    rule,
    rules,
    runner: request.runner,
    staged: request.staged,
    baselineIntegrity: request.baselineIntegrity,
    base: request.base,
    command: {
      bin: "habitat",
      id: "check",
      argv: [...request.argv],
      serialized: ["habitat-sdk", ...request.argv].join(" "),
    },
  };
}

function refuseUnsupportedSelection(
  options: CheckOptions,
  registry: Parameters<typeof selectRules>[1],
  staged: boolean
) {
  const selection = selectRules(options, registry);
  if (!selection.ok) return Effect.void;
  const executable = rulesForExecution(selection.rules, { selection: options, staged });
  const unsupportedRules = executable.filter((rule) =>
    Match.value(rule.runner).pipe(
      Match.when({ name: "grit" }, () => false),
      Match.when({ name: "habitat", mode: "structure" }, () => false),
      Match.orElse(() => true)
    )
  );
  if (unsupportedRules.length === 0) return Effect.void;
  return Effect.fail(
    new StandaloneCheckFailure({
      kind: "unsupported-selection",
      message: `Only Grit and Habitat structure rules are available through the standalone edge; refused: ${unsupportedRules
        .map((rule) => rule.id)
        .sort()
        .join(", ")}.`,
    })
  );
}

function refusingNxPort(repoRoot: string): StructuralExecutionContext["nx"] {
  return {
    runMany: () => Effect.fail(nxUnavailable(repoRoot, "run-many")),
    runTarget: () => Effect.fail(nxUnavailable(repoRoot, "run-target")),
  };
}

function runtimeFailure(error: unknown): StandaloneCheckFailure {
  return Match.value(error).pipe(
    Match.when(
      (candidate: unknown): candidate is StandaloneCheckFailure =>
        candidate instanceof StandaloneCheckFailure,
      (failure) => failure
    ),
    Match.orElse(
      (cause) =>
        new StandaloneCheckFailure({
          kind: "runtime-unavailable",
          message: String(cause),
        })
    )
  );
}

function nxUnavailable(repoRoot: string, operation: string): CommandUnavailable {
  return new CommandUnavailable({
    commandId: `standalone-nx-${operation}`,
    executable: "nx",
    argv: [],
    cwd: repoRoot,
    cause: "Only Grit and Habitat structure rules are available through the standalone check edge.",
  });
}

export type StandaloneCheckResult = CheckReport;

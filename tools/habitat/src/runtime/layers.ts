import path from "node:path";
import { NodeContext } from "@effect/platform-node";
import { makeBiomeProviderLayer } from "@habitat/cli/providers/biome/index";
import { makeGitProviderLayer, makeGitStateProviderLayer } from "@habitat/cli/providers/git/index";
import { makeGraphiteProviderLayer } from "@habitat/cli/providers/graphite/index";
import { makeNxProviderLayer } from "@habitat/cli/providers/nx/index";
import { ruleRegistryRepoPath } from "@habitat/cli/resources/authority-paths";
import { CommandRunnerLive } from "@habitat/cli/resources/command/index";
import { HabitatConfig, HabitatConfigLive } from "@habitat/cli/resources/config/index";
import { HabitatPlatform, makeHabitatPlatformService } from "@habitat/cli/resources/platform/index";
import { HabitatReporterLive } from "@habitat/cli/resources/reporter/index";
import {
  makeGritRuleDiagnosticsLayer,
  makeGritRuleFixPreviewLayer,
} from "@habitat/cli/resources/rule-diagnostics/providers/grit/provider";
import {
  loadRuleRegistryDocumentEffect,
  RuleFacts,
  ruleFactsCatalog,
} from "@habitat/cli/service/model/rules/index";
import { Effect, Layer } from "effect";

const HabitatRuntimeBaseLive = Layer.mergeAll(
  NodeContext.layer,
  HabitatConfigLive,
  HabitatReporterLive
);

const HabitatRepoScopedLive = Layer.unwrapEffect(
  Effect.gen(function* () {
    const configResource = yield* HabitatConfig;
    const config = yield* configResource.get;
    const platformService = makeHabitatPlatformService({ repoRoot: config.repoRoot });
    const facts = yield* loadRuleRegistryDocumentEffect(
      path.join(platformService.repoRoot, ruleRegistryRepoPath),
      {
        isDirectory: platformService.isDirectory,
        readDirectory: platformService.readDirectory,
        readText: platformService.readText,
      }
    ).pipe(Effect.map(ruleFactsCatalog));
    const platform = Layer.succeed(HabitatPlatform, platformService);
    const gitState = makeGitStateProviderLayer(config.repoRoot);
    const commandRunner = CommandRunnerLive.pipe(Layer.provide(gitState));
    const vendorProviders = Layer.mergeAll(
      makeGitProviderLayer(config.repoRoot),
      makeGraphiteProviderLayer(config.repoRoot),
      makeBiomeProviderLayer(config.repoRoot),
      makeNxProviderLayer(config.repoRoot)
    ).pipe(Layer.provideMerge(commandRunner));
    const coreProviders = Layer.mergeAll(gitState, vendorProviders, platform);
    const catalog = Layer.succeed(RuleFacts, facts);
    const diagnostics = makeGritRuleDiagnosticsLayer(config.repoRoot).pipe(
      Layer.provide(Layer.merge(coreProviders, catalog))
    );
    const fixPreview = makeGritRuleFixPreviewLayer(config.repoRoot).pipe(
      Layer.provide(Layer.merge(coreProviders, catalog))
    );
    return Layer.mergeAll(coreProviders, catalog, diagnostics, fixPreview);
  })
);

export const HabitatRuntimeLive = Layer.provideMerge(HabitatRepoScopedLive, HabitatRuntimeBaseLive);

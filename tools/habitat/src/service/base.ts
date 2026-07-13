import type { BiomeProviderService } from "@habitat/cli/providers/biome/index";
import type { GitProviderService } from "@habitat/cli/providers/git/index";
import type { GraphiteProviderService } from "@habitat/cli/providers/graphite/index";
import type { NxProviderService } from "@habitat/cli/providers/nx/index";
import type { CommandRunnerService } from "@habitat/cli/resources/command/index";
import type { HabitatPlatformService } from "@habitat/cli/resources/platform/index";
import type { HabitatReporterService } from "@habitat/cli/resources/reporter/index";
import type { RuleDiagnosticsService } from "@habitat/cli/resources/rule-diagnostics/index";
import type { RuleFixPreviewService } from "@habitat/cli/resources/rule-fix-preview/index";
import type { HabitatRuntimeLive } from "@habitat/cli/runtime/layers";
import type { StructuralExecutionContext } from "@habitat/cli/service/model/check/policy/structural/index";
import type { RuleFactsCatalog } from "@habitat/cli/service/model/rules/policy/catalog.policy";
import type { AnyContractRouter } from "@orpc/contract";
import { Context, type Layer } from "effect";
import type { EffectImplementerInternal } from "effect-orpc";

export interface HabitatServiceContext {
  readonly deps: HabitatServiceDeps;
  readonly correlationId?: string;
}

export interface HabitatServiceSharedContext extends HabitatServiceContext {
  readonly structuralCheck: StructuralExecutionContext;
}

export interface HabitatServiceDeps {
  readonly biome: BiomeProviderService;
  readonly commandRunner: CommandRunnerService;
  readonly git: GitProviderService;
  readonly graphite: GraphiteProviderService;
  readonly nx: NxProviderService;
  readonly platform: HabitatPlatformService;
  readonly reporter: HabitatReporterService;
  readonly ruleDiagnostics: RuleDiagnosticsService;
  readonly ruleFixPreview: RuleFixPreviewService;
  readonly rules: RuleFactsCatalog;
}

export class HabitatServiceRuntime extends Context.Tag("@habitat/cli/HabitatServiceRuntime")<
  HabitatServiceRuntime,
  { readonly service: "habitat" }
>() {}

export type HabitatServiceRequirements =
  | HabitatServiceRuntime
  | Layer.Layer.Success<typeof HabitatRuntimeLive>;
export type HabitatServiceRuntimeError = Layer.Layer.Error<typeof HabitatRuntimeLive>;

export type HabitatModule<
  TContract extends AnyContractRouter,
  TContext extends object,
> = EffectImplementerInternal<
  TContract,
  HabitatServiceContext,
  HabitatServiceSharedContext & TContext,
  HabitatServiceRequirements,
  HabitatServiceRuntimeError
>;

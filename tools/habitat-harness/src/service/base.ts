import type { BiomeProviderService } from "@internal/habitat-harness/providers/biome/index";
import type { GitProviderService } from "@internal/habitat-harness/providers/git/index";
import type { GraphiteProviderService } from "@internal/habitat-harness/providers/graphite/index";
import type { GritProviderService } from "@internal/habitat-harness/providers/grit/index";
import type { NxProviderService } from "@internal/habitat-harness/providers/nx/index";
import type { CommandRunnerService } from "@internal/habitat-harness/resources/command/index";
import type { HabitatPlatformService } from "@internal/habitat-harness/resources/platform/index";
import type { HabitatReporterService } from "@internal/habitat-harness/resources/reporter/index";
import type { HabitatRuntimeLive } from "@internal/habitat-harness/runtime/layers";
import type { StructuralExecutionContext } from "@internal/habitat-harness/service/model/check/policy/structural/index";
import type { RuleFactsCatalog } from "@internal/habitat-harness/service/model/rules/policy/catalog.policy";
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
  readonly grit: GritProviderService;
  readonly nx: NxProviderService;
  readonly platform: HabitatPlatformService;
  readonly reporter: HabitatReporterService;
  readonly rules: RuleFactsCatalog;
}

export class HabitatServiceRuntime extends Context.Tag(
  "@internal/habitat-harness/HabitatServiceRuntime"
)<HabitatServiceRuntime, { readonly service: "habitat" }>() {}

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

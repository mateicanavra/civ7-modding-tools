import type { ClassifyOptions } from "@internal/habitat-harness/service/model/workspace/index";
import type { HookRuntime } from "@internal/habitat-harness/service/model/hook/policy/runtime.policy";
import type { BiomeProviderService } from "@internal/habitat-harness/providers/biome/index";
import type { GitProviderService } from "@internal/habitat-harness/providers/git/index";
import type { GraphiteProviderService } from "@internal/habitat-harness/providers/graphite/index";
import type { GritProviderService } from "@internal/habitat-harness/providers/grit/index";
import type { HabitatRuntimeLive } from "@internal/habitat-harness/runtime/layers";
import type { NxProviderService } from "@internal/habitat-harness/providers/nx/index";
import type {
  acquireTempDirectory,
  readText,
} from "@internal/habitat-harness/resources/platform/index";
import { Context, type Layer } from "effect";

export type CheckServiceModuleContext = Record<never, never>;

export interface ClassifyServiceModuleContext {
  readonly options?: ClassifyOptions;
}

export interface FixServiceModuleContext {
  readonly grit?: GritProviderService;
}

export interface GraphServiceModuleContext {
  readonly acquireTempDirectory?: typeof acquireTempDirectory;
  readonly nx?: NxProviderService;
  readonly readText?: typeof readText;
}

export interface HookServiceModuleContext {
  readonly biome?: BiomeProviderService;
  readonly git?: GitProviderService;
  readonly graphite?: GraphiteProviderService;
  readonly nx?: NxProviderService;
  readonly repoRoot?: string;
  readonly runtime?: HookRuntime;
  readonly workspaceGraphTargetNames?: typeof import("@internal/habitat-harness/providers/nx/targets").workspaceGraphTargetNames;
}

export interface VerifyServiceModuleContext {
  readonly epochMillisToIsoString?: typeof import("@internal/habitat-harness/resources/platform/index").epochMillisToIsoString;
  readonly git?: GitProviderService;
  readonly graphite?: GraphiteProviderService;
  readonly nx?: NxProviderService;
  readonly repoRoot?: string;
}

export interface HabitatServiceContext {
  readonly check?: CheckServiceModuleContext;
  readonly classify?: ClassifyServiceModuleContext;
  readonly fix?: FixServiceModuleContext;
  readonly graph?: GraphServiceModuleContext;
  readonly hook?: HookServiceModuleContext;
  readonly verify?: VerifyServiceModuleContext;
  readonly correlationId?: string;
}

export class HabitatServiceRuntime extends Context.Tag(
  "@internal/habitat-harness/HabitatServiceRuntime"
)<HabitatServiceRuntime, { readonly service: "habitat" }>() {}

export type HabitatServiceRequirements =
  | HabitatServiceRuntime
  | Layer.Layer.Success<typeof HabitatRuntimeLive>;
export type HabitatServiceRuntimeError = Layer.Layer.Error<typeof HabitatRuntimeLive>;

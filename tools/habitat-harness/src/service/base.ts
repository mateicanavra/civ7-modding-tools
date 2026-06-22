import type { BiomeProviderService } from "@internal/habitat-harness/providers/biome/index";
import type { GitProviderService } from "@internal/habitat-harness/providers/git/index";
import type { GraphiteProviderService } from "@internal/habitat-harness/providers/graphite/index";
import type { GritProviderService } from "@internal/habitat-harness/providers/grit/index";
import type { NxProviderService } from "@internal/habitat-harness/providers/nx/index";
import type {
  acquireTempDirectory,
  hashFileSync,
  pathExistsSync,
  readText,
} from "@internal/habitat-harness/resources/platform/index";
import type { HabitatReporterService } from "@internal/habitat-harness/resources/reporter/index";
import type { HabitatRuntimeLive } from "@internal/habitat-harness/runtime/layers";
import type { StructuralCheckService } from "@internal/habitat-harness/service/model/check/policy/structural/index";
import { Context, type Layer } from "effect";

export interface HabitatServiceContext {
  readonly deps: HabitatServiceDeps;
  readonly correlationId?: string;
}

export interface HabitatServiceDeps {
  readonly acquireTempDirectory: typeof acquireTempDirectory;
  readonly biome: BiomeProviderService;
  readonly git: GitProviderService;
  readonly graphite: GraphiteProviderService;
  readonly grit: GritProviderService;
  readonly hashFile: typeof hashFileSync;
  readonly nx: NxProviderService;
  readonly pathExists: typeof pathExistsSync;
  readonly readText: typeof readText;
  readonly reporter: HabitatReporterService;
  readonly repoRoot: string;
  readonly structuralCheck: StructuralCheckService;
}

export class HabitatServiceRuntime extends Context.Tag(
  "@internal/habitat-harness/HabitatServiceRuntime"
)<HabitatServiceRuntime, { readonly service: "habitat" }>() {}

export type HabitatServiceRequirements =
  | HabitatServiceRuntime
  | Layer.Layer.Success<typeof HabitatRuntimeLive>;
export type HabitatServiceRuntimeError = Layer.Layer.Error<typeof HabitatRuntimeLive>;

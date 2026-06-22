import type { ClassifyOptions } from "@internal/habitat-harness/service/model/workspace/index";
import type {
  ApplyAdmission,
  ApplyTransactionInput,
} from "@internal/habitat-harness/service/modules/fix/model/policy/patterns/index";
import type { WorktreeObservation } from "@internal/habitat-harness/service/modules/fix/model/policy/transactions/index";
import type { HookRuntime } from "@internal/habitat-harness/service/modules/hook/model/policy/runtime/runtime";
import { HabitatRuntimeLive } from "@internal/habitat-harness/service/runtime/layers";
import { Context, Layer } from "effect";

export type CheckServiceModuleContext = Record<never, never>;

export interface ClassifyServiceModuleContext {
  readonly options?: ClassifyOptions;
}

export interface FixServiceModuleContext {
  readonly admissions?: readonly ApplyAdmission[];
  readonly transactionInputs?: readonly ApplyTransactionInput[];
  readonly worktree?: WorktreeObservation;
}

export type GraphServiceModuleContext = Record<never, never>;

export interface HookServiceModuleContext {
  readonly runtime?: HookRuntime;
}

export type VerifyServiceModuleContext = Record<never, never>;

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

export const habitatServiceLayer = Layer.mergeAll(
  HabitatRuntimeLive,
  Layer.succeed(HabitatServiceRuntime, { service: "habitat" })
);

export type HabitatServiceRequirements = Layer.Layer.Success<typeof habitatServiceLayer>;
export type HabitatServiceRuntimeError = Layer.Layer.Error<typeof habitatServiceLayer>;

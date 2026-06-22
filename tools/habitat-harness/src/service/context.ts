import { HabitatRuntimeLive } from "@internal/habitat-harness/service/runtime/layers";
import { Context, Layer } from "effect";
import type { ApplyAdmission, ApplyTransactionInput } from "./modules/fix/patterns/index.js";
import type { WorktreeObservation } from "./modules/fix/transactions/index.js";
import type { ClassifyOptions } from "./modules/graph/workspace/index.js";
import type { HookRuntime } from "./modules/hook/runtime/runtime.js";

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

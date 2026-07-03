import { Context } from "effect";
import type { ClassifyServiceContext } from "./modules/classify/context.js";
import type { FixServiceContext } from "./modules/fix/context.js";
import type { HookServiceContext } from "./modules/hook/context.js";
import type { TransactionsServiceContext } from "./modules/transactions/context.js";

export interface HabitatServiceContext
  extends ClassifyServiceContext,
    FixServiceContext,
    HookServiceContext,
    TransactionsServiceContext {
  readonly correlationId?: string;
}

export class HabitatServiceRuntime extends Context.Tag(
  "@internal/habitat-harness/HabitatServiceRuntime"
)<HabitatServiceRuntime, { readonly service: "habitat" }>() {}

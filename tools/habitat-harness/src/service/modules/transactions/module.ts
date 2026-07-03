import type { EffectImplementerInternal } from "effect-orpc";
import type { HabitatServiceContext } from "../../base.js";
import {
  type HabitatServiceRequirements,
  type HabitatServiceRuntimeError,
  habitatServiceImplementer as impl,
} from "../../impl.js";
import type { TransactionsServiceContract } from "./contract.js";

export type TransactionsServiceModule = EffectImplementerInternal<
  TransactionsServiceContract,
  HabitatServiceContext & Record<never, never>,
  HabitatServiceContext,
  HabitatServiceRequirements,
  HabitatServiceRuntimeError
>;

export const module: TransactionsServiceModule = impl.transactions;

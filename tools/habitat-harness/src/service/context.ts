import type { CheckServiceModuleContext } from "./modules/check/context.js";
import type { ClassifyServiceModuleContext } from "./modules/classify/context.js";
import type { FixServiceModuleContext } from "./modules/fix/context.js";
import type { GraphServiceModuleContext } from "./modules/graph/context.js";
import type { HookServiceModuleContext } from "./modules/hook/context.js";
import type { TransactionsServiceModuleContext } from "./modules/transactions/context.js";
import type { VerifyServiceModuleContext } from "./modules/verify/context.js";

export interface HabitatServiceContext {
  readonly check?: CheckServiceModuleContext;
  readonly classify?: ClassifyServiceModuleContext;
  readonly fix?: FixServiceModuleContext;
  readonly graph?: GraphServiceModuleContext;
  readonly hook?: HookServiceModuleContext;
  readonly transactions?: TransactionsServiceModuleContext;
  readonly verify?: VerifyServiceModuleContext;
  readonly correlationId?: string;
}

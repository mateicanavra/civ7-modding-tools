import type { Router } from "@orpc/server";
import type { HabitatServiceContext } from "./context.js";
import { habitatServiceContract } from "./contract.js";
import { habitatServiceImplementer } from "./impl.js";
import { checkRouter } from "./modules/check/router.js";
import { classifyRouter } from "./modules/classify/router.js";
import { fixRouter } from "./modules/fix/router.js";
import { graphRouter } from "./modules/graph/router.js";
import { hookRouter } from "./modules/hook/router.js";
import { transactionsRouter } from "./modules/transactions/router.js";
import { verifyRouter } from "./modules/verify/router.js";

const habitatServiceRouterDefinition = {
  check: checkRouter,
  classify: classifyRouter,
  fix: fixRouter,
  graph: graphRouter,
  hook: hookRouter,
  transactions: transactionsRouter,
  verify: verifyRouter,
};

export const habitatServiceRouter: Router<typeof habitatServiceContract, HabitatServiceContext> =
  habitatServiceImplementer.router(habitatServiceRouterDefinition);

export type HabitatServiceRouter = typeof habitatServiceRouter;

import type { Router } from "@orpc/server";
import type { HabitatServiceContext } from "./base.js";
import { habitatServiceContract } from "./contract.js";
import { habitatServiceImplementer } from "./impl.js";
import { checkRouter } from "./modules/check/router.js";
import { fixRouter } from "./modules/fix/router.js";
import { graphRouter } from "./modules/graph/router.js";
import { hookRouter } from "./modules/hook/router.js";
import { verifyRouter } from "./modules/verify/router.js";

export const habitatServiceRouter: Router<typeof habitatServiceContract, HabitatServiceContext> =
  habitatServiceImplementer.router({
    check: checkRouter,
    fix: fixRouter,
    graph: graphRouter,
    hook: hookRouter,
    verify: verifyRouter,
  });

export type HabitatServiceRouter = typeof habitatServiceRouter;

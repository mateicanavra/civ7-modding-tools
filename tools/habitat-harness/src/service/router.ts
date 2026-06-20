import type { Router } from "@orpc/server";
import type { HabitatServiceContext } from "./base.js";
import { habitatServiceContract } from "./contract.js";
import { habitatServiceImplementer } from "./impl.js";
import { verifyRouter } from "./modules/verify/router.js";

export const habitatServiceRouter: Router<typeof habitatServiceContract, HabitatServiceContext> =
  habitatServiceImplementer.router({
    verify: verifyRouter,
  });

export type HabitatServiceRouter = typeof habitatServiceRouter;

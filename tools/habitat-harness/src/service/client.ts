import { createRouterClient } from "@orpc/server";
import type { HabitatServiceContext } from "./context.js";
import { habitatServiceContract } from "./contract.js";
import { type HabitatServiceRouter, habitatServiceRouter } from "./router.js";

export { habitatServiceContract };

export function createHabitatServiceClient(
  context: HabitatServiceContext = {},
  router: HabitatServiceRouter = habitatServiceRouter
) {
  return createRouterClient(router, { context });
}

export type HabitatServiceClient = ReturnType<typeof createHabitatServiceClient>;

import { createRouterClient } from "@orpc/server";
import type { HabitatServiceContext } from "./base.js";
import { habitatServiceContract } from "./contract.js";
import { habitatServiceRouter } from "./router.js";

export { habitatServiceContract };

export function createHabitatServiceClient(context: HabitatServiceContext = {}) {
  return createRouterClient(habitatServiceRouter, { context });
}

export type HabitatServiceClient = ReturnType<typeof createHabitatServiceClient>;

import type { HabitatServiceContext } from "@internal/habitat-harness/service/base";
import { habitatServiceContract } from "@internal/habitat-harness/service/contract";
import {
  type HabitatServiceRouter,
  habitatServiceRouter,
} from "@internal/habitat-harness/service/router";
import { createRouterClient } from "@orpc/server";

export { habitatServiceContract };

export function createHabitatServiceClient(
  context: HabitatServiceContext = {},
  router: HabitatServiceRouter = habitatServiceRouter
) {
  return createRouterClient(router, { context });
}

export type HabitatServiceClient = ReturnType<typeof createHabitatServiceClient>;

import { service } from "@internal/habitat-harness/service/impl";
import type { HabitatServiceContext } from "@internal/habitat-harness/service/base";
import { checkRouter } from "@internal/habitat-harness/service/modules/check/router";
import { classifyRouter } from "@internal/habitat-harness/service/modules/classify/router";
import { fixRouter } from "@internal/habitat-harness/service/modules/fix/router";
import { graphRouter } from "@internal/habitat-harness/service/modules/graph/router";
import { hookRouter } from "@internal/habitat-harness/service/modules/hook/router";
import { verifyRouter } from "@internal/habitat-harness/service/modules/verify/router";
import { createRouterClient } from "@orpc/server";

export const habitatServiceRouter = service.router({
  check: checkRouter,
  classify: classifyRouter,
  fix: fixRouter,
  graph: graphRouter,
  hook: hookRouter,
  verify: verifyRouter,
});

export type HabitatServiceRouter = typeof habitatServiceRouter;

export function createHabitatServiceClient(
  context: HabitatServiceContext = {},
  router: HabitatServiceRouter = habitatServiceRouter
) {
  return createRouterClient(router, { context });
}

export type HabitatServiceClient = ReturnType<typeof createHabitatServiceClient>;

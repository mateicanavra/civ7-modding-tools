import { service } from "@habitat/cli/service/impl";
import { router as checkRouter } from "@habitat/cli/service/modules/check/router";
import { router as classifyRouter } from "@habitat/cli/service/modules/classify/router";
import { router as fixRouter } from "@habitat/cli/service/modules/fix/router";
import { router as graphRouter } from "@habitat/cli/service/modules/graph/router";
import { router as hookRouter } from "@habitat/cli/service/modules/hook/router/index";
import { router as verifyRouter } from "@habitat/cli/service/modules/verify/router";

export const habitatServiceRouter = service.router({
  check: checkRouter,
  classify: classifyRouter,
  fix: fixRouter,
  graph: graphRouter,
  hook: hookRouter,
  verify: verifyRouter,
});

export type HabitatServiceRouter = typeof habitatServiceRouter;

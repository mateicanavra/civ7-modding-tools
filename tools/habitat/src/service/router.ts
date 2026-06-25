import { service } from "@habitat/cli/service/impl";
import { checkRouter } from "@habitat/cli/service/modules/check/router";
import { classifyRouter } from "@habitat/cli/service/modules/classify/router";
import { fixRouter } from "@habitat/cli/service/modules/fix/router";
import { graphRouter } from "@habitat/cli/service/modules/graph/router";
import { hookRouter } from "@habitat/cli/service/modules/hook/router/index";
import { verifyRouter } from "@habitat/cli/service/modules/verify/router";

export const habitatServiceRouter = service.router({
  check: checkRouter,
  classify: classifyRouter,
  fix: fixRouter,
  graph: graphRouter,
  hook: hookRouter,
  verify: verifyRouter,
});

export type HabitatServiceRouter = typeof habitatServiceRouter;

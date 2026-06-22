import { habitatServiceImplementer } from "./impl.js";
import { checkRouter } from "./modules/check/router.js";
import { classifyRouter } from "./modules/classify/router.js";
import { fixRouter } from "./modules/fix/router.js";
import { graphRouter } from "./modules/graph/router.js";
import { hookRouter } from "./modules/hook/router.js";
import { verifyRouter } from "./modules/verify/router.js";

const habitatServiceRouterDefinition = {
  check: checkRouter,
  classify: classifyRouter,
  fix: fixRouter,
  graph: graphRouter,
  hook: hookRouter,
  verify: verifyRouter,
};

export const habitatServiceRouter = habitatServiceImplementer.router(
  habitatServiceRouterDefinition
);

export type HabitatServiceRouter = typeof habitatServiceRouter;

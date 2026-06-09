import type { Router } from "@orpc/server";

import { Civ7ControlOrpcContract } from "./contract";
import type { Civ7ControlOrpcContext } from "./context";
import { civ7ControlOrpcImplementer } from "./procedure";
import { attentionRouter } from "./modules/attention/router";
import { cityRouter } from "./modules/city/router";
import { decisionsRouter } from "./modules/decisions/router";
import { notificationsRouter } from "./modules/notifications/router";
import { readinessRouter } from "./modules/readiness/router";
import { strategyRouter } from "./modules/strategy/router";
import { unitRouter } from "./modules/unit/router";

export const Civ7ControlOrpcRouter: Router<
  typeof Civ7ControlOrpcContract,
  Civ7ControlOrpcContext
> = civ7ControlOrpcImplementer.router({
  attention: attentionRouter,
  city: cityRouter,
  decisions: decisionsRouter,
  notifications: notificationsRouter,
  readiness: readinessRouter,
  strategy: strategyRouter,
  unit: unitRouter,
});

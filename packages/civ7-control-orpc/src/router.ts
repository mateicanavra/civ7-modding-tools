import type { Router } from "@orpc/server";

import { Civ7ControlOrpcContract } from "./contract";
import type { Civ7ControlOrpcContext } from "./context";
import { civ7ControlOrpcImplementer } from "./procedure";
import { attentionRouter } from "./modules/attention/router";
import { cityRouter } from "./modules/city/router";
import { diplomacyRouter } from "./modules/diplomacy/router";
import { governmentRouter } from "./modules/government/router";
import { narrativeRouter } from "./modules/narrative/router";
import { notificationsRouter } from "./modules/notifications/router";
import { progressionRouter } from "./modules/progression/router";
import { readinessRouter } from "./modules/readiness/router";
import { strategyRouter } from "./modules/strategy/router";
import { turnRouter } from "./modules/turn/router";
import { unitRouter } from "./modules/unit/router";

export const Civ7ControlOrpcRouter: Router<
  typeof Civ7ControlOrpcContract,
  Civ7ControlOrpcContext
> = civ7ControlOrpcImplementer.router({
  attention: attentionRouter,
  city: cityRouter,
  diplomacy: diplomacyRouter,
  government: governmentRouter,
  narrative: narrativeRouter,
  notifications: notificationsRouter,
  progression: progressionRouter,
  readiness: readinessRouter,
  strategy: strategyRouter,
  turn: turnRouter,
  unit: unitRouter,
});

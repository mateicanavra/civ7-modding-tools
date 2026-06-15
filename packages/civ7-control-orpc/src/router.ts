import type { Router } from "@orpc/server";
import type { Civ7ControlOrpcContext } from "./context";
import { Civ7ControlOrpcContract } from "./contract";
import { attentionRouter } from "./modules/attention/router";
import { cityRouter } from "./modules/city/router";
import { diplomacyRouter } from "./modules/diplomacy/router";
import { displayRouter } from "./modules/display/router";
import { governmentRouter } from "./modules/government/router";
import { narrativeRouter } from "./modules/narrative/router";
import { notificationsRouter } from "./modules/notifications/router";
import { progressionRouter } from "./modules/progression/router";
import { readinessRouter } from "./modules/readiness/router";
import { strategyRouter } from "./modules/strategy/router";
import { turnRouter } from "./modules/turn/router";
import { unitRouter } from "./modules/unit/router";
import { viewRouter } from "./modules/view/router";
import { worldRouter } from "./modules/world/router";
import { civ7ControlOrpcImplementer } from "./procedure";

export const Civ7ControlOrpcRouter: Router<typeof Civ7ControlOrpcContract, Civ7ControlOrpcContext> =
  civ7ControlOrpcImplementer.router({
    attention: attentionRouter,
    city: cityRouter,
    diplomacy: diplomacyRouter,
    display: displayRouter,
    government: governmentRouter,
    narrative: narrativeRouter,
    notifications: notificationsRouter,
    progression: progressionRouter,
    readiness: readinessRouter,
    strategy: strategyRouter,
    turn: turnRouter,
    unit: unitRouter,
    view: viewRouter,
    world: worldRouter,
  });

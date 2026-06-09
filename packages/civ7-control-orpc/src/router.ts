import type { Router } from "@orpc/server";

import { Civ7ControlOrpcContract } from "./contract";
import type { Civ7ControlOrpcContext } from "./context";
import { civ7ControlOrpcImplementer } from "./procedure";
import { cityRouter } from "./modules/city/router";
import { mapRouter } from "./modules/map/router";
import { notificationsRouter } from "./modules/notifications/router";
import { playerRouter } from "./modules/player/router";
import { runtimeRouter } from "./modules/runtime/router";
import { unitRouter } from "./modules/unit/router";

export const Civ7ControlOrpcRouter: Router<
  typeof Civ7ControlOrpcContract,
  Civ7ControlOrpcContext
> = civ7ControlOrpcImplementer.router({
  city: cityRouter,
  map: mapRouter,
  notifications: notificationsRouter,
  player: playerRouter,
  runtime: runtimeRouter,
  unit: unitRouter,
});

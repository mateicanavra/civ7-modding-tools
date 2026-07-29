import type { EnhancedEffectRouter } from "effect-orpc";

import type { Context } from "./context";
import { service } from "./impl";
import { router as attention } from "./modules/attention/router";
import { router as city } from "./modules/city/router";
import { router as diplomacy } from "./modules/diplomacy/router";
import { router as display } from "./modules/display/router";
import { router as government } from "./modules/government/router";
import { router as lifecycle } from "./modules/lifecycle/router";
import { router as narrative } from "./modules/narrative/router";
import { router as notifications } from "./modules/notifications/router";
import { router as progression } from "./modules/progression/router";
import { router as readiness } from "./modules/readiness/router";
import { router as strategy } from "./modules/strategy/router";
import { router as turn } from "./modules/turn/router";
import { router as unit } from "./modules/unit/router";
import { router as view } from "./modules/view/router";
import { router as world } from "./modules/world/router";

type Modules = {
  attention: typeof attention;
  city: typeof city;
  diplomacy: typeof diplomacy;
  display: typeof display;
  government: typeof government;
  lifecycle: typeof lifecycle;
  narrative: typeof narrative;
  notifications: typeof notifications;
  progression: typeof progression;
  readiness: typeof readiness;
  strategy: typeof strategy;
  turn: typeof turn;
  unit: typeof unit;
  view: typeof view;
  world: typeof world;
};

const modules: Modules = {
  attention,
  city,
  diplomacy,
  display,
  government,
  lifecycle,
  narrative,
  notifications,
  progression,
  readiness,
  strategy,
  turn,
  unit,
  view,
  world,
};

export const router: EnhancedEffectRouter<
  Modules,
  Context,
  Context,
  Record<never, never>
> = service.router(modules);

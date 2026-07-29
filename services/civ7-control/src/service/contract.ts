import { base } from "./base";
import { contract as attention } from "./modules/attention/contract";
import { contract as city } from "./modules/city/contract";
import { contract as diplomacy } from "./modules/diplomacy/contract";
import { contract as display } from "./modules/display/contract";
import { contract as government } from "./modules/government/contract";
import { contract as lifecycle } from "./modules/lifecycle/contract";
import { contract as narrative } from "./modules/narrative/contract";
import { contract as notifications } from "./modules/notifications/contract";
import { contract as progression } from "./modules/progression/contract";
import { contract as readiness } from "./modules/readiness/contract";
import { contract as strategy } from "./modules/strategy/contract";
import { contract as turn } from "./modules/turn/contract";
import { contract as unit } from "./modules/unit/contract";
import { contract as view } from "./modules/view/contract";
import { contract as world } from "./modules/world/contract";

export const contract = base.router({
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
});

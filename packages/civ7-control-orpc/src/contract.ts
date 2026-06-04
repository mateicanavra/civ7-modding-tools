import { civ7ControlOrpcContractBase } from "./contract-base";
import {
  Civ7RuntimeContract,
  type Civ7RuntimeContract as Civ7RuntimeContractType,
} from "./modules/runtime/contract";
import {
  Civ7NotificationsContract,
  type Civ7NotificationsContract as Civ7NotificationsContractType,
} from "./modules/notifications/contract";
import {
  Civ7UnitContract,
  type Civ7UnitContract as Civ7UnitContractType,
} from "./modules/unit/contract";

export type Civ7ControlOrpcContract = Readonly<{
  notifications: Civ7NotificationsContractType;
  runtime: Civ7RuntimeContractType;
  unit: Civ7UnitContractType;
}>;

export const Civ7ControlOrpcContract: Civ7ControlOrpcContract =
  civ7ControlOrpcContractBase.router({
    notifications: Civ7NotificationsContract,
    runtime: Civ7RuntimeContract,
    unit: Civ7UnitContract,
  });

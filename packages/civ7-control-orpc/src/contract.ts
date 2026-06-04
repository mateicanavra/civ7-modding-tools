import { civ7ControlOrpcContractBase } from "./contract-base";
import {
  Civ7RuntimeContract,
  type Civ7RuntimeContract as Civ7RuntimeContractType,
} from "./modules/runtime/contract";
import {
  Civ7NotificationsContract,
  type Civ7NotificationsContract as Civ7NotificationsContractType,
} from "./modules/notifications/contract";

export type Civ7ControlOrpcContract = Readonly<{
  notifications: Civ7NotificationsContractType;
  runtime: Civ7RuntimeContractType;
}>;

export const Civ7ControlOrpcContract: Civ7ControlOrpcContract =
  civ7ControlOrpcContractBase.router({
    notifications: Civ7NotificationsContract,
    runtime: Civ7RuntimeContract,
  });

import { civ7ControlOrpcContractBase } from "./contract-base";
import {
  Civ7AttentionContract,
  type Civ7AttentionContract as Civ7AttentionContractType,
} from "./modules/attention/contract";
import {
  Civ7CityContract,
  type Civ7CityContract as Civ7CityContractType,
} from "./modules/city/contract";
import {
  Civ7ReadinessContract,
  type Civ7ReadinessContract as Civ7ReadinessContractType,
} from "./modules/readiness/contract";
import {
  Civ7NotificationsContract,
  type Civ7NotificationsContract as Civ7NotificationsContractType,
} from "./modules/notifications/contract";
import {
  Civ7StrategyContract,
  type Civ7StrategyContract as Civ7StrategyContractType,
} from "./modules/strategy/contract";
import {
  Civ7UnitContract,
  type Civ7UnitContract as Civ7UnitContractType,
} from "./modules/unit/contract";

export type Civ7ControlOrpcContract = Readonly<{
  attention: Civ7AttentionContractType;
  city: Civ7CityContractType;
  notifications: Civ7NotificationsContractType;
  readiness: Civ7ReadinessContractType;
  strategy: Civ7StrategyContractType;
  unit: Civ7UnitContractType;
}>;

export const Civ7ControlOrpcContract: Civ7ControlOrpcContract =
  civ7ControlOrpcContractBase.router({
    attention: Civ7AttentionContract,
    city: Civ7CityContract,
    notifications: Civ7NotificationsContract,
    readiness: Civ7ReadinessContract,
    strategy: Civ7StrategyContract,
    unit: Civ7UnitContract,
  });
